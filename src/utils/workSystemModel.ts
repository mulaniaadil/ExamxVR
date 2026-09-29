import {
  PrimaryFactors,
  ActivityModifiers,
  SimulationOutcomes
} from '../types';

export function calculateWorkSystemModel(
  factors: PrimaryFactors,
  modifiers: ActivityModifiers,
  lastChangedKey?: string
): SimulationOutcomes {
  // 1. Individual Factor Impacts
  let comfort = 70;
  let stress = 30;
  let concentration = 70;

  // --- Factor 1: Furniture Ergonomics ---
  let ergoDemand = 0;
  if (factors.furnitureErgonomics === 'optimal') {
    comfort += 22;
    stress -= 6;
    concentration += 10;
  } else if (factors.furnitureErgonomics === 'moderate') {
    comfort += 2;
  } else {
    // Poor ergonomics
    comfort -= 28;
    stress += 14;
    concentration -= 16;
    ergoDemand = 25;
  }

  // --- Factor 2: Temperature (18°C to 30°C) ---
  // Optimal comfort zone: 22°C to 24°C
  const temp = factors.temperature;
  let tempDemand = 0;
  if (temp >= 22 && temp <= 24) {
    comfort += 12;
    concentration += 6;
  } else if (temp < 22) {
    const coldPenalty = (22 - temp) * 4.5;
    comfort -= coldPenalty;
    concentration -= (22 - temp) * 2.2;
    tempDemand = coldPenalty * 1.5;
  } else {
    // Hot condition
    const heatPenalty = (temp - 24) * 5.8;
    comfort -= heatPenalty;
    stress += (temp - 24) * 3.8;
    concentration -= (temp - 24) * 4.2;
    tempDemand = heatPenalty * 2.0;
  }

  // --- Factor 3: Lighting ---
  let lightDemand = 0;
  if (factors.lighting === 'optimal') {
    comfort += 10;
    concentration += 10;
  } else if (factors.lighting === 'moderate') {
    comfort += 2;
  } else if (factors.lighting === 'poor') {
    comfort -= 16;
    stress += 8;
    concentration -= 18;
    lightDemand = 22;
  } else if (factors.lighting === 'excessive') {
    comfort -= 14;
    stress += 10;
    concentration -= 12;
    lightDemand = 18;
  }

  // --- Factor 4: Noise (30 to 70 dB) ---
  // Baseline ~35 dB
  let noiseDemand = 0;
  if (factors.noise <= 35) {
    concentration += 12;
    comfort += 6;
    stress -= 8;
  } else if (factors.noise <= 45) {
    // Normal classroom
  } else if (factors.noise <= 55) {
    concentration -= 12;
    stress += 10;
    noiseDemand = 16;
  } else {
    const highNoiseDelta = factors.noise - 50;
    concentration -= highNoiseDelta * 1.2;
    stress += highNoiseDelta * 1.4;
    comfort -= highNoiseDelta * 0.8;
    noiseDemand = highNoiseDelta * 2.5;
  }

  // --- Factor 5: Time Pressure ---
  let timeDemand = 0;
  if (factors.timePressure === 'low') {
    stress -= 14;
    concentration += 8;
    comfort += 4;
  } else if (factors.timePressure === 'moderate') {
    stress += 14;
    concentration -= 4;
    timeDemand = 18;
  } else {
    // High time pressure (<10 min) - steep non-linear panic curve
    stress += 42;
    concentration -= 24;
    comfort -= 12;
    timeDemand = 45;
  }

  // --- Factor 6: Student Density ---
  let densityDemand = 0;
  if (factors.studentDensity === 'low') {
    comfort += 12;
    stress -= 6;
    concentration += 6;
  } else if (factors.studentDensity === 'moderate') {
    // Nominal
  } else {
    // High density (90%)
    comfort -= 18;
    stress += 16;
    concentration -= 12;
    densityDemand = 24;
  }

  // --- 2. Compounding Interaction Effects ---
  let compoundStressBonus = 0;
  let compoundConcPenalty = 0;
  let compoundComfortPenalty = 0;

  // Interaction 1: High Noise + High Time Pressure
  if (factors.noise >= 60 && factors.timePressure === 'high') {
    compoundStressBonus += 16;
    compoundConcPenalty += 14;
  }

  // Interaction 2: High Temperature + High Student Density
  if (factors.temperature >= 28 && factors.studentDensity === 'high') {
    compoundComfortPenalty += 16;
    compoundStressBonus += 12;
  }

  // Interaction 3: Poor Lighting + High Time Pressure
  if (factors.lighting === 'poor' && factors.timePressure === 'high') {
    compoundConcPenalty += 14;
    compoundStressBonus += 10;
  }

  // Interaction 4: Poor Ergonomics + High Time Pressure / Long Writing
  if (factors.furnitureErgonomics === 'poor' && factors.timePressure !== 'low') {
    compoundComfortPenalty += 12;
    compoundConcPenalty += 10;
  }

  // --- 3. Examination Activity Modifiers ---
  let modifierStress = 0;
  let modifierComfort = 0;
  let modifierConcentration = 0;

  // Invigilator Patrol
  if (modifiers.invigilatorPatrol === 'frequent') {
    modifierStress += 10; // Observation pressure
    modifierConcentration -= 6; // Visual tracking
    modifierComfort -= 4;
  } else if (modifiers.invigilatorPatrol === 'stationary') {
    modifierStress -= 4;
  }

  // Teaching Assistants System
  if (modifiers.teachingAssistants) {
    // Support benefit: assistance with paper logistics, reduced anxiety
    const supportBenefit = 10;
    // Movement distraction: TAs walking down aisles
    const movementDistraction = modifiers.taActivity === 'high' ? 12 : modifiers.taActivity === 'moderate' ? 6 : 2;
    // Observation pressure
    const observationPressure = modifiers.taActivity === 'high' ? 8 : 3;

    modifierComfort += supportBenefit - movementDistraction * 0.4;
    modifierStress += observationPressure - supportBenefit * 0.5;
    modifierConcentration -= movementDistraction * 0.8;
  }

  // Apply compound & modifier totals
  comfort = Math.max(8, Math.min(96, Math.round(comfort - compoundComfortPenalty + modifierComfort)));
  stress = Math.max(8, Math.min(98, Math.round(stress + compoundStressBonus + modifierStress)));
  concentration = Math.max(10, Math.min(95, Math.round(concentration - compoundConcPenalty + modifierConcentration)));

  // --- 4. Hidden Internal Score: Combined Environmental Demand ---
  const rawDemand =
    (ergoDemand * 1.2) +
    (tempDemand * 1.1) +
    (lightDemand * 1.0) +
    (noiseDemand * 1.2) +
    (timeDemand * 1.4) +
    (densityDemand * 1.1) +
    (compoundStressBonus * 1.3);

  const combinedEnvironmentalDemand = Math.max(
    5,
    Math.min(98, Math.round(rawDemand / 1.75))
  );

  let demandCategory: 'Low' | 'Moderate' | 'High' | 'Very High' = 'Low';
  if (combinedEnvironmentalDemand > 75) demandCategory = 'Very High';
  else if (combinedEnvironmentalDemand > 50) demandCategory = 'High';
  else if (combinedEnvironmentalDemand > 25) demandCategory = 'Moderate';

  // --- 5. Simulated Performance Potential ---
  // Formula based on positive influence of Comfort + Concentration - Stress - Combined Environmental Demand
  const rawPerformance =
    (comfort * 0.28) +
    (concentration * 0.48) -
    (stress * 0.22) -
    (combinedEnvironmentalDemand * 0.16);

  const performancePotential = Math.max(
    10,
    Math.min(96, Math.round(rawPerformance + 18))
  );

  // --- 6. "Why Did The Score Change?" Top Contributors Analysis ---
  const contributors: Array<{
    factor: string;
    score: number;
    impact: 'High Impact' | 'Medium Impact' | 'Low Impact';
    reason: string;
    chain: string[];
    isNegative: boolean;
  }> = [];

  // Time Pressure
  if (factors.timePressure === 'high') {
    contributors.push({
      factor: 'Time Pressure (<10 min)',
      score: 95,
      impact: 'High Impact',
      reason: 'Urgent countdown elevates cognitive workload & working memory strain',
      chain: ['Time Pressure (<10 min) ↑', 'Task Demand ↑', 'Stress Surge ↑', 'Potential Error Risk ↑'],
      isNegative: true
    });
  } else if (factors.timePressure === 'low') {
    contributors.push({
      factor: 'Time Pressure (1 hr)',
      score: 30,
      impact: 'Low Impact',
      reason: 'Generous examination time maintains calm pacing',
      chain: ['Time Pressure (1 hr)', 'Pacing Relaxed', 'Stress Minimal', 'Performance Maintained'],
      isNegative: false
    });
  }

  // Noise
  if (factors.noise >= 60) {
    contributors.push({
      factor: `Noise (${factors.noise} dB)`,
      score: 85,
      impact: factors.noise >= 65 ? 'High Impact' : 'Medium Impact',
      reason: 'Acoustic disruptions force sensory filtering, depleting concentration',
      chain: [`Noise: ${factors.noise} dB`, 'Auditory Distraction ↑', 'Sustained Concentration ↓', 'Cognitive Fatigue ↑'],
      isNegative: true
    });
  }

  // Furniture Ergonomics
  if (factors.furnitureErgonomics === 'poor') {
    contributors.push({
      factor: 'Poor Furniture Ergonomics',
      score: 80,
      impact: 'High Impact',
      reason: 'Forward bending & awkward desk reach cause postural fatigue and neck tension',
      chain: ['Poor Ergonomics', 'Postural Strain ↑', 'Physical Comfort ↓', 'Sustained Concentration ↓'],
      isNegative: true
    });
  } else if (factors.furnitureErgonomics === 'optimal') {
    contributors.push({
      factor: 'Optimal Ergonomics',
      score: 35,
      impact: 'Low Impact',
      reason: 'Neutral spinal posture and comfortable writing surface preserve stamina',
      chain: ['Optimal Ergonomics', 'Neutral Posture', 'Physical Comfort ↑', 'Endurance Preserved'],
      isNegative: false
    });
  }

  // Temperature
  if (factors.temperature >= 28 || factors.temperature <= 18) {
    contributors.push({
      factor: `Temperature (${factors.temperature}°C)`,
      score: 75,
      impact: factors.temperature >= 29 ? 'High Impact' : 'Medium Impact',
      reason: factors.temperature >= 28
        ? 'Excessive heat triggers thermal discomfort and restless posture shifts'
        : 'Cold ambient conditions cause muscular stiffness and reduced finger dexterity',
      chain: [`Temperature: ${factors.temperature}°C`, 'Thermal Regulation Strain', 'Comfort ↓', 'Stress & Restlessness ↑'],
      isNegative: true
    });
  }

  // Student Density
  if (factors.studentDensity === 'high') {
    contributors.push({
      factor: 'High Student Density (90%)',
      score: 70,
      impact: 'Medium Impact',
      reason: 'Crowded seating compresses personal space and amplifies visual/movement clutter',
      chain: ['Student Density: 90%', 'Personal Space Compressed', 'Environmental Activity ↑', 'Distraction Potential ↑'],
      isNegative: true
    });
  }

  // Lighting
  if (factors.lighting === 'poor' || factors.lighting === 'excessive') {
    contributors.push({
      factor: `Lighting (${factors.lighting.toUpperCase()})`,
      score: 65,
      impact: 'Medium Impact',
      reason: factors.lighting === 'poor'
        ? 'Insufficient illumination strains visual focus during reading and handwriting'
        : 'Excessive glare causes eye fatigue and visual discomfort',
      chain: [`Lighting: ${factors.lighting}`, 'Visual Strain ↑', 'Reading Ease ↓', 'Concentration Impairment'],
      isNegative: true
    });
  }

  // Sort contributors by impact score
  contributors.sort((a, b) => b.score - a.score);

  // Active cause-and-effect chain for the header
  const topOne = contributors[0] || {
    factor: 'Balanced Environmental Conditions',
    impact: 'Low Impact',
    chain: ['Work System Factors Balanced', 'Sensory Comfort Nominal', 'Steady Concentration', 'High Performance Potential']
  };

  // Helper ratings
  const getRating = (val: number): string => {
    if (val >= 80) return 'Optimal';
    if (val >= 60) return 'Good';
    if (val >= 40) return 'Moderate';
    return 'Impaired';
  };

  const getStressRating = (val: number): string => {
    if (val >= 75) return 'Severe';
    if (val >= 50) return 'High';
    if (val >= 30) return 'Moderate';
    return 'Low';
  };

  const envDemandLevel: 'low' | 'moderate' | 'high' | 'extreme' =
    combinedEnvironmentalDemand > 75 ? 'extreme' :
    combinedEnvironmentalDemand > 50 ? 'high' :
    combinedEnvironmentalDemand > 25 ? 'moderate' : 'low';

  const causalChainStr = topOne.chain.join(' ➔ ');

  return {
    comfortScore: comfort,
    comfortRating: getRating(comfort),
    comfort,

    stressScore: stress,
    stressRating: getStressRating(stress),
    stress,

    concentrationScore: concentration,
    concentrationRating: getRating(concentration),
    concentration,

    performancePotential,
    performanceRating: getRating(performancePotential),

    combinedEnvironmentalDemand,
    environmentalDemandLevel: envDemandLevel,
    demandCategory,

    causalChain: causalChainStr,
    topContributors: contributors.slice(0, 4).map(c => ({
      ...c,
      direction: c.isNegative ? ('negative' as const) : ('positive' as const)
    })),
    causeEffectChain: {
      title: topOne.factor,
      steps: topOne.chain
    }
  };
}
