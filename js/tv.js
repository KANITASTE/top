// ============================================
// tv.js - TV Screen Animations
// ============================================

const TV = (() => {
  let canvas, ctx;
  let mode = 0;
  let raf  = null;
  let fc   = 0;

  const MODES = ['tetris', 'ufo', 'cat', 'stock', 'noise', 'disco'];

  // --- Tetris mini ---
  const tet = {
    board: [], piece: null, score: 0,
    reset() {
      this.board = Array(10).fill(0).map(() => Array(6).fill(0));
      this.score = 0;
      this.newPiece();
    },
    newPiece() {
      const shapes = [
        [[1,1,1,1]], [[1,1],[1,1]], [[1,1,0],[0,1,1]],
        [[0,1,1],[1,1,0]], [[1,0],[1,0],[1,1]],
        [[0,1],[0,1],[1,1]], [[0,1,0],[1,1,1]],
      ];
      this.piece = { s: shapes[Math.floor(Math.random()*shapes.length)], x: Math.floor(Math.random()*4), y: 0 };
    },
    step() {
      this.piece.y++;
      if (this.piece.y > 7) {
        this.piece.s.forEach((row, dy) => row.forEach((v, dx) => {
          if (v) { const py = this.piece.y+dy-1; if (py>=0&&py<10) this.board[py][(this.piece.x+dx)%6]=1; }
        }));
        this.board = this.board.filter(r => !r.every(c=>c));
        while (this.board.length < 10) this.board.unshift(Array(6).fill(0));
        this.score += 10;
        this.newPiece();
      }
    },
  };

  function W() { return canvas.width  || 120; }
  function H() { return canvas.height || 90;  }

  function clear(bg='#001100') { ctx.fillStyle=bg; ctx.fillRect(0,0,W(),H()); }

  // ---- TETRIS ----
  function drawTetris() {
    clear('#001100');
    const cw = W()/6, ch = H()/10;
    ctx.fillStyle='#003300';
    tet.board.forEach((row,y) => row.forEach((c,x) => {
      if (c) ctx.fillRect(x*cw+1, y*ch+1, cw-2, ch-2);
    }));
    ctx.fillStyle='#00ff41';
    if (tet.piece) {
      tet.piece.s.forEach((row,dy) => row.forEach((v,dx) => {
        if (v) ctx.fillRect(((tet.piece.x+dx)%6)*cw+1, (tet.piece.y+dy)*ch+1, cw-2, ch-2);
      }));
    }
    ctx.font = `${Math.max(7,W()*0.11)}px VT323,monospace`;
    ctx.fillStyle='#00ff41'; ctx.fillText(tet.score, 2, H()-4);
    if (fc%18===0) tet.step();
  }

  // ---- UFO ----
  function drawUFO() {
    clear('#000011');
    // Stars
    ctx.fillStyle='#fff';
    for (let i=0;i<24;i++) {
      ctx.fillRect( ((i*41+fc*0.4)%W()), ((i*27+i*11)%H()), 1, 1 );
    }
    // Buildings
    [0.10,0.30,0.18,0.40,0.22,0.35,0.12,0.28].forEach((bh,i)=>{
      const bx=i*(W()/8), bw=W()/8-1;
      ctx.strokeStyle='#2244aa'; ctx.lineWidth=1;
      ctx.strokeRect(bx, H()-H()*bh, bw, H()*bh);
      // Windows
      ctx.fillStyle='rgba(255,220,100,0.5)';
      for(let wy=H()-H()*bh+3; wy<H()-4; wy+=6) {
        for(let wx=bx+2; wx<bx+bw-2; wx+=5) {
          if(Math.random()>0.4) ctx.fillRect(wx,wy,2,3);
        }
      }
    });
    // UFO
    const ux = (fc*1.6)%(W()+40)-20;
    const uy = H()*0.18 + Math.sin(fc*0.06)*12;
    ctx.strokeStyle='#88ff88'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.ellipse(ux,uy,14,5,0,0,Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(ux,uy-4,7,4,0,0,Math.PI); ctx.stroke();
    // Lights
    [-6,0,6].forEach((dx,i)=>{
      ctx.fillStyle=`hsl(${fc*8+i*60},100%,60%)`;
      ctx.fillRect(ux+dx, uy+3, 2, 2);
    });
    // Beam
    ctx.strokeStyle='rgba(136,255,136,0.25)';
    ctx.beginPath(); ctx.moveTo(ux-4,uy+5); ctx.lineTo(ux-12,uy+35);
    ctx.moveTo(ux+4,uy+5); ctx.lineTo(ux+12,uy+35); ctx.stroke();
    // Plane
    const px = (fc*0.9+60)%(W()+20)-10;
    ctx.fillStyle='#334466';
    ctx.fillRect(px, H()*0.38, 14, 4);
    ctx.fillRect(px+5, H()*0.38-4, 4, 4);
  }

  // ---- CAT ----
  function drawCat() {
    clear('#111');
    const sz = Math.max(8,W()*0.11);
    ctx.fillStyle='#fff'; ctx.font=`${sz}px VT323,monospace`;
    const blink = Math.floor(fc/25)%2===0;
    [' /\\_/\\ ', blink?'( -.- )':'( ^.^ )', ' > ^ < ', ' |   | ', ' |___|'].forEach((l,i)=>{
      ctx.fillText(l, 3, sz*1.3*(i+1)+3);
    });
    const tails=['~','~~','~~~','~~'];
    ctx.fillText(tails[Math.floor(fc/10)%tails.length], W()*0.62, H()*0.82);
  }

  // ---- STOCK ----
  function drawStock() {
    clear('#001100');
    const sz=Math.max(7,W()*0.11);
    ctx.font=`bold ${sz}px VT323,monospace`; ctx.fillStyle='#00ff41';
    ctx.fillText('DISCO', 3, sz+2);
    ctx.font=`${sz*0.85}px VT323,monospace`;
    ctx.fillText('6146', 3, sz*2+3);

    const pts=[40,45,42,50,48,55,52,58,54,60,57,62,59,64];
    ctx.strokeStyle='#00ff41'; ctx.lineWidth=1;
    ctx.beginPath();
    pts.forEach((p,i)=>{
      const x=(i/pts.length)*W();
      const y=H()-(p/70)*(H()*0.5)-H()*0.08;
      i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    }); ctx.stroke();

    const ci=Math.floor(fc/10)%pts.length;
    const cx=(ci/pts.length)*W();
    const cy=H()-(pts[ci]/70)*(H()*0.5)-H()*0.08;
    ctx.fillStyle='#ff0'; ctx.fillRect(cx-2,cy-2,4,4);

    const mock=4215+Math.sin(fc*0.02)*55;
    ctx.font=`${sz*0.8}px VT323,monospace`;
    ctx.fillStyle='#00ff41';
    ctx.fillText(`¥${Math.round(mock)}`, 3, H()-16);
    const chg=Math.sin(fc*0.03)*3;
    ctx.fillStyle=chg>=0?'#00ff00':'#ff4444';
    ctx.fillText(`${chg>=0?'+':''}${chg.toFixed(1)}%`, 3, H()-4);
  }

  // ---- NOISE ----
  function drawNoise() {
    const id=ctx.createImageData(W(),H());
    for(let i=0;i<id.data.length;i+=4){
      const v=Math.random()>0.5?200:20;
      id.data[i]=id.data[i+1]=id.data[i+2]=v; id.data[i+3]=255;
    }
    ctx.putImageData(id,0,0);
  }

  // ---- DISCO ----
  function drawDisco() {
    clear('#110011');
    const sz=Math.max(8,W()*0.12);
    ctx.font=`bold ${sz}px VT323,monospace`;
    ctx.fillStyle=`hsl(${fc*3},100%,65%)`; ctx.fillText('DISCO',2,sz+3);
    ctx.fillStyle='#ff44ff'; ctx.fillText('6146',2,sz*2+4);

    const price=4215+Math.sin(fc*0.02)*60;
    ctx.font=`${sz*0.85}px VT323,monospace`;
    ctx.fillStyle='#00ffff'; ctx.fillText(`¥${Math.round(price)}`,2,sz*3+4);

    const chg=Math.sin(fc*0.04)*3.5;
    ctx.fillStyle=chg>=0?'#00ff00':'#ff4444';
    ctx.fillText(`${chg>=0?'+':''}${chg.toFixed(1)}%`,2,sz*4+4);

    // Disco ball
    const bx=W()*0.72, by=H()*0.3;
    ctx.strokeStyle=`hsl(${fc*4},100%,60%)`; ctx.lineWidth=1;
    ctx.beginPath(); ctx.arc(bx,by,10,0,Math.PI*2); ctx.stroke();
    for(let i=0;i<6;i++){
      const a=fc*0.06+i*Math.PI/3;
      ctx.fillStyle=`hsl(${fc*5+i*50},100%,65%)`;
      ctx.fillRect(bx+Math.cos(a)*18, by+Math.sin(a)*18, 2, 2);
    }
  }

  function drawFrame() {
    fc++;
    switch(mode) {
      case 0: drawTetris(); break;
      case 1: drawUFO();    break;
      case 2: drawCat();    break;
      case 3: drawStock();  break;
      case 4: drawNoise();  break;
      case 5: drawDisco();  break;
    }
    raf = requestAnimationFrame(drawFrame);
  }

  function init(cvs) {
    canvas = cvs;
    ctx    = canvas.getContext('2d');
    // canvas dimensions are set externally by syncOverlayPositions
    tet.reset();
    if (raf) cancelAnimationFrame(raf);
    drawFrame();
  }

  function nextMode() {
    mode = (mode + 1) % MODES.length;
    if (mode === 0) tet.reset();
  }

  function setMode(name) {
    const i = MODES.indexOf(name);
    if (i >= 0) mode = i;
  }

  function resize(w, h) {
    if (!canvas) return;
    canvas.width  = Math.round(w);
    canvas.height = Math.round(h);
  }

  return { init, nextMode, setMode, resize, MODES };
})();
