import * as THREE from 'three';
import { InvigilatorController } from './InvigilatorController';
import { StudentController } from './StudentController';
import { TeachingAssistantController } from './TeachingAssistantController';
import { StressVisualizer } from './StressVisualizer';
import { ExamPaperTextures } from './ExamPaperTextures';
import {
  CameraMode,
  PrimaryFactors,
  ActivityModifiers,
  FurnitureErgonomics,
  LightingCondition,
  TimePressureLevel,
  StudentDensityLevel
} from '../types';

export class ClassroomScene {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private topCamera: THREE.OrthographicCamera;

  // Controllers
  public invigilator: InvigilatorController;
  public studentController: StudentController;
  public taController: TeachingAssistantController;
  public stressVisualizer: StressVisualizer;

  // Lighting elements
  private ambientLight: THREE.AmbientLight;
  private dirLight: THREE.DirectionalLight;
  private ceilingLightMeshes: THREE.Mesh[] = [];
  private ceilingPointLights: THREE.PointLight[] = [];

  // Ceiling fans
  private fanBlades: THREE.Group[] = [];

  // Clock dynamic canvas texture
  private clockCanvas: HTMLCanvasElement;
  private clockCtx: CanvasRenderingContext2D;
  private clockTexture: THREE.CanvasTexture;
  private clockMesh: THREE.Mesh;
  private remainingSeconds: number = 3600; // default 1 hr (Low)
  private clockUpdateTimer: number = 0;

  // Camera handling
  private cameraMode: CameraMode = 'cinematic';
  private targetCameraPos: THREE.Vector3 = new THREE.Vector3();
  private targetCameraLook: THREE.Vector3 = new THREE.Vector3();
  private currentCameraLook: THREE.Vector3 = new THREE.Vector3();
  private orbitAngles = { theta: 0.8, phi: 0.52, radius: 16 };
  private isDragging: boolean = false;
  private prevMouse = { x: 0, y: 0 };
  private firstPersonLook = { yaw: 0, pitch: -0.05 };

  // Current simulation factors & modifiers
  private factors: PrimaryFactors = {
    furnitureErgonomics: 'optimal',
    temperature: 24,
    lighting: 'optimal',
    noise: 35,
    timePressure: 'low',
    studentDensity: 'moderate'
  };

  private modifiers: ActivityModifiers = {
    invigilatorPatrol: 'normal',
    teachingAssistants: false,
    taActivity: 'moderate'
  };

  private animationFrameId: number | null = null;
  private lastTime: number = performance.now();
  private isRunning: boolean = true;
  public participantPosition: THREE.Vector3 = new THREE.Vector3(0, 1.4, 0);

  constructor(container: HTMLElement) {
    this.container = container;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f1115);
    this.scene.fog = new THREE.FogExp2(0x181c24, 0.012);

    // 2. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // 3. Cameras
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(48, aspect, 0.1, 100);
    this.topCamera = new THREE.OrthographicCamera(-18 * aspect, 18 * aspect, 18, -18, 0.1, 100);
    this.topCamera.position.set(0, 26, 0);
    this.topCamera.lookAt(0, 0, 0);

