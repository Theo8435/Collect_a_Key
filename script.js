// ════════════════════════════════════════════════════════════════
//  CONSTANTS
// ════════════════════════════════════════════════════════════════
const W = 800, H = 500;
const GRAVITY      = 1400;
const PLAYER_SPEED = 240;
const JUMP_FORCE   = 560;
const COYOTE_TIME  = 0.1;
const JUMP_BUFFER  = 0.1;

// ════════════════════════════════════════════════════════════════
//  LEVELS
// ════════════════════════════════════════════════════════════════
const LEVELS = [
  // ── Level 1: Tutorial ─────────────────────────────────────────
  {
    bgTop: '#0a0a2e', bgBot: '#0d0d1a',
    playerStart: { x: 50, y: 390 }, //player start position
    door:        { x: 700, y: 360 }, //door position
    key:         { x: 380, y: 310 }, //key position
    platforms: [  //set of platforms
      { x: 0,   y: 440, w: 800, h: 60 },
      { x: 200, y: 370, w: 160, h: 16 },
      { x: 420, y: 340, w: 160, h: 16 },
      { x: 640, y: 370, w: 160, h: 60 },
    ],
    spikes: [],  //set od spike
    coins: [{ x: 260, y: 345 }, { x: 500, y: 315 }, { x: 700, y: 345 }],  //set of coins
  },

  // ── Level 2: First Gaps ────────────────────────────────────────
  {
    bgTop: '#0a1230', bgBot: '#0d0d1a',
    playerStart: { x: 50, y: 390 },
    door:        { x: 710, y: 250 }, // Lowered door slightly for reach
    key:         { x: 390, y: 240 },
    platforms: [
      { x: 0,   y: 440, w: 260, h: 60 },
      { x: 340, y: 440, w: 200, h: 60 },
      { x: 620, y: 440, w: 180, h: 60 },
      { x: 150, y: 355, w: 120, h: 16 },
      { x: 330, y: 270, w: 130, h: 16 },
      { x: 650, y: 310, w: 110, h: 16 }, // Adjusted Y from 340 to 310
    ],
    spikes: [],
    coins: [{ x: 210, y: 325 }, { x: 395, y: 415 }, { x: 680, y: 250 }],
  },

  // ── Level 3: Spike Intro ───────────────────────────────────────
  {
    bgTop: '#0a1e2e', bgBot: '#0d1515',
    playerStart: { x: 50, y: 390 },
    door:        { x: 710, y: 310 }, // Door moved to the platform
    key:         { x: 390, y: 290 },
    platforms: [
      { x: 0,   y: 440, w: 800, h: 60 },
      { x: 160, y: 370, w: 120, h: 16 },
      { x: 340, y: 320, w: 120, h: 16 },
      { x: 540, y: 370, w: 120, h: 16 },
      { x: 650, y: 370, w: 150, h: 60 },
    ],
    spikes: [
      { x: 290, y: 423, w: 42, h: 17 },
      { x: 465, y: 423, w: 42, h: 17 },
    ],
    coins: [{ x: 220, y: 345 }, { x: 400, y: 295 }, { x: 600, y: 345 }],
  },

  // ── Level 4: Climb Up ─────────────────────────────────────────
  {
    bgTop: '#0a2010', bgBot: '#0d1a0d',
    playerStart: { x: 50, y: 390 },
    door:        { x: 30, y: 190 }, // Adjusted door X for better platform fit
    key:         { x: 680, y: 120 },
    platforms: [
      { x: 0,   y: 440, w: 800, h: 60 },
      { x: 0,   y: 250, w: 100, h: 16 },
      { x: 160, y: 370, w: 110, h: 16 },
      { x: 310, y: 300, w: 110, h: 16 },
      { x: 460, y: 230, w: 110, h: 16 },
      { x: 610, y: 160, w: 130, h: 16 },
      { x: 460, y: 160, w: 100, h: 16 },
      { x: 310, y: 195, w: 100, h: 16 }, // Flattened the zigzag descent
      { x: 140, y: 230, w: 100, h: 16 },
    ],
    spikes: [{ x: 270, y: 423, w: 28, h: 17 }, { x: 420, y: 423, w: 28, h: 17 }],
    coins: [{ x: 215, y: 345 }, { x: 365, y: 275 }, { x: 515, y: 205 }, { x: 665, y: 135 }],
  },

  // ── Level 5: Island Hopping ───────────────────────────────────
  {
    bgTop: '#1a0a30', bgBot: '#100d20',
    playerStart: { x: 30, y: 360 },
    door:        { x: 705, y: 210 }, // Door moved up to the platform
    key:         { x: 390, y: 160 },
    platforms: [
      { x: 0,   y: 400, w: 110, h: 60 },
      { x: 160, y: 360, w: 90,  h: 16 },
      { x: 300, y: 310, w: 90,  h: 16 },
      { x: 350, y: 190, w: 110, h: 16 },
      { x: 490, y: 270, w: 90,  h: 16 },
      { x: 620, y: 300, w: 100, h: 16 },
      { x: 670, y: 270, w: 130, h: 60 },
    ],
    spikes: [
      { x: 160, y: 343, w: 28, h: 17 },
    ],
    coins: [{ x: 55,  y: 370 }, { x: 405, y: 160 }, { x: 535, y: 240 }],
  },

  // ── Level 6: Descent ──────────────────────────────────────────
  {
    bgTop: '#200a10', bgBot: '#150a0a',
    playerStart: { x: 50, y: 70 },
    door:        { x: 700, y: 50 },
    key:         { x: 390, y: 390 },
    platforms: [
      { x: 0,   y: 110, w: 130, h: 16 },
      { x: 670, y: 110, w: 130, h: 16 },
      { x: 0,   y: 440, w: 800, h: 60 },
      { x: 170, y: 190, w: 100, h: 16 },
      { x: 310, y: 270, w: 100, h: 16 },
      { x: 450, y: 190, w: 100, h: 16 },
      { x: 590, y: 270, w: 100, h: 16 },
      { x: 170, y: 350, w: 100, h: 16 },
      { x: 590, y: 350, w: 100, h: 16 },
    ],
    spikes: [{ x: 270, y: 423, w: 42, h: 17 }, { x: 430, y: 423, w: 56, h: 17 }],
    coins: [{ x: 220, y: 165 }, { x: 360, y: 245 }, { x: 500, y: 165 }],
  },

  // ── Level 7: Gauntlet ─────────────────────────────────────────
  {
    bgTop: '#1e1000', bgBot: '#150d00',
    playerStart: { x: 50, y: 390 },
    door:        { x: 700, y: 165 }, // Adjusted door Y
    key:         { x: 50,  y: 120 },
    platforms: [
      { x: 0,   y: 440, w: 200, h: 60 },
      { x: 0,   y: 150, w: 130, h: 16 },
      { x: 170, y: 250, w: 90,  h: 16 },
      { x: 300, y: 330, w: 90,  h: 16 },
      { x: 430, y: 250, w: 90,  h: 16 },
      { x: 560, y: 170, w: 90,  h: 16 },
      { x: 650, y: 225, w: 150, h: 60 },
    ],
    spikes: [
      { x: 170, y: 233, w: 28, h: 17 },
    ],
    coins: [{ x: 65,  y: 390 }, { x: 345, y: 300 }, { x: 605, y: 140 }],
  },

  // ── Level 8: Zigzag ───────────────────────────────────────────
  {
    bgTop: '#001e1e', bgBot: '#000d0d',
    playerStart: { x: 50, y: 390 },
    door:        { x: 680, y: 380 },
    key:         { x: 390, y: 70 },
    platforms: [
      { x: 0,   y: 440, w: 170, h: 60 },
      { x: 630, y: 440, w: 170, h: 60 },
      { x: 0,   y: 350, w: 130, h: 16 },
      { x: 180, y: 290, w: 100, h: 16 },
      { x: 330, y: 230, w: 100, h: 16 },
      { x: 180, y: 170, w: 100, h: 16 },
      { x: 330, y: 100, w: 160, h: 16 },
      { x: 530, y: 160, w: 100, h: 16 },
      { x: 660, y: 220, w: 100, h: 16 },
      { x: 530, y: 290, w: 100, h: 16 },
      { x: 660, y: 350, w: 100, h: 16 },
    ],
    spikes: [{ x: 430, y: 143, w: 96, h: 17 }],
    coins: [{ x: 65,  y: 415 }, { x: 405, y: 70  }, { x: 705, y: 415 }],
  },

  // ── Level 9: Spike Garden ─────────────────────────────────────
  {
    bgTop: '#1a001a', bgBot: '#0d000d',
    playerStart: { x: 50, y: 100 },
    door:        { x: 680, y: 80 },
    key:         { x: 390, y: 340 },
    platforms: [
      { x: 0,   y: 140, w: 130, h: 16 },
      { x: 670, y: 140, w: 130, h: 16 },
      { x: 0,   y: 440, w: 800, h: 60 },
      { x: 160, y: 220, w: 80,  h: 16 },
      { x: 290, y: 300, w: 80,  h: 16 },
      { x: 360, y: 370, w: 100, h: 16 },
      { x: 430, y: 300, w: 80,  h: 16 },
      { x: 560, y: 220, w: 80,  h: 16 },
      { x: 160, y: 350, w: 80,  h: 16 },
      { x: 560, y: 350, w: 80,  h: 16 },
    ],
    spikes: [
      { x: 130, y: 423, w: 200, h: 17 },
      { x: 450, y: 423, w: 200, h: 17 },
      { x: 240, y: 283, w: 42,  h: 17 },
      { x: 480, y: 283, w: 42,  h: 17 },
    ],
    coins: [{ x: 65,  y: 110 }, { x: 410, y: 340 }, { x: 710, y: 110 }],
  },

  // ── Level 10: Final Test ─────────────────────────────────────
  {
    bgTop: '#1a0020', bgBot: '#0d0010',
    playerStart: { x: 50, y: 390 },
    door:        { x: 370, y: 30 },
    key:         { x: 680, y: 390 },
    platforms: [
      { x: 0,   y: 440, w: 150, h: 60 },
      { x: 620, y: 440, w: 180, h: 60 },
      { x: 200, y: 380, w: 80,  h: 16 },
      { x: 330, y: 320, w: 80,  h: 16 },
      { x: 460, y: 380, w: 80,  h: 16 },
      { x: 570, y: 310, w: 80,  h: 16 },
      { x: 460, y: 240, w: 80,  h: 16 },
      { x: 330, y: 170, w: 80,  h: 16 },
      { x: 200, y: 240, w: 80,  h: 16 },
      { x: 310, y: 90,  w: 160, h: 16 },
      { x: 80,  y: 300, w: 80,  h: 16 },
      { x: 80,  y: 170, w: 80,  h: 16 },
    ],
    spikes: [
      { x: 150, y: 423, w: 56,  h: 17 },
      { x: 280, y: 423, w: 56,  h: 17 },
      { x: 410, y: 423, w: 56,  h: 17 },
    ],
    coins: [{ x: 75,  y: 410 }, { x: 700, y: 410 }],
  },

  // ── Level 11: Staircase ───────────────────────────────────────
  {
    bgTop: '#0a1a2e', bgBot: '#060d1a',
    playerStart: { x: 30, y: 410 },
    door:        { x: 720, y: 50 },
    key:         { x: 400, y: 230 },
    platforms: [
      { x: 0,   y: 440, w: 120, h: 60 },
      { x: 100, y: 390, w: 100, h: 16 },
      { x: 180, y: 340, w: 100, h: 16 },
      { x: 260, y: 290, w: 100, h: 16 },
      { x: 340, y: 240, w: 100, h: 16 },
      { x: 420, y: 190, w: 100, h: 16 },
      { x: 500, y: 140, w: 100, h: 16 },
      { x: 580, y: 90,  w: 100, h: 16 },
      { x: 680, y: 90,  w: 120, h: 60 },
    ],
    spikes: [
      { x: 120, y: 423, w: 56, h: 17 },
      { x: 440, y: 423, w: 42, h: 17 },
    ],
    coins: [{ x: 150, y: 360 }, { x: 370, y: 215 }, { x: 630, y: 65 }],
  },

  // ── Level 12: The Pit ─────────────────────────────────────────
  {
    bgTop: '#1a0a0a', bgBot: '#0d0505',
    playerStart: { x: 30, y: 80 },
    door:        { x: 710, y: 432 },
    key:         { x: 390, y: 430 },
    platforms: [
      { x: 0,   y: 110, w: 130, h: 16 },
      { x: 670, y: 110, w: 130, h: 16 },
      { x: 0,   y: 440, w: 130, h: 60 },
      { x: 670, y: 440, w: 130, h: 60 },
      { x: 200, y: 200, w: 80,  h: 16 },
      { x: 340, y: 290, w: 120, h: 16 },
      { x: 520, y: 200, w: 80,  h: 16 },
      { x: 310, y: 420, w: 180, h: 60 },
    ],
    spikes: [
      { x: 130, y: 423, w: 180, h: 17 },
      { x: 490, y: 423, w: 180, h: 17 },
    ],
    coins: [{ x: 55, y: 80 }, { x: 400, y: 265 }, { x: 735, y: 80 }],
  },

  // ── Level 13: Corridor ────────────────────────────────────────
  {
    bgTop: '#0d1a0a', bgBot: '#060d05',
    playerStart: { x: 30, y: 200 },
    door:        { x: 715, y: 200 },
    key:         { x: 390, y: 420 },
    platforms: [
      { x: 0,   y: 230, w: 120, h: 16 },
      { x: 680, y: 230, w: 120, h: 16 },
      { x: 0,   y: 440, w: 800, h: 60 },
      { x: 150, y: 340, w: 80,  h: 16 },
      { x: 280, y: 380, w: 80,  h: 16 },
      { x: 350, y: 410, w: 100, h: 60 },
      { x: 440, y: 380, w: 80,  h: 16 },
      { x: 570, y: 340, w: 80,  h: 16 },
      { x: 130, y: 170, w: 80,  h: 16 },
      { x: 590, y: 170, w: 80,  h: 16 },
    ],
    spikes: [
      { x: 210, y: 323, w: 56, h: 17 },
      { x: 534, y: 323, w: 56, h: 17 },
    ],
    coins: [{ x: 60, y: 200 }, { x: 400, y: 385 }, { x: 740, y: 200 }],
  },

  // ── Level 14: Double Jump Practice ───────────────────────────
  {
    bgTop: '#1a1000', bgBot: '#0d0800',
    playerStart: { x: 30, y: 400 },
    door:        { x: 680, y: 310 },
    key:         { x: 200, y: 100 },
    platforms: [
      { x: 0,   y: 440, w: 130, h: 60 },
      { x: 200, y: 350, w: 80,  h: 16 },
      { x: 350, y: 280, w: 80,  h: 16 },
      { x: 130, y: 130, w: 130, h: 16 },
      { x: 310, y: 190, w: 80,  h: 16 },
      { x: 460, y: 130, w: 80,  h: 16 },
      { x: 600, y: 200, w: 80,  h: 16 },
      { x: 650, y: 370, w: 150, h: 60 },
    ],
    spikes: [
      { x: 280, y: 423, w: 70, h: 17 },
      { x: 470, y: 423, w: 70, h: 17 },
    ],
    coins: [{ x: 240, y: 110 }, { x: 390, y: 255 }, { x: 635, y: 175 }],
  },

  // ── Level 15: The Bridge ──────────────────────────────────────
  {
    bgTop: '#001a1a', bgBot: '#000d0d',
    playerStart: { x: 30, y: 70 },
    door:        { x: 715, y: 70 },
    key:         { x: 390, y: 390 },
    platforms: [
      { x: 0,   y: 110, w: 140, h: 60 },
      { x: 660, y: 110, w: 140, h: 60 },
      { x: 0,   y: 440, w: 180, h: 60 },
      { x: 620, y: 440, w: 180, h: 60 },
      { x: 140, y: 200, w: 80,  h: 16 },
      { x: 260, y: 270, w: 80,  h: 16 },
      { x: 340, y: 380, w: 120, h: 60 },
      { x: 460, y: 270, w: 80,  h: 16 },
      { x: 580, y: 200, w: 80,  h: 16 },
      { x: 220, y: 160, w: 80,  h: 16 },
      { x: 500, y: 160, w: 80,  h: 16 },
    ],
    spikes: [
      { x: 180, y: 423, w: 160, h: 17 },
      { x: 460, y: 423, w: 160, h: 17 },
    ],
    coins: [{ x: 60, y: 80 }, { x: 400, y: 355 }, { x: 740, y: 80 }],
  },

  // ── Level 16: Spike Alley ─────────────────────────────────────
  {
    bgTop: '#200010', bgBot: '#100008',
    playerStart: { x: 30, y: 300 },
    door:        { x: 450, y: 390 },
    key:         { x: 390, y: 90 },
    platforms: [
      { x: 0,   y: 440, w: 130, h: 60 },
      { x: 660, y: 440, w: 140, h: 60 },
      { x: 0,   y: 320, w: 80,  h: 16 },
      { x: 140, y: 240, w: 80,  h: 16 },
      { x: 280, y: 160, w: 80,  h: 16 },
      { x: 360, y: 110, w: 80,  h: 16 },
      { x: 440, y: 160, w: 80,  h: 16 },
      { x: 580, y: 240, w: 80,  h: 16 },
      { x: 720, y: 320, w: 80,  h: 16 },
    ],
    spikes: [
      { x: 520, y: 223, w: 56, h: 17 },
      { x: 660, y: 303, w: 56, h: 17 },
    ],
    coins: [{ x: 55, y: 410 }, { x: 400, y: 85 }, { x: 745, y: 410 }],
  },

  // ── Level 17: High Road ───────────────────────────────────────
  {
    bgTop: '#0a0a30', bgBot: '#050520',
    playerStart: { x: 30, y: 390 },
    door:        { x: 50, y: 50 },
    key:         { x: 720, y: 50 },
    platforms: [
      { x: 0,   y: 440, w: 120, h: 60 },
      { x: 0,   y: 100, w: 120, h: 16 },
      { x: 680, y: 100, w: 120, h: 16 },
      { x: 140, y: 370, w: 80,  h: 16 },
      { x: 260, y: 310, w: 80,  h: 16 },
      { x: 380, y: 250, w: 80,  h: 16 },
      { x: 500, y: 180, w: 80,  h: 16 },
      { x: 600, y: 120, w: 80,  h: 16 },
      { x: 380, y: 180, w: 80,  h: 16 },
      { x: 260, y: 130, w: 80,  h: 16 },
      { x: 140, y: 190, w: 80,  h: 16 },
    ],
    spikes: [
      { x: 340, y: 423, w: 120, h: 17 },
    ],
    coins: [{ x: 55, y: 410 }, { x: 420, y: 225 }, { x: 740, y: 70 }],
  },

  // ── Level 18: The Comb ────────────────────────────────────────
  {
    bgTop: '#10001a', bgBot: '#08000d',
    playerStart: { x: 30, y: 80 },
    door:        { x: 715, y: 80 },
    key:         { x: 390, y: 355 },
    platforms: [
      { x: 0,   y: 110, w: 130, h: 16 },
      { x: 670, y: 110, w: 130, h: 16 },
      { x: 0,   y: 440, w: 800, h: 60 },
      { x: 110, y: 340, w: 60,  h: 100 },
      { x: 230, y: 280, w: 60,  h: 160 },
      { x: 350, y: 380, w: 80,  h: 60 },
      { x: 490, y: 280, w: 60,  h: 160 },
      { x: 610, y: 340, w: 60,  h: 100 },
      { x: 160, y: 200, w: 80,  h: 16 },
      { x: 520, y: 200, w: 80,  h: 16 },
    ],
    spikes: [
      { x: 170, y: 323, w: 56, h: 17 },
      { x: 390, y: 363, w: 42, h: 17 },
      { x: 550, y: 263, w: 56, h: 17 },
    ],
    coins: [{ x: 55, y: 80 }, { x: 400, y: 355 }, { x: 740, y: 80 }],
  },

  // ── Level 19: The Shelf ───────────────────────────────────────
  {
    bgTop: '#0a1e00', bgBot: '#050f00',
    playerStart: { x: 30, y: 390 },
    door:        { x: 715, y: 130 },
    key:         { x: 390, y: 310 },
    platforms: [
      { x: 0,   y: 440, w: 800, h: 60 },
      { x: 0,   y: 330, w: 200, h: 16 },
      { x: 250, y: 270, w: 200, h: 16 },
      { x: 350, y: 330, w: 100, h: 16 },
      { x: 500, y: 270, w: 80,  h: 16 },
      { x: 600, y: 210, w: 80,  h: 16 },
      { x: 680, y: 190, w: 120, h: 16 },
      { x: 150, y: 210, w: 80,  h: 16 },
      { x: 300, y: 150, w: 80,  h: 16 },
      { x: 450, y: 150, w: 80,  h: 16 },
    ],
    spikes: [
      { x: 200, y: 313, w: 50, h: 17 },
      { x: 580, y: 253, w: 20, h: 17 },
    ],
    coins: [{ x: 55, y: 410 }, { x: 400, y: 285 }, { x: 730, y: 165 }],
  },

  // ── Level 20: Speed Run ───────────────────────────────────────
  {
    bgTop: '#200a00', bgBot: '#100500',
    playerStart: { x: 30, y: 390 },
    door:        { x: 720, y: 390 },
    key:         { x: 390, y: 130 },
    platforms: [
      { x: 0,   y: 440, w: 120, h: 60 },
      { x: 660, y: 440, w: 140, h: 60 },
      { x: 100, y: 370, w: 80,  h: 16 },
      { x: 220, y: 310, w: 80,  h: 16 },
      { x: 340, y: 250, w: 80,  h: 16 },
      { x: 460, y: 190, w: 80,  h: 16 },
      { x: 340, y: 130, w: 130, h: 16 },
      { x: 580, y: 190, w: 80,  h: 16 },
      { x: 620, y: 300, w: 80,  h: 16 },
      { x: 580, y: 370, w: 80,  h: 16 },
    ],
    spikes: [
      { x: 180, y: 293, w: 36, h: 17 },
      { x: 300, y: 233, w: 36, h: 17 },
    ],
    coins: [{ x: 55, y: 415 }, { x: 400, y: 105 }, { x: 735, y: 415 }],
  },

  // ── Level 21: Labyrinth ───────────────────────────────────────
  {
    bgTop: '#001020', bgBot: '#000810',
    playerStart: { x: 30, y: 390 },
    door:        { x: 715, y: 80 },
    key:         { x: 30,  y: 80 },
    platforms: [
      { x: 0,   y: 440, w: 800, h: 60 },
      { x: 0,   y: 110, w: 130, h: 16 },
      { x: 670, y: 110, w: 130, h: 16 },
      { x: 0,   y: 280, w: 200, h: 16 },
      { x: 600, y: 280, w: 200, h: 16 },
      { x: 100, y: 200, w: 80,  h: 16 },
      { x: 620, y: 200, w: 80,  h: 16 },
      { x: 250, y: 360, w: 80,  h: 16 },
      { x: 470, y: 360, w: 80,  h: 16 },
      { x: 320, y: 290, w: 160, h: 16 },
      { x: 350, y: 200, w: 100, h: 16 },
      { x: 250, y: 150, w: 80,  h: 16 },
      { x: 470, y: 150, w: 80,  h: 16 },
    ],
    spikes: [
      { x: 200, y: 343, w: 42, h: 17 },
      { x: 560, y: 343, w: 42, h: 17 },
    ],
    coins: [{ x: 55, y: 80 }, { x: 400, y: 170 }, { x: 735, y: 80 }],
  },

  // ── Level 22: Reverse Climb ───────────────────────────────────
  {
    bgTop: '#1a1a00', bgBot: '#0d0d00',
    playerStart: { x: 30, y: 70 },
    door:        { x: 715, y: 400 },
    key:         { x: 390, y: 420 },
    platforms: [
      { x: 0,   y: 110, w: 130, h: 16 },
      { x: 0,   y: 440, w: 800, h: 60 },
      { x: 130, y: 190, w: 80,  h: 16 },
      { x: 260, y: 270, w: 80,  h: 16 },
      { x: 390, y: 350, w: 80,  h: 16 },
      { x: 530, y: 270, w: 80,  h: 16 },
      { x: 650, y: 200, w: 80,  h: 16 },
      { x: 660, y: 440, w: 140, h: 60 },
      { x: 330, y: 420, w: 140, h: 60 },
    ],
    spikes: [
      { x: 200, y: 423, w: 130, h: 17 },
      { x: 470, y: 423, w: 60,  h: 17 },
    ],
    coins: [{ x: 55, y: 80 }, { x: 420, y: 325 }, { x: 700, y: 175 }],
  },

  // ── Level 23: Stepping Stones ─────────────────────────────────
  {
    bgTop: '#000a20', bgBot: '#000510',
    playerStart: { x: 20, y: 390 },
    door:        { x: 740, y: 80 },
    key:         { x: 390, y: 200 },
    platforms: [
      { x: 0,   y: 440, w: 80,  h: 60 },
      { x: 720, y: 110, w: 80,  h: 60 },
      { x: 120, y: 400, w: 60,  h: 16 },
      { x: 220, y: 360, w: 60,  h: 16 },
      { x: 320, y: 310, w: 60,  h: 16 },
      { x: 420, y: 250, w: 60,  h: 16 },
      { x: 360, y: 200, w: 60,  h: 16 },
      { x: 500, y: 180, w: 60,  h: 16 },
      { x: 600, y: 230, w: 60,  h: 16 },
      { x: 660, y: 180, w: 60,  h: 16 },
      { x: 280, y: 390, w: 60,  h: 16 },
    ],
    spikes: [
      { x: 80,  y: 423, w: 40, h: 17 },
      { x: 450, y: 423, w: 70, h: 17 },
    ],
    coins: [{ x: 145, y: 375 }, { x: 400, y: 175 }, { x: 755, y: 80 }],
  },

  // ── Level 24: Twin Towers ─────────────────────────────────────
  {
    bgTop: '#0a001a', bgBot: '#05000d',
    playerStart: { x: 30, y: 390 },
    door:        { x: 715, y: 200 },
    key:         { x: 390, y: 80 },
    platforms: [
      { x: 0,   y: 440, w: 120, h: 60 },
      { x: 680, y: 260, w: 120, h: 60 },
      { x: 0,   y: 340, w: 80,  h: 16 },
      { x: 0,   y: 240, w: 80,  h: 16 },
      { x: 0,   y: 140, w: 80,  h: 16 },
      { x: 720, y: 140, w: 80,  h: 16 },
      { x: 720, y: 340, w: 80,  h: 16 },
      { x: 150, y: 100, w: 500, h: 16 },
      { x: 200, y: 200, w: 80,  h: 16 },
      { x: 520, y: 200, w: 80,  h: 16 },
      { x: 340, y: 290, w: 120, h: 16 },
    ],
    spikes: [
      { x: 280, y: 83, w: 60, h: 17 },
      { x: 460, y: 83, w: 60, h: 17 },
    ],
    coins: [{ x: 40, y: 310 }, { x: 400, y: 260 }, { x: 740, y: 310 }],
  },

  // ── Level 25: Halfway Hell ────────────────────────────────────
  {
    bgTop: '#200000', bgBot: '#100000',
    playerStart: { x: 30, y: 390 },
    door:        { x: 715, y: 390 },
    key:         { x: 390, y: 70 },
    platforms: [
      { x: 0,   y: 440, w: 120, h: 60 },
      { x: 660, y: 440, w: 140, h: 60 },
      { x: 100, y: 360, w: 60,  h: 16 },
      { x: 210, y: 300, w: 60,  h: 16 },
      { x: 320, y: 240, w: 60,  h: 16 },
      { x: 360, y: 110, w: 80,  h: 16 },
      { x: 420, y: 240, w: 60,  h: 16 },
      { x: 530, y: 300, w: 60,  h: 16 },
      { x: 640, y: 360, w: 60,  h: 16 },
      { x: 230, y: 170, w: 60,  h: 16 },
      { x: 510, y: 170, w: 60,  h: 16 },
    ],
    spikes: [
      { x: 160, y: 343, w: 42, h: 17 },
      { x: 270, y: 283, w: 42, h: 17 },
      { x: 488, y: 283, w: 42, h: 17 },
      { x: 596, y: 343, w: 42, h: 17 },
    ],
    coins: [{ x: 55, y: 415 }, { x: 400, y: 85 }, { x: 735, y: 415 }],
  },

  // ── Level 26: The Precision Leap ─────────────────────────────
  {
    bgTop: '#1a0a2e', bgBot: '#050515',
    playerStart: { x: 40, y: 390 },
    door:        { x: 720, y: 150 },
    key:         { x: 400, y: 50 },
    platforms: [
      { x: 0,   y: 440, w: 100, h: 60 },  // Start platform
      { x: 150, y: 380, w: 80,  h: 16 },
      { x: 300, y: 320, w: 80,  h: 16 },
      { x: 450, y: 260, w: 80,  h: 16 },
      { x: 600, y: 200, w: 150, h: 16 },  // Door platform
      { x: 375, y: 100, w: 100, h: 16 },  // Key platform
      { x: 180, y: 160, w: 80,  h: 16 },
    ],
    spikes: [
      { x: 100, y: 423, w: 700, h: 17 },  // Large floor spike pit
      { x: 450, y: 243, w: 30,  h: 17 },  // Hazard on a middle platform
    ],
    coins: [
      { x: 190, y: 355 }, 
      { x: 340, y: 295 }, 
      { x: 700, y: 175 }
    ],
  },

  // ── Level 27: The Funnel ──────────────────────────────────────
  {
    bgTop: '#1a1000', bgBot: '#0d0800',
    playerStart: { x: 30, y: 70 },
    door:        { x: 370, y: 410 },
    key:         { x: 715, y: 70 },
    platforms: [
      { x: 0,   y: 110, w: 130, h: 16 },
      { x: 670, y: 110, w: 130, h: 16 },
      { x: 340, y: 440, w: 120, h: 60 },
      { x: 100, y: 200, w: 100, h: 16 },
      { x: 600, y: 200, w: 100, h: 16 },
      { x: 180, y: 290, w: 100, h: 16 },
      { x: 520, y: 290, w: 100, h: 16 },
      { x: 260, y: 370, w: 100, h: 16 },
      { x: 440, y: 370, w: 100, h: 16 },
    ],
    spikes: [
      { x: 200, y: 273, w: 56, h: 17 },
      { x: 544, y: 273, w: 56, h: 17 },
    ],
    coins: [{ x: 55, y: 80 }, { x: 400, y: 415 }, { x: 740, y: 80 }],
  },

  // ── Level 28: Canopy ──────────────────────────────────────────
  {
    bgTop: '#002010', bgBot: '#001508',
    playerStart: { x: 30, y: 390 },
    door:        { x: 715, y: 390 },
    key:         { x: 390, y: 60 },
    platforms: [
      { x: 0,   y: 440, w: 140, h: 60 },
      { x: 660, y: 440, w: 140, h: 60 },
      { x: 120, y: 350, w: 80,  h: 16 },
      { x: 240, y: 270, w: 80,  h: 16 },
      { x: 360, y: 190, w: 80,  h: 16 },
      { x: 480, y: 270, w: 80,  h: 16 },
      { x: 600, y: 350, w: 80,  h: 16 },
      { x: 300, y: 140, w: 80,  h: 16 },
      { x: 420, y: 140, w: 80,  h: 16 },
    ],
    spikes: [
      { x: 200, y: 63, w: 160, h: 17 },
      { x: 440, y: 63, w: 160, h: 17 },
    ],
    coins: [{ x: 55, y: 415 }, { x: 400, y: 165 }, { x: 740, y: 415 }],
  },

  // ── Level 29: Mirror ──────────────────────────────────────────
  {
    bgTop: '#0a001a', bgBot: '#05000d',
    playerStart: { x: 30, y: 390 },
    door:        { x: 715, y: 80 },
    key:         { x: 715, y: 390 },
    platforms: [
      { x: 0,   y: 440, w: 120, h: 60 },
      { x: 660, y: 440, w: 140, h: 60 },
      { x: 680, y: 110, w: 120, h: 16 },
      { x: 100, y: 370, w: 80,  h: 16 },
      { x: 240, y: 310, w: 80,  h: 16 },
      { x: 380, y: 250, w: 80,  h: 16 },
      { x: 520, y: 310, w: 80,  h: 16 },
      { x: 660, y: 370, w: 80,  h: 16 },
      { x: 540, y: 190, w: 80,  h: 16 },
      { x: 400, y: 130, w: 80,  h: 16 },
      { x: 260, y: 190, w: 80,  h: 16 },
      { x: 120, y: 250, w: 80,  h: 16 },
    ],
    spikes: [
      { x: 564, y: 293, w: 56, h: 17 },
    ],
    coins: [{ x: 55, y: 415 }, { x: 420, y: 225 }, { x: 735, y: 415 }],
  },

  // ── Level 30: Triple Gauntlet ─────────────────────────────────
  {
    bgTop: '#200010', bgBot: '#100008',
    playerStart: { x: 300, y: 100 },
    door:        { x: 715, y: 130 },
    key:         { x: 390, y: 390 },
    platforms: [
      { x: 0,   y: 440, w: 120, h: 60 },
      { x: 680, y: 170, w: 120, h: 60 },
      { x: 340, y: 440, w: 120, h: 60 },
      { x: 120, y: 340, w: 80,  h: 16 },
      { x: 240, y: 270, w: 80,  h: 16 },
      { x: 160, y: 190, w: 80,  h: 16 },
      { x: 280, y: 130, w: 80,  h: 16 },
      { x: 400, y: 340, w: 80,  h: 16 },
      { x: 520, y: 270, w: 80,  h: 16 },
      { x: 430, y: 190, w: 80,  h: 16 },
      { x: 550, y: 130, w: 80,  h: 16 },
    ],
    spikes: [
      { x: 120, y: 323, w: 56, h: 17 },
      { x: 300, y: 253, w: 56, h: 17 },
    ],
    coins: [{ x: 55, y: 415 }, { x: 400, y: 415 }, { x: 730, y: 145 }],
  },
]

