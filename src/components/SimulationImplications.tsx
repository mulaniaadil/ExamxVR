import React, { useState } from 'react';
import { SimulationSettings } from '../types';
import {
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Brain,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';

interface SimulationImplicationsProps {
  settings: SimulationSettings;
  demandScore: number;
  lastChangedFactor?: string;
}

export const SimulationImplications: React.FC<SimulationImplicationsProps> = ({
  settings,
  demandScore,
  lastChangedFactor
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Dynamic calculations based on simulation prototype formulas
  const cognitiveLoad = Math.min(
    100,
    Math.round(settings.timePressure * 0.4 + settings.noiseLevel * 0.25 + settings.invigilatorProximity * 0.25 + settings.comfort * 0.1)
  );

  const distractionDemand = Math.min(
    100,
    Math.round(settings.noiseLevel * 0.45 + settings.peerActivity * 0.4 + settings.crowdDensity * 0.15)
  );

  const sustainedAttention = Math.max(
    15,
    Math.round(100 - (cognitiveLoad * 0.4 + distractionDemand * 0.4 + (settings.comfort > 60 ? 15 : 0)))
  );

  const errorRisk = Math.min(
    95,
    Math.round((settings.timePressure * 0.5 + settings.invigilatorProximity * 0.3 + distractionDemand * 0.2) * 0.9)
  );

  // Dynamic Cause-and-Effect cascade string
  const getCauseEffectChain = () => {
    switch (lastChangedFactor) {
      case 'timePressure':
        return [
          { label: 'Time Pressure ↑', highlight: true },
          { label: 'Perceived Task Demand ↑', highlight: false },
          { label: 'Cognitive Load ↑', highlight: false },
          { label: 'Potential Error Risk ↑', highlight: true }
        ];
      case 'noiseLevel':
        return [
          { label: 'Ambient Noise ↑', highlight: true },
          { label: 'Distraction Demand ↑', highlight: false },
          { label: 'Auditory Filter Effort ↑', highlight: false },
          { label: 'Attention Requirement ↑', highlight: true }
        ];
      case 'crowdDensity':
        return [
          { label: 'Crowd Density ↑', highlight: true },
          { label: 'Environmental Activity ↑', highlight: false },
          { label: 'Proximity Awareness ↑', highlight: false },
          { label: 'Distraction Potential ↑', highlight: true }
        ];
      case 'invigilatorProximity':
        return [
          { label: 'Invigilator Proximity ↑', highlight: true },
          { label: 'Perceived Observation ↑', highlight: false },
          { label: 'Evaluation Apprehension ↑', highlight: false },
          { label: 'Psychological Demand ↑', highlight: true }
        ];
      case 'peerActivity':
        return [
          { label: 'Peer Activity ↑', highlight: true },
          { label: 'Visual / Aisle Movement ↑', highlight: false },
          { label: 'Social Comparison ↑', highlight: false },
          { label: 'Perceived Urgency ↑', highlight: true }
        ];
      default:
        return [
          { label: 'Combined Stressors ↑', highlight: true },
          { label: 'Sensory Overload ↑', highlight: false },
          { label: 'Working Memory Load ↑', highlight: false },
          { label: 'Task Performance Impact ↑', highlight: true }
        ];
    }
  };

  const chain = getCauseEffectChain();

  const getDemandCategory = (score: number) => {
    if (score < 34) return { label: 'LOW', color: 'text-emerald-400', bar: 'bg-emerald-500' };
    if (score < 67) return { label: 'MODERATE', color: 'text-amber-400', bar: 'bg-amber-500' };
    return { label: 'HIGH', color: 'text-rose-400', bar: 'bg-rose-500' };
  };

  const demandCat = getDemandCategory(demandScore);

  return (
    <div className="fixed bottom-3 left-3 z-20 w-84 md:w-96 bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-2xl shadow-2xl p-3.5 text-slate-200 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" />
          <div>
            <h3 className="text-xs font-semibold text-white tracking-wide uppercase">
              Simulation Implications
            </h3>
            <p className="text-[10px] text-slate-400">Work System Ergonomic Model</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-mono font-bold ${demandCat.color}`}>
            {demandScore}/100 {demandCat.label}
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Environmental Demand Bar */}
      <div className="mt-2 space-y-1">
        <div className="flex justify-between text-[11px] font-mono">
          <span className="text-slate-400">Environmental Demand Score:</span>
          <span className={demandCat.color}>{demandScore}% ({demandCat.label})</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
          <div
            className={`h-full ${demandCat.bar} transition-all duration-500`}
            style={{ width: `${demandScore}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-slate-500 font-mono">
          <span>0 (Calm)</span>
          <span>34 (Moderate)</span>
          <span>67 (High Demand)</span>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3 space-y-3">
          {/* Cause → Effect Cascade */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-2.5">
            <div className="flex items-center gap-1 text-[10px] uppercase font-semibold text-slate-300 mb-1.5">
              <TrendingUp className="w-3 h-3 text-blue-400" />
              <span>Real-Time Cause → Effect Cascade</span>
            </div>
            <div className="flex items-center justify-between gap-1 text-[11px] font-mono">
              {chain.map((step, idx) => (
                <React.Fragment key={idx}>
                  <span
                    className={`px-1.5 py-0.5 rounded text-center leading-tight ${
                      step.highlight
                        ? 'bg-blue-600/30 text-blue-300 font-semibold border border-blue-500/40'
                        : 'text-slate-300'
                    }`}
                  >
                    {step.label}
                  </span>
                  {idx < chain.length - 1 && (
                    <span className="text-slate-500 font-bold">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Metric Bars */}
          <div className="space-y-2">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="flex items-center gap-1 text-slate-300">
                  <Brain className="w-3 h-3 text-purple-400" />
                  Cognitive Load:
                </span>
                <span className="font-mono text-xs text-purple-300 font-medium">
                  {cognitiveLoad}% ↑
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 transition-all duration-300"
                  style={{ width: `${cognitiveLoad}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="flex items-center gap-1 text-slate-300">
                  <ArrowUpRight className="w-3 h-3 text-rose-400" />
                  Potential Error Risk:
                </span>
                <span className="font-mono text-xs text-rose-300 font-medium">
                  {errorRisk}% ↑
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 transition-all duration-300"
                  style={{ width: `${errorRisk}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="flex items-center gap-1 text-slate-300">
                  <ArrowDownRight className="w-3 h-3 text-amber-400" />
                  Sustained Attention Capacity:
                </span>
                <span className="font-mono text-xs text-amber-300 font-medium">
                  {sustainedAttention}% ↓
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${sustainedAttention}%` }}
                />
              </div>
            </div>
          </div>

          {/* Prototype disclaimer notice as mandated */}
          <div className="pt-1 border-t border-slate-700/50 flex items-start gap-1.5 text-[10px] text-slate-400">
            <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
            <p>
              <strong className="text-slate-300 font-medium">PROTOTYPE SIMULATION LOGIC:</strong> Estimates potential ergonomic & cognitive implications under simulated examination stressors. Not medical measurement.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
