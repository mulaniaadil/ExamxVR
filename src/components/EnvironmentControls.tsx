import React, { useState } from 'react';
import { SimulationSettings } from '../types';
import {
  Clock,
  Volume2,
  Users,
  ShieldAlert,
  GraduationCap,
  Sun,
  Fan,
  ChevronRight,
  ChevronLeft,
  Send,
  Sliders
} from 'lucide-react';

interface EnvironmentControlsProps {
  settings: SimulationSettings;
  onChange: (key: keyof SimulationSettings, value: number) => void;
  onTriggerSubmission: () => void;
  onApplyScenario: (scenario: 'normal' | 'moderate' | 'high') => void;
  currentScenario: string;
}

export const EnvironmentControls: React.FC<EnvironmentControlsProps> = ({
  settings,
  onChange,
  onTriggerSubmission,
  onApplyScenario,
  currentScenario
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`fixed top-18 right-3 z-20 transition-all duration-300 ${
        isCollapsed ? 'translate-x-[calc(100%-2.5rem)]' : 'translate-x-0'
      }`}
    >
      <div className="flex items-start">
        {/* Collapse toggle tab */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="mt-3 bg-slate-900/90 text-slate-300 hover:text-white border border-slate-700/60 p-2 rounded-l-xl shadow-xl backdrop-blur-md transition-colors"
          title={isCollapsed ? 'Expand Controls' : 'Collapse Controls'}
        >
          {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {/* Panel Content */}
        <div className="w-80 md:w-88 max-h-[calc(100vh-6rem)] overflow-y-auto bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-2xl p-4 shadow-2xl space-y-4 text-slate-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-2.5">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <h2 className="font-semibold text-sm tracking-wide text-white">
                ENVIRONMENT CONTROLS
              </h2>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/40">
              Interactive
            </span>
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Simulation Presets
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => onApplyScenario('normal')}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all ${
                  currentScenario === 'normal'
                    ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-700/60'
                }`}
              >
                Normal
              </button>
              <button
                onClick={() => onApplyScenario('moderate')}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all ${
                  currentScenario === 'moderate'
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-700/60'
                }`}
              >
                Moderate
              </button>
              <button
                onClick={() => onApplyScenario('high')}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all ${
                  currentScenario === 'high'
                    ? 'bg-rose-500/20 border-rose-500/60 text-rose-300'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-700/60'
                }`}
              >
                High Press.
              </button>
            </div>
          </div>

          {/* Slider 1: Time Pressure */}
          <div className="space-y-1 bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/40">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-slate-200">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                Time Pressure
              </span>
              <span className={`font-mono text-[11px] font-semibold ${
                settings.timePressure > 65 ? 'text-rose-400' : settings.timePressure > 35 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {settings.timePressure > 65 ? '00:05:00 (URGENT)' : settings.timePressure > 35 ? '00:45:00' : '02:00:00 (CALM)'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.timePressure}
              onChange={(e) => onChange('timePressure', Number(e.target.value))}
              className="w-full accent-blue-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>Low (Calm)</span>
              <span>Med (45m)</span>
              <span>High (5m Warning)</span>
            </div>
          </div>

          {/* Slider 2: Noise Level */}
          <div className="space-y-1 bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/40">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-slate-200">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                Noise Level
              </span>
              <span className="font-mono text-[11px] text-cyan-400 font-semibold">
                {settings.noiseLevel > 65 ? 'High (Cough/Chairs)' : settings.noiseLevel > 35 ? 'Moderate' : 'Quiet Writing'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.noiseLevel}
              onChange={(e) => onChange('noiseLevel', Number(e.target.value))}
              className="w-full accent-cyan-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>Quiet (~35 dB)</span>
              <span>Pages & Scribble</span>
              <span>Loud (~65 dB)</span>
            </div>
          </div>

          {/* Slider 3: Crowd Density */}
          <div className="space-y-1 bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/40">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-slate-200">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                Crowd Density
              </span>
              <span className="font-mono text-[11px] text-indigo-300 font-semibold">
                {Math.round(settings.crowdDensity)}% Seats Occupied
              </span>
            </div>
            <input
              type="range"
              min="25"
              max="95"
              value={settings.crowdDensity}
              onChange={(e) => onChange('crowdDensity', Number(e.target.value))}
              className="w-full accent-indigo-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>Low (30%)</span>
              <span>Medium (60%)</span>
              <span>High (90%)</span>
            </div>
          </div>

          {/* Slider 4: Invigilator Proximity */}
          <div className="space-y-1 bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/40">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-slate-200">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                Invigilator Proximity
              </span>
              <span className={`font-mono text-[11px] font-semibold ${
                settings.invigilatorProximity > 65 ? 'text-rose-400' : 'text-amber-400'
              }`}>
                {settings.invigilatorProximity > 65 ? 'Near Participant' : settings.invigilatorProximity > 35 ? 'Aisle Patrol' : 'At Front Desk'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.invigilatorProximity}
              onChange={(e) => onChange('invigilatorProximity', Number(e.target.value))}
              className="w-full accent-amber-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>Far (Front)</span>
              <span>Mid (Aisles)</span>
              <span>Near (Participant)</span>
            </div>
          </div>

          {/* Slider 5: Peer Activity */}
          <div className="space-y-1 bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/40">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-slate-200">
                <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
                Peer Activity
              </span>
              <span className="font-mono text-[11px] text-purple-300 font-semibold">
                {settings.peerActivity > 65 ? 'High (Submissions/Hands)' : settings.peerActivity > 35 ? 'Moderate' : 'Focused Writing'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.peerActivity}
              onChange={(e) => onChange('peerActivity', Number(e.target.value))}
              className="w-full accent-purple-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>Quiet Writing</span>
              <span>Page Turns</span>
              <span>Submissions</span>
            </div>
          </div>

          {/* Slider 6: Lighting */}
          <div className="space-y-1 bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/40">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-slate-200">
                <Sun className="w-3.5 h-3.5 text-yellow-400" />
                Lighting (Lux)
              </span>
              <span className="font-mono text-[11px] text-yellow-300 font-semibold">
                {settings.lighting > 70 ? 'Bright (550 lux)' : settings.lighting < 30 ? 'Dim (180 lux)' : 'Normal (350 lux)'}
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={settings.lighting}
              onChange={(e) => onChange('lighting', Number(e.target.value))}
              className="w-full accent-yellow-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>Dim</span>
              <span>Standard Hall</span>
              <span>Bright</span>
            </div>
          </div>

          {/* Slider 7: Environmental Comfort */}
          <div className="space-y-1 bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/40">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-slate-200">
                <Fan className="w-3.5 h-3.5 text-emerald-400" />
                Environmental Comfort
              </span>
              <span className={`font-mono text-[11px] font-semibold ${
                settings.comfort > 60 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {settings.comfort > 60 ? 'Stuffy / Slow Fans' : 'Cool / Full Fans'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.comfort}
              onChange={(e) => onChange('comfort', Number(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>Comfortable</span>
              <span>Warm Cues</span>
              <span>Uncomfortable</span>
            </div>
          </div>

          {/* Dynamic Event Trigger Button */}
          <div className="pt-1">
            <button
              onClick={onTriggerSubmission}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-purple-600/30 to-blue-600/30 hover:from-purple-600/50 hover:to-blue-600/50 border border-purple-500/40 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98"
            >
              <Send className="w-3.5 h-3.5 text-purple-300" />
              <span>Trigger Student Paper Submission</span>
            </button>
            <p className="text-[10px] text-slate-400 mt-1 text-center">
              Demonstrates peer social comparison & aisle movement effect
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
