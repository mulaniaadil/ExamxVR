import React from 'react';
import { CameraMode } from '../types';
import {
  Video,
  User,
  Eye,
  Map as MapIcon,
  Volume2,
  VolumeX,
  Sparkles,
  Activity,
  Maximize2
} from 'lucide-react';

interface NavigationHeaderProps {
  cameraMode: CameraMode;
  setCameraMode: (mode: CameraMode) => void;
  showStressFactors: boolean;
  setShowStressFactors: (show: boolean) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  onOpenWorkSystem: () => void;
  onOpenMap: () => void;
  onApplyScenario: (scenario: 'normal' | 'moderate' | 'high') => void;
  currentScenario: 'normal' | 'moderate' | 'high' | 'custom';
  demandScore: number;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  cameraMode,
  setCameraMode,
  showStressFactors,
  setShowStressFactors,
  isMuted,
  setIsMuted,
  onOpenWorkSystem,
  onOpenMap,
  onApplyScenario,
  currentScenario,
  demandScore
}) => {
  const getDemandColor = (score: number) => {
    if (score < 34) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    if (score < 67) return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    return 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse';
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
      {/* Title and Lab Badge */}
      <div className="flex items-center gap-3 bg-slate-900/85 backdrop-blur-md border border-slate-700/60 px-4 py-2 rounded-xl shadow-xl pointer-events-auto">
        <div className="w-9 h-9 rounded-lg bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400 font-bold text-lg">
          VR
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-white font-semibold tracking-wide text-sm md:text-base">
              ExamHall VR
            </h1>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/50 font-medium">
              Work System Design Lab
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            Tiered Lecture Hall • Examination Stress Simulation
          </p>
        </div>

        {/* Demand Score Indicator */}
        <div className={`ml-2 px-2.5 py-1 rounded-lg border text-xs font-mono font-medium flex items-center gap-1.5 ${getDemandColor(demandScore)}`}>
          <span className="w-2 h-2 rounded-full bg-current" />
          <span className="hidden md:inline">DEMAND:</span>
          <span>{demandScore}/100</span>
        </div>
      </div>

      {/* Center Controls: Camera Modes & Presets */}
      <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md border border-slate-700/60 p-1.5 rounded-xl shadow-xl pointer-events-auto">
        {/* Camera Modes */}
        <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/50">
          <button
            onClick={() => setCameraMode('cinematic')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              cameraMode === 'cinematic'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
            title="Cinematic Wide Overview"
          >
            <Video className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cinematic</span>
          </button>

          <button
            onClick={() => setCameraMode('participant')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              cameraMode === 'participant'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
            title="Participant First-Person Perspective (Middle Row Seat)"
          >
            <User className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Participant</span>
          </button>

          <button
            onClick={() => setCameraMode('observer')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              cameraMode === 'observer'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
            title="Third-person Orbit View"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Observer</span>
          </button>

          <button
            onClick={() => setCameraMode('topdown')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              cameraMode === 'topdown'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
            title="Top-Down System View"
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">System Map</span>
          </button>
        </div>

        {/* Preset Scenarios Buttons */}
        <div className="hidden lg:flex items-center gap-1 pl-1 border-l border-slate-700/60">
          <button
            onClick={() => onApplyScenario('normal')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              currentScenario === 'normal'
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Normal
          </button>
          <button
            onClick={() => onApplyScenario('moderate')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              currentScenario === 'moderate'
                ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Moderate
          </button>
          <button
            onClick={() => onApplyScenario('high')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              currentScenario === 'high'
                ? 'bg-rose-600/30 text-rose-300 border border-rose-500/50'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            High Pressure
          </button>
        </div>
      </div>

      {/* Right Action Tools: Stress Visualizer, Work System, Audio, Fullscreen */}
      <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md border border-slate-700/60 p-1.5 rounded-xl shadow-xl pointer-events-auto">
        <button
          onClick={() => setShowStressFactors(!showStressFactors)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            showStressFactors
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 border border-purple-400/40'
              : 'text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/70 border border-slate-700/50'
          }`}
          title="Toggle 3D Stress Factors & Influence Radii"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Stress Overlay</span>
        </button>

        <button
          onClick={onOpenWorkSystem}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-500/40 transition-all"
          title="Open Human-Centered Work System Analysis"
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Work System</span>
        </button>

        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`p-1.5 rounded-lg text-xs transition-all ${
            isMuted ? 'text-slate-400 hover:text-slate-200' : 'text-blue-400 bg-blue-950/60 border border-blue-800/50'
          }`}
          title={isMuted ? 'Unmute Ambient Sound' : 'Mute Ambient Sound'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition-all hidden sm:block"
          title="Toggle Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
