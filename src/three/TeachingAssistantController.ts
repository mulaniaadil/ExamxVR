import * as THREE from 'three';
import { soundEngine } from '../audio/soundEngine';

export interface TAInstance {
  id: number;
  mesh: THREE.Group;
  headMesh: THREE.Mesh;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  walkCycle: number;
  speed: number;
  currentWaypoint: number;
  path: THREE.Vector3[];
  isPaused: boolean;
  pauseTimer: number;
  assignedAisle: 'left' | 'right';
  bundleMesh: THREE.Mesh;
}

export class TeachingAssistantController {
  public group: THREE.Group;
  public tas: TAInstance[] = [];
  private isEnabled: boolean = false;
  private activityLevel: 'low' | 'moderate' | 'high' = 'moderate';

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'TeachingAssistantsGroup';
    this.createTAs();
    this.group.visible = false;
  }

  private createTAs() {
    // Two TAs with distinct appearance and realistic university attire
    const configs = [
      {
        id: 1,
        aisle: 'left' as const,
        shirtColor: 0x2563eb, // Royal blue polo
        trousersColor: 0x1f2937, // Dark slate
        hairColor: 0x1c1917,
        skinColor: 0xd49b72,
        height: 1.74,
        startPos: new THREE.Vector3(-3.5, 0, -10.0),
        path: [
          new THREE.Vector3(-3.5, 0, -10.0),
          new THREE.Vector3(-3.5, 0.4, -6.0),
          new THREE.Vector3(-3.5, 1.1, -1.0),
          new THREE.Vector3(-3.5, 1.8, 3.5),
          new THREE.Vector3(-3.5, 2.3, 7.5),
          new THREE.Vector3(-3.5, 1.8, 3.5),
          new THREE.Vector3(-3.5, 0.4, -6.0),
          new THREE.Vector3(-1.5, 0, -10.5),
        ]
      },
      {
        id: 2,
        aisle: 'right' as const,
        shirtColor: 0x059669, // Emerald green formal shirt
        trousersColor: 0x374151, // Grey trousers
        hairColor: 0x292524,
        skinColor: 0xc68642,
        height: 1.70,
        startPos: new THREE.Vector3(3.5, 0, -10.0),
        path: [
          new THREE.Vector3(3.5, 0, -10.0),
          new THREE.Vector3(3.5, 0.4, -6.0),
          new THREE.Vector3(3.5, 1.1, -1.0),
          new THREE.Vector3(3.5, 1.8, 3.5),
          new THREE.Vector3(3.5, 2.3, 7.5),
          new THREE.Vector3(3.5, 1.8, 3.5),
          new THREE.Vector3(3.5, 0.4, -6.0),
          new THREE.Vector3(1.5, 0, -10.5),
        ]
      }
    ];

    configs.forEach(cfg => {
      const taMesh = new THREE.Group();
      taMesh.position.copy(cfg.startPos);

      const skinMat = new THREE.MeshLambertMaterial({ color: cfg.skinColor });
      const hairMat = new THREE.MeshLambertMaterial({ color: cfg.hairColor });
      const shirtMat = new THREE.MeshLambertMaterial({ color: cfg.shirtColor });
      const pantsMat = new THREE.MeshLambertMaterial({ color: cfg.trousersColor });
      const shoesMat = new THREE.MeshLambertMaterial({ color: 0x111111 });

      // Torso
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.62, 0.26), shirtMat);
      torso.position.y = 1.2;
      torso.castShadow = true;
      taMesh.add(torso);

      // TA Badge / Lanyard
      const lanyard = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.32, 0.02),
        new THREE.MeshLambertMaterial({ color: 0xf59e0b })
      );
      lanyard.position.set(0, 1.25, 0.14);
      taMesh.add(lanyard);

      // Head & Hair
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.25, 0.22), skinMat);
      head.position.y = 1.65;
      head.castShadow = true;
      taMesh.add(head);

      const hair = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 0.24), hairMat);
      hair.position.y = 1.76;
      taMesh.add(hair);

      // Arms
      const armGeo = new THREE.BoxGeometry(0.11, 0.52, 0.11);
      const leftArm = new THREE.Group();
      leftArm.position.set(-0.29, 1.44, 0);
      const leftArmMesh = new THREE.Mesh(armGeo, shirtMat);
      leftArmMesh.position.y = -0.22;
      leftArm.add(leftArmMesh);
      taMesh.add(leftArm);

      const rightArm = new THREE.Group();
      rightArm.position.set(0.29, 1.44, 0);
      const rightArmMesh = new THREE.Mesh(armGeo, shirtMat);
      rightArmMesh.position.y = -0.22;
      rightArm.add(rightArmMesh);
      taMesh.add(rightArm);

      // Extra exam answer sheets bundle held in left arm
      const bundle = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.08, 0.32),
        new THREE.MeshLambertMaterial({ color: 0xffffff })
      );
      bundle.position.set(0, -0.35, 0.15);
      leftArm.add(bundle);

      // Legs
      const legGeo = new THREE.BoxGeometry(0.16, 0.62, 0.16);
      const leftLeg = new THREE.Group();
      leftLeg.position.set(-0.13, 0.65, 0);
      const leftLegMesh = new THREE.Mesh(legGeo, pantsMat);
      leftLegMesh.position.y = -0.28;
      leftLeg.add(leftLegMesh);
      const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.09, 0.25), shoesMat);
      leftShoe.position.set(0, -0.6, 0.04);
      leftLeg.add(leftShoe);
      taMesh.add(leftLeg);

      const rightLeg = new THREE.Group();
      rightLeg.position.set(0.13, 0.65, 0);
      const rightLegMesh = new THREE.Mesh(legGeo, pantsMat);
      rightLegMesh.position.y = -0.28;
      rightLeg.add(rightLegMesh);
      const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.09, 0.25), shoesMat);
      rightShoe.position.set(0, -0.6, 0.04);
      rightLeg.add(rightShoe);
      taMesh.add(rightLeg);

      this.group.add(taMesh);

      this.tas.push({
        id: cfg.id,
        mesh: taMesh,
        headMesh: head,
        leftLeg,
        rightLeg,
        leftArm,
        rightArm,
        walkCycle: Math.random() * Math.PI,
        speed: 1.2,
        currentWaypoint: 0,
        path: cfg.path,
        isPaused: false,
        pauseTimer: Math.random() * 3 + 1,
        assignedAisle: cfg.aisle,
        bundleMesh: bundle
      });
    });
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    this.group.visible = enabled;
  }

  public setActivityLevel(level: 'low' | 'moderate' | 'high') {
    this.activityLevel = level;
    this.tas.forEach(ta => {
      ta.speed = level === 'high' ? 1.5 : level === 'moderate' ? 1.2 : 0.8;
    });
  }

  public update(delta: number) {
    if (!this.isEnabled) return;

    this.tas.forEach(ta => {
      if (ta.isPaused) {
        ta.pauseTimer -= delta;

        // Reset limbs to resting standing pose
        ta.leftLeg.rotation.x = THREE.MathUtils.lerp(ta.leftLeg.rotation.x, 0, 0.1);
        ta.rightLeg.rotation.x = THREE.MathUtils.lerp(ta.rightLeg.rotation.x, 0, 0.1);
        ta.rightArm.rotation.x = THREE.MathUtils.lerp(ta.rightArm.rotation.x, 0, 0.1);
        ta.leftArm.rotation.x = THREE.MathUtils.lerp(ta.leftArm.rotation.x, -0.3, 0.1);

        if (ta.pauseTimer <= 0) {
          ta.isPaused = false;
          ta.currentWaypoint = (ta.currentWaypoint + 1) % ta.path.length;
        }
        return;
      }

      const target = ta.path[ta.currentWaypoint];
      if (!target) return;

      const dir = new THREE.Vector3().subVectors(target, ta.mesh.position);
      const dist = dir.length();

      if (dist < 0.2) {
        // Reached waypoint: pause probability based on activity level
        const pauseChance = this.activityLevel === 'low' ? 0.7 : this.activityLevel === 'moderate' ? 0.35 : 0.15;
        if (Math.random() < pauseChance) {
          ta.isPaused = true;
          ta.pauseTimer = this.activityLevel === 'low' ? 4.0 : 2.0;
        } else {
          ta.currentWaypoint = (ta.currentWaypoint + 1) % ta.path.length;
        }
      } else {
        dir.normalize();
        const moveStep = ta.speed * delta;
        ta.mesh.position.addScaledVector(dir, Math.min(moveStep, dist));

        // Smooth rotation to face travel direction
        const targetAngle = Math.atan2(dir.x, dir.z);
        let diff = targetAngle - ta.mesh.rotation.y;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        ta.mesh.rotation.y += diff * Math.min(1, delta * 8);

        // Walk cycle animation
        ta.walkCycle += delta * ta.speed * 4.2;
        const legSwing = Math.sin(ta.walkCycle) * 0.42;
        const armSwing = Math.sin(ta.walkCycle) * 0.32;

        ta.leftLeg.rotation.x = legSwing;
        ta.rightLeg.rotation.x = -legSwing;
        ta.rightArm.rotation.x = -armSwing;
        ta.leftArm.rotation.x = -0.3 + armSwing * 0.15; // Hold answer paper bundle securely
      }
    });
  }
}
