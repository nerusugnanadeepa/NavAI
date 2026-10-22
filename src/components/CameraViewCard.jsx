import React, { useEffect, useRef } from 'react';
import { Video, ShieldAlert } from 'lucide-react';
import { simulationController } from '../simulation/simulationController';

export function CameraViewCard({ isObstacleDetected, currentDestination }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    let attached = false;
    const tryAttach = () => {
      const engine = simulationController.engineDelegate;
      if (engine && canvas && !attached) {
        engine.attachPovCanvas(canvas);
        attached = true;
      }
    };

    tryAttach();
    const interval = setInterval(() => {
      if (!attached) {
        tryAttach();
      } else {
        clearInterval(interval);
      }
    }, 200);

    return () => {
      clearInterval(interval);
      if (attached && simulationController.engineDelegate && canvas) {
        if (typeof simulationController.engineDelegate.detachPovCanvas === 'function') {
          simulationController.engineDelegate.detachPovCanvas(canvas);
        }
      }
    };
  }, []);

  return (
    <div className="hud-card camera-view-card">
      <div className="hud-card-header">
        <span className="hud-card-title flex items-center gap-1.5">
          <Video size={13} className="text-cyan-400" />
          Camera View <span className="text-xs text-slate-400 font-normal">(Robot POV)</span>
        </span>
        <span className="live-rec-pill">
          <span className="rec-dot animate-pulse" /> LIVE
        </span>
      </div>

      <div className="camera-view-viewport">
        {/* Real-time 3D Forward Robot Onboard Camera Canvas */}
        <canvas
          ref={canvasRef}
          className="camera-live-canvas"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'block',
            objectFit: 'cover',
            zIndex: 1
          }}
        />

        {/* AI Object Detection Bounding Box Overlay tracking detected obstacles */}
        {isObstacleDetected ? (
          <div className="camera-obstacle-wrapper" style={{ zIndex: 2, pointerEvents: 'none' }}>
            <div className="camera-jersey-barrier">
              <div className="barrier-stripe" />
              <div className="barrier-stripe" />
            </div>

            <div className="ai-bounding-box animate-pulse">
              <div className="ai-box-label">
                <ShieldAlert size={11} className="inline mr-1" />
                Obstacle Detected
              </div>
            </div>
          </div>
        ) : (
          <div className="camera-clear-status" style={{ zIndex: 2, pointerEvents: 'none' }}>
            <span className="clear-pill">Path Clear · Autonomous Drive</span>
          </div>
        )}

        {/* AI HUD Overlay Corner Reticles */}
        <div className="camera-reticle top-left" style={{ zIndex: 3 }} />
        <div className="camera-reticle top-right" style={{ zIndex: 3 }} />
        <div className="camera-reticle bottom-left" style={{ zIndex: 3 }} />
        <div className="camera-reticle bottom-right" style={{ zIndex: 3 }} />

        <div className="camera-meta-bar" style={{ zIndex: 3 }}>
          <span className="font-mono text-[10px] text-cyan-400">FPS: 60 · RGB-D · 1080p</span>
          <span className="font-mono text-[10px] text-emerald-400">CONF: 98.4%</span>
        </div>
      </div>
    </div>
  );
}

export default CameraViewCard;
