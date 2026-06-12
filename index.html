// ============================================
// cat.js - Cat Character Interactions
// ============================================

const Cat = (() => {
  let clickCount = 0;
  let clickTimer  = null;
  let isAngry     = false;
  let catOverlay  = null; // SVG/emoji overlay on the image

  const meows = ['にゃー！', 'みゃー♪', 'ふにゃ〜', 'にゃん！', 'みゅー？', 'にゃにゃ！'];
  const happyMeows = ['ごろごろ〜', 'にゃ〜ん♡', 'ふみふみ…'];

  function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  // ---- Audio ----
  function playMeow(angry = false) {
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain); gain.connect(ac.destination);
      osc.type = angry ? 'sawtooth' : 'sine';

      if (angry) {
        osc.frequency.setValueAtTime(600, ac.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ac.currentTime + 0.5);
        gain.gain.setValueAtTime(0.25, ac.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.55);
        osc.start(); osc.stop(ac.currentTime + 0.55);
      } else {
        osc.frequency.setValueAtTime(480, ac.currentTime);
        osc.frequency.exponentialRampToValueAtTime(680, ac.currentTime + 0.08);
        osc.frequency.exponentialRampToValueAtTime(380, ac.currentTime + 0.28);
        gain.gain.setValueAtTime(0.12, ac.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.32);
        osc.start(); osc.stop(ac.currentTime + 0.32);
      }
    } catch(e) {}
  }

  // ---- Speech bubble ----
  function showBubble(text, anchorZone) {
    const container = document.getElementById('scene-image-container');
    if (!container) return;
    const bubble = document.createElement('div');
    bubble.className = 'speech-bubble';
    bubble.textContent = text;

    const zr = anchorZone.getBoundingClientRect();
    const cr = container.getBoundingClientRect();
    bubble.style.left = Math.max(4, zr.left - cr.left - 10) + 'px';
    bubble.style.top  = Math.max(4, zr.top  - cr.top  - 52) + 'px';
    container.appendChild(bubble);
    setTimeout(() => bubble.remove(), 2300);
  }

  // ---- Giant / angry sequence ----
  function goAngry(zone) {
    if (isAngry) return;
    isAngry = true;

    playMeow(true);

    // Flash the zone red
    zone.style.outline = '3px solid red';
    zone.style.background = 'rgba(255,0,0,0.18)';

    showBubble('シャーーー！！！🙀', zone);

    // Shake the page slightly
    document.body.style.animation = 'none';
    let shakes = 0;
    const shakeInterval = setInterval(() => {
      document.getElementById('scene-image-container').style.transform =
        shakes % 2 === 0 ? 'translateX(4px)' : 'translateX(-4px)';
      if (++shakes > 6) {
        clearInterval(shakeInterval);
        document.getElementById('scene-image-container').style.transform = '';
      }
    }, 60);

    setTimeout(() => {
      zone.style.outline = '';
      zone.style.background = '';
      isAngry = false;
      clickCount = 0;
    }, 2500);
  }

  // ---- Running cat (called from kotatsu.js) ----
  function runningCatAnimation() {
    const el = document.getElementById('running-cat');
    if (!el || el.style.display === 'block') return;

    const cats = ['🐱','🐈','🐱','🐈‍⬛'];
    el.style.display = 'block';
    el.style.top = (15 + Math.random() * 55) + 'vh';
    el.style.left = '-60px';
    el.style.fontSize = '36px';

    let f = 0;
    const fIntvl = setInterval(() => { el.textContent = cats[f++ % cats.length]; }, 130);

    let pos = -60;
    const speed = 9 + Math.random() * 5;
    const mIntvl = setInterval(() => {
      pos += speed;
      el.style.left = pos + 'px';
      if (pos > window.innerWidth + 80) {
        clearInterval(mIntvl);
        clearInterval(fIntvl);
        el.style.display = 'none';
        el.style.left = '-60px';
      }
    }, 25);
  }

  // ---- Click handler ----
  function onClick(e) {
    if (isAngry) return;
    clickCount++;
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => { clickCount = 0; }, 2500);

    const zone = document.getElementById('zone-cat');

    if (clickCount >= 5) {
      goAngry(zone);
      return;
    }

    playMeow(false);
    const text = clickCount >= 3 ? rand(happyMeows) : rand(meows);
    showBubble(text, zone);
  }

  function init() {
    const zone = document.getElementById('zone-cat');
    zone?.addEventListener('click', onClick);
  }

  return { init, runningCatAnimation };
})();
