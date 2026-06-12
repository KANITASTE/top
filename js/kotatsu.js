// ============================================
// kotatsu.js - Kotatsu Eyes & Mikan Hand
// ============================================

const Kotatsu = (() => {
  let mikanScheduled = false;

  // ---- Eye glow animation ----
  function startEyes() {
    const eyes = document.querySelectorAll('.kotatsu-eye');
    if (!eyes.length) return;

    function glowCycle() {
      // random delay before next glow
      const wait = 1200 + Math.random() * 5000;
      setTimeout(() => {
        // quick double blink
        eyes.forEach(e => e.classList.add('glow'));
        setTimeout(() => {
          eyes.forEach(e => e.classList.remove('glow'));
          setTimeout(() => {
            eyes.forEach(e => e.classList.add('glow'));
            setTimeout(() => {
              eyes.forEach(e => e.classList.remove('glow'));
              glowCycle(); // schedule next
            }, 180 + Math.random() * 300);
          }, 120);
        }, 200 + Math.random() * 400);
      }, wait);
    }
    glowCycle();
  }

  // ---- Mikan hand ----
  function showMikanHand() {
    const hand = document.getElementById('mikan-hand');
    if (!hand || hand.style.display === 'block') return;

    hand.textContent = '🍊✋';
    // Reset animation by toggling display
    hand.style.display = 'none';
    hand.style.animation = 'none';
    // Force reflow
    void hand.offsetHeight;
    hand.style.animation = '';
    hand.style.display = 'block';

    // Rustle sound
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const buf = ac.createBuffer(1, ac.sampleRate * 0.6, ac.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) {
        d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) * 0.2;
      }
      const src = ac.createBufferSource();
      src.buffer = buf; src.connect(ac.destination); src.start();
    } catch(e) {}

    setTimeout(() => { hand.style.display = 'none'; }, 2300);
  }

  // ---- Kotatsu click → cat runs ----
  function onKotatsuClick() {
    // Surprise sound
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const osc  = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain); gain.connect(ac.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(200, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, ac.currentTime + 0.15);
      gain.gain.setValueAtTime(0.1, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.35);
      osc.start(); osc.stop(ac.currentTime + 0.35);
    } catch(e) {}

    if (typeof Cat !== 'undefined') Cat.runningCatAnimation();
  }

  // ---- Random mikan scheduler ----
  function scheduleMikan() {
    if (mikanScheduled) return;
    mikanScheduled = true;
    const delay = 18000 + Math.random() * 42000;
    setTimeout(() => {
      showMikanHand();
      mikanScheduled = false;
      scheduleMikan(); // reschedule
    }, delay);
  }

  function init() {
    startEyes();
    scheduleMikan();

    document.getElementById('kotatsu-eyes')?.addEventListener('click', onKotatsuClick);
    document.getElementById('zone-kotatsu')?.addEventListener('click', onKotatsuClick);
    document.getElementById('zone-mikan')?.addEventListener('click', showMikanHand);
  }

  return { init, showMikanHand };
})();
