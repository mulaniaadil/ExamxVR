import React from 'react';
import { PrimaryFactors, ActivityModifiers } from '../types';
import { X, MapPin, User, ShieldAlert, Clock, Volume2, Users } from 'lucide-react';

interface TopDownMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  factors: PrimaryFactors;
  modifiers: ActivityModifiers;
}

export const TopDownMapModal: React.FC<TopDownMapModalProps> = ({
  isOpen,
  onClose,
  factors,
  modifiers
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Nalanda Tiered Examination Hall Layout Map
              </h2>
              <p className="text-xs text-slate-400">
                Spatial organization of sections, aisles, participant & invigilator route
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Schematic Architectural Diagram */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 font-mono text-xs">
          {/* Front Exam Board */}
          <div className="border border-emerald-500/40 bg-emerald-950/30 p-2.5 rounded-xl text-center text-emerald-300">
            <div className="font-bold tracking-widest text-[11px]">FRONT OF EXAMINATION HALL</div>
            <div className="text-[10px] text-emerald-400/80 mt-0.5">
              [ CHALKBOARD • PROJECTOR SCREEN • COUNTDOWN CLOCK ]
            </div>
            <div className="mt-2 flex items-center justify-center gap-4 text-[10px]">
              <span className="px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700">
                Podium / Lectern
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-900/60 text-amber-300 border border-amber-700 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                Invigilator Desk & Papers
              </span>
            </div>
          </div>

          {/* Front Walking Path */}
          <div className="border-b-2 border-dashed border-slate-700 py-1 text-center text-[10px] text-slate-500">
            ← FRONT CIRCULATION AISLE (Invigilator Patrol Route) →
          </div>

          {/* 3 Tiered Seating Blocks */}
          <div className="grid grid-cols-7 gap-1.5 py-2">
            {/* Left Seating Block (Angled +16°) */}
            <div className="col-span-2 border border-slate-800 bg-slate-900/90 rounded-xl p-2 text-center space-y-1">
              <div className="text-[10px] font-bold text-slate-300">LEFT BLOCK (16° Angled)</div>
              <div className="text-[9px] text-slate-500">Tiered Rows 1–7</div>
              <div className="space-y-1 pt-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex justify-around bg-slate-800/60 py-0.5 rounded text-[10px]">
                    <span>🪑</span>
                    <span>🪑</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Left Walking Aisle */}
            <div className="col-span-1 border-x-2 border-dashed border-amber-500/40 bg-amber-500/5 flex flex-col items-center justify-center text-[9px] text-amber-300/80 px-1 text-center">
              <span>LEFT</span>
              <span>AISLE</span>
              <span className="my-2">↕</span>
              <span>STAIRS</span>
            </div>

            {/* Center Seating Block (Straight, contains Participant) */}
            <div className="col-span-1 border border-blue-500/40 bg-blue-950/20 rounded-xl p-2 text-center space-y-1 relative">
              <div className="text-[10px] font-bold text-blue-300">CENTER BLOCK</div>
              <div className="text-[9px] text-slate-500">Tiered Rows 1–7</div>
              <div className="space-y-1 pt-1">
                <div className="flex justify-around bg-slate-800/60 py-0.5 rounded text-[10px]">
                  <span>🪑</span>
                  <span>🪑</span>
                </div>
                <div className="flex justify-around bg-slate-800/60 py-0.5 rounded text-[10px]">
                  <span>🪑</span>
                  <span>🪑</span>
                </div>
                {/* Row 3 - Participant Seat */}
                <div className="bg-blue-600 text-white font-bold py-1 px-1 rounded flex items-center justify-center gap-1 shadow-lg ring-2 ring-blue-400">
                  <User className="w-3 h-3" />
                  <span className="text-[9px]">PARTICIPANT</span>
                </div>
                <div className="flex justify-around bg-slate-800/60 py-0.5 rounded text-[10px]">
                  <span>🪑</span>
                  <span>🪑</span>
                </div>
                <div className="flex justify-around bg-slate-800/60 py-0.5 rounded text-[10px]">
                  <span>🪑</span>
                  <span>🪑</span>
                </div>
              </div>
            </div>

            {/* Right Walking Aisle */}
            <div className="col-span-1 border-x-2 border-dashed border-amber-500/40 bg-amber-500/5 flex flex-col items-center justify-center text-[9px] text-amber-300/80 px-1 text-center">
              <span>RIGHT</span>
              <span>AISLE</span>
              <span className="my-2">↕</span>
              <span>STAIRS</span>
            </div>

            {/* Right Seating Block (Angled -16°) */}
            <div className="col-span-2 border border-slate-800 bg-slate-900/90 rounded-xl p-2 text-center space-y-1">
              <div className="text-[10px] font-bold text-slate-300">RIGHT BLOCK (-16° Angled)</div>
              <div className="text-[9px] text-slate-500">Tiered Rows 1–7</div>
              <div className="space-y-1 pt-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex justify-around bg-slate-800/60 py-0.5 rounded text-[10px]">
                    <span>🪑</span>
                    <span>🪑</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Back Wall & Exit */}
          <div className="border-t-2 border-dashed border-slate-700 pt-2 flex justify-between items-center text-[10px] text-slate-400">
            <span>BACK WALL (Elevated Tiers)</span>
            <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
              CLASSROOM EXIT DOOR
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-blue-300">
              <span className="w-2.5 h-2.5 rounded bg-blue-600" /> Participant Seat (Center Row 3)
            </span>
            <span className="flex items-center gap-1.5 text-amber-300">
              <span className="w-2.5 h-2.5 rounded bg-amber-500" /> Safe Aisle Walking Paths
            </span>
          </div>
          <span className="font-mono text-[11px] text-slate-500">Scale: 1:1 Architectural Grid</span>
        </div>
      </div>
    </div>
  );
};
