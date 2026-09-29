import React, { useState } from 'react';
import {
  SimulationOutcomes,
  PrimaryFactors,
  ActivityModifiers
} from '../types';
import {
  HeartPulse,
  Brain,
  Zap,
  Award,
  AlertTriangle,
  HelpCircle,
  TrendingDown,
  TrendingUp,
  Activity,
  Layers,
  ChevronDown,
  ChevronUp,
  Gauge
} from 'lucide-react';

interface StudentExperiencePanelProps {
  outcomes: SimulationOutcomes;
  factors: PrimaryFactors;
  modifiers: ActivityModifiers;
  invigilatorDist?: number;
}

export const StudentExperiencePanel: React.FC<StudentExperiencePanelProps> = ({
  outcomes,
  factors,
  modifiers,
  invigilatorDist = 6.0
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);

  const getDemandColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'moderate':
        return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'high':
        return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
      case 'extreme':
        return 'text-red-500 border-red-500/50 bg-red-500/20 animate-pulse';
      default:
        return 'text-slate-400 border-slate-700 bg-slate-800/40';
    }
  };

  return (
    <div
      className={`fixed top-18 right-3 z-30 transition-all duration-300 ${
        isCollapsed ? 'w-12 h-12' : 'w-88 sm:w-96 max-h-[calc(100vh-5.5rem)]'
      }`}
    >
      {isCollapsed ? (
        <button
          onClick={() => setIsCollapsed(false)}
          className="w-12 h-12 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-emerald-400 flex items-center justify-center shadow-2xl hover:bg-slate-800 transition-colors backdrop-blur-md"
          title="Open Student Experience Analysis"
        >
          <Brain className="w-5 h-5" />
        </button>
      ) : (
        <div className="bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden max-h-[calc(100vh-5.5rem)]">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white tracking-wide uppercase">
                  Student Experience Analysis
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  Human Factors & Ergonomics Model
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Collapse Panel"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>

          {/* Combined Environmental Demand Indicator */}
          <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Gauge className="w-4 h-4 text-purple-400" />
              <span className="font-semibold">Environmental Demand:</span>
            </div>
            <div
              className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold font-mono uppercase ${getDemandColor(
                outcomes.environmentalDemandLevel
              )}`}
            >
              {outcomes.environmentalDemandLevel} ({outcomes.combinedEnvironmentalDemand})
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="p-4 overflow-y-auto space-y-4 text-xs">
            {/* 4 Major Simulated Outcomes */}
            <div className="space-y-2.5">
              {/* 1. Comfort Score */}
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
                    Comfort Score
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                      {outcomes.comfortRating}
                    </span>
                    <span className="text-sm font-bold font-mono text-emerald-400">
                      {outcomes.comfortScore}
                      <span className="text-[10px] text-slate-500 font-normal">/100</span>
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
                    style={{ width: `${outcomes.comfortScore}%` }}
                  />
                </div>
              </div>

              {/* 2. Stress Score */}
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Stress Score
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                      {outcomes.stressRating}
                    </span>
                    <span
                      className={`text-sm font-bold font-mono ${
                        outcomes.stressScore > 70
                          ? 'text-rose-400'
                          : outcomes.stressScore > 40
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {outcomes.stressScore}
                      <span className="text-[10px] text-slate-500 font-normal">/100</span>
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-500 rounded-full"
                    style={{ width: `${outcomes.stressScore}%` }}
                  />
                </div>
                <p className="text-[9px] text-slate-500 italic">
                  * Simulation estimate of environmental & task demand; not clinical data.
                </p>
              </div>

              {/* 3. Concentration Score */}
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5 text-blue-400" />
                    Concentration Score
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                      {outcomes.concentrationRating}
                    </span>
                    <span className="text-sm font-bold font-mono text-blue-400">
                      {outcomes.concentrationScore}
                      <span className="text-[10px] text-slate-500 font-normal">/100</span>
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-blue-400 transition-all duration-500 rounded-full"
                    style={{ width: `${outcomes.concentrationScore}%` }}
                  />
                </div>
              </div>

              {/* 4. Simulated Performance Potential */}
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-blue-500/30 space-y-1.5 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-yellow-400" />
                    Simulated Performance Potential
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                      {outcomes.performanceRating}
                    </span>
                    <span className="text-base font-extrabold font-mono text-yellow-300">
                      {outcomes.performancePotential}
                      <span className="text-[10px] text-slate-500 font-normal">/100</span>
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-yellow-400 transition-all duration-500 rounded-full"
                    style={{ width: `${outcomes.performancePotential}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[9px] text-slate-400 pt-0.5">
                  <span>Capacity based on ergonomics, cognition & stress</span>
                  <button
                    onClick={() => setShowFormulaDetails(!showFormulaDetails)}
                    className="text-blue-400 hover:underline flex items-center gap-0.5 font-semibold"
                  >
                    Formula <HelpCircle className="w-2.5 h-2.5" />
                  </button>
                </div>

                {showFormulaDetails && (
                  <div className="mt-2 p-2 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-300 space-y-1 animate-fadeIn font-mono">
                    <div className="font-semibold text-yellow-400">
                      Performance Potential Formula:
                    </div>
                    <div>
                      = +0.45(Concentration) + 0.35(Comfort) - 0.50(Stress) - 0.25(Demand)
                    </div>
                    <div className="text-slate-400 text-[9px] font-sans">
                      Represents cognitive capacity and output quality under the current work system. Not actual exam marks.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* "Why did the score change?" Dynamic Contribution Analysis */}
            <div className="space-y-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center justify-between text-slate-200">
                <span className="font-bold flex items-center gap-1.5 text-xs">
                  <Activity className="w-3.5 h-3.5 text-purple-400" />
                  Why did the score change?
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Contribution Analysis</span>
              </div>

              {/* Dynamic Causal Chain */}
              <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 font-mono leading-relaxed">
                <span className="text-purple-400 font-bold">Causal Chain:</span>
                <div className="mt-1 text-slate-200">{outcomes.causalChain}</div>
              </div>

              {/* Top Contributors */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Top Influencing Factors:
                </span>
                {outcomes.topContributors.map((contrib, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px]"
                  >
                    <span className="text-slate-200 font-medium">{contrib.factor}</span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${
                          contrib.direction === 'negative'
                            ? 'text-rose-400 bg-rose-500/10'
                            : 'text-emerald-400 bg-emerald-500/10'
                        }`}
                      >
                        {contrib.direction === 'negative' ? '▼ Negative' : '▲ Positive'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono uppercase">
                        {contrib.impact}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Current State Snapshot */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Work System Snapshot
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
                <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-center">
                  <div className="text-slate-500">Ergonomics</div>
                  <div className="text-amber-300 font-semibold capitalize">
                    {factors.furnitureErgonomics}
                  </div>
                </div>
                <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-center">
                  <div className="text-slate-500">Temp</div>
                  <div className="text-rose-300 font-semibold">{factors.temperature}°C</div>
                </div>
                <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-center">
                  <div className="text-slate-500">Noise</div>
                  <div className="text-cyan-300 font-semibold">{factors.noise} dB</div>
                </div>
                <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-center">
                  <div className="text-slate-500">Lighting</div>
                  <div className="text-yellow-300 font-semibold capitalize">
                    {factors.lighting}
                  </div>
                </div>
                <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-center">
                  <div className="text-slate-500">Time Press.</div>
                  <div className="text-rose-400 font-semibold capitalize">
                    {factors.timePressure}
                  </div>
                </div>
                <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-center">
                  <div className="text-slate-500">Density</div>
                  <div className="text-indigo-300 font-semibold capitalize">
                    {factors.studentDensity}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
