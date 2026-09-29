import * as THREE from 'three';

export class StressVisualizer {
  public group: THREE.Group;
  private soundWaveRings: THREE.Mesh[] = [];
  private clockBeacon: THREE.Mesh;
  private invigilatorRadius: THREE.Mesh;
  private participantAura: THREE.Mesh;
  private clockWarningText: THREE.Mesh;
  private isVisible: boolean = false;
  private animTimer: number = 0;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'StressVisualizerGroup';
    this.group.visible = false;

    // Clock Pulse Aura
    const clockHaloGeo = new THREE.RingGeometry(0.8, 1.4, 32);
    const clockHaloMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });
    this.clockBeacon = new THREE.Mesh(clockHaloGeo, clockHaloMat);
    this.clockBeacon.position.set(0, 4.8, -13.9);
    this.group.add(this.clockBeacon);

    // Warning Banner mesh under clock
    const bannerGeo = new THREE.PlaneGeometry(3.5, 0.45);
    const bannerCanvas = document.createElement('canvas');
    bannerCanvas.width = 512;
    bannerCanvas.height = 64;
    const bctx = bannerCanvas.getContext('2d')!;
    bctx.fillStyle = '#b91c1c';
    bctx.fillRect(0, 0, 512, 64);
    bctx.fillStyle = '#ffffff';
    bctx.font = 'bold 28px sans-serif';
    bctx.textAlign = 'center';
    bctx.textBaseline = 'middle';
    bctx.fillText('⚠ HIGH TIME PRESSURE', 256, 32);
    const bannerTex = new THREE.CanvasTexture(bannerCanvas);
    const bannerMat = new THREE.MeshBasicMaterial({ map: bannerTex, transparent: true, opacity: 0.9 });
    this.clockWarningText = new THREE.Mesh(bannerGeo, bannerMat);
    this.clockWarningText.position.set(0, 3.8, -13.9);
    this.group.add(this.clockWarningText);

    // Invigilator Proximity / Influence Radius Ring
    const invRingGeo = new THREE.RingGeometry(1.6, 2.2, 48);
    const invRingMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    });
    this.invigilatorRadius = new THREE.Mesh(invRingGeo, invRingMat);
    this.invigilatorRadius.rotation.x = -Math.PI / 2;
    this.group.add(this.invigilatorRadius);

    // Participant Stress Aura
    const partAuraGeo = new THREE.RingGeometry(0.6, 1.2, 36);
    const partAuraMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });
    this.participantAura = new THREE.Mesh(partAuraGeo, partAuraMat);
    this.participantAura.rotation.x = -Math.PI / 2;
    this.participantAura.position.set(0, 1.42, 0.2);
    this.group.add(this.participantAura);

    // Sound wave pulse rings (spread across classroom desks)
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide
    });
    const soundPositions = [
      new THREE.Vector3(-6.5, 1.6, -2),
      new THREE.Vector3(6.5, 2.2, 2),
      new THREE.Vector3(-1.5, 2.8, 4),
      new THREE.Vector3(2.5, 1.0, -4),
      new THREE.Vector3(-7, 2.5, 3),
    ];
    soundPositions.forEach((pos, idx) => {
      const sRing = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.35, 24), ringMat.clone());
      sRing.rotation.x = -Math.PI / 2;
      sRing.position.copy(pos);
      sRing.userData = { initialY: pos.y, phase: idx * 1.2 };
      this.soundWaveRings.push(sRing);
      this.group.add(sRing);
    });
  }

  public setVisible(visible: boolean) {
    this.isVisible = visible;
    this.group.visible = visible;
  }

  public getVisible(): boolean {
    return this.isVisible;
  }

  public update(
    delta: number,
    invigilatorPos: THREE.Vector3,
    timePressure: number,
    noiseLevel: number,
    invigilatorProximity: number,
    participantPos: THREE.Vector3
  ) {
    if (!this.isVisible) return;

    this.animTimer += delta;

    // Follow invigilator
    this.invigilatorRadius.position.set(invigilatorPos.x, invigilatorPos.y + 0.05, invigilatorPos.z);
    
    // Scale and pulse invigilator influence radius depending on proximity slider
    const invScale = 1.0 + Math.sin(this.animTimer * 3) * 0.12;
    this.invigilatorRadius.scale.set(invScale, invScale, 1);
    
    // Change color of invigilator radius: yellow at moderate, red when near
    const invMat = this.invigilatorRadius.material as THREE.MeshBasicMaterial;
    if (invigilatorProximity > 60) {
      invMat.color.setHex(0xef4444);
      invMat.opacity = 0.65;
    } else {
      invMat.color.setHex(0xf59e0b);
      invMat.opacity = 0.35;
    }

    // Participant Aura position & color
    this.participantAura.position.set(participantPos.x, participantPos.y + 0.04, participantPos.z);
    const partMat = this.participantAura.material as THREE.MeshBasicMaterial;
    if (timePressure > 70 || invigilatorProximity > 70) {
      partMat.color.setHex(0xef4444); // Red: High stress load
    } else if (timePressure > 40 || noiseLevel > 50) {
      partMat.color.setHex(0xf59e0b); // Amber: Elevated demand
    } else {
      partMat.color.setHex(0x38bdf8); // Sky blue: Nominal
    }

    // Pulse clock beacon
    const clockPulse = 1.0 + Math.sin(this.animTimer * (timePressure > 60 ? 6 : 2)) * 0.2;
    this.clockBeacon.scale.set(clockPulse, clockPulse, 1);
    this.clockWarningText.visible = timePressure > 60;
    (this.clockBeacon.material as THREE.MeshBasicMaterial).opacity = (timePressure / 100) * 0.8;

    // Sound wave expansion
    this.soundWaveRings.forEach(ring => {
      const phase = (this.animTimer * 2 + ring.userData.phase) % 2;
      const waveScale = 0.5 + phase * 2.2;
      ring.scale.set(waveScale, waveScale, 1);
      const ringMat = ring.material as THREE.MeshBasicMaterial;
      ringMat.opacity = Math.max(0, (1 - phase / 2) * (noiseLevel / 100) * 0.7);
      ring.visible = noiseLevel > 20;
    });
  }
}
