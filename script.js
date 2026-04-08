// (Keep all your existing LEVEL and CONSTANT data here...)
const W = 800, H = 500;
const GRAVITY      = 1400;
const PLAYER_SPEED = 240;
const JUMP_FORCE   = 560;
const COYOTE_TIME  = 0.1;
const JUMP_BUFFER  = 0.1;

// ... [Insert all the LEVELS array data from your original code here] ...
// I am omitting the levels array for brevity in the response, 
// but keep yours exactly as it is.

const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');
canvas.width  = W;
canvas.height = H;

// ════════════════════════════════════════════════════════════════
//  INPUT HANDLING (PC + MOBILE)
// ════════════════════════════════════════════════════════════════
const keys = {};
const justPressed = {};

// Touch state
const touch = { left: false, right: false, jump: false };

document.addEventListener('keydown', e => {
  if (!keys[e.code]) justPressed[e.code] = true;
  keys[e.code] = true;
  if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
});
document.addEventListener('keyup', e => { keys[e.code] = false; });

// Mobile Button Listeners
const setupTouch = (id, key) => {
  const el = document.getElementById(id);
  el.addEventListener('touchstart', (e) => { e.preventDefault(); touch[key] = true; justPressed['TouchJump'] = (key === 'jump'); });
  el.addEventListener('touchend', (e) => { e.preventDefault(); touch[key] = false; });
};

setupTouch('btnLeft', 'left');
setupTouch('btnRight', 'right');
setupTouch('btnJump', 'jump');

// Helper functions updated for mobile
function isDown(...codes) { 
  if (codes.includes('ArrowLeft') && touch.left) return true;
  if (codes.includes('ArrowRight') && touch.right) return true;
  return codes.some(c => keys[c]); 
}

function wasPressed(...codes) { 
  if (codes.includes('Space') && justPressed['TouchJump']) return true;
  return codes.some(c => justPressed[c]); 
}

function clearJustPressed() { 
  for (const k in justPressed) delete justPressed[k]; 
}

// ════════════════════════════════════════════════════════════════
//  SCALING LOGIC
// ════════════════════════════════════════════════════════════════
function resize() {
  const container = document.getElementById('game-container');
  const winW = window.innerWidth;
  const winH = window.innerHeight;
  const scale = Math.min(winW / W, winH / H);
  
  canvas.style.width = (W * scale) + "px";
  canvas.style.height = (H * scale) + "px";
}
window.addEventListener('resize', resize);
resize();

// ... [Keep your existing GAME STATE, PARTICLES, COLLISION, and DRAW functions here] ...
// All functions like update(), draw(), drawPlayer(), etc. remain the same.
// Just ensure the update() function uses the updated wasPressed() and isDown().

// One small tweak for mobile: Allow tapping the screen to start/retry
canvas.addEventListener('touchstart', () => {
    if (gameState === STATE.MENU) startGame();
    if (gameState === STATE.DEAD) { initLevel(levelIndex); gameState = STATE.PLAYING; }
    if (gameState === STATE.WIN) {
        if (levelIndex + 1 < LEVELS.length) { initLevel(levelIndex + 1); gameState = STATE.PLAYING; }
        else gameState = STATE.MENU;
    }
});




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
      { x: 430, y: 233, w: 28, h: 17 },
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
];

// ════════════════════════════════════════════════════════════════
//  GAME STATE
// ════════════════════════════════════════════════════════════════
const STATE = { MENU: 'menu', PLAYING: 'playing', WIN: 'win', DEAD: 'dead' };
let gameState = STATE.MENU;

let levelIndex = 0;
let score = 0, totalScore = 0, gameTime = 0, deaths = 0;
let animTime = 0;

