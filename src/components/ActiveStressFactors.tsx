import React from 'react';
import { SimulationSettings } from '../types';
import {
  Clock,
  Volume2,
  Users,
  ShieldAlert,
  Eye,
  ThermometerSnowflake,
  AlertTriangle
} from 'lucide-react';

interface ActiveStressFactorsProps {
  settings: SimulationSettings;
}

export const ActiveStressFactors: React.FC<ActiveStressFactorsProps> = ({ settings }) => {
  const factors: Array<{
    id: string;
    label: string;
    level: 'MODERATE' | 'HIGH';
    icon: React.ReactNode;
    color: string;
  }> = [];

  if (settings.timePressure > 65) {
    factors.push({
      id: 'time',
      label: 'Time Pressure',
      level: 'HIGH',
      icon: <Clock className="w-3.5 h-3.5" />,
      color: 'bg-rose-500/20 text-rose-300 border-rose-500/50'
    });
  } else if (settings.timePressure > 40) {
    factors.push({
      id: 'time',
      label: 'Time Pressure',
      level: 'MODERATE',
      icon: <Clock className="w-3.5 h-3.5" />,
      color: 'bg-amber-500/20 text-amber-300 border-amber-500/50'
    });
  }

  if (settings.noiseLevel > 65) {
    factors.push({
      id: 'noise',
      label: 'Acoustic Distraction',
      level: 'HIGH',
      icon: <Volume2 className="w-3.5 h-3.5" />,
      color: 'bg-rose-500/20 text-rose-300 border-rose-500/50'
    });
  } else if (settings.noiseLevel > 40) {
    factors.push({
      id: 'noise',
      label: 'Noise Level',
      level: 'MODERATE',
      icon: <Volume2 className="w-3.5 h-3.5" />,
      color: 'bg-amber-500/20 text-amber-300 border-amber-500/50'
    });
  }

  if (settings.crowdDensity > 75) {
    factors.push({
      id: 'crowd',
      label: 'Crowd Density',
      level: 'HIGH',
      icon: <Users className="w-3.5 h-3.5" />,
      color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50'
    });
  }

  if (settings.invigilatorProximity > 65) {
    factors.push({
      id: 'invigilator',
      label: 'Invigilator Proximity',
      level: 'HIGH',
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
      color: 'bg-rose-500/20 text-rose-300 border-rose-500/50'
    });
  } else if (settings.invigilatorProximity > 40) {
    factors.push({
      id: 'invigilator',
      label: 'Invigilator Observation',
      level: 'MODERATE',
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
      color: 'bg-amber-500/20 text-amber-300 border-amber-500/50'
    });
  }

  if (settings.peerActivity > 60) {
    factors.push({
      id: 'peer',
      label: 'Peer Social Activity',
      level: 'HIGH',
      icon: <Eye className="w-3.5 h-3.5" />,
      color: 'bg-purple-500/20 text-purple-300 border-purple-500/50'
    });
  } else if (settings.peerActivity > 35) {
    factors.push({
      id: 'peer',
      label: 'Peer Activity',
      level: 'MODERATE',
      icon: <Eye className="w-3.5 h-3.5" />,
      color: 'bg-amber-500/20 text-amber-300 border-amber-500/50'
    });
  }

  if (settings.comfort > 60) {
    factors.push({
      id: 'comfort',
      label: 'Thermal / Airflow Stress',
      level: 'MODERATE',
      icon: <ThermometerSnowflake className="w-3.5 h-3.5" />,
      color: 'bg-amber-500/20 text-amber-300 border-amber-500/50'
    });
  }

  if (factors.length === 0) {
    return (
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-xl px-3 py-2 text-xs text-slate-400 flex items-center gap-2 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        <span>No Elevated Stress Factors Active (Calm Environment)</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-xl p-3 shadow-xl space-y-2 max-w-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-white uppercase tracking-wider">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>Active Stress Factors ({factors.length})</span>
        </div>
        <span className="text-[10px] font-mono text-slate-400">Live Sensory Demand</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {factors.map((f, idx) => (
          <div
            key={`${f.id}-${idx}`}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${f.color}`}
          >
            {f.icon}
            <span>{f.label}</span>
            <span className="text-[10px] font-mono font-bold px-1 rounded bg-black/30">
              {f.level}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