const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');
canvas.width  = W;
canvas.height = H;

// ════════════════════════════════════════════════════════════════
//  SOUND ENGINE (Web Audio API — no files needed)
// ════════════════════════════════════════════════════════════════
let audioCtx = null;

function getAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playTone(freq, type, duration, volume = 0.18, startDelay = 0) {
  try {
    const ac = getAudio();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ac.currentTime + startDelay);
    gain.gain.setValueAtTime(volume, ac.currentTime + startDelay);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + startDelay + duration);
    osc.start(ac.currentTime + startDelay);
    osc.stop(ac.currentTime + startDelay + duration);
  } catch (e) {}
}

function playFreqSlide(freqStart, freqEnd, type, duration, volume = 0.15) {
  try {
    const ac = getAudio();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, ac.currentTime);
    osc.frequency.linearRampToValueAtTime(freqEnd, ac.currentTime + duration);
    gain.gain.setValueAtTime(volume, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + duration);
  } catch (e) {}
}

const SFX = {
  jump()    { playFreqSlide(220, 440, 'square', 0.12, 0.12); },
  land()    { playTone(80, 'sine', 0.08, 0.10); },
  coin()    { playTone(880, 'sine', 0.07, 0.14); playTone(1100, 'sine', 0.07, 0.07, 0.06); },
  key()     {
    [520, 660, 880, 1100].forEach((f, i) => playTone(f, 'sine', 0.12, 0.15, i * 0.07));
  },
  door()    {
    [330, 440, 550, 660].forEach((f, i) => playTone(f, 'triangle', 0.18, 0.18, i * 0.08));
  },
  die()     { playFreqSlide(300, 60, 'sawtooth', 0.35, 0.22); },
  levelWin(){
    [523, 659, 784, 1047].forEach((f, i) => playTone(f, 'sine', 0.22, 0.20, i * 0.10));
  },
  gameWin() {
    const melody = [523, 659, 784, 659, 784, 1047, 1175, 1047];
    melody.forEach((f, i) => playTone(f, 'sine', 0.25, 0.22, i * 0.13));
  },
  menuClick(){ playTone(440, 'sine', 0.08, 0.12); },
  menuNav()  { playTone(330, 'triangle', 0.06, 0.10); },
};

