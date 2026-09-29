import React, { useEffect, useRef, useState, useMemo } from 'react';
import { ClassroomScene } from './three/ClassroomScene';
import { soundEngine } from './audio/soundEngine';
import {
  CameraMode,
  PrimaryFactors,
  ActivityModifiers,
  SimulationOutcomes
} from './types';
import { calculateWorkSystemModel } from './utils/workSystemModel';
import { NavigationHeader } from './components/NavigationHeader';
import { PrimaryFactorsPanel } from './components/PrimaryFactorsPanel';
import { StudentExperiencePanel } from './components/StudentExperiencePanel';
import { WorkSystemModal } from './components/WorkSystemModal';
import { TopDownMapModal } from './components/TopDownMapModal';
import { WelcomeModal } from './components/WelcomeModal';
import { ParticipantHUD } from './components/ParticipantHUD';
import { Send } from 'lucide-react';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<ClassroomScene | null>(null);

  // 6 Primary Work System Factors
  const [factors, setFactors] = useState<PrimaryFactors>({
    furnitureErgonomics: 'optimal',
    temperature: 24,
    lighting: 'optimal',
    noise: 30,
    timePressure: 'low',
    studentDensity: 'moderate'
  });

  // Segregated Examination Activity Modifiers
  const [modifiers, setModifiers] = useState<ActivityModifiers>({
    invigilatorPatrol: 'normal',
    teachingAssistants: false,
    taActivity: 'moderate'
  });

  const [currentScenario, setCurrentScenario] = useState<'normal' | 'moderate' | 'high' | 'custom'>('normal');
  const [cameraMode, setCameraMode] = useState<CameraMode>('cinematic');
  const [showStressFactors, setShowStressFactors] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [remainingTimeStr, setRemainingTimeStr] = useState<string>('01:00:00');
  const [invigilatorDist, setInvigilatorDist] = useState<number>(10);

  // Modals state
  const [isWelcomeOpen, setIsWelcomeOpen] = useState<boolean>(true);
  const [isWorkSystemOpen, setIsWorkSystemOpen] = useState<boolean>(false);
  const [isMapOpen, setIsMapOpen] = useState<boolean>(false);

  // Dynamic notification toast
  const [peerToast, setPeerToast] = useState<{ message: string; visible: boolean } | null>(null);

  // Calculate 4 Major Simulated Outcomes via Non-Linear Work System Engine
  const outcomes: SimulationOutcomes = useMemo(() => {
    return calculateWorkSystemModel(factors, modifiers);
  }, [factors, modifiers]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new ClassroomScene(containerRef.current);
    sceneRef.current = scene;

    scene.applyWorkSystemSettings(factors, modifiers);
    scene.setStressVisualizer(showStressFactors);
    scene.setCameraMode(cameraMode);

    const interval = setInterval(() => {
      if (sceneRef.current) {
        setRemainingTimeStr(sceneRef.current.getRemainingTimeFormatted());
        setInvigilatorDist(sceneRef.current.getInvigilatorDistToParticipant());
      }
    }, 500);

    return () => {
      clearInterval(interval);
      scene.destroy();
    };
  }, []);

  // Sync audio engine on factor changes
  useEffect(() => {
    const tpScore = factors.timePressure === 'high' ? 90 : factors.timePressure === 'moderate' ? 50 : 20;
    const fanSpeed = Math.max(10, (factors.temperature - 16) * 8);
    soundEngine.updateParameters(factors.noise, tpScore, fanSpeed);
  }, [factors.noise, factors.timePressure, factors.temperature]);

  // Mute sync
  useEffect(() => {
    soundEngine.setMuted(isMuted);
  }, [isMuted]);

  // Handlers for factor & modifier changes
  const handleFactorChange = <K extends keyof PrimaryFactors>(key: K, value: PrimaryFactors[K]) => {
    soundEngine.userGesture();
    setCurrentScenario('custom');
    setFactors(prev => {
      const updated = { ...prev, [key]: value };
      if (sceneRef.current) {
        sceneRef.current.applyWorkSystemSettings(updated, modifiers);
      }
      return updated;
    });
  };

  const handleModifierChange = <K extends keyof ActivityModifiers>(key: K, value: ActivityModifiers[K]) => {
    soundEngine.userGesture();
    setCurrentScenario('custom');
    setModifiers(prev => {
      const updated = { ...prev, [key]: value };
      if (sceneRef.current) {
        sceneRef.current.applyWorkSystemSettings(factors, updated);
      }
      return updated;
    });
  };

  // Camera change
  const handleCameraChange = (mode: CameraMode) => {
    soundEngine.userGesture();
    setCameraMode(mode);
    if (sceneRef.current) {
      sceneRef.current.setCameraMode(mode);
    }
  };

  // Toggle stress visualizer
  const handleToggleStress = (enabled: boolean) => {
    soundEngine.userGesture();
    setShowStressFactors(enabled);
    if (sceneRef.current) {
      sceneRef.current.setStressVisualizer(enabled);
    }
  };

  // Presets
  const handleApplyScenario = (scenario: 'normal' | 'moderate' | 'high') => {
    soundEngine.userGesture();
    setCurrentScenario(scenario);

    let nextFactors: PrimaryFactors;
    let nextModifiers: ActivityModifiers;

    if (scenario === 'normal') {
      nextFactors = {
        furnitureErgonomics: 'optimal',
        temperature: 22,
        lighting: 'optimal',
        noise: 30,
        timePressure: 'low',
        studentDensity: 'moderate'
      };
      nextModifiers = {
        invigilatorPatrol: 'normal',
        teachingAssistants: false,
        taActivity: 'low'
      };
    } else if (scenario === 'moderate') {
      nextFactors = {
        furnitureErgonomics: 'moderate',
        temperature: 26,
        lighting: 'moderate',
        noise: 50,
        timePressure: 'moderate',
        studentDensity: 'moderate'
      };
      nextModifiers = {
        invigilatorPatrol: 'normal',
        teachingAssistants: true,
        taActivity: 'moderate'
      };
    } else {
      // High Pressure
      nextFactors = {
        furnitureErgonomics: 'poor',
        temperature: 30,
        lighting: 'poor',
        noise: 70,
        timePressure: 'high',
        studentDensity: 'high'
      };
      nextModifiers = {
        invigilatorPatrol: 'frequent',
        teachingAssistants: true,
        taActivity: 'high'
      };
    }

    setFactors(nextFactors);
    setModifiers(nextModifiers);

    if (sceneRef.current) {
      sceneRef.current.applyWorkSystemSettings(nextFactors, nextModifiers);
    }
  };

  // Dynamic Paper Submission trigger
  const handleTriggerSubmission = () => {
    soundEngine.userGesture();
    if (sceneRef.current) {
      sceneRef.current.triggerSubmission();
    }
    setPeerToast({
      message: 'Student stood up and walked down aisle to submit examination sheet! (↑ Social Comparison Pressure)',
      visible: true
    });
    setTimeout(() => {
      setPeerToast(null);
    }, 4500);
  };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none font-sans"
      onClick={() => soundEngine.userGesture()}
    >
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Navigation & Presets Bar */}
      <NavigationHeader
        cameraMode={cameraMode}
        setCameraMode={handleCameraChange}
        showStressFactors={showStressFactors}
        setShowStressFactors={handleToggleStress}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        onOpenWorkSystem={() => setIsWorkSystemOpen(true)}
        onOpenMap={() => setIsMapOpen(true)}
        onApplyScenario={handleApplyScenario}
        currentScenario={currentScenario}
        demandScore={outcomes.combinedEnvironmentalDemand}
      />

      {/* Left Floating Panel: 6 Primary Factors + Segregated Activity Modifiers */}
      <PrimaryFactorsPanel
        factors={factors}
        modifiers={modifiers}
        onFactorChange={handleFactorChange}
        onModifierChange={handleModifierChange}
        onTriggerSubmission={handleTriggerSubmission}
      />

      {/* Right Floating Panel: Student Experience Analysis (4 Outcomes + Why did score change?) */}
      <StudentExperiencePanel
        outcomes={outcomes}
        factors={factors}
        modifiers={modifiers}
        invigilatorDist={invigilatorDist}
      />

      {/* Participant First-Person HUD */}
      <ParticipantHUD
        cameraMode={cameraMode}
        factors={factors}
        modifiers={modifiers}
        outcomes={outcomes}
        remainingTime={remainingTimeStr}
        invigilatorDist={invigilatorDist}
      />

      {/* Peer Paper Submission Toast */}
      {peerToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-40 bg-purple-950/95 border border-purple-400/60 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs text-purple-200 animate-bounce pointer-events-none">
          <Send className="w-4 h-4 text-purple-300 shrink-0" />
          <span className="font-medium">{peerToast.message}</span>
        </div>
      )}

      {/* Work System Analysis Modal */}
      <WorkSystemModal
        isOpen={isWorkSystemOpen}
        onClose={() => setIsWorkSystemOpen(false)}
        factors={factors}
        modifiers={modifiers}
        outcomes={outcomes}
      />

      {/* Top-Down Schematic Map Modal */}
      <TopDownMapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        factors={factors}
        modifiers={modifiers}
      />

      {/* Welcome / Start Screen Modal */}
      <WelcomeModal
        isOpen={isWelcomeOpen}
        onStart={() => {
          setIsWelcomeOpen(false);
          soundEngine.userGesture();
        }}
        onExplore={() => {
          setIsWelcomeOpen(false);
          handleCameraChange('cinematic');
          soundEngine.userGesture();
        }}
        onWorkSystem={() => {
          setIsWelcomeOpen(false);
          setIsWorkSystemOpen(true);
          soundEngine.userGesture();
        }}
        onImplications={() => {
          setIsWelcomeOpen(false);
          soundEngine.userGesture();
        }}
      />
    </div>
  );
}
