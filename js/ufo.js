// ============================================
// ufo.js - UFO Event
// ============================================

const UFO = (() => {
  let running = false;

  function playUFOSound() {
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      // Theremin-style wobble
      const osc  = ac.createOscillator();
      const lfo  = ac.createOscillator();
      const lfoG = ac.createGain();
      const gain = ac.createGain();

      lfo.connect(lfoG); lfoG.connect(osc.frequency);
      osc.connect(gain); gain.connect(ac.destination);

      osc.type = 'sawtooth';
      osc.frequency.value = 180;
      lfo.frequency.value = 6;
      lfoG.gain.value = 60;
      gain.gain.setValueAtTime(0.15, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 5);

      lfo.start(); osc.start();
      lfo.stop(ac.currentTime + 5);
      osc.stop(ac.currentTime + 5);
    } catch(e) {}
  }

  function trigger() {
    if (running) return;
    running = true;
    playUFOSound();

    const overlay  = document.getElementById('ufo-overlay');
    const sprite   = document.getElementById('ufo-sprite');
    const blackout = document.getElementById('ufo-blackout');
    if (!overlay || !sprite || !blackout) { running = false; return; }

    overlay.style.display = 'block';
    sprite.textContent = '🛸';

    // Phase 1 — fly in from top-left
    sprite.style.left = '-100px';
    sprite.style.top  = '-60px';
    sprite.style.fontSize = '50px';
    sprite.style.transition = 'none';

    setTimeout(() => {
      sprite.style.transition = 'all 1.2s cubic-bezier(0.25,0.46,0.45,0.94)';
      sprite.style.left = '38%';
      sprite.style.top  = '12%';
    }, 80);

    // Phase 2 — hover and grow
    setTimeout(() => {
      sprite.style.transition = 'all 1.8s ease';
      sprite.style.fontSize = '110px';
      sprite.style.left = '30%';
      sprite.style.top  = '4%';
    }, 1400);

    // Phase 3 — suck in
    setTimeout(() => {
      sprite.style.transition = 'all 1.2s ease-in';
      sprite.style.fontSize = '320px';
      sprite.style.left = '5%';
      sprite.style.top  = '-40%';
    }, 3200);

    // Phase 4 — blackout
    setTimeout(() => {
      blackout.style.display = 'block';
      blackout.style.transition = 'opacity 0.6s';
      requestAnimationFrame(() => { blackout.style.opacity = '1'; });
    }, 4300);

    // Phase 5 — message
    setTimeout(() => {
      const msg = document.createElement('div');
      msg.id = 'ufo-msg';
      msg.style.cssText = `
        position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);
        color:#0f0; font-family:VT323,monospace; font-size:clamp(18px,3vw,30px);
        text-align:center; z-index:910; pointer-events:none; line-height:1.8;
      `;
      msg.innerHTML = '🛸 WE COME IN PEACE 🛸<br><br>（連れ去られました…）<br><br>まもなく帰還します';
      document.body.appendChild(msg);
    }, 4800);

    // Phase 6 — restore
    setTimeout(() => {
      document.getElementById('ufo-msg')?.remove();
      blackout.style.opacity = '0';
      setTimeout(() => {
        blackout.style.display = 'none';
        overlay.style.display  = 'none';
        sprite.style.transition = 'none';
        sprite.style.fontSize = '50px';
        sprite.style.left = '-100px';
        sprite.style.top  = '-60px';
        running = false;
      }, 700);
    }, 7500);
  }

  function init() {
    document.getElementById('zone-porthole-left')?.addEventListener('click', trigger);
  }

  return { init, trigger };
})();
