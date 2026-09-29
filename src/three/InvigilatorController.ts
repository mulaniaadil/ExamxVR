import * as THREE from 'three';
import { soundEngine } from '../audio/soundEngine';

export interface InvigilatorState {
  position: THREE.Vector3;
  targetPosition: THREE.Vector3;
  isPaused: boolean;
  pauseTimer: number;
  currentWaypointIndex: number;
  proximityMode: 'far' | 'medium' | 'near';
  distanceToParticipant: number;
}

export class InvigilatorController {
  public mesh: THREE.Group;
  private headMesh: THREE.Mesh;
  private bodyMesh: THREE.Mesh;
  private leftArm: THREE.Group;
  private rightArm: THREE.Group;
  private leftLeg: THREE.Group;
  private rightLeg: THREE.Group;
  private clipboardMesh: THREE.Mesh;

  private walkCycle: number = 0;
  private currentPath: THREE.Vector3[] = [];
  private currentWaypoint: number = 0;
  private speed: number = 1.6;
  private isPaused: boolean = false;
  private pauseTimer: number = 0;
  private proximityLevel: number = 20; // 0 to 100
  private participantPos: THREE.Vector3 = new THREE.Vector3(0, 1.4, 0);

  constructor() {
    this.mesh = new THREE.Group();
    this.mesh.name = 'Invigilator';

    // Build stylized, realistic-proportioned human model
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xd49b72 });
    const hairMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
    const shirtMat = new THREE.MeshLambertMaterial({ color: 0xe8eef5 }); // Formal crisp light blue/white shirt
    const tieMat = new THREE.MeshLambertMaterial({ color: 0x8b1e1e }); // Formal maroon tie/lanyard
    const trousersMat = new THREE.MeshLambertMaterial({ color: 0x22262b }); // Charcoal formal trousers
    const shoesMat = new THREE.MeshLambertMaterial({ color: 0x111111 });

    // Torso / Shirt
    const torsoGeo = new THREE.BoxGeometry(0.5, 0.65, 0.28);
    this.bodyMesh = new THREE.Mesh(torsoGeo, shirtMat);
    this.bodyMesh.position.y = 1.25;
    this.bodyMesh.castShadow = true;
    this.mesh.add(this.bodyMesh);

    // ID Lanyard / Tie
    const tieGeo = new THREE.BoxGeometry(0.08, 0.35, 0.02);
    const tie = new THREE.Mesh(tieGeo, tieMat);
    tie.position.set(0, 1.3, 0.15);
    this.mesh.add(tie);

    // Head & Hair
    const headGeo = new THREE.BoxGeometry(0.24, 0.28, 0.24);
    this.headMesh = new THREE.Mesh(headGeo, skinMat);
    this.headMesh.position.y = 1.72;
    this.headMesh.castShadow = true;
    this.mesh.add(this.headMesh);

    const hairGeo = new THREE.BoxGeometry(0.26, 0.1, 0.26);
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.set(0, 1.84, 0);
    this.mesh.add(hair);

    // Glasses / spectacles frame for academic invigilator look
    const glassesGeo = new THREE.BoxGeometry(0.22, 0.05, 0.04);
    const glassesMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const glasses = new THREE.Mesh(glassesGeo, glassesMat);
    glasses.position.set(0, 1.73, 0.13);
    this.mesh.add(glasses);

    // Arms
    const armGeo = new THREE.BoxGeometry(0.12, 0.55, 0.12);
    
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.32, 1.5, 0);
    const leftArmMesh = new THREE.Mesh(armGeo, shirtMat);
    leftArmMesh.position.y = -0.25;
    this.leftArm.add(leftArmMesh);
    const leftHand = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.1), skinMat);
    leftHand.position.y = -0.52;
    this.leftArm.add(leftHand);
    this.mesh.add(this.leftArm);

    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.32, 1.5, 0);
    const rightArmMesh = new THREE.Mesh(armGeo, shirtMat);
    rightArmMesh.position.y = -0.25;
    this.rightArm.add(rightArmMesh);
    const rightHand = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.1), skinMat);
    rightHand.position.y = -0.52;
    this.rightArm.add(rightHand);
    this.mesh.add(this.rightArm);

    // Clipboard in left hand (exam attendance sheet & extra papers)
    const clipGeo = new THREE.BoxGeometry(0.24, 0.32, 0.03);
    const clipMat = new THREE.MeshLambertMaterial({ color: 0x8b5a2b });
    this.clipboardMesh = new THREE.Mesh(clipGeo, clipMat);
    this.clipboardMesh.position.set(0, -0.42, 0.12);
    this.clipboardMesh.rotation.x = -0.3;
    this.leftArm.add(this.clipboardMesh);

    const paperGeo = new THREE.BoxGeometry(0.2, 0.28, 0.005);
    const paperMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const paper = new THREE.Mesh(paperGeo, paperMat);
    paper.position.set(0, 0, 0.02);
    this.clipboardMesh.add(paper);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.18, 0.65, 0.18);
    const shoeGeo = new THREE.BoxGeometry(0.19, 0.1, 0.28);

    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.14, 0.7, 0);
    const leftLegMesh = new THREE.Mesh(legGeo, trousersMat);
    leftLegMesh.position.y = -0.3;
    leftLegMesh.castShadow = true;
    this.leftLeg.add(leftLegMesh);
    const leftShoe = new THREE.Mesh(shoeGeo, shoesMat);
    leftShoe.position.set(0, -0.65, 0.05);
    this.leftLeg.add(leftShoe);
    this.mesh.add(this.leftLeg);

    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.14, 0.7, 0);
    const rightLegMesh = new THREE.Mesh(legGeo, trousersMat);
    rightLegMesh.position.y = -0.3;
    rightLegMesh.castShadow = true;
    this.rightLeg.add(rightLegMesh);
    const rightShoe = new THREE.Mesh(shoeGeo, shoesMat);
    rightShoe.position.set(0, -0.65, 0.05);
    this.rightLeg.add(rightShoe);
    this.mesh.add(this.rightLeg);

    // Initial position at front desk
    this.mesh.position.set(2.5, 0, -10.5);
    this.updatePath(20);
  }

  public setParticipantPosition(pos: THREE.Vector3) {
    this.participantPos.copy(pos);
  }

  public updatePath(proximity: number) {
    this.proximityLevel = proximity;
    this.currentWaypoint = 0;
    this.isPaused = false;
    this.pauseTimer = 0;

    // Build specific paths based on proximity
    if (proximity < 35) {
      // LOW PROXIMITY: stays in front examination area, pacing slowly
      this.speed = 1.0;
      this.currentPath = [
        new THREE.Vector3(3.5, 0, -10.5),
        new THREE.Vector3(1.5, 0, -11.0),
        new THREE.Vector3(-2.0, 0, -11.0),
        new THREE.Vector3(-4.0, 0, -10.5),
        new THREE.Vector3(-2.0, 0, -10.5),
        new THREE.Vector3(0.0, 0, -11.0),
        new THREE.Vector3(2.5, 0, -10.5),
      ];
    } else if (proximity < 70) {
      // MEDIUM PROXIMITY: walks down left & right aisles, moderate loop
      this.speed = 1.3;
      this.currentPath = [
        new THREE.Vector3(2.0, 0, -10.5),
        new THREE.Vector3(3.4, 0, -9.0),
        new THREE.Vector3(3.4, 0.8, -3.0),
        new THREE.Vector3(3.4, 1.4, 0.5), // near row 3
        new THREE.Vector3(3.4, 0.8, -3.0),
        new THREE.Vector3(3.4, 0, -9.0),
        new THREE.Vector3(0, 0, -10.5),
        new THREE.Vector3(-3.4, 0, -9.0),
        new THREE.Vector3(-3.4, 0.8, -3.0),
        new THREE.Vector3(-3.4, 1.4, 0.5),
        new THREE.Vector3(-3.4, 0, -9.0),
      ];
    } else {
      // HIGH PROXIMITY: frequent walks right next to participant, stops beside desk, looks closely
      this.speed = 1.5;
      const partZ = this.participantPos.z;
      const partY = this.participantPos.y;
      this.currentPath = [
        new THREE.Vector3(1.0, 0, -10.5),
        new THREE.Vector3(3.3, 0, -8.0),
        new THREE.Vector3(3.3, (partY * 0.5), partZ - 2.5),
        new THREE.Vector3(2.6, partY, partZ), // Right beside participant bench!
        new THREE.Vector3(2.6, partY, partZ), // Pause waypoint
        new THREE.Vector3(3.3, partY, partZ + 1.5),
        new THREE.Vector3(3.3, 0, -9.0),
        new THREE.Vector3(0, 0, -10.5),
        new THREE.Vector3(-3.3, 0, -8.0),
        new THREE.Vector3(-2.6, partY, partZ), // Beside left side of participant
        new THREE.Vector3(-2.6, partY, partZ), // Pause waypoint
        new THREE.Vector3(-3.3, 0, -9.0),
      ];
    }
  }

  public update(delta: number): { distanceToParticipant: number; isObservingParticipant: boolean } {
    if (this.currentPath.length === 0) {
      return { distanceToParticipant: 10, isObservingParticipant: false };
    }

    const target = this.currentPath[this.currentWaypoint];
    const distToParticipant = this.mesh.position.distanceTo(this.participantPos);

    if (this.isPaused) {
      this.pauseTimer -= delta;
      
      // Look towards participant when pausing nearby
      if (distToParticipant < 3.5) {
        const lookDir = new THREE.Vector3().subVectors(this.participantPos, this.mesh.position);
        lookDir.y = 0;
        const targetAngle = Math.atan2(lookDir.x, lookDir.z);
        this.mesh.rotation.y = THREE.MathUtils.lerp(this.mesh.rotation.y, targetAngle, 0.05);
        this.headMesh.rotation.x = 0.2; // look down at participant's paper
      } else {
        this.headMesh.rotation.x = 0;
      }

      // Settle arms and legs during pause
      this.leftArm.rotation.x = THREE.MathUtils.lerp(this.leftArm.rotation.x, 0, 0.1);
      this.rightArm.rotation.x = THREE.MathUtils.lerp(this.rightArm.rotation.x, 0, 0.1);
      this.leftLeg.rotation.x = THREE.MathUtils.lerp(this.leftLeg.rotation.x, 0, 0.1);
      this.rightLeg.rotation.x = THREE.MathUtils.lerp(this.rightLeg.rotation.x, 0, 0.1);

      if (this.pauseTimer <= 0) {
        this.isPaused = false;
        this.currentWaypoint = (this.currentWaypoint + 1) % this.currentPath.length;
      }

      return {
        distanceToParticipant: distToParticipant,
        isObservingParticipant: distToParticipant < 3.8
      };
    }

    // Move toward target
    const dir = new THREE.Vector3().subVectors(target, this.mesh.position);
    const distToTarget = dir.length();

    if (distToTarget < 0.2) {
      // Reached waypoint
      if (this.proximityLevel > 60 && distToParticipant < 3.5) {
        // Pause and observe participant for 3 seconds!
        this.isPaused = true;
        this.pauseTimer = 3.5;
        soundEngine.playFootstep();
      } else if (Math.random() < 0.25) {
        // Occasional brief pause
        this.isPaused = true;
        this.pauseTimer = 1.5 + Math.random() * 2;
      } else {
        this.currentWaypoint = (this.currentWaypoint + 1) % this.currentPath.length;
      }
    } else {
      dir.normalize();
      const moveStep = this.speed * delta;
      this.mesh.position.addScaledVector(dir, Math.min(moveStep, distToTarget));

      // Face direction of travel
      const targetAngle = Math.atan2(dir.x, dir.z);
      // Smooth rotation
      let diff = targetAngle - this.mesh.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      this.mesh.rotation.y += diff * Math.min(1, delta * 8);

      // Walk cycle animation
      this.walkCycle += delta * this.speed * 4.5;
      const legSwing = Math.sin(this.walkCycle) * 0.45;
      const armSwing = Math.sin(this.walkCycle) * 0.35;

      this.leftLeg.rotation.x = legSwing;
      this.rightLeg.rotation.x = -legSwing;
      this.rightArm.rotation.x = -armSwing;
      this.leftArm.rotation.x = armSwing * 0.4 - 0.2; // hold clipboard steady

      // Occasional footstep audio
      if (Math.sin(this.walkCycle) > 0.95) {
        soundEngine.playFootstep();
      }
    }

    return {
      distanceToParticipant: distToParticipant,
      isObservingParticipant: distToParticipant < 3.8 && this.isPaused
    };
  }
}
