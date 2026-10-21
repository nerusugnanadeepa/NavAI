import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DESTINATIONS, simulationController } from './simulationController';

/**
 * NaviAI 3D Three.js Simulation Engine (Agent 2)
 * Renders interactive 3D campus, procedural buildings, animated AMR robot,
 * hazard pylons, dynamic A* path ribbons, holographic beacons, and raycasting.
 */
export class ThreeEngine {
  constructor(container, callbacks = {}) {
    this.container = container;
    this.callbacks = callbacks; // { onAddObstacleAtClick, onRemoveObstacle }

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.clock = new THREE.Clock();
    this.animationFrameId = null;

    // Camera modes: 'perspective' | 'grid' | 'follow'
    this.cameraMode = 'perspective';
    this.showGrid = true;

    // 3D Scene Objects
    this.gridHelper = null;
    this.groundMesh = null;
    this.buildingMeshes = new Map();
    this.beaconMeshes = new Map();
    this.obstacleMeshes = new Map();
    this.pathLineMesh = null;
    this.pathPointsGroup = new THREE.Group();
    this.robotGroup = null;
    this.lidarPuck = null;
    this.robotWheels = [];
    this.hoverPreviewMesh = null;

    // Animation / State Interpolation
    this.robotTargetPos = new THREE.Vector3(0, 0, 0);
    this.robotTargetHeading = 0; // in radians
    this.activeRoute = [];
    this.currentDestination = null;
    this.status = 'idle';

    // Raycasting
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-999, -999);
    this.isHoveringGround = false;
    this.hoveredGrid = { x: 10, y: 10 };

