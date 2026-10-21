import React from 'react';
import { 
  Bot, 
  Play, 
  MapPin, 
  AlertTriangle, 
  Volume2, 
  Compass, 
  CheckCircle,
  X
} from 'lucide-react';

export function WelcomeModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="glass-panel-elevated max-w-lg w-full p-6 relative border border-cyan-500/40 animate-float">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white-soft p-1"
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border border-cyan-500/60 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/20">
            <Bot size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-white-soft">
              Welcome to Navi<span className="text-cyan-400">AI</span>
            </h2>
            <p className="text-xs text-slate-400">Your Voice. Your Vision. Your Way.</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed mb-4">
          NaviAI is an autonomous navigation demonstration designed to prove collision-free path planning, real-time dynamic obstacle replanning, and voice-assisted interaction for a virtual robot.
        </p>

        <div className="space-y-2 mb-6 text-xs text-slate-300">
          <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-700/50">
            <MapPin size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <span><strong>1. Select Destination:</strong> Choose Library, Classroom, Cafeteria, or Main Gate.</span>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-700/50">
            <Compass size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
            <span><strong>2. Autonomous Motion:</strong> Watch A* compute a path and the robot traverse waypoints.</span>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-700/50">
            <AlertTriangle size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
            <span><strong>3. Obstacle Replanning:</strong> Click <em>+ Add Obstacle</em> to trigger real-time route replanning.</span>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-700/50">
            <Volume2 size={16} className="text-purple-400 mt-0.5 flex-shrink-0" />
            <span><strong>4. Voice Guidance:</strong> Spoken audio announcements and speech-to-text control.</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
          <span className="text-xs text-slate-400">
            Hackathon prototype demonstration
          </span>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onClose}
          >
            <Play size={16} />
            <span>Open Simulation</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default WelcomeModal;
