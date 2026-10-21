import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DESTINATIONS, simulationController } from './simulationController';

/**
 * NaviAI 3D Three.js Simulation Engine (Agent 2)
 * Renders high-fidelity sunny campus environment matching reference design:
 * - Library, Cafeteria, Computer Lab, Auditorium, Main Gate with 3D signboards
 * - Centerpiece tiered stone Water Fountain with animated splashing water particles
 * - Manicured green lawns, paved limestone plazas, deciduous trees, hedges, lamp posts, benches
 * - 4WD white autonomous rover with cyan glowing rim rings, spinning LiDAR, and forward POV camera
 * - Red plastic Jersey highway road barricades with floating "Obstacle Detected" alert badge
 * - Glowing cyan navigation path with animated directional arrows & green destination pin
 */
export class ThreeEngine {
  constructor(container, callbacks = {}) {
    this.container = container;
    this.callbacks = callbacks; // { onAddObstacleAtClick, onRemoveObstacle }

    this.scene = null;
    this.camera = null;
    this.povCamera = null;
    this.renderer = null;
    this.povRenderer = null;
    this.povCanvas = null;
    this.controls = null;
    this.clock = new THREE.Clock();
    this.animationFrameId = null;

    // Camera modes: 'perspective' | 'grid' | 'follow' | 'pov'
    this.cameraMode = 'perspective';
    this.showGrid = true;
    this.isTransitioningCamera = false;
    this.perspectiveTargetPos = new THREE.Vector3(-11, 17, 21);
    this.perspectiveTargetLook = new THREE.Vector3(0, 0, -1);

    // 3D Scene Objects
    this.gridHelper = null;
    this.groundMesh = null;
    this.buildingMeshes = new Map();
    this.beaconMeshes = new Map();
    this.obstacleMeshes = new Map();
    this.pathLineMesh = null;
    this.pathChevronsGroup = new THREE.Group();
    this.destinationPin = null;
    this.robotGroup = null;
    this.lidarPuck = null;
    this.robotWheels = [];
    this.hoverPreviewMesh = null;
    this.fountainParticles = [];
    this.pedestrians = [];
    this.fountainWater = null;

    // Animation / State Interpolation
    this.robotTargetPos = new THREE.Vector3(-5, 0, 5.5);
    this.robotTargetHeading = THREE.MathUtils.degToRad(-45 + 180);
    this.activeRoute = [];
    this.currentDestination = null;
    this.status = 'idle';

    // Raycasting
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-999, -999);
    this.isHoveringGround = false;
    this.hoveredGrid = { x: 5, y: 14 };

