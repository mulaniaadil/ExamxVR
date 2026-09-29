import * as THREE from 'three';

/**
 * Procedural texture generator for authentic IIT Kharagpur examination papers,
 * question papers, admit cards, and stationery.
 * Generates crisp high-resolution canvas textures cached in memory.
 */
export class ExamPaperTextures {
  private static answerBookletTextures: THREE.CanvasTexture[] = [];
  private static questionPaperTextures: THREE.CanvasTexture[] = [];
  private static admitCardTextures: THREE.CanvasTexture[] = [];
  private static graphPaperTexture: THREE.CanvasTexture | null = null;
  private static rulerTexture: THREE.CanvasTexture | null = null;

  /**
   * Main Examination Answer Booklet
   * Variant 0: Cover page with roll number boxes, grading table, and first answers
   * Variant 1: Open page spread with biomechanical diagrams & derivations
   * Variant 2: In-depth equations, calculation tables, and checked marks
   */
  public static getAnswerBooklet(variant: number = 0): THREE.CanvasTexture {
    const idx = Math.abs(variant) % 3;
    if (this.answerBookletTextures[idx]) {
      return this.answerBookletTextures[idx];
    }

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 720;
    const ctx = canvas.getContext('2d')!;

    // Background paper (slightly warm ivory/off-white exam paper)
    ctx.fillStyle = '#fbfaf5';
    ctx.fillRect(0, 0, 512, 720);

    // Subtle paper noise / grain
    ctx.fillStyle = 'rgba(0, 0, 0, 0.015)';
    for (let i = 0; i < 200; i++) {
      ctx.fillRect(Math.random() * 512, Math.random() * 720, Math.random() * 3 + 1, 1);
    }

    // Left binding margin / stitch perforations
    ctx.fillStyle = '#f1eee4';
    ctx.fillRect(0, 0, 36, 720);
    ctx.strokeStyle = '#d4cbb8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(36, 0);
    ctx.lineTo(36, 720);
    ctx.stroke();

    // Red vertical margin line (typical Indian exam answer sheet)
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(76, 0);
    ctx.lineTo(76, 720);
    ctx.stroke();

    // Faint horizontal ruled blue lines across page
    ctx.strokeStyle = 'rgba(147, 197, 253, 0.45)';
    ctx.lineWidth = 1;
    const lineSpacing = 22;
    for (let y = 140; y < 700; y += lineSpacing) {
      ctx.beginPath();
      ctx.moveTo(36, y);
      ctx.lineTo(495, y);
      ctx.stroke();
    }

    if (idx === 0) {
      // --- VARIANT 0: COVER PAGE ---
      // Outer border box
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.strokeRect(44, 18, 450, 114);

      // Header text
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('INDIAN INSTITUTE OF TECHNOLOGY KHARAGPUR', 269, 38);

      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('END SEMESTER EXAMINATION • MAIN ANSWER BOOKLET', 269, 56);

      ctx.font = '11px monospace';
      ctx.fillStyle = '#334155';
      ctx.fillText('COURSE: IE-402 (WORK SYSTEM DESIGN & ERGONOMICS)', 269, 72);

      // Roll Number grid box
      ctx.textAlign = 'left';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('ROLL NO:', 52, 94);

      const rollChars = ['2', '3', 'I', 'E', '1', '0', '0', '4', '2'];
      rollChars.forEach((ch, cIdx) => {
        const rx = 120 + cIdx * 20;
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.strokeRect(rx, 81, 18, 18);
        ctx.fillStyle = '#1e3a8a';
        ctx.font = 'bold 13px monospace';
        ctx.fillText(ch, rx + 4, 95);
      });

      // Signature & Stamp
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(340, 80, 140, 42);
      ctx.fillStyle = '#059669';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('INVIGILATOR VERIFIED', 410, 95);
      ctx.font = 'italic 11px serif';
      ctx.fillStyle = '#065f46';
      ctx.fillText('R. Sharma • Prof.', 410, 112);

      // Handwritten Answers in blue ink
      ctx.textAlign = 'left';
      ctx.fillStyle = '#1e40af'; // Blue ink
      ctx.font = 'italic 13px cursive, sans-serif';

      // Margin answer number
      ctx.fillText('Ans 1(a)', 42, 160);
      ctx.fillText('Biomechanics of Seated Posture:', 85, 160);
      ctx.fillText('Under prolonged seated conditions, the lumbar lordosis is reduced', 85, 182);
      ctx.fillText('by approximately 30° to 45°, shifting compressive load onto the', 85, 204);
      ctx.fillText('intervertebral discs (L5/S1 junction).', 85, 226);

      ctx.fillText('1. Spinal Moment Equation:', 85, 248);
      ctx.font = 'bold 13px monospace';
      ctx.fillText('   M_lumbar = (W_torso × d_t) + (W_head × d_h) - (F_extensor × d_e)', 85, 270);

      ctx.font = 'italic 13px cursive, sans-serif';
      ctx.fillText('2. Neck flexion greater than 20° doubles cervical muscle load:', 85, 292);
      ctx.fillText('   Gravitational torque increases from 12 Nm to 28 Nm at 45° tilt.', 85, 314);

      // Small sketch diagram of spine
      ctx.strokeStyle = '#1d4ed8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(360, 240);
      ctx.bezierCurveTo(380, 270, 350, 310, 370, 350);
      ctx.stroke();
      ctx.fillStyle = '#1e3a8a';
      ctx.font = '10px monospace';
      ctx.fillText('L5/S1 Axis', 380, 330);
      ctx.fillText('← Thoracic', 380, 270);

      ctx.font = 'italic 13px cursive, sans-serif';
      ctx.fillText('Ans 1(b)', 42, 358);
      ctx.fillText('Acoustic Comfort Thresholds in Examination Halls:', 85, 358);
      ctx.fillText('According to ISO 3382 and IS 2526 recommendations for lecture halls:', 85, 380);
      ctx.fillText('• Background noise level: NC-25 to NC-30 (35 - 40 dBA).', 85, 402);
      ctx.fillText('• Reverberation time (RT60): Target 0.60 to 0.85 seconds.', 85, 424);
      ctx.fillText('• When noise exceeds 60 dBA, cognitive processing capacity is', 85, 446);
      ctx.fillText('  impaired by ~18% due to auditory masking and stress elevation.', 85, 468);

      ctx.fillText('Ans 2(a)', 42, 512);
      ctx.fillText('Thermal Comfort & Vigilance Interaction:', 85, 512);
      ctx.fillText('Fanger PMV equation predicts optimal PPD < 10% at operative temp 23.5°C.', 85, 534);
      ctx.fillText('At 28°C - 30°C, skin wettedness increases above 0.3, leading to', 85, 556);
      ctx.fillText('restlessness, increased fidgeting frequency, and drop in working memory.', 85, 578);

    } else if (idx === 1) {
      // --- VARIANT 1: OPEN DIAGRAM SPREAD ---
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'right';
      ctx.fillText('PAGE 3 OF 16 • ROLL: 23IE10042', 485, 32);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#1e40af';
      ctx.font = 'italic 13px cursive, sans-serif';

      ctx.fillText('Ans 3', 42, 70);
      ctx.fillText('NIOSH Composite Lifting Index & Work Envelope Design:', 85, 70);
      ctx.fillText('Recommended Weight Limit formulation:', 85, 92);

      ctx.font = 'bold 13px monospace';
      ctx.fillStyle = '#1e3a8a';
      ctx.fillText('RWL = LC × HM × VM × DM × AM × FM × CM', 95, 114);

      // Boxed formula
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 1;
      ctx.strokeRect(85, 100, 360, 26);

      // Biomechanical Free Body Diagram
      ctx.strokeStyle = '#1e40af';
      ctx.lineWidth = 2;
      ctx.strokeRect(100, 150, 290, 150);
      ctx.fillStyle = '#eff6ff';
      ctx.fillRect(101, 151, 288, 148);

      // Diagram lines
      ctx.strokeStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(140, 270);
      ctx.lineTo(240, 270);
      ctx.lineTo(280, 200);
      ctx.stroke();

      // Load arrow
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(280, 200);
      ctx.lineTo(280, 240);
      ctx.stroke();
      ctx.fillText('F_load = 250 N ↓', 290, 230);

      // Muscle force vector
      ctx.strokeStyle = '#2563eb';
      ctx.beginPath();
      ctx.moveTo(230, 260);
      ctx.lineTo(200, 180);
      ctx.stroke();
      ctx.fillText('F_erector = 2800 N', 180, 175);

      ctx.fillStyle = '#1e40af';
      ctx.font = 'italic 13px cursive, sans-serif';
      ctx.fillText('Fig 3.1: Free-body moment diagram around L5/S1 pivot', 120, 320);

      ctx.fillText('Ans 3(b)', 42, 360);
      ctx.fillText('Calculating Compression Force:', 85, 360);
      ctx.fillText('Σ M_L5 = 0  =>  (250 N × 0.45 m) + (350 N × 0.25 m) - (F_m × 0.05 m) = 0', 85, 382);
      ctx.fillText('F_muscle = (112.5 + 87.5) / 0.05 = 4000 N', 85, 404);
      ctx.fillText('Total Joint Compressive Load = F_m + (W_upper + L) = 4600 N', 85, 426);
      ctx.fillText('Warning: 4600 N exceeds Action Limit (3400 N) by 35%!', 85, 448);

      ctx.fillText('Ans 4', 42, 500);
      ctx.fillText('Illuminance & Visual Fatigue in Amphitheater Hall:', 85, 500);
      ctx.fillText('Task Illuminance (E) = (F_luminous × UF × MF) / A_hall', 85, 522);
      ctx.fillText('Optimal paper reading illuminance: 500 Lux with UGR < 19.', 85, 544);
      ctx.fillText('Under 1000 Lux excessive glare, pupil diameter constricts to 2.2 mm,', 85, 566);
      ctx.fillText('causing ciliary muscle strain and headache within 45 minutes.', 85, 588);

    } else {
      // --- VARIANT 2: EQUATIONS & DATA TABLE ---
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'right';
      ctx.fillText('PAGE 7 • SUPPLEMENTARY ATTACHED', 485, 32);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#1e40af';
      ctx.font = 'italic 13px cursive, sans-serif';

      ctx.fillText('Ans 5', 42, 70);
      ctx.fillText('Environmental Ergonomics Comparison Matrix:', 85, 70);

      // Data Table
      const headers = ['Factor', 'Standard', 'Current Lab', 'Impact Rating'];
      const rows = [
        ['Lighting', '500 Lux', '300-500 Lux', 'Nominal'],
        ['Noise', '< 45 dBA', '55-70 dBA', 'Degraded (-22%)'],
        ['Thermal', '22 - 24°C', '28.5°C', 'Heat Fatigue'],
        ['Ergonomics', 'Neutral Sp.', 'Flexed Trunk', 'Discomfort High'],
      ];

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(85, 95, 395, 140);

      // Header row
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(86, 96, 393, 28);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 11px monospace';
      headers.forEach((h, hIdx) => {
        ctx.fillText(h, 95 + hIdx * 98, 115);
      });

      // Rows
      rows.forEach((row, rIdx) => {
        const ry = 145 + rIdx * 26;
        ctx.font = '11px monospace';
        ctx.fillStyle = '#1e293b';
        ctx.fillText(row[0], 95, ry);
        ctx.fillText(row[1], 193, ry);
        ctx.fillText(row[2], 291, ry);
        ctx.fillStyle = rIdx > 0 ? '#dc2626' : '#16a34a';
        ctx.fillText(row[3], 389, ry);

        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(85, ry + 6);
        ctx.lineTo(480, ry + 6);
        ctx.stroke();
      });

      // Red teacher evaluation checkmarks
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(460, 270);
      ctx.lineTo(470, 285);
      ctx.lineTo(490, 260);
      ctx.stroke();
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('+8', 465, 255);

      ctx.fillStyle = '#1e40af';
      ctx.font = 'italic 13px cursive, sans-serif';
      ctx.fillText('Ans 6', 42, 330);
      ctx.fillText('Cardiovascular Strain Index (CSI) during Cognitive Pressure:', 85, 330);
      ctx.fillText('Heart Rate variability (RMSSD) decreases significantly from 45ms to 18ms', 85, 352);
      ctx.fillText('under acute countdown timer pressure (<10 min remaining).', 85, 374);
      ctx.fillText('Compounding factors: Thermal load + Acoustic distractors elevate cortisol.', 85, 396);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 4;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    this.answerBookletTextures[idx] = texture;
    return texture;
  }

  /**
   * Question Paper Texture (IIT Kharagpur Official Examination Paper)
   */
  public static getQuestionPaper(variant: number = 0): THREE.CanvasTexture {
    const idx = Math.abs(variant) % 2;
    if (this.questionPaperTextures[idx]) {
      return this.questionPaperTextures[idx];
    }

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 720;
    const ctx = canvas.getContext('2d')!;

    // Pure crisp white examination question sheet
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 512, 720);

    // Double border header
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, 472, 110);
    ctx.lineWidth = 1;
    ctx.strokeRect(24, 24, 464, 102);

    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.font = 'bold 14px "Times New Roman", serif';
    ctx.fillText('INDIAN INSTITUTE OF TECHNOLOGY KHARAGPUR', 256, 44);

