import * as THREE from 'three';
import { soundEngine } from '../audio/soundEngine';
import { FurnitureErgonomics, TimePressureLevel } from '../types';
import { ExamPaperTextures } from './ExamPaperTextures';

export interface StudentInstance {
  id: number;
  row: number;
  col: number;
  section: 'left' | 'center' | 'right';
  root: THREE.Group;
  head: THREE.Mesh;
  hair: THREE.Mesh;
  faceFeatures: THREE.Group;
  torso: THREE.Mesh;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  rightHand: THREE.Group;
  paperMesh: THREE.Mesh;
  questionPaperMesh: THREE.Mesh;
  admitCardMesh: THREE.Mesh;
  deskItemsGroup: THREE.Group;
  penMesh: THREE.Mesh;
  seatPosition: THREE.Vector3;
  isParticipant: boolean;
  isActive: boolean;
  targetScale: number;
  currentScale: number;

  // Animation state
  state: 'writing' | 'thinking' | 'reading' | 'page_turning' | 'looking_clock' | 'adjusting' | 'raising_hand' | 'submitting' | 'left';
  timer: number;
  baseWritingSpeed: number;
  animPhase: number;

  // Posture parameters
  targetTorsoAngle: number;
  targetHeadAngle: number;

  // Base orientation facing chalkboard
  baseFacingAngle: number;

  // Walking submission path
  isWalking: boolean;
  walkPath: THREE.Vector3[];
  walkIndex: number;
  walkCycle: number;
}

