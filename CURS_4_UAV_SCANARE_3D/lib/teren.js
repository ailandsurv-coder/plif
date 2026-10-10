/* Teren sintetic comun pentru animațiile Cursului 3: câmpie cu un canal magistral de irigații (cu diguri și drum
   de serviciu), valea unui râu, o perdea de arbori și un sat. Unități: metri; domeniul 0..800 (X est) × 0..500 (Y nord).
   TEREN.ground(x,y)  — cota terenului natural amenajat (fără vegetație / clădiri) = DTM
   TEREN.surface(x,y) — cota suprafeței (cu arbori și clădiri) = DSM
   TEREN.cls(x,y)     — clasa punctului: 2 sol, 3 vegetație joasă, 5 vegetație înaltă, 6 clădire, 9 apă (coduri ASPRS LAS) */
(function(){
  const W = 800, H = 500;
  const riverY = x => 250 + 55*Math.sin(x/115) + 18*Math.sin(x/41);
  // axa canalului: dreaptă înclinată
  const cA = [0, 430], cB = [800, 360];
  const cDir = (() => { const dx = cB[0]-cA[0], dy = cB[1]-cA[1], L = Math.hypot(dx, dy); return [dx/L, dy/L, L]; })();
  const canalOff = (x, y) => { const vx = x - cA[0], vy = y - cA[1]; return {s: vx*cDir[0] + vy*cDir[1], d: -vx*cDir[1] + vy*cDir[0]}; };
  const plain = (x, y) => 62 + 0.0042*x - 0.0016*y + 0.5*Math.sin(x/97 + 0.6)*Math.cos(y/83) + 0.18*Math.sin((x + 1.7*y)/131) + 0.12*Math.cos((2.3*x - y)/71);
  // canal: fund 6 m, adâncime 3 m, taluz 1:2, diguri de 2 m cu coronament de 5 m
  const CANAL = {b:6, h:3, m:2, dig:2, cor:5, mDig:2};
  function canalZ(x, y, z0){
    const o = canalOff(x, y), d = Math.abs(o.d), c = CANAL;
    const zb = 64.2 - 0.0002*o.s;                              // fundul canalului: pantă 0,2 ‰
    const half = c.b/2, top = half + c.m*(z0 + c.dig - zb);   // de la fund la coronamentul digului
    const zc = z0 + c.dig;
    if(d <= half) return {z:zb, k:'canal'};
    if(d <= half + c.m*(zc - zb)) return {z:zb + (d - half)/c.m, k:'taluz'};
    const t0 = half + c.m*(zc - zb);
    if(d <= t0 + c.cor) return {z:zc, k:(d > t0 + 1 && d < t0 + 4 ? 'drum' : 'dig')};
    const t1 = t0 + c.cor;
    if(d <= t1 + c.mDig*c.dig) return {z:zc - (d - t1)/c.mDig, k:'dig'};
    return null;
  }
  function ground(x, y){
    let z = plain(x, y);
    const dr = y - riverY(x);                                  // valea râului
    z -= 5.5*Math.exp(-dr*dr/(2*30*30)) + 1.6*Math.exp(-dr*dr/(2*9*9));
    const c = canalZ(x, y, plain(x, y)); if(c) z = c.z;
    return z;
  }
  const waterZ = x => plain(x, riverY(x)) - 5.5 - 1.6 + 0.9;
  const inRiver = (x, y) => Math.abs(y - riverY(x)) < 7;
  // arbori de-a lungul râului + aliniament lângă canal; sat în colțul SE
  let seed = 11; const rnd = () => (seed = (seed*16807) % 2147483647)/2147483647;
  const TREES = [];
  for(let i=0;i<190;i++){ const x = rnd()*W, side = rnd() < .5 ? -1 : 1, y = riverY(x) + side*(10 + rnd()*26); TREES.push({x, y, r:3 + rnd()*3.5, h:9 + rnd()*9}); }
  for(let x=20; x<W; x+=14){ const o = {s:(x - cA[0])/cDir[0]}, y = cA[1] + cDir[1]*o.s - 32; TREES.push({x:x + rnd()*4, y, r:2.6 + rnd()*1.2, h:8 + rnd()*4}); }
  const HOUSES = [];
  for(let i=0;i<26;i++) HOUSES.push({x:560 + rnd()*200, y:40 + rnd()*120, w:9 + rnd()*7, l:10 + rnd()*9, h:5 + rnd()*3, rot:rnd()*0.6 - 0.3});
  // index spațial al arborilor (celule de 20 m) — evită parcurgerea tuturor arborilor pentru fiecare punct
  const TG = 20, TGRID = new Map();
  TREES.forEach(t => { for(let gx = Math.floor((t.x - t.r)/TG); gx <= Math.floor((t.x + t.r)/TG); gx++) for(let gy = Math.floor((t.y - t.r)/TG); gy <= Math.floor((t.y + t.r)/TG); gy++){
    const k = gx + ',' + gy; if(!TGRID.has(k)) TGRID.set(k, []); TGRID.get(k).push(t); } });
  function tree(x, y){ let best = 0; const list = TGRID.get(Math.floor(x/TG) + ',' + Math.floor(y/TG)); if(!list) return 0; for(const t of list){ const d = Math.hypot(x - t.x, y - t.y); if(d < t.r){ const k = Math.sqrt(1 - (d/t.r)**2); best = Math.max(best, t.h*(0.55 + 0.45*k)); } } return best; }
  function house(x, y){ for(const h of HOUSES){ const c = Math.cos(h.rot), s = Math.sin(h.rot), u = (x - h.x)*c + (y - h.y)*s, v = -(x - h.x)*s + (y - h.y)*c;
    if(Math.abs(u) < h.w/2 && Math.abs(v) < h.l/2) return h.h + 2.5*(1 - Math.abs(u)/(h.w/2)); } return 0; }
  function surface(x, y){ const g = ground(x, y), hs = house(x, y); if(hs) return g + hs; const t = tree(x, y); return g + t; }
  function cls(x, y){ if(inRiver(x, y)) return 9; if(house(x, y)) return 6; if(tree(x, y) > 1) return 5; const c = canalZ(x, y, plain(x, y)); if(c && c.k === 'canal') return 9; return 2; }
  function kind(x, y){ const c = canalZ(x, y, plain(x, y)); return c ? c.k : (inRiver(x, y) ? 'rau' : 'camp'); }

  // culori „reale" (ca într-un ortofotoplan): parcele agricole, dig, drum, taluz betonat, apă, arbori, acoperișuri
  const PARC = [[0.47,0.58,0.25],[0.55,0.47,0.30],[0.62,0.66,0.33],[0.40,0.52,0.22]];
  const RGBK = {dig:[0.38,0.52,0.25], drum:[0.72,0.70,0.64], taluz:[0.74,0.74,0.72], canal:[0.28,0.40,0.47], rau:[0.24,0.34,0.36]};
  function rgb(x, y){
    const c = cls(x, y); if(c === 5) return [0.13,0.33,0.15]; if(c === 6) return [0.66,0.26,0.20];
    const k = kind(x, y); if(k !== 'camp') return RGBK[k];
    const o = canalOff(x, y); return PARC[Math.floor((o.s + 2000)/70) % 4];
  }
  /* „ortofotoplan" sintetic: culori reale + umbrire după relief (DSM); px = pixeli pe metru; întoarce un canvas (nord sus) */
  const _orto = {};
  function orto(px){
    px = px || 1; if(_orto[px]) return _orto[px];
    const w = Math.round(W*px), h = Math.round(H*px), c = document.createElement('canvas'); c.width = w; c.height = h;
    const ctx = c.getContext('2d'), id = ctx.createImageData(w, h);
    let sd = 7; const nz = () => (sd = (sd*16807) % 2147483647)/2147483647 - 0.5;
    for(let j=0;j<h;j++) for(let i=0;i<w;i++){
      const x = (i + 0.5)/px, y = H - (j + 0.5)/px, col = rgb(x, y), d = 1;
      const gx = (surface(x + d, y) - surface(x - d, y))/(2*d), gy = (surface(x, y + d) - surface(x, y - d))/(2*d);
      const shade = Math.max(0.55, Math.min(1.25, 0.95 + (-gx*0.7 + gy*0.7)*0.9)), n = 1 + nz()*0.12;
      const k = 4*(j*w + i); id.data[k] = Math.min(255, col[0]*255*shade*n); id.data[k+1] = Math.min(255, col[1]*255*shade*n); id.data[k+2] = Math.min(255, col[2]*255*shade*n); id.data[k+3] = 255;
    }
    ctx.putImageData(id, 0, 0); _orto[px] = c; return c;
  }
  /* decupaj de ortofotoplan la rezoluție mare: fereastra [x0, x0+w] × [y0, y0+h] metri, px pixeli/metru (nord sus) */
  function ortoPatch(x0, y0, w, h, px){
    const cw = Math.round(w*px), ch = Math.round(h*px), c = document.createElement('canvas'); c.width = cw; c.height = ch;
    const ctx = c.getContext('2d'), id = ctx.createImageData(cw, ch); let sd = 11; const nz = () => (sd = (sd*16807) % 2147483647)/2147483647 - 0.5;
    for(let j=0;j<ch;j++) for(let i=0;i<cw;i++){ const x = x0 + (i + 0.5)/px, y = y0 + h - (j + 0.5)/px, col = rgb(x, y), d = 0.3;
      const gx = (surface(x + d, y) - surface(x - d, y))/(2*d), gy = (surface(x, y + d) - surface(x, y - d))/(2*d);
      const shade = Math.max(0.5, Math.min(1.25, 0.95 + (-gx*0.7 + gy*0.7)*0.9)), n = 1 + nz()*0.18, k = 4*(j*cw + i);
      id.data[k] = Math.min(255, col[0]*255*shade*n); id.data[k+1] = Math.min(255, col[1]*255*shade*n); id.data[k+2] = Math.min(255, col[2]*255*shade*n); id.data[k+3] = 255; }
    ctx.putImageData(id, 0, 0); return c;
  }
  // culori hipsometrice
  const STOPS = [[54,[0.16,0.36,0.62]],[57,[0.22,0.55,0.35]],[60,[0.48,0.68,0.30]],[63,[0.84,0.78,0.38]],[66,[0.80,0.52,0.25]],[69,[0.62,0.36,0.22]]];
  function hyps(z){ for(let i=1;i<STOPS.length;i++) if(z <= STOPS[i][0] || i === STOPS.length-1){ const [a,ca] = STOPS[i-1], [b,cb] = STOPS[i], k = Math.max(0, Math.min(1, (z-a)/(b-a)));
    return [ca[0]+(cb[0]-ca[0])*k, ca[1]+(cb[1]-ca[1])*k, ca[2]+(cb[2]-ca[2])*k]; } }

  /* plasă three.js pentru o funcție de cotă (ground sau surface); ex = exagerare verticală; z0 = cota de referință */
  function mesh(fn, o){
    o = Object.assign({nx:200, ny:125, ex:3, z0:60, colorFn:null}, o||{});
    const n = (o.nx+1)*(o.ny+1), pos = new Float32Array(n*3), col = new Float32Array(n*3), idx = [];
    let k = 0;
    for(let j=0;j<=o.ny;j++) for(let i=0;i<=o.nx;i++){
      const x = W*i/o.nx, y = H*j/o.ny, z = fn(x, y);
      pos.set([x - W/2, (z - o.z0)*o.ex, -(y - H/2)], 3*k);
      col.set(o.colorFn ? o.colorFn(x, y, z) : hyps(z), 3*k); k++;
    }
    for(let j=0;j<o.ny;j++) for(let i=0;i<o.nx;i++){ const a = j*(o.nx+1)+i, b = a+1, c = a+o.nx+1, d = c+1; idx.push(a,c,b, b,c,d); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals();
    return g;
  }
  // lumini + cameră pentru scenele de teren
  function scene(container, o){
    o = Object.assign({camPos:[0, 420, 560]}, o||{});
    const ren = new THREE.WebGLRenderer({antialias:true, alpha:true, preserveDrawingBuffer:true}); ren.setPixelRatio(Math.min(2, devicePixelRatio||1)); container.appendChild(ren.domElement);
    const sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(40, 1, 1, 5000); cam.position.set(...o.camPos); cam.lookAt(0, 0, 0);
    sc.add(new THREE.AmbientLight(0xffffff, 0.55)); const dl = new THREE.DirectionalLight(0xffffff, 0.75); dl.position.set(-300, 500, 200); sc.add(dl);
    const ctr = new THREE.OrbitControls(cam, ren.domElement); ctr.enableDamping = true; ctr.maxPolarAngle = Math.PI*0.49;
    function rs(){ const w = container.clientWidth, h = container.clientHeight; ren.setSize(w, h); cam.aspect = w/h; cam.updateProjectionMatrix(); }
    addEventListener('resize', rs); rs();
    return {ren, sc, cam, ctr, render:() => { ctr.update(); ren.render(sc, cam); }};
  }
  window.TEREN = {W, H, ground, surface, cls, kind, rgb, house, orto, ortoPatch, tree, riverY, waterZ, canalOff, cA, cB, cDir, CANAL, hyps, mesh, scene, TREES, HOUSES, plain, rnd:() => rnd()};
})();