// ════════════════════════════════════════════════════════════════
//  INPUT HANDLING (PC + MOBILE)
// ════════════════════════════════════════════════════════════════
const keys = {};
const justPressed = {};
const touch = { left: false, right: false, jump: false };

document.addEventListener('keydown', e => {
  if (!keys[e.code]) justPressed[e.code] = true;
  keys[e.code] = true;
  if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
});
document.addEventListener('keyup', e => { keys[e.code] = false; });

const setupTouch = (id, key) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('touchstart', (e) => { e.preventDefault(); touch[key] = true; justPressed['TouchJump'] = (key === 'jump'); });
  el.addEventListener('touchend',   (e) => { e.preventDefault(); touch[key] = false; });
};
setupTouch('btnLeft', 'left');
setupTouch('btnRight', 'right');
setupTouch('btnJump', 'jump');

function isDown(...codes) {
  if (codes.includes('ArrowLeft')  && touch.left)  return true;
  if (codes.includes('ArrowRight') && touch.right) return true;
  return codes.some(c => keys[c]);
}
function wasPressed(...codes) {
  if (codes.includes('Space') && justPressed['TouchJump']) return true;
  return codes.some(c => justPressed[c]);
}
function clearJustPressed() { for (const k in justPressed) delete justPressed[k]; }

