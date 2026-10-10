/* Animatia „globul se desface in proiectie" — folosita la slide 3 (intro) si 4a/4b/4c.
   Pagina defineste window.TIP inainte de a incarca acest script. */
(function(){
  const {seg, lerp} = AnimUI, P = GlobeKit.P;
  const C = {
    intro:{
      title:'De la glob la hartă', sub:'Suprafața curbă a Pământului transpusă în plan — proiecția Mercator',
      proj:P.mercator, lat:[-80,80], tissot:false, camEnd:7.4,
      phases:[
        {t:0,  text:'Pământul este aproximat printr-un <b>elipsoid</b>; suprafața lui curbă nu poate fi întinsă în plan fără deformări.'},
        {t:5,  text:'Proiecția cartografică = <b>regula matematică</b> care asociază fiecărui punct (φ, λ) de pe elipsoid un punct (x, y) în plan.'},
        {t:13, text:'Rezultatul: harta. Aici, <b>proiecția Mercator</b> — conformă, folosită în navigație; suprafețele cresc spre poli.'},
        {t:19, text:'Același glob, aceeași regulă inversă: din hartă se poate reveni la coordonatele geografice.'}],
      panel:null},
    conforma:{
      title:'Proiecție conformă — Mercator', sub:'Păstrează unghiurile (forma locală); deformează suprafețele',
      proj:P.mercator, lat:[-80,80], tissot:true, camEnd:7.4,
      phases:[
        {t:0,  text:'Pe glob toate <b>cercurile Tissot</b> au aceeași rază: 6° de arc (~670 km).'},
        {t:5,  text:'Globul se desface pe un cilindru tangent la ecuator; paralelele se întind de <b>1/cos φ</b> ori.'},
        {t:13, text:'Cercurile rămân <b>cercuri</b> (unghiuri păstrate), dar cresc spre poli: la 60° suprafața este <b>de 4 ori</b> mai mare.'},
        {t:18, text:'De aceea Groenlanda (2,2 mil. km²) pare cât Africa (30,4 mil. km²). Conforma servește <b>navigației și ingineriei</b>.'}],
      table:{head:['φ','scară m','scară n','suprafață'], rows:[['0°','1,00','1,00','×1,00'],['30°','1,15','1,15','×1,33'],['60°','2,00','2,00','×4,00']]},
      note:'m = scara pe meridian, n = pe paralel; m = n ⇒ conformă', areaLbl:lat=>1/Math.pow(Math.cos(lat*Math.PI/180),2)},
    echivalenta:{
      title:'Proiecție echivalentă — sinusoidală', sub:'Păstrează suprafețele; deformează unghiurile',
      proj:P.sinusoidal, lat:[-90,90], tissot:true, camEnd:7.4,
      phases:[
        {t:0,  text:'Aceleași cercuri Tissot, egale pe glob.'},
        {t:5,  text:'Paralelele își păstrează lungimea reală (2πR·cos φ); meridianele devin <b>sinusoide</b>.'},
        {t:13, text:'Cercurile devin <b>elipse</b> (unghiuri deformate), dar <b>aria fiecăreia rămâne aceeași</b>.'},
        {t:18, text:'Echivalentele servesc hărților tematice, statisticii, <b>bilanțurilor de suprafață</b> (agricultură, fond funciar).'}],
      table:{head:['φ','scară n','m·n','suprafață'], rows:[['0°','1,00','1,00','×1,00'],['30°','1,00','1,00','×1,00'],['60°','1,00','1,00','×1,00']]},
      note:'pe meridianul central: fără deformări; spre margini elipsele se înclină', areaLbl:()=>1},
    echidistanta:{
      title:'Proiecție echidistantă — cilindrică (plate carrée)', sub:'Păstrează distanțele pe o familie de direcții (meridiane)',
      proj:P.plateCarree, lat:[-90,90], tissot:true, camEnd:7.4,
      phases:[
        {t:0,  text:'Aceleași cercuri Tissot, egale pe glob.'},
        {t:5,  text:'Meridianele se desfac <b>în lungime reală</b>: distanța ecuator–pol rămâne πR/2 (~10 000 km).'},
        {t:13, text:'Pe verticală cercurile își păstrează diametrul (<b>m = 1</b>); pe orizontală se lungesc de 1/cos φ ori.'},
        {t:18, text:'Echidistantele se folosesc unde contează <b>distanța față de un punct sau pe o direcție</b> (aviație, telecomunicații, rețele de date).'}],
      table:{head:['φ','scară m','scară n','suprafață'], rows:[['0°','1,00','1,00','×1,00'],['30°','1,00','1,15','×1,15'],['60°','1,00','2,00','×2,00']]},
      note:'m = 1 pe toate meridianele ⇒ echidistantă pe meridiane', areaLbl:lat=>1/Math.cos(lat*Math.PI/180)}
  };
  const cfg = C[window.TIP || 'conforma'];
  document.title = cfg.title;

  const T = document.createElement('div'); T.className = 'a-title'; T.innerHTML = cfg.title + '<small>' + cfg.sub + '</small>'; document.body.appendChild(T);
  if(cfg.table){
    const p = document.createElement('div'); p.className = 'a-panel'; p.style.cssText = 'left:28px;top:120px;max-width:330px';
    p.innerHTML = '<h4>Cercurile Tissot pe hartă</h4><table><tr>' + cfg.table.head.map(h=>'<th>'+h+'</th>').join('') + '</tr>' +
      cfg.table.rows.map(r=>'<tr>'+r.map(c=>'<td>'+c+'</td>').join('')+'</tr>').join('') + '</table><div style="margin-top:8px;color:var(--muted);font-size:.85em">' + cfg.note + '</div>';
    document.body.appendChild(p);
  }

  const stage = document.getElementById('stage');
  const kit = GlobeKit.create(stage, {camZ:4.2});
  const halo = GlobeKit.glow(kit, 1);
  const tis = [];
  if(cfg.tissot) for(let lon=-150; lon<=150; lon+=60) for(let lat=-60; lat<=60; lat+=30) tis.push({lon, lat, r:6});
  const G = GlobeKit.morphGlobe(kit, {proj:null, patches:[{lon0:-180, lon1:180, lat0:cfg.lat[0], lat1:cfg.lat[1], proj:cfg.proj}], tissot:tis, graticule:15});

  // optiuni
  const opts = document.createElement('div'); opts.className = 'opts';
  const mk = (txt, on, fn) => { const b = document.createElement('button'); b.textContent = txt; b.classList.toggle('on', on); b.onclick = () => { on = !on; b.classList.toggle('on', on); fn(on); }; opts.appendChild(b); };
  if(cfg.tissot) mk('Cercuri Tissot', true, v => G.setTissotVisible(v));
  mk('Rețea de meridiane/paralele', true, v => G.setGratVisible(v));
  document.body.appendChild(opts);

  // etichete de suprafata langa coloana de cercuri de la lon = 150
  const lbls = [];
  if(cfg.tissot) [-60,-30,0,30,60].forEach(lat => { const d = document.createElement('div'); d.className = 'lbl'; d.style.color = '#ffd27a'; document.body.appendChild(d); lbls.push({lat, d}); });

  // incadrare automata a hartii finale (planul hartii sta la z = 1)
  let xm = 0, ym = 0;
  for(let lon=-180; lon<=180; lon+=5) for(let lat=cfg.lat[0]; lat<=cfg.lat[1]; lat+=2){
    const q = cfg.proj(lon*Math.PI/180, lat*Math.PI/180); xm = Math.max(xm, Math.abs(q[0])); ym = Math.max(ym, Math.abs(q[1])); }
  const fitZ = () => 1 + Math.max(2*ym/(0.63*0.64), 2*xm/(0.63*kit.camera.aspect*0.66));

  const clk = AnimUI.init({duration:24, loop:true, phases:cfg.phases});
  function frame(){
    const t = clk.update();
    // rotatie: -100° -> 0 in primele 5 s; la final se roteste mai departe pana la -100 (+260) pentru bucla continua
    let viewLon = t < 5 ? lerp(-100, 0, seg(t, 0, 5)) : (t > 21 ? lerp(0, 260, seg(t, 21, 24)) : 0);
    let s = t < 5 ? 0 : (t < 13 ? seg(t, 5, 13) : (t < 18 ? 1 : (t < 21 ? 1 - seg(t, 18, 21) : 0)));
    G.set(s, {viewLon: ((viewLon + 540) % 360) - 180});
    const z = lerp(4.2, fitZ(), AnimUI.ease(Math.min(1, s*1.5))); kit.camera.position.z = z; kit.camera.position.y = -0.035*0.63*(z-1)*AnimUI.ease(s);
    halo.material.opacity = 1 - AnimUI.ease(s*2);
    lbls.forEach(o => {
      const show = s > 0.97 && cfg.areaLbl;
      o.d.style.display = show ? 'block' : 'none';
      if(show){ const p = kit.toScreen(G.place(159, o.lat, 0.01)); o.d.style.left = (p.x + 28) + 'px'; o.d.style.top = p.y + 'px';
        o.d.textContent = '×' + cfg.areaLbl(o.lat).toFixed(2).replace('.', ','); }
    });
    kit.render();
    requestAnimationFrame(frame);
  }
  frame();
})();
