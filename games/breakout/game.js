// ============================================
// games/breakout/game.js - Retro Breakout
// ============================================

const Breakout = (() => {
  let canvas, ctx;
  let animFrame;
  let gameState = 'title'; // title, playing, gameover, clear

  const state = {
    ball: { x: 0, y: 0, vx: 3, vy: -4, r: 6 },
    paddle: { x: 0, y: 0, w: 70, h: 10, speed: 6 },
    bricks: [],
    score: 0,
    lives: 3,
    hiScore: 0,
    keys: {},
  };

  const COLS = 8, ROWS = 4;
  const BRICK_W = 48, BRICK_H = 14, BRICK_GAP = 2;
  const BRICK_OFFSET_X = 8, BRICK_OFFSET_Y = 30;

  function initGame() {
    const W = canvas.width, H = canvas.height;
    state.ball.x = W / 2;
    state.ball.y = H - 60;
    state.ball.vx = (Math.random() > 0.5 ? 1 : -1) * (3 + Math.random());
    state.ball.vy = -4;
    state.paddle.x = W / 2 - state.paddle.w / 2;
    state.paddle.y = H - 20;
    state.bricks = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        state.bricks.push({
          x: BRICK_OFFSET_X + c * (BRICK_W + BRICK_GAP),
          y: BRICK_OFFSET_Y + r * (BRICK_H + BRICK_GAP),
          alive: true,
          color: ['#ff4444','#ff8800','#ffff00','#44ff44'][r],
        });
      }
    }
    state.score = 0;
    state.lives = 3;
    state.hiScore = parseInt(localStorage.getItem('breakout_hi') || '0');
  }

  function update() {
    if (gameState !== 'playing') return;
    const W = canvas.width, H = canvas.height;
    const b = state.ball, p = state.paddle;

    // Move paddle
    if (state.keys['ArrowLeft'] || state.keys['a']) p.x = Math.max(0, p.x - p.speed);
    if (state.keys['ArrowRight'] || state.keys['d']) p.x = Math.min(W - p.w, p.x + p.speed);

    // Move ball
    b.x += b.vx;
    b.y += b.vy;

    // Wall bounce
    if (b.x - b.r < 0) { b.x = b.r; b.vx = Math.abs(b.vx); }
    if (b.x + b.r > W) { b.x = W - b.r; b.vx = -Math.abs(b.vx); }
    if (b.y - b.r < 0) { b.y = b.r; b.vy = Math.abs(b.vy); }

    // Ball fell
    if (b.y > H + 20) {
      state.lives--;
      if (state.lives <= 0) {
        gameState = 'gameover';
        if (state.score > state.hiScore) {
          state.hiScore = state.score;
          localStorage.setItem('breakout_hi', state.hiScore);
        }
        return;
      }
      b.x = W / 2; b.y = H - 60;
      b.vx = (Math.random() > 0.5 ? 1 : -1) * 3;
      b.vy = -4;
    }

    // Paddle collision
    if (b.y + b.r > p.y && b.y + b.r < p.y + p.h &&
        b.x > p.x && b.x < p.x + p.w) {
      b.vy = -Math.abs(b.vy);
      // Angle based on hit position
      const hitPos = (b.x - p.x) / p.w - 0.5;
      b.vx = hitPos * 8;
      playBeep(440);
    }

    // Brick collision
    for (const brick of state.bricks) {
      if (!brick.alive) continue;
      if (b.x + b.r > brick.x && b.x - b.r < brick.x + BRICK_W &&
          b.y + b.r > brick.y && b.y - b.r < brick.y + BRICK_H) {
        brick.alive = false;
        b.vy = -b.vy;
        state.score += 10;
        playBeep(660);
      }
    }

    // Clear check
    if (state.bricks.every(bk => !bk.alive)) {
      gameState = 'clear';
      if (state.score > state.hiScore) {
        state.hiScore = state.score;
        localStorage.setItem('breakout_hi', state.hiScore);
      }
    }
  }

  function playBeep(freq) {
    try {
      const actx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.value = 0.05;
      gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.08);
      osc.start();
      osc.stop(actx.currentTime + 0.08);
    } catch(e) {}
  }

  function draw() {
    const W = canvas.width, H = canvas.height;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);

    if (gameState === 'title') {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 22px VT323, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('BREAKOUT', W/2, H/2 - 30);
      ctx.font = '16px VT323, monospace';
      ctx.fillText('SPACE or TAP to start', W/2, H/2);
      ctx.fillText(`HI: ${state.hiScore}`, W/2, H/2 + 25);
      ctx.textAlign = 'left';
      animFrame = requestAnimationFrame(draw);
      return;
    }

    if (gameState === 'gameover') {
      ctx.fillStyle = '#ff4444';
      ctx.font = 'bold 28px VT323, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', W/2, H/2 - 20);
      ctx.fillStyle = '#fff';
      ctx.font = '16px VT323, monospace';
      ctx.fillText(`SCORE: ${state.score}`, W/2, H/2 + 10);
      ctx.fillText('SPACE or TAP to retry', W/2, H/2 + 35);
      ctx.textAlign = 'left';
      animFrame = requestAnimationFrame(draw);
      return;
    }

    if (gameState === 'clear') {
      ctx.fillStyle = '#44ff44';
      ctx.font = 'bold 28px VT323, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('STAGE CLEAR!', W/2, H/2 - 20);
      ctx.fillStyle = '#fff';
      ctx.font = '16px VT323, monospace';
      ctx.fillText(`SCORE: ${state.score}`, W/2, H/2 + 10);
      ctx.fillText('SPACE or TAP for next', W/2, H/2 + 35);
      ctx.textAlign = 'left';
      animFrame = requestAnimationFrame(draw);
      return;
    }

    // Draw bricks
    state.bricks.forEach(brick => {
      if (!brick.alive) return;
      ctx.fillStyle = brick.color;
      ctx.fillRect(brick.x, brick.y, BRICK_W, BRICK_H);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.strokeRect(brick.x, brick.y, BRICK_W, BRICK_H);
    });

    // Draw paddle
    ctx.fillStyle = '#fff';
    ctx.fillRect(state.paddle.x, state.paddle.y, state.paddle.w, state.paddle.h);

    // Draw ball
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(state.ball.x, state.ball.y, state.ball.r, 0, Math.PI * 2);
    ctx.fill();

    // HUD
    ctx.fillStyle = '#888';
    ctx.font = '14px VT323, monospace';
    ctx.fillText(`SCORE: ${state.score}`, 4, 14);
    ctx.fillText(`HI: ${state.hiScore}`, W/2 - 20, 14);
    ctx.fillText(`♥`.repeat(state.lives), W - 50, 14);

    update();
    animFrame = requestAnimationFrame(draw);
  }

  function handleInput() {
    canvas.addEventListener('click', () => {
      if (gameState === 'title' || gameState === 'gameover') {
        initGame();
        gameState = 'playing';
      } else if (gameState === 'clear') {
        initGame();
        gameState = 'playing';
      }
    });

    canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const tx = e.touches[0].clientX - rect.left;
      const scale = canvas.width / rect.width;
      state.paddle.x = tx * scale - state.paddle.w / 2;
      state.paddle.x = Math.max(0, Math.min(canvas.width - state.paddle.w, state.paddle.x));
    }, { passive: false });

    canvas.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const scale = canvas.width / rect.width;
      state.paddle.x = mx * scale - state.paddle.w / 2;
      state.paddle.x = Math.max(0, Math.min(canvas.width - state.paddle.w, state.paddle.x));
    });

    document.addEventListener('keydown', e => {
      state.keys[e.key] = true;
      if (e.key === ' ') {
        e.preventDefault();
        if (gameState === 'title' || gameState === 'gameover' || gameState === 'clear') {
          initGame();
          gameState = 'playing';
        }
      }
    });
    document.addEventListener('keyup', e => { state.keys[e.key] = false; });
  }

  function init(canvasEl) {
    canvas = canvasEl;
    ctx = canvas.getContext('2d');
    canvas.width = 400;
    canvas.height = 300;
    state.hiScore = parseInt(localStorage.getItem('breakout_hi') || '0');
    handleInput();
    draw();
  }

  function stop() {
    cancelAnimationFrame(animFrame);
  }

  return { init, stop };
})();