// ════════════════════════════════════════════════════════════════
//  SCALING
// ════════════════════════════════════════════════════════════════
function resize() {
  const winW = window.innerWidth, winH = window.innerHeight;
  const scale = Math.min(winW / W, winH / H);
  canvas.style.width  = (W * scale) + 'px';
  canvas.style.height = (H * scale) + 'px';
}
window.addEventListener('resize', resize);
resize();

// ════════════════════════════════════════════════════════════════
//  GAME STATE
// ════════════════════════════════════════════════════════════════
const STATE = { MENU: 'menu', LEVEL_SELECT: 'levelSelect', PLAYING: 'playing', WIN: 'win', DEAD: 'dead' };
let gameState = STATE.MENU;

let levelIndex = 0;
let score = 0, gameTime = 0, deaths = 0;
let animTime = 0;

// Level select scroll
let lsScroll = 0;      // which row is at top
const LS_COLS = 5;     // columns in grid
let lsCursor = 0;      // highlighted cell (0-based level index)

// Tracking unlocked levels (persist via localStorage if available)
let unlockedUpTo = 0;
try { unlockedUpTo = parseInt(localStorage.getItem('cak_unlocked') || '0'); } catch(e){}
function saveUnlocked() {
  try { localStorage.setItem('cak_unlocked', String(unlockedUpTo)); } catch(e){}
}