    this.init();
  }

  init() {
    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 500;

    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#070D18');
    this.scene.fog = new THREE.FogExp2('#070D18', 0.022);

    // 2. Camera setup
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(16, 20, 20);

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.container.appendChild(this.renderer.domElement);

    // 4. Orbit Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't clip below ground
    this.controls.minDistance = 6;
    this.controls.maxDistance = 65;
    this.controls.target.set(0, 0, 0);

    // 5. Lighting
    this.setupLighting();

    // 6. Ground & Pathways
    this.setupEnvironment();

    // 7. Campus Buildings
    this.setupBuildings();

    // 8. Robot Model
    this.setupRobot();

    // 9. Hover Preview Indicator
    this.setupHoverPreview();

    // 10. Event Listeners
    this.boundOnResize = this.onResize.bind(this);
    this.boundOnPointerMove = this.onPointerMove.bind(this);
    this.boundOnPointerDown = this.onPointerDown.bind(this);
    this.boundOnPointerLeave = this.onPointerLeave.bind(this);

    window.addEventListener('resize', this.boundOnResize);
    this.renderer.domElement.addEventListener('pointermove', this.boundOnPointerMove);
    this.renderer.domElement.addEventListener('pointerdown', this.boundOnPointerDown);
    this.renderer.domElement.addEventListener('pointerleave', this.boundOnPointerLeave);

    // 11. Attach to simulationController as Agent 2 Engine Delegate
    this.attachDelegate();

    // 12. Start Render Loop
    this.animate = this.animate.bind(this);
    this.animate();
  }

  setupLighting() {
    // Ambient fill
    const ambientLight = new THREE.AmbientLight(0x0f172a, 2.0);
    this.scene.add(ambientLight);

    // Hemisphere sky/ground light
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x020617, 1.2);
    hemiLight.position.set(0, 30, 0);
    this.scene.add(hemiLight);

    // Main directional sunlight with soft shadows
    const dirLight = new THREE.DirectionalLight(0xffffff, 2.2);
    dirLight.position.set(18, 30, 18);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 80;
    const shadowDist = 20;
    dirLight.shadow.camera.left = -shadowDist;
    dirLight.shadow.camera.right = shadowDist;
    dirLight.shadow.camera.top = shadowDist;
    dirLight.shadow.camera.bottom = -shadowDist;
    dirLight.shadow.bias = -0.0005;
    this.scene.add(dirLight);

    // Central dock soft cyan glow
    const dockLight = new THREE.PointLight(0x06b6d4, 2.5, 12, 1.5);
    dockLight.position.set(0, 1.5, 0);
    this.scene.add(dockLight);
  }

  setupEnvironment() {
    // Ground plane
    const groundGeo = new THREE.PlaneGeometry(60, 60);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0b1329,
      roughness: 0.85,
      metalness: 0.2
    });
    this.groundMesh = new THREE.Mesh(groundGeo, groundMat);
    this.groundMesh.rotation.x = -Math.PI / 2;
    this.groundMesh.receiveShadow = true;
    this.groundMesh.name = 'campus_ground';
    this.scene.add(this.groundMesh);

    // Tactical Campus Grid
    this.gridHelper = new THREE.GridHelper(20, 20, 0x06b6d4, 0x1e293b);
    this.gridHelper.position.y = 0.02;
    this.scene.add(this.gridHelper);

    // Glowing walkways connecting central dock to buildings
    const pathwayMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.25,
      depthWrite: false
    });

    const walkwayCoords = [
      [{ x: 0, z: 0 }, { x: 6, z: -6 }],   // Dock to Library
      [{ x: 0, z: 0 }, { x: -6, z: 6 }],  // Dock to Classroom
      [{ x: 0, z: 0 }, { x: 6, z: 6 }],   // Dock to Cafeteria
      [{ x: 0, z: 0 }, { x: 0, z: -8 }],  // Dock to Main Gate
      [{ x: 6, z: -6 }, { x: 6, z: 6 }],  // Library to Cafeteria
      [{ x: -6, z: 6 }, { x: 6, z: 6 }],  // Classroom to Cafeteria
      [{ x: 0, z: -8 }, { x: 6, z: -6 }]   // Main Gate to Library
    ];

    walkwayCoords.forEach(([start, end]) => {
      const dx = end.x - start.x;
      const dz = end.z - start.z;
      const length = Math.hypot(dx, dz);
      const angle = Math.atan2(dz, dx);

      const pathGeo = new THREE.PlaneGeometry(length, 0.5);
      const mesh = new THREE.Mesh(pathGeo, pathwayMat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.rotation.z = -angle;
      mesh.position.set((start.x + end.x) / 2, 0.03, (start.z + end.z) / 2);
      this.scene.add(mesh);
    });

    // Central Robot Dock Pad
    const dockGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.1, 32);
    const dockMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.5,
      metalness: 0.8
    });
    const dockMesh = new THREE.Mesh(dockGeo, dockMat);
    dockMesh.position.set(0, 0.05, 0);
    dockMesh.receiveShadow = true;
    this.scene.add(dockMesh);

    // Dock neon outer ring
    const ringGeo = new THREE.RingGeometry(1.7, 1.85, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, side: THREE.DoubleSide });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.set(0, 0.11, 0);
    this.scene.add(ringMesh);

    // Add path points group
    this.scene.add(this.pathPointsGroup);
  }

  setupBuildings() {
    DESTINATIONS.forEach((dest) => {
      const group = new THREE.Group();
      group.position.set(dest.worldPos.x, 0, dest.worldPos.z);

      const colorHex = new THREE.Color(dest.color);

      // Procedural Building Architecture
      // Base platform
      const baseGeo = new THREE.BoxGeometry(2.6, 0.3, 2.6);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.6 });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = 0.15;
      base.castShadow = true;
      base.receiveShadow = true;
      group.add(base);

      // Main tower structure
      const towerHeight = dest.id === 'library' ? 3.8 : dest.id === 'classroom' ? 3.2 : dest.id === 'cafeteria' ? 2.4 : 3.0;
      const towerGeo = new THREE.BoxGeometry(2.0, towerHeight, 2.0);
      const towerMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.3,
        metalness: 0.7
      });
      const tower = new THREE.Mesh(towerGeo, towerMat);
      tower.position.y = 0.3 + towerHeight / 2;
      tower.castShadow = true;
      tower.receiveShadow = true;
      group.add(tower);

      // Glowing architectural accents in building color
      const accentGeo = new THREE.BoxGeometry(2.04, 0.12, 2.04);
      const accentMat = new THREE.MeshBasicMaterial({ color: colorHex });
      for (let y = 1.0; y < towerHeight; y += 0.9) {
        const band = new THREE.Mesh(accentGeo, accentMat);
        band.position.y = 0.3 + y;
        group.add(band);
      }

      // Glass crown / roof beacon
      const crownGeo = new THREE.BoxGeometry(1.2, 0.5, 1.2);
      const crownMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: 0.85
      });
      const crown = new THREE.Mesh(crownGeo, crownMat);
      crown.position.y = 0.3 + towerHeight + 0.25;
      group.add(crown);

      // Building localized point light
      const pointLight = new THREE.PointLight(colorHex, 1.8, 8);
      pointLight.position.set(0, towerHeight + 0.5, 0);
      group.add(pointLight);

      // Holographic Destination Pillar / Beacon (Visible when selected)
      const beaconGeo = new THREE.CylinderGeometry(0.08, 0.8, 14, 16, 1, true);
      const beaconMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.0, // toggled when destination is selected
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
      beaconMesh.position.y = 7;
      group.add(beaconMesh);
      this.beaconMeshes.set(dest.id, beaconMesh);

      // Pulsing destination target ring at building base
      const targetRingGeo = new THREE.RingGeometry(1.7, 1.9, 32);
      const targetRingMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.0,
        side: THREE.DoubleSide
      });
      const targetRing = new THREE.Mesh(targetRingGeo, targetRingMat);
      targetRing.rotation.x = -Math.PI / 2;
      targetRing.position.y = 0.04;
      group.add(targetRing);
      beaconMesh.userData.targetRing = targetRing;

      // Floating Canvas 2D Text Badge Sprite
      const sprite = this.createBuildingLabelSprite(dest.name, dest.color);
      sprite.position.set(0, towerHeight + 1.6, 0);
      group.add(sprite);

      this.scene.add(group);
      this.buildingMeshes.set(dest.id, group);
    });
  }

  createBuildingLabelSprite(name, colorStr) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Rounded background pill
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = colorStr;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(8, 8, 240, 48, 12);
    ctx.fill();
    ctx.stroke();

    // Text label
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, 128, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(3.2, 0.8, 1);
    return sprite;
  }

  createRoverWheel(isLeftSide) {
    const wheelGroup = new THREE.Group();

    // Tire dimensions: radius 0.22, width 0.14
    const tireRadius = 0.22;
    const tireWidth = 0.14;

    // Heavy-duty rugged tire rubber (matches black off-road rover tires)
    const tireGeo = new THREE.CylinderGeometry(tireRadius, tireRadius, tireWidth, 24);
    const tireMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.92,
      metalness: 0.08
    });
    const tire = new THREE.Mesh(tireGeo, tireMat);
    tire.rotation.z = Math.PI / 2;
    tire.castShadow = true;
    tire.receiveShadow = true;
    wheelGroup.add(tire);

    // Chunky off-road tire treads (12 lugs around perimeter for rugged look)
    const treadCount = 12;
    const treadMat = new THREE.MeshStandardMaterial({ color: 0x070b14, roughness: 0.95 });
    for (let i = 0; i < treadCount; i++) {
      const angle = (i / treadCount) * Math.PI * 2;
      const treadGeo = new THREE.BoxGeometry(tireWidth * 0.96, 0.022, 0.04);
      const tread = new THREE.Mesh(treadGeo, treadMat);
      tread.position.set(
        0,
        Math.sin(angle) * (tireRadius + 0.005),
        Math.cos(angle) * (tireRadius + 0.005)
      );
      tread.rotation.x = -angle;
      wheelGroup.add(tread);
    }

    // Inset dark metallic rim drum
    const rimGeo = new THREE.CylinderGeometry(tireRadius * 0.74, tireRadius * 0.74, tireWidth * 1.02, 24);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.35,
      metalness: 0.8
    });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.z = Math.PI / 2;
    wheelGroup.add(rim);

    // Signature Electric Cyan / Blue Glowing Outer Rim Ring (Matches picture!)
    const ringGeo = new THREE.RingGeometry(tireRadius * 0.48, tireRadius * 0.66, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.y = Math.PI / 2;
    // Position on outward face of wheel
    const outerFaceX = isLeftSide ? -tireWidth / 2 - 0.006 : tireWidth / 2 + 0.006;
    ring.position.x = outerFaceX;
    wheelGroup.add(ring);

    // Center Metallic Axle Hub Nut
    const hubGeo = new THREE.CylinderGeometry(0.045, 0.045, tireWidth * 1.1, 16);
    const hubMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.9,
      roughness: 0.2
    });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    hub.rotation.z = Math.PI / 2;
    wheelGroup.add(hub);

    return wheelGroup;
  }

  setupRobot() {
    this.robotGroup = new THREE.Group();
    this.robotGroup.position.set(0, 0, 0);
    this.robotWheels = [];

    // 1. Lower Chassis Skid Plate / Undercarriage (dark slate)
    const skidGeo = new THREE.BoxGeometry(0.66, 0.10, 0.96);
    const skidMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.7,
      metalness: 0.6
    });
    const skid = new THREE.Mesh(skidGeo, skidMat);
    skid.position.y = 0.16;
    skid.castShadow = true;
    skid.receiveShadow = true;
    this.robotGroup.add(skid);

    // 2. White Satin Body Hull (Matches the white delivery rover in the picture)
    const bodyGeo = new THREE.BoxGeometry(0.74, 0.24, 0.98);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.25,
      metalness: 0.15
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.31;
    body.castShadow = true;
    body.receiveShadow = true;
    this.robotGroup.add(body);

    // Rounded vertical corners for sleek automotive rover styling
    const cornerRadius = 0.08;
    const cornerHeight = 0.24;
    const cornerGeo = new THREE.CylinderGeometry(cornerRadius, cornerRadius, cornerHeight, 16);
    const cornerPositions = [
      [-0.30, 0.31, -0.42],
      [0.30, 0.31, -0.42],
      [-0.30, 0.31, 0.42],
      [0.30, 0.31, 0.42]
    ];
    cornerPositions.forEach(([x, y, z]) => {
      const corner = new THREE.Mesh(cornerGeo, bodyMat);
      corner.position.set(x, y, z);
      corner.castShadow = true;
      this.robotGroup.add(corner);
    });

    // Front Bumper / Nose Slope Panel
    const noseGeo = new THREE.BoxGeometry(0.62, 0.12, 0.10);
    const nose = new THREE.Mesh(noseGeo, bodyMat);
    nose.position.set(0, 0.25, -0.50);
    nose.rotation.x = Math.PI / 12;
    this.robotGroup.add(nose);

    // Front Lower Sensor / Air Intake Slit (dark contrast)
    const intakeGeo = new THREE.BoxGeometry(0.48, 0.04, 0.03);
    const intakeMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const intake = new THREE.Mesh(intakeGeo, intakeMat);
    intake.position.set(0, 0.20, -0.51);
    this.robotGroup.add(intake);

    // 3. Signature Cyan LED Cyber Light Bar (Horizontal wrap-around headlight)
    const lightBarMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x00f2fe,
      emissiveIntensity: 2.8,
      roughness: 0.1,
      metalness: 0.5
    });

    // Front horizontal light strip
    const frontLightGeo = new THREE.BoxGeometry(0.70, 0.045, 0.04);
    const frontLight = new THREE.Mesh(frontLightGeo, lightBarMat);
    frontLight.position.set(0, 0.41, -0.50);
    this.robotGroup.add(frontLight);

    // Wrap-around side light strips (left & right front quarter panels)
    const sideLightGeo = new THREE.BoxGeometry(0.04, 0.045, 0.32);
    const leftSideLight = new THREE.Mesh(sideLightGeo, lightBarMat);
    leftSideLight.position.set(-0.375, 0.41, -0.34);
    this.robotGroup.add(leftSideLight);

    const rightSideLight = new THREE.Mesh(sideLightGeo, lightBarMat);
    rightSideLight.position.set(0.375, 0.41, -0.34);
    this.robotGroup.add(rightSideLight);

    // Directional forward cyan pavement illumination
    const frontGlow = new THREE.PointLight(0x00f2fe, 2.5, 4.5, 1.2);
    frontGlow.position.set(0, 0.38, -0.65);
    this.robotGroup.add(frontGlow);

    // Forward beam spotlight casting light ahead along path
    const headlight = new THREE.SpotLight(0x67e8f9, 3.5, 8, Math.PI / 4, 0.4, 1.2);
    headlight.position.set(0, 0.40, -0.55);
    const headlightTarget = new THREE.Object3D();
    headlightTarget.position.set(0, 0, -5);
    this.robotGroup.add(headlightTarget);
    headlight.target = headlightTarget;
    this.robotGroup.add(headlight);

    // 4. Black Top Deck / Hood / Sunroof
    const deckGeo = new THREE.BoxGeometry(0.68, 0.03, 0.90);
    const deckMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.3,
      metalness: 0.85
    });
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.y = 0.44;
    deck.castShadow = true;
    this.robotGroup.add(deck);

    // 5. Center Sensor Turret & LiDAR Dome (Matches multi-camera & LiDAR head)
    const turretGroup = new THREE.Group();
    turretGroup.position.set(0, 0.455, -0.02);

    // Base Mounting Collar
    const baseCollarGeo = new THREE.CylinderGeometry(0.22, 0.24, 0.05, 32);
    const baseCollarMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.3
    });
    const baseCollar = new THREE.Mesh(baseCollarGeo, baseCollarMat);
    baseCollar.position.y = 0.025;
    baseCollar.castShadow = true;
    turretGroup.add(baseCollar);

    // Camera Sensor Housing Block (Middle tier)
    const camHousingGeo = new THREE.CylinderGeometry(0.18, 0.20, 0.09, 32);
    const camHousingMat = new THREE.MeshStandardMaterial({
      color: 0x0b1120,
      metalness: 0.9,
      roughness: 0.15
    });
    const camHousing = new THREE.Mesh(camHousingGeo, camHousingMat);
    camHousing.position.y = 0.09;
    camHousing.castShadow = true;
    turretGroup.add(camHousing);

    // Front AI Vision Camera Lens Aperture (As seen in the picture!)
    const lensApertureGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.015, 16);
    const lensApertureMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0284c7,
      emissiveIntensity: 0.6,
      metalness: 0.95,
      roughness: 0.05
    });
    const frontLens = new THREE.Mesh(lensApertureGeo, lensApertureMat);
    frontLens.rotation.x = Math.PI / 2;
    frontLens.position.set(0, 0.09, -0.19);
    turretGroup.add(frontLens);

    // Side & rear camera sensor dots
    [
      [-0.19, 0.09, 0, Math.PI / 2],
      [0.19, 0.09, 0, -Math.PI / 2],
      [0, 0.09, 0.19, Math.PI]
    ].forEach(([x, y, z, rotY]) => {
      const sensorDot = new THREE.Mesh(lensApertureGeo, lensApertureMat);
      sensorDot.rotation.x = Math.PI / 2;
      sensorDot.rotation.z = rotY;
      sensorDot.position.set(x, y, z);
      turretGroup.add(sensorDot);
    });

    // Rotating 360° LiDAR Puck (Top tier)
    const lidarGroup = new THREE.Group();
    lidarGroup.position.set(0, 0.18, 0);

    const lidarPuckGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.09, 32);
    const lidarPuckMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.85,
      roughness: 0.2
    });
    const puckBody = new THREE.Mesh(lidarPuckGeo, lidarPuckMat);
    lidarGroup.add(puckBody);

    // Reflective optical sensor slit band around LiDAR
    const slitGeo = new THREE.CylinderGeometry(0.153, 0.153, 0.028, 32);
    const slitMat = new THREE.MeshStandardMaterial({
      color: 0x0369a1,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      roughness: 0.1
    });
    const slit = new THREE.Mesh(slitGeo, slitMat);
    lidarGroup.add(slit);

    // Glowing laser scanner indicator eye
    const eyeGeo = new THREE.BoxGeometry(0.04, 0.02, 0.06);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.position.set(0.12, 0, 0);
    lidarGroup.add(eye);

    // Turret Crown Cap & Center Antenna Node
    const crownGeo = new THREE.CylinderGeometry(0.09, 0.11, 0.03, 32);
    const crownMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
    const crown = new THREE.Mesh(crownGeo, crownMat);
    crown.position.y = 0.06;
    lidarGroup.add(crown);

    const antennaGeo = new THREE.CylinderGeometry(0.015, 0.02, 0.05, 16);
    const antennaMat = new THREE.MeshStandardMaterial({ color: 0x020617, metalness: 0.9 });
    const antenna = new THREE.Mesh(antennaGeo, antennaMat);
    antenna.position.y = 0.095;
    lidarGroup.add(antenna);

    this.lidarPuck = lidarGroup;
    turretGroup.add(this.lidarPuck);
    this.robotGroup.add(turretGroup);

    // 6. 4 Off-Road All-Terrain Rover Wheels (4WD)
    // Left side wheels (isLeftSide = true)
    const flWheel = this.createRoverWheel(true);
    flWheel.position.set(-0.48, 0.22, -0.32);
    this.robotGroup.add(flWheel);
    this.robotWheels.push(flWheel);

    const rlWheel = this.createRoverWheel(true);
    rlWheel.position.set(-0.48, 0.22, 0.32);
    this.robotGroup.add(rlWheel);
    this.robotWheels.push(rlWheel);

    // Right side wheels (isLeftSide = false)
    const frWheel = this.createRoverWheel(false);
    frWheel.position.set(0.48, 0.22, -0.32);
    this.robotGroup.add(frWheel);
    this.robotWheels.push(frWheel);

    const rrWheel = this.createRoverWheel(false);
    rrWheel.position.set(0.48, 0.22, 0.32);
    this.robotGroup.add(rrWheel);
    this.robotWheels.push(rrWheel);

    // Wheel axle connecting rods into the chassis
    const axleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.98, 16);
    const axleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    [-0.32, 0.32].forEach((z) => {
      const axle = new THREE.Mesh(axleGeo, axleMat);
      axle.rotation.z = Math.PI / 2;
      axle.position.set(0, 0.22, z);
      this.robotGroup.add(axle);
    });

    // 7. Floating NaviBot Nameplate Badge
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 42;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = '#06B6D4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(4, 4, 152, 34, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('NaviBot • AMR', 80, 21);

    const tagTexture = new THREE.CanvasTexture(canvas);
    const tagMat = new THREE.SpriteMaterial({ map: tagTexture, transparent: true });
    const tagSprite = new THREE.Sprite(tagMat);
    tagSprite.scale.set(1.5, 0.4, 1);
    tagSprite.position.set(0, 1.05, 0);
    this.robotGroup.add(tagSprite);

    this.scene.add(this.robotGroup);
  }

  setupHoverPreview() {
    // Semi-transparent ghost marker showing where an obstacle will spawn
    const group = new THREE.Group();

    const ringGeo = new THREE.RingGeometry(0.6, 0.75, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.05;
    group.add(ring);

    const coneGeo = new THREE.ConeGeometry(0.35, 0.8, 16);
    const coneMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.45,
      roughness: 0.3
    });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.position.y = 0.45;
    group.add(cone);

    group.visible = false;
    this.hoverPreviewMesh = group;
    this.scene.add(this.hoverPreviewMesh);
  }

  // Sync Obstacles with simulationController state
  syncObstacles(obstacles) {
    const currentIds = new Set(obstacles.map(o => o.id));

    // Remove obsolete obstacle meshes
    for (const [id, mesh] of this.obstacleMeshes.entries()) {
      if (!currentIds.has(id)) {
        this.scene.remove(mesh);
        mesh.traverse((child) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
        });
        this.obstacleMeshes.delete(id);
      }
    }

    // Add or update obstacle meshes
    obstacles.forEach((obs) => {
      if (!this.obstacleMeshes.has(obs.id)) {
        const obsMesh = this.createObstacleMesh(obs);
        this.scene.add(obsMesh);
        this.obstacleMeshes.set(obs.id, obsMesh);
      } else {
        const existing = this.obstacleMeshes.get(obs.id);
        const worldX = obs.grid.x - 10;
        const worldZ = obs.grid.y - 10;
        existing.position.set(worldX, 0, worldZ);
      }
    });
  }

  createObstacleMesh(obs) {
    const group = new THREE.Group();
    const worldX = obs.grid.x - 10;
    const worldZ = obs.grid.y - 10;
    group.position.set(worldX, 0, worldZ);
    group.userData = { id: obs.id, isObstacle: true };

    // Hazard cone base
    const baseGeo = new THREE.BoxGeometry(0.75, 0.08, 0.75);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.04;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    // Hazard Traffic Pylon
    const pylonGeo = new THREE.ConeGeometry(0.35, 1.0, 16);
    const pylonMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.25,
      metalness: 0.3
    });
    const pylon = new THREE.Mesh(pylonGeo, pylonMat);
    pylon.position.y = 0.54;
    pylon.castShadow = true;
    group.add(pylon);

    // Reflective white warning rings on cone
    const bandGeo = new THREE.CylinderGeometry(0.22, 0.26, 0.18, 16);
    const bandMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
    const band = new THREE.Mesh(bandGeo, bandMat);
    band.position.y = 0.48;
    group.add(band);

    // Warning beacon point light
    const warnLight = new THREE.PointLight(0xf59e0b, 1.5, 4);
    warnLight.position.set(0, 1.1, 0);
    group.add(warnLight);

    // Floating animated diamond warning marker
    const diamondGeo = new THREE.OctahedronGeometry(0.18);
    const diamondMat = new THREE.MeshBasicMaterial({ color: 0xfef08a, wireframe: true });
    const diamond = new THREE.Mesh(diamondGeo, diamondMat);
    diamond.position.y = 1.35;
    diamond.name = 'floating_diamond';
    group.add(diamond);

    return group;
  }

  // Sync Active Route Ribbon with A* waypoints
  syncRoute(route, status) {
    this.activeRoute = route || [];
    this.status = status;

    // Clear previous line
    if (this.pathLineMesh) {
      this.scene.remove(this.pathLineMesh);
      this.pathLineMesh.geometry.dispose();
      this.pathLineMesh.material.dispose();
      this.pathLineMesh = null;
    }

    // Clear waypoints markers
    while (this.pathPointsGroup.children.length > 0) {
      const child = this.pathPointsGroup.children[0];
      this.pathPointsGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    }

    if (!route || route.length < 2) return;

    // Create 3D points
    const points = route.map(wp => {
      const gx = wp.grid ? wp.grid.x : (wp.x || 10);
      const gy = wp.grid ? wp.grid.y : (wp.y || 10);
      return new THREE.Vector3(gx - 10, 0.12, gy - 10);
    });

    const isRecalculating = status === 'avoiding_obstacle';
    const pathColor = isRecalculating ? 0xf59e0b : 0x10b981;

    // Smooth spline curve through waypoints
    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeo = new THREE.TubeGeometry(curve, Math.max(12, points.length * 6), 0.08, 8, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: pathColor,
      emissive: pathColor,
      emissiveIntensity: 0.7,
      roughness: 0.2,
      metalness: 0.8
    });

    this.pathLineMesh = new THREE.Mesh(tubeGeo, tubeMat);
    this.scene.add(this.pathLineMesh);

    // Add glowing node dots along waypoints
    const dotGeo = new THREE.SphereGeometry(0.1, 12, 12);
    const dotMat = new THREE.MeshBasicMaterial({ color: pathColor });
    points.forEach((pt, i) => {
      if (i % 2 === 0 || i === points.length - 1) {
        const dot = new THREE.Mesh(dotGeo, dotMat);
        dot.position.copy(pt);
        this.pathPointsGroup.add(dot);
      }
    });
  }

  // Update target robot pose for smooth 60fps interpolation
  updateRobotPose(robotPosition) {
    if (!robotPosition || !robotPosition.grid) return;

    const wx = robotPosition.grid.x - 10;
    const wz = robotPosition.grid.y - 10;
    this.robotTargetPos.set(wx, 0, wz);

    // Convert heading in degrees to radians
    // 0 deg in controller is North (-Z direction in Three.js)
    if (typeof robotPosition.heading === 'number') {
      this.robotTargetHeading = THREE.MathUtils.degToRad(-robotPosition.heading + 180);
    }
  }

  // Update active destination beacon
  updateDestination(destination) {
    this.currentDestination = destination;

    // Turn off all beacons, turn on active one
    this.beaconMeshes.forEach((beacon, id) => {
      const isActive = destination && destination.id === id;
      beacon.material.opacity = isActive ? 0.45 : 0.0;
      if (beacon.userData.targetRing) {
        beacon.userData.targetRing.material.opacity = isActive ? 0.9 : 0.0;
      }
    });
  }

  // Switch camera modes
  setCameraMode(mode) {
    const prevMode = this.cameraMode;
    this.cameraMode = mode; // 'perspective' | 'grid' | 'follow'

    if (mode === 'grid') {
      // 2D Tactical Radar overhead view
      this.controls.enableRotate = false;
      this.controls.target.set(0, 0, 0);
    } else if (mode === 'perspective') {
      // Isometric 3D view
      this.controls.enableRotate = true;
      if (prevMode === 'grid' || prevMode === 'follow') {
        this.cameraTargetPos = new THREE.Vector3(16, 20, 20);
        this.isTransitioningCamera = true;
      }
    } else if (mode === 'follow') {
      // Third-person chase camera
      this.controls.enableRotate = false;
    }
  }

  setShowGrid(show) {
    this.showGrid = show;
    if (this.gridHelper) {
      this.gridHelper.visible = show;
    }
  }

  // Raycasting & Pointer Events
  onPointerMove(e) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects([this.groundMesh]);

    if (intersects.length > 0) {
      const pt = intersects[0].point;
      const gridX = Math.min(19, Math.max(1, Math.round(pt.x + 10)));
      const gridY = Math.min(19, Math.max(1, Math.round(pt.z + 10)));

      this.isHoveringGround = true;
      this.hoveredGrid = { x: gridX, y: gridY };

      if (this.hoverPreviewMesh) {
        this.hoverPreviewMesh.position.set(gridX - 10, 0, gridY - 10);
        this.hoverPreviewMesh.visible = true;
      }
    } else {
      this.isHoveringGround = false;
      if (this.hoverPreviewMesh) {
        this.hoverPreviewMesh.visible = false;
      }
    }
  }

  onPointerDown(e) {
    this.isTransitioningCamera = false;
    // Only handle primary click
    if (e.button !== 0) return;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    // 1. Check if clicked on an existing obstacle
    const obstacleObjects = [];
    this.obstacleMeshes.forEach(mesh => {
      mesh.traverse(child => obstacleObjects.push(child));
    });

    const obsIntersects = this.raycaster.intersectObjects(obstacleObjects, false);
    if (obsIntersects.length > 0) {
      let topGroup = obsIntersects[0].object;
      while (topGroup.parent && !topGroup.userData?.isObstacle) {
        topGroup = topGroup.parent;
      }
      if (topGroup.userData?.id) {
        if (this.callbacks.onRemoveObstacle) {
          this.callbacks.onRemoveObstacle(topGroup.userData.id);
        }
        return;
      }
    }

    // 2. Otherwise place new obstacle on ground
    const groundIntersects = this.raycaster.intersectObjects([this.groundMesh]);
    if (groundIntersects.length > 0) {
      const pt = groundIntersects[0].point;
      const gridX = Math.min(19, Math.max(1, Math.round(pt.x + 10)));
      const gridY = Math.min(19, Math.max(1, Math.round(pt.z + 10)));

      if (this.callbacks.onAddObstacleAtClick) {
        this.callbacks.onAddObstacleAtClick({
          id: `obs-${Date.now()}`,
          grid: { x: gridX, y: gridY },
          world: { x: gridX - 10, y: 0, z: gridY - 10 },
          label: `Hazard [${gridX},${gridY}]`
        });
      }
    }
  }

  onPointerLeave() {
    this.isHoveringGround = false;
    if (this.hoverPreviewMesh) {
      this.hoverPreviewMesh.visible = false;
    }
  }

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  // Animation & Rendering Loop
  animate() {
    this.animationFrameId = requestAnimationFrame(this.animate);
    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Smoothly interpolate robot position (LERP)
    if (this.robotGroup) {
      this.robotGroup.position.lerp(this.robotTargetPos, 0.12);

      // Smooth heading rotation
      let diff = this.robotTargetHeading - this.robotGroup.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      this.robotGroup.rotation.y += diff * 0.14;
    }

    // 2. Spin LiDAR sensor
    if (this.lidarPuck) {
      this.lidarPuck.rotation.y += delta * 12.0;
    }

    // 3. Spin rover wheels dynamically when driving
    if (this.robotWheels && this.robotWheels.length > 0) {
      const isMoving = this.status === 'moving' || this.status === 'avoiding_obstacle';
      if (isMoving) {
        const wheelSpin = delta * 10.0;
        this.robotWheels.forEach((wheel) => {
          wheel.rotation.x -= wheelSpin;
        });
      }
    }

    // 4. Animate floating hazard diamonds
    this.obstacleMeshes.forEach((mesh) => {
      const diamond = mesh.getObjectByName('floating_diamond');
      if (diamond) {
        diamond.rotation.y += delta * 2.0;
        diamond.position.y = 1.35 + Math.sin(elapsedTime * 3.5) * 0.08;
      }
    });

    // 4. Animate active destination beacon
    this.beaconMeshes.forEach((beacon) => {
      if (beacon.material.opacity > 0) {
        beacon.rotation.y += delta * 0.8;
        if (beacon.userData.targetRing) {
          const scale = 1.0 + Math.sin(elapsedTime * 4.0) * 0.08;
          beacon.userData.targetRing.scale.set(scale, scale, 1);
        }
      }
    });

    // 5. Camera mode management
    if (this.cameraMode === 'grid') {
      // Smoothly fly camera to overhead radar position (0, 32, 0.001)
      this.camera.position.lerp(new THREE.Vector3(0, 32, 0.001), 0.08);
      this.controls.target.lerp(new THREE.Vector3(0, 0, 0), 0.08);
    } else if (this.cameraMode === 'follow' && this.robotGroup) {
      // Follow Cam: 5.5m behind robot's heading, 3.8m up
      const heading = this.robotGroup.rotation.y;
      const behindX = this.robotGroup.position.x - Math.sin(heading) * 6.5;
      const behindZ = this.robotGroup.position.z - Math.cos(heading) * 6.5;

      const targetCamPos = new THREE.Vector3(behindX, 4.2, behindZ);
      this.camera.position.lerp(targetCamPos, 0.08);

      const lookTarget = new THREE.Vector3(
        this.robotGroup.position.x,
        this.robotGroup.position.y + 0.5,
        this.robotGroup.position.z
      );
      this.controls.target.lerp(lookTarget, 0.12);
    } else if (this.cameraMode === 'perspective') {
      if (this.isTransitioningCamera && this.cameraTargetPos) {
        this.camera.position.lerp(this.cameraTargetPos, 0.08);
        this.controls.target.lerp(new THREE.Vector3(0, 0, 0), 0.08);
        if (this.camera.position.distanceTo(this.cameraTargetPos) < 0.2) {
          this.isTransitioningCamera = false;
        }
      }
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  // Agent 2 Delegate Interface Bridge
  attachDelegate() {
    simulationController.attachEngine(this);
  }

  onDestinationSelected(destination) {
    this.updateDestination(destination);
  }

  addObstacle(obstacle) {
    // When obstacle is added, check if active route intersects and replan
    if (simulationController.state.status === 'moving' && simulationController.state.currentDestination) {
      simulationController.checkObstacleCollisionAndReplan(obstacle);
    }
  }

  removeObstacle(id) {
    // When obstacle is removed, re-check route if moving
    if (simulationController.state.status === 'moving' && simulationController.state.currentDestination) {
      const newRoute = simulationController.generatePath(
        simulationController.state.robotPosition.grid,
        simulationController.state.currentDestination.gridPos,
        simulationController.state.obstacles
      );
      if (newRoute) {
        simulationController.setState({ activeRoute: newRoute });
      }
    }
  }

  clearObstacles() {
    if (simulationController.state.status === 'moving' && simulationController.state.currentDestination) {
      const newRoute = simulationController.generatePath(
        simulationController.state.robotPosition.grid,
        simulationController.state.currentDestination.gridPos,
        []
      );
      if (newRoute) {
        simulationController.setState({ activeRoute: newRoute });
      }
    }
  }

  resetSimulation() {
    this.updateDestination(null);
    this.robotTargetPos.set(0, 0, 0);
    this.robotTargetHeading = 0;
    if (this.robotGroup) {
      this.robotGroup.position.set(0, 0, 0);
      this.robotGroup.rotation.y = 0;
    }
    this.syncRoute([], 'idle');
  }

  pauseNavigation() {
    // Can pause any engine-specific visual effects if needed
  }

  resumeNavigation() {
    // Can resume any engine-specific visual effects if needed
  }

  setSpeed(multiplier) {
    // Adapt engine timing if necessary
  }

  // Destroy and free memory
  dispose() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    window.removeEventListener('resize', this.boundOnResize);
    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.removeEventListener('pointermove', this.boundOnPointerMove);
      this.renderer.domElement.removeEventListener('pointerdown', this.boundOnPointerDown);
      this.renderer.domElement.removeEventListener('pointerleave', this.boundOnPointerLeave);

      if (this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
      this.renderer.dispose();
    }

    if (this.controls) {
      this.controls.dispose();
    }
  }
}

export default ThreeEngine;
