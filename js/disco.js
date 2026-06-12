// ============================================
// disco.js - DISCO(6146) Stock & Logo Click
// ============================================

const Disco = (() => {
  // Mock data — swap fetchStockData() for real API when ready
  const base = { price: 42150, change: +580, pct: +1.40, vol: 123400 };

  function mockData() {
    const v = (Math.random() - 0.48) * 300;
    return {
      ...base,
      price: Math.round(base.price + v),
      change: Math.round(base.change + v * 0.1),
      pct: +(base.pct + v * 0.001).toFixed(2),
      date: new Date().toLocaleDateString('ja-JP'),
    };
  }

  async function fetchStockData() {
    // Future: replace with real API
    // e.g. J-Quants, Alpha Vantage, or a proxy
    await new Promise(r => setTimeout(r, 300 + Math.random() * 200));
    return mockData();
  }

  function removeExisting() {
    document.getElementById('stock-overlay')?.remove();
  }

  async function showDiscoTV() {
    // Switch TV mode
    if (typeof TV !== 'undefined') TV.setMode('disco');

    removeExisting();

    // Loading placeholder
    const loading = document.createElement('div');
    loading.id = 'stock-overlay';
    loading.className = 'mac-window';
    Object.assign(loading.style, {
      position: 'fixed', top: '25%', left: '50%',
      transform: 'translateX(-50%)', width: '300px', zIndex: '550',
      fontFamily: 'VT323, monospace',
    });
    loading.innerHTML = `
      <div class="mac-window-title-bar">
        <div class="mac-window-close" onclick="document.getElementById('stock-overlay')?.remove(); if(typeof TV!=='undefined') TV.setMode('tetris');">&#10005;</div>
        <div class="mac-window-title">&#128200; DISCO 6146 — 株価</div>
      </div>
      <div class="mac-window-content" style="padding:16px; font-size:20px; text-align:center;">
        データ取得中... ■■■□□
      </div>`;
    document.body.appendChild(loading);
    if (typeof window.makeDraggable === 'function') window.makeDraggable(loading);

    const data = await fetchStockData();
    removeExisting();

    const upDown = data.pct >= 0;
    const sign   = upDown ? '+' : '';
    const col    = upDown ? '#005500' : '#880000';
    const arrow  = upDown ? '▲' : '▼';

    const win = document.createElement('div');
    win.id = 'stock-overlay';
    win.className = 'mac-window';
    Object.assign(win.style, {
      position: 'fixed', top: '20%', left: '50%',
      transform: 'translateX(-50%)', width: '310px', zIndex: '550',
      fontFamily: 'VT323, monospace',
    });
    win.innerHTML = `
      <div class="mac-window-title-bar">
        <div class="mac-window-close" onclick="document.getElementById('stock-overlay')?.remove(); if(typeof TV!=='undefined') TV.setMode('tetris');">&#10005;</div>
        <div class="mac-window-title">&#128200; DISCO(6146) 株価情報</div>
      </div>
      <div class="mac-window-content" style="padding:14px 16px; font-size:18px; line-height:1.7;">
        <div style="font-size:15px; color:#666; margin-bottom:4px;">ディスコ株式会社</div>
        <div style="font-size:38px; font-weight:bold; margin-bottom:2px;">¥${data.price.toLocaleString()}</div>
        <div style="color:${col}; font-size:24px; margin-bottom:10px;">
          ${arrow} ${sign}${data.change} (${sign}${data.pct}%)
        </div>
        <div style="border-top:1px solid #ccc; padding-top:8px; font-size:15px; color:#555; line-height:1.8;">
          出来高: ${data.vol.toLocaleString()}<br>
          更新: ${data.date}<br>
          <span style="color:#aaa; font-size:13px;">※モックデータ（実際の株価とは異なります）</span>
        </div>
        <div style="margin-top:10px; padding:8px; background:#f5f5f5; border:1px solid #ccc; font-size:15px;">
          ん〜……DISCOは半導体ウエハーの<br>
          精密加工・洗浄装置メーカーだよ〜！<br>
          注目しとるとよ〜♪
        </div>
      </div>`;
    document.body.appendChild(win);
    if (typeof window.makeDraggable === 'function') window.makeDraggable(win);
  }

  function init() {
    document.getElementById('zone-disco')?.addEventListener('click', showDiscoTV);
  }

  return { init, showDiscoTV };
})();