// Per-level entities
let player, door, keyItem, platforms, spikes, coins, hasKey;
let coyote = 0, jumpBuf = 0;
let wasOnGround = false;

// Particles
let particles = [];

// ════════════════════════════════════════════════════════════════
//  PARTICLES
// ════════════════════════════════════════════════════════════════
function spawnParticles(x, y, count, color, speedMin=80, speedMax=200, upward=0) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = speedMin + Math.random() * (speedMax - speedMin);
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - upward,
      life: 1.0,
      decay: 0.7 + Math.random() * 0.8,
      size: 2 + Math.random() * 5,
      color,
    });
  }
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x  += p.vx * dt;
    p.y  += p.vy * dt;
    p.vy += 500 * dt;
    p.life -= p.decay * dt;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function drawParticles() {
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, Math.max(0.1, p.size * p.life), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ════════════════════════════════════════════════════════════════
//  INIT LEVEL
// ════════════════════════════════════════════════════════════════
function initLevel(idx) {
  levelIndex = idx;
  const lvl = LEVELS[idx];
  particles = [];
  animTime = 0;
  coyote = 0;
  jumpBuf = 0;
  hasKey = false;
  wasOnGround = false;

  player = {
    x: lvl.playerStart.x, y: lvl.playerStart.y,
    w: 26, h: 34,
    vx: 0, vy: 0,
    onGround: false,
    facingRight: true,
    walkTimer: 0, walkFrame: 0,
  };

  door = { x: lvl.door.x, y: lvl.door.y, w: 40, h: 58, open: false };

  keyItem = {
    x: lvl.key.x, y: lvl.key.y,
    w: 24, h: 12,
    collected: false,
    bobTime: 0,
  };

  platforms = lvl.platforms.map(p => ({ ...p }));
  spikes    = lvl.spikes.map(s => ({ ...s }));
  coins     = lvl.coins.map(c => ({ x: c.x, y: c.y, r: 8, collected: false }));
}

function startGame(idx = 0) {
  score = 0;
  gameTime = 0;
  deaths = 0;
  initLevel(idx);
  gameState = STATE.PLAYING;
}

// ════════════════════════════════════════════════════════════════
//  COLLISION
// ════════════════════════════════════════════════════════════════
function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}

function resolveCollisions() {
  player.onGround = false;
  for (const p of platforms) {
    if (!overlaps(player, p)) continue;
    const ol = (player.x + player.w) - p.x;
    const or_ = (p.x + p.w) - player.x;
    const ot = (player.y + player.h) - p.y;
    const ob = (p.y + p.h) - player.y;
    const min = Math.min(ol, or_, ot, ob);
    if      (min === ot && player.vy >= 0) { player.y = p.y - player.h; player.vy = 0; player.onGround = true; }
    else if (min === ob && player.vy <  0) { player.y = p.y + p.h;      player.vy = 0; }
    else if (min === ol)                   { player.x = p.x - player.w;  player.vx = 0; }
    else if (min === or_)                  { player.x = p.x + p.w;       player.vx = 0; }
  }
}

// ════════════════════════════════════════════════════════════════
//  LEVEL SELECT HELPERS
// ════════════════════════════════════════════════════════════════
const LS_PAD   = 48;           // padding from canvas edge
const LS_CELL  = 80;           // cell size
const LS_GAP   = 14;           // gap between cells
const LS_ROWS_VIS = 4;         // visible rows

function lsGridX(col) { return LS_PAD + col * (LS_CELL + LS_GAP); }
function lsGridY(row) { return 110 + row * (LS_CELL + LS_GAP); }

function lsMaxScroll() {
  const totalRows = Math.ceil(LEVELS.length / LS_COLS);
  return Math.max(0, totalRows - LS_ROWS_VIS);
}

