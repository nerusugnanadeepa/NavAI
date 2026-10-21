import React from 'react';
import { Video, ShieldAlert, Sparkles } from 'lucide-react';

export function CameraViewCard({ isObstacleDetected, currentDestination }) {
  return (
    <div className="hud-card camera-view-card">
      <div className="hud-card-header">
        <span className="hud-card-title flex items-center gap-1.5">
          Camera View <span className="text-xs text-slate-400 font-normal">(Object Detection)</span>
        </span>
        <span className="live-rec-pill">
          <span className="rec-dot animate-pulse" /> LIVE
        </span>
      </div>

      <div className="camera-view-viewport">
        {/* Realistic rendered daytime forward camera view of campus pathway */}
        <div className="camera-scene-bg">
          {/* Distant trees & sky */}
          <div className="camera-sky" />
          
          {/* Campus pavement & pathway */}
          <div className="camera-pathway" />

          {/* Park benches & trees on side */}
          <div className="camera-side-bench" />
          <div className="camera-side-foliage" />

          {/* Red Road Barricade Obstacle directly in view */}
          <div className="camera-obstacle-wrapper">
            <div className="camera-jersey-barrier">
              <div className="barrier-stripe" />
              <div className="barrier-stripe" />
            </div>

            {/* AI Object Detection Bounding Box (Matches Reference Picture!) */}
            <div className="ai-bounding-box animate-pulse">
              <div className="ai-box-label">
                <ShieldAlert size={11} className="inline mr-1" />
                Obstacle
              </div>
            </div>
          </div>
        </div>

        {/* AI HUD Overlay Corner Reticles */}
        <div className="camera-reticle top-left" />
        <div className="camera-reticle top-right" />
        <div className="camera-reticle bottom-left" />
        <div className="camera-reticle bottom-right" />

        <div className="camera-meta-bar">
          <span className="font-mono text-[10px] text-cyan-400">FPS: 60 · RGB-D · 1080p</span>
          <span className="font-mono text-[10px] text-emerald-400">CONF: 98.4%</span>
        </div>
      </div>
    </div>
  );
}

export default CameraViewCard;
