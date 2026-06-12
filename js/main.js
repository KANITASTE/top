// ============================================
// main.js - HyperCard Site Orchestrator v2
// ============================================

document.addEventListener('DOMContentLoaded', () => {

  // ============================================
  // STARTUP SEQUENCE
  // ============================================
  function playStartupSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      // Mac "Bong" — sine with overtone
      [[220, 0.35], [440, 0.2], [660, 0.08]].forEach(([freq, vol], i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(vol, ctx.currentTime + i * 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);
        osc.start(ctx.currentTime + i * 0.01);
        osc.stop(ctx.currentTime + 1.8);
      });
    } catch(e) {}
  }

  function runStartupSequence() {
    const screen = document.getElementById('startup-screen');
    const bar = document.getElementById('startup-progress-bar');
    if (!screen || !bar) { initAll(); return; }

    setTimeout(playStartupSound, 400);

    let progress = 0;
    const messages = [
      'HyperCard 2.2 を読み込み中...',
      'ネコモジュールを起動中...',
      'コタツを温め中...',
      'DISCOちゃんを呼んでいます...',
      '準備完了！',
    ];
    const textEl = screen.querySelector('.startup-text');

    const interval = setInterval(() => {
      progress += Math.random() * 9 + 3;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        if (textEl) textEl.textContent = messages[messages.length - 1];
        setTimeout(hideStartup, 600);
      } else {
        const idx = Math.min(Math.floor(progress / 25), messages.length - 2);
        if (textEl) textEl.textContent = messages[idx];
      }
      bar.style.width = progress + '%';
    }, 90);
  }

  function hideStartup() {
    const screen = document.getElementById('startup-screen');
    const main = document.getElementById('main-container');
    if (!screen) return;
    screen.style.transition = 'opacity 0.4s';
    screen.style.opacity = '0';
    setTimeout(() => {
      screen.style.display = 'none';
      if (main) main.style.display = 'block';
      // Wait for layout then init
      requestAnimationFrame(() => requestAnimationFrame(initAll));
    }, 420);
  }

  // ============================================
  // INIT ALL MODULES
  // ============================================
  function initAll() {
    initTV();
    initChat();
    initCat();
    initUFO();
    initKotatsu();
    initDisco();
    initFamicom();
    initFaceZone();
    initRightPorthole();
    initMenuBar();
    initMakeDraggable();
    startClock();
    startHintBar();
    startScreensaverTimer();
    syncOverlayPositions();

    // Keep overlay positions in sync with image scale/resize
    window.addEventListener('resize', () => {
      syncOverlayPositions();
    });
    // Also sync after fonts/images fully loaded
    window.addEventListener('load', syncOverlayPositions);
  }

  // ============================================
  // TV INIT + SIZE SYNC
  // ============================================
  function initTV() {
    const tvCanvas = document.getElementById('tv-canvas');
    if (!tvCanvas || typeof TV === 'undefined') return;
    TV.init(tvCanvas);
    document.getElementById('zone-tv')?.addEventListener('click', () => {
      TV.nextMode();
      playClickSound();
    });
  }

  // ============================================
  // OVERLAY POSITION SYNC
  // ============================================
  function syncOverlayPositions() {
    const img = document.getElementById('main-image');
    if (!img || !img.complete || img.naturalWidth === 0) {
      // Image not ready yet — retry
      img?.addEventListener('load', syncOverlayPositions, { once: true });
      return;
    }

    const rect = img.getBoundingClientRect();
    const container = img.parentElement;
    const cRect = container.getBoundingClientRect();
    const W = rect.width, H = rect.height;
    const offL = rect.left - cRect.left;
    const offT = rect.top - cRect.top;

    function pos(el, t, l, w, h) {
      if (!el) return;
      el.style.position = 'absolute';
      el.style.top    = (offT + H * t) + 'px';
      el.style.left   = (offL + W * l) + 'px';
      el.style.width  = (W * w) + 'px';
      el.style.height = (H * h) + 'px';
    }

    // Click zones  (top%, left%, width%, height%)
    pos(document.getElementById('zone-face'),         0.15, 0.53, 0.28, 0.26);
    pos(document.getElementById('zone-cat'),          0.52, 0.62, 0.22, 0.30);
    pos(document.getElementById('zone-tv'),           0.17, 0.03, 0.28, 0.38);
    pos(document.getElementById('zone-famicom'),      0.68, 0.00, 0.30, 0.22);
    pos(document.getElementById('zone-porthole-left'),0.02, 0.00, 0.10, 0.18);
    pos(document.getElementById('zone-porthole-right'),0.02,0.88, 0.12, 0.18);
    pos(document.getElementById('zone-disco'),        0.46, 0.60, 0.20, 0.10);
    pos(document.getElementById('zone-kotatsu'),      0.75, 0.28, 0.38, 0.18);
    pos(document.getElementById('zone-mikan'),        0.53, 0.33, 0.20, 0.16);

    // TV screen canvas div
    const tvScreen = document.getElementById('tv-screen');
    if (tvScreen) {
      tvScreen.style.position = 'absolute';
      tvScreen.style.left   = (offL + W * 0.066) + 'px';
      tvScreen.style.top    = (offT + H * 0.215) + 'px';
      tvScreen.style.width  = (W * 0.193) + 'px';
      tvScreen.style.height = (H * 0.148) + 'px';
      tvScreen.style.paddingBottom = '0';
      // Resize canvas pixels
      const cvs = document.getElementById('tv-canvas');
      if (cvs) {
        cvs.width  = Math.round(W * 0.193);
        cvs.height = Math.round(H * 0.148);
      }
    }

    // Kotatsu eyes
    const eyes = document.getElementById('kotatsu-eyes');
    if (eyes) {
      eyes.style.position = 'absolute';
      eyes.style.top    = (offT + H * 0.815) + 'px';
      eyes.style.left   = (offL + W * 0.415) + 'px';
      eyes.style.width  = (W * 0.10) + 'px';
      eyes.style.height = (H * 0.07) + 'px';
    }

    // Mikan hand base position
    const mikan = document.getElementById('mikan-hand');
    if (mikan) {
      mikan.style.position = 'absolute';
      mikan.style.top  = (offT + H * 0.60) + 'px';
      mikan.style.left = (offL + W * 0.35) + 'px';
      mikan.style.fontSize = Math.max(16, W * 0.035) + 'px';
    }
  }

  // ============================================
  // FACE / CHAT
  // ============================================
  let chatReady = false;

  function initFaceZone() {
    document.getElementById('zone-face')?.addEventListener('click', openChat);
  }

  function openChat() {
    const win = document.getElementById('chat-window');
    if (!win) return;
    win.style.display = 'block';
    win.style.zIndex = '600';
    playClickSound(true);
    if (!chatReady && typeof CharacterChat !== 'undefined') {
      chatReady = true;
      CharacterChat.init('chat-window');
    }
  }

  window.closeChat = () => {
    document.getElementById('chat-window').style.display = 'none';
  };

  function initChat() {
    // Chat module is lazy-initialized on first open
  }

  // ============================================
  // FAMICOM / GAME
  // ============================================
  let gameRunning = false;

  function initFamicom() {
    document.getElementById('zone-famicom')?.addEventListener('click', openGame);
    // Also footer button
    document.querySelectorAll('[data-open-game]').forEach(btn => {
      btn.addEventListener('click', openGame);
    });
  }

  function openGame() {
    const modal = document.getElementById('game-modal');
    if (!modal) return;
    modal.style.display = 'block';
    modal.style.zIndex = '600';
    playClickSound();
    if (!gameRunning) {
      gameRunning = true;
      const gc = document.getElementById('game-canvas');
      if (gc && typeof Breakout !== 'undefined') Breakout.init(gc);
    }
  }

  window.closeGame = () => {
    document.getElementById('game-modal').style.display = 'none';
    if (typeof Breakout !== 'undefined') Breakout.stop();
    gameRunning = false;
  };

  // ============================================
  // CAT
  // ============================================
  function initCat() {
    if (typeof Cat !== 'undefined') Cat.init();
  }

  // ============================================
  // UFO
  // ============================================
  function initUFO() {
    if (typeof UFO !== 'undefined') UFO.init();
  }

  // ============================================
  // KOTATSU
  // ============================================
  function initKotatsu() {
    if (typeof Kotatsu !== 'undefined') Kotatsu.init();
  }

  // ============================================
  // DISCO
  // ============================================
  function initDisco() {
    if (typeof Disco !== 'undefined') Disco.init();
  }

  // ============================================
  // RIGHT PORTHOLE — random UFO sighting peek
  // ============================================
  function initRightPorthole() {
    const zone = document.getElementById('zone-porthole-right');
    if (!zone) return;
    zone.addEventListener('click', () => {
      showBubble('👀 …なんか見えた気がした', zone);
      playClickSound();
    });
  }

  // ============================================
  // SOUND
  // ============================================
  function playClickSound(happy = false) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.value = happy ? 880 : 440;
      if (happy) osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.1);
      gain.gain.value = 0.07;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start(); osc.stop(ctx.currentTime + 0.12);
    } catch(e) {}
  }

  // ============================================
  // SPEECH BUBBLE HELPER
  // ============================================
  function showBubble(text, relEl) {
    const container = document.getElementById('scene-image-container');
    if (!container) return;
    const bubble = document.createElement('div');
    bubble.className = 'speech-bubble';
    bubble.textContent = text;
    // Position near element
    const elRect = relEl.getBoundingClientRect();
    const cRect  = container.getBoundingClientRect();
    bubble.style.left = Math.max(0, elRect.left - cRect.left) + 'px';
    bubble.style.top  = Math.max(0, elRect.top  - cRect.top - 50) + 'px';
    container.appendChild(bubble);
    setTimeout(() => bubble.remove(), 2300);
  }

  // ============================================
  // MENU BAR DROPDOWNS
  // ============================================
  function initMenuBar() {
    const menus = {
      'File':  [{ label: '新規スタック', action: () => alert('HyperCard新規スタック…\n（このサイト自体がスタックです！）') },
                { label: '終了', action: () => { if(confirm('HyperCardを終了しますか？')) window.close(); } }],
      'Edit':  [{ label: 'コピー', action: () => {} },
                { label: '全選択', action: () => {} }],
      'Go':    [{ label: '最初のカード', action: () => window.scrollTo(0,0) },
                { label: '最後のカード', action: () => window.scrollTo(0, document.body.scrollHeight) }],
      'Tools': [{ label: 'サウンドテスト 🔊', action: () => playClickSound(true) },
                { label: 'UFO呼ぶ 🛸', action: () => typeof UFO !== 'undefined' && UFO.trigger() },
                { label: 'みかん 🍊', action: () => typeof Kotatsu !== 'undefined' && Kotatsu.showMikanHand() }],
    };

    document.querySelectorAll('.menu-item[data-menu]').forEach(item => {
      const key = item.dataset.menu;
      if (!menus[key]) return;
      item.addEventListener('click', e => {
        e.stopPropagation();
        closeAllMenus();
        showDropdown(item, menus[key]);
      });
    });

    document.addEventListener('click', closeAllMenus);
  }

  function showDropdown(anchor, items) {
    const rect = anchor.getBoundingClientRect();
    const menu = document.createElement('div');
    menu.id = 'active-dropdown';
    menu.style.cssText = `
      position:fixed; top:${rect.bottom}px; left:${rect.left}px;
      background:#fff; border:1px solid #000;
      box-shadow:2px 2px 0 #000; z-index:2000;
      font-family:VT323,monospace; font-size:16px; min-width:160px;
    `;
    items.forEach(item => {
      const row = document.createElement('div');
      row.textContent = item.label;
      row.style.cssText = 'padding:3px 14px; cursor:pointer; white-space:nowrap;';
      row.addEventListener('mouseenter', () => { row.style.background='#000'; row.style.color='#fff'; });
      row.addEventListener('mouseleave', () => { row.style.background=''; row.style.color=''; });
      row.addEventListener('click', e => {
        e.stopPropagation();
        closeAllMenus();
        item.action();
      });
      menu.appendChild(row);
    });
    document.body.appendChild(menu);
    anchor.classList.add('active');
  }

  function closeAllMenus() {
    document.getElementById('active-dropdown')?.remove();
    document.querySelectorAll('.menu-item.active').forEach(m => m.classList.remove('active'));
  }

  // ============================================
  // DRAGGABLE WINDOWS
  // ============================================
  function initMakeDraggable() {
    document.querySelectorAll('.mac-window').forEach(makeDraggable);
  }

  function makeDraggable(el) {
    const bar = el.querySelector('.mac-window-title-bar');
    if (!bar) return;
    let ox, oy, sx, sy;

    const onDown = e => {
      if (e.target.classList.contains('mac-window-close')) return;
      const r = el.getBoundingClientRect();
      ox = r.left; oy = r.top;
      sx = e.clientX; sy = e.clientY;
      el.style.transform = 'none';
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp, { once: true });
    };
    const onMove = e => {
      el.style.left = Math.max(0, ox + e.clientX - sx) + 'px';
      el.style.top  = Math.max(0, oy + e.clientY - sy) + 'px';
    };
    const onUp = () => document.removeEventListener('mousemove', onMove);

    bar.addEventListener('mousedown', onDown);
  }

  // Expose for dynamically created windows (e.g. disco.js)
  window.makeDraggable = makeDraggable;

  // ============================================
  // CLOCK
  // ============================================
  function startClock() {
    const el = document.getElementById('menu-clock');
    if (!el) return;
    const tick = () => {
      el.textContent = new Date().toLocaleTimeString('ja-JP', {hour:'2-digit', minute:'2-digit'});
    };
    tick();
    setInterval(tick, 30000);
  }

  // ============================================
  // HINT BAR
  // ============================================
  const hints = [
    '💬 右のキャラクターの顔をクリックすると話しかけられるよ！',
    '🐱 膝の猫をクリック！5回以上クリックすると…？',
    '📺 テレビをクリックで番組切替（テトリス・UFO・猫・DISCO株価…）',
    '🛸 左の丸窓をクリックするとUFOが来るよ！',
    '🎮 ファミコンをクリックするとブロック崩しが遊べる！',
    '📈 DISCOのロゴをクリックすると株価が表示されるよ！',
    '👁 コタツの布団の下から目が光ることがある…クリックすると！',
    '🍊 みかんのあたりを見ていると…手が出てくる？',
  ];
  let hintIdx = 0;
  function startHintBar() {
    const bar = document.getElementById('hint-bar');
    if (!bar) return;
    const show = () => { bar.textContent = hints[hintIdx++ % hints.length]; };
    show();
    setInterval(show, 7000);
  }

  // ============================================
  // SCREENSAVER (After Dark)
  // ============================================
  let idleTimer = null;
  let ssRaf = null;

  function startScreensaverTimer() {
    const reset = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(showScreensaver, 3 * 60 * 1000);
    };
    ['mousemove','keydown','click','touchstart'].forEach(ev => document.addEventListener(ev, reset));
    reset();
  }

  function showScreensaver() {
    const ss = document.getElementById('screensaver');
    if (!ss) return;
    // Build canvas
    let cvs = ss.querySelector('canvas');
    if (!cvs) { cvs = document.createElement('canvas'); ss.appendChild(cvs); }
    cvs.width = window.innerWidth;
    cvs.height = window.innerHeight;
    const ctx = cvs.getContext('2d');

    ss.style.display = 'block';

    // Stars + objects
    const W = cvs.width, H = cvs.height;
    const stars = Array.from({length:100}, () => ({
      x: Math.random()*W, y: Math.random()*H,
      vx:(Math.random()-0.5)*0.8, vy:(Math.random()-0.5)*0.8,
      r: Math.random()*1.5+0.3,
    }));
    const toasters = Array.from({length:5}, (_, i) => ({
      x: Math.random()*W, y: -80 - i*120,
      vx: 1+Math.random(), vy: 1.2+Math.random(),
    }));
    let f = 0;

    function frame() {
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(0, 0, W, H);
      f++;

      // Stars
      stars.forEach(s => {
        s.x = (s.x + s.vx + W) % W;
        s.y = (s.y + s.vy + H) % H;
        ctx.fillStyle = `rgba(255,255,255,${0.4+Math.random()*0.4})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
      });

      // Flying toasters (ASCII art boxes)
      toasters.forEach(t => {
        t.x += t.vx; t.y += t.vy;
        if (t.x > W+50 || t.y > H+50) {
          t.x = -50; t.y = -50 - Math.random()*200;
        }
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1;
        ctx.strokeRect(t.x, t.y, 40, 28);
        ctx.fillStyle = '#aaa';
        ctx.font = '22px serif';
        ctx.fillText('🍞', t.x+8, t.y+22);
        // wings
        ctx.strokeStyle = '#666';
        ctx.beginPath();
        ctx.moveTo(t.x+5, t.y);
        ctx.quadraticCurveTo(t.x+20, t.y-18, t.x+35, t.y);
        ctx.stroke();
      });

      // Flying cat
      const catX = ((f * 2.5) % (W + 80)) - 40;
      const catY = H*0.15 + Math.sin(f*0.025)*60;
      ctx.font = '32px serif'; ctx.fillText('🐱', catX, catY);

      // After Dark label
      ctx.font = 'bold 18px VT323, monospace';
      ctx.fillStyle = `hsl(${f*1.5}, 60%, 55%)`;
      ctx.fillText('After Dark™ for HyperCard  — クリックで戻る', 30, H-20);

      ssRaf = requestAnimationFrame(frame);
    }
    ssRaf = requestAnimationFrame(frame);

    ss.onclick = () => {
      ss.style.display = 'none';
      cancelAnimationFrame(ssRaf);
    };
  }

  // ============================================
  // START
  // ============================================
  runStartupSequence();
});
