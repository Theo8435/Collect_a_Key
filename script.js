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
//  POWER-UP CONFIG
// ════════════════════════════════════════════════════════════════
const POWERUP_TYPES = {
  HIGH_JUMP:   { id: 'HIGH_JUMP',   color: '#a78bfa', glow: '#7c3aed', label: '⬆ HIGH JUMP',   duration: () => 10 + Math.random() * 15 },
  SPEED_BOOST: { id: 'SPEED_BOOST', color: '#34d399', glow: '#059669', label: '⚡ SPEED',        duration: () => 10 + Math.random() * 15 },
  INVINCIBLE:  { id: 'INVINCIBLE',  color: '#f59e0b', glow: '#d97706', label: '★ INVINCIBLE',   duration: () => 10 + Math.random() * 15 },
};

// Dev key hash (djb2 of "Hello world") — used only to gate "Add to Game" export
const DEV_KEY_HASH = (function(s){let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h)^s.charCodeAt(i);return h>>>0;})('Hello world');
function hashStr(s){let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h)^s.charCodeAt(i);return h>>>0;}

// ════════════════════════════════════════════════════════════════
//  LEVELS  — loaded from levels.json at startup
// ════════════════════════════════════════════════════════════════
let LEVELS = []; // filled by loadLevels() before game loop starts

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
  powerup()  {
    [440, 550, 660, 880].forEach((f, i) => playTone(f, 'square', 0.10, 0.13, i * 0.06));
  },
  powerdown(){ playFreqSlide(440, 220, 'triangle', 0.20, 0.12); },
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
const STATE = { MENU: 'menu', LEVEL_SELECT: 'levelSelect', PLAYING: 'playing', WIN: 'win', DEAD: 'dead', EDITOR: 'editor' };
let gameState = STATE.MENU;

// ── Editor state ─────────────────────────────────────────────────
// Editor is create-only: edLevels holds only user-created custom levels
let edLevels = [];
let edIdx = 0;
let edTool = 'platform';
let edDrag = null;
let edSelItem = null;
let edSelOffset = {x:0,y:0};
let edSnapSize = 16;
let edSnapOn = true;
let edHistory = []; let edHistPos = -1;
let edMouseX = 0; let edMouseY = 0;
let edTestLevel = null;

let levelIndex = 0;
let score = 0, gameTime = 0, deaths = 0;
let animTime = 0;

// Level select scroll
let lsScroll = 0;      // which row is at top
const LS_COLS = 5;     // columns in grid
let lsCursor = 0;      // highlighted cell (0-based level index)

// Tracking unlocked levels (persisted, set properly after levels load)
let unlockedUpTo = 0;
function saveUnlocked() {
  try { localStorage.setItem('cak_unlocked', String(unlockedUpTo)); } catch(e){}
}