// ════════════════════════════════════════════════════════════════
//  UPDATE
// ════════════════════════════════════════════════════════════════
function update(dt) {
  animTime += dt;

  // ── MENU ─────────────────────────────────────────────────────
  if (gameState === STATE.MENU) {
    if (wasPressed('Space','Enter','KeyW','ArrowUp')) {
      SFX.menuClick();
      gameState = STATE.LEVEL_SELECT;
      lsCursor  = 0;
      lsScroll  = 0;
    }
    clearJustPressed();
    return;
  }

  // ── LEVEL SELECT ─────────────────────────────────────────────
  if (gameState === STATE.LEVEL_SELECT) {
    const col = lsCursor % LS_COLS;
    const row = Math.floor(lsCursor / LS_COLS);
    let moved = false;

    if (wasPressed('ArrowRight','KeyD')) {
      if (lsCursor + 1 < LEVELS.length && lsCursor % LS_COLS < LS_COLS - 1) {
        lsCursor++; moved = true;
        SFX.coin();
      }
    }
    if (wasPressed('ArrowLeft','KeyA')) {
      if (lsCursor - 1 >= 0 && lsCursor % LS_COLS > 0) {
        lsCursor--; moved = true;
        SFX.coin();
      }
    }
    if (wasPressed('ArrowDown')) {
      if (lsCursor + LS_COLS < LEVELS.length) { lsCursor += LS_COLS; moved = true; }
      SFX.coin();
    }
    if (wasPressed('ArrowUp')) {
      if (lsCursor - LS_COLS >= 0) { lsCursor -= LS_COLS; moved = true; }
      SFX.coin();
    }
    if (moved) {
      // auto-scroll
      const newRow = Math.floor(lsCursor / LS_COLS);
      if (newRow < lsScroll) lsScroll = newRow;
      if (newRow >= lsScroll + LS_ROWS_VIS) lsScroll = newRow - LS_ROWS_VIS + 1;
    }

    if (wasPressed('Space','Enter')) {
      if (lsCursor <= unlockedUpTo) {
        SFX.levelWin();
        startGame(lsCursor);
      } else {
        SFX.die(); // locked buzz
      }
    }
    if (wasPressed('Escape','KeyQ')) {
      SFX.menuNav();
      gameState = STATE.MENU;
    }
    clearJustPressed();
    return;
  }

  // ── DEAD ─────────────────────────────────────────────────────
  if (gameState === STATE.DEAD) {
    updateParticles(dt);
    if (wasPressed('Space','Enter','KeyR','ArrowUp','KeyW')) {
      SFX.menuClick();
      initLevel(levelIndex);
      gameState = STATE.PLAYING;
    }
    if (wasPressed('Escape','KeyQ','KeyM')) {
      SFX.menuNav();
      gameState = STATE.MENU;
    }
    clearJustPressed();
    return;
  }

  // ── WIN ──────────────────────────────────────────────────────
  if (gameState === STATE.WIN) {
    updateParticles(dt);
    if (wasPressed('Space','Enter','KeyW','ArrowUp')) {
      SFX.menuClick();
      if (levelIndex + 1 < LEVELS.length) {
        initLevel(levelIndex + 1);
        gameState = STATE.PLAYING;
      } else {
        gameState = STATE.MENU;
      }
    }
    if (wasPressed('Escape','KeyQ','KeyM')) {
      SFX.menuNav();
      gameState = STATE.MENU;
    }
    if (wasPressed('KeyL')) {
      SFX.menuNav();
      lsCursor = levelIndex;
      lsScroll = Math.max(0, Math.floor(levelIndex / LS_COLS) - 1);
      gameState = STATE.LEVEL_SELECT;
    }
    clearJustPressed();
    return;
  }

  // ── PLAYING ──────────────────────────────────────────────────
  gameTime += dt;

  // Jump buffer
  if (wasPressed('Space','ArrowUp','KeyW')) jumpBuf = JUMP_BUFFER;
  else jumpBuf = Math.max(0, jumpBuf - dt);

  // Horizontal
  let moving = false;
  if (isDown('ArrowLeft','KeyA')) {
    player.vx = -PLAYER_SPEED; player.facingRight = false; moving = true;
  } else if (isDown('ArrowRight','KeyD')) {
    player.vx = PLAYER_SPEED;  player.facingRight = true;  moving = true;
  } else {
    player.vx = 0;
  }

  // Walk anim
  if (moving && player.onGround) {
    player.walkTimer += dt;
    if (player.walkTimer > 0.1) { player.walkFrame = (player.walkFrame + 1) % 4; player.walkTimer = 0; }
  } else { player.walkFrame = 0; player.walkTimer = 0; }

  // Coyote
  if (player.onGround) coyote = COYOTE_TIME;
  else coyote = Math.max(0, coyote - dt);

  // Jump
  if (jumpBuf > 0 && coyote > 0) {
    player.vy = -JUMP_FORCE;
    coyote = 0; jumpBuf = 0;
    SFX.jump();
  }

  // Gravity
  player.vy += GRAVITY * dt;

  // Move
  player.x += player.vx * dt;
  player.y += player.vy * dt;

  // Wall bounds
  if (player.x < 0)           { player.x = 0;           player.vx = 0; }
  if (player.x + player.w > W){ player.x = W - player.w; player.vx = 0; }

  const prevOnGround = wasOnGround;
  resolveCollisions();

  // Land sound
  if (!prevOnGround && player.onGround) SFX.land();
  wasOnGround = player.onGround;

  // Fell off screen
  if (player.y > H + 60) { die(); return; }

  // Spike collision
  for (const s of spikes) {
    if (overlaps(player, { x: s.x + 4, y: s.y, w: s.w - 8, h: s.h })) { die(); return; }
  }

  // Coin collection
  keyItem.bobTime += dt;
  for (const c of coins) {
    if (!c.collected && overlaps(player, { x: c.x - c.r, y: c.y - c.r, w: c.r*2, h: c.r*2 })) {
      c.collected = true;
      score += 10;
      spawnParticles(c.x, c.y, 8, '#ffd60a', 60, 150, 60);
      SFX.coin();
    }
  }

  // Key collection
  if (!keyItem.collected && overlaps(player, { x: keyItem.x - 12, y: keyItem.y - 14, w: 48, h: 36 })) {
    keyItem.collected = true;
    hasKey = true;
    score += 50;
    door.open = true;
    spawnParticles(keyItem.x, keyItem.y, 24, '#ffd60a', 80, 220, 100);
    spawnParticles(keyItem.x, keyItem.y, 12, '#fff07a', 40, 120, 60);
    SFX.key();
  }

  // Door
  if (hasKey && overlaps(player, door)) {
    const bonus = Math.max(0, 200 - Math.floor(gameTime) * 3);
    score += bonus;
    spawnParticles(door.x + door.w/2, door.y + door.h/2, 30, '#ffd60a', 100, 280, 120);
    spawnParticles(door.x + door.w/2, door.y + door.h/2, 20, '#ffffff', 60, 160, 80);

    // Unlock next level
    if (levelIndex >= unlockedUpTo && levelIndex + 1 < LEVELS.length) {
      unlockedUpTo = levelIndex + 1;
      saveUnlocked();
    }

    const isLast = levelIndex + 1 >= LEVELS.length;
    if (isLast) SFX.gameWin(); else SFX.levelWin();
    gameState = STATE.WIN;
  }

  // R to restart
  if (wasPressed('KeyR')) { deaths++; initLevel(levelIndex); }

  // Escape to menu
  if (wasPressed('Escape')) { gameState = STATE.MENU; }

  updateParticles(dt);
  clearJustPressed();
}

function die() {
  deaths++;
  spawnParticles(player.x + player.w/2, player.y + player.h/2, 18, '#4cc9f0', 80, 240, 80);
  SFX.die();
  gameState = STATE.DEAD;
}

// ════════════════════════════════════════════════════════════════
//  DRAW HELPERS
// ════════════════════════════════════════════════════════════════
function drawBg(idx) {
  idx = Math.max(0, Math.min(idx, LEVELS.length - 1));
  const lvl = LEVELS[idx];
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, lvl.bgTop);
  grad.addColorStop(1, lvl.bgBot);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Stars
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  const seed = idx * 137;
  for (let i = 0; i < 38; i++) {
    const sx = ((seed * (i + 1) * 9301 + 49297) % 233280) / 233280 * W;
    const sy = ((seed * (i + 1) * 5521 + 11213) % 233280) / 233280 * (H * 0.75);
    const sr = 0.5 + ((seed * (i + 3) * 3571) % 100) / 100 * 1.2;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPlatforms() {
  for (const p of platforms) {
    const grad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.h);
    grad.addColorStop(0, '#3a4a6a');
    grad.addColorStop(1, '#1a2040');
    ctx.fillStyle = grad;
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = '#5a6a9a';
    ctx.fillRect(p.x, p.y, p.w, 3);
  }
}

function drawSpikes() {
  ctx.fillStyle = '#e63946';
  for (const s of spikes) {
    const count = Math.floor(s.w / 14);
    const sw = s.w / count;
    for (let i = 0; i < count; i++) {
      ctx.beginPath();
      ctx.moveTo(s.x + i * sw,        s.y + s.h);
      ctx.lineTo(s.x + i * sw + sw/2, s.y);
      ctx.lineTo(s.x + (i+1) * sw,    s.y + s.h);
      ctx.fill();
    }
  }
}