export class StudentController {
  public group: THREE.Group;
  public students: StudentInstance[] = [];
  public participant: StudentInstance | null = null;
  private peerActivityLevel: number = 25;
  private ergonomics: FurnitureErgonomics = 'optimal';
  private temperature: number = 24;
  private timePressure: TimePressureLevel = 'low';

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'StudentsGroup';
  }

  public populate(
    seatingLayout: Array<{
      row: number;
      col: number;
      section: 'left' | 'center' | 'right';
      seatPos: THREE.Vector3;
      deskPos: THREE.Vector3;
      isParticipant?: boolean;
    }>
  ) {
    while (this.group.children.length > 0) {
      this.group.remove(this.group.children[0]);
    }
    this.students = [];

    // Realistic varied clothing color palette for engineering students
    const shirtColors = [
      0x2c3e50, 0x16a085, 0x2980b9, 0x8e44ad, 0xd35400,
      0xc0392b, 0x34495e, 0x1abc9c, 0x3d5a80, 0xee6c4d,
      0x293241, 0x588157, 0x3a5a40, 0x4a4e69, 0x6b705c
    ];

    const hairColors = [0x111111, 0x1a1a1a, 0x241711, 0x2d1f16, 0x382212];
    const skinColors = [0xeac086, 0xd49b72, 0xc68642, 0x8d5524, 0xf1c27d, 0xb87333];

    seatingLayout.forEach((seat, idx) => {
      const isPart = !!seat.isParticipant;
      const studentGroup = new THREE.Group();
      studentGroup.position.copy(seat.seatPos);

      // Rotate student so they face directly towards their desk and the front chalkboard
      const dir = new THREE.Vector3().subVectors(seat.deskPos, seat.seatPos);
      const facingAngle = Math.atan2(dir.x, dir.z);
      studentGroup.rotation.y = facingAngle;

      const skinColor = skinColors[idx % skinColors.length];
      const hairColor = hairColors[(idx * 3) % hairColors.length];
      const shirtColor = isPart ? 0x1d4ed8 : shirtColors[idx % shirtColors.length];

      const skinMat = new THREE.MeshLambertMaterial({ color: skinColor });
      const hairMat = new THREE.MeshLambertMaterial({ color: hairColor });
      const shirtMat = new THREE.MeshLambertMaterial({ color: shirtColor });
      const pantsMat = new THREE.MeshLambertMaterial({ color: 0x24272c });

      // Seated Lower Body & Legs (thighs extending forward toward desk)
      const legGeo = new THREE.BoxGeometry(0.13, 0.44, 0.13);
      const leftUpperLeg = new THREE.Mesh(legGeo, pantsMat);
      leftUpperLeg.rotation.x = Math.PI / 2;
      leftUpperLeg.position.set(-0.11, 0.45, 0.20);
      studentGroup.add(leftUpperLeg);

      const rightUpperLeg = new THREE.Mesh(legGeo, pantsMat);
      rightUpperLeg.rotation.x = Math.PI / 2;
      rightUpperLeg.position.set(0.11, 0.45, 0.20);
      studentGroup.add(rightUpperLeg);

      // Calves dropping down toward the floor
      const calfGeo = new THREE.BoxGeometry(0.11, 0.42, 0.11);
      const leftCalf = new THREE.Mesh(calfGeo, pantsMat);
      leftCalf.position.set(-0.11, 0.22, 0.38);
      studentGroup.add(leftCalf);

      const rightCalf = new THREE.Mesh(calfGeo, pantsMat);
      rightCalf.position.set(0.11, 0.22, 0.38);
      studentGroup.add(rightCalf);

      // Shoes resting on the floor
      const shoeGeo = new THREE.BoxGeometry(0.12, 0.08, 0.20);
      const shoeMat = new THREE.MeshLambertMaterial({ color: 0x18181b });
      const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
      leftShoe.position.set(-0.11, 0.04, 0.42);
      studentGroup.add(leftShoe);

      const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
      rightShoe.position.set(0.11, 0.04, 0.42);
      studentGroup.add(rightShoe);

      // Torso / Shirt
      const torsoGeo = new THREE.BoxGeometry(0.42, 0.5, 0.24);
      const torso = new THREE.Mesh(torsoGeo, shirtMat);
      torso.position.set(0, 0.75, 0);
      torso.rotation.x = 0.08;
      torso.castShadow = true;
      studentGroup.add(torso);

      // Head
      const headGeo = new THREE.BoxGeometry(0.2, 0.23, 0.2);
      const head = new THREE.Mesh(headGeo, skinMat);
      head.position.set(0, 1.12, 0.03);
      head.rotation.x = 0.22;
      head.castShadow = true;
      studentGroup.add(head);

      // Detailed Realistic Facial Features (Eyes, Nose, Mouth)
      const faceFeatures = new THREE.Group();
      faceFeatures.position.set(0, 1.12, 0.03);

      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1c1917 });
      const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
      
      // Eyes with whites
      [-0.05, 0.05].forEach(ex => {
        const eyeWhite = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.025, 0.01), eyeWhiteMat);
        eyeWhite.position.set(ex, 0.02, 0.105);
        faceFeatures.add(eyeWhite);

        const pupil = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.012), eyeMat);
        pupil.position.set(ex, 0.02, 0.106);
        faceFeatures.add(pupil);

        // Eyebrow
        const brow = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.012, 0.01), hairMat);
        brow.position.set(ex, 0.05, 0.106);
        faceFeatures.add(brow);
      });

      // Nose
      const nose = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.05, 0.04),
        new THREE.MeshLambertMaterial({ color: skinColor })
      );
      nose.position.set(0, -0.01, 0.115);
      faceFeatures.add(nose);

      // Mouth
      const mouth = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.012, 0.01),
        new THREE.MeshBasicMaterial({ color: 0x883333 })
      );
      mouth.position.set(0, -0.05, 0.105);
      faceFeatures.add(mouth);

      studentGroup.add(faceFeatures);

      // Hair (varied hair silhouettes)
      const hairStyleType = idx % 3;
      let hairGeo: THREE.BufferGeometry;
      if (hairStyleType === 0) {
        hairGeo = new THREE.BoxGeometry(0.22, 0.1, 0.22);
      } else if (hairStyleType === 1) {
        hairGeo = new THREE.BoxGeometry(0.23, 0.13, 0.21);
      } else {
        hairGeo = new THREE.BoxGeometry(0.21, 0.08, 0.23);
      }
      const hair = new THREE.Mesh(hairGeo, hairMat);
      hair.position.set(0, 1.22, 0.03);
      studentGroup.add(hair);

      // Left Arm (resting on desk and steadying the paper)
      const leftArm = new THREE.Group();
      leftArm.position.set(-0.24, 0.95, 0.04);

      const upperArmGeo = new THREE.BoxGeometry(0.08, 0.28, 0.08);
      const forearmGeo = new THREE.BoxGeometry(0.075, 0.26, 0.075);
      const handGeo = new THREE.BoxGeometry(0.065, 0.035, 0.08);

      const leftUpperMesh = new THREE.Mesh(upperArmGeo, shirtMat);
      leftUpperMesh.position.set(0.02, -0.12, 0.08);
      leftUpperMesh.rotation.x = 0.65;
      leftUpperMesh.rotation.z = -0.15;
      leftArm.add(leftUpperMesh);

      const leftForearmMesh = new THREE.Mesh(forearmGeo, shirtMat);
      leftForearmMesh.position.set(0.05, -0.22, 0.26);
      leftForearmMesh.rotation.x = 1.25;
      leftForearmMesh.rotation.z = -0.20;
      leftArm.add(leftForearmMesh);

      const leftHandMesh = new THREE.Mesh(handGeo, skinMat);
      leftHandMesh.position.set(0.07, -0.23, 0.38);
      leftArm.add(leftHandMesh);
      studentGroup.add(leftArm);

      // Right Arm (Writing arm with held examination pen)
      const rightArm = new THREE.Group();
      rightArm.position.set(0.24, 0.95, 0.04);

      const rightUpperMesh = new THREE.Mesh(upperArmGeo, shirtMat);
      rightUpperMesh.position.set(-0.02, -0.12, 0.08);
      rightUpperMesh.rotation.x = 0.70;
      rightUpperMesh.rotation.z = 0.15;
      rightArm.add(rightUpperMesh);

      const rightForearmMesh = new THREE.Mesh(forearmGeo, shirtMat);
      rightForearmMesh.position.set(-0.06, -0.21, 0.26);
      rightForearmMesh.rotation.x = 1.28;
      rightForearmMesh.rotation.z = 0.18;
      rightArm.add(rightForearmMesh);

      // Right Hand with Held Exam Pen
      const rightHand = new THREE.Group();
      rightHand.position.set(-0.09, -0.22, 0.38);

      const rightHandMesh = new THREE.Mesh(handGeo, skinMat);
      rightHand.add(rightHandMesh);

      // Held Examination Pen
      const heldPenGroup = new THREE.Group();
      const penBarrelGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.13, 8);
      const penMat = new THREE.MeshStandardMaterial({
        color: idx % 2 === 0 ? 0x1d4ed8 : 0x0f172a,
        roughness: 0.3,
        metalness: 0.3
      });
      const penBarrel = new THREE.Mesh(penBarrelGeo, penMat);
      penBarrel.rotation.x = 0.55;
      penBarrel.rotation.z = -0.25;
      heldPenGroup.add(penBarrel);

      const penTipGeo = new THREE.CylinderGeometry(0.001, 0.005, 0.016, 8);
      const penTipMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.9, roughness: 0.2 });
      const penTip = new THREE.Mesh(penTipGeo, penTipMat);
      penTip.position.set(0, -0.07, 0.04);
      penTip.rotation.x = 0.55;
      penTip.rotation.z = -0.25;
      heldPenGroup.add(penTip);

      heldPenGroup.position.set(0.01, -0.01, 0.02);
      rightHand.add(heldPenGroup);

      rightArm.add(rightHand);
      studentGroup.add(rightArm);

      // Detailed Examination Papers & Stationery on Desk
      // Desk surface is at y = 0.810, spans z = 0.41 to 0.89 in local coordinates
      const deskItemsGroup = new THREE.Group();
      deskItemsGroup.name = 'DeskItemsGroup';

      const paperWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.8 });

      // 1. Main Answer Booklet
      const bookletTex = ExamPaperTextures.getAnswerBooklet(idx);
      const bookletMat = new THREE.MeshStandardMaterial({
        map: bookletTex,
        roughness: 0.7
      });
      const bookletBoxMats = [
        paperWhiteMat, paperWhiteMat,
        bookletMat, paperWhiteMat,
        paperWhiteMat, paperWhiteMat
      ];
      const bookletMesh = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.006, 0.38), bookletBoxMats);
      bookletMesh.position.set(0.04, 0.814, 0.58);
      bookletMesh.rotation.y = -0.04 + (idx % 3) * 0.03;
      bookletMesh.castShadow = true;
      bookletMesh.receiveShadow = true;
      deskItemsGroup.add(bookletMesh);

      // Supplementary graph / rough calculation sheet peeking underneath
      if (idx % 2 === 0) {
        const graphTex = ExamPaperTextures.getGraphSheet();
        const graphMat = new THREE.MeshStandardMaterial({ map: graphTex, roughness: 0.7 });
        const graphMats = [
          paperWhiteMat, paperWhiteMat,
          graphMat, paperWhiteMat,
          paperWhiteMat, paperWhiteMat
        ];
        const graphMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.003, 0.32), graphMats);
        graphMesh.position.set(0.12, 0.811, 0.62);
        graphMesh.rotation.y = 0.12;
        deskItemsGroup.add(graphMesh);
      }

      // 2. Official IIT Kharagpur Examination Question Paper
      const qpTex = ExamPaperTextures.getQuestionPaper(idx);
      const qpMat = new THREE.MeshStandardMaterial({
        map: qpTex,
        roughness: 0.7
      });
      const qpBoxMats = [
        paperWhiteMat, paperWhiteMat,
        qpMat, paperWhiteMat,
        paperWhiteMat, paperWhiteMat
      ];
      const questionPaperMesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.004, 0.32), qpBoxMats);
      questionPaperMesh.position.set(-0.22, 0.812, 0.61);
      questionPaperMesh.rotation.y = 0.06;
      questionPaperMesh.castShadow = true;
      questionPaperMesh.receiveShadow = true;
      deskItemsGroup.add(questionPaperMesh);

      // 3. Official Candidate Admit Card / Hall Ticket
      const admitTex = ExamPaperTextures.getAdmitCard(idx);
      const admitMat = new THREE.MeshStandardMaterial({
        map: admitTex,
        roughness: 0.5
      });
      const admitBoxMats = [
        paperWhiteMat, paperWhiteMat,
        admitMat, paperWhiteMat,
        paperWhiteMat, paperWhiteMat
      ];
      const admitCardMesh = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.003, 0.075), admitBoxMats);
      admitCardMesh.position.set(-0.26, 0.814, 0.45);
      admitCardMesh.rotation.y = -0.04;
      admitCardMesh.castShadow = true;
      deskItemsGroup.add(admitCardMesh);

      // 4. Desk Stationery: Transparent Examination Ruler
      const rulerTex = ExamPaperTextures.getRulerTexture();
      const rulerMat = new THREE.MeshStandardMaterial({
        map: rulerTex,
        transparent: true,
        opacity: 0.85,
        roughness: 0.2
      });
      const rulerMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.002, 0.03), rulerMat);
      rulerMesh.position.set(0.23, 0.813, 0.54);
      rulerMesh.rotation.y = 0.05;
      deskItemsGroup.add(rulerMesh);

      // Spare Examination Pen resting on desk
      const sparePenGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.14, 8);
      const sparePenMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.4,
        roughness: 0.3
      });
      const sparePen = new THREE.Mesh(sparePenGeo, sparePenMat);
      sparePen.rotation.z = Math.PI / 2;
      sparePen.rotation.y = 0.18;
      sparePen.position.set(0.18, 0.816, 0.74);
      deskItemsGroup.add(sparePen);

      studentGroup.add(deskItemsGroup);

      // Participant special highlight base ring
      if (isPart) {
        const ringGeo = new THREE.RingGeometry(0.35, 0.45, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.name = 'ParticipantRing';
        ring.rotation.x = Math.PI / 2;
        ring.position.set(0, 0.05, 0);
        studentGroup.add(ring);
      }

      this.group.add(studentGroup);

      const studentInst: StudentInstance = {
        id: idx,
        row: seat.row,
        col: seat.col,
        section: seat.section,
        root: studentGroup,
        head,
        hair,
        faceFeatures,
        torso,
        leftArm,
        rightArm,
        rightHand,
        paperMesh: bookletMesh,
        questionPaperMesh,
        admitCardMesh,
        deskItemsGroup,
        penMesh: penBarrel,
        seatPosition: seat.seatPos.clone(),
        isParticipant: isPart,
        isActive: true,
        targetScale: 1,
        currentScale: 1,
        state: 'writing',
        timer: Math.random() * 5 + 2,
        baseWritingSpeed: 2.5 + Math.random() * 2,
        animPhase: Math.random() * Math.PI * 2,
        targetTorsoAngle: 0.08,
        targetHeadAngle: 0.22,
        baseFacingAngle: facingAngle,
        isWalking: false,
        walkPath: [],
        walkIndex: 0,
        walkCycle: 0
      };

      if (isPart) {
        this.participant = studentInst;
      }

      this.students.push(studentInst);
    });

    this.updateCrowdDensity('moderate');
  }

  public setParticipantFirstPerson(isFP: boolean) {
    if (!this.participant) return;
    this.participant.head.visible = !isFP;
    this.participant.hair.visible = !isFP;
    this.participant.faceFeatures.visible = !isFP;
  }

  public setErgonomics(ergo: FurnitureErgonomics) {
    this.ergonomics = ergo;
    this.students.forEach(student => {
      // High impact on participant workstation, subtle natural ripple on other students
      if (ergo === 'poor') {
        // Slouched forward, hunched neck, cramped writing posture
        student.targetTorsoAngle = student.isParticipant ? 0.32 : (0.24 + (student.id % 3) * 0.04);
        student.targetHeadAngle = student.isParticipant ? 0.42 : 0.35;
      } else if (ergo === 'moderate') {
        student.targetTorsoAngle = 0.12;
        student.targetHeadAngle = 0.24;
      } else {
        // Optimal: Neutral spinal posture, relaxed upright back
        student.targetTorsoAngle = student.isParticipant ? 0.04 : 0.06;
        student.targetHeadAngle = student.isParticipant ? 0.16 : 0.20;
      }
    });
  }

  public setTemperature(temp: number) {
    this.temperature = temp;
  }

  public setTimePressure(tp: TimePressureLevel) {
    this.timePressure = tp;
    this.students.forEach(s => {
      if (tp === 'high') {
        s.baseWritingSpeed = 4.8 + Math.random() * 2.0; // Fast urgent writing
      } else if (tp === 'moderate') {
        s.baseWritingSpeed = 3.2 + Math.random() * 1.5;
      } else {
        s.baseWritingSpeed = 2.2 + Math.random() * 1.0;
      }
    });
  }

  public updateCrowdDensity(densityLevel: 'low' | 'moderate' | 'high') {
    const totalCount = this.students.length;
    let targetPercent = 0.65;
    if (densityLevel === 'low') targetPercent = 0.30;
    else if (densityLevel === 'high') targetPercent = 0.92;

    const targetOccupiedCount = Math.max(10, Math.round(targetPercent * totalCount));

    this.students.forEach((student, i) => {
      if (student.isParticipant) {
        student.isActive = true;
        student.targetScale = 1;
        return;
      }
      const rank = ((i * 17) + (student.row * 7) + student.col) % totalCount;
      const shouldBeActive = rank < targetOccupiedCount;
      student.isActive = shouldBeActive;
      student.targetScale = shouldBeActive ? 1 : 0;
    });
  }

  public setPeerActivityLevel(level: number) {
    this.peerActivityLevel = level;
  }

  public triggerSubmissionEvent() {
    const candidates = this.students.filter(
      s => s.isActive && !s.isParticipant && s.state !== 'submitting' && s.state !== 'left' && s.row >= 2
    );
    if (candidates.length === 0) return;

    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    this.startSubmissionSequence(chosen);
  }

  private startSubmissionSequence(student: StudentInstance) {
    student.state = 'submitting';
    student.timer = 1.5;
    soundEngine.playPageTurn();

    const startPos = student.seatPosition.clone();
    const aisleX = student.section === 'left' ? -3.5 : (student.section === 'right' ? 3.5 : (student.col < 2 ? -3.5 : 3.5));

    student.walkPath = [
      new THREE.Vector3(startPos.x, startPos.y + 0.3, startPos.z),
      new THREE.Vector3(aisleX, startPos.y + 0.3, startPos.z),
      new THREE.Vector3(aisleX, 0.2, -9.5),
      new THREE.Vector3(2.0, 0.1, -10.5),
      new THREE.Vector3(6.5, 0.1, -11.0)
    ];
    student.walkIndex = 0;
    student.isWalking = false;
  }

  public update(delta: number) {
    if (this.peerActivityLevel > 65 && Math.random() < 0.0004) {
      this.triggerSubmissionEvent();
    }

    this.students.forEach(student => {
      if (Math.abs(student.currentScale - student.targetScale) > 0.02) {
        student.currentScale = THREE.MathUtils.lerp(student.currentScale, student.targetScale, delta * 4);
        student.root.scale.setScalar(student.currentScale);
        student.root.visible = student.currentScale > 0.05;
      }

      if (!student.isActive && student.currentScale <= 0.05) return;

      student.animPhase += delta * student.baseWritingSpeed;
      student.timer -= delta;

      // Submission walking state
      if (student.state === 'submitting') {
        if (!student.isWalking) {
          student.head.rotation.x = 0.1;
          student.faceFeatures.rotation.x = 0.1;
          student.rightArm.rotation.x = -0.4;
          student.torso.position.y = THREE.MathUtils.lerp(student.torso.position.y, 1.25, delta * 3);
          if (student.timer <= 0) {
            student.isWalking = true;
          }
        } else {
          const target = student.walkPath[student.walkIndex];
          if (target) {
            const dir = new THREE.Vector3().subVectors(target, student.root.position);
            const dist = dir.length();
            if (dist < 0.25) {
              student.walkIndex++;
              if (student.walkIndex === 4) {
                soundEngine.playPageTurn();
              }
            } else {
              dir.normalize();
              student.root.position.addScaledVector(dir, delta * 1.3);
              const angle = Math.atan2(dir.x, dir.z);
              student.root.rotation.y = angle;
            }
          } else {
            student.state = 'left';
            student.root.visible = false;
          }
        }
        return;
      }

      // Dynamic behavior state transitions
      if (student.timer <= 0) {
        const rand = Math.random();
        // Probability of clock checking increases dramatically under high time pressure
        const clockChance = this.timePressure === 'high' ? 0.35 : (this.timePressure === 'moderate' ? 0.15 : 0.05);

        // Probability of adjusting posture increases if poor ergonomics or high temp
        const adjustChance = (this.ergonomics === 'poor' ? 0.25 : 0.08) + (this.temperature > 26 ? 0.15 : 0);

        if (rand < clockChance) {
          student.state = 'looking_clock';
          student.timer = 1.2 + Math.random() * 1.5;
        } else if (rand < clockChance + adjustChance) {
          student.state = 'adjusting';
          student.timer = 2.0;
        } else if (rand < 0.65) {
          student.state = 'writing';
          student.timer = 4.0 + Math.random() * 6.0;
          if (Math.random() < 0.15) soundEngine.playWriting();
        } else if (rand < 0.85) {
          student.state = 'reading';
          student.timer = 3.0 + Math.random() * 4.0;
        } else {
          student.state = 'thinking';
          student.timer = 2.5 + Math.random() * 3.5;
        }
      }

      // Smooth torso posture interpolation based on Ergonomics
      student.torso.rotation.x = THREE.MathUtils.lerp(
        student.torso.rotation.x,
        student.targetTorsoAngle,
        delta * 3
      );

      // Behavior animation loops
      if (student.state === 'writing') {
        const penJiggleX = Math.sin(student.animPhase * 3.5) * 0.015;
        const penJiggleZ = Math.cos(student.animPhase * 2.2) * 0.008;
        student.rightHand.position.x = -0.09 + penJiggleX;
        student.rightHand.position.z = 0.38 + penJiggleZ;
        student.rightArm.rotation.x = THREE.MathUtils.lerp(student.rightArm.rotation.x, 0.92 + Math.sin(student.animPhase) * 0.02, delta * 5);
        student.rightArm.rotation.z = THREE.MathUtils.lerp(student.rightArm.rotation.z, 0.18, delta * 5);
        student.head.rotation.x = THREE.MathUtils.lerp(student.head.rotation.x, student.targetHeadAngle + 0.04, delta * 4);
        student.head.rotation.y = THREE.MathUtils.lerp(student.head.rotation.y, 0.02, delta * 4);
      } else if (student.state === 'looking_clock') {
        // Head tilts up toward clock at front center wall
        student.head.rotation.x = THREE.MathUtils.lerp(student.head.rotation.x, -0.26, delta * 6);
        student.head.rotation.y = THREE.MathUtils.lerp(
          student.head.rotation.y,
          student.section === 'left' ? 0.26 : (student.section === 'right' ? -0.26 : 0),
          delta * 6
        );
        student.rightArm.rotation.x = THREE.MathUtils.lerp(student.rightArm.rotation.x, 0.82, delta * 4);
        student.rightHand.position.set(-0.09, -0.22, 0.38);
      } else if (student.state === 'thinking') {
        // Head tilted slightly sideways, pen tapping chin or hovering above paper
        student.head.rotation.x = THREE.MathUtils.lerp(student.head.rotation.x, 0.05, delta * 4);
        student.head.rotation.y = THREE.MathUtils.lerp(student.head.rotation.y, 0.18, delta * 4);
        student.rightArm.rotation.x = THREE.MathUtils.lerp(student.rightArm.rotation.x, 0.55, delta * 4);
        student.rightHand.position.set(-0.09, -0.20, 0.36);
      } else if (student.state === 'reading') {
        // Head turned slightly towards question paper on the left
        student.head.rotation.x = THREE.MathUtils.lerp(student.head.rotation.x, 0.28, delta * 4);
        student.head.rotation.y = THREE.MathUtils.lerp(student.head.rotation.y, -0.20, delta * 4);
        student.rightArm.rotation.x = THREE.MathUtils.lerp(student.rightArm.rotation.x, 0.80, delta * 4);
        student.rightHand.position.set(-0.09, -0.22, 0.38);
      } else if (student.state === 'adjusting') {
        // Restless posture shift (shrugging / stretching back)
        const shift = Math.sin(student.timer * 3) * 0.08;
        student.torso.rotation.z = shift;
        student.rightArm.rotation.x = THREE.MathUtils.lerp(student.rightArm.rotation.x, 0.35, delta * 4);
      }

      // Synchronize face features with head
      student.faceFeatures.rotation.copy(student.head.rotation);
    });
  }
}