// Per-level entities
let player, door, keyItem, platforms, spikes, coins, hasKey;
let coyote = 0, jumpBuf = 0;

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
      color
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

  player = {
    x: lvl.playerStart.x,
    y: lvl.playerStart.y,
    w: 26, h: 34,
    vx: 0, vy: 0,
    onGround: false,
    facingRight: true,
    walkTimer: 0,
    walkFrame: 0,
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

function startGame() {
  score = 0;
  gameTime = 0;
  deaths = 0;
  initLevel(0);
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
    if (min === ot && player.vy >= 0) {
      player.y = p.y - player.h;
      player.vy = 0;
      player.onGround = true;
    } else if (min === ob && player.vy < 0) {
      player.y = p.y + p.h;
      player.vy = 0;
    } else if (min === ol) {
      player.x = p.x - player.w;
      player.vx = 0;
    } else if (min === or_) {
      player.x = p.x + p.w;
      player.vx = 0;
    }
  }
}

// ════════════════════════════════════════════════════════════════
//  UPDATE
// ════════════════════════════════════════════════════════════════
function update(dt) {
  animTime += dt;

  if (gameState === STATE.MENU) {
    if (wasPressed('Space','Enter','KeyW','ArrowUp')) startGame();
    clearJustPressed();
    return;
  }

  if (gameState === STATE.DEAD) {
    updateParticles(dt);
    if (wasPressed('Space','Enter','KeyR')) {
      initLevel(levelIndex);
      gameState = STATE.PLAYING;
    }
    clearJustPressed();
    return;
  }

  if (gameState === STATE.WIN) {
    updateParticles(dt);
    if (wasPressed('Space','Enter')) {
      if (levelIndex + 1 < LEVELS.length) {
        initLevel(levelIndex + 1);
        gameState = STATE.PLAYING;
      } else {
        gameState = STATE.MENU;
      }
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
    player.vx = -PLAYER_SPEED;
    player.facingRight = false;
    moving = true;
  } else if (isDown('ArrowRight','KeyD')) {
    player.vx = PLAYER_SPEED;
    player.facingRight = true;
    moving = true;
  } else {
    player.vx = 0;
  }

  // Walk anim
  if (moving && player.onGround) {
    player.walkTimer += dt;
    if (player.walkTimer > 0.1) { player.walkFrame = (player.walkFrame + 1) % 4; player.walkTimer = 0; }
  } else {
    player.walkFrame = 0;
    player.walkTimer = 0;
  }

  // Coyote
  if (player.onGround) coyote = COYOTE_TIME;
  else coyote = Math.max(0, coyote - dt);

  // Jump
  if (jumpBuf > 0 && coyote > 0) {
    player.vy = -JUMP_FORCE;
    coyote = 0;
    jumpBuf = 0;
  }

  // Gravity
  player.vy += GRAVITY * dt;

  // Move
  player.x += player.vx * dt;
  player.y += player.vy * dt;

  // Wall bounds
  if (player.x < 0) { player.x = 0; player.vx = 0; }
  if (player.x + player.w > W) { player.x = W - player.w; player.vx = 0; }

  resolveCollisions();

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
  }

  // Door
  if (hasKey && overlaps(player, door)) {
    score += Math.max(0, 200 - Math.floor(gameTime) * 3);
    spawnParticles(door.x + door.w/2, door.y + door.h/2, 30, '#ffd60a', 100, 280, 120);
    spawnParticles(door.x + door.w/2, door.y + door.h/2, 20, '#ffffff', 60, 160, 80);
    gameState = STATE.WIN;
  }

  // R to restart
  if (wasPressed('KeyR')) { deaths++; initLevel(levelIndex); }

  updateParticles(dt);
  clearJustPressed();
}