    // 4. Lights
    this.ambientLight = new THREE.AmbientLight(0xfff7ed, 0.65);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xfffbeb, 0.85);
    this.dirLight.position.set(-14, 14, 6);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 45;
    this.dirLight.shadow.camera.left = -18;
    this.dirLight.shadow.camera.right = 18;
    this.dirLight.shadow.camera.top = 18;
    this.dirLight.shadow.camera.bottom = -18;
    this.scene.add(this.dirLight);

    // 5. Clock texture canvas
    this.clockCanvas = document.createElement('canvas');
    this.clockCanvas.width = 512;
    this.clockCanvas.height = 256;
    this.clockCtx = this.clockCanvas.getContext('2d')!;
    this.clockTexture = new THREE.CanvasTexture(this.clockCanvas);
    this.clockMesh = this.createClockMesh();

    // 6. Build Classroom Architecture (Nalanda Classroom Complex style)
    this.buildNalandaRoom();
    this.buildRadiatingCeilingAndFans();
    this.buildFrontExaminationArea();
    const seatingLayout = this.buildCurvedTieredBenches();

    // 7. Initialize Controllers
    this.invigilator = new InvigilatorController();
    this.invigilator.setParticipantPosition(this.participantPosition);
    this.scene.add(this.invigilator.mesh);

    this.taController = new TeachingAssistantController();
    this.scene.add(this.taController.group);

    this.studentController = new StudentController();
    this.studentController.populate(seatingLayout);
    this.scene.add(this.studentController.group);

    this.stressVisualizer = new StressVisualizer();
    this.scene.add(this.stressVisualizer.group);

    // 8. Event listeners
    this.setupControls();
    this.setCameraMode('cinematic');

    // 9. Start Loop
    this.animate = this.animate.bind(this);
    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  private buildNalandaRoom() {
    // Room dimensions: Width: 28m, Length: 30m, Height: 7.2m
    const roomWidth = 28;
    const roomLength = 30;
    const roomHeight = 7.2;

    // Floor: White tiles with realistic ceramic grid and specular polish
    const floorGeo = new THREE.PlaneGeometry(roomWidth, roomLength);
    const floorTileTex = this.createWhiteTileTexture(4);
    floorTileTex.repeat.set(20, 22);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: floorTileTex,
      roughness: 0.22,
      metalness: 0.04
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Walls: Light off-white / warm grey walls
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xedeae2,
      roughness: 0.92
    });

    // Front Wall (Z = -15)
    const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(roomWidth, roomHeight), wallMat);
    frontWall.position.set(0, roomHeight / 2, -roomLength / 2);
    frontWall.receiveShadow = true;
    this.scene.add(frontWall);

    // Back Wall (Z = +15)
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(roomWidth, roomHeight), wallMat);
    backWall.position.set(0, roomHeight / 2, roomLength / 2);
    backWall.rotation.y = Math.PI;
    this.scene.add(backWall);

    // Left Wall (X = -14)
    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(roomLength, roomHeight), wallMat);
    leftWall.position.set(-roomWidth / 2, roomHeight / 2, 0);
    leftWall.rotation.y = Math.PI / 2;
    this.scene.add(leftWall);

    // Right Wall (X = +14)
    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(roomLength, roomHeight), wallMat);
    rightWall.position.set(roomWidth / 2, roomHeight / 2, 0);
    rightWall.rotation.y = -Math.PI / 2;
    this.scene.add(rightWall);

    // Black Ceiling (Exact Nalanda style black ceiling with radiating lights)
    const ceilingGeo = new THREE.PlaneGeometry(roomWidth, roomLength);
    const ceilingMat = new THREE.MeshStandardMaterial({ color: 0x0c0e12, roughness: 0.95 });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.position.set(0, roomHeight, 0);
    ceiling.rotation.x = Math.PI / 2;
    this.scene.add(ceiling);

    // Suspended Vertical Acoustic Wall Baffles (As clearly seen in Screenshots 1, 2, 3!)
    // Alternating warm mustard yellow and cream rectangular vertical acoustic panels
    const mustardMat = new THREE.MeshStandardMaterial({ color: 0xd49a37, roughness: 0.8 });
    const creamMat = new THREE.MeshStandardMaterial({ color: 0xf5f1e8, roughness: 0.85 });
    const panelGeo = new THREE.BoxGeometry(0.12, 2.6, 1.4);

    // Left wall vertical acoustic baffles
    for (let pz = -11; pz <= 12; pz += 2.6) {
      const isMustard = Math.abs(Math.round(pz)) % 2 === 0;
      const panel = new THREE.Mesh(panelGeo, isMustard ? mustardMat : creamMat);
      panel.position.set(-roomWidth / 2 + 0.12, 4.4, pz);
      panel.castShadow = true;
      this.scene.add(panel);
    }

    // Right wall vertical acoustic baffles
    for (let pz = -11; pz <= 12; pz += 2.6) {
      const isMustard = Math.abs(Math.round(pz)) % 2 === 1;
      const panel = new THREE.Mesh(panelGeo, isMustard ? mustardMat : creamMat);
      panel.position.set(roomWidth / 2 - 0.12, 4.4, pz);
      panel.castShadow = true;
      this.scene.add(panel);
    }

    // Front stage curved platform (White tiles matching floor)
    const stageGeo = new THREE.CylinderGeometry(8.5, 9.0, 0.35, 32, 1, false, 0, Math.PI);
    const stageTileTex = this.createWhiteTileTexture(4);
    stageTileTex.repeat.set(7, 7);
    const stageMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: stageTileTex,
      roughness: 0.25,
      metalness: 0.04
    });
    const stage = new THREE.Mesh(stageGeo, stageMat);
    stage.rotation.y = Math.PI / 2;
    stage.position.set(0, 0.175, -11.5);
    stage.receiveShadow = true;
    this.scene.add(stage);

    // Examination Hall Doors: 1 on Left Side, 1 on Right Side
    this.buildSideDoors(roomWidth);
  }

  private buildSideDoors(roomWidth: number) {
    const leftDoor = this.createDoubleDoorGroup('DOOR 1 • NORTH AISLE', 'HALL NR-122');
    leftDoor.position.set(-roomWidth / 2 + 0.02, 0, -8.8);
    leftDoor.rotation.y = Math.PI / 2;
    this.scene.add(leftDoor);

    const rightDoor = this.createDoubleDoorGroup('DOOR 2 • SOUTH AISLE', 'HALL NR-122');
    rightDoor.position.set(roomWidth / 2 - 0.02, 0, -8.8);
    rightDoor.rotation.y = -Math.PI / 2;
    this.scene.add(rightDoor);
  }

  private createDoubleDoorGroup(doorLabel: string, roomCode: string): THREE.Group {
    const doorGroup = new THREE.Group();
    doorGroup.name = `ExamHallDoor_${doorLabel}`;

    // Overall dimensions:
    // Frame outer: Width 1.88m, Height 2.65m, Depth 0.10m
    // Leaves: 2 leaves, each Width 0.84m, Height 2.52m, Thickness 0.045m
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Dark anodized architectural bronze/charcoal frame
      roughness: 0.35,
      metalness: 0.4
    });

    const doorLeafTex = this.createDoorLeafTexture(roomCode);
    const doorLeafMat = new THREE.MeshStandardMaterial({
      color: 0x6b3a16, // Matching natural warm institutional wood
      map: doorLeafTex,
      roughness: 0.4,
      metalness: 0.05
    });

    const steelMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.9,
      roughness: 0.18
    });

    const darkTrimMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.7
    });

    // 1. Frame Jambs and Lintel
    const jambGeo = new THREE.BoxGeometry(0.08, 2.65, 0.10);
    const leftJamb = new THREE.Mesh(jambGeo, frameMat);
    leftJamb.position.set(-0.90, 1.325, 0.04);
    leftJamb.castShadow = true;
    doorGroup.add(leftJamb);

    const rightJamb = new THREE.Mesh(jambGeo, frameMat);
    rightJamb.position.set(0.90, 1.325, 0.04);
    rightJamb.castShadow = true;
    doorGroup.add(rightJamb);

    const lintelGeo = new THREE.BoxGeometry(1.88, 0.08, 0.10);
    const lintel = new THREE.Mesh(lintelGeo, frameMat);
    lintel.position.set(0, 2.61, 0.04);
    lintel.castShadow = true;
    doorGroup.add(lintel);

    // Center Astragal / Meeting Stile
    const astragalGeo = new THREE.BoxGeometry(0.024, 2.54, 0.06);
    const astragal = new THREE.Mesh(astragalGeo, darkTrimMat);
    astragal.position.set(0, 1.30, 0.045);
    doorGroup.add(astragal);

    // Floor Threshold Plate (Satin Aluminum)
    const thresholdGeo = new THREE.BoxGeometry(1.86, 0.016, 0.16);
    const threshold = new THREE.Mesh(thresholdGeo, steelMat);
    threshold.position.set(0, 0.008, 0.04);
    doorGroup.add(threshold);

    // 2. Door Leaves (Left & Right)
    const leafGeo = new THREE.BoxGeometry(0.84, 2.52, 0.045);

    // Left leaf
    const leftLeaf = new THREE.Mesh(leafGeo, doorLeafMat);
    leftLeaf.position.set(-0.44, 1.29, 0.035);
    leftLeaf.castShadow = true;
    leftLeaf.receiveShadow = true;
    doorGroup.add(leftLeaf);

    // Right leaf
    const rightLeaf = new THREE.Mesh(leafGeo, doorLeafMat);
    rightLeaf.position.set(0.44, 1.29, 0.035);
    rightLeaf.castShadow = true;
    rightLeaf.receiveShadow = true;
    doorGroup.add(rightLeaf);

    // 3. Safety Glass Observation Vision Panels (Narrow inspection windows at eye level)
    const glassGeo = new THREE.BoxGeometry(0.18, 0.92, 0.015);
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xcfe2ff,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
      metalness: 0.2
    });
    const glassBezelGeo = new THREE.BoxGeometry(0.205, 0.945, 0.052);

    [-0.44, 0.44].forEach((posX) => {
      // Glass bezel
      const bezel = new THREE.Mesh(glassBezelGeo, darkTrimMat);
      bezel.position.set(posX, 1.55, 0.035);
      doorGroup.add(bezel);

      // Glass pane
      const pane = new THREE.Mesh(glassGeo, glassMat);
      pane.position.set(posX, 1.55, 0.035);
      doorGroup.add(pane);
    });

    // 4. Commercial Stainless Steel Panic / Crash Bars (Waist height)
    const pushBarGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.66, 12);
    [-0.44, 0.44].forEach((posX) => {
      const bar = new THREE.Mesh(pushBarGeo, steelMat);
      bar.rotation.z = Math.PI / 2;
      bar.position.set(posX, 1.02, 0.075);
      doorGroup.add(bar);

      // Mounting brackets
      [-0.30, 0.30].forEach((bx) => {
        const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.045, 0.04), steelMat);
        bracket.position.set(posX + bx, 1.02, 0.055);
        doorGroup.add(bracket);
      });
    });

    // 5. Stainless Steel Protective Kickplates (At base of both leaves)
    const kickplateGeo = new THREE.BoxGeometry(0.80, 0.28, 0.004);
    [-0.44, 0.44].forEach((posX) => {
      const kickplate = new THREE.Mesh(kickplateGeo, steelMat);
      kickplate.position.set(posX, 0.18, 0.06);
      doorGroup.add(kickplate);
    });

    // 6. Hydraulic Overhead Door Closers (Mounted at top of leaves)
    const closerBodyGeo = new THREE.BoxGeometry(0.22, 0.06, 0.055);
    [-0.44, 0.44].forEach((posX) => {
      const closer = new THREE.Mesh(closerBodyGeo, frameMat);
      closer.position.set(posX, 2.48, 0.07);
      doorGroup.add(closer);

      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.14, 6), steelMat);
      arm.rotation.x = 0.4;
      arm.position.set(posX, 2.54, 0.065);
      doorGroup.add(arm);
    });

    // 7. Official Illuminated Green LED Exit Sign (Above Door)
    const exitBoxGeo = new THREE.BoxGeometry(0.72, 0.22, 0.06);
    const exitBox = new THREE.Mesh(exitBoxGeo, frameMat);
    exitBox.position.set(0, 2.82, 0.05);
    doorGroup.add(exitBox);

    const exitTex = this.createExitSignTexture(doorLabel);
    const exitSignMat = new THREE.MeshStandardMaterial({
      map: exitTex,
      emissive: 0x10b981,
      emissiveIntensity: 0.95,
      roughness: 0.2
    });
    const exitFace = new THREE.Mesh(new THREE.PlaneGeometry(0.70, 0.20), exitSignMat);
    exitFace.position.set(0, 2.82, 0.082);
    doorGroup.add(exitFace);

    // Subtle downlight on doorway
    const exitLight = new THREE.PointLight(0x34d399, 0.6, 3.5);
    exitLight.position.set(0, 2.75, 0.2);
    doorGroup.add(exitLight);

    return doorGroup;
  }

  private createDoorLeafTexture(roomCode: string): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Rich teak / mahogany wood background
    ctx.fillStyle = '#653614';
    ctx.fillRect(0, 0, 512, 1024);

    // Vertical wood grains
    const grains = ['#733f17', '#5a2f11', '#7d451a', '#50280d', '#82481d', '#552c0f'];
    for (let x = 0; x < 512; x += 3) {
      ctx.fillStyle = grains[Math.floor(Math.sin(x * 0.15) * 2.8 + 3) % grains.length];
      ctx.fillRect(x, 0, 3, 1024);
    }

    // Wood wave grain anomalies
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = 'rgba(45, 20, 6, 0.15)';
      const waveY = (i * 54) % 1024;
      ctx.beginPath();
      ctx.ellipse(256, waveY, 260, Math.random() * 20 + 8, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Decorative perimeter inset groove
    ctx.strokeStyle = 'rgba(30, 12, 4, 0.5)';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 40, 452, 944);

    ctx.strokeStyle = 'rgba(180, 105, 45, 0.25)';
    ctx.lineWidth = 2;
    ctx.strokeRect(32, 42, 448, 940);

    // Official Examination Hall Plaque on door leaf (above window)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(80, 80, 352, 110);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 3;
    ctx.strokeRect(84, 84, 344, 102);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('IIT KHARAGPUR', 256, 118);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 22px monospace';
    ctx.fillText(roomCode, 256, 148);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('EXAMINATION HALL', 256, 172);

    // "SILENCE PLEASE" badge near bottom
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(110, 820, 292, 45);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('SILENCE • EXAM IN PROGRESS', 256, 849);

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }

  private createExitSignTexture(doorLabel: string): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 160;
    const ctx = canvas.getContext('2d')!;

    // Safety green illuminated gradient
    const grad = ctx.createLinearGradient(0, 0, 512, 0);
    grad.addColorStop(0, '#047857');
    grad.addColorStop(0.5, '#059669');
    grad.addColorStop(1, '#047857');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 160);

    // Border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, 496, 144);

    // Running man exit pictogram on left
    ctx.fillStyle = '#ffffff';
    // Head
    ctx.beginPath();
    ctx.arc(80, 50, 14, 0, Math.PI * 2);
    ctx.fill();
    // Torso and legs
    ctx.beginPath();
    ctx.moveTo(80, 66);
    ctx.lineTo(84, 100);
    ctx.lineTo(104, 126);
    ctx.lineTo(96, 132);
    ctx.lineTo(76, 106);
    ctx.lineTo(62, 128);
    ctx.lineTo(54, 122);
    ctx.lineTo(72, 94);
    ctx.lineTo(72, 74);
    ctx.lineTo(56, 88);
    ctx.lineTo(50, 80);
    ctx.lineTo(74, 66);
    ctx.closePath();
    ctx.fill();

    // Doorway frame icon next to running man
    ctx.fillRect(115, 34, 10, 94);
    ctx.fillRect(115, 34, 35, 10);
    ctx.fillRect(115, 118, 35, 10);

    // Bold "EXIT" text
    ctx.font = '900 64px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('EXIT', 170, 92);

    // Door subtitle (e.g. DOOR 1 / DOOR 2)
    ctx.font = 'bold 20px monospace';
    ctx.fillStyle = '#d1fae5';
    ctx.fillText(doorLabel, 172, 128);

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }

  private buildRadiatingCeilingAndFans() {
    // Exact Nalanda ceiling light pattern: radiating rectangular white LED slats fanning out towards seating
    const ledMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfffcf0,
      emissiveIntensity: 0.85,
      roughness: 0.2
    });

    // Generate radial light slats radiating from center front (0, -14)
    const centerFrontZ = -13.5;
    const radialAngles = [-0.65, -0.45, -0.25, -0.08, 0.08, 0.25, 0.45, 0.65];
    const distances = [6, 11, 16, 21];

    radialAngles.forEach((angle) => {
      distances.forEach((dist) => {
        const slatGeo = new THREE.BoxGeometry(0.85, 0.06, 3.2);
        const slat = new THREE.Mesh(slatGeo, ledMat);
        const posX = Math.sin(angle) * dist;
        const posZ = centerFrontZ + Math.cos(angle) * dist;

        slat.position.set(posX, 7.14, posZ);
        slat.rotation.y = angle;
        this.scene.add(slat);
        this.ceilingLightMeshes.push(slat);

        // Soft point illumination
        if (dist === 11 || dist === 16) {
          const pLight = new THREE.PointLight(0xfff6ea, 0.4, 14, 1.8);
          pLight.position.set(posX, 6.7, posZ);
          this.scene.add(pLight);
          this.ceilingPointLights.push(pLight);
        }
      });
    });

    // Ceiling fans: 6 units placed between radiating light zones
    const fanPositions = [
      new THREE.Vector3(-4.8, 6.4, -4.5),
      new THREE.Vector3(4.8, 6.4, -4.5),
      new THREE.Vector3(-4.8, 6.4, 2.0),
      new THREE.Vector3(4.8, 6.4, 2.0),
      new THREE.Vector3(-4.8, 6.4, 8.5),
      new THREE.Vector3(4.8, 6.4, 8.5),
    ];

    const fanMountMat = new THREE.MeshStandardMaterial({ color: 0xc4c4c8, metalness: 0.6, roughness: 0.3 });
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.5, roughness: 0.4 });

    fanPositions.forEach(pos => {
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.65, 12), fanMountMat);
      rod.position.set(pos.x, pos.y + 0.32, pos.z);
      this.scene.add(rod);

      const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.14, 16), fanMountMat);
      motor.position.set(pos.x, pos.y, pos.z);
      this.scene.add(motor);

      const bladeGroup = new THREE.Group();
      bladeGroup.position.set(pos.x, pos.y - 0.02, pos.z);

      for (let b = 0; b < 3; b++) {
        const bladeArm = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.015, 0.85), bladeMat);
        bladeArm.position.set(0, 0, 0.48);
        const pivot = new THREE.Group();
        pivot.rotation.y = (b * Math.PI * 2) / 3;
        pivot.add(bladeArm);
        bladeGroup.add(pivot);
      }

      this.scene.add(bladeGroup);
      this.fanBlades.push(bladeGroup);
    });
  }

  private buildFrontExaminationArea() {
    // 1. Realistic Deep Green Chalkboard (Nalanda style)
    const boardFrame = new THREE.Mesh(
      new THREE.BoxGeometry(9.2, 3.4, 0.1),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.5 }) // Light architectural border
    );
    boardFrame.position.set(0, 2.7, -14.9);
    this.scene.add(boardFrame);

    // Realistic deep green chalkboard canvas with matte chalk texture and exam notices
    const boardCanvas = document.createElement('canvas');
    boardCanvas.width = 1024;
    boardCanvas.height = 512;
    const bctx = boardCanvas.getContext('2d')!;

    // Deep chalkboard green background with chalk dust gradient
    bctx.fillStyle = '#163523';
    bctx.fillRect(0, 0, 1024, 512);

    // Subtle chalk dust smudges
    for (let i = 0; i < 35; i++) {
      bctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      bctx.beginPath();
      bctx.arc(Math.random() * 1024, Math.random() * 512, Math.random() * 90 + 30, 0, Math.PI * 2);
      bctx.fill();
    }

    // Chalk border
    bctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    bctx.lineWidth = 3;
    bctx.strokeRect(18, 18, 988, 476);

    // Institutional Header
    bctx.fillStyle = '#ffffff';
    bctx.font = 'bold 30px monospace';
    bctx.textAlign = 'center';
    bctx.fillText('INDIAN INSTITUTE OF TECHNOLOGY KHARAGPUR', 512, 65);
    bctx.font = 'bold 26px monospace';
    bctx.fillText('DEPARTMENT OF INDUSTRIAL & SYSTEMS ENGINEERING', 512, 105);
    bctx.font = '22px monospace';
    bctx.fillText('IE-402: WORK SYSTEM DESIGN & ERGONOMICS LABORATORY', 512, 145);
    bctx.fillText('END SEMESTER EXAMINATION • VENUE: NALANDA CLASSROOM COMPLEX', 512, 185);

    bctx.textAlign = 'left';
    bctx.font = '21px monospace';
    bctx.fillText('• DURATION: 2 HOURS                 • MAX MARKS: 100', 60, 250);
    bctx.fillText('• CANDIDATE ROLL RANGE: 23101 - 23175', 60, 290);
    bctx.fillText('• SEATING: BLOCK A (LEFT) | BLOCK B (CENTER) | BLOCK C (RIGHT)', 60, 330);
    bctx.fillText('• INVIGILATORS: PROF. R. SHARMA, DR. V. IYER', 60, 370);

    bctx.fillStyle = '#fef08a'; // Yellow chalk warning
    bctx.font = 'bold 21px monospace';
    bctx.fillText('⚠ STRICTLY DO NOT USE UNFAIR MEANS • MOBILE PHONES BANNED', 60, 420);
    bctx.fillText('⚠ AT 5 MINUTES REMAINING, TIE ALL SUPPLEMENTARY SHEETS', 60, 455);

    const boardTex = new THREE.CanvasTexture(boardCanvas);
    const boardPanel = new THREE.Mesh(
      new THREE.PlaneGeometry(9.0, 3.2),
      new THREE.MeshStandardMaterial({ map: boardTex, roughness: 0.9 })
    );
    boardPanel.position.set(0, 2.7, -14.84);
    this.scene.add(boardPanel);

    // 2. Digital Countdown Clock
    this.clockMesh.position.set(0, 5.0, -14.82);
    this.scene.add(this.clockMesh);

    // 3. Invigilator Desk & Papers on front stage (Warm brown wood)
    const legDeskMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.4 });
    const brownDeskTex = this.createBrownWoodTexture();
    brownDeskTex.repeat.set(2, 1);
    const invDeskMat = new THREE.MeshStandardMaterial({
      color: 0x78431b,
      map: brownDeskTex,
      roughness: 0.38,
      metalness: 0.04
    });

    const invDesk = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 1.1), invDeskMat);
    invDesk.position.set(3.8, 1.05, -11.5);
    invDesk.castShadow = true;
    this.scene.add(invDesk);

    // Desk legs
    const legGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.9, 8);
    [[-1.1, -0.45], [1.1, -0.45], [-1.1, 0.45], [1.1, 0.45]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, legDeskMat);
      leg.position.set(3.8 + lx, 0.6, -11.5 + lz);
      this.scene.add(leg);
    });

    // Stacks of answer booklets and question papers on Invigilator desk
    const paperSideMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.8 });
    const bookletTopMat = new THREE.MeshStandardMaterial({
      map: ExamPaperTextures.getAnswerBooklet(0),
      roughness: 0.7
    });
    const qpTopMat = new THREE.MeshStandardMaterial({
      map: ExamPaperTextures.getQuestionPaper(0),
      roughness: 0.7
    });

    const stack1Mats = [
      paperSideMat, paperSideMat,
      bookletTopMat, paperSideMat,
      paperSideMat, paperSideMat
    ];
    const stack1 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.48), stack1Mats);
    stack1.position.set(3.3, 1.15, -11.5);
    stack1.castShadow = true;
    this.scene.add(stack1);

    const stack2Mats = [
      paperSideMat, paperSideMat,
      qpTopMat, paperSideMat,
      paperSideMat, paperSideMat
    ];
    const stack2 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 0.48), stack2Mats);
    stack2.position.set(4.2, 1.13, -11.5);
    stack2.castShadow = true;
    this.scene.add(stack2);

    // Dark Brown Teacher's Podium / Lectern
    const darkPodiumTex = this.createDarkBrownWoodTexture();
    const darkPodiumMat = new THREE.MeshStandardMaterial({
      color: 0x27140a, // Deep dark mahogany / espresso brown
      map: darkPodiumTex,
      roughness: 0.35,
      metalness: 0.04
    });

    const podiumGroup = new THREE.Group();
    podiumGroup.position.set(-3.5, 0.175, -11.5);

    // Main podium pillar (dark brown)
    const podiumBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 1.25, 0.65),
      darkPodiumMat
    );
    podiumBody.position.set(0, 0.625, 0);
    podiumBody.castShadow = true;
    podiumBody.receiveShadow = true;
    podiumGroup.add(podiumBody);

    // Angled top reading surface (dark brown)
    const podiumTop = new THREE.Mesh(
      new THREE.BoxGeometry(0.84, 0.06, 0.68),
      darkPodiumMat
    );
    podiumTop.position.set(0, 1.26, -0.02);
    podiumTop.rotation.x = 0.12;
    podiumTop.castShadow = true;
    podiumGroup.add(podiumTop);

    // Gooseneck microphone
    const micStem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.006, 0.006, 0.28, 8),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.25 })
    );
    micStem.position.set(-0.2, 1.4, -0.1);
    micStem.rotation.x = -0.3;
    podiumGroup.add(micStem);

    const micHead = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.04, 8),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 })
    );
    micHead.position.set(-0.2, 1.52, -0.16);
    podiumGroup.add(micHead);

    this.scene.add(podiumGroup);
  }

  private createWhiteTileTexture(tilesPerAxis = 4): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Polished white tile surface base
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 512, 512);

    const tileSize = 512 / tilesPerAxis;
    const groutWidth = 3;

    for (let x = 0; x < tilesPerAxis; x++) {
      for (let y = 0; y < tilesPerAxis; y++) {
        const px = x * tileSize;
        const py = y * tileSize;

        // Subtle porcelain radial sheen
        const grad = ctx.createRadialGradient(
          px + tileSize * 0.5, py + tileSize * 0.5, tileSize * 0.05,
          px + tileSize * 0.5, py + tileSize * 0.5, tileSize * 0.65
        );
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.8, '#f8fafc');
        grad.addColorStop(1, '#eef2f6');

        ctx.fillStyle = grad;
        ctx.fillRect(px + groutWidth, py + groutWidth, tileSize - groutWidth * 2, tileSize - groutWidth * 2);

        // Very delicate porcelain marble grain
        ctx.fillStyle = 'rgba(148, 163, 184, 0.04)';
        ctx.beginPath();
        ctx.ellipse(px + tileSize * 0.45, py + tileSize * 0.5, tileSize * 0.35, tileSize * 0.18, 0.35, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Clean subtle grout grid lines
    ctx.fillStyle = '#cbd5e1';
    for (let i = 0; i <= tilesPerAxis; i++) {
      const pos = Math.min(i * tileSize, 511);
      ctx.fillRect(pos - 1, 0, groutWidth, 512);
      ctx.fillRect(0, pos - 1, 512, groutWidth);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  private createBrownWoodTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Rich warm natural brown wood base
    ctx.fillStyle = '#78431b';
    ctx.fillRect(0, 0, 512, 256);

    // Realistic horizontal wood grain bands
    const grainColors = ['#884c20', '#6b3a16', '#82481e', '#5e3212', '#925225', '#653614'];
    for (let y = 0; y < 256; y += 2) {
      const col = grainColors[Math.floor(Math.sin(y * 0.18) * 2.8 + 3) % grainColors.length];
      ctx.fillStyle = col;
      ctx.fillRect(0, y, 512, 2);
    }

    // Subtle natural wood wave variations
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = 'rgba(60, 30, 10, 0.12)';
      const waveY = (i * 7) % 256;
      ctx.beginPath();
      ctx.ellipse(256, waveY, 260, Math.random() * 8 + 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  private createDarkBrownWoodTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Deep dark mahogany / espresso brown base
    ctx.fillStyle = '#2a150b';
    ctx.fillRect(0, 0, 512, 256);

    // Fine dark wood grain striations
    const grainColors = ['#331b0e', '#231108', '#381e10', '#1c0c05', '#2c160c'];
    for (let y = 0; y < 256; y += 2) {
      const col = grainColors[Math.floor(Math.sin(y * 0.22) * 2.2 + 2) % grainColors.length];
      ctx.fillStyle = col;
      ctx.fillRect(0, y, 512, 2);
    }

    for (let i = 0; i < 25; i++) {
      ctx.fillStyle = 'rgba(20, 8, 3, 0.2)';
      const waveY = (i * 11) % 256;
      ctx.beginPath();
      ctx.ellipse(256, waveY, 260, Math.random() * 6 + 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  private createClockMesh(): THREE.Mesh {
    const clockGeo = new THREE.PlaneGeometry(3.6, 1.4);
    const clockMat = new THREE.MeshBasicMaterial({
      map: this.clockTexture,
      transparent: true
    });
    this.updateClockTexture('01:00:00', false, 'LOW TIME PRESSURE');
    return new THREE.Mesh(clockGeo, clockMat);
  }

  private updateClockTexture(timeStr: string, isUrgent: boolean, subtitle: string) {
    const ctx = this.clockCtx;
    ctx.clearRect(0, 0, 512, 256);

    // Frame
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 512, 256);

    ctx.strokeStyle = isUrgent ? '#ef4444' : '#38bdf8';
    ctx.lineWidth = 8;
    ctx.strokeRect(6, 6, 500, 244);

    // Header label
    ctx.fillStyle = isUrgent ? '#f87171' : '#94a3b8';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('EXAMINATION TIME REMAINING', 256, 44);

    // Digital LED display box
    ctx.fillStyle = '#020617';
    ctx.fillRect(40, 64, 432, 114);

    // Digits
    ctx.fillStyle = isUrgent ? '#ff2222' : '#22c55e';
    ctx.font = 'bold 74px monospace';
    ctx.fillText(timeStr, 256, 146);

    // Bottom warning/status
    ctx.font = 'bold 20px monospace';
    ctx.fillStyle = isUrgent ? '#ef4444' : '#38bdf8';
    ctx.fillText(subtitle, 256, 220);

    this.clockTexture.needsUpdate = true;
  }

  private buildCurvedTieredBenches() {
    // Curved Amphitheater Tiered Layout (Exact Nalanda style)
    // 3 Seating Blocks:
    // Left Block: angled inward by +0.26 radians towards front stage
    // Center Block: straight (angle = 0)
    // Right Block: angled inward by -0.26 radians towards front stage
    const numRows = 7;
    const benchLength = 5.2;
    const deskDepth = 0.48;
    const seatHeight = 0.48;
    const deskHeight = 0.78;

    // Materials matching screenshots 1, 2, 3:
    // Terracotta / orange-brown polished wooden bench seats with individual contoured rounded backrests
    const seatMat = new THREE.MeshStandardMaterial({
      color: 0xc47343, // Terracotta / warm orange-brown seat
      roughness: 0.55,
      metalness: 0.05
    });

    // Brown writing desk surface (Warm rich natural wood tone)
    const brownDeskWoodTex = this.createBrownWoodTexture();
    brownDeskWoodTex.repeat.set(4, 1);
    const deskTopMat = new THREE.MeshStandardMaterial({
      color: 0x78431b, // Warm rich brown
      map: brownDeskWoodTex,
      roughness: 0.38,
      metalness: 0.04
    });

    const steelMat = new THREE.MeshStandardMaterial({
      color: 0xa1a1aa, // Silver/chrome metal leg uprights
      metalness: 0.8,
      roughness: 0.25
    });

    // Tier platforms: White tiles matching floor
    const stepTileTex = this.createWhiteTileTexture(4);
    stepTileTex.repeat.set(4, 2);
    const stepMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: stepTileTex,
      roughness: 0.28,
      metalness: 0.04
    });

    // Aisle walkway steps: White tiles matching floor
    const aisleTileTex = this.createWhiteTileTexture(4);
    aisleTileTex.repeat.set(2, 2);
    const aisleMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: aisleTileTex,
      roughness: 0.28,
      metalness: 0.04
    });

    const seatingLayout: Array<{
      row: number;
      col: number;
      section: 'left' | 'center' | 'right';
      seatPos: THREE.Vector3;
      deskPos: THREE.Vector3;
      isParticipant?: boolean;
    }> = [];

    const sectionConfigs = [
      { id: 'left' as const, x: -7.6, rotY: 0.24 },
      { id: 'center' as const, x: 0.0, rotY: 0.0 },
      { id: 'right' as const, x: 7.6, rotY: -0.24 }
    ];

    for (let r = 0; r < numRows; r++) {
      const rowZ = -6.5 + r * 2.35;
      const tierY = r * 0.38;

      sectionConfigs.forEach(sec => {
        const blockGroup = new THREE.Group();
        blockGroup.position.set(sec.x, 0, rowZ);
        blockGroup.rotation.y = sec.rotY;

        // Tier platform
        const platform = new THREE.Mesh(
          new THREE.BoxGeometry(benchLength + 0.3, tierY + 0.02, 2.3),
          stepMat
        );
        platform.position.set(0, tierY / 2, 0.3);
        platform.receiveShadow = true;
        blockGroup.add(platform);

        // Continuous dark writing desk
        const desk = new THREE.Mesh(
          new THREE.BoxGeometry(benchLength, 0.06, deskDepth),
          deskTopMat
        );
        desk.position.set(0, tierY + deskHeight, 0);
        desk.castShadow = true;
        desk.receiveShadow = true;
        blockGroup.add(desk);

        // Metal support uprights
        [-2.1, 0, 2.1].forEach(lx => {
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, deskHeight, 8), steelMat);
          post.position.set(lx, tierY + deskHeight / 2, 0);
          post.castShadow = true;
          blockGroup.add(post);
        });

        // Continuous wooden bench seat
        const benchSeat = new THREE.Mesh(
          new THREE.BoxGeometry(benchLength, 0.06, 0.36),
          seatMat
        );
        benchSeat.position.set(0, tierY + seatHeight, 0.65);
        benchSeat.castShadow = true;
        blockGroup.add(benchSeat);

        // Individual contoured backrests (Screenshot 1, 2)
        const cols = [-1.8, -0.9, 0, 0.9, 1.8];
        cols.forEach((colX, cIdx) => {
          const backrest = new THREE.Mesh(
            new THREE.BoxGeometry(0.48, 0.38, 0.05),
            seatMat
          );
          backrest.position.set(colX, tierY + seatHeight + 0.26, 0.82);
          backrest.rotation.x = 0.08;
          backrest.castShadow = true;
          blockGroup.add(backrest);

          // Calculate world position for student seating
          const localSeat = new THREE.Vector3(colX, tierY, 0.65);
          localSeat.applyAxisAngle(new THREE.Vector3(0, 1, 0), sec.rotY);
          const worldSeatPos = new THREE.Vector3(sec.x + localSeat.x, localSeat.y, rowZ + localSeat.z);

          const localDesk = new THREE.Vector3(colX, tierY + deskHeight, 0);
          localDesk.applyAxisAngle(new THREE.Vector3(0, 1, 0), sec.rotY);
          const worldDeskPos = new THREE.Vector3(sec.x + localDesk.x, localDesk.y, rowZ + localDesk.z);

          // Main participant in center section, middle row 3, center seat
          const isPart = sec.id === 'center' && r === 3 && cIdx === 2;
          if (isPart) {
            this.participantPosition.copy(worldSeatPos);
          }

          seatingLayout.push({
            row: r,
            col: cIdx,
            section: sec.id,
            seatPos: worldSeatPos,
            deskPos: worldDeskPos,
            isParticipant: isPart
          });
        });

        this.scene.add(blockGroup);
      });

      // Aisle step platforms between sections
      [-3.8, 3.8].forEach(ax => {
        const aisleStep = new THREE.Mesh(new THREE.BoxGeometry(1.6, tierY + 0.01, 2.3), aisleMat);
        aisleStep.position.set(ax, tierY / 2, rowZ + 0.3);
        this.scene.add(aisleStep);
      });
    }

    return seatingLayout;
  }

  private setupControls() {
    const dom = this.renderer.domElement;

    dom.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.prevMouse.x = e.clientX;
      this.prevMouse.y = e.clientY;
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    dom.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.prevMouse.x;
      const dy = e.clientY - this.prevMouse.y;
      this.prevMouse.x = e.clientX;
      this.prevMouse.y = e.clientY;

      if (this.cameraMode === 'participant') {
        this.firstPersonLook.yaw -= dx * 0.004;
        this.firstPersonLook.pitch -= dy * 0.003;
        this.firstPersonLook.pitch = Math.max(-0.6, Math.min(0.6, this.firstPersonLook.pitch));
        this.firstPersonLook.yaw = Math.max(-1.4, Math.min(1.4, this.firstPersonLook.yaw));
      } else if (this.cameraMode === 'observer' || this.cameraMode === 'cinematic') {
        this.orbitAngles.theta -= dx * 0.006;
        this.orbitAngles.phi = Math.max(0.1, Math.min(Math.PI / 2.2, this.orbitAngles.phi + dy * 0.006));
      }
    });

    dom.addEventListener('wheel', (e) => {
      if (this.cameraMode === 'observer' || this.cameraMode === 'cinematic') {
        this.orbitAngles.radius = Math.max(5, Math.min(28, this.orbitAngles.radius + e.deltaY * 0.015));
      }
    });

    window.addEventListener('resize', this.onResize.bind(this));
  }

  public setCameraMode(mode: CameraMode) {
    this.cameraMode = mode;
    if (mode === 'participant') {
      this.firstPersonLook.yaw = 0;
      this.firstPersonLook.pitch = -0.18;
      this.studentController.setParticipantFirstPerson(true);
    } else {
      this.studentController.setParticipantFirstPerson(false);
      if (mode === 'cinematic') {
        this.orbitAngles.theta = 0.8;
        this.orbitAngles.phi = 0.52;
        this.orbitAngles.radius = 16;
      } else if (mode === 'observer') {
        this.orbitAngles.theta = 0.35;
        this.orbitAngles.phi = 0.38;
        this.orbitAngles.radius = 7.5;
      }
    }
  }

  public getCameraMode(): CameraMode {
    return this.cameraMode;
  }

  public applyWorkSystemSettings(factors: PrimaryFactors, modifiers: ActivityModifiers) {
    this.factors = { ...factors };
    this.modifiers = { ...modifiers };

    // 1. Time Pressure Timer setup
    if (factors.timePressure === 'low') {
      this.remainingSeconds = 3600; // ~01:00:00
      this.updateClockTexture('01:00:00', false, 'LOW TIME PRESSURE');
    } else if (factors.timePressure === 'moderate') {
      this.remainingSeconds = 1500; // 00:25:00 (Always 30-10m!)
      this.updateClockTexture('00:25:00', false, 'MODERATE TIME PRESSURE');
    } else {
      // High Pressure: ALWAYS < 10m (e.g. 05:00)
      this.remainingSeconds = 300; // 00:05:00
      this.updateClockTexture('00:05:00', true, '⚠ 5 MINUTES REMAINING');
    }

    // 2. Lighting condition
    let luxMult = 1.0;
    let emissiveMult = 0.85;
    if (factors.lighting === 'poor') {
      luxMult = 0.38;
      emissiveMult = 0.3;
    } else if (factors.lighting === 'moderate') {
      luxMult = 0.7;
      emissiveMult = 0.65;
    } else if (factors.lighting === 'optimal') {
      luxMult = 1.0;
      emissiveMult = 0.9;
    } else {
      // Excessive: 1000 Lux
      luxMult = 1.45;
      emissiveMult = 1.35;
    }

    this.ambientLight.intensity = 0.55 * luxMult;
    this.dirLight.intensity = 0.85 * luxMult;
    this.ceilingLightMeshes.forEach(mesh => {
      (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = emissiveMult;
    });
    this.ceilingPointLights.forEach(pl => {
      pl.intensity = 0.45 * luxMult;
    });

    // 3. Temperature: color temperature tone & fan speed
    if (factors.temperature >= 28) {
      this.ambientLight.color.setHex(0xffedd5); // Warm stuffy amber hue
    } else if (factors.temperature <= 19) {
      this.ambientLight.color.setHex(0xe0f2fe); // Cool blue-ish hue
    } else {
      this.ambientLight.color.setHex(0xfff7ed); // Crisp natural light
    }

    // 4. Update controllers
    this.studentController.setErgonomics(factors.furnitureErgonomics);
    this.studentController.setTemperature(factors.temperature);
    this.studentController.setTimePressure(factors.timePressure);
    this.studentController.updateCrowdDensity(factors.studentDensity);

    // Invigilator patrol frequency
    const invProximity = modifiers.invigilatorPatrol === 'frequent' ? 85 : modifiers.invigilatorPatrol === 'normal' ? 45 : 15;
    this.invigilator.updatePath(invProximity);

    // TAs
    this.taController.setEnabled(modifiers.teachingAssistants);
    this.taController.setActivityLevel(modifiers.taActivity);
  }

  public setStressVisualizer(enabled: boolean) {
    this.stressVisualizer.setVisible(enabled);
    const ring = this.scene.getObjectByName('ParticipantRing');
    if (ring) {
      ring.visible = enabled || this.cameraMode === 'cinematic';
    }
  }

  public triggerSubmission() {
    this.studentController.triggerSubmissionEvent();
  }

  public onResize() {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    const aspect = width / height;

    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();

    this.topCamera.left = -18 * aspect;
    this.topCamera.right = 18 * aspect;
    this.topCamera.top = 18;
    this.topCamera.bottom = -18;
    this.topCamera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  private animate(now: number) {
    if (!this.isRunning) return;
    this.animationFrameId = requestAnimationFrame(this.animate);

    const delta = Math.min(0.1, (now - this.lastTime) / 1000);
    this.lastTime = now;

    // 1. Rotate ceiling fans (temperature-dependent: high temp = fast rotation, low temp = slow)
    const fanSpeed = Math.max(0.5, (this.factors.temperature - 16) * 0.85);
    this.fanBlades.forEach(fb => {
      fb.rotation.y += delta * fanSpeed;
    });

    // 2. Countdown clock
    this.clockUpdateTimer += delta;
    if (this.clockUpdateTimer >= 1.0) {
      this.clockUpdateTimer = 0;
      if (this.remainingSeconds > 0) {
        this.remainingSeconds--;
      }
      const hrs = Math.floor(this.remainingSeconds / 3600).toString().padStart(2, '0');
      const mins = Math.floor((this.remainingSeconds % 3600) / 60).toString().padStart(2, '0');
      const secs = (this.remainingSeconds % 60).toString().padStart(2, '0');

      let subtitle = 'SESSION 1 • WORK SYSTEM LAB EXAM';
      let isUrgent = false;

      if (this.remainingSeconds <= 120) {
        subtitle = '⚠ 2 MINUTES REMAINING';
        isUrgent = true;
      } else if (this.remainingSeconds <= 300) {
        subtitle = '⚠ 5 MINUTES REMAINING';
        isUrgent = true;
      } else if (this.factors.timePressure === 'high') {
        subtitle = '⚠ UNDER 10 MINUTES REMAINING';
        isUrgent = true;
      }

      this.updateClockTexture(`${hrs}:${mins}:${secs}`, isUrgent, subtitle);
    }

    // 3. Update controllers
    this.invigilator.update(delta);
    this.taController.update(delta);
    this.studentController.update(delta);

    // 4. Update Stress Visualizer
    const invProxVal = this.modifiers.invigilatorPatrol === 'frequent' ? 85 : 35;
    const tpVal = this.factors.timePressure === 'high' ? 90 : this.factors.timePressure === 'moderate' ? 50 : 20;
    this.stressVisualizer.update(
      delta,
      this.invigilator.mesh.position,
      tpVal,
      this.factors.noise,
      invProxVal,
      this.participantPosition
    );

    // 5. Update Camera
    this.updateCamera(delta);

    // 6. Render
    if (this.cameraMode === 'topdown') {
      this.renderer.render(this.scene, this.topCamera);
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  private updateCamera(delta: number) {
    if (this.cameraMode === 'participant') {
      // First-person perspective seated at participant desk facing the chalkboard
      const partEye = new THREE.Vector3(
        this.participantPosition.x,
        this.participantPosition.y + 1.10,
        this.participantPosition.z - 0.20
      );
      this.camera.position.copy(partEye);

      const lookTarget = new THREE.Vector3(
        partEye.x + Math.sin(this.firstPersonLook.yaw) * 8,
        partEye.y + Math.sin(this.firstPersonLook.pitch) * 5 - 0.15,
        partEye.z - Math.cos(this.firstPersonLook.yaw) * 8
      );
      this.camera.lookAt(lookTarget);
    } else if (this.cameraMode === 'observer') {
      const targetCenter = this.participantPosition.clone().add(new THREE.Vector3(0, 0.8, 0));
      const r = this.orbitAngles.radius;
      const phi = this.orbitAngles.phi;
      const theta = this.orbitAngles.theta;

      this.targetCameraPos.set(
        targetCenter.x + r * Math.sin(phi) * Math.sin(theta),
        targetCenter.y + r * Math.cos(phi),
        targetCenter.z + r * Math.sin(phi) * Math.cos(theta)
      );
      this.targetCameraLook.copy(targetCenter);

      this.camera.position.lerp(this.targetCameraPos, delta * 5);
      this.currentCameraLook.lerp(this.targetCameraLook, delta * 5);
      this.camera.lookAt(this.currentCameraLook);
    } else if (this.cameraMode === 'cinematic') {
      const hallCenter = new THREE.Vector3(0, 2.8, -1.0);
      const r = this.orbitAngles.radius;
      const phi = this.orbitAngles.phi;
      const theta = this.orbitAngles.theta;

      this.targetCameraPos.set(
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi) + 2.8,
        r * Math.sin(phi) * Math.cos(theta)
      );
      this.targetCameraLook.copy(hallCenter);

      this.camera.position.lerp(this.targetCameraPos, delta * 4);
      this.currentCameraLook.lerp(this.targetCameraLook, delta * 4);
      this.camera.lookAt(this.currentCameraLook);
    }
  }

  public getRemainingTimeFormatted(): string {
    const hrs = Math.floor(this.remainingSeconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((this.remainingSeconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (this.remainingSeconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  }

  public getInvigilatorDistToParticipant(): number {
    return this.invigilator.mesh.position.distanceTo(this.participantPosition);
  }

  public destroy() {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
    if (this.container && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
