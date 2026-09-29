export type CameraMode = 'cinematic' | 'participant' | 'observer' | 'topdown';

export type FurnitureErgonomics = 'poor' | 'moderate' | 'optimal';
export type LightingCondition = 'poor' | 'moderate' | 'optimal' | 'excessive';
export type TimePressureLevel = 'low' | 'moderate' | 'high';
export type StudentDensityLevel = 'low' | 'moderate' | 'high';
export type InvigilatorPatrolMode = 'stationary' | 'normal' | 'frequent';
export type TAActivityLevel = 'low' | 'moderate' | 'high';

export interface PrimaryFactors {
  furnitureErgonomics: FurnitureErgonomics;
  temperature: number; // 18 to 30 °C
  lighting: LightingCondition; // Lux: 100, 300, 500, 1000
  noise: number; // 30, 40, 50, 60, 70 dB
  timePressure: TimePressureLevel; // Low (~01:00:00), Moderate (30-10m), High (<10m)
  studentDensity: StudentDensityLevel; // Low (30%), Moderate (65%), High (90%)
}

export interface ActivityModifiers {
  invigilatorPatrol: InvigilatorPatrolMode;
  teachingAssistants: boolean; // OFF / ON
  taActivity: TAActivityLevel; // Low / Moderate / High
}

export interface OutcomeContributor {
  factor: string;
  impact: string;
  direction: 'positive' | 'negative';
  reason: string;
  chain: string[];
  isNegative: boolean;
}

export interface SimulationOutcomes {
  comfortScore: number; // 0 to 100
  comfortRating: string;
  comfort: number; // alias

  stressScore: number; // 0 to 100
  stressRating: string;
  stress: number; // alias

  concentrationScore: number; // 0 to 100
  concentrationRating: string;
  concentration: number; // alias

  performancePotential: number; // 0 to 100
  performanceRating: string;

  combinedEnvironmentalDemand: number; // 0 to 100
  environmentalDemandLevel: 'low' | 'moderate' | 'high' | 'extreme';
  demandCategory: 'Low' | 'Moderate' | 'High' | 'Very High';

  causalChain: string;
  topContributors: OutcomeContributor[];
  causeEffectChain: {
    title: string;
    steps: string[];
  };
}

// Backwards compatibility interface if needed
export interface SimulationSettings {
  timePressure: number;
  noiseLevel: number;
  crowdDensity: number;
  invigilatorProximity: number;
  peerActivity: number;
  lighting: number;
  comfort: number;
}

export interface PresetScenario {
  id: 'normal' | 'moderate' | 'high';
  name: string;
  description: string;
  factors: PrimaryFactors;
  modifiers: ActivityModifiers;
}
