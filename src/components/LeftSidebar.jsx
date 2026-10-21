import React from 'react';
import { 
  Home, 
  MapPin, 
  Play, 
  Box, 
  Mic, 
  Video, 
  Settings 
} from 'lucide-react';

export function LeftSidebar({
  activeTab = 'map',
  onSelectTab,
  onOpenDestinations,
  onStartNavigation,
  onToggleVoice
}) {
  const menuItems = [
    { id: 'map', label: 'Campus Map', icon: Home },
    { id: 'destinations', label: 'Select Destination', icon: MapPin },
    { id: 'start', label: 'Start Navigation', icon: Play },
    { id: 'simulation', label: 'Live Simulation', icon: Box },
    { id: 'voice', label: 'Voice Assistant', icon: Mic },
    { id: 'camera', label: 'Camera View', icon: Video },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleClick = (id) => {
    if (id === 'destinations' && onOpenDestinations) {
      onOpenDestinations();
    } else if (id === 'start' && onStartNavigation) {
      onStartNavigation();
    } else if (id === 'voice' && onToggleVoice) {
      onToggleVoice();
    }
    if (onSelectTab) onSelectTab(id);
  };

  return (
    <div className="left-sidebar-stack">
      {/* Brand Card (Matches Picture!) */}
      <div className="hud-card brand-card">
        <div className="flex items-center gap-3">
          <div className="brand-disc-icon">
            <div className="disc-inner-dot" />
          </div>
          <div>
            <h1 className="brand-main-title">NaviAI</h1>
            <p className="brand-sub-title">Vision-Based Autonomous Robot</p>
            <p className="brand-action-tags">See · Plan · Navigate · Guide</p>
          </div>
        </div>
      </div>

      {/* Vertical Navigation Menu Card */}
      <div className="hud-card nav-menu-card">
        <ul className="nav-menu-list">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={`nav-menu-btn ${isActive ? 'active' : ''}`}
                  onClick={() => handleClick(item.id)}
                >
                  <Icon size={16} className="nav-menu-icon" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default LeftSidebar;