    this.init();
  }

  init() {
    const width = this.container.clientWidth || 900;
    const height = this.container.clientHeight || 560;

    // 1. Scene setup (Bright sunny daylight campus matching reference image)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#8EC8EE'); // Soft daytime sky blue
    this.scene.fog = new THREE.FogExp2('#D5E8F7', 0.011);

    // 2. Camera setup (Elevated diagonal view showing entire campus, plaza, and buildings)
    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    this.camera.position.set(-11, 17, 21);

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    // 4. Orbit Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.08;
    this.controls.minDistance = 6;
    this.controls.maxDistance = 65;
    this.controls.target.set(0, 0.5, -0.5);

    // 5. Lighting (Warm sun and sky light)
    this.setupLighting();

    // 6. Ground, Plaza, Pathways & Water Fountain
    this.setupEnvironment();
    this.setupFountain();

    // 7. Campus Buildings with 3D Signboards
    this.setupBuildings();

    // 8. Trees, Benches, Hedges & Street Lamps
    this.setupSceneryProps();

    // 9. 4WD Autonomous Robot Model
    this.setupRobot();

    // 10. Hover Preview Indicator
    this.setupHoverPreview();

    // 11. Event Listeners
    this.boundOnResize = this.onResize.bind(this);
    this.boundOnPointerMove = this.onPointerMove.bind(this);
    this.boundOnPointerDown = this.onPointerDown.bind(this);
    this.boundOnPointerUp = this.onPointerUp.bind(this);
    this.boundOnPointerLeave = this.onPointerLeave.bind(this);

    window.addEventListener('resize', this.boundOnResize);
    this.renderer.domElement.addEventListener('pointermove', this.boundOnPointerMove);
    this.renderer.domElement.addEventListener('pointerdown', this.boundOnPointerDown);
    this.renderer.domElement.addEventListener('pointerup', this.boundOnPointerUp);
    this.renderer.domElement.addEventListener('pointerleave', this.boundOnPointerLeave);

    // 12. Attach to simulationController
    this.attachDelegate();

    // 13. Sync initial state
    const initState = simulationController.getState();
    if (initState.obstacles) this.syncObstacles(initState.obstacles);
    if (initState.robotPosition) this.updateRobotPose(initState.robotPosition);
    if (initState.currentDestination) this.updateDestination(initState.currentDestination);

    // 14. Start Render Loop
    this.animate = this.animate.bind(this);
    this.animate();
  }

  setupLighting() {
    // Ambient fill
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    this.scene.add(ambientLight);

    // Hemisphere sky/ground bounce light
    const hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x4a7c29, 1.4);
    hemiLight.position.set(0, 30, 0);
    this.scene.add(hemiLight);

    // Main directional sunlight with soft PCF shadows
    const sunLight = new THREE.DirectionalLight(0xfffaec, 2.6);
    sunLight.position.set(18, 32, 18);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 90;
    const shadowDist = 24;
    sunLight.shadow.camera.left = -shadowDist;
    sunLight.shadow.camera.right = shadowDist;
    sunLight.shadow.camera.top = shadowDist;
    sunLight.shadow.camera.bottom = -shadowDist;
    sunLight.shadow.bias = -0.0004;
    this.scene.add(sunLight);

    // Secondary soft fill light
    const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.8);
    fillLight.position.set(-16, 20, -16);
    this.scene.add(fillLight);
  }

  createPerceptionLabel(text, colorHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = colorHex;
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(4, 4, 248, 56, 12);
    } else {
      ctx.rect(4, 4, 248, 56);
    }
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(1.4, 0.35, 1);
    return sprite;
  }

  createPerceptionBox(width, height, depth, colorHex, labelText) {
    const boxGroup = new THREE.Group();
    const boxGeo = new THREE.BoxGeometry(width, height, depth);
    const edges = new THREE.EdgesGeometry(boxGeo);
    const lineMat = new THREE.LineBasicMaterial({ color: colorHex, linewidth: 2 });
    const wireframe = new THREE.LineSegments(edges, lineMat);
    boxGroup.add(wireframe);

    if (labelText) {
      const label = this.createPerceptionLabel(labelText, colorHex);
      label.position.set(0, height / 2 + 0.32, 0);
      boxGroup.add(label);
    }
    return boxGroup;
  }

  setupEnvironment() {
    // 1. Manicured Green Grass Lawn with natural vibrancy
    const groundGeo = new THREE.PlaneGeometry(80, 80);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x4d7c2a, // Lush vibrant lawn green
      roughness: 0.88,
      metalness: 0.04
    });
    this.groundMesh = new THREE.Mesh(groundGeo, groundMat);
    this.groundMesh.rotation.x = -Math.PI / 2;
    this.groundMesh.receiveShadow = true;
    this.groundMesh.name = 'campus_ground';
    this.scene.add(this.groundMesh);

    // 2. Tactical Campus Grid
    this.gridHelper = new THREE.GridHelper(20, 20, 0x00f2fe, 0x64748b);
    this.gridHelper.position.y = 0.02;
    this.gridHelper.material.opacity = 0.20;
    this.gridHelper.material.transparent = true;
    this.scene.add(this.gridHelper);

    // 3. Central Paved Sandstone Plaza
    const plazaGeo = new THREE.CylinderGeometry(5.4, 5.4, 0.05, 48);
    const pavingMat = new THREE.MeshStandardMaterial({
      color: 0xe5e0d5, // Sandstone paving stones
      roughness: 0.82,
      metalness: 0.08
    });
    const plaza = new THREE.Mesh(plazaGeo, pavingMat);
    plaza.position.set(0, 0.025, -1);
    plaza.receiveShadow = true;
    this.scene.add(plaza);

    // Plaza outer dark border kerb
    const kerbGeo = new THREE.RingGeometry(5.35, 5.65, 48);
    const kerbMat = new THREE.MeshStandardMaterial({ color: 0x9e9587, roughness: 0.75 });
    const kerb = new THREE.Mesh(kerbGeo, kerbMat);
    kerb.rotation.x = -Math.PI / 2;
    kerb.position.set(0, 0.046, -1);
    this.scene.add(kerb);

    // 4. Wide Paved Walkways with 3D Granite Kerb Borders
    const walkwaySegments = [
      [{ x: -8, z: 8 }, { x: 0, z: -1 }, 2.8],    // Main Gate to Plaza Fountain
      [{ x: 0, z: -1 }, { x: 0, z: -10 }, 3.2],   // Plaza to Library
      [{ x: -9, z: -2 }, { x: 0, z: -1 }, 2.8],   // Cafeteria to Plaza
      [{ x: 9, z: -3 }, { x: 0, z: -1 }, 2.8],    // Computer Lab to Plaza
      [{ x: 9, z: 8 }, { x: 0, z: -1 }, 2.8],     // Auditorium to Plaza
      [{ x: -8, z: 8 }, { x: -9, z: -2 }, 2.4],   // Main Gate to Cafeteria
      [{ x: 9, z: -3 }, { x: 9, z: 8 }, 2.4],     // Computer Lab to Auditorium
      [{ x: -9, z: -2 }, { x: 0, z: -10 }, 2.4],  // Cafeteria to Library
      [{ x: 9, z: -3 }, { x: 0, z: -10 }, 2.4]    // Computer Lab to Library
    ];

    const borderKerbMat = new THREE.MeshStandardMaterial({ color: 0xb5ad9e, roughness: 0.7 });

    walkwaySegments.forEach(([start, end, width]) => {
      const dx = end.x - start.x;
      const dz = end.z - start.z;
      const len = Math.hypot(dx, dz);
      const angle = Math.atan2(dz, dx);
      const midX = (start.x + end.x) / 2;
      const midZ = (start.z + end.z) / 2;

      // Paved path surface
      const pathGeo = new THREE.PlaneGeometry(len, width);
      const pathMesh = new THREE.Mesh(pathGeo, pavingMat);
      pathMesh.rotation.x = -Math.PI / 2;
      pathMesh.rotation.z = -angle;
      pathMesh.position.set(midX, 0.03, midZ);
      pathMesh.receiveShadow = true;
      this.scene.add(pathMesh);

      // Left and right 3D raised granite kerb edges
      const perpX = -Math.sin(angle) * (width / 2);
      const perpZ = Math.cos(angle) * (width / 2);

      [-1, 1].forEach((side) => {
        const kerbBoxGeo = new THREE.BoxGeometry(len, 0.08, 0.12);
        const kerbBox = new THREE.Mesh(kerbBoxGeo, borderKerbMat);
        kerbBox.rotation.y = -angle;
        kerbBox.position.set(midX + perpX * side, 0.04, midZ + perpZ * side);
        kerbBox.castShadow = true;
        kerbBox.receiveShadow = true;
        this.scene.add(kerbBox);
      });
    });

    // 5. Raised Stone Planter Beds with Green Shrubbery & Flowers (Matches Reference Pictures!)
    const planterPositions = [
      { x: -3.8, z: 4.6, rot: 0 },
      { x: 3.8, z: 4.6, rot: 0 },
      { x: -4.5, z: -4.5, rot: 0.3 },
      { x: 4.5, z: -4.5, rot: -0.3 }
    ];

    const planterStoneMat = new THREE.MeshStandardMaterial({ color: 0xd8d0c2, roughness: 0.65 });
    const soilMat = new THREE.MeshStandardMaterial({ color: 0x3d2716, roughness: 0.95 });
    const flowerColors = [0xe11d48, 0xf59e0b, 0xa855f7, 0xffffff, 0xec4899];

    planterPositions.forEach((pos, idx) => {
      const planterGroup = new THREE.Group();
      planterGroup.position.set(pos.x, 0, pos.z);
      planterGroup.rotation.y = pos.rot;

      // Stone trough walls
      const troughGeo = new THREE.BoxGeometry(2.4, 0.44, 0.9);
      const trough = new THREE.Mesh(troughGeo, planterStoneMat);
      trough.position.y = 0.22;
      trough.castShadow = true;
      trough.receiveShadow = true;
      planterGroup.add(trough);

      // Dark moist soil
      const soilGeo = new THREE.PlaneGeometry(2.2, 0.74);
      const soil = new THREE.Mesh(soilGeo, soilMat);
      soil.rotation.x = -Math.PI / 2;
      soil.position.y = 0.445;
      planterGroup.add(soil);

      // Lush green boxwood hedge shrubs
      const hedgeMat = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.8 });
      [-0.65, 0, 0.65].forEach((hx) => {
        const bushGeo = new THREE.SphereGeometry(0.38, 10, 10);
        const bush = new THREE.Mesh(bushGeo, hedgeMat);
        bush.position.set(hx, 0.58, 0);
        bush.castShadow = true;
        planterGroup.add(bush);
      });

      // Colorful flowers (roses, marigolds, daisies)
      for (let f = 0; f < 8; f++) {
        const flowerColor = flowerColors[f % flowerColors.length];
        const flMat = new THREE.MeshBasicMaterial({ color: flowerColor });
        const flGeo = new THREE.SphereGeometry(0.065, 6, 6);
        const fl = new THREE.Mesh(flGeo, flMat);
        const fx = -0.8 + (f / 7) * 1.6;
        const fz = (f % 2 === 0 ? 0.16 : -0.16);
        fl.position.set(fx, 0.78 + (f % 3) * 0.05, fz);
        planterGroup.add(fl);
      }

      // Attach AI Perception Bounding Box to the first planter (Matches Reference Picture 1!)
      if (idx === 1) {
        const pBox = this.createPerceptionBox(2.6, 1.1, 1.1, 0x10b981, 'Plant');
        pBox.position.set(0, 0.55, 0);
        planterGroup.add(pBox);
      }

      this.scene.add(planterGroup);
    });

    // 6. Directional Campus Wayfinding Signpost Pillar (Matches Reference Picture 1!)
    const signpostGroup = new THREE.Group();
    signpostGroup.position.set(2.4, 0, 0.8);

    const postMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.8 });
    const postGeo = new THREE.CylinderGeometry(0.07, 0.10, 2.8, 12);
    const postMesh = new THREE.Mesh(postGeo, postMat);
    postMesh.position.y = 1.4;
    postMesh.castShadow = true;
    signpostGroup.add(postMesh);

    // Directional signboards
    const signLabels = [
      { text: '← Library', y: 2.3, rot: 0 },
      { text: '← Cafeteria', y: 2.05, rot: 0.6 },
      { text: '← Auditorium', y: 1.8, rot: -0.8 },
      { text: '← Computer Lab', y: 1.55, rot: -1.4 }
    ];

    signLabels.forEach((item) => {
      const armGroup = new THREE.Group();
      armGroup.position.y = item.y;
      armGroup.rotation.y = item.rot;

      const boardGeo = new THREE.BoxGeometry(1.2, 0.18, 0.04);
      const boardMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
      const board = new THREE.Mesh(boardGeo, boardMat);
      board.position.x = 0.55;
      board.castShadow = true;
      armGroup.add(board);

      // Sign text canvas
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 48;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 256, 48);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.text, 16, 24);

      const texture = new THREE.CanvasTexture(canvas);
      const textGeo = new THREE.PlaneGeometry(1.16, 0.16);
      const textMat = new THREE.MeshBasicMaterial({ map: texture });
      const textMesh = new THREE.Mesh(textGeo, textMat);
      textMesh.position.set(0.55, 0, 0.025);
      armGroup.add(textMesh);

      signpostGroup.add(armGroup);
    });

    this.scene.add(signpostGroup);
    // Add path chevrons group
    this.scene.add(this.pathChevronsGroup);
  }

  setupFountain() {
    const fountainGroup = new THREE.Group();
    fountainGroup.position.set(0, 0, -1);

    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0xd6ccc2,
      roughness: 0.52,
      metalness: 0.12
    });

    // 1. Lower circular pool basin rim
    const basinGeo = new THREE.CylinderGeometry(2.35, 2.5, 0.45, 36);
    const basin = new THREE.Mesh(basinGeo, stoneMat);
    basin.position.y = 0.225;
    basin.castShadow = true;
    basin.receiveShadow = true;
    fountainGroup.add(basin);

    // Stone decorative lip torus
    const lipGeo = new THREE.TorusGeometry(2.4, 0.12, 12, 36);
    const lip = new THREE.Mesh(lipGeo, stoneMat);
    lip.rotation.x = Math.PI / 2;
    lip.position.y = 0.46;
    lip.castShadow = true;
    fountainGroup.add(lip);

    // 2. Clear Shimmering Cyan Pool Water
    const waterGeo = new THREE.CircleGeometry(2.3, 36);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4, // Vibrant cyan turquoise
      roughness: 0.08,
      metalness: 0.25,
      transparent: true,
      opacity: 0.88
    });
    this.fountainWater = new THREE.Mesh(waterGeo, waterMat);
    this.fountainWater.rotation.x = -Math.PI / 2;
    this.fountainWater.position.y = 0.38;
    fountainGroup.add(this.fountainWater);

    // 3. Central Fountain Pedestal
    const pedGeo = new THREE.CylinderGeometry(0.5, 0.7, 0.85, 20);
    const ped = new THREE.Mesh(pedGeo, stoneMat);
    ped.position.y = 0.45 + 0.425;
    ped.castShadow = true;
    fountainGroup.add(ped);

    // 4. Upper Water Basin Bowl
    const bowlGeo = new THREE.CylinderGeometry(1.05, 0.6, 0.32, 24);
    const bowl = new THREE.Mesh(bowlGeo, stoneMat);
    bowl.position.y = 1.3 + 0.16;
    bowl.castShadow = true;
    fountainGroup.add(bowl);

    // Upper pool water
    const upperWaterGeo = new THREE.CircleGeometry(1.0, 24);
    const upperWater = new THREE.Mesh(upperWaterGeo, waterMat);
    upperWater.rotation.x = -Math.PI / 2;
    upperWater.position.y = 1.62;
    fountainGroup.add(upperWater);

    // Center Spout Nozzle
    const spoutGeo = new THREE.CylinderGeometry(0.12, 0.18, 0.45, 16);
    const spout = new THREE.Mesh(spoutGeo, stoneMat);
    spout.position.y = 1.62 + 0.225;
    spout.castShadow = true;
    fountainGroup.add(spout);

    // 5. Animated Splashing Water Particles (Center jet + Cascading arcs)
    this.fountainParticles = [];
    const particleCount = 56;
    const particleGeo = new THREE.SphereGeometry(0.045, 8, 8);
    const particleMat = new THREE.MeshBasicMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.92
    });

    for (let i = 0; i < particleCount; i++) {
      const p = new THREE.Mesh(particleGeo, particleMat);
      const angle = (i / particleCount) * Math.PI * 2;
      p.userData = {
        angle,
        speed: 0.7 + (i % 5) * 0.18,
        progress: (i / particleCount),
        radiusMax: 0.5 + (i % 3) * 0.4
      };
      fountainGroup.add(p);
      this.fountainParticles.push(p);
    }

    this.scene.add(fountainGroup);
  }

  createSignboardMesh(text, width = 2.4, height = 0.55) {
    const group = new THREE.Group();

    // Dark slate backing plate with subtle cyan border
    const plateGeo = new THREE.BoxGeometry(width, height, 0.08);
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.3,
      metalness: 0.8
    });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.castShadow = true;
    group.add(plate);

    // High-resolution crisp white text canvas with neon frame
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, 512, 128);

    // Subtle cyan edge border
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 6;
    ctx.strokeRect(4, 4, 504, 120);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 52px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const labelGeo = new THREE.PlaneGeometry(width * 0.96, height * 0.88);
    const labelMat = new THREE.MeshBasicMaterial({ map: texture });
    const labelMesh = new THREE.Mesh(labelGeo, labelMat);
    labelMesh.position.z = 0.045;
    group.add(labelMesh);

    return group;
  }

  setupBuildings() {
    DESTINATIONS.forEach((dest) => {
      const group = new THREE.Group();
      group.position.set(dest.worldPos.x, 0, dest.worldPos.z);

      const colorHex = new THREE.Color(dest.color);

      if (dest.id === 'library') {
        // --- 1. Library (2-Story Grand Building with Entrance Steps & Glass Facade) ---
        const libGeo = new THREE.BoxGeometry(8.8, 4.4, 5.0);
        const libMat = new THREE.MeshStandardMaterial({ color: 0xf5f1e8, roughness: 0.48 });
        const libMesh = new THREE.Mesh(libGeo, libMat);
        libMesh.position.y = 2.2;
        libMesh.castShadow = true;
        libMesh.receiveShadow = true;
        group.add(libMesh);

        // Roof trim fascia
        const roofTrimGeo = new THREE.BoxGeometry(9.0, 0.32, 5.2);
        const roofTrimMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35 });
        const roofTrim = new THREE.Mesh(roofTrimGeo, roofTrimMat);
        roofTrim.position.y = 4.4 + 0.16;
        group.add(roofTrim);

        // Recessed front glass entrance atrium with warm interior glow
        const glassGeo = new THREE.BoxGeometry(3.8, 3.0, 0.12);
        const glassMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          roughness: 0.08,
          metalness: 0.65,
          transparent: true,
          opacity: 0.85
        });
        const glass = new THREE.Mesh(glassGeo, glassMat);
        glass.position.set(0, 1.5, 2.52);
        group.add(glass);

        // Entrance framing columns
        [-1.8, 1.8].forEach((cx) => {
          const colGeo = new THREE.CylinderGeometry(0.18, 0.22, 3.0, 16);
          const colMat = new THREE.MeshStandardMaterial({ color: 0xe2dad0, roughness: 0.5 });
          const col = new THREE.Mesh(colGeo, colMat);
          col.position.set(cx, 1.5, 2.58);
          col.castShadow = true;
          group.add(col);
        });

        // Front entrance wide steps
        for (let i = 0; i < 3; i++) {
          const stepGeo = new THREE.BoxGeometry(4.4 - i * 0.4, 0.14, 0.5);
          const stepMat = new THREE.MeshStandardMaterial({ color: 0xd6ccc2, roughness: 0.7 });
          const step = new THREE.Mesh(stepGeo, stepMat);
          step.position.set(0, 0.07 + i * 0.14, 2.7 + i * 0.4);
          step.receiveShadow = true;
          group.add(step);
        }

        // Rooftop HVAC units & solar panels
        const hvacGeo = new THREE.BoxGeometry(1.6, 0.7, 1.2);
        const hvacMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5, metalness: 0.7 });
        const hvac = new THREE.Mesh(hvacGeo, hvacMat);
        hvac.position.set(2.4, 4.75, 0.5);
        group.add(hvac);

        // Prominent Library Signboard
        const sign = this.createSignboardMesh('Library', 3.0, 0.7);
        sign.position.set(0, 3.6, 2.56);
        group.add(sign);

      } else if (dest.id === 'cafeteria') {
        // --- 2. Cafeteria (Single-Story Pavilion with Glass Storefront & Patio) ---
        const cafeGeo = new THREE.BoxGeometry(6.2, 3.0, 5.2);
        const cafeMat = new THREE.MeshStandardMaterial({ color: 0xf6f0e6, roughness: 0.55 });
        const cafeMesh = new THREE.Mesh(cafeGeo, cafeMat);
        cafeMesh.position.y = 1.5;
        cafeMesh.castShadow = true;
        cafeMesh.receiveShadow = true;
        group.add(cafeMesh);

        // Warm wood/bronze fascia band
        const fasciaGeo = new THREE.BoxGeometry(6.4, 0.45, 5.4);
        const fasciaMat = new THREE.MeshStandardMaterial({ color: 0xc28e5c, roughness: 0.35 });
        const fascia = new THREE.Mesh(fasciaGeo, fasciaMat);
        fascia.position.y = 3.0 + 0.225;
        group.add(fascia);

        // Front glass storefront
        const cafeGlassGeo = new THREE.BoxGeometry(4.6, 2.0, 0.12);
        const cafeGlassMat = new THREE.MeshStandardMaterial({
          color: 0x93c5fd,
          roughness: 0.1,
          metalness: 0.5,
          transparent: true,
          opacity: 0.8
        });
        const cafeGlass = new THREE.Mesh(cafeGlassGeo, cafeGlassMat);
        cafeGlass.position.set(0, 1.1, 2.62);
        group.add(cafeGlass);

        // Outdoor dining umbrella & patio tables
        [-2.0, 2.0].forEach((x) => {
          const tableGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.06, 16);
          const tableMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
          const table = new THREE.Mesh(tableGeo, tableMat);
          table.position.set(x, 0.45, 4.0);
          group.add(table);

          const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.6, 8);
          const pole = new THREE.Mesh(poleGeo, tableMat);
          pole.position.set(x, 0.8, 4.0);
          group.add(pole);

          const umbrellaGeo = new THREE.ConeGeometry(1.05, 0.5, 8);
          const umbrellaMat = new THREE.MeshStandardMaterial({ color: x < 0 ? 0xf59e0b : 0x06b6d4 });
          const umbrella = new THREE.Mesh(umbrellaGeo, umbrellaMat);
          umbrella.position.set(x, 1.65, 4.0);
          umbrella.castShadow = true;
          group.add(umbrella);
        });

        // Prominent Cafeteria Signboard
        const sign = this.createSignboardMesh('Cafeteria', 3.0, 0.7);
        sign.position.set(0, 2.55, 2.66);
        group.add(sign);

      } else if (dest.id === 'computer_lab' || dest.id === 'classroom') {
        // --- 3. Computer Lab (Hi-Tech Modern Academic Facility) ---
        const labGeo = new THREE.BoxGeometry(5.8, 3.6, 5.0);
        const labMat = new THREE.MeshStandardMaterial({ color: 0xede8e0, roughness: 0.48 });
        const labMesh = new THREE.Mesh(labGeo, labMat);
        labMesh.position.y = 1.8;
        labMesh.castShadow = true;
        labMesh.receiveShadow = true;
        group.add(labMesh);

        // Dark roof trim
        const roofTrimGeo = new THREE.BoxGeometry(6.0, 0.28, 5.2);
        const roofTrimMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35 });
        const roofTrim = new THREE.Mesh(roofTrimGeo, roofTrimMat);
        roofTrim.position.y = 3.6 + 0.14;
        group.add(roofTrim);

        // Ribbon window bands
        for (let y = 1.1; y < 3.4; y += 1.1) {
          const ribbonGeo = new THREE.BoxGeometry(4.8, 0.65, 0.12);
          const ribbonMat = new THREE.MeshStandardMaterial({
            color: 0x1e3a8a,
            roughness: 0.15,
            metalness: 0.75
          });
          const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
          ribbon.position.set(0, y, 2.52);
          group.add(ribbon);
        }

        // Rooftop antenna / satellite dish
        const dishGeo = new THREE.CylinderGeometry(0.4, 0.05, 0.18, 16);
        const dishMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
        const dish = new THREE.Mesh(dishGeo, dishMat);
        dish.position.set(-1.6, 4.0, 0.5);
        dish.rotation.z = 0.4;
        group.add(dish);

        // Prominent Computer Lab Signboard
        const sign = this.createSignboardMesh('Computer Lab', 3.2, 0.7);
        sign.position.set(0, 3.05, 2.56);
        group.add(sign);

      } else if (dest.id === 'auditorium') {
        // --- 4. Auditorium (Grand Architecture with Canopy Entrance) ---
        const audiGeo = new THREE.BoxGeometry(6.6, 4.0, 5.6);
        const audiMat = new THREE.MeshStandardMaterial({ color: 0xf5efe6, roughness: 0.48 });
        const audiMesh = new THREE.Mesh(audiGeo, audiMat);
        audiMesh.position.y = 2.0;
        audiMesh.castShadow = true;
        audiMesh.receiveShadow = true;
        group.add(audiMesh);

        // Sloped entrance roof canopy
        const canopyGeo = new THREE.BoxGeometry(4.6, 0.22, 2.0);
        const canopyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 });
        const canopy = new THREE.Mesh(canopyGeo, canopyMat);
        canopy.position.set(0, 2.3, 3.6);
        canopy.rotation.x = -0.14;
        canopy.castShadow = true;
        group.add(canopy);

        // Glass entrance doors
        const doorGeo = new THREE.BoxGeometry(3.6, 1.8, 0.1);
        const doorMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, metalness: 0.6 });
        const doors = new THREE.Mesh(doorGeo, doorMat);
        doors.position.set(0, 0.9, 2.82);
        group.add(doors);

        // Prominent Auditorium Signboard
        const sign = this.createSignboardMesh('Auditorium', 3.2, 0.7);
        sign.position.set(0, 2.95, 2.86);
        group.add(sign);

      } else if (dest.id === 'main_gate') {
        // --- 5. Main Gate (Classical Stone Gateway Arch with Signboard) ---
        const pillarMat = new THREE.MeshStandardMaterial({ color: 0xe5ded4, roughness: 0.55 });

        // Left pillar
        const leftPillarGeo = new THREE.BoxGeometry(0.85, 3.0, 0.85);
        const leftPillar = new THREE.Mesh(leftPillarGeo, pillarMat);
        leftPillar.position.set(-1.9, 1.5, 0);
        leftPillar.castShadow = true;
        group.add(leftPillar);

        // Right pillar
        const rightPillarGeo = new THREE.BoxGeometry(0.85, 3.0, 0.85);
        const rightPillar = new THREE.Mesh(rightPillarGeo, pillarMat);
        rightPillar.position.set(1.9, 1.5, 0);
        rightPillar.castShadow = true;
        group.add(rightPillar);

        // Top archway lintel beam
        const lintelGeo = new THREE.BoxGeometry(5.0, 0.65, 0.95);
        const lintel = new THREE.Mesh(lintelGeo, pillarMat);
        lintel.position.set(0, 3.0 + 0.325, 0);
        lintel.castShadow = true;
        group.add(lintel);

        // Decorative black wrought-iron side fences
        const fenceMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85 });
        [-3.4, 3.4].forEach((fx) => {
          const fenceGeo = new THREE.BoxGeometry(2.0, 1.5, 0.08);
          const fence = new THREE.Mesh(fenceGeo, fenceMat);
          fence.position.set(fx, 0.75, 0);
          group.add(fence);
        });

        // Prominent Main Gate Signboard
        const sign = this.createSignboardMesh('Main Gate', 3.0, 0.7);
        sign.position.set(0, 3.35, 0.5);
        group.add(sign);
      }

      // Floating Holographic Beacon Pillar (toggled when destination selected)
      const beaconGeo = new THREE.CylinderGeometry(0.08, 0.7, 14, 16, 1, true);
      const beaconMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.0,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
      beaconMesh.position.y = 7;
      group.add(beaconMesh);
      this.beaconMeshes.set(dest.id, beaconMesh);

      // Target ring on ground
      const ringGeo = new THREE.RingGeometry(1.6, 1.85, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.0,
        side: THREE.DoubleSide
      });
      const targetRing = new THREE.Mesh(ringGeo, ringMat);
      targetRing.rotation.x = -Math.PI / 2;
      targetRing.position.y = 0.04;
      group.add(targetRing);
      beaconMesh.userData.targetRing = targetRing;

      this.scene.add(group);
      this.buildingMeshes.set(dest.id, group);
    });

    // Create 3D Destination Pin (Hovering Green Map Pin matching picture)
    this.destinationPin = this.createDestinationPin();
    this.destinationPin.visible = false;
    this.scene.add(this.destinationPin);
  }

  createDestinationPin() {
    const pinGroup = new THREE.Group();
    pinGroup.name = 'destination_pin';

    const pinMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.3
    });

    // Green sphere head
    const headGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const head = new THREE.Mesh(headGeo, pinMat);
    head.position.y = 0.9;
    pinGroup.add(head);

    // Green downward cone point
    const coneGeo = new THREE.ConeGeometry(0.34, 0.75, 16);
    const cone = new THREE.Mesh(coneGeo, pinMat);
    cone.position.y = 0.42;
    cone.rotation.x = Math.PI;
    pinGroup.add(cone);

    // White center emblem dot
    const dotGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const dot = new THREE.Mesh(dotGeo, dotMat);
    dot.position.set(0, 0.9, 0.32);
    pinGroup.add(dot);

    // Glowing green concentric ground rings
    const ringGeo = new THREE.RingGeometry(0.7, 0.9, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.05;
    pinGroup.add(ring);

    return pinGroup;
  }

  setupSceneryProps() {
    // 1. Lush Deciduous Trees
    const treePositions = [
      { x: -3.8, z: 2.5 },
      { x: 3.8, z: 2.2 },
      { x: -3.5, z: -5.5 },
      { x: 3.5, z: -5.5 },
      { x: -7.5, z: 3.5 },
      { x: -5.5, z: 6.5 },
      { x: 6.5, z: 3.2 },
      { x: 5.2, z: 5.5 },
      { x: -3.2, z: -9.5 },
      { x: 3.2, z: -9.5 }
    ];

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c3d2e, roughness: 0.85 });
    const foliageMatA = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.8 });
    const foliageMatB = new THREE.MeshStandardMaterial({ color: 0x40916c, roughness: 0.8 });
    const foliageMatC = new THREE.MeshStandardMaterial({ color: 0x52b788, roughness: 0.8 });

    treePositions.forEach((pos, idx) => {
      const tree = new THREE.Group();
      tree.position.set(pos.x, 0, pos.z);

      // Trunk
      const trunkGeo = new THREE.CylinderGeometry(0.18, 0.28, 1.8, 8);
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 0.9;
      trunk.castShadow = true;
      tree.add(trunk);

      // Multi-sphere lush foliage clusters
      const mat = idx % 3 === 0 ? foliageMatA : idx % 3 === 1 ? foliageMatB : foliageMatC;
      const sphereA = new THREE.Mesh(new THREE.SphereGeometry(0.9, 12, 12), mat);
      sphereA.position.y = 2.1;
      sphereA.castShadow = true;
      tree.add(sphereA);

      const sphereB = new THREE.Mesh(new THREE.SphereGeometry(0.65, 10, 10), mat);
      sphereB.position.set(0.35, 2.5, 0.2);
      sphereB.castShadow = true;
      tree.add(sphereB);

      const sphereC = new THREE.Mesh(new THREE.SphereGeometry(0.6, 10, 10), mat);
      sphereC.position.set(-0.3, 2.4, -0.25);
      sphereC.castShadow = true;
      tree.add(sphereC);

      this.scene.add(tree);
    });

    // 2. Wooden Park Benches with Dark Iron Frames
    const benchPositions = [
      { x: -2.8, z: -2.2, rot: Math.PI / 4, withPerception: true },
      { x: 2.8, z: -2.2, rot: -Math.PI / 4, withPerception: false },
      { x: -2.8, z: 0.2, rot: Math.PI / 2, withPerception: false },
      { x: 2.8, z: 0.2, rot: -Math.PI / 2, withPerception: false }
    ];

    const benchWoodMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 });
    const benchMetalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });

    benchPositions.forEach((b) => {
      const bench = new THREE.Group();
      bench.position.set(b.x, 0, b.z);
      bench.rotation.y = b.rot;

      // Seat slats
      const seatGeo = new THREE.BoxGeometry(1.2, 0.06, 0.36);
      const seat = new THREE.Mesh(seatGeo, benchWoodMat);
      seat.position.y = 0.32;
      seat.castShadow = true;
      bench.add(seat);

      // Backrest
      const backGeo = new THREE.BoxGeometry(1.2, 0.28, 0.05);
      const back = new THREE.Mesh(backGeo, benchWoodMat);
      back.position.set(0, 0.52, -0.16);
      back.castShadow = true;
      bench.add(back);

      // Metal legs
      [-0.5, 0.5].forEach((lx) => {
        const legGeo = new THREE.BoxGeometry(0.06, 0.32, 0.36);
        const leg = new THREE.Mesh(legGeo, benchMetalMat);
        leg.position.set(lx, 0.16, 0);
        bench.add(leg);
      });

      // AI Perception Bounding Box on Bench (Matches Reference Picture 1!)
      if (b.withPerception) {
        const benchBox = this.createPerceptionBox(1.35, 0.8, 0.65, 0xa855f7, 'Bench');
        benchBox.position.set(0, 0.4, 0);
        bench.add(benchBox);
      }

      this.scene.add(bench);
    });

    // 3. Classic Campus Street Lamp Posts with Warm Lantern Glow
    const lampPositions = [
      { x: -1.6, z: 3.2 },
      { x: 1.6, z: 3.2 },
      { x: -1.6, z: -4.8 },
      { x: 1.6, z: -4.8 },
      { x: -4.8, z: -1.0 },
      { x: 4.8, z: -1.0 }
    ];

    const lampPostMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.3, metalness: 0.8 });
    const lanternMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

    lampPositions.forEach((pos) => {
      const lamp = new THREE.Group();
      lamp.position.set(pos.x, 0, pos.z);

      // Post
      const postGeo = new THREE.CylinderGeometry(0.06, 0.1, 2.2, 8);
      const post = new THREE.Mesh(postGeo, lampPostMat);
      post.position.y = 1.1;
      post.castShadow = true;
      lamp.add(post);

      // Lantern housing
      const lanternGeo = new THREE.BoxGeometry(0.24, 0.3, 0.24);
      const lantern = new THREE.Mesh(lanternGeo, lanternMat);
      lantern.position.y = 2.25;
      lamp.add(lantern);

      this.scene.add(lamp);
    });
  }

  // Heavy-duty wheel with cyan rim ring
  createHeavyDutyWheel(isLeftSide = true) {
    const wheelGroup = new THREE.Group();
    const tireRadius = 0.22;
    const tireWidth = 0.14;

    // Rugged rubber tire
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

    // Chunky treads
    const treadMat = new THREE.MeshStandardMaterial({ color: 0x070b14, roughness: 0.95 });
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const treadGeo = new THREE.BoxGeometry(tireWidth * 0.96, 0.022, 0.04);
      const tread = new THREE.Mesh(treadGeo, treadMat);
      tread.position.set(0, Math.sin(angle) * (tireRadius + 0.005), Math.cos(angle) * (tireRadius + 0.005));
      tread.rotation.x = -angle;
      wheelGroup.add(tread);
    }

    // Metallic rim drum
    const rimGeo = new THREE.CylinderGeometry(tireRadius * 0.74, tireRadius * 0.74, tireWidth * 1.02, 24);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.8 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.z = Math.PI / 2;
    wheelGroup.add(rim);

    // Glowing cyan neon rim ring (Signature feature from picture!)
    const ringGeo = new THREE.RingGeometry(tireRadius * 0.48, tireRadius * 0.66, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.y = Math.PI / 2;
    const outerFaceX = isLeftSide ? -tireWidth / 2 - 0.006 : tireWidth / 2 + 0.006;
    ring.position.x = outerFaceX;
    wheelGroup.add(ring);

    return wheelGroup;
  }

  setupRobot() {
    this.robotGroup = new THREE.Group();
    this.robotGroup.position.set(-5, 0, 5.5);
    this.robotGroup.rotation.y = this.robotTargetHeading;
    this.robotWheels = [];

    // Scale robot to be prominent and clearly visible like in reference image
    this.robotGroup.scale.set(1.3, 1.3, 1.3);

    // 1. Undercarriage Skid Plate
    const skidGeo = new THREE.BoxGeometry(0.72, 0.12, 1.02);
    const skidMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7, metalness: 0.6 });
    const skid = new THREE.Mesh(skidGeo, skidMat);
    skid.position.y = 0.16;
    skid.castShadow = true;
    this.robotGroup.add(skid);

    // 2. White Glossy Body Hull (Curved autonomous rover body)
    const bodyGeo = new THREE.BoxGeometry(0.82, 0.28, 1.05);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.18, metalness: 0.12 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.34;
    body.castShadow = true;
    body.receiveShadow = true;
    this.robotGroup.add(body);

    // Black curved roof deck
    const roofGeo = new THREE.BoxGeometry(0.68, 0.06, 0.88);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.8 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 0.49;
    this.robotGroup.add(roof);

    // 3. Black Glossy Face Visor (Matches Reference Image!)
    const visorGeo = new THREE.BoxGeometry(0.74, 0.22, 0.10);
    const visorMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.1, metalness: 0.85 });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 0.32, 0.52);
    this.robotGroup.add(visor);

    // Glowing Cyan Digital Eyes (Matches Reference Image!)
    const eyeGeo = new THREE.BoxGeometry(0.14, 0.08, 0.02);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
    [-0.18, 0.18].forEach((ex) => {
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(ex, 0.32, 0.575);
      this.robotGroup.add(eye);
    });

    // Front Bumper with Cyan Accent Light
    const bumperGeo = new THREE.BoxGeometry(0.78, 0.06, 0.08);
    const bumperMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
    const bumper = new THREE.Mesh(bumperGeo, bumperMat);
    bumper.position.set(0, 0.18, 0.53);
    this.robotGroup.add(bumper);

    const cyanStripGeo = new THREE.BoxGeometry(0.70, 0.02, 0.02);
    const cyanStripMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
    const cyanStrip = new THREE.Mesh(cyanStripGeo, cyanStripMat);
    cyanStrip.position.set(0, 0.18, 0.575);
    this.robotGroup.add(cyanStrip);

    // 4. Sensor Turret Base with Continuously Spinning LiDAR Puck
    const turretBaseGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.16, 24);
    const turretBaseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.8 });
    const turretBase = new THREE.Mesh(turretBaseGeo, turretBaseMat);
    turretBase.position.y = 0.56;
    turretBase.castShadow = true;
    this.robotGroup.add(turretBase);

    // Rotating LiDAR puck with top cap and sensor band
    const puckGroup = new THREE.Group();
    puckGroup.position.y = 0.68;

    const puckGeo = new THREE.CylinderGeometry(0.20, 0.20, 0.14, 24);
    const puckMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.25, metalness: 0.9 });
    const puck = new THREE.Mesh(puckGeo, puckMat);
    puckGroup.add(puck);

    const capGeo = new THREE.CylinderGeometry(0.21, 0.21, 0.03, 24);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 0.08;
    puckGroup.add(cap);

    const sensorGeo = new THREE.BoxGeometry(0.06, 0.06, 0.12);
    const sensorMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
    const sensor = new THREE.Mesh(sensorGeo, sensorMat);
    sensor.position.set(0, 0, 0.16);
    puckGroup.add(sensor);

    this.lidarPuck = puckGroup;
    this.robotGroup.add(this.lidarPuck);

    // Optical camera lens
    const lensGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.08, 16);
    const lensMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.1 });
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.rotation.x = Math.PI / 2;
    lens.position.set(0, 0.48, 0.54);
    this.robotGroup.add(lens);

    // 5. Forward POV Camera (Used for Camera View HUD card & cockpit view)
    this.povCamera = new THREE.PerspectiveCamera(65, 16 / 9, 0.1, 120);
    this.povCamera.position.set(0, 0.56, 0.48);
    this.povCamera.rotation.set(0.06, Math.PI, 0); // Looking forward along +Z with slight down-pitch towards ground
    this.robotGroup.add(this.povCamera);

    // 6. Mount 4 Heavy-Duty Wheels with Signature Glowing Cyan Rims
    const wheelPositions = [
      { x: -0.46, y: 0.22, z: 0.36, isLeft: true },
      { x: 0.46, y: 0.22, z: 0.36, isLeft: false },
      { x: -0.46, y: 0.22, z: -0.36, isLeft: true },
      { x: 0.46, y: 0.22, z: -0.36, isLeft: false }
    ];

    wheelPositions.forEach((wp) => {
      const wheel = this.createHeavyDutyWheel(wp.isLeft);
      wheel.position.set(wp.x, wp.y, wp.z);
      this.robotGroup.add(wheel);
      this.robotWheels.push(wheel);
    });

    this.scene.add(this.robotGroup);
  }

  setupHoverPreview() {
    const group = new THREE.Group();
    const ringGeo = new THREE.RingGeometry(0.6, 0.75, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.65, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.05;
    group.add(ring);
    group.visible = false;
    this.hoverPreviewMesh = group;
    this.scene.add(this.hoverPreviewMesh);
  }

  createObstacleAlertBadge() {
    const canvas = document.createElement('canvas');
    canvas.width = 384;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');

    // Red rounded pill background
    ctx.fillStyle = 'rgba(220, 38, 38, 0.94)';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(8, 8, 368, 80, 20);
    } else {
      ctx.rect(8, 8, 368, 80);
    }
    ctx.fill();
    ctx.stroke();

    // Text & Warning Symbol
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚠ Obstacle Detected', 192, 48);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(2.4, 0.6, 1);
    sprite.name = 'alert_badge';
    return sprite;
  }

  createObstacleMesh(obs) {
    const group = new THREE.Group();
    const worldX = obs.world ? obs.world.x : (obs.grid.x - 10);
    const worldZ = obs.world ? obs.world.z : (obs.grid.y - 10);
    group.position.set(worldX, 0, worldZ);
    group.userData = { id: obs.id, isObstacle: true };

    const redBarricadeMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626, // Safety Red
      roughness: 0.35,
      metalness: 0.1
    });

    // Dual Interlocking Red Plastic Highway Jersey Barriers (Matches Picture!)
    [-0.52, 0.52].forEach((offsetX) => {
      const barrierGroup = new THREE.Group();
      barrierGroup.position.x = offsetX;

      // Base Foot
      const footGeo = new THREE.BoxGeometry(0.95, 0.18, 0.48);
      const foot = new THREE.Mesh(footGeo, redBarricadeMat);
      foot.position.y = 0.09;
      foot.castShadow = true;
      foot.receiveShadow = true;
      barrierGroup.add(foot);

      // Sloped Body
      const bodyGeo = new THREE.BoxGeometry(0.92, 0.44, 0.30);
      const body = new THREE.Mesh(bodyGeo, redBarricadeMat);
      body.position.y = 0.18 + 0.22;
      body.castShadow = true;
      barrierGroup.add(body);

      // Top Ribbed Handle
      const topGeo = new THREE.BoxGeometry(0.90, 0.12, 0.18);
      const top = new THREE.Mesh(topGeo, redBarricadeMat);
      top.position.y = 0.62 + 0.06;
      top.castShadow = true;
      barrierGroup.add(top);

      // White reflective safety bands
      const stripeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      [-0.24, 0.24].forEach((sx) => {
        const stripeGeo = new THREE.BoxGeometry(0.12, 0.32, 0.31);
        const stripe = new THREE.Mesh(stripeGeo, stripeMat);
        stripe.position.set(sx, 0.4, 0);
        barrierGroup.add(stripe);
      });

      group.add(barrierGroup);
    });

    // 3D Floating "Obstacle Detected" triangular alert badge directly above barrier
    const alertBadge = this.createObstacleAlertBadge();
    alertBadge.position.set(0, 1.65, 0);
    group.add(alertBadge);

    return group;
  }

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
        const worldX = obs.world ? obs.world.x : (obs.grid.x - 10);
        const worldZ = obs.world ? obs.world.z : (obs.grid.y - 10);
        existing.position.set(worldX, 0, worldZ);
      }
    });
  }

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

    // Clear chevron arrows
    while (this.pathChevronsGroup.children.length > 0) {
      const child = this.pathChevronsGroup.children[0];
      this.pathChevronsGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    }

    if (!route || route.length < 2) return;

    // 3D waypoints
    const points = route.map(wp => {
      const gx = wp.grid ? wp.grid.x : (wp.x || 10);
      const gy = wp.grid ? wp.grid.y : (wp.y || 10);
      return new THREE.Vector3(gx - 10, 0.12, gy - 10);
    });

    // Spline curve
    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeo = new THREE.TubeGeometry(curve, Math.max(16, points.length * 8), 0.14, 12, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x00f2fe,
      emissive: 0x00f2fe,
      emissiveIntensity: 0.85,
      roughness: 0.15,
      metalness: 0.3
    });

    this.pathLineMesh = new THREE.Mesh(tubeGeo, tubeMat);
    this.scene.add(this.pathLineMesh);

    // Glowing directional chevron arrows along the curve
    const chevronCount = Math.max(4, Math.floor(points.length * 1.5));
    const arrowMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    for (let i = 1; i <= chevronCount; i++) {
      const t = i / (chevronCount + 1);
      const pos = curve.getPoint(t);
      const tangent = curve.getTangent(t);

      const arrowGeo = new THREE.ConeGeometry(0.12, 0.28, 3);
      const arrow = new THREE.Mesh(arrowGeo, arrowMat);
      arrow.position.set(pos.x, 0.18, pos.z);

      const lookTarget = pos.clone().add(tangent);
      arrow.lookAt(lookTarget);
      arrow.rotateX(Math.PI / 2);
      this.pathChevronsGroup.add(arrow);
    }
  }

  updateRobotPose(robotPosition) {
    if (!robotPosition) return;
    const wx = robotPosition.world ? robotPosition.world.x : (robotPosition.grid.x - 10);
    const wz = robotPosition.world ? robotPosition.world.z : (robotPosition.grid.y - 10);
    this.robotTargetPos.set(wx, 0, wz);

    if (typeof robotPosition.heading === 'number') {
      this.robotTargetHeading = THREE.MathUtils.degToRad(-robotPosition.heading + 180);
    }
  }

  updateDestination(destination) {
    this.currentDestination = destination;

    // Toggle destination beacons
    this.beaconMeshes.forEach((beacon, id) => {
      const isActive = destination && (destination.id === id || (id === 'computer_lab' && destination.id === 'classroom'));
      beacon.material.opacity = isActive ? 0.5 : 0.0;
      if (beacon.userData.targetRing) {
        beacon.userData.targetRing.material.opacity = isActive ? 0.9 : 0.0;
      }
    });

    // Position destination 3D pin marker above destination building entrance
    if (this.destinationPin) {
      if (destination) {
        this.destinationPin.visible = true;
        this.destinationPin.position.set(destination.worldPos.x, 0, destination.worldPos.z + 1.2);
      } else {
        this.destinationPin.visible = false;
      }
    }
  }

  setCameraMode(mode) {
    this.cameraMode = mode;
    if (mode === 'grid') {
      this.controls.enableRotate = false;
      this.controls.target.set(0, 0, -1);
      this.isTransitioningCamera = false;
    } else if (mode === 'follow') {
      this.controls.enableRotate = false;
      this.isTransitioningCamera = false;
    } else if (mode === 'pov' || mode === 'camera') {
      this.controls.enableRotate = false;
      this.isTransitioningCamera = false;
    } else {
      this.controls.enableRotate = true;
      this.isTransitioningCamera = true;
      this.perspectiveTargetPos = new THREE.Vector3(-11, 17, 21);
      this.perspectiveTargetLook = new THREE.Vector3(0, 0, -1);
    }
  }

  attachPovCanvas(canvas) {
    if (!canvas) {
      if (this.povRenderer) {
        this.povRenderer.dispose();
        this.povRenderer = null;
      }
      this.povCanvas = null;
      return;
    }
    this.povCanvas = canvas;
    try {
      if (this.povRenderer) {
        this.povRenderer.dispose();
      }
      this.povRenderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance'
      });
      const width = canvas.clientWidth || 280;
      const height = canvas.clientHeight || 155;
      this.povRenderer.setSize(width, height, false);
      this.povRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.povRenderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.povRenderer.toneMappingExposure = 1.15;

      if (this.povCamera) {
        this.povCamera.aspect = width / height;
        this.povCamera.updateProjectionMatrix();
      }
    } catch (e) {
      console.warn('Could not attach POV canvas to ThreeEngine:', e);
    }
  }

  setShowGrid(show) {
    this.showGrid = Boolean(show);
    if (this.gridHelper) {
      this.gridHelper.visible = this.showGrid;
    }
  }

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    if (!width || !height || width <= 0 || height <= 0) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);

    if (this.povCanvas && this.povRenderer && this.povCamera) {
      const pWidth = this.povCanvas.clientWidth || 280;
      const pHeight = this.povCanvas.clientHeight || 155;
      if (pWidth > 0 && pHeight > 0) {
        this.povCamera.aspect = pWidth / pHeight;
        this.povCamera.updateProjectionMatrix();
        this.povRenderer.setSize(pWidth, pHeight, false);
      }
    }
  }

  onPointerMove(e) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects([this.groundMesh], false);

    if (intersects.length > 0) {
      this.isHoveringGround = true;
      const pt = intersects[0].point;
      const gx = Math.min(19, Math.max(1, Math.round(pt.x + 10)));
      const gy = Math.min(19, Math.max(1, Math.round(pt.z + 10)));
      this.hoveredGrid = { x: gx, y: gy };

      if (this.hoverPreviewMesh) {
        this.hoverPreviewMesh.position.set(gx - 10, 0, gy - 10);
        this.hoverPreviewMesh.visible = true;
      }
    } else {
      this.isHoveringGround = false;
      if (this.hoverPreviewMesh) this.hoverPreviewMesh.visible = false;
    }
  }

  onPointerDown(e) {
    if (e.button !== 0) return;
    this.pointerDownPos = { x: e.clientX, y: e.clientY };
  }

  onPointerUp(e) {
    if (e.button !== 0 || !this.pointerDownPos) return;
    const dist = Math.hypot(e.clientX - this.pointerDownPos.x, e.clientY - this.pointerDownPos.y);
    this.pointerDownPos = null;

    // Distinguish clicks from camera orbit drags (threshold < 6px)
    if (dist > 6) return;

    if (!this.renderer || !this.camera) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    const clickMouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    this.raycaster.setFromCamera(clickMouse, this.camera);

    // 1. Raycast against existing obstacles to remove on click
    const obstacleList = Array.from(this.obstacleMeshes.values());
    if (obstacleList.length > 0) {
      const obstacleIntersects = this.raycaster.intersectObjects(obstacleList, true);
      if (obstacleIntersects.length > 0) {
        let target = obstacleIntersects[0].object;
        while (target && target.parent && !target.userData?.isObstacle) {
          target = target.parent;
        }
        if (target && target.userData?.id) {
          if (this.callbacks.onRemoveObstacle) {
            this.callbacks.onRemoveObstacle(target.userData.id);
            return;
          }
        }
      }
    }

    // 2. Otherwise add obstacle on ground click
    if (this.isHoveringGround && this.callbacks.onAddObstacleAtClick) {
      this.callbacks.onAddObstacleAtClick({
        id: `obs-${Date.now()}`,
        grid: { ...this.hoveredGrid },
        world: { x: this.hoveredGrid.x - 10, y: 0, z: this.hoveredGrid.y - 10 },
        label: `Barricade [${this.hoveredGrid.x},${this.hoveredGrid.y}]`
      });
    }
  }

  onPointerLeave() {
    this.isHoveringGround = false;
    if (this.hoverPreviewMesh) this.hoverPreviewMesh.visible = false;
  }

  animate() {
    this.animationFrameId = requestAnimationFrame(this.animate);
    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Robot position and rotation interpolation
    if (this.robotGroup) {
      this.robotGroup.position.lerp(this.robotTargetPos, 0.12);

      let angleDiff = this.robotTargetHeading - this.robotGroup.rotation.y;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      this.robotGroup.rotation.y += angleDiff * 0.12;

      // Spin LiDAR
      if (this.lidarPuck) {
        this.lidarPuck.rotation.y += delta * 12.0;
      }

      // Spin Wheels during movement (forward rotation)
      if (this.robotWheels && this.robotWheels.length > 0) {
        const isMoving = this.status === 'moving' || this.status === 'avoiding_obstacle';
        if (isMoving) {
          const wheelSpin = delta * 10.0;
          this.robotWheels.forEach((wheel) => {
            wheel.rotation.x += wheelSpin;
          });
        }
      }
    }

    // 2. Animate Water Fountain Spray Particles & Water Surface Ripples
    if (this.fountainParticles.length > 0) {
      this.fountainParticles.forEach((p) => {
        p.userData.progress += delta * p.userData.speed;
        if (p.userData.progress > 1.0) p.userData.progress = 0;

        const t = p.userData.progress;
        // Parabolic arc: rise then fall
        const y = 1.95 + Math.sin(t * Math.PI) * 1.1;
        const r = t * p.userData.radiusMax;
        const x = Math.cos(p.userData.angle) * r;
        const z = Math.sin(p.userData.angle) * r;
        p.position.set(x, y, z);
      });
    }

    if (this.fountainWater) {
      const ripple = 1.0 + Math.sin(elapsedTime * 3.0) * 0.015;
      this.fountainWater.scale.set(ripple, ripple, 1);
    }

    // 3. Animate Obstacle Alert Badges
    this.obstacleMeshes.forEach((mesh) => {
      const badge = mesh.getObjectByName('alert_badge');
      if (badge) {
        badge.position.y = 1.65 + Math.sin(elapsedTime * 4.0) * 0.08;
      }
    });

    // 4. Animate Destination Pin bobbing (kept safely above terrain y >= 0.35m)
    if (this.destinationPin && this.destinationPin.visible) {
      this.destinationPin.position.y = 0.35 + Math.abs(Math.sin(elapsedTime * 3.5)) * 0.25;
    }

    // 5. Camera mode handling
    if (this.cameraMode === 'grid') {
      this.camera.position.lerp(new THREE.Vector3(0, 32, -1.001), 0.08);
      this.controls.target.lerp(new THREE.Vector3(0, 0, -1), 0.08);
    } else if (this.cameraMode === 'follow' && this.robotGroup) {
      const heading = this.robotGroup.rotation.y;
      const behindDist = 5.2;
      const height = 3.0;
      const behindX = this.robotGroup.position.x - Math.sin(heading) * behindDist;
      const behindZ = this.robotGroup.position.z - Math.cos(heading) * behindDist;
      this.camera.position.lerp(new THREE.Vector3(behindX, height, behindZ), 0.12);
      this.controls.target.lerp(this.robotGroup.position.clone().add(new THREE.Vector3(0, 0.45, 0)), 0.15);
    } else if ((this.cameraMode === 'pov' || this.cameraMode === 'camera') && this.robotGroup) {
      const heading = this.robotGroup.rotation.y;
      const eyePos = this.robotGroup.position.clone().add(new THREE.Vector3(0, 0.65, 0.35));
      const lookDist = 12.0;
      const lookTarget = new THREE.Vector3(
        eyePos.x + Math.sin(heading) * lookDist,
        eyePos.y - 0.25,
        eyePos.z + Math.cos(heading) * lookDist
      );
      this.camera.position.lerp(eyePos, 0.2);
      this.controls.target.lerp(lookTarget, 0.25);
    } else if (this.isTransitioningCamera) {
      this.camera.position.lerp(this.perspectiveTargetPos, 0.08);
      this.controls.target.lerp(this.perspectiveTargetLook, 0.08);
      if (
        this.camera.position.distanceTo(this.perspectiveTargetPos) < 0.25 &&
        this.controls.target.distanceTo(this.perspectiveTargetLook) < 0.25
      ) {
        this.isTransitioningCamera = false;
      }
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);

    // 6. Render live onboard POV camera feed for Camera View HUD card
    if (this.povRenderer && this.povCamera && this.scene) {
      this.povRenderer.render(this.scene, this.povCamera);
    }
  }

  attachDelegate() {
    simulationController.attachEngine(this);
  }

  onDestinationSelected(destination) {
    this.updateDestination(destination);
  }

  addObstacle(obstacle) {
    if (simulationController.state.status === 'moving' && simulationController.state.currentDestination) {
      simulationController.checkObstacleCollisionAndReplan(obstacle);
    }
  }

  removeObstacle(id) {
    if (simulationController.state.status === 'moving' && simulationController.state.currentDestination) {
      const newRoute = simulationController.generatePath(
        simulationController.state.robotPosition.grid,
        simulationController.state.currentDestination.gridPos,
        simulationController.state.obstacles
      );
      if (newRoute) simulationController.setState({ activeRoute: newRoute });
    }
  }

  clearObstacles() {
    if (simulationController.state.status === 'moving' && simulationController.state.currentDestination) {
      const newRoute = simulationController.generatePath(
        simulationController.state.robotPosition.grid,
        simulationController.state.currentDestination.gridPos,
        []
      );
      if (newRoute) simulationController.setState({ activeRoute: newRoute });
    }
  }

  resetSimulation() {
    this.updateDestination(null);
    this.syncObstacles([]);
    this.robotTargetPos.set(-5, 0, 5.5);
    this.robotTargetHeading = THREE.MathUtils.degToRad(-45 + 180);
    if (this.robotGroup) {
      this.robotGroup.position.set(-5, 0, 5.5);
      this.robotGroup.rotation.y = this.robotTargetHeading;
    }
    this.syncRoute([], 'idle');
  }

  pauseNavigation() {}
  resumeNavigation() {}
  setSpeed() {}

  dispose() {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener('resize', this.boundOnResize);
    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.removeEventListener('pointermove', this.boundOnPointerMove);
      this.renderer.domElement.removeEventListener('pointerdown', this.boundOnPointerDown);
      this.renderer.domElement.removeEventListener('pointerup', this.boundOnPointerUp);
      this.renderer.domElement.removeEventListener('pointerleave', this.boundOnPointerLeave);
      if (this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
      this.renderer.dispose();
    }
    if (this.controls) this.controls.dispose();

    if (this.povRenderer) {
      this.povRenderer.dispose();
      this.povRenderer = null;
    }
    this.povCanvas = null;

    // Detach from simulation controller (Bug 2.8 fix)
    simulationController.detachEngine(this);

    // Free scene geometries, materials, and textures from GPU
    if (this.scene) {
      this.scene.traverse((child) => {
        if (child.geometry) {
          child.geometry.dispose();
        }
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              if (mat.map) mat.map.dispose();
              mat.dispose();
            });
          } else {
            if (child.material.map) child.material.map.dispose();
            child.material.dispose();
          }
        }
      });
      while (this.scene.children.length > 0) {
        this.scene.remove(this.scene.children[0]);
      }
    }
  }
}

export default ThreeEngine;
