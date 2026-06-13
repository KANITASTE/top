// ============================================
// games/breakout/game.js - Retro Breakout
// Level 1-5 + Fireworks Ending
// ============================================

const Breakout = (() => {
  let canvas, ctx;
  let animFrame;
  let gameState = 'title'; // title, playing, gameover, levelclear, fireworks

  // レベル設定: rows, cols, ballSpeed, paddleWidth
  const LEVEL_CONFIG = [
    null, // index 0 unused
    { rows: 3, cols: 7, spd: 1.0,  pw: 70,  label: 'LEVEL 1' },
    { rows: 4, cols: 8, spd: 1.15, pw: 62,  label: 'LEVEL 2' },
    { rows: 5, cols: 8, spd: 1.30, pw: 55,  label: 'LEVEL 3' },
    { rows: 5, cols: 9, spd: 1.45, pw: 48,  label: 'LEVEL 4' },
    { rows: 6, cols: 9, spd: 1.60, pw: 40,  label: 'LEVEL 5 ★' },
  ];

  const state = {
    ball: { x: 0, y: 0, vx: 3, vy: -4, r: 6 },
    paddle: { x: 0, y: 0, w: 70, h: 10, speed: 6 },
    bricks: [],
    score: 0,
    lives: 3,
    hiScore: 0,
    keys: {},
    level: 1,
  };

  // 花火パーティクル
  let particles = [];

  // ============================================
  // INIT
  // ============================================
  function initGame(keepProgress) {
    const W = canvas.width, H = canvas.height;
    const lv = LEVEL_CONFIG[state.level];

    // ブリック配置（レベルに応じた行列数）
    const BRICK_GAP = 2;
    const bw = Math.floor((W - 10 - BRICK_GAP * (lv.cols + 1)) / lv.cols);
    const bh = 13;
    const offsetX = Math.floor((W - (bw + BRICK_GAP) * lv.cols) / 2);
    const offsetY = 30;

    // カラーパレット（モノクロ）
    const rowColors = ['#fff','#ddd','#bbb','#999','#777','#555'];

    state.bricks = [];
    for (let r = 0; r < lv.rows; r++) {
      for (let c = 0; c < lv.cols; c++) {
        state.bricks.push({
          x: offsetX + c * (bw + BRICK_GAP),
          y: offsetY + r * (bh + BRICK_GAP),
          w: bw, h: bh,
          alive: true,
          color: rowColors[r % rowColors.length],
        });
      }
    }

    state.ball.x = W / 2;
    state.ball.y = H - 60;
    const baseSpd = 3 + Math.random() * 0.5;
    const spd = baseSpd * lv.spd;
    state.ball.vx = (Math.random() > 0.5 ? 1 : -1) * spd;
    state.ball.vy = -spd * 1.1;

    state.paddle.w = lv.pw;
    state.paddle.x = W / 2 - state.paddle.w / 2;
    state.paddle.y = H - 22;

    if (!keepProgress) {
      state.score = 0;
      state.lives = 3;
    }

    state.hiScore = safeGetHi();
  }

  function safeGetHi() {
    try { return parseInt(localStorage.getItem('breakout_hi') || '0'); } catch(e) { return 0; }
  }
  function safeSetHi(v) {
    try { localStorage.setItem('breakout_hi', String(v)); } catch(e) {}
  }

  // ============================================
  // AUDIO
  // ============================================
  let _ac = null;
  function getAC() {
    if (!_ac) try { _ac = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
    return _ac;
  }
  function playBeep(freq, type, dur, vol) {
    const ac = getAC(); if (!ac) return;
    try {
      const osc = ac.createOscillator(), gain = ac.createGain();
      osc.connect(gain); gain.connect(ac.destination);
      osc.type = type || 'square';
      osc.frequency.value = freq;
      gain.gain.value = vol || 0.05;
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + (dur || 0.08));
      osc.start(); osc.stop(ac.currentTime + (dur || 0.08));
    } catch(e) {}
  }
  function playFireworkSound() {
    [0, 300, 700, 1200, 1800].forEach(t => {
      setTimeout(() => {
        playBeep(880 + Math.random()*200, 'sine', 0.25, 0.12);
        setTimeout(() => playBeep(1100 + Math.random()*300, 'sine', 0.2, 0.08), 80);
      }, t);
    });
  }

  // ============================================
  // FIREWORKS
  // ============================================
  function launchFirework() {
    const W = canvas.width, H = canvas.height;
    const x = W * 0.1 + Math.random() * W * 0.8;
    const y = H * 0.08 + Math.random() * H * 0.45;
    const hue = Math.floor(Math.random() * 360);
    const count = 55 + Math.floor(Math.random() * 35);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 5;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        decay: 0.011 + Math.random() * 0.011,
        hue: hue + Math.random() * 50 - 25,
        size: 1.5 + Math.random() * 2,
      });
    }
  }

  let fwTimer = null, fwCount = 0;
  function startFireworks() {
    fwCount = 0; particles = [];
    playFireworkSound();
    function shoot() {
      launchFirework();
      if (Math.random() > 0.4) launchFirework(); // たまに2発同時
      fwCount++;
      if (fwCount < 14) fwTimer = setTimeout(shoot, 350 + Math.random() * 350);
    }
    shoot();
  }

  function updateParticles() {
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      p.vy += 0.07; p.vx *= 0.98;
      p.life -= p.decay;
    });
  }
  function drawParticles() {
    particles.forEach(p => {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = `hsl(${p.hue},100%,62%)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  // ============================================
  // UPDATE
  // ============================================
  function update() {
    if (gameState !== 'playing') return;
    const W = canvas.width, H = canvas.height;
    const b = state.ball, p = state.paddle;

    if (state.keys['ArrowLeft'] || state.keys['a']) p.x = Math.max(0, p.x - p.speed);
    if (state.keys['ArrowRight'] || state.keys['d']) p.x = Math.min(W - p.w, p.x + p.speed);

    b.x += b.vx; b.y += b.vy;

    if (b.x - b.r < 0) { b.x = b.r; b.vx = Math.abs(b.vx); }
    if (b.x + b.r > W) { b.x = W - b.r; b.vx = -Math.abs(b.vx); }
    if (b.y - b.r < 0) { b.y = b.r; b.vy = Math.abs(b.vy); playBeep(660, 'square', 0.05, 0.04); }

    if (b.y > H + 20) {
      state.lives--;
      playBeep(150, 'sawtooth', 0.3, 0.08);
      if (state.lives <= 0) {
        gameState = 'gameover';
        if (state.score > state.hiScore) { state.hiScore = state.score; safeSetHi(state.hiScore); }
        return;
      }
      b.x = W / 2; b.y = H - 60;
      const lv = LEVEL_CONFIG[state.level];
      const spd = 3 * lv.spd;
      b.vx = (Math.random() > 0.5 ? 1 : -1) * spd;
      b.vy = -spd * 1.1;
    }

    if (b.y + b.r > p.y && b.y + b.r < p.y + p.h && b.x > p.x && b.x < p.x + p.w) {
      b.vy = -Math.abs(b.vy);
      b.vx = ((b.x - (p.x + p.w / 2)) / (p.w / 2)) * 6;
      playBeep(440, 'square', 0.06, 0.05);
    }

    for (const brick of state.bricks) {
      if (!brick.alive) continue;
      if (b.x + b.r > brick.x && b.x - b.r < brick.x + brick.w &&
          b.y + b.r > brick.y && b.y - b.r < brick.y + brick.h) {
        brick.alive = false;
        b.vy = -b.vy;
        state.score += 10 * state.level;
        playBeep([523,659,784,880][Math.floor(Math.random()*4)], 'square', 0.05, 0.05);
      }
    }

    if (state.bricks.every(bk => !bk.alive)) {
      if (state.score > state.hiScore) { state.hiScore = state.score; safeSetHi(state.hiScore); }
      if (state.level >= 5) {
        gameState = 'fireworks';
        startFireworks();
      } else {
        gameState = 'levelclear';
      }
    }
  }

  // ============================================
  // DRAW
  // ============================================
  function draw() {
    const W = canvas.width, H = canvas.height;

    // --- FIREWORKS ---
    if (gameState === 'fireworks') {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);
      updateParticles();
      drawParticles();

      const t = Date.now();
      const msgs = [
        { t: 'おめでとうございます！', sz: Math.round(W * 0.072), y: H * 0.33 },
        { t: 'Congratulations!',        sz: Math.round(W * 0.058), y: H * 0.47 },
        { t: '恭喜恭喜！',              sz: Math.round(W * 0.058), y: H * 0.59 },
        { t: '¡Felicidades!',           sz: Math.round(W * 0.058), y: H * 0.71 },
      ];
      ctx.textAlign = 'center';
      msgs.forEach((m, i) => {
        ctx.font = `bold ${m.sz}px VT323, monospace`;
        ctx.fillStyle = `hsl(${(t / 18 + i * 72) % 360}, 100%, 65%)`;
        ctx.fillText(m.t, W / 2, m.y);
      });
      ctx.font = `${Math.round(W * 0.04)}px VT323, monospace`;
      ctx.fillStyle = '#888';
      if (Math.floor(t / 700) % 2) ctx.fillText('TAP or CLICK to return', W / 2, H * 0.88);
      ctx.textAlign = 'left';
      animFrame = requestAnimationFrame(draw);
      return;
    }

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);

    // --- TITLE ---
    if (gameState === 'title') {
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.font = `bold ${Math.round(W * 0.075)}px VT323, monospace`;
      ctx.fillText('BLOCK KUZUSHI', W / 2, H * 0.22);
      ctx.font = `${Math.round(W * 0.046)}px VT323, monospace`;
      ctx.fillStyle = '#aaa';
      ctx.fillText('HI: ' + state.hiScore, W / 2, H * 0.35);

      // レベル表示
      for (let i = 1; i <= 5; i++) {
        ctx.fillStyle = i === state.level ? '#fff' : '#555';
        ctx.font = `${Math.round(W * (i === state.level ? 0.048 : 0.040))}px VT323, monospace`;
        ctx.fillText(LEVEL_CONFIG[i].label + (i === state.level ? ' ◀' : ''), W / 2, H * (0.46 + (i - 1) * 0.092));
      }

      ctx.font = `${Math.round(W * 0.038)}px VT323, monospace`;
      ctx.fillStyle = '#fff';
      if (Math.floor(Date.now() / 600) % 2) ctx.fillText('CLICK or SPACE to start', W / 2, H * 0.95);

      // 隠しコマンドヒント（薄く）
      ctx.fillStyle = 'rgba(255,255,255,0.13)';
      ctx.font = `${Math.round(W * 0.030)}px VT323, monospace`;
      ctx.fillText('[F] fireworks preview', W / 2, H * 0.99);

      ctx.textAlign = 'left';
      animFrame = requestAnimationFrame(draw);
      return;
    }

    // --- GAME OVER ---
    if (gameState === 'gameover') {
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ff4444';
      ctx.font = `bold ${Math.round(W * 0.08)}px VT323, monospace`;
      ctx.fillText('GAME OVER', W / 2, H * 0.35);
      ctx.fillStyle = '#fff';
      ctx.font = `${Math.round(W * 0.046)}px VT323, monospace`;
      ctx.fillText(LEVEL_CONFIG[state.level].label, W / 2, H * 0.48);
      ctx.fillText('SCORE: ' + state.score, W / 2, H * 0.60);
      ctx.fillText('HI: ' + state.hiScore, W / 2, H * 0.70);
      ctx.font = `${Math.round(W * 0.038)}px VT323, monospace`;
      ctx.fillStyle = '#aaa';
      if (Math.floor(Date.now() / 600) % 2) ctx.fillText('CLICK or SPACE to retry', W / 2, H * 0.84);
      ctx.textAlign = 'left';
      animFrame = requestAnimationFrame(draw);
      return;
    }

    // --- LEVEL CLEAR ---
    if (gameState === 'levelclear') {
      ctx.textAlign = 'center';
      ctx.fillStyle = '#44ff44';
      ctx.font = `bold ${Math.round(W * 0.075)}px VT323, monospace`;
      ctx.fillText('STAGE CLEAR!', W / 2, H * 0.28);
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${Math.round(W * 0.052)}px VT323, monospace`;
      ctx.fillText(LEVEL_CONFIG[state.level].label + ' CLEAR', W / 2, H * 0.42);
      ctx.font = `${Math.round(W * 0.044)}px VT323, monospace`;
      ctx.fillText('SCORE: ' + state.score, W / 2, H * 0.54);
      ctx.fillStyle = '#ffff44';
      ctx.fillText('NEXT → ' + LEVEL_CONFIG[state.level + 1].label, W / 2, H * 0.65);
      ctx.font = `${Math.round(W * 0.038)}px VT323, monospace`;
      ctx.fillStyle = '#aaa';
      if (Math.floor(Date.now() / 600) % 2) ctx.fillText('CLICK or SPACE for next level', W / 2, H * 0.80);
      ctx.textAlign = 'left';
      animFrame = requestAnimationFrame(draw);
      return;
    }

    // --- PLAYING ---
    state.bricks.forEach(brick => {
      if (!brick.alive) return;
      ctx.fillStyle = brick.color;
      ctx.fillRect(brick.x, brick.y, brick.w, brick.h);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.strokeRect(brick.x, brick.y, brick.w, brick.h);
    });

    // Paddle
    ctx.fillStyle = '#fff';
    ctx.fillRect(state.paddle.x, state.paddle.y, state.paddle.w, state.paddle.h);

    // Ball
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(state.ball.x, state.ball.y, state.ball.r, 0, Math.PI * 2);
    ctx.fill();

    // HUD
    ctx.fillStyle = '#888';
    ctx.font = `${Math.round(canvas.width * 0.038)}px VT323, monospace`;
    ctx.fillText('SCORE: ' + state.score, 4, 14);
    ctx.textAlign = 'center';
    ctx.fillText(LEVEL_CONFIG[state.level].label, canvas.width / 2, 14);
    ctx.textAlign = 'right';
    ctx.fillText('♥'.repeat(state.lives), canvas.width - 4, 14);
    ctx.textAlign = 'left';

    update();
    animFrame = requestAnimationFrame(draw);
  }

  // ============================================
  // INPUT
  // ============================================
  function handleInput() {
    canvas.addEventListener('click', () => {
      if (gameState === 'title') {
        initGame(false); gameState = 'playing';
      } else if (gameState === 'gameover') {
        initGame(false); gameState = 'playing';
      } else if (gameState === 'levelclear') {
        state.level++;
        initGame(true); // スコア・ライフ引き継ぎ
        gameState = 'playing';
      } else if (gameState === 'fireworks') {
        clearTimeout(fwTimer); particles = [];
        state.level = 1; gameState = 'title';
      }
    });

    canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const tx = e.touches[0].clientX - rect.left;
      const scale = canvas.width / rect.width;
      state.paddle.x = Math.max(0, Math.min(canvas.width - state.paddle.w, tx * scale - state.paddle.w / 2));
    }, { passive: false });

    canvas.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const scale = canvas.width / rect.width;
      state.paddle.x = Math.max(0, Math.min(canvas.width - state.paddle.w, mx * scale - state.paddle.w / 2));
    });

    document.addEventListener('keydown', e => {
      state.keys[e.key] = true;
      if (e.key === ' ') {
        e.preventDefault();
        if (gameState === 'title') {
          initGame(false); gameState = 'playing';
        } else if (gameState === 'gameover') {
          initGame(false); gameState = 'playing';
        } else if (gameState === 'levelclear') {
          state.level++; initGame(true); gameState = 'playing';
        } else if (gameState === 'fireworks') {
          clearTimeout(fwTimer); particles = [];
          state.level = 1; gameState = 'title';
        }
      }
      // 隠しコマンド: タイトルで [F] → 花火プレビュー
      if (e.key === 'f' && gameState === 'title') {
        gameState = 'fireworks';
        startFireworks();
      }
    });
    document.addEventListener('keyup', e => { state.keys[e.key] = false; });
  }

  // ============================================
  // PUBLIC
  // ============================================
  function init(canvasEl) {
    canvas = canvasEl;
    ctx = canvas.getContext('2d');
    canvas.width = 400;
    canvas.height = 300;
    state.level = 1;
    state.hiScore = safeGetHi();
    handleInput();
    draw();
  }

  function stop() {
    cancelAnimationFrame(animFrame);
    clearTimeout(fwTimer);
  }

  return { init, stop };
})();