function die() {
  deaths++;
  spawnParticles(player.x + player.w/2, player.y + player.h/2, 18, '#4cc9f0', 80, 240, 80);
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
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  const seed = idx * 999;
  for (let i = 0; i < 50; i++) {
    // Simple deterministic star positions
    const sx = ((seed + i * 173) % (W - 20)) + 10;
    const sy = ((seed + i * 97)  % (H * 0.6 - 20)) + 10;
    const sr = 0.5 + (i % 3) * 0.6;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPlatforms() {
  for (const p of platforms) {
    ctx.fillStyle = '#40916c';
    ctx.fillRect(p.x, p.y + 6, p.w, p.h - 6);
    ctx.fillStyle = '#74c69d';
    ctx.fillRect(p.x, p.y, p.w, 6);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(p.x, p.y, p.w, 2);
  }
}

function drawSpikes() {
  for (const s of spikes) {
    const count = Math.max(1, Math.floor(s.w / 14));
    const tw = s.w / count;
    ctx.fillStyle = '#e63946';
    for (let i = 0; i < count; i++) {
      ctx.beginPath();
      ctx.moveTo(s.x + i * tw, s.y + s.h);
      ctx.lineTo(s.x + i * tw + tw / 2, s.y);
      ctx.lineTo(s.x + (i + 1) * tw, s.y + s.h);
      ctx.closePath();
      ctx.fill();
    }
  }
}

function drawKey() {
  if (keyItem.collected) return;
  const bob = Math.sin(keyItem.bobTime * 3) * 5;
  const kx = keyItem.x, ky = keyItem.y + bob;

  ctx.save();
  ctx.shadowBlur = 16;
  ctx.shadowColor = '#ffd60a';

  // Ring
  ctx.strokeStyle = '#ffd60a';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(kx, ky, 10, 0, Math.PI * 2);
  ctx.stroke();
  // Ring hole
  ctx.fillStyle = LEVELS[levelIndex].bgBot;
  ctx.beginPath();
  ctx.arc(kx, ky, 4, 0, Math.PI * 2);
  ctx.fill();
  // Stem
  ctx.fillStyle = '#ffd60a';
  ctx.fillRect(kx + 8, ky - 3, 18, 5);
  // Teeth
  ctx.fillRect(kx + 18, ky + 2, 4, 6);
  ctx.fillRect(kx + 24, ky + 2, 4, 8);

  ctx.restore();
}

function drawDoor() {
  const d = door;
  // Frame
  ctx.fillStyle = '#7a3b2e';
  ctx.fillRect(d.x - 4, d.y - 4, d.w + 8, d.h + 4);
  // Body
  ctx.fillStyle = d.open ? '#52b788' : '#e07a5f';
  ctx.fillRect(d.x, d.y, d.w, d.h);
  // Panels
  ctx.fillStyle = d.open ? '#74c69d' : '#f4a261';
  ctx.fillRect(d.x + 4, d.y + 4, d.w - 8, 18);
  ctx.fillRect(d.x + 4, d.y + 28, d.w - 8, d.h - 34);
  // Knob
  ctx.fillStyle = '#ffd60a';
  ctx.beginPath();
  ctx.arc(d.x + d.w - 7, d.y + d.h / 2, 4, 0, Math.PI * 2);
  ctx.fill();

  if (!hasKey) {
    // padlock
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
  ctx.translate(Math.round(p.x + p.w / 2), Math.round(p.y + p.h / 2));
  if (!p.facingRight) ctx.scale(-1, 1);

  // Body
  ctx.fillStyle = '#4cc9f0';
  ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h - 8);

  // Head
  ctx.fillRect(-p.w/2 + 2, -p.h/2 - 10, p.w - 4, 12);

  // Eye
  ctx.fillStyle = '#0d0d1a';
  ctx.fillRect(p.w/2 - 9, -p.h/2 - 6, 4, 5);

  // Legs
  const swing = p.onGround ? Math.sin(animTime * 12) * 4 : 0;
  ctx.fillStyle = '#2a9cbf';
  ctx.fillRect(-9, p.h/2 - 10, 8, 10 + swing);
  ctx.fillRect(1,  p.h/2 - 10, 8, 10 - swing);

  ctx.restore();

  // Key badge above head
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

  if (!hasKey) {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd60a';
    ctx.font = '12px monospace';
    ctx.fillText('Find the key to unlock the door!', W/2, H - 10);
  }
}

// ════════════════════════════════════════════════════════════════
//  SCREEN DRAWS
// ════════════════════════════════════════════════════════════════
function drawMenu() {
  drawBg(0);

  // Card
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.beginPath();
  ctx.roundRect(W/2 - 210, H/2 - 145, 420, 290, 18);
  ctx.fill();

  ctx.textAlign = 'center';

  // Big key icon drawn with canvas
  const kx = W/2, ky = H/2 - 90;
  ctx.save();
  ctx.shadowBlur = 28;
  ctx.shadowColor = '#ffd60a';
  ctx.strokeStyle = '#ffd60a';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(kx, ky, 18, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#0d0d1a';
  ctx.beginPath();
  ctx.arc(kx, ky, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffd60a';
  ctx.fillRect(kx + 15, ky - 4, 30, 7);
  ctx.fillRect(kx + 33, ky + 3, 7, 9);
  ctx.fillRect(kx + 41, ky + 3, 7, 12);
  ctx.restore();

  ctx.font = 'bold 34px monospace';
  ctx.fillStyle = '#ffd60a';
  ctx.fillText('COLLECT A KEY', W/2, H/2 - 30);

  ctx.font = '14px monospace';
  ctx.fillStyle = '#aaaacc';
  ctx.fillText('Grab the key. Open the door. Escape!', W/2, H/2 + 10);

  ctx.font = 'bold 16px monospace';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Press SPACE to start', W/2, H/2 + 62);

  ctx.font = '12px monospace';
  ctx.fillStyle = '#666688';
  ctx.fillText(LEVELS.length + ' levels  |  Collect coins for bonus points', W/2, H/2 + 100);
}

function drawWinScreen() {
  drawBg(levelIndex);
  drawPlatforms();
  drawSpikes();
  drawCoins();
  drawDoor();
  drawParticles();

  const isLast = levelIndex + 1 >= LEVELS.length;

  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.beginPath();
  ctx.roundRect(W/2 - 190, H/2 - 120, 380, 240, 16);
  ctx.fill();

  ctx.textAlign = 'center';

  // Trophy / star
  ctx.fillStyle = '#ffd60a';
  ctx.font = 'bold 36px monospace';
  ctx.fillText(isLast ? 'YOU WIN!' : 'LEVEL CLEAR', W/2, H/2 - 55);

  ctx.font = '16px monospace';
  ctx.fillStyle = '#f0f0f0';
  ctx.fillText('Score: ' + score, W/2, H/2 - 12);

  if (!isLast) {
    ctx.fillStyle = '#aaaacc';
    ctx.font = '13px monospace';
    ctx.fillText('Next up: Level ' + (levelIndex + 2), W/2, H/2 + 22);
  } else {
    ctx.fillStyle = '#ffd60a';
    ctx.font = '13px monospace';
    ctx.fillText('All ' + LEVELS.length + ' levels cleared!', W/2, H/2 + 22);
  }

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px monospace';
  ctx.fillText(isLast ? 'SPACE — back to menu' : 'SPACE — next level', W/2, H/2 + 78);
}

function drawDeadScreen() {
  drawBg(levelIndex);
  drawPlatforms();
  drawSpikes();
  drawCoins();
  drawKey();
  drawDoor();
  drawParticles();

  ctx.fillStyle = 'rgba(0,0,0,0.68)';
  ctx.beginPath();
  ctx.roundRect(W/2 - 175, H/2 - 100, 350, 200, 14);
  ctx.fill();

  ctx.textAlign = 'center';

  ctx.font = 'bold 30px monospace';
  ctx.fillStyle = '#e63946';
  ctx.fillText('YOU DIED', W/2, H/2 - 40);

  ctx.font = '14px monospace';
  ctx.fillStyle = '#aaa';
  ctx.fillText('Deaths: ' + deaths, W/2, H/2);

  ctx.font = 'bold 14px monospace';
  ctx.fillStyle = '#fff';
  ctx.fillText('SPACE — retry  |  R — restart level', W/2, H/2 + 52);
}

// ════════════════════════════════════════════════════════════════
//  MAIN DRAW
// ════════════════════════════════════════════════════════════════
function draw() {
  ctx.clearRect(0, 0, W, H);

  if (gameState === STATE.MENU) { drawMenu(); return; }
  if (gameState === STATE.WIN)  { drawWinScreen(); return; }
  if (gameState === STATE.DEAD) { drawDeadScreen(); return; }

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