// Per-level entities
let player, door, keyItem, platforms, spikes, coins, hasKey;
let powerupItems = [];   // pickups on ground
let activePowerup = null; // { type, timeLeft }
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
function initLevel(idx, testLvl) {
  levelIndex = idx;
  const lvl = testLvl || LEVELS[idx];
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

  // Power-ups: read from level data if present
  powerupItems = (lvl.powerups || []).map(pu => ({
    x: pu.x, y: pu.y, type: pu.type, collected: false, bobTime: Math.random() * Math.PI * 2,
  }));
  activePowerup = null;
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
    // E or C opens the level creator
    if (wasPressed('KeyE','KeyC')) {
      SFX.menuNav();
      edLevels = edLoadCustom();
      edIdx = Math.max(0, edLevels.length - 1);
      edHistPos = -1; edHistory = [];
      edPushHistory();
      gameState = STATE.EDITOR;
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

  // ── EDITOR ────────────────────────────────────────────────────
  if (gameState === STATE.EDITOR) {
    edMouseX = edMouseX || 0; edMouseY = edMouseY || 0;
    // Escape back to menu
    if (wasPressed('Escape')) { SFX.menuNav(); gameState = STATE.MENU; }
    clearJustPressed();
    return;
  }

  // ── DEAD ─────────────────────────────────────────────────────
  if (gameState === STATE.DEAD) {
    updateParticles(dt);
    if (wasPressed('Space','Enter','KeyR','ArrowUp','KeyW')) {
      SFX.menuClick();
      if (edTestLevel) { initLevel(0, edTestLevel); } else { initLevel(levelIndex); }
      gameState = STATE.PLAYING;
    }
    if (wasPressed('Escape','KeyQ','KeyM')) {
      SFX.menuNav();
      if (edTestLevel) { edTestLevel = null; gameState = STATE.EDITOR; }
      else { gameState = STATE.MENU; }
    }
    clearJustPressed();
    return;
  }

  // ── WIN ──────────────────────────────────────────────────────
  if (gameState === STATE.WIN) {
    updateParticles(dt);
    if (wasPressed('Space','Enter','KeyW','ArrowUp')) {
      SFX.menuClick();
      if (edTestLevel) { edTestLevel = null; gameState = STATE.EDITOR; }
      else if (levelIndex + 1 < LEVELS.length) { initLevel(levelIndex + 1); gameState = STATE.PLAYING; }
      else { gameState = STATE.MENU; }
    }
    if (wasPressed('Escape','KeyQ','KeyM')) {
      SFX.menuNav();
      if (edTestLevel) { edTestLevel = null; gameState = STATE.EDITOR; }
      else { gameState = STATE.MENU; }
    }
    if (wasPressed('KeyL') && !edTestLevel) {
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

  // Active power-up tick
  if (activePowerup) {
    activePowerup.timeLeft -= dt;
    if (activePowerup.timeLeft <= 0) {
      SFX.powerdown();
      activePowerup = null;
    }
  }

  const effSpeed = (activePowerup?.type === 'SPEED_BOOST') ? PLAYER_SPEED * 1.8 : PLAYER_SPEED;
  const effJump  = (activePowerup?.type === 'HIGH_JUMP')   ? JUMP_FORCE  * 1.6 : JUMP_FORCE;

  // Jump buffer
  if (wasPressed('Space','ArrowUp','KeyW')) jumpBuf = JUMP_BUFFER;
  else jumpBuf = Math.max(0, jumpBuf - dt);

  // Horizontal
  let moving = false;
  if (isDown('ArrowLeft','KeyA')) {
    player.vx = -effSpeed; player.facingRight = false; moving = true;
  } else if (isDown('ArrowRight','KeyD')) {
    player.vx = effSpeed;  player.facingRight = true;  moving = true;
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
    player.vy = -effJump;
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

  // Spike collision (invincible = immune)
  if (activePowerup?.type !== 'INVINCIBLE') {
    for (const s of spikes) {
      if (overlaps(player, { x: s.x + 4, y: s.y, w: s.w - 8, h: s.h })) { die(); return; }
    }
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

  // Power-up collection
  const PU_R = 14;
  for (const pu of powerupItems) {
    if (pu.collected) continue;
    pu.bobTime += dt;
    if (overlaps(player, { x: pu.x - PU_R, y: pu.y - PU_R, w: PU_R*2, h: PU_R*2 })) {
      pu.collected = true;
      const cfg = POWERUP_TYPES[pu.type];
      activePowerup = { type: pu.type, timeLeft: cfg.duration() };
      spawnParticles(pu.x, pu.y, 20, cfg.color, 80, 220, 100);
      SFX.powerup();
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
  if (wasPressed('KeyR')) {
    deaths++;
    if (edTestLevel) { initLevel(0, edTestLevel); } else { initLevel(levelIndex); }
  }

  // Escape to menu (or back to editor if testing)
  if (wasPressed('Escape')) {
    if (edTestLevel) { edTestLevel = null; gameState = STATE.EDITOR; }
    else { gameState = STATE.MENU; }
  }

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
  // In test mode levelIndex is -1; fall back to level 0 bg or use edTestLevel's bg
  let lvl;
  if (idx === -1 && edTestLevel) {
    lvl = edTestLevel;
  } else if (LEVELS.length === 0) {
    // Still loading — use default dark bg
    ctx.fillStyle = '#0d0d1a'; ctx.fillRect(0, 0, W, H); return;
  } else {
    idx = Math.max(0, Math.min(idx, LEVELS.length - 1));
    lvl = LEVELS[idx];
  }
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

function drawPowerups() {
  const PU_R = 14;
  for (const pu of powerupItems) {
    if (pu.collected) continue;
    const bob = Math.sin(pu.bobTime * 2.5) * 5;
    const cfg = POWERUP_TYPES[pu.type];
    ctx.save();
    ctx.shadowBlur = 20 + Math.sin(pu.bobTime * 4) * 6;
    ctx.shadowColor = cfg.glow;
    // Outer ring
    ctx.strokeStyle = cfg.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(pu.x, pu.y + bob, PU_R, 0, Math.PI * 2);
    ctx.stroke();
    // Inner fill
    ctx.fillStyle = cfg.glow + '55';
    ctx.beginPath();
    ctx.arc(pu.x, pu.y + bob, PU_R - 2, 0, Math.PI * 2);
    ctx.fill();
    // Icon letter
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = cfg.color;
    ctx.shadowBlur = 10;
    const icon = pu.type === 'HIGH_JUMP' ? '↑↑' : pu.type === 'SPEED_BOOST' ? '⚡' : '★';
    ctx.fillText(icon, pu.x, pu.y + bob + 4);
    ctx.restore();
  }
}

function drawPlayer() {
  if (gameState === STATE.DEAD) return;
  const p = player;
  ctx.save();
  ctx.translate(Math.round(p.x + p.w/2), Math.round(p.y + p.h/2));
  if (!p.facingRight) ctx.scale(-1, 1);

  // Power-up aura
  if (activePowerup) {
    const cfg = POWERUP_TYPES[activePowerup.type];
    const pulse = Math.sin(animTime * 8) * 0.4 + 0.6;
    // Flash warning when < 3s left
    const warning = activePowerup.timeLeft < 3 && Math.sin(animTime * 20) > 0;
    if (!warning) {
      ctx.shadowBlur  = 22;
      ctx.shadowColor = cfg.glow;
      ctx.strokeStyle = cfg.color;
      ctx.lineWidth   = 3;
      ctx.globalAlpha = pulse;
      ctx.strokeRect(-p.w/2 - 4, -p.h/2 - 14, p.w + 8, p.h + 10);
      ctx.globalAlpha = 1;
    }
  }

  const bodyColor = activePowerup?.type === 'INVINCIBLE' ? '#f59e0b'
                  : activePowerup?.type === 'SPEED_BOOST' ? '#34d399'
                  : activePowerup?.type === 'HIGH_JUMP'   ? '#a78bfa'
                  : '#4cc9f0';
  const legColor  = activePowerup ? bodyColor : '#2a9cbf';

  ctx.fillStyle = bodyColor;
  ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h - 8);
  ctx.fillRect(-p.w/2 + 2, -p.h/2 - 10, p.w - 4, 12);
  ctx.fillStyle = '#0d0d1a';
  ctx.fillRect(p.w/2 - 9, -p.h/2 - 6, 4, 5);

  const swing = p.onGround ? Math.sin(animTime * 12) * 4 : 0;
  ctx.fillStyle = legColor;
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
  ctx.fillText(levelIndex === -1 ? '[ TEST MODE ]' : 'Level ' + (levelIndex + 1) + ' / ' + LEVELS.length, W/2, 21);

  const mm = String(Math.floor(gameTime / 60)).padStart(2,'0');
  const ss = String(Math.floor(gameTime % 60)).padStart(2,'0');
  ctx.textAlign = 'right';
  ctx.fillStyle = '#aaa';
  ctx.fillText(mm + ':' + ss, W - 10, 21);

  // Active power-up indicator
  if (activePowerup) {
    const cfg = POWERUP_TYPES[activePowerup.type];
    const maxDur = 25; // approximate max duration for bar display
    const frac = Math.min(1, activePowerup.timeLeft / maxDur);
    const barW = 160, barH = 7;
    const bx = W/2 - barW/2, by = 36;
    const warning = activePowerup.timeLeft < 3;
    const pulse = warning ? (Math.sin(animTime * 20) > 0 ? 1 : 0.3) : 1;

    ctx.save();
    ctx.globalAlpha = pulse;
    // bg track
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath(); ctx.roundRect(bx, by, barW, barH, 3); ctx.fill();
    // fill
    ctx.shadowBlur = 8; ctx.shadowColor = cfg.glow;
    ctx.fillStyle = cfg.color;
    ctx.beginPath(); ctx.roundRect(bx, by, barW * frac, barH, 3); ctx.fill();
    // label
    ctx.shadowBlur = 0;
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = cfg.color;
    ctx.fillText(cfg.label + '  ' + Math.ceil(activePowerup.timeLeft) + 's', W/2, by + barH + 12);
    ctx.restore();
  }

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
// Expose button rects so click handler can use same coords
const MENU_BTNS = {}; // populated each draw

function drawMenu() {
  drawBg(0);

  const cw = 460, ch = 430;
  const cx = W/2 - cw/2, cy = H/2 - ch/2 - 10;
  drawCard(cx, cy, cw, ch, 0.78);

  // Key icon
  drawKeyIcon(W/2, cy + 58, 1.0);

  glowText('COLLECT A KEY', W/2, cy + 118, 'bold 32px monospace', '#ffd60a', '#ffaa00');

  ctx.textAlign = 'center'; ctx.font = '13px monospace'; ctx.fillStyle = '#aaaacc';
  ctx.fillText('Grab the key · Open the door · Escape!', W/2, cy + 144);

  const btnW = 320, btnH = 40, btnX = W/2 - btnW/2;
  let btnY = cy + 166;
  const gap = 10;

  function drawBtn(key, label, fillCol, strokeCol, textCol) {
    MENU_BTNS[key] = { x: btnX, y: btnY, w: btnW, h: btnH };
    ctx.fillStyle = fillCol;
    ctx.beginPath(); ctx.roundRect(btnX, btnY, btnW, btnH, 9); ctx.fill();
    ctx.strokeStyle = strokeCol; ctx.lineWidth = 1.5; ctx.stroke();
    glowText(label, W/2, btnY + 26, 'bold 14px monospace', textCol, strokeCol);
    btnY += btnH + gap;
  }

  drawBtn('play',     '▶  PLAY  ( Space )',          'rgba(255,214,10,0.13)',  '#ffd60a', '#ffffff');
  drawBtn('editor',   '✏  CREATE LEVEL  ( E )',       'rgba(167,139,250,0.13)', '#a78bfa', '#e0d4ff');
  drawBtn('addLevel', '⬆  ADD CUSTOM LEVEL',          'rgba(76,201,240,0.12)',  '#4cc9f0', '#c0f0ff');
  drawBtn('download', '⬇  DOWNLOAD A LEVEL',          'rgba(52,211,153,0.12)',  '#34d399', '#c0ffe8');

  // Progress bar
  const baseLevels = LEVELS.filter(l => !l._custom).length;
  const prog = baseLevels > 1 ? Math.min(unlockedUpTo, baseLevels-1) / (baseLevels - 1) : 0;
  const bw = 320, bh = 6, bx = W/2 - bw/2, by = cy + ch - 52;
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 3); ctx.fill();
  ctx.fillStyle = '#ffd60a';
  ctx.beginPath(); ctx.roundRect(bx, by, bw * prog, bh, 3); ctx.fill();

  ctx.font = '11px monospace'; ctx.fillStyle = '#888899'; ctx.textAlign = 'center';
  const customCount = LEVELS.filter(l => l._custom).length;
  const progLabel = (unlockedUpTo + 1) + ' / ' + baseLevels + ' base levels' + (customCount ? '  +  ' + customCount + ' custom' : '');
  ctx.fillText(progLabel, W/2, by - 6);

  ctx.font = '12px monospace'; ctx.fillStyle = '#555577';
  ctx.fillText(LEVELS.length + ' total levels  ·  Collect coins for bonus points', W/2, cy + ch - 18);
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

      // Cell bg
      ctx.save();
      if (active) { ctx.shadowBlur = 20; ctx.shadowColor = lvl._custom ? '#4cc9f0' : '#ffd60a'; }
      ctx.fillStyle = locked
        ? 'rgba(20,20,35,0.85)'
        : active
          ? (lvl._custom ? 'rgba(76,201,240,0.22)' : 'rgba(255,214,10,0.22)')
          : lvl._custom ? 'rgba(20,40,60,0.80)' : 'rgba(30,35,70,0.80)';
      ctx.beginPath(); ctx.roundRect(cx2, cy2, LS_CELL, LS_CELL, 10); ctx.fill();

      // Border
      ctx.strokeStyle = active ? (lvl._custom ? '#4cc9f0' : '#ffd60a') : locked ? '#333355' : lvl._custom ? '#2a6a8a' : '#4a4a7a';
      ctx.lineWidth = active ? 2.5 : 1; ctx.stroke();
      ctx.restore();

      // Level preview: small gradient swatch
      if (!locked) {
        const miniGrad = ctx.createLinearGradient(cx2 + 6, cy2 + 6, cx2 + 6, cy2 + 36);
        miniGrad.addColorStop(0, lvl.bgTop); miniGrad.addColorStop(1, lvl.bgBot);
        ctx.fillStyle = miniGrad;
        ctx.beginPath(); ctx.roundRect(cx2 + 6, cy2 + 6, LS_CELL - 12, 34, 6); ctx.fill();
        // Custom level star badge
        if (lvl._custom) {
          ctx.save();
          ctx.fillStyle = '#4cc9f0';
          ctx.font = 'bold 9px monospace'; ctx.textAlign = 'right';
          ctx.fillText('★', cx2 + LS_CELL - 7, cy2 + 16);
          ctx.restore();
        }
      }

      // Number & Lock Icon
      ctx.save();
      if (active) { ctx.shadowBlur = 10; ctx.shadowColor = lvl._custom ? '#4cc9f0' : '#ffd60a'; }
      ctx.textAlign = 'center';
      if (locked) {
        ctx.font = 'bold 18px monospace'; ctx.fillStyle = '#333355';
        ctx.fillText(String(idx + 1), cx2 + LS_CELL/2, cy2 + 55);
        ctx.font = '14px monospace'; ctx.fillText('🔒', cx2 + LS_CELL/2, cy2 + 75);
      } else {
        ctx.font = 'bold 22px monospace';
        ctx.fillStyle = active ? (lvl._custom ? '#4cc9f0' : '#ffd60a') : lvl._custom ? '#7adcf0' : '#c0c0e0';
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

  // Custom level legend (bottom-left)
  const customCount = LEVELS.filter(l => l._custom).length;
  if (customCount > 0) {
    ctx.font = '11px monospace'; ctx.textAlign = 'left'; ctx.fillStyle = '#4cc9f0';
    ctx.fillText('★ = custom level (' + customCount + ')', 10, H - 8);
  }
}

// ════════════════════════════════════════════════════════════════
//  WIN SCREEN (redesigned)
// ════════════════════════════════════════════════════════════════
function drawWinScreen() {
  drawBg(levelIndex);
  drawPlatforms(); drawSpikes(); drawCoins(); drawDoor(); drawParticles();

  // Test mode win
  if (edTestLevel) {
    const cw = 420, ch = 260, cx = W/2-cw/2, cy = H/2-ch/2;
    drawCard(cx, cy, cw, ch, 0.88);
    ctx.save(); ctx.shadowBlur=30; ctx.shadowColor='#a78bfa';
    ctx.font='36px serif'; ctx.textAlign='center'; ctx.fillStyle='#a78bfa';
    ctx.fillText('✓', W/2, cy+72); ctx.restore();
    glowText('TEST COMPLETE!', W/2, cy+110, 'bold 30px monospace', '#a78bfa', '#7c3aed');
    ctx.font='14px monospace'; ctx.textAlign='center'; ctx.fillStyle='#ccccee';
    ctx.fillText('Score: ' + score + '   Deaths: ' + deaths, W/2, cy+148);
    const mm=String(Math.floor(gameTime/60)).padStart(2,'0'), ss=String(Math.floor(gameTime%60)).padStart(2,'0');
    ctx.font='13px monospace'; ctx.fillStyle='#888899';
    ctx.fillText('Time: '+mm+':'+ss, W/2, cy+172);
    const btnY=cy+ch-46;
    ctx.fillStyle='rgba(167,139,250,0.15)'; ctx.beginPath(); ctx.roundRect(cx+14,btnY,cw-28,34,8); ctx.fill();
    ctx.strokeStyle='rgba(167,139,250,0.4)'; ctx.lineWidth=1; ctx.stroke();
    ctx.font='bold 13px monospace'; ctx.fillStyle='#ffffff'; ctx.textAlign='center';
    ctx.fillText('SPACE — back to editor   ·   ESC — editor', W/2, btnY+22);
    return;
  }

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
  ctx.fillText((edTestLevel ? '[TEST] ' : 'Level ' + (levelIndex + 1) + '   ') + 'Deaths: ' + deaths, W/2, cy + 146);

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
  ctx.fillText(edTestLevel ? 'R — restart test   ·   ESC — back to editor' : 'R — restart   ·   M / ESC — main menu', W/2, b2y + 16);
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
  if (gameState === STATE.EDITOR)       { drawEditor();      return; }

  // PLAYING
  drawBg(levelIndex);
  drawPlatforms();
  drawSpikes();
  drawCoins();
  drawPowerups();
  drawKey();
  drawDoor();
  drawPlayer();
  drawParticles();
  drawHUD();
  // Test mode banner
  if (edTestLevel) {
    ctx.fillStyle = 'rgba(167,139,250,0.92)';
    ctx.fillRect(0, H - 22, W, 22);
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0d0d1a';
    ctx.fillText('TEST MODE — ESC to return to editor  ·  R to restart test', W/2, H - 7);
  }
}

// ════════════════════════════════════════════════════════════════
//  EDITOR HELPERS
// ════════════════════════════════════════════════════════════════
function edSnap(v) { return edSnapOn ? Math.round(v / edSnapSize) * edSnapSize : Math.round(v); }
function edClampX(v) { return Math.max(0, Math.min(W, v)); }
function edClampY(v) { return Math.max(0, Math.min(H, v)); }
function edCurLvl() { return edLevels[edIdx] || null; }

function edPushHistory() {
  const s = JSON.stringify(edLevels);
  if (edHistory[edHistPos] === s) return;
  edHistory = edHistory.slice(0, edHistPos + 1);
  edHistory.push(s); edHistPos++;
  if (edHistory.length > 60) { edHistory.shift(); edHistPos--; }
  edSaveLocal();
}
function edUndo() { if (edHistPos > 0) { edHistPos--; edLevels = JSON.parse(edHistory[edHistPos]); } }
function edRedo() { if (edHistPos < edHistory.length-1) { edHistPos++; edLevels = JSON.parse(edHistory[edHistPos]); } }
function edSaveLocal() {
  try { localStorage.setItem('cak_editor_levels', JSON.stringify(edLevels)); } catch(e){}
}
function edLoadCustom() {
  try {
    const saved = localStorage.getItem('cak_editor_levels');
    if (saved) {
      const parsed = JSON.parse(saved);
      parsed.forEach(l => { if(!l.powerups) l.powerups=[]; if(!l.name) l.name='Custom Level'; });
      return parsed;
    }
  } catch(e){}
  return [];
}

function edEmptyLevel(name) {
  return {
    name: name || 'Custom Level',
    bgTop: '#0a0a2e', bgBot: '#0d0d1a',
    playerStart: { x: 50, y: 390 },
    door:  { x: 700, y: 360 },
    key:   { x: 380, y: 310 },
    platforms: [{ x: 0, y: 440, w: 800, h: 60 }],
    spikes: [], coins: [], powerups: [],
  };
}

function edHitTest(pos, lvl) {
  const d2 = (a,b) => (a.x-b.x)**2+(a.y-b.y)**2;
  for (const c of lvl.coins)   if (d2(pos,c) < 196)  return { type:'coin',   obj:c };
  for (const p of lvl.powerups||[]) if (d2(pos,p) < 256) return { type:'powerup', obj:p };
  if (d2(pos, lvl.key)         < 400) return { type:'key',    obj:lvl.key };
  if (d2(pos, lvl.playerStart) < 600) return { type:'player', obj:lvl.playerStart };
  if (pos.x>=lvl.door.x && pos.x<=lvl.door.x+40 && pos.y>=lvl.door.y && pos.y<=lvl.door.y+58)
    return { type:'door', obj:lvl.door };
  for (let i=lvl.spikes.length-1;i>=0;i--) {
    const s=lvl.spikes[i];
    if (pos.x>=s.x&&pos.x<=s.x+s.w&&pos.y>=s.y-2&&pos.y<=s.y+s.h+4) return {type:'spike',obj:s};
  }
  for (let i=lvl.platforms.length-1;i>=0;i--) {
    const p=lvl.platforms[i];
    if (pos.x>=p.x&&pos.x<=p.x+p.w&&pos.y>=p.y&&pos.y<=p.y+p.h) return {type:'platform',obj:p};
  }
  return null;
}

function edEraseAt(pos, lvl) {
  const d2=(a,b)=>(a.x-b.x)**2+(a.y-b.y)**2;
  for (let i=lvl.coins.length-1;i>=0;i--)   if (d2(pos,lvl.coins[i])<196) { lvl.coins.splice(i,1); return; }
  for (let i=(lvl.powerups||[]).length-1;i>=0;i--) if (d2(pos,lvl.powerups[i])<256) { lvl.powerups.splice(i,1); return; }
  for (let i=lvl.spikes.length-1;i>=0;i--) {
    const s=lvl.spikes[i];
    if (pos.x>=s.x&&pos.x<=s.x+s.w&&pos.y>=s.y-2&&pos.y<=s.y+s.h+4) { lvl.spikes.splice(i,1); return; }
  }
  for (let i=lvl.platforms.length-1;i>=0;i--) {
    const p=lvl.platforms[i];
    if (pos.x>=p.x&&pos.x<=p.x+p.w&&pos.y>=p.y&&pos.y<=p.y+p.h) { lvl.platforms.splice(i,1); return; }
  }
}

// ════════════════════════════════════════════════════════════════
//  EDITOR CANVAS EVENTS
// ════════════════════════════════════════════════════════════════
const ED_TOOLBAR_W = 180;
const ED_TOPBAR_H  = 36;
const ED_BTMBAR_H  = 28;
const ED_CANVAS_W  = W - ED_TOOLBAR_W;   // 620
const ED_CANVAS_H  = H - ED_TOPBAR_H - ED_BTMBAR_H; // 436
const ED_SCALE_X   = ED_CANVAS_W / 800;  // game coords → canvas pixels
const ED_SCALE_Y   = ED_CANVAS_H / 500;

// Get raw canvas-space coords (0..W, 0..H), accounting for CSS scaling only
function edGetPos(e) {
  const rect = canvas.getBoundingClientRect();
  const cssScaleX = W / rect.width;
  const cssScaleY = H / rect.height;
  return {
    x: (e.clientX - rect.left) * cssScaleX,
    y: (e.clientY - rect.top)  * cssScaleY,
  };
}

// Convert raw canvas pos → game-space coords (0..800, 0..500)
// The game area is drawn translated by (ED_TOOLBAR_W, ED_TOPBAR_H) then scaled by ED_SCALE_X/Y
function edToGame(raw) {
  return {
    x: Math.round((raw.x - ED_TOOLBAR_W) / ED_SCALE_X),
    y: Math.round((raw.y - ED_TOPBAR_H)  / ED_SCALE_Y),
  };
}

function edInGameArea(raw) {
  return raw.x >= ED_TOOLBAR_W && raw.x < W &&
         raw.y >= ED_TOPBAR_H  && raw.y < H - ED_BTMBAR_H;
}

canvas.addEventListener('mousedown', e => {
  if (gameState !== STATE.EDITOR) return;
  e.preventDefault();
  const raw = edGetPos(e);

  if (raw.x < ED_TOOLBAR_W) { edHandleToolbarClick(raw); return; }
  if (raw.y < ED_TOPBAR_H)  { edHandleTopbarClick(raw);  return; }
  if (raw.y > H - ED_BTMBAR_H) return;

  const pos = edToGame(raw); // game-space 0..800, 0..500
  const lvl = edCurLvl(); if (!lvl) return;
  edPushHistory();

  if (e.button === 2) { edEraseAt(pos, lvl); edPushHistory(); return; }

  if (edTool === 'select') {
    edSelItem = edHitTest(pos, lvl);
    if (edSelItem) { edSelOffset = { x: pos.x - edSelItem.obj.x, y: pos.y - edSelItem.obj.y }; }
    edDrag = { start:{...pos}, cur:{...pos} };
    return;
  }
  if (edTool === 'erase') { edEraseAt(pos, lvl); edPushHistory(); return; }
  if (edTool === 'player') { lvl.playerStart = { x:edSnap(pos.x), y:edSnap(pos.y) }; edPushHistory(); return; }
  if (edTool === 'door')   { lvl.door  = { x:edSnap(pos.x), y:edSnap(pos.y) };       edPushHistory(); return; }
  if (edTool === 'key')    { lvl.key   = { x:edSnap(pos.x), y:edSnap(pos.y) };       edPushHistory(); return; }
  if (edTool === 'coin')   { lvl.coins.push({ x:edSnap(pos.x), y:edSnap(pos.y) });   edPushHistory(); return; }
  const puMap = { pu_hj:'HIGH_JUMP', pu_sb:'SPEED_BOOST', pu_inv:'INVINCIBLE' };
  if (puMap[edTool]) { if(!lvl.powerups)lvl.powerups=[]; lvl.powerups.push({x:edSnap(pos.x),y:edSnap(pos.y),type:puMap[edTool]}); edPushHistory(); return; }
  edDrag = { start:{...pos}, cur:{...pos} };
});

canvas.addEventListener('mousemove', e => {
  if (gameState !== STATE.EDITOR) return;
  const raw = edGetPos(e);
  // Store raw offset for crosshair drawing (in canvas-space relative to game area)
  edMouseX = raw.x - ED_TOOLBAR_W;
  edMouseY = raw.y - ED_TOPBAR_H;

  if (!edDrag) return;
  const pos = edToGame(raw);
  edDrag.cur = pos;

  if (edTool === 'select' && edSelItem) {
    edSelItem.obj.x = Math.max(0, edSnap(pos.x - edSelOffset.x));
    edSelItem.obj.y = Math.max(0, edSnap(pos.y - edSelOffset.y));
  }
});

canvas.addEventListener('mouseup', e => {
  if (gameState !== STATE.EDITOR) return;
  if (!edDrag) return;
  const raw = edGetPos(e);
  const pos = edToGame(raw);
  const lvl = edCurLvl();

  if (edTool === 'select') { if (edSelItem) edPushHistory(); edSelItem = null; edDrag = null; return; }

  if (lvl && (edTool === 'platform' || edTool === 'spike')) {
    const x1 = Math.min(edDrag.start.x, pos.x), x2 = Math.max(edDrag.start.x, pos.x);
    const y1 = Math.min(edDrag.start.y, pos.y), y2 = Math.max(edDrag.start.y, pos.y);
    if (edTool === 'platform') {
      const pw = edSnap(Math.max(16, x2-x1)), ph = edSnap(Math.max(8, y2-y1));
      lvl.platforms.push({ x:edSnap(x1), y:edSnap(y1), w:pw, h:ph });
    } else {
      const sw = edSnap(Math.max(14, x2-x1));
      lvl.spikes.push({ x:edSnap(x1), y:edSnap(y1), w:sw, h:17 });
    }
    edPushHistory();
  }
  edDrag = null;
});

canvas.addEventListener('contextmenu', e => {
  if (gameState !== STATE.EDITOR) return;
  e.preventDefault();
  const raw = edGetPos(e);
  if (raw.x < ED_TOOLBAR_W || raw.y < ED_TOPBAR_H) return;
  const pos = edToGame(raw);
  const lvl = edCurLvl(); if (!lvl) return;
  edEraseAt(pos, lvl);
  edPushHistory();
});

// Editor keyboard shortcuts
document.addEventListener('keydown', e => {
  if (gameState !== STATE.EDITOR) return;
  if (e.target.tagName === 'INPUT') return;
  if ((e.ctrlKey||e.metaKey) && e.key==='z') { e.preventDefault(); edUndo(); return; }
  if ((e.ctrlKey||e.metaKey) && (e.key==='y'||(e.shiftKey&&e.key==='z'))) { e.preventDefault(); edRedo(); return; }
  const tk = { p:'platform', s:'spike', c:'coin', k:'key', o:'door', r:'player', v:'select', e:'erase',
               '1':'pu_hj','2':'pu_sb','3':'pu_inv' };
  if (tk[e.key] && !e.ctrlKey && !e.metaKey) edTool = tk[e.key];
  if (e.key==='T'||e.key==='t') edTestCurrent();
  if (e.key==='n'&&!e.ctrlKey) { edLevels.push(edEmptyLevel('Custom '+(edLevels.length+1))); edIdx=edLevels.length-1; edPushHistory(); }
});

function edHandleToolbarClick(raw) {
  // Tool buttons stacked from y=ED_TOPBAR_H+8 in 32px increments, x < ED_TOOLBAR_W
  const tools = ['platform','spike','coin','key','door','player','select','erase','pu_hj','pu_sb','pu_inv'];
  const btnH = 30, startY = ED_TOPBAR_H + 8;
  const ti = Math.floor((raw.y - startY) / (btnH + 2));
  if (ti >= 0 && ti < tools.length) { edTool = tools[ti]; SFX.coin(); return; }
  // Snap toggle at H-88
  if (raw.y >= H - 88 && raw.y < H - 62) { edSnapOn = !edSnapOn; SFX.coin(); return; }
  // Test button at H-58
  if (raw.y >= H - 58 && raw.y < H - 32) { edTestCurrent(); return; }
  // Exit button at H-28
  if (raw.y >= H - 28) { SFX.menuNav(); gameState = STATE.MENU; }
}

function edHandleTopbarClick(raw) {
  // raw.x is full canvas coords (0-800). Topbar buttons start after ED_TOOLBAR_W=180.
  // Button positions as drawn in drawEditor (all offset by ED_TOOLBAR_W):
  // new:    ED_TOOLBAR_W+6  ..  ED_TOOLBAR_W+70   = 186..250
  // undo:   ED_TOOLBAR_W+76 ..  ED_TOOLBAR_W+120  = 256..300
  // redo:   ED_TOOLBAR_W+124 .. ED_TOOLBAR_W+168  = 304..348
  // test:   ED_TOOLBAR_W+172 .. ED_TOOLBAR_W+236  = 352..416
  // export: ED_TOOLBAR_W+240 .. ED_TOOLBAR_W+316  = 420..496
  // < nav:  ED_TOOLBAR_W+326 .. ED_TOOLBAR_W+350  = 506..530
  // > nav:  ED_TOOLBAR_W+354 .. ED_TOOLBAR_W+378  = 534..558
  // snap:   W-180 .. W-66
  // exit:   W-60  .. W
  const x = raw.x;
  if (x >= 186 && x < 250) { edLevels.push(edEmptyLevel('Custom '+(edLevels.length+1))); edIdx=edLevels.length-1; edPushHistory(); SFX.coin(); }
  if (x >= 256 && x < 304) { edUndo(); SFX.menuNav(); }
  if (x >= 308 && x < 352) { edRedo(); SFX.menuNav(); }
  if (x >= 352 && x < 420) { edTestCurrent(); }
  if (x >= 420 && x < 500) { edExport(); }
  if (x >= 506 && x < 532) { if(edIdx>0){edIdx--;SFX.coin();} }
  if (x >= 534 && x < 560) { if(edIdx<edLevels.length-1){edIdx++;SFX.coin();} }
  if (x >= W-180 && x < W-62) { edSnapOn=!edSnapOn; SFX.coin(); }
  if (x >= W-60) { SFX.menuNav(); gameState = STATE.MENU; }
}

function edTestCurrent() {
  const lvl = edCurLvl(); if (!lvl) return;
  edTestLevel = JSON.parse(JSON.stringify(lvl));
  SFX.levelWin();
  score = 0; gameTime = 0; deaths = 0;
  levelIndex = -1; // sentinel: not a real game level
  initLevel(0, edTestLevel);
  gameState = STATE.PLAYING;
}

function edExport() {
  if (!edLevels.length) { alert('No levels to export.'); return; }

  // ── Build JS output (legacy format) ─────────────────────────
  function buildJS() {
    let out = '// Exported custom levels — paste into your LEVELS array\n[\n';
    edLevels.forEach((lvl, i) => {
      out += `  // Level: ${lvl.name||'Custom '+(i+1)}\n  {\n`;
      out += `    bgTop:'${lvl.bgTop}',bgBot:'${lvl.bgBot}',\n`;
      out += `    playerStart:{x:${lvl.playerStart.x},y:${lvl.playerStart.y}},\n`;
      out += `    door:{x:${lvl.door.x},y:${lvl.door.y}},\n`;
      out += `    key:{x:${lvl.key.x},y:${lvl.key.y}},\n`;
      out += `    platforms:[${lvl.platforms.map(p=>`{x:${p.x},y:${p.y},w:${p.w},h:${p.h}}`).join(',')}],\n`;
      out += `    spikes:[${(lvl.spikes||[]).map(s=>`{x:${s.x},y:${s.y},w:${s.w},h:${s.h}}`).join(',')}],\n`;
      out += `    coins:[${(lvl.coins||[]).map(c=>`{x:${c.x},y:${c.y}}`).join(',')}],\n`;
      if ((lvl.powerups||[]).length) out += `    powerups:[${lvl.powerups.map(p=>`{x:${p.x},y:${p.y},type:'${p.type}'}`).join(',')}],\n`;
      out += '  },\n';
    });
    out += ']';
    return out;
  }

  // ── Build JSON output ────────────────────────────────────────
  function buildJSON() {
    return JSON.stringify(edLevels, null, 2);
  }

  // ── "Add to Game": downloads new levels.js AND adds to live session ──
  function addToGame() {
    const key = prompt('Enter dev key to add levels to the game:');
    if (key === null) return;
    if (hashStr(key) !== DEV_KEY_HASH) {
      flashStatus('❌ Wrong dev key — access denied', '#e63946');
      return;
    }
    // 1. Add to live play session immediately
    const existing = loadCustomLevelsForPlay();
    const existingNames = new Set(existing.map(l => l.name));
    const toAdd = edLevels.filter(l => !existingNames.has(l.name)).map(l => ({ ...l, _custom: true }));
    if (toAdd.length) {
      saveCustomLevelsForPlay([...existing, ...toAdd]);
      refreshLevels();
      unlockedUpTo = LEVELS.length - 1;
      saveUnlocked();
    }
    // 2. Download updated levels.js (permanent file replacement)
    const base = (window.GAME_LEVELS || []).map(l => ({ ...l, powerups: l.powerups||[] }));
    const baseNames = new Set(base.map(l => l.name));
    const allNew = edLevels.filter(l => !baseNames.has(l.name));
    const merged = [...base, ...allNew];
    const jsContent = 'window.GAME_LEVELS = ' + JSON.stringify(merged, null, 2) + ';\n';
    downloadFile('levels.js', jsContent, 'text/javascript');
    flashStatus(`✓ Added ${toAdd.length} level(s) to this session + downloaded new levels.js (${merged.length} total). Replace your levels.js to make permanent.`, '#34d399');
  }

  function downloadFile(filename, content, mime) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type: mime }));
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  // ── Build the modal UI ───────────────────────────────────────
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9000;background:rgba(0,0,0,0.82);display:flex;align-items:center;justify-content:center;font-family:monospace;';

  const box = document.createElement('div');
  box.style.cssText = 'background:#0f0f28;border:2px solid #2a2a5a;border-radius:12px;width:720px;max-width:96vw;display:flex;flex-direction:column;overflow:hidden;';

  // Header
  const hdr = document.createElement('div');
  hdr.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:12px 18px;border-bottom:1px solid #2a2a5a;';
  hdr.innerHTML = '<span style="color:#ffd60a;font-weight:bold;font-size:14px">⬇ EXPORT LEVELS</span>';
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕';
  closeBtn.style.cssText = 'background:none;border:none;color:#888;font-size:16px;cursor:pointer;font-family:monospace;';
  closeBtn.onclick = () => document.body.removeChild(overlay);
  hdr.appendChild(closeBtn);
  box.appendChild(hdr);

  // Tabs
  const tabs = document.createElement('div');
  tabs.style.cssText = 'display:flex;border-bottom:1px solid #2a2a5a;';
  ['JS Code', 'JSON'].forEach((label, i) => {
    const tab = document.createElement('button');
    tab.textContent = label;
    tab.style.cssText = `flex:1;padding:8px;background:${i===0?'rgba(255,214,10,0.1)':'none'};border:none;border-bottom:${i===0?'2px solid #ffd60a':'2px solid transparent'};color:${i===0?'#ffd60a':'#888'};cursor:pointer;font-family:monospace;font-size:12px;`;
    tab.onclick = () => {
      ta.value = i === 0 ? buildJS() : buildJSON();
      tabs.querySelectorAll('button').forEach((b,j) => {
        b.style.background = j===i ? 'rgba(255,214,10,0.1)' : 'none';
        b.style.borderBottom = j===i ? '2px solid #ffd60a' : '2px solid transparent';
        b.style.color = j===i ? '#ffd60a' : '#888';
      });
    };
    tabs.appendChild(tab);
  });
  box.appendChild(tabs);

  // Textarea
  const ta = document.createElement('textarea');
  ta.style.cssText = 'height:280px;padding:14px;background:#05050f;color:#a8e6a3;font-family:monospace;font-size:11px;border:none;resize:none;outline:none;';
  ta.value = buildJS();
  ta.readOnly = true;
  box.appendChild(ta);

  // Status bar
  const status = document.createElement('div');
  status.style.cssText = 'padding:6px 18px;font-size:11px;color:#555577;min-height:24px;';
  status.textContent = edLevels.length + ' level(s) ready to export';
  box.appendChild(status);

  function flashStatus(msg, color) {
    status.textContent = msg;
    status.style.color = color;
    setTimeout(() => { status.style.color = '#555577'; }, 6000);
  }

  // Action buttons
  const actions = document.createElement('div');
  actions.style.cssText = 'display:flex;gap:10px;padding:12px 18px;border-top:1px solid #2a2a5a;flex-wrap:wrap;';

  function mkBtn(label, bg, border, color, onclick) {
    const b = document.createElement('button');
    b.textContent = label;
    b.style.cssText = `padding:8px 16px;background:${bg};border:1.5px solid ${border};color:${color};font-family:monospace;font-size:12px;border-radius:6px;cursor:pointer;`;
    b.onmouseenter = () => b.style.opacity = '0.8';
    b.onmouseleave = () => b.style.opacity = '1';
    b.onclick = onclick;
    return b;
  }

  // Copy button
  actions.appendChild(mkBtn('📋 Copy', 'rgba(255,255,255,0.06)', '#4a4a8a', '#c8c8e8', () => {
    ta.select(); document.execCommand('copy');
    flashStatus('✓ Copied to clipboard!', '#ffd60a');
  }));

  // Download JSON
  actions.appendChild(mkBtn('⬇ Download JSON', 'rgba(76,201,240,0.1)', '#4cc9f0', '#4cc9f0', () => {
    downloadFile('custom_levels.json', buildJSON(), 'application/json');
    flashStatus('✓ Downloaded custom_levels.json', '#4cc9f0');
  }));

  // Add to Game — dev key gated
  const addBtn = mkBtn('🎮 Add to Game', 'rgba(255,214,10,0.15)', '#ffd60a', '#ffd60a', addToGame);
  addBtn.title = 'Requires dev key — merges your levels into levels.js';
  actions.appendChild(addBtn);

  // Close
  actions.appendChild(mkBtn('Close', 'none', '#333355', '#666688', () => document.body.removeChild(overlay)));

  box.appendChild(actions);
  overlay.appendChild(box);

  // Close on backdrop click
  overlay.addEventListener('click', e => { if (e.target === overlay) document.body.removeChild(overlay); });

  document.body.appendChild(overlay);
  ta.select();
}

// ════════════════════════════════════════════════════════════════
//  EDITOR DRAW — MAIN EDITOR
// ════════════════════════════════════════════════════════════════
const ED_TOOLS = [
  { id:'platform', label:'Platform',    color:'#3a4a6a', dot:'#5a6a9a' },
  { id:'spike',    label:'Spike',       color:'#e63946', dot:'#e63946' },
  { id:'coin',     label:'Coin',        color:'#ffd60a', dot:'#ffd60a' },
  { id:'key',      label:'Key',         color:'#ffd60a', dot:'#ffa500' },
  { id:'door',     label:'Door',        color:'#4a4a8a', dot:'#6a6aaa' },
  { id:'player',   label:'Player Start',color:'#4cc9f0', dot:'#4cc9f0' },
  { id:'select',   label:'Select/Move', color:'#aaaacc', dot:'#aaaacc' },
  { id:'erase',    label:'Eraser',      color:'#666',    dot:'#444'    },
  { id:'pu_hj',    label:'↑↑ High Jump',color:'#a78bfa', dot:'#a78bfa' },
  { id:'pu_sb',    label:'⚡ Speed',     color:'#34d399', dot:'#34d399' },
  { id:'pu_inv',   label:'★ Invincible',color:'#f59e0b', dot:'#f59e0b' },
];

function drawEditor() {
  const lvl = edCurLvl();

  // ── Toolbar (left panel) ─────────────────────────────────────
  ctx.fillStyle='#0c0c22'; ctx.fillRect(0,0,ED_TOOLBAR_W,H);
  ctx.fillStyle='#1a1a3a'; ctx.fillRect(ED_TOOLBAR_W-1,0,1,H);

  // Title
  ctx.font='bold 11px monospace'; ctx.textAlign='center'; ctx.fillStyle='#ffd60a';
  ctx.fillText('🔑 EDITOR', ED_TOOLBAR_W/2, 22);

  // Tool buttons
  const btnH=30, startY=ED_TOPBAR_H+8;
  ED_TOOLS.forEach((t,i) => {
    const by = startY + i*(btnH+2);
    const active = edTool === t.id;
    ctx.fillStyle = active ? 'rgba(255,214,10,0.15)' : 'rgba(255,255,255,0.03)';
    ctx.beginPath(); ctx.roundRect(6, by, ED_TOOLBAR_W-12, btnH, 5); ctx.fill();
    if (active) { ctx.strokeStyle='#ffd60a'; ctx.lineWidth=1.5; ctx.stroke(); }
    // Dot
    ctx.fillStyle = t.dot;
    ctx.beginPath(); ctx.arc(20, by+btnH/2, 5, 0, Math.PI*2); ctx.fill();
    // Label
    ctx.font='11px monospace'; ctx.textAlign='left';
    ctx.fillStyle = active ? '#ffd60a' : '#9999bb';
    ctx.fillText(t.label, 31, by+btnH/2+4);
  });

  // Snap toggle
  const snapY = H - 88;
  ctx.fillStyle = edSnapOn ? 'rgba(76,201,240,0.15)':'rgba(255,255,255,0.04)';
  ctx.beginPath(); ctx.roundRect(6,snapY,ED_TOOLBAR_W-12,26,5); ctx.fill();
  ctx.strokeStyle = edSnapOn ? '#4cc9f0':'#333355'; ctx.lineWidth=1; ctx.stroke();
  ctx.font='11px monospace'; ctx.textAlign='center';
  ctx.fillStyle = edSnapOn ? '#4cc9f0':'#555577';
  ctx.fillText((edSnapOn?'✓ ':'') + 'SNAP '+edSnapSize+'px', ED_TOOLBAR_W/2, snapY+17);

  // Test button
  const testY = H - 58;
  ctx.fillStyle='rgba(167,139,250,0.2)';
  ctx.beginPath(); ctx.roundRect(6,testY,ED_TOOLBAR_W-12,26,5); ctx.fill();
  ctx.strokeStyle='#a78bfa'; ctx.lineWidth=1.5; ctx.stroke();
  ctx.font='bold 11px monospace'; ctx.textAlign='center'; ctx.fillStyle='#a78bfa';
  ctx.fillText('▶ TEST (T)', ED_TOOLBAR_W/2, testY+17);

  // Exit button
  const exitY = H - 28;
  ctx.fillStyle='rgba(230,57,70,0.12)';
  ctx.beginPath(); ctx.roundRect(6,exitY,ED_TOOLBAR_W-12,22,5); ctx.fill();
  ctx.strokeStyle='#e63946'; ctx.lineWidth=1; ctx.stroke();
  ctx.font='11px monospace'; ctx.textAlign='center'; ctx.fillStyle='#e63946';
  ctx.fillText('✕ EXIT (ESC)', ED_TOOLBAR_W/2, exitY+15);

  // ── Top bar ──────────────────────────────────────────────────
  ctx.fillStyle='#0f0f28'; ctx.fillRect(ED_TOOLBAR_W,0,W-ED_TOOLBAR_W,ED_TOPBAR_H);
  ctx.fillStyle='#1a1a3a'; ctx.fillRect(ED_TOOLBAR_W,ED_TOPBAR_H-1,W-ED_TOOLBAR_W,1);

  const tbBtns = [
    {x:182, label:'▶ TEST', col:'#a78bfa'},
    {x:254, label:'⬇ EXPORT', col:'#ffd60a'},
  ];
  // Level nav
  ctx.font='bold 12px monospace'; ctx.textAlign='center';
  // New button
  ctx.fillStyle='rgba(255,214,10,0.1)'; ctx.beginPath(); ctx.roundRect(ED_TOOLBAR_W+6,6,64,24,4); ctx.fill();
  ctx.strokeStyle='#ffd60a'; ctx.lineWidth=1; ctx.stroke();
  ctx.fillStyle='#ffd60a'; ctx.fillText('+ NEW', ED_TOOLBAR_W+38, 22);
  // Undo/Redo
  ctx.fillStyle='rgba(255,255,255,0.06)'; ctx.beginPath(); ctx.roundRect(ED_TOOLBAR_W+76,6,44,24,4); ctx.fill();
  ctx.strokeStyle='#333355'; ctx.lineWidth=1; ctx.stroke();
  ctx.fillStyle='#aaaacc'; ctx.fillText('↩ UN', ED_TOOLBAR_W+98, 22);
  ctx.fillStyle='rgba(255,255,255,0.06)'; ctx.beginPath(); ctx.roundRect(ED_TOOLBAR_W+124,6,44,24,4); ctx.fill();
  ctx.strokeStyle='#333355'; ctx.stroke();
  ctx.fillStyle='#aaaacc'; ctx.fillText('RE ↪', ED_TOOLBAR_W+146, 22);
  // Test
  ctx.fillStyle='rgba(167,139,250,0.18)'; ctx.beginPath(); ctx.roundRect(ED_TOOLBAR_W+172,6,64,24,4); ctx.fill();
  ctx.strokeStyle='#a78bfa'; ctx.stroke();
  ctx.fillStyle='#a78bfa'; ctx.fillText('▶ TEST', ED_TOOLBAR_W+204, 22);
  // Export
  ctx.fillStyle='rgba(255,214,10,0.1)'; ctx.beginPath(); ctx.roundRect(ED_TOOLBAR_W+240,6,76,24,4); ctx.fill();
  ctx.strokeStyle='#ffd60a'; ctx.stroke();
  ctx.fillStyle='#ffd60a'; ctx.fillText('⬇ EXPORT', ED_TOOLBAR_W+278, 22);

  // Level name + navigation
  const lvlLabel = lvl ? `Level ${edIdx+1}/${edLevels.length}: ${lvl.name||''}` : 'No levels';
  ctx.fillStyle='#aaaacc'; ctx.font='12px monospace'; ctx.textAlign='left';
  ctx.fillText(lvlLabel, ED_TOOLBAR_W+330, 20);
  // < >
  ctx.fillStyle='rgba(255,255,255,0.08)'; ctx.beginPath(); ctx.roundRect(ED_TOOLBAR_W+326,6,24,24,4); ctx.fill();
  ctx.fillStyle='#aaaacc'; ctx.textAlign='center'; ctx.fillText('‹', ED_TOOLBAR_W+338, 22);
  ctx.fillStyle='rgba(255,255,255,0.08)'; ctx.beginPath(); ctx.roundRect(ED_TOOLBAR_W+354,6,24,24,4); ctx.fill();
  ctx.fillStyle='#aaaacc'; ctx.fillText('›', ED_TOOLBAR_W+366, 22);

  // Snap grid controls (right side)
  ctx.fillStyle='rgba(76,201,240,0.1)'; ctx.beginPath(); ctx.roundRect(W-180,6,114,24,4); ctx.fill();
  ctx.strokeStyle= edSnapOn?'#4cc9f0':'#333355'; ctx.lineWidth=1; ctx.stroke();
  ctx.fillStyle= edSnapOn?'#4cc9f0':'#666688'; ctx.font='11px monospace'; ctx.textAlign='center';
  ctx.fillText((edSnapOn?'✓':'○')+' SNAP '+edSnapSize+'px', W-123, 22);

  // ── Canvas area ───────────────────────────────────────────────
  if (!lvl) {
    ctx.fillStyle='#080818'; ctx.fillRect(ED_TOOLBAR_W,ED_TOPBAR_H,ED_CANVAS_W,ED_CANVAS_H);
    ctx.fillStyle='#333355'; ctx.font='14px monospace'; ctx.textAlign='center';
    ctx.fillText('Click + NEW to create a level', W/2+ED_TOOLBAR_W/2, H/2);
  } else {
    ctx.save();
    ctx.beginPath(); ctx.rect(ED_TOOLBAR_W, ED_TOPBAR_H, ED_CANVAS_W, ED_CANVAS_H);
    ctx.clip();
    ctx.translate(ED_TOOLBAR_W, ED_TOPBAR_H);
    ctx.scale(ED_SCALE_X, ED_SCALE_Y);

    // BG
    const grad2 = ctx.createLinearGradient(0,0,0,500);
    grad2.addColorStop(0, lvl.bgTop); grad2.addColorStop(1, lvl.bgBot);
    ctx.fillStyle=grad2; ctx.fillRect(0,0,800,500);

    // Grid
    ctx.strokeStyle='rgba(255,255,255,0.04)'; ctx.lineWidth=1/ED_SCALE_X;
    for(let x=0;x<800;x+=edSnapSize){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,500);ctx.stroke();}
    for(let y=0;y<500;y+=edSnapSize){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(800,y);ctx.stroke();}

    // Platforms
    for (const p of lvl.platforms) {
      const pg=ctx.createLinearGradient(p.x,p.y,p.x,p.y+p.h);
      pg.addColorStop(0,'#3a4a6a'); pg.addColorStop(1,'#1a2040');
      ctx.fillStyle=pg; ctx.fillRect(p.x,p.y,p.w,p.h);
      ctx.fillStyle='#5a6a9a'; ctx.fillRect(p.x,p.y,p.w,3);
    }
    // Spikes
    ctx.fillStyle='#e63946';
    for (const s of lvl.spikes) {
      const cnt=Math.max(1,Math.floor(s.w/14)), sw=s.w/cnt;
      for(let i=0;i<cnt;i++){ctx.beginPath();ctx.moveTo(s.x+i*sw,s.y+s.h);ctx.lineTo(s.x+i*sw+sw/2,s.y);ctx.lineTo(s.x+(i+1)*sw,s.y+s.h);ctx.fill();}
    }
    // Coins
    for (const c of lvl.coins) {
      ctx.fillStyle='#ffd60a'; ctx.beginPath(); ctx.arc(c.x,c.y,8,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#ffaa00'; ctx.beginPath(); ctx.arc(c.x-1.5,c.y-1.5,3.5,0,Math.PI*2); ctx.fill();
    }
    // Power-ups
    const puC={'HIGH_JUMP':'#a78bfa','SPEED_BOOST':'#34d399','INVINCIBLE':'#f59e0b'};
    const puI={'HIGH_JUMP':'↑↑','SPEED_BOOST':'⚡','INVINCIBLE':'★'};
    for (const pu of (lvl.powerups||[])) {
      const c=puC[pu.type]||'#fff';
      ctx.save(); ctx.shadowBlur=12; ctx.shadowColor=c;
      ctx.strokeStyle=c; ctx.lineWidth=3;
      ctx.beginPath(); ctx.arc(pu.x,pu.y,14,0,Math.PI*2); ctx.stroke();
      ctx.fillStyle=c+'33'; ctx.beginPath(); ctx.arc(pu.x,pu.y,12,0,Math.PI*2); ctx.fill();
      ctx.font='bold 11px monospace'; ctx.textAlign='center'; ctx.fillStyle=c;
      ctx.fillText(puI[pu.type]||'?', pu.x, pu.y+4);
      ctx.restore();
    }
    // Key
    {const kx=lvl.key.x,ky=lvl.key.y;
     ctx.save(); ctx.shadowBlur=14; ctx.shadowColor='#ffd60a';
     ctx.strokeStyle='#ffd60a'; ctx.lineWidth=3;
     ctx.beginPath(); ctx.arc(kx,ky,10,0,Math.PI*2); ctx.stroke();
     ctx.fillStyle='#ffd60a'; ctx.fillRect(kx+7,ky-2,16,4); ctx.fillRect(kx+17,ky+2,3,5); ctx.fillRect(kx+22,ky+2,3,7);
     ctx.restore();}
    // Door
    {const d=lvl.door;
     ctx.fillStyle='#2a2a4a'; ctx.fillRect(d.x,d.y,40,58);
     ctx.strokeStyle='#4a4a8a'; ctx.lineWidth=2; ctx.strokeRect(d.x+2,d.y+2,36,54);
     ctx.fillStyle='#ffd60a'; ctx.beginPath(); ctx.arc(d.x+20,d.y+37,8,0,Math.PI*2); ctx.fill();
     ctx.font='bold 9px monospace'; ctx.textAlign='center'; ctx.fillStyle='rgba(255,255,255,.7)';
     ctx.fillText('EXIT',d.x+20,d.y-5);}
    // Player start
    {const ps=lvl.playerStart;
     ctx.fillStyle='#4cc9f0'; ctx.fillRect(ps.x,ps.y,26,26);
     ctx.strokeStyle='rgba(76,201,240,0.5)'; ctx.lineWidth=1; ctx.setLineDash([4,3]);
     ctx.strokeRect(ps.x-2,ps.y-2,30,30); ctx.setLineDash([]);
     ctx.font='bold 9px monospace'; ctx.textAlign='center'; ctx.fillStyle='#0d0d1a';
     ctx.fillText('P',ps.x+13,ps.y+17);}

    // Drag preview (edDrag coords are game-space 0..800/500)
    if (edDrag && (edTool==='platform'||edTool==='spike')) {
      const x1=Math.min(edDrag.start.x,edDrag.cur.x), y1=Math.min(edDrag.start.y,edDrag.cur.y);
      const x2=Math.max(edDrag.start.x,edDrag.cur.x), y2=Math.max(edDrag.start.y,edDrag.cur.y);
      ctx.globalAlpha=0.5;
      if(edTool==='platform'){
        ctx.fillStyle='#3a4a6a';
        ctx.fillRect(edSnap(x1),edSnap(y1),edSnap(Math.max(16,x2-x1)),edSnap(Math.max(8,y2-y1)));
      } else {
        const sw=edSnap(Math.max(14,x2-x1));
        ctx.fillStyle='#e63946';
        const cnt=Math.max(1,Math.floor(sw/14)),ssw=sw/cnt;
        for(let i=0;i<cnt;i++){
          ctx.beginPath();
          ctx.moveTo(edSnap(x1)+i*ssw, edSnap(y1)+17);
          ctx.lineTo(edSnap(x1)+i*ssw+ssw/2, edSnap(y1));
          ctx.lineTo(edSnap(x1)+(i+1)*ssw, edSnap(y1)+17);
          ctx.fill();
        }
      }
      ctx.globalAlpha=1;
    }
    // Cursor crosshair (edMouseX/Y are canvas-px relative to game area; divide by scale for game-space)
    const ghx = edMouseX / ED_SCALE_X;
    const ghy = edMouseY / ED_SCALE_Y;
    ctx.strokeStyle='rgba(255,255,255,0.14)'; ctx.lineWidth=1/ED_SCALE_X; ctx.setLineDash([4/ED_SCALE_X,4/ED_SCALE_X]);
    ctx.beginPath(); ctx.moveTo(0,ghy); ctx.lineTo(800,ghy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ghx,0); ctx.lineTo(ghx,500); ctx.stroke();
    ctx.setLineDash([]);

    ctx.restore();
  }

  // ── Bottom bar ───────────────────────────────────────────────
  ctx.fillStyle='#0c0c22'; ctx.fillRect(ED_TOOLBAR_W,H-ED_BTMBAR_H,W-ED_TOOLBAR_W,ED_BTMBAR_H);
  ctx.fillStyle='#1a1a3a'; ctx.fillRect(ED_TOOLBAR_W,H-ED_BTMBAR_H,W-ED_TOOLBAR_W,1);
  ctx.font='11px monospace'; ctx.textAlign='left'; ctx.fillStyle='#555577';
  const gx = Math.max(0, Math.min(800, Math.round(edMouseX / ED_SCALE_X)));
  const gy = Math.max(0, Math.min(500, Math.round(edMouseY / ED_SCALE_Y)));
  ctx.fillText(
    `x:${gx} y:${gy}  |  P=platform S=spike C=coin K=key O=door R=player V=select E=erase 1-3=powerup T=test Ctrl+Z/Y=undo/redo`,
    ED_TOOLBAR_W+8, H-8
  );
  if (lvl) {
    ctx.textAlign='right'; ctx.fillStyle='#555577';
    ctx.fillText(`plat:${lvl.platforms.length} spike:${(lvl.spikes||[]).length} coin:${(lvl.coins||[]).length} pu:${(lvl.powerups||[]).length}`, W-8, H-8);
  }
}

// ════════════════════════════════════════════════════════════════
//  CANVAS CLICK — menu button hit detection
// ════════════════════════════════════════════════════════════════
canvas.addEventListener('click', e => {
  if (gameState !== STATE.MENU) return;
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (W / rect.width);
  const my = (e.clientY - rect.top)  * (H / rect.height);

  function hit(btn) {
    return btn && mx >= btn.x && mx <= btn.x+btn.w && my >= btn.y && my <= btn.y+btn.h;
  }

  if (hit(MENU_BTNS.play)) {
    SFX.menuClick(); gameState = STATE.LEVEL_SELECT; lsCursor=0; lsScroll=0;
    return;
  }
  if (hit(MENU_BTNS.editor)) {
    SFX.menuNav();
    edLevels = edLoadCustom();
    edIdx = Math.max(0, edLevels.length - 1);
    edHistPos = -1; edHistory = []; edPushHistory();
    gameState = STATE.EDITOR;
    return;
  }
  if (hit(MENU_BTNS.addLevel)) {
    SFX.menuNav();
    showAddLevelDialog();
    return;
  }
  if (hit(MENU_BTNS.download)) {
    SFX.menuNav();
    showDownloadLevelDialog();
    return;
  }
});

// ── Add Custom Level ────────────────────────────────────────────
function showAddLevelDialog() {
  const overlay = mkOverlay();
  const box = mkBox(overlay, '⬆ ADD CUSTOM LEVEL', 640);

  const info = document.createElement('div');
  info.style.cssText = 'padding:10px 18px;font-size:12px;color:#888899;';
  info.textContent = 'Paste a level JSON (exported from the level editor or shared by a friend), then click Add.';
  box.appendChild(info);

  const ta = document.createElement('textarea');
  ta.placeholder = 'Paste level JSON here...';
  ta.style.cssText = 'height:200px;padding:12px;background:#05050f;color:#a8e6a3;font-family:monospace;font-size:11px;border:none;border-top:1px solid #2a2a5a;border-bottom:1px solid #2a2a5a;resize:none;outline:none;width:100%;';
  box.appendChild(ta);

  const status = mkStatus(box);

  const actions = mkActions(box);
  mkBtn2(actions, '⬆ Add Level', 'rgba(76,201,240,0.15)', '#4cc9f0', '#4cc9f0', () => {
    try {
      let raw = ta.value.trim();
      // Accept single object or array
      if (raw.startsWith('{')) raw = '[' + raw + ']';
      const parsed = JSON.parse(raw);
      const toLevels = Array.isArray(parsed) ? parsed : [parsed];
      if (!toLevels.length) throw new Error('No levels found');
      toLevels.forEach(l => {
        if (!l.platforms || !l.playerStart || !l.door || !l.key) throw new Error('Missing required level fields');
        if (!l.powerups) l.powerups = [];
        if (!l.name) l.name = 'Custom Level';
        l._custom = true;
      });
      // Save
      const existing = loadCustomLevelsForPlay();
      const all = [...existing, ...toLevels];
      saveCustomLevelsForPlay(all);
      refreshLevels();
      // Unlock the newly added levels so they're playable immediately
      unlockedUpTo = LEVELS.length - 1;
      saveUnlocked();
      status.textContent = '✓ Added ' + toLevels.length + ' level(s)! They appear at the end of the level list.';
      status.style.color = '#34d399';
      ta.value = '';
    } catch(err) {
      status.textContent = '❌ ' + err.message;
      status.style.color = '#e63946';
    }
  });
  mkBtn2(actions, 'Also open file…', 'rgba(255,255,255,0.05)', '#333355', '#888899', () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = async () => {
      const text = await input.files[0].text();
      ta.value = text;
    };
    input.click();
  });
  mkBtn2(actions, 'Close', 'none', '#333355', '#666688', () => document.body.removeChild(overlay));
}

// ── Download a Level ────────────────────────────────────────────
function showDownloadLevelDialog() {
  const overlay = mkOverlay();
  const box = mkBox(overlay, '⬇ DOWNLOAD / SHARE LEVEL', 600);

  const info = document.createElement('div');
  info.style.cssText = 'padding:10px 18px;font-size:12px;color:#888899;';
  info.textContent = 'Choose a level to download as a JSON file you can share with friends.';
  box.appendChild(info);

  // Level picker
  const sel = document.createElement('select');
  sel.style.cssText = 'width:calc(100% - 36px);margin:0 18px 10px;padding:8px;background:#05050f;color:#c8c8e8;font-family:monospace;font-size:12px;border:1px solid #2a2a5a;border-radius:4px;';
  LEVELS.forEach((lvl, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = (i+1) + '. ' + (lvl.name || 'Level '+(i+1)) + (lvl._custom ? ' ★' : '');
    sel.appendChild(opt);
  });
  box.appendChild(sel);

  // Preview textarea
  const ta = document.createElement('textarea');
  ta.readOnly = true;
  ta.style.cssText = 'height:160px;padding:12px;background:#05050f;color:#a8e6a3;font-family:monospace;font-size:11px;border:none;border-top:1px solid #2a2a5a;border-bottom:1px solid #2a2a5a;resize:none;outline:none;width:100%;';
  box.appendChild(ta);

  function updatePreview() {
    const lvl = LEVELS[parseInt(sel.value)];
    if (lvl) ta.value = JSON.stringify(lvl, null, 2);
  }
  sel.onchange = updatePreview;
  updatePreview();

  const status = mkStatus(box);

  const actions = mkActions(box);
  mkBtn2(actions, '⬇ Download JSON', 'rgba(52,211,153,0.15)', '#34d399', '#34d399', () => {
    const lvl = LEVELS[parseInt(sel.value)];
    if (!lvl) return;
    const name = (lvl.name || 'level').replace(/[^a-z0-9]/gi,'_').toLowerCase();
    const blob = new Blob([JSON.stringify(lvl, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name + '.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    status.textContent = '✓ Downloaded ' + name + '.json';
    status.style.color = '#34d399';
  });
  mkBtn2(actions, '📋 Copy JSON', 'rgba(255,255,255,0.05)', '#4a4a8a', '#c8c8e8', () => {
    ta.select(); document.execCommand('copy');
    status.textContent = '✓ Copied to clipboard!'; status.style.color = '#ffd60a';
  });
  mkBtn2(actions, 'Close', 'none', '#333355', '#666688', () => document.body.removeChild(overlay));
}

// ── Shared modal helpers ─────────────────────────────────────────
function mkOverlay() {
  const o = document.createElement('div');
  o.style.cssText = 'position:fixed;inset:0;z-index:9000;background:rgba(0,0,0,0.82);display:flex;align-items:center;justify-content:center;font-family:monospace;';
  o.addEventListener('click', e => { if (e.target===o) document.body.removeChild(o); });
  document.body.appendChild(o);
  return o;
}
function mkBox(overlay, title, width) {
  const box = document.createElement('div');
  box.style.cssText = `background:#0f0f28;border:2px solid #2a2a5a;border-radius:12px;width:${width}px;max-width:96vw;display:flex;flex-direction:column;overflow:hidden;`;
  const hdr = document.createElement('div');
  hdr.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:12px 18px;border-bottom:1px solid #2a2a5a;';
  hdr.innerHTML = `<span style="color:#ffd60a;font-weight:bold;font-size:14px">${title}</span>`;
  const closeBtn = document.createElement('button');
  closeBtn.textContent='✕'; closeBtn.style.cssText='background:none;border:none;color:#888;font-size:16px;cursor:pointer;font-family:monospace;';
  closeBtn.onclick=()=>document.body.removeChild(overlay);
  hdr.appendChild(closeBtn); box.appendChild(hdr); overlay.appendChild(box);
  return box;
}
function mkStatus(box) {
  const s = document.createElement('div');
  s.style.cssText = 'padding:6px 18px;font-size:11px;color:#555577;min-height:22px;';
  box.appendChild(s); return s;
}
function mkActions(box) {
  const a = document.createElement('div');
  a.style.cssText = 'display:flex;gap:8px;padding:12px 18px;border-top:1px solid #2a2a5a;flex-wrap:wrap;';
  box.appendChild(a); return a;
}
function mkBtn2(parent, label, bg, border, color, onclick) {
  const b = document.createElement('button');
  b.textContent = label;
  b.style.cssText = `padding:8px 14px;background:${bg};border:1.5px solid ${border};color:${color};font-family:monospace;font-size:12px;border-radius:6px;cursor:pointer;`;
  b.onmouseenter=()=>b.style.opacity='0.8'; b.onmouseleave=()=>b.style.opacity='1';
  b.onclick=onclick; parent.appendChild(b); return b;
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
//  STARTUP — read levels from levels.js (loaded as <script> tag)
// ════════════════════════════════════════════════════════════════
let lastTime = 0;
function loop(ts) {
  const dt = Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

function loadLevels() {
  // Base levels from levels.js
  const base = (window.GAME_LEVELS || []).map(l => ({ ...l, powerups: l.powerups||[], _custom: false }));
  // Custom levels added by player (stored in localStorage)
  const custom = loadCustomLevelsForPlay();
  LEVELS = [...base, ...custom];
  try { unlockedUpTo = Math.min(parseInt(localStorage.getItem('cak_unlocked') || '0'), Math.max(0, LEVELS.length - 1)); } catch(e){}
  requestAnimationFrame(loop);
}

function loadCustomLevelsForPlay() {
  try {
    const saved = localStorage.getItem('cak_added_levels');
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return parsed.map(l => ({ ...l, powerups: l.powerups||[], _custom: true }));
  } catch(e) { return []; }
}

function saveCustomLevelsForPlay(levels) {
  try { localStorage.setItem('cak_added_levels', JSON.stringify(levels)); } catch(e){}
}

function refreshLevels() {
  // Called after adding/removing custom levels — rebuilds LEVELS and clamps progress
  const base = (window.GAME_LEVELS || []).map(l => ({ ...l, powerups: l.powerups||[], _custom: false }));
  const custom = loadCustomLevelsForPlay();
  LEVELS = [...base, ...custom];
  unlockedUpTo = Math.min(unlockedUpTo, Math.max(0, LEVELS.length - 1));
  lsScroll = Math.max(0, lsMaxScroll());
}

loadLevels();
