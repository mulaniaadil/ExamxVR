import React, { useState } from 'react';
import { PrimaryFactors, ActivityModifiers, SimulationOutcomes } from '../types';
import {
  X,
  User,
  FileText,
  Armchair,
  Building2,
  Brain,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Shield,
  Clock,
  Thermometer,
  Volume2,
  Sun
} from 'lucide-react';

interface WorkSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  factors: PrimaryFactors;
  modifiers: ActivityModifiers;
  outcomes: SimulationOutcomes;
}

export const WorkSystemModal: React.FC<WorkSystemModalProps> = ({
  isOpen,
  onClose,
  factors,
  modifiers,
  outcomes
}) => {
  const [selectedPillar, setSelectedPillar] = useState<'human' | 'task' | 'workstation' | 'environment' | 'psychology'>('human');

  if (!isOpen) return null;

  const pillars = {
    human: {
      title: 'Human Component (Student Operator)',
      icon: <User className="w-5 h-5 text-blue-400" />,
      color: 'border-blue-500/50 bg-blue-500/10 text-blue-300',
      tag: 'Internal State & Operator',
      attributes: [
        { label: 'Attentional Resources', value: factors.noise > 50 ? 'Strained by noise & distractions' : 'High sustained focus' },
        { label: 'Working Memory Load', value: factors.timePressure === 'high' ? 'Severely saturated (<10m time pressure)' : 'Stable memory access' },
        { label: 'Thermal Sensation', value: factors.temperature > 26 ? 'Thermal discomfort / elevated perspiration' : factors.temperature < 20 ? 'Cool extremities' : 'Comfortable thermo-neutrality' },
        { label: 'Motor Handwriting Speed', value: factors.timePressure === 'high' ? 'High velocity / handwriting degradation' : 'Controlled legibility' }
      ],
      description: 'The student operator processing visual examination questions, retrieving learned engineering concepts, and executing handwritten responses while regulating anxiety.'
    },
    task: {
      title: 'Task Design (Examination Protocol)',
      icon: <FileText className="w-5 h-5 text-purple-400" />,
      color: 'border-purple-500/50 bg-purple-500/10 text-purple-300',
      tag: 'IE-402 Ergonomics Exam',
      attributes: [
        { label: 'Course Code', value: 'IE-402: Work System Design & Ergonomics' },
        { label: 'Evaluation Format', value: 'Rigid Pen-and-Paper Summative Exam' },
        { label: 'Time Constraint', value: factors.timePressure === 'high' ? 'Critical (<10 min urgent countdown)' : factors.timePressure === 'moderate' ? 'Moderate (30-10m remaining)' : 'Low (~01:00:00 remaining)' },
        { label: 'Pacing Autonomy', value: 'Zero external pacing control' }
      ],
      description: 'Standardized summative evaluation requiring high precision derivations, strict time budget per section, and permanent pen-and-paper recordkeeping.'
    },
    workstation: {
      title: 'Workstation Ergonomics (Bench & Desk)',
      icon: <Armchair className="w-5 h-5 text-amber-400" />,
      color: 'border-amber-500/50 bg-amber-500/10 text-amber-300',
      tag: 'Tiered Wooden Bench & Desk Combination',
      attributes: [
        { label: 'Ergonomic Classification', value: `${factors.furnitureErgonomics.toUpperCase()} design` },
        { label: 'Trunk Inclination', value: factors.furnitureErgonomics === 'poor' ? 'Excessive forward flexion (>30° hunch)' : factors.furnitureErgonomics === 'moderate' ? 'Slight trunk lean (15°)' : 'Upright neutral spine (5°)' },
        { label: 'Neck Cervical Strain', value: factors.furnitureErgonomics === 'poor' ? 'High cervical spine loading' : 'Low fatigue' },
        { label: 'Desk Clearance', value: 'Continuous dark writing surface with 48cm depth' }
      ],
      description: 'Traditional tiered lecture bench structure based on the Nalanda Complex at IIT Kharagpur. Fixed distance between seat bench and desk surface imposes forward trunk inclination during intense handwriting.'
    },
    environment: {
      title: 'Physical Environment (Ambient State)',
      icon: <Building2 className="w-5 h-5 text-emerald-400" />,
      color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300',
      tag: 'Nalanda Complex Ambient Parameters',
      attributes: [
        { label: 'Illuminance Level', value: `${factors.lighting.toUpperCase()} (${factors.lighting === 'poor' ? '100 Lux' : factors.lighting === 'moderate' ? '300 Lux' : factors.lighting === 'optimal' ? '500 Lux' : '1000 Lux'})` },
        { label: 'Acoustic Ambience', value: `${factors.noise} dB (${factors.noise <= 35 ? 'Quiet Pens' : factors.noise <= 50 ? 'Page Turning / Coughs' : 'Acoustic Distraction'})` },
        { label: 'Ambient Temperature', value: `${factors.temperature}°C (Ceiling fans active)` },
        { label: 'Student Density', value: `${factors.studentDensity.toUpperCase()} (${factors.studentDensity === 'low' ? '30% Occupancy' : factors.studentDensity === 'moderate' ? '65% Occupancy' : '90% Occupancy'})` }
      ],
      description: 'Physical ambient stressors including lighting lux, acoustic disruptions (coughs, chair creaks, page shuffles), student density crowding, and ceiling fan convection.'
    },
    psychology: {
      title: 'Psychological & Supervision Factors',
      icon: <Brain className="w-5 h-5 text-rose-400" />,
      color: 'border-rose-500/50 bg-rose-500/10 text-rose-300',
      tag: 'Surveillance & Social Comparison',
      attributes: [
        { label: 'Invigilator Patrol Mode', value: `${modifiers.invigilatorPatrol.toUpperCase()} frequency` },
        { label: 'Teaching Assistants (TAs)', value: modifiers.teachingAssistants ? `Active (${modifiers.taActivity.toUpperCase()} aisle pacing)` : 'None present' },
        { label: 'Evaluation Apprehension', value: modifiers.invigilatorPatrol === 'frequent' ? 'High (Frequent observation beside desk)' : 'Moderate' },
        { label: 'Social Peer Pressure', value: factors.studentDensity === 'high' ? 'High peer visibility & submission awareness' : 'Moderate' }
      ],
      description: 'Psychological pressures arising from visual awareness of surrounding peers turning pages or leaving early, coupled with authoritative monitoring by walking invigilators.'
    }
  };

  const activePillar = pillars[selectedPillar];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                Work System Design Framework: Examination Hall
              </h2>
              <p className="text-xs text-slate-400">
                Department of Industrial & Systems Engineering • Human Factors Model
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Work System Core Flow Diagram */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
              Systemic Interaction Flowchart
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center text-xs">
              <button
                onClick={() => setSelectedPillar('human')}
                className={`p-2.5 rounded-xl border transition-all ${
                  selectedPillar === 'human'
                    ? 'border-blue-500 bg-blue-500/20 text-blue-300 ring-2 ring-blue-500/30 font-semibold'
                    : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700'
                }`}
              >
                <User className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                <span>HUMAN</span>
              </button>

              <button
                onClick={() => setSelectedPillar('task')}
                className={`p-2.5 rounded-xl border transition-all ${
                  selectedPillar === 'task'
                    ? 'border-purple-500 bg-purple-500/20 text-purple-300 ring-2 ring-purple-500/30 font-semibold'
                    : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700'
                }`}
              >
                <FileText className="w-4 h-4 mx-auto mb-1 text-purple-400" />
                <span>TASK</span>
              </button>

              <button
                onClick={() => setSelectedPillar('workstation')}
                className={`p-2.5 rounded-xl border transition-all ${
                  selectedPillar === 'workstation'
                    ? 'border-amber-500 bg-amber-500/20 text-amber-300 ring-2 ring-amber-500/30 font-semibold'
                    : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700'
                }`}
              >
                <Armchair className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                <span>WORKSTATION</span>
              </button>

              <button
                onClick={() => setSelectedPillar('environment')}
                className={`p-2.5 rounded-xl border transition-all ${
                  selectedPillar === 'environment'
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 ring-2 ring-emerald-500/30 font-semibold'
                    : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700'
                }`}
              >
                <Building2 className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                <span>ENVIRONMENT</span>
              </button>

              <button
                onClick={() => setSelectedPillar('psychology')}
                className={`p-2.5 rounded-xl border col-span-2 md:col-span-1 transition-all ${
                  selectedPillar === 'psychology'
                    ? 'border-rose-500 bg-rose-500/20 text-rose-300 ring-2 ring-rose-500/30 font-semibold'
                    : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700'
                }`}
              >
                <Brain className="w-4 h-4 mx-auto mb-1 text-rose-400" />
                <span>PSYCHOLOGY</span>
              </button>
            </div>

            {/* Arrows pointing down to Examination Experience -> Performance */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs font-mono text-slate-400">
              <span className="h-px w-8 bg-slate-700" />
              <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
              <span className="px-2 py-1 rounded bg-blue-950/80 border border-blue-800 text-blue-300 font-semibold">
                DEMAND: {outcomes.combinedEnvironmentalDemand} ({outcomes.environmentalDemandLevel.toUpperCase()})
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              <span className="px-2 py-1 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-semibold">
                PERFORMANCE POTENTIAL: {outcomes.performancePotential}%
              </span>
              <span className="h-px w-8 bg-slate-700" />
            </div>
          </div>

          {/* Selected Pillar Detailed Inspector */}
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl border ${activePillar.color}`}>
                  {activePillar.icon}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{activePillar.title}</h3>
                  <span className="text-xs text-slate-400">{activePillar.tag}</span>
                </div>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Click tabs above to inspect other pillars
              </span>
            </div>

            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              {activePillar.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {activePillar.attributes.map((attr, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex items-start justify-between gap-3"
                >
                  <span className="text-xs font-medium text-slate-400">{attr.label}</span>
                  <span className="text-xs font-semibold text-slate-200 text-right">{attr.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Educational synthesis takeaway */}
          <div className="bg-gradient-to-r from-blue-950/40 to-slate-900/80 border border-blue-800/40 rounded-2xl p-4 text-xs text-slate-300 space-y-1.5">
            <div className="font-semibold text-blue-300 flex items-center gap-1.5">
              <ChevronRight className="w-3.5 h-3.5" />
              <span>Ergonomic Takeaway for Work System Design:</span>
            </div>
            <p className="text-slate-400 leading-normal">
              An examination hall operates as a tightly coupled socio-technical work system where environmental stressors (noise, thermal comfort), workstation geometry (bench reach), task constraints (timed calculations), and psychological pressures (invigilator surveillance, peer departures) compound to influence working memory, error rate, and student performance.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex justify-between items-center text-xs text-slate-400">
          <span>Simulation Prototype • Work System Design Lab</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors"
          >
            Return to 3D Simulation
          </button>
        </div>
      </div>
    </div>
  );
};