function drawKey() {
  if (keyItem.collected) return;
  const bob = Math.sin(keyItem.bobTime * 3) * 4;
  const kx  = keyItem.x;
  const ky  = keyItem.y + bob;

  ctx.save();
  ctx.shadowBlur  = 18;
  ctx.shadowColor = '#ffd60a';
  ctx.strokeStyle = '#ffd60a';
  ctx.lineWidth   = 4;
  ctx.beginPath();
  ctx.arc(kx, ky, 10, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#0d0d1a';
  ctx.beginPath();
  ctx.arc(kx, ky, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffd60a';
  ctx.fillRect(kx + 8, ky - 2, 18, 4);
  ctx.fillRect(kx + 20, ky + 2, 4, 6);
  ctx.fillRect(kx + 26, ky + 2, 4, 8);
  ctx.restore();
}

function drawDoor() {
  const d = door;
  ctx.fillStyle = hasKey ? '#2d6a2d' : '#2a2a4a';
  ctx.fillRect(d.x, d.y, d.w, d.h);
  ctx.strokeStyle = hasKey ? '#5aff5a' : '#4a4a8a';
  ctx.lineWidth = 2;
  ctx.strokeRect(d.x + 2, d.y + 2, d.w - 4, d.h - 4);

  // Door handle
  ctx.fillStyle = '#ffd60a';
  ctx.beginPath();
  ctx.arc(d.x + d.w/2, d.y + d.h/2 + 8, 9, 0, Math.PI * 2);
  ctx.fill();

  if (!hasKey) {
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.beginPath();
    ctx.arc(d.x + d.w/2, d.y + d.h/2 + 8, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffd60a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(d.x + d.w/2, d.y + d.h/2 + 2, 5, Math.PI, 0);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('EXIT', d.x + d.w/2, d.y - 7);
}

function drawCoins() {
  for (const c of coins) {
    if (c.collected) continue;
    ctx.fillStyle = '#ffd60a';
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffaa00';
    ctx.beginPath();
    ctx.arc(c.x - 1.5, c.y - 1.5, c.r * 0.42, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPlayer() {
  if (gameState === STATE.DEAD) return;
  const p = player;
  ctx.save();
  ctx.translate(Math.round(p.x + p.w/2), Math.round(p.y + p.h/2));
  if (!p.facingRight) ctx.scale(-1, 1);

  ctx.fillStyle = '#4cc9f0';
  ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h - 8);
  ctx.fillRect(-p.w/2 + 2, -p.h/2 - 10, p.w - 4, 12);
  ctx.fillStyle = '#0d0d1a';
  ctx.fillRect(p.w/2 - 9, -p.h/2 - 6, 4, 5);

  const swing = p.onGround ? Math.sin(animTime * 12) * 4 : 0;
  ctx.fillStyle = '#2a9cbf';
  ctx.fillRect(-9, p.h/2 - 10, 8, 10 + swing);
  ctx.fillRect(1,  p.h/2 - 10, 8, 10 - swing);
  ctx.restore();

  if (hasKey) {
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ffd60a';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd60a';
    ctx.fillText('KEY', Math.round(p.x + p.w/2), Math.round(p.y) - 6);
    ctx.restore();
  }
}

function drawHUD() {
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, W, 34);

  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffd60a';
  ctx.fillText('★ ' + score, 10, 21);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#f0f0f0';
  ctx.fillText('Level ' + (levelIndex + 1) + ' / ' + LEVELS.length, W/2, 21);

  const mm = String(Math.floor(gameTime / 60)).padStart(2,'0');
  const ss = String(Math.floor(gameTime % 60)).padStart(2,'0');
  ctx.textAlign = 'right';
  ctx.fillStyle = '#aaa';
  ctx.fillText(mm + ':' + ss, W - 10, 21);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd60a';
  ctx.font = '12px monospace';
  ctx.fillText(
    hasKey ? 'Go to the door and exit!' : 'A/D to move  ·  W/↑/Space to jump  ·  Get the key!',
    W/2, H - 10
  );
}

// ════════════════════════════════════════════════════════════════
//  SCREEN DRAWS
// ════════════════════════════════════════════════════════════════

// ── Helper: rounded glassy card ──────────────────────────────
function drawCard(x, y, w, h, alpha = 0.72) {
  ctx.save();
  ctx.fillStyle = `rgba(8,8,24,${alpha})`;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 18);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

// ── Helper: glow text ────────────────────────────────────────
function glowText(text, x, y, font, color, glow, align = 'center') {
  ctx.save();
  ctx.font = font;
  ctx.textAlign = align;
  ctx.shadowBlur = 22;
  ctx.shadowColor = glow;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

// ── Helper: big key icon ─────────────────────────────────────
function drawKeyIcon(cx, cy, scale = 1) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.shadowBlur  = 28;
  ctx.shadowColor = '#ffd60a';
  ctx.strokeStyle = '#ffd60a';
  ctx.lineWidth   = 7;
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#08081a';
  ctx.beginPath();
  ctx.arc(0, 0, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffd60a';
  ctx.fillRect(15, -4, 30, 7);
  ctx.fillRect(33, 3, 7, 9);
  ctx.fillRect(41, 3, 7, 12);
  ctx.restore();
}

// ════════════════════════════════════════════════════════════════
//  MAIN MENU
// ════════════════════════════════════════════════════════════════
function drawMenu() {
  drawBg(0);

  const cw = 440, ch = 320;
  const cx = W/2 - cw/2, cy = H/2 - ch/2 - 10;
  drawCard(cx, cy, cw, ch, 0.78);

  // Key icon
  drawKeyIcon(W/2, cy + 62, 1.15);

  glowText('COLLECT A KEY', W/2, cy + 130, 'bold 34px monospace', '#ffd60a', '#ffaa00');

  ctx.textAlign = 'center';
  ctx.font = '14px monospace';
  ctx.fillStyle = '#aaaacc';
  ctx.fillText('Grab the key · Open the door · Escape!', W/2, cy + 162);

  // Play button visual
  const btnY = cy + 205;
  ctx.fillStyle = 'rgba(255,214,10,0.12)';
  ctx.beginPath();
  ctx.roundRect(W/2 - 130, btnY, 260, 42, 10);
  ctx.fill();
  ctx.strokeStyle = '#ffd60a';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  glowText('▶  PRESS SPACE TO PLAY', W/2, btnY + 27, 'bold 16px monospace', '#ffffff', '#ffd60a');

  ctx.font = '12px monospace';
  ctx.fillStyle = '#555577';
  ctx.fillText(LEVELS.length + ' levels  ·  Collect coins for bonus points', W/2, cy + ch - 18);

  // Progress bar
  const prog = unlockedUpTo / (LEVELS.length - 1);
  const bw = 280, bh = 6;
  const bx = W/2 - bw/2, by = cy + ch - 42;
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 3); ctx.fill();
  ctx.fillStyle = '#ffd60a';
  ctx.beginPath(); ctx.roundRect(bx, by, bw * prog, bh, 3); ctx.fill();
  ctx.font = '11px monospace';
  ctx.fillStyle = '#888899';
  ctx.fillText((unlockedUpTo + 1) + ' / ' + LEVELS.length + ' levels unlocked', W/2, by - 6);
}

// ════════════════════════════════════════════════════════════════
//  LEVEL SELECT
// ════════════════════════════════════════════════════════════════
function drawLevelSelect() {
  drawBg(Math.min(lsCursor, LEVELS.length - 1));

  // Header
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, 0, W, 98);
  glowText('SELECT LEVEL', W/2, 44, 'bold 26px monospace', '#ffd60a', '#aa7700');
  ctx.font = '12px monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#666688';
  ctx.fillText('Arrow keys to navigate · SPACE / Enter to play · ESC back', W/2, 70);

  // Progress bar strip
  const prog = (unlockedUpTo) / Math.max(1, LEVELS.length - 1);
  ctx.fillStyle = 'rgba(255,214,10,0.08)';
  ctx.fillRect(0, 88, W * prog, 10);
  ctx.fillStyle = '#ffd60a';
  ctx.fillRect(0, 93, W * prog, 5);

  const totalRows = Math.ceil(LEVELS.length / LS_COLS);
  const visRows   = Math.min(LS_ROWS_VIS, totalRows);

  for (let vi = 0; vi < visRows; vi++) {
    const row = lsScroll + vi;
    if (row >= totalRows) break;
    for (let col = 0; col < LS_COLS; col++) {
      const idx = row * LS_COLS + col;
      if (idx >= LEVELS.length) break;

      const cx2 = lsGridX(col);
      const cy2 = lsGridY(vi);
      const locked  = idx > unlockedUpTo;
      const active  = idx === lsCursor;
      const lvl     = LEVELS[idx];

      // Cell bg — use level color as tint
      ctx.save();
      if (active) {
        ctx.shadowBlur  = 20;
        ctx.shadowColor = '#ffd60a';
      }
      ctx.fillStyle = locked
        ? 'rgba(20,20,35,0.85)'
        : active
          ? 'rgba(255,214,10,0.22)'
          : 'rgba(30,35,70,0.80)';
      ctx.beginPath();
      ctx.roundRect(cx2, cy2, LS_CELL, LS_CELL, 10);
      ctx.fill();

      // Border
      ctx.strokeStyle = active ? '#ffd60a' : locked ? '#333355' : '#4a4a7a';
      ctx.lineWidth   = active ? 2.5 : 1;
      ctx.stroke();
      ctx.restore();

      // Level preview: small gradient swatch
      if (!locked) {
        const miniGrad = ctx.createLinearGradient(cx2 + 6, cy2 + 6, cx2 + 6, cy2 + 36);
        miniGrad.addColorStop(0, lvl.bgTop);
        miniGrad.addColorStop(1, lvl.bgBot);
        ctx.fillStyle = miniGrad;
        ctx.beginPath();
        ctx.roundRect(cx2 + 6, cy2 + 6, LS_CELL - 12, 34, 6);
        ctx.fill();
      }

      // Number & Lock Icon
      ctx.save();
      if (active) { 
        ctx.shadowBlur = 10; 
        ctx.shadowColor = '#ffd60a'; 
      }
      ctx.textAlign = 'center';
      
      if (locked) {
        // Draw the level number (dimmed)
        ctx.font = 'bold 18px monospace';
        ctx.fillStyle = '#333355';
        ctx.fillText(String(idx + 1), cx2 + LS_CELL/2, cy2 + 55);
        
        // Draw the lock icon below the number
        ctx.font = '14px monospace';
        ctx.fillText('🔒', cx2 + LS_CELL/2, cy2 + 75);
      } else {
        // Draw the active/unlocked level number
        ctx.font = 'bold 22px monospace';
        ctx.fillStyle = active ? '#ffd60a' : '#c0c0e0';
        ctx.fillText(String(idx + 1), cx2 + LS_CELL/2, cy2 + 62);
      }
      ctx.restore();
    }
  }

  // Scroll arrows
  if (lsScroll > 0) {
    ctx.font = '20px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText('▲', W/2, 104);
  }
  if (lsScroll < lsMaxScroll()) {
    ctx.font = '20px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText('▼', W/2, H - 14);
  }
}

// ════════════════════════════════════════════════════════════════
//  WIN SCREEN (redesigned)
// ════════════════════════════════════════════════════════════════
function drawWinScreen() {
  drawBg(levelIndex);
  drawPlatforms(); drawSpikes(); drawCoins(); drawDoor(); drawParticles();

  const isLast = levelIndex + 1 >= LEVELS.length;
  const cw = 420, ch = 290;
  const cx = W/2 - cw/2, cy = H/2 - ch/2;
  drawCard(cx, cy, cw, ch, 0.80);

  // Trophy glow ring
  ctx.save();
  ctx.shadowBlur  = 40;
  ctx.shadowColor = '#ffd60a';
  ctx.strokeStyle = '#ffd60a';
  ctx.lineWidth   = 4;
  ctx.beginPath();
  ctx.arc(W/2, cy + 62, 30, 0, Math.PI * 2);
  ctx.stroke();
  ctx.font = '32px serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd60a';
  ctx.fillText(isLast ? '🏆' : '✓', W/2, cy + 74);
  ctx.restore();

  glowText(
    isLast ? 'YOU WIN!' : 'LEVEL CLEAR!',
    W/2, cy + 118,
    'bold 34px monospace',
    isLast ? '#ffd60a' : '#7af070',
    isLast ? '#aa8800' : '#3a8030'
  );

  // Score row
  ctx.font = '16px monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ccccee';
  ctx.fillText('Score  ' + score, W/2, cy + 152);

  // Deaths / time row
  ctx.font = '13px monospace';
  ctx.fillStyle = '#888899';
  const mm = String(Math.floor(gameTime / 60)).padStart(2,'0');
  const ss = String(Math.floor(gameTime % 60)).padStart(2,'0');
  ctx.fillText('Deaths: ' + deaths + '   Time: ' + mm + ':' + ss, W/2, cy + 178);

  if (!isLast) {
    ctx.fillStyle = '#aaaacc';
    ctx.font = '13px monospace';
    ctx.fillText('Next: Level ' + (levelIndex + 2), W/2, cy + 204);
  } else {
    ctx.fillStyle = '#ffd60a';
    ctx.font = '13px monospace';
    ctx.fillText('All ' + LEVELS.length + ' levels cleared! 🎉', W/2, cy + 204);
  }

  // Button hints
  const btnY = cy + ch - 46;
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.beginPath(); ctx.roundRect(cx + 14, btnY, cw - 28, 34, 8); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.font = 'bold 13px monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  if (isLast) {
    ctx.fillText('SPACE — main menu   ·   L — levels', W/2, btnY + 22);
  } else {
    ctx.fillText('SPACE — next level   ·   L — levels   ·   M — menu', W/2, btnY + 22);
  }
}

// ════════════════════════════════════════════════════════════════
//  DEAD SCREEN (redesigned)
// ════════════════════════════════════════════════════════════════
function drawDeadScreen() {
  drawBg(levelIndex);
  drawPlatforms(); drawSpikes(); drawCoins(); drawKey(); drawDoor(); drawParticles();

  // Red vignette overlay
  const vign = ctx.createRadialGradient(W/2, H/2, H*0.15, W/2, H/2, H*0.8);
  vign.addColorStop(0, 'rgba(180,0,0,0.0)');
  vign.addColorStop(1, 'rgba(140,0,0,0.55)');
  ctx.fillStyle = vign;
  ctx.fillRect(0, 0, W, H);

  const cw = 400, ch = 280;
  const cx = W/2 - cw/2, cy = H/2 - ch/2;
  drawCard(cx, cy, cw, ch, 0.82);

  // Skull icon
  ctx.save();
  ctx.shadowBlur = 30; ctx.shadowColor = '#e63946';
  ctx.font = '38px serif'; ctx.textAlign = 'center';
  ctx.fillStyle = '#e63946';
  ctx.fillText('💀', W/2, cy + 72);
  ctx.restore();

  glowText('YOU DIED', W/2, cy + 112, 'bold 36px monospace', '#e63946', '#800010');

  ctx.font = '14px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#aaaacc';
  ctx.fillText('Level ' + (levelIndex + 1) + '   Deaths: ' + deaths, W/2, cy + 146);

  // Tip (random or contextual)
  const tips = [
    'Use coyote time — jump just after the edge!',
    'Coins are optional, but tasty.',
    'R restarts the level instantly.',
    'Study the level before rushing.',
    'Jump buffer: press jump just before landing!',
  ];
  ctx.font = '12px monospace'; ctx.fillStyle = '#555577';
  ctx.fillText('Tip: ' + tips[deaths % tips.length], W/2, cy + 172);

  // Buttons
  const b1y = cy + ch - 74;
  ctx.fillStyle = 'rgba(230,57,70,0.15)';
  ctx.beginPath(); ctx.roundRect(cx + 14, b1y, cw - 28, 34, 8); ctx.fill();
  ctx.strokeStyle = 'rgba(230,57,70,0.35)'; ctx.lineWidth = 1; ctx.stroke();
  glowText('SPACE / Enter — retry', W/2, b1y + 22, 'bold 14px monospace', '#ffffff', '#e63946');

  const b2y = cy + ch - 36;
  ctx.font = '12px monospace'; ctx.fillStyle = '#555577';
  ctx.fillText('R — restart   ·   M / ESC — main menu', W/2, b2y + 16);
}

// ════════════════════════════════════════════════════════════════
//  MAIN DRAW
// ════════════════════════════════════════════════════════════════
function draw() {
  ctx.clearRect(0, 0, W, H);

  if (gameState === STATE.MENU)         { drawMenu();        return; }
  if (gameState === STATE.LEVEL_SELECT) { drawLevelSelect(); return; }
  if (gameState === STATE.WIN)          { drawWinScreen();   return; }
  if (gameState === STATE.DEAD)         { drawDeadScreen();  return; }

  // PLAYING
  drawBg(levelIndex);
  drawPlatforms();
  drawSpikes();
  drawCoins();
  drawKey();
  drawDoor();
  drawPlayer();
  drawParticles();
  drawHUD();
}

// ════════════════════════════════════════════════════════════════
//  MOBILE TOUCH — tap canvas to advance screens
// ════════════════════════════════════════════════════════════════
canvas.addEventListener('touchstart', () => {
  if (gameState === STATE.MENU)         { SFX.menuClick(); gameState = STATE.LEVEL_SELECT; }
  if (gameState === STATE.DEAD)         { SFX.menuClick(); initLevel(levelIndex); gameState = STATE.PLAYING; }
  if (gameState === STATE.WIN) {
    SFX.menuClick();
    if (levelIndex + 1 < LEVELS.length) { initLevel(levelIndex + 1); gameState = STATE.PLAYING; }
    else gameState = STATE.MENU;
  }
});

// ════════════════════════════════════════════════════════════════
//  GAME LOOP
// ════════════════════════════════════════════════════════════════
let lastTime = 0;
function loop(ts) {
  const dt = Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
