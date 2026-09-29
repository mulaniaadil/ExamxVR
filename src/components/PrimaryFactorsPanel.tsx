import React, { useState } from 'react';
import {
  PrimaryFactors,
  ActivityModifiers,
  FurnitureErgonomics,
  LightingCondition,
  TimePressureLevel,
  StudentDensityLevel,
  InvigilatorPatrolMode,
  TAActivityLevel
} from '../types';
import {
  Armchair,
  Thermometer,
  Sun,
  Volume2,
  Clock,
  Users,
  Shield,
  UserCheck,
  Send,
  ChevronDown,
  ChevronUp,
  Sliders,
  Sparkles
} from 'lucide-react';

interface PrimaryFactorsPanelProps {
  factors: PrimaryFactors;
  modifiers: ActivityModifiers;
  onFactorChange: <K extends keyof PrimaryFactors>(key: K, value: PrimaryFactors[K]) => void;
  onModifierChange: <K extends keyof ActivityModifiers>(key: K, value: ActivityModifiers[K]) => void;
  onTriggerSubmission: () => void;
}

export const PrimaryFactorsPanel: React.FC<PrimaryFactorsPanelProps> = ({
  factors,
  modifiers,
  onFactorChange,
  onModifierChange,
  onTriggerSubmission
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'primary' | 'modifiers'>('primary');

  return (
    <div
      className={`fixed top-18 left-3 z-30 transition-all duration-300 ${
        isCollapsed ? 'w-12 h-12' : 'w-88 sm:w-96 max-h-[calc(100vh-5.5rem)]'
      }`}
    >
      {isCollapsed ? (
        <button
          onClick={() => setIsCollapsed(false)}
          className="w-12 h-12 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-blue-400 flex items-center justify-center shadow-2xl hover:bg-slate-800 transition-colors backdrop-blur-md"
          title="Open Simulation Controls"
        >
          <Sliders className="w-5 h-5" />
        </button>
      ) : (
        <div className="bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden max-h-[calc(100vh-5.5rem)]">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white tracking-wide uppercase">
                  Simulation Inputs
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  Work System Variables
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsCollapsed(true)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Collapse Panel"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tab Selection: Primary Factors vs Modifiers */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-950/80 border-b border-slate-800 gap-1 text-xs">
            <button
              onClick={() => setActiveTab('primary')}
              className={`py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'primary'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              6 Primary Factors
            </button>
            <button
              onClick={() => setActiveTab('modifiers')}
              className={`py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'modifiers'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span>Activity Modifiers</span>
              {modifiers.teachingAssistants && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
          </div>

          {/* Scrollable Controls Body */}
          <div className="p-4 overflow-y-auto space-y-4 text-xs">
            {activeTab === 'primary' ? (
              <>
                {/* 1. Furniture Ergonomics */}
                <div className="space-y-1.5 bg-slate-950/50 border border-slate-800/80 p-2.5 rounded-xl">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Armchair className="w-3.5 h-3.5 text-amber-400" />
                      1. Furniture Ergonomics
                    </span>
                    <span className="font-mono text-[10px] uppercase font-bold text-amber-300">
                      {factors.furnitureErgonomics}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 pt-1">
                    {(['poor', 'moderate', 'optimal'] as FurnitureErgonomics[]).map(ergo => (
                      <button
                        key={ergo}
                        onClick={() => onFactorChange('furnitureErgonomics', ergo)}
                        className={`py-1.5 px-2 rounded-lg font-medium capitalize text-[11px] border transition-all ${
                          factors.furnitureErgonomics === ergo
                            ? 'border-amber-500 bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/50 shadow'
                            : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {ergo}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 pt-0.5">
                    {factors.furnitureErgonomics === 'poor'
                      ? '⚠ Forward hunch, awkward desk reach, accelerated spinal fatigue'
                      : factors.furnitureErgonomics === 'moderate'
                      ? 'Acceptable wooden bench clearance, slight forward flexion'
                      : '✓ Neutral spine, optimal desk height & arm angle support'}
                  </p>
                </div>

                {/* 2. Temperature */}
                <div className="space-y-1.5 bg-slate-950/50 border border-slate-800/80 p-2.5 rounded-xl">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                      2. Temperature
                    </span>
                    <span className="font-mono font-bold text-rose-300 text-xs">
                      {factors.temperature}°C{' '}
                      {factors.temperature >= 22 && factors.temperature <= 24 ? (
                        <span className="text-[10px] text-emerald-400 font-normal">(Optimal)</span>
                      ) : factors.temperature > 26 ? (
                        <span className="text-[10px] text-rose-400 font-normal">(Hot)</span>
                      ) : (
                        <span className="text-[10px] text-blue-400 font-normal">(Chilly)</span>
                      )}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="30"
                    step="2"
                    value={factors.temperature}
                    onChange={e => onFactorChange('temperature', Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>18°C (Cold)</span>
                    <span className="text-emerald-400 font-bold">22–24°C</span>
                    <span>30°C (Stuffy)</span>
                  </div>
                </div>

                {/* 3. Lighting */}
                <div className="space-y-1.5 bg-slate-950/50 border border-slate-800/80 p-2.5 rounded-xl">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-yellow-400" />
                      3. Lighting Level
                    </span>
                    <span className="font-mono text-[10px] font-bold text-yellow-300 uppercase">
                      {factors.lighting} (
                      {factors.lighting === 'poor'
                        ? '100 Lux'
                        : factors.lighting === 'moderate'
                        ? '300 Lux'
                        : factors.lighting === 'optimal'
                        ? '500 Lux'
                        : '1000 Lux'}
                      )
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 pt-1">
                    {(['poor', 'moderate', 'optimal', 'excessive'] as LightingCondition[]).map(l => (
                      <button
                        key={l}
                        onClick={() => onFactorChange('lighting', l)}
                        className={`py-1.5 px-1 text-center rounded-lg font-medium capitalize text-[10px] border transition-all ${
                          factors.lighting === l
                            ? 'border-yellow-500 bg-yellow-500/20 text-yellow-200 ring-1 ring-yellow-400/50 shadow'
                            : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Noise */}
                <div className="space-y-1.5 bg-slate-950/50 border border-slate-800/80 p-2.5 rounded-xl">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                      4. Noise Level
                    </span>
                    <span className="font-mono font-bold text-cyan-300">
                      {factors.noise} dB{' '}
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({factors.noise <= 35 ? 'Quiet Pens' : factors.noise <= 50 ? 'Page Turns' : 'Disruptive'})
                      </span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="70"
                    step="10"
                    value={factors.noise}
                    onChange={e => onFactorChange('noise', Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>30 dB</span>
                    <span>40 dB</span>
                    <span>50 dB</span>
                    <span>60 dB</span>
                    <span>70 dB</span>
                  </div>
                </div>

                {/* 5. Time Pressure */}
                <div className="space-y-1.5 bg-slate-950/50 border border-slate-800/80 p-2.5 rounded-xl">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-rose-400" />
                      5. Time Pressure
                    </span>
                    <span
                      className={`font-mono font-bold text-[11px] ${
                        factors.timePressure === 'high'
                          ? 'text-rose-400 animate-pulse'
                          : factors.timePressure === 'moderate'
                          ? 'text-amber-300'
                          : 'text-emerald-300'
                      }`}
                    >
                      {factors.timePressure === 'low'
                        ? '01:00:00 (1 Hr)'
                        : factors.timePressure === 'moderate'
                        ? '00:25:00 (Moderate)'
                        : '<10 Min (Urgent)'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 pt-1">
                    {(['low', 'moderate', 'high'] as TimePressureLevel[]).map(tp => (
                      <button
                        key={tp}
                        onClick={() => onFactorChange('timePressure', tp)}
                        className={`py-1.5 px-1.5 rounded-lg font-medium capitalize text-[11px] border transition-all ${
                          factors.timePressure === tp
                            ? tp === 'high'
                              ? 'border-rose-500 bg-rose-500/20 text-rose-200 ring-1 ring-rose-400 shadow'
                              : 'border-blue-500 bg-blue-500/20 text-blue-200 ring-1 ring-blue-400 shadow'
                            : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {tp}
                      </button>
                    ))}
                  </div>
                  {factors.timePressure === 'high' && (
                    <div className="p-1.5 rounded bg-rose-950/80 border border-rose-800 text-[10px] text-rose-300 font-semibold">
                      ⚠ Timer set to 05:00 countdown with rapid panic writing!
                    </div>
                  )}
                </div>

                {/* 6. Student Density */}
                <div className="space-y-1.5 bg-slate-950/50 border border-slate-800/80 p-2.5 rounded-xl">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      6. Student Density
                    </span>
                    <span className="font-mono text-[11px] font-bold text-indigo-300">
                      {factors.studentDensity === 'low'
                        ? '30% (Spacious)'
                        : factors.studentDensity === 'moderate'
                        ? '65% (Normal)'
                        : '90% (Packed)'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 pt-1">
                    {(['low', 'moderate', 'high'] as StudentDensityLevel[]).map(sd => (
                      <button
                        key={sd}
                        onClick={() => onFactorChange('studentDensity', sd)}
                        className={`py-1.5 px-1.5 rounded-lg font-medium capitalize text-[11px] border transition-all ${
                          factors.studentDensity === sd
                            ? 'border-indigo-500 bg-indigo-500/20 text-indigo-200 ring-1 ring-indigo-400 shadow'
                            : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {sd}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* EXAMINATION ACTIVITY MODIFIERS (Explicitly segregated!) */
              <div className="space-y-4">
                <div className="p-2 bg-purple-950/40 border border-purple-800/40 rounded-xl text-[11px] text-purple-300">
                  <strong>Academic Clarification:</strong> Activity modifiers represent human and supervision dynamics that modulate the six primary environmental factors.
                </div>

                {/* Invigilator Patrol */}
                <div className="space-y-1.5 bg-slate-950/50 border border-slate-800 p-2.5 rounded-xl">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-blue-400" />
                      Lead Invigilator Patrol
                    </span>
                    <span className="font-mono text-[10px] uppercase font-bold text-blue-300">
                      {modifiers.invigilatorPatrol}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 pt-1">
                    {(['stationary', 'normal', 'frequent'] as InvigilatorPatrolMode[]).map(mode => (
                      <button
                        key={mode}
                        onClick={() => onModifierChange('invigilatorPatrol', mode)}
                        className={`py-1.5 px-1 rounded-lg font-medium capitalize text-[11px] border transition-all ${
                          modifiers.invigilatorPatrol === mode
                            ? 'border-blue-500 bg-blue-500/20 text-blue-200 ring-1 ring-blue-400 shadow'
                            : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 pt-0.5">
                    {modifiers.invigilatorPatrol === 'frequent'
                      ? 'Frequent walks beside participant bench, high surveillance observation pressure'
                      : modifiers.invigilatorPatrol === 'normal'
                      ? 'Standard aisle walking patrol and front area supervision'
                      : 'Stationary at front podium, minimal movement'}
                  </p>
                </div>

                {/* Teaching Assistants Toggle */}
                <div className="space-y-2 bg-slate-950/50 border border-slate-800 p-2.5 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Teaching Assistants (TAs)
                    </span>
                    <button
                      onClick={() => onModifierChange('teachingAssistants', !modifiers.teachingAssistants)}
                      className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold border transition-colors ${
                        modifiers.teachingAssistants
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {modifiers.teachingAssistants ? 'TAs: ON' : 'TAs: OFF'}
                    </button>
                  </div>

                  {modifiers.teachingAssistants && (
                    <div className="space-y-2 pt-2 border-t border-slate-800/80 animate-fadeIn">
                      <div className="flex items-center justify-between text-slate-300 text-[11px]">
                        <span>TA Aisle Activity:</span>
                        <span className="font-mono text-emerald-400 font-semibold uppercase">
                          {modifiers.taActivity}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {(['low', 'moderate', 'high'] as TAActivityLevel[]).map(lvl => (
                          <button
                            key={lvl}
                            onClick={() => onModifierChange('taActivity', lvl)}
                            className={`py-1 px-1.5 rounded-lg text-[10px] font-medium capitalize border transition-all ${
                              modifiers.taActivity === lvl
                                ? 'border-emerald-500 bg-emerald-500/20 text-emerald-200 shadow'
                                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Net TA Impact: +Support Benefit (paper distribution) vs -Aisle Movement Distraction.
                      </p>
                    </div>
                  )}
                </div>

                {/* Dynamic Event: Trigger Student Paper Submission */}
                <div className="pt-1">
                  <button
                    onClick={onTriggerSubmission}
                    className="w-full py-2.5 px-3 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30 transition-all text-xs active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Trigger Student Paper Submission</span>
                  </button>
                  <p className="text-[10px] text-slate-400 text-center mt-1">
                    Student gathers sheets, walks down aisle to front desk, elevating peer pressure!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
