import React from 'react';
import { CameraMode, PrimaryFactors, ActivityModifiers, SimulationOutcomes } from '../types';
import { User, AlertTriangle, Heart, Clock, Armchair, AlertCircle } from 'lucide-react';

interface ParticipantHUDProps {
  cameraMode: CameraMode;
  factors: PrimaryFactors;
  modifiers: ActivityModifiers;
  outcomes: SimulationOutcomes;
  remainingTime: string;
  invigilatorDist: number;
}

export const ParticipantHUD: React.FC<ParticipantHUDProps> = ({
  cameraMode,
  factors,
  modifiers,
  outcomes,
  remainingTime,
  invigilatorDist
}) => {
  if (cameraMode !== 'participant') return null;

  const isInvigilatorNear = invigilatorDist < 3.8;
  const isHeartPumping = factors.timePressure === 'high' || isInvigilatorNear || outcomes.stressScore > 65;

  // Determine seconds remaining from formatted string "HH:MM:SS"
  const parts = remainingTime.split(':').map(Number);
  const totalSeconds = parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : 3600;

  const is5MinWarning = totalSeconds <= 300 && totalSeconds > 120;
  const is2MinWarning = totalSeconds <= 120;

  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between p-4">
      {/* Top Participant status bar */}
      <div className="flex items-center justify-between">
        <div className="bg-slate-950/90 backdrop-blur-md border border-blue-500/50 rounded-xl px-3.5 py-1.5 flex items-center gap-2 shadow-xl">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
          <User className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold text-white tracking-wide">
            FIRST-PERSON PARTICIPANT PERSPECTIVE (Seated: Row 3, Center Block)
          </span>
        </div>

        {/* Heart Rate / Physiological Arousal Simulation */}
        <div className="bg-slate-950/90 backdrop-blur-md border border-slate-700/60 rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-xl">
          <Heart className={`w-4 h-4 ${isHeartPumping ? 'text-rose-500 animate-bounce' : 'text-emerald-400'}`} />
          <span className="text-xs font-mono font-medium text-slate-200">
            {isHeartPumping
              ? factors.timePressure === 'high'
                ? '124 BPM (Acute Stress)'
                : '98 BPM (Elevated Arousal)'
              : '72 BPM (Calm)'}
          </span>
        </div>
      </div>

      {/* Urgent Warning Banners at 5m and 2m */}
      <div className="self-center space-y-2 pointer-events-auto max-w-lg w-full text-center">
        {is2MinWarning && (
          <div className="bg-red-950/95 border-2 border-red-500 px-4 py-2.5 rounded-2xl text-red-100 text-xs font-bold flex items-center justify-center gap-2 shadow-2xl animate-pulse">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span>⚠ FINAL CALL: 2 MINUTES REMAINING! TIE SUPPLEMENTARY SHEETS IMMEDIATELY!</span>
          </div>
        )}

        {is5MinWarning && (
          <div className="bg-amber-950/95 border border-amber-500 px-4 py-2 rounded-2xl text-amber-100 text-xs font-bold flex items-center justify-center gap-2 shadow-2xl animate-pulse">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>⚠ 5 MINUTES WARNING: CHECK QUESTION NUMBERING & VERIFY ROLL CODE!</span>
          </div>
        )}

        {/* Invigilator Proximity Warning Toast */}
        {isInvigilatorNear && (
          <div className="bg-rose-950/90 border border-rose-500/80 px-4 py-1.5 rounded-xl text-rose-200 text-xs font-semibold flex items-center justify-center gap-2 shadow-2xl">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>INVIGILATOR BESIDE AISLE ({invigilatorDist.toFixed(1)}m) — Observation Pressure ↑</span>
          </div>
        )}

        {/* Ergonomic Discomfort Notice if Poor */}
        {factors.furnitureErgonomics === 'poor' && (
          <div className="bg-slate-950/85 border border-amber-500/50 px-3 py-1 rounded-xl text-amber-300 text-[11px] inline-flex items-center gap-1.5 shadow-lg">
            <Armchair className="w-3.5 h-3.5 text-amber-400" />
            <span>Ergonomic alert: Lumbar strain & cervical tension active</span>
          </div>
        )}
      </div>

      {/* Bottom Desk HUD */}
      <div className="flex items-end justify-between">
        {/* Exam Booklet Details */}
        <div className="bg-slate-950/90 backdrop-blur-md border border-slate-700/60 rounded-xl p-3 shadow-xl max-w-xs space-y-1">
          <div className="text-[10px] font-mono uppercase text-blue-400 font-bold">
            Examination Desk • Seat #B-03-02
          </div>
          <div className="text-xs text-slate-200 font-medium">
            Candidate: 23145 (Industrial & Systems Engg)
          </div>
          <div className="text-[11px] text-slate-400">
            IE-402: Work System Design & Ergonomics
          </div>
          <div className="text-[10px] text-emerald-400 pt-0.5">
            ✓ Blue Ballpoint Pen & Ruled Answer Booklet on Desk
          </div>
        </div>

        {/* Dynamic Outcomes in HUD */}
        <div className="bg-slate-950/90 backdrop-blur-md border border-slate-700/60 rounded-xl p-2.5 shadow-xl flex items-center gap-4 text-xs font-mono">
          <div>
            <div className="text-[9px] text-slate-400 uppercase">Comfort</div>
            <div className="font-bold text-emerald-400">{outcomes.comfortScore}%</div>
          </div>
          <div>
            <div className="text-[9px] text-slate-400 uppercase">Stress</div>
            <div className={`font-bold ${outcomes.stressScore > 60 ? 'text-rose-400' : 'text-amber-400'}`}>
              {outcomes.stressScore}%
            </div>
          </div>
          <div>
            <div className="text-[9px] text-slate-400 uppercase">Focus</div>
            <div className="font-bold text-blue-400">{outcomes.concentrationScore}%</div>
          </div>
          <div>
            <div className="text-[9px] text-slate-400 uppercase">Potential</div>
            <div className="font-bold text-yellow-400">{outcomes.performancePotential}%</div>
          </div>
        </div>

        {/* Camera look instructions */}
        <div className="bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg text-[11px] text-slate-400">
          Click & Drag to Look Around • Inspect Clock, Invigilator, & Chalkboard
        </div>
      </div>
    </div>
  );
};