    ctx.font = 'bold 12px "Times New Roman", serif';
    ctx.fillText('DEPARTMENT OF INDUSTRIAL & SYSTEMS ENGINEERING', 256, 62);
    ctx.fillText('END SEMESTER EXAMINATION 2026', 256, 78);

    ctx.font = '11px "Times New Roman", serif';
    ctx.fillText('SUB: IE-402 • WORK SYSTEM DESIGN & ERGONOMICS', 256, 94);
    ctx.fillText('FULL MARKS: 100               TIME: 2 HOURS', 256, 112);

    // Instructions
    ctx.textAlign = 'left';
    ctx.font = 'italic 10px "Times New Roman", serif';
    ctx.fillText('Instructions: Answer any four questions. All questions carry equal marks.', 30, 148);
    ctx.fillText('Non-programmable scientific calculators are permitted. State all assumptions clearly.', 30, 162);

    ctx.strokeStyle = '#444444';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, 172);
    ctx.lineTo(492, 172);
    ctx.stroke();

    // Questions
    const questions = [
      {
        num: 'Q.1',
        marks: '[25 Marks]',
        lines: [
          '(a) Define the biomechanical work envelope in 3D workspace design.',
          '    Derive the moment arm equations at L5/S1 during desk-seated postures.',
          '(b) Discuss cervical strain induced by downward viewing angle > 25°.'
        ],
        solved: true
      },
      {
        num: 'Q.2',
        marks: '[25 Marks]',
        lines: [
          '(a) State the NIOSH Lifting Equation and all six multiplier coefficients.',
          '(b) Calculate the Cumulative Lifting Index for a 3-task assembly operation.',
          '(c) Propose workstation modifications to reduce Lifting Index below 1.0.'
        ],
        solved: true
      },
      {
        num: 'Q.3',
        marks: '[25 Marks]',
        lines: [
          '(a) Analyze the interaction between ambient temperature (18°C-30°C) and',
          '    cognitive vigilance during high-stakes examinations.',
          '(b) Formulate the PMV (Predicted Mean Vote) and PPD index.'
        ],
        solved: false
      },
      {
        num: 'Q.4',
        marks: '[25 Marks]',
        lines: [
          '(a) Discuss acoustic masking, speech intelligibility index, and cognitive',
          '    fatigue caused by background noise levels from 30 dBA to 70 dBA.',
          '(b) Design suspended acoustic wall baffle treatments for an amphitheater.'
        ],
        solved: false
      }
    ];

    let currentY = 195;
    questions.forEach(q => {
      ctx.font = 'bold 12px "Times New Roman", serif';
      ctx.fillStyle = '#000000';
      ctx.fillText(q.num, 30, currentY);

      ctx.textAlign = 'right';
      ctx.font = 'bold 11px "Times New Roman", serif';
      ctx.fillText(q.marks, 485, currentY);
      ctx.textAlign = 'left';

      // Pencil tick mark if student already solved
      if (q.solved) {
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(18, currentY - 4);
        ctx.lineTo(24, currentY + 3);
        ctx.lineTo(34, currentY - 10);
        ctx.stroke();
      }

      currentY += 18;
      ctx.font = '11px "Times New Roman", serif';
      ctx.fillStyle = '#1a1a1a';
      q.lines.forEach(line => {
        ctx.fillText(line, 45, currentY);
        currentY += 16;
      });
      currentY += 12;
    });

    // Barcode at bottom right
    for (let bx = 380; bx < 485; bx += Math.random() * 4 + 2) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(bx, 675, Math.random() * 2 + 1, 25);
    }
    ctx.font = '9px monospace';
    ctx.fillText('PAPER-CODE: IE402-2026-A', 360, 712);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 4;
    this.questionPaperTextures[idx] = texture;
    return texture;
  }

  /**
   * Examination Admit Card / Hall Ticket
   */
  public static getAdmitCard(variant: number = 0): THREE.CanvasTexture {
    const idx = Math.abs(variant) % 3;
    if (this.admitCardTextures[idx]) {
      return this.admitCardTextures[idx];
    }

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 180;
    const ctx = canvas.getContext('2d')!;

    // Card background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 256, 180);

    // Blue header banner
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(0, 0, 256, 38);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('IIT KHARAGPUR', 128, 16);
    ctx.font = '9px sans-serif';
    ctx.fillText('HALL TICKET / ADMIT CARD', 128, 30);

    // Photo placeholder box
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.strokeRect(14, 48, 55, 68);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(15, 49, 53, 66);

    // Simple avatar silhouette
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(41, 72, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(41, 106, 22, Math.PI, 0);
    ctx.fill();

    // Student details
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('NAME: R. SENGUPTA', 80, 58);
    ctx.fillText(`ROLL: 23IE100${40 + idx}`, 80, 72);
    ctx.font = '8px sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('DEPT: INDUSTRIAL & SYSTEMS', 80, 86);
    ctx.fillText('VENUE: NALANDA COMPLEX', 80, 100);
    ctx.fillText('SEAT: ROW 3 • BLK B', 80, 114);

    // Official Stamp
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(205, 95, 18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 7px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('IIT KGP', 205, 93);
    ctx.fillText('SEAL', 205, 103);

    // Barcode at bottom
    for (let bx = 16; bx < 240; bx += Math.random() * 3 + 1.5) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(bx, 134, 1.5, 24);
    }
    ctx.font = '8px monospace';
    ctx.fillText('*23IE10042-SPRING2026*', 128, 168);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 4;
    this.admitCardTextures[idx] = texture;
    return texture;
  }

  /**
   * Millimetric Graph Paper Sheet (Tucked or used for technical derivations)
   */
  public static getGraphSheet(): THREE.CanvasTexture {
    if (this.graphPaperTexture) return this.graphPaperTexture;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 360;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 256, 360);

    // Fine green grid
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.25)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < 256; x += 6) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 360);
      ctx.stroke();
    }
    for (let y = 0; y < 360; y += 6) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }

    // Bold grid lines every 30px
    ctx.strokeStyle = 'rgba(22, 163, 74, 0.6)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 256; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 360);
      ctx.stroke();
    }
    for (let y = 0; y < 360; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }

    // Hand-plotted curve in pencil/blue ink
    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(30, 310);
    ctx.quadraticCurveTo(120, 180, 220, 90);
    ctx.stroke();

    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('FATIGUE vs TIME (HR)', 50, 40);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 4;
    this.graphPaperTexture = texture;
    return texture;
  }

  /**
   * Transparent 15cm Ruler texture
   */
  public static getRulerTexture(): THREE.CanvasTexture {
    if (this.rulerTexture) return this.rulerTexture;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 48;
    const ctx = canvas.getContext('2d')!;

    // Transparent clear plastic with slight cyan tint
    ctx.fillStyle = 'rgba(224, 242, 254, 0.7)';
    ctx.fillRect(0, 0, 256, 48);

    // Millimeter tick marks along edge
    ctx.strokeStyle = '#0284c7';
    ctx.fillStyle = '#0369a1';
    ctx.font = 'bold 8px sans-serif';

    for (let x = 10; x < 246; x += 5) {
      const isCm = (x - 10) % 25 === 0;
      const isHalfCm = (x - 10) % 12.5 === 0;
      const h = isCm ? 16 : (isHalfCm ? 11 : 6);
      ctx.lineWidth = isCm ? 1.5 : 0.8;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();

      if (isCm && x < 235) {
        const cmVal = Math.round((x - 10) / 25);
        ctx.fillText(`${cmVal}`, x - 2, 26);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.rulerTexture = texture;
    return texture;
  }
}
