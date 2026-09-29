import React from 'react';
import {
  Play,
  Video,
  Activity,
  BarChart3,
  CheckCircle2,
  Sliders,
  Armchair,
  Brain
} from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onStart: () => void;
  onExplore: () => void;
  onWorkSystem: () => void;
  onImplications: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onStart,
  onExplore,
  onWorkSystem,
  onImplications
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900/95 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden p-6 md:p-8 space-y-6 text-slate-200">
        {/* Department / Lab Header Badge */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400 font-black text-xl shadow-lg">
              VR
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/50">
                  WORK SYSTEM DESIGN & ERGONOMICS
                </span>
                <span className="text-xs text-slate-500 font-mono">IIT Kharagpur • IE-402</span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide mt-1">
                ExamHall VR
              </h1>
            </div>
          </div>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60 hidden sm:inline">
            Nalanda Complex Twin
          </span>
        </div>

        {/* Core Description */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-slate-100">
            Interactive Human Factors & Socio-Technical Work System Simulation
          </h2>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            Welcome to the 3D examination hall simulation modeled after the <strong>Nalanda Classroom Complex at IIT Kharagpur</strong>. Explore how environmental, ergonomic, and supervisory variables dynamically govern student comfort, stress, concentration, and performance potential.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="bg-slate-800/60 border border-slate-700/50 p-3 rounded-xl flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="text-white block font-medium">6 Primary Factors</strong>
                <span className="text-slate-400 text-[11px]">Ergonomics, Temp, Light, Noise, Time, Density</span>
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/50 p-3 rounded-xl flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="text-white block font-medium">4 Core Outcomes</strong>
                <span className="text-slate-400 text-[11px]">Comfort, Stress, Concentration & Performance</span>
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/50 p-3 rounded-xl flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="text-white block font-medium">Dynamic AI Model</strong>
                <span className="text-slate-400 text-[11px]">Non-linear interactions & Causal Chain</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            onClick={onStart}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-blue-600/25 transition-all text-sm group"
          >
            <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
            <span>ENTER EXAMINATION HALL</span>
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={onExplore}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 hover:text-white font-medium rounded-xl flex items-center justify-center gap-2 text-xs transition-colors"
            >
              <Video className="w-3.5 h-3.5 text-blue-400" />
              <span>EXPLORE CLASSROOM</span>
            </button>

            <button
              onClick={onWorkSystem}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 hover:text-white font-medium rounded-xl flex items-center justify-center gap-2 text-xs transition-colors"
            >
              <Activity className="w-3.5 h-3.5 text-purple-400" />
              <span>WORK SYSTEM MODEL</span>
            </button>

            <button
              onClick={onImplications}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 hover:text-white font-medium rounded-xl flex items-center justify-center gap-2 text-xs transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
              <span>VIEW IMPLICATIONS</span>
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Nalanda Complex Amphitheater Architecture • IIT Kharagpur</span>
          <span>Drag to Look Around • Scroll to Zoom</span>
        </div>
      </div>
    </div>
  );
};
