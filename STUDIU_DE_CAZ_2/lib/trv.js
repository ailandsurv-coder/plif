/* Utilitare comune pentru animatiile studiului de caz: formatare, scenarii, harta 2D cu deplasare / zoom. */
(function(){
  const nf = (v, d) => (v == null || isNaN(v)) ? '—' : Number(v).toLocaleString('ro-RO', {minimumFractionDigits:d||0, maximumFractionDigits:d||0});
  const SCN = {
    ORIG_APR:{n:'Proiect inițial — capete pe teren', s:'Inițial', c:'#b4c0d4'},
    FT:{n:'FT — tub drept, poziție optimizată', s:'FT', c:'#ffc940'},
    XTR_075:{n:'XTR — 0,75° pe deschidere', s:'XTR 0,75°', c:'#7fd4ff'},
    XTR_1:{n:'XTR — 1° pe deschidere', s:'XTR 1°', c:'#5be39a'},
    XTR_2:{n:'XTR — 2° pe deschidere', s:'XTR 2°', c:'#b48cff'},
    FT_ECH:{n:'FT echilibrat (săpătură × 1,2 = umplutură)', s:'FT ech.', c:'#ff9d3c'},
    XTR_1_ECH:{n:'XTR 1° echilibrat', s:'XTR 1° ech.', c:'#3fd0ff'}
  };
  function b64u16(s){ const b = atob(s), u = new Uint8Array(b.length); for(let i=0;i<b.length;i++) u[i] = b.charCodeAt(i); return new Uint16Array(u.buffer); }
  function img(src){ const i = new Image(); i.src = src; return i; }

  /* Harta 2D: coordonate locale (m), y spre nord. layers = [{img, on, alpha}]; draw(ctx, view) pentru vectori. */
  function Map2D(canvas, o){
    const ctx = canvas.getContext('2d');
    const m = {cx:0, cy:0, k:1, layers:[], vec:[], canvas, ctx, W:o.W, H:o.H, onclick:null, onmove:null, fixed:false};
    function size(){ const r = devicePixelRatio || 1; canvas.width = canvas.clientWidth*r; canvas.height = canvas.clientHeight*r; ctx.setTransform(r,0,0,r,0,0); }
    addEventListener('resize', size); size();
    m.toS = (x, y) => [(x - m.cx)*m.k + canvas.clientWidth/2, (m.cy - y)*m.k + canvas.clientHeight/2];
    m.toW = (sx, sy) => [(sx - canvas.clientWidth/2)/m.k + m.cx, m.cy - (sy - canvas.clientHeight/2)/m.k];
    m.fit = (x0, x1, y0, y1, pad) => { pad = pad||0.06; m.cx = (x0 + x1)/2; m.cy = (y0 + y1)/2;
      m.k = Math.min(canvas.clientWidth/((x1 - x0)*(1 + 2*pad)), (canvas.clientHeight - 120)/((y1 - y0)*(1 + 2*pad))); };
    m.anim = null;   // tranzitie lina intre doua vederi
    m.flyTo = (x0, x1, y0, y1, dur) => { const a = {cx:m.cx, cy:m.cy, k:m.k}; m.fit(x0, x1, y0, y1); const b = {cx:m.cx, cy:m.cy, k:m.k};
      Object.assign(m, a); m.anim = {a, b, t0:performance.now(), d:(dur||1.2)*1000}; };
    m.draw = () => {
      if(m.anim){ const f = Math.min(1, (performance.now() - m.anim.t0)/m.anim.d), e = f<.5 ? 4*f*f*f : 1-Math.pow(-2*f+2,3)/2;
        m.cx = m.anim.a.cx + (m.anim.b.cx - m.anim.a.cx)*e; m.cy = m.anim.a.cy + (m.anim.b.cy - m.anim.a.cy)*e;
        m.k = Math.exp(Math.log(m.anim.a.k) + (Math.log(m.anim.b.k) - Math.log(m.anim.a.k))*e); if(f >= 1) m.anim = null; }
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      const [sx, sy] = m.toS(0, m.H);
      ctx.imageSmoothingEnabled = m.k < 2.5;
      m.layers.forEach(l => { if(l.on && l.img.complete && (l.alpha == null || l.alpha > 0.01)){ ctx.globalAlpha = l.alpha == null ? 1 : l.alpha; ctx.drawImage(l.img, sx, sy, m.W*m.k, m.H*m.k); } });
      ctx.globalAlpha = 1;
      m.vec.forEach(f => f(ctx, m));
    };
    let drag = null, moved = false;
    canvas.addEventListener('pointerdown', e => { if(m.fixed) return; drag = [e.clientX, e.clientY, m.cx, m.cy]; moved = false; canvas.setPointerCapture(e.pointerId); m.anim = null; });
    canvas.addEventListener('pointermove', e => {
      if(drag){ const dx = e.clientX - drag[0], dy = e.clientY - drag[1]; if(Math.abs(dx) + Math.abs(dy) > 3) moved = true; m.cx = drag[2] - dx/m.k; m.cy = drag[3] + dy/m.k; }
      if(m.onmove){ const r = canvas.getBoundingClientRect(); m.onmove(...m.toW(e.clientX - r.left, e.clientY - r.top), e); } });
    canvas.addEventListener('pointerup', e => { if(drag && !moved && m.onclick){ const r = canvas.getBoundingClientRect(); m.onclick(...m.toW(e.clientX - r.left, e.clientY - r.top), e); } drag = null; });
    canvas.addEventListener('wheel', e => { e.preventDefault(); if(m.fixed) return; m.anim = null; const r = canvas.getBoundingClientRect(), sx = e.clientX - r.left, sy = e.clientY - r.top;
      const [wx, wy] = m.toW(sx, sy); m.k *= Math.exp(-e.deltaY*0.0015); m.k = Math.max(0.05, Math.min(40, m.k));
      const [wx2, wy2] = m.toW(sx, sy); m.cx += wx - wx2; m.cy += wy - wy2; }, {passive:false});
    return m;
  }

  /* bara de scara */
  function scaleBar(ctx, m, x, y){
    const target = 160/m.k, p = Math.pow(10, Math.floor(Math.log10(target))), v = [1, 2, 5, 10].map(k => k*p).filter(v => v <= target).pop() || p;
    const w = v*m.k;
    ctx.fillStyle = 'rgba(5,9,19,.75)'; ctx.fillRect(x - 10, y - 30, w + 90, 44);
    ctx.fillStyle = '#fff'; ctx.fillRect(x, y, w, 5); ctx.fillStyle = '#3fd0ff'; ctx.fillRect(x, y, w/2, 5);
    ctx.font = '600 15px Segoe UI'; ctx.fillText(nf(v) + ' m', x + w + 10, y + 7);
    // nordul
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(x + w + 70, y - 22); ctx.lineTo(x + w + 64, y - 6); ctx.lineTo(x + w + 76, y - 6); ctx.fill();
    ctx.font = '700 12px Segoe UI'; ctx.fillText('N', x + w + 66, y + 8);
  }

  window.TRV = {nf, SCN, b64u16, img, Map2D, scaleBar};
})();
