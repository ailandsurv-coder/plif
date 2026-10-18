/* Studiul de caz 2 — suprafața de nivelare pentru un parc fotovoltaic pe trackere.
   Liniile trackerelor formează o suprafață: terasamentele se calculează pe toată zona, nu pe fâșii separate.
   Cifrele se citesc din data/rezultate.js și data/drenaj.js (generate de _generator). */
(function(){
  window.CURS = {nr:0, titlu:'Studiul de caz 2 — suprafața de nivelare'};
  const R = REZ.rezultate, M = REZ, B0 = REZ.balti, DR = DRENAJ, P = DR.par;
  const nf = (v, d) => Number(v).toLocaleString('ro-RO', {minimumFractionDigits:d||0, maximumFractionDigits:d||0});
  const tot = k => R[k].cut + R[k].fill, ha = v => nf(v/1e4, 2);
  const go = (id, txt) => `<button class="go" data-go="${id}">▶ ${txt || 'Animație interactivă'}</button>`;
  const ret = txt => `<div class="ret">${txt}</div>`, fix = txt => `<div class="fix">${txt}</div>`;
  const T = o => `<div class="s-pad"><div class="kick">${o.kick}</div><h2>${o.title}</h2>
    <div class="tx" style="grid-template-columns:${o.cols || '1.05fr 1fr'}"><div class="txt ${o.dense ? 'dense' : ''}">${o.body}</div><div class="vis">${o.vis || ''}</div></div></div>`;
  const note = (h, b) => `<h3>${h}</h3>${b}`;
  const RIG = DR.seg.filter(s => s.rig), rigL = RIG.reduce((a, s) => a + s.L, 0), rigV = RIG.reduce((a, s) => a + s.vol, 0), rigQ = Math.max(...RIG.map(s => s.Q));
  const IT = R.SUPR_FT.iteratii, ITX = R.SUPR_XTR_1.iteratii;
  const SC = {FASII_FT:['Fâșii separate — FT', '#ffc940'], FASII_XTR_1:['Fâșii separate — XTR 1°', '#7fd4ff'], SUPR_FT:['Suprafață continuă — FT', '#ff9d3c'], SUPR_XTR_1:['Suprafață continuă — XTR 1°', '#5be39a']};

  // ---------- grafic: volumul dupa panta de racord
  function racChart(){
    const S = M.sensibilitate, W = 980, H = 520, x0 = 120, y0 = 30, w = W - x0 - 40, hh = H - y0 - 90;
    const cats = [[null, 'fâșii\nseparate'], [0.2, 'racord\n1:5'], [0.1, 'racord\n1:10'], [0.05, 'racord\n1:20']];
    const mx = Math.max(...S.map(s => s.cut + s.fill)) * 1.12, Y = v => y0 + hh - v/mx*hh, bw = w/cats.length;
    let h = `<svg class="chart" viewBox="0 0 ${W} ${H}" style="width:100%">`;
    for(let v = 0; v <= mx; v += Math.pow(10, Math.floor(Math.log10(mx))) ) h += `<line x1="${x0}" x2="${x0 + w}" y1="${Y(v)}" y2="${Y(v)}" stroke="#22355a"/><text x="${x0 - 10}" y="${Y(v) + 7}" fill="#8a98b4" font-size="19" text-anchor="end">${nf(v)}</text>`;
    cats.forEach(([g, lab], i) => { const cx = x0 + bw*i + bw/2;
      [['FT', '#ffc940', -1], ['XTR_1', '#5be39a', 1]].forEach(([st, c, sgn]) => { const q = S.find(s => s.struct === st && s.G === g); if(!q) return; const v = q.cut + q.fill, x = cx + sgn*bw*0.2 - bw*0.17;
        h += `<rect x="${x}" y="${Y(v)}" width="${bw*0.34}" height="${y0 + hh - Y(v)}" fill="${c}" rx="4" opacity="${g === 0.1 ? 1 : 0.7}"/><text x="${x + bw*0.17}" y="${Y(v) - 8}" fill="#fff" font-size="20" font-weight="700" text-anchor="middle">${nf(v)}</text>`; });
      lab.split('\n').forEach((l, j) => h += `<text x="${cx}" y="${y0 + hh + 30 + j*24}" fill="${g === 0.1 ? '#fff' : '#b4c0d4'}" font-size="21" text-anchor="middle" font-weight="${g === 0.1 ? 700 : 400}">${l}</text>`); });
    h += `<rect x="${x0}" y="${H - 22}" width="16" height="16" fill="#ffc940"/><text x="${x0 + 24}" y="${H - 8}" fill="#b4c0d4" font-size="19">FT — tub drept</text><rect x="${x0 + 220}" y="${H - 22}" width="16" height="16" fill="#5be39a"/><text x="${x0 + 244}" y="${H - 8}" fill="#b4c0d4" font-size="19">XTR 1° / pilot</text>`;
    return h + '</svg>';
  }
  const FLUX = [['t_pb', '1', 'Teren + trackere', `${nf(M.n_puncte_eg)} de puncte, ${M.n_trackere} de trackere cu piloții lor`], ['t_idee', '2', 'Zona de lucru', `mesele + ${nf(M.BORDURA)} m de racord: ${ha(M.arie_lucru)} ha`],
    ['t_idee', '3', 'Grila de noduri', `${nf(M.N_noduri)} de noduri la ${nf(M.H)} m — necunoscuta este dz`], ['t_opt', '4', 'O singură optimizare', 'banda pe mese + racord + tuburi, volum minim'],
    ['t_dren', '5', 'Fără bălți', 'iterativ: fundul depresiunilor urcă la nivelul de deversare'], ['t_rez', '6', 'Volume și hărți', 'fâșii separate față de suprafață continuă'],
    ['t_rig', '7', 'Rigole', 'pe talvegurile care traversează zona'], ['t_topo', '8', 'Trasare și execuție', 'suprafața se dă utilajului ca model 3D']];

  const B = {
    pb:`<ul>
      <li>În studiul de caz 1 volumele s-au calculat <b>doar pe fâșia mesei</b> (2,38 m) — corect ca ordin de mărime, dar <b>neexecutabil</b> așa.</li>
      <li>Între rânduri terenul rămâne neatins: la fiecare 4,7 m apar <b>trepte</b> și <b>șanțuri</b> paralele cu rândurile.</li>
      <li>Apa se adună în șanțuri și curge pe lângă piloți: <b>eroziune la fundații</b>, bălți, colmatare. Fâșiile săpate creează <b>${B0.FASII_FT.n} de depresiuni închise</b> (${nf(B0.FASII_FT.arie)} mp) față de ${B0.EG.n} pe terenul natural.</li>
      <li>Utilajul (lama de 3–4 m, compactorul) nu poate executa benzi de 2,38 m cu margini verticale; nici trasarea, nici întreținerea (cosit, acces) nu merg bine.</li></ul>`,
    idee:`<ul>
      <li>Liniile trackerelor nu sunt independente: împreună definesc <b>suprafața terenului amenajat</b>.</li>
      <li>Necunoscuta devine <b>corecția terenului dz</b> într-o grilă de noduri la <b>${nf(M.H)} m</b> pe toată zona de lucru (mesele + ${nf(M.BORDURA)} m) — ${nf(M.N_noduri)} de noduri. Terenul final = teren existent + dz, interpolat biliniar: o suprafață continuă.</li>
      <li><b>Banda</b>: pe fiecare masă (axa și marginile, la 1 m) terenul final stă la ±${nf(M.TAU*100)} cm față de linia tubului.</li>
      <li><b>Racordul</b>: între două noduri vecine dz variază cu cel mult G·${nf(M.H)} m — panta lucrărilor ≤ <b>1:10</b>. Nu mai există trepte.</li>
      <li><b>Bordura</b>: la marginea zonei dz = 0 — lucrările se închid pe terenul natural.</li>
      <li><b>Fără bălți</b>: nicio depresiune închisă în zona de lucru.</li></ul>`,
    opt:`<ul>
      <li>Tot ce e mai sus intră într-o <b>singură problemă de programare liniară</b> pe toată zona: dz în ${nf(M.N_noduri)} de noduri + parametrii tuburilor celor ${M.n_trackere} de trackere.</li>
      <li>Obiectivul: <b>min Σ |dz| · ${nf(M.H*M.H)} m²</b> — cel mai mic volum care respectă toate condițiile.</li>
      <li>Banda e „moale”: o abatere s-ar plăti cu o penalizare uriașă — rămân doar ${IT[IT.length - 1].viol} puncte de pe marginea ridicării, unde terenul nu se poate atinge.</li>
      <li><b>Drenajul, iterativ</b>: după fiecare rezolvare se caută depresiunile închise; pentru nodurile din ele se impune dz ≥ nivelul de deversare − teren, apoi se rezolvă din nou.</li></ul>
      <table class="tbl2" style="font-size:21px;margin-top:6px"><tr><th>Iterația</th>${IT.slice(0, 5).map(q => `<th>${q.it}</th>`).join('')}</tr>
      <tr><td>Volum FT, mc</td>${IT.slice(0, 5).map(q => `<td>${nf(q.vol)}</td>`).join('')}</tr><tr><td>Noduri în bălți</td>${IT.slice(0, 5).map(q => `<td>${q.balti}</td>`).join('')}</tr></table>`,
    rez:`<table class="tbl2"><tr><th></th><th>Săpătură mc</th><th>Umplutură mc</th><th>Total mc</th><th>Teren atins</th><th>Bălți în zonă</th></tr>
      ${[['FASII_FT', 'FASII_FT'], ['FASII_XTR_1', null], ['SUPR_FT', 'SUPR_FT'], ['SUPR_XTR_1', 'SUPR_XTR_1']].map(([k, b]) => `<tr class="${k.indexOf('SUPR') === 0 ? 'hl' : ''}"><td style="color:${SC[k][1]}">${SC[k][0]}</td><td>${nf(R[k].cut)}</td><td>${nf(R[k].fill)}</td><td><b>${nf(tot(k))}</b></td><td>${ha(R[k].a_cut + R[k].a_fill)} ha</td><td>${b ? B0[b].n + ' · ' + nf(B0[b].arie) + ' mp' : '—'}</td></tr>`).join('')}</table>
      ${ret(`Suprafața continuă costă mai mult pământ decât fâșiile — FT: <b>${nf(tot('FASII_FT'))} → ${nf(tot('SUPR_FT'))} mc</b> — pentru că racordurile se întind între rânduri și bălțile se umplu. În schimb rezultatul <b>se poate executa</b>, nu lasă trepte și nu ține apa. Cu XTR 1° suprafața rămâne aproape neatinsă: ${nf(tot('SUPR_XTR_1'))} mc, aproape toți din umplerea depresiunilor naturale.`)}`,
    rac:`<ul><li>Panta de racord G spune cât de lin trec lucrările de la mese spre terenul natural.</li>
      <li><b>1:5</b> — volum mai mic, dar taluzuri scurte, greu de compactat la margini.</li>
      <li><b>1:10</b> — varianta adoptată: lama lucrează pe suprafețe late, apa curge lin.</li>
      <li><b>1:20</b> — aproape o platformă: foarte neted, dar mai mult pământ; cu bordura de ${nf(M.BORDURA)} m nici nu mai pot fi umplute toate bălțile de lângă margine (racordul nu „ajunge” la terenul natural).</li>
      <li>Fâșiile separate sunt cazul limită: racord vertical la marginea mesei.</li></ul>`,
    dren:`<ul><li>Fâșiile săpate devin <b>șanțuri fără ieșire</b>: ${B0.FASII_FT.n} de bălți, ${nf(B0.FASII_FT.arie)} mp, ${nf(B0.FASII_FT.vol)} mc de apă reținută.</li>
      <li>Suprafața continuă e optimizată cu condiția <b>„fără bălți”</b>: rămân ${B0.SUPR_FT.n} (FT), respectiv ${B0.SUPR_XTR_1.n} (XTR) depresiuni mici, pe marginea zonei.</li>
      <li>Scurgerea D8 pe suprafața finală dă <b>talvegurile</b>; pe cele cu bazin ≥ ${nf(P.A_RIGOLA, 1)} ha care traversează zona se propun <b>rigole</b>: ${RIG.length} segmente, ${nf(rigL)} m.</li>
      <li>Suprafața continuă are încă un avantaj: apa curge <b>în pânză</b>, nu concentrat în benzi de-a lungul rândurilor.</li></ul>`,
    rig:`<p><b>Q = m · Φ · i · A</b> (formula rațională, STAS 1846-2) · m = ${nf(P.M_RET, 1)}, Φ = ${nf(P.PHI, 2)} · i la durata tc = 10 min + Kirpich, frecvența ${P.FREC} — <b>ipoteză i(10 min) ≈ 200 l/s·ha</b>, de înlocuit cu STAS 9470-73 pentru amplasament.</p>
      <p>Secțiune trapezoidală înierbată, b = ${nf(P.B_RIG, 2)} m, taluz 1:${nf(P.M_TAL, 1)}, n = ${nf(P.N_MAN, 3)}; adâncimea normală (Manning) + garda ${nf(P.GARDA*100)} cm, minim 0,40 m; peste ${nf(P.V_ADM, 1)} m/s — protecție.</p>
      ${ret(`<b>${RIG.length} segmente, ${nf(rigL)} m</b>, ${nf(rigV)} mc de săpătură; debitul maxim ${nf(rigQ)} l/s, pe talvegul principal.`)}`,
    ech:`<ul><li>Săpătura se transportă afânată (× ${nf(M.F_AFANARE, 1)}); pe suprafața FT umplutura (${nf(R.SUPR_FT.fill)} mc) depășește săpătura × 1,2 (${nf(R.SUPR_FT.cut*1.2)} mc) — ar trebui adus pământ.</li>
      <li>Varianta <b>echilibrată</b> adaugă o singură condiție în LP: <b>1,2 × săpătură = umplutură</b>. Rezultat FT: ${nf(R.SUPR_FT_ECH.cut)} / ${nf(R.SUPR_FT_ECH.fill)} mc, total ${nf(tot('SUPR_FT_ECH'))} mc — <b>fără aport și fără transport în afara șantierului</b>.</li>
      <li><b>XTR 1°</b>: aproape tot volumul e umplutură (bălțile naturale). Forțat la echilibru, optimizatorul ar trebui să sape și ar lăsa din nou bălți (${R.SUPR_XTR_1_ECH.iteratii[R.SUPR_XTR_1_ECH.iteratii.length - 1].balti} de noduri) — <b>nu e o soluție bună</b>.</li>
      <li>Soluția corectă la XTR: pământul vine din <b>rigole</b> — ${nf(rigV)} mc de săpătură față de ${nf(R.SUPR_XTR_1.fill)} mc de umplutură necesară. Bilanțul se închide pe șantier, cu drenajul inclus.</li></ul>`,
    topo:`<ul><li><b>Suprafața se livrează ca model 3D</b> (TIN / LandXML / DXF 3D) și se încarcă în utilajul cu GNSS (machine control): lama urmărește direct proiectul. Fâșiile separate nu se pot executa așa.</li>
      <li><b>Trasarea clasică</b>: grilă de puncte la 10 m cu cota de proiect + axele piloților cu cota capului (tub + reveal).</li>
      <li><b>Controlul</b>: ridicarea după nivelare se compară cu suprafața de proiect, celulă cu celulă (toleranța ±5 cm pe Z), apoi se verifică banda de ±15 cm la fiecare pilot.</li>
      <li><b>Cubajul executat</b>: suprafață față de suprafață — același calcul ca proiectul, deci fără discuții la decontare.</li></ul>`,
    lim:`<ul><li>Terenul: ridicarea din aprilie 2026, zona critică cea mai mare a parcului (${ha(M.arie_teren)} ha, ${M.n_trackere} de trackere).</li>
      <li>Grila de 2 m netezește detaliile sub 2 m; banda se verifică pe mese la fiecare metru, pe axă și pe margini.</li>
      <li>Racordul 1:10 și bordura de ${nf(M.BORDURA)} m sunt alegeri de proiectare; panta maximă a terenului final nu e limitată separat (terenul e deja lin).</li>
      <li>Bălțile se elimină prin umplere; varianta cu rigolă de evacuare (săpătură în loc de umplutură) nu e inclusă în optimizare.</li>
      <li>Drenaj: intensitatea ploii e o ipoteză; Φ = ${nf(P.PHI, 2)}; bazinele sunt limitate la zona ridicată. Predimensionare, nu proiect de execuție.</li></ul>`,
    concl:`<ul><li>Trackerele unei zone formează o <b>suprafață</b>, iar terasamentele trebuie gândite pe suprafață, nu pe linii.</li>
      <li>Suprafața continuă: FT <b>${nf(tot('SUPR_FT'))} mc</b> (față de ${nf(tot('FASII_FT'))} pe fâșii), XTR 1° <b>${nf(tot('SUPR_XTR_1'))} mc</b> — puțin mai mult pământ, dar <b>fără trepte, fără șanțuri, fără bălți</b>.</li>
      <li>Optimizarea rămâne liniară, deci exactă: o singură problemă pe toată zona, rezolvată în câteva minute.</li>
      <li>Drenajul intră direct în optimizare (condiția „fără bălți”), iar rigolele se dimensionează pe suprafața finală.</li>
      <li>Rezultatul e un model 3D care merge direct în utilaj și în controlul topo.</li></ul>`
  };

  window.S = [
    {id:'titlu', t:'Titlu', html:`<div class="title-bg"></div><iframe data-src="anim/00_deco.html" class="deco" style="position:absolute;inset:auto;right:30px;top:170px;width:900px;height:700px;pointer-events:none;background:transparent"></iframe>
      <div class="s-pad" style="right:860px"><div class="kick">Studiul de caz 2 · KondorCAD LandSURV</div><h1>Suprafața de nivelare pentru un parc fotovoltaic</h1>
        <p style="font-size:32px;margin-top:22px">Liniile trackerelor formează o suprafață — terasamente continue, fără șanțuri, cu drenaj</p>
        <p class="muted" style="font-size:24px;margin-top:30px">← → navigare · F ecran complet · N note · Spațiu = pauză</p></div>`},
    {id:'t_pb', t:'Problema', html:T({kick:'Problema', title:'De ce nu e bine să sapi doar sub mese', cols:'1.1fr 0.9fr', body:B.pb + go('a_sec', 'Secțiune reală: fâșii față de suprafață'),
      vis:`<div class="card"><h3>Fâșii separate — FT</h3><table class="tbl"><tr><td>Volum</td><td>${nf(tot('FASII_FT'))} mc</td></tr><tr><td>Lățimea benzilor</td><td>2,38 m</td></tr><tr><td>Distanța dintre ele</td><td>4,7 m</td></tr><tr><td>Bălți create</td><td style="color:#ff8a8a">${B0.FASII_FT.n} (${nf(B0.FASII_FT.arie)} mp)</td></tr><tr><td>Bălți pe terenul natural</td><td>${B0.EG.n}</td></tr></table></div>`}), note:note('Problema', B.pb)},
    {id:'a_sec', t:'Secțiune — animație', anim:'anim/01_sectiune.html', note:note('Secțiunea', B.pb)},
    {id:'t_idee', t:'Ideea', html:T({kick:'Ideea', title:'O suprafață, nu linii', cols:'1.15fr 0.85fr', dense:true, body:B.idee,
      vis:`<div class="card"><h3>Problema de optimizare</h3><p class="c" style="font-family:Consolas,monospace;font-size:22px;line-height:1.65;color:var(--cyan)">min Σ |dz<sub>n</sub>| · H²<br>D<sub>k</sub>(s) − τ ≤ EG(p) + dz(p) ≤ D<sub>k</sub>(s) + τ<br>|dz<sub>i</sub> − dz<sub>j</sub>| ≤ G · H<br>dz = 0 la marginea zonei<br>FT: D liniar · XTR: |Δpantă| ≤ tan θ<br>fără depresiuni închise</p>
        <p class="c muted">τ = ${nf(M.TAU, 2)} m · H = ${nf(M.H)} m · G = 1:10</p></div>`}), note:note('Ideea', B.idee)},
    {id:'t_flux', t:'Fluxul', html:`<div class="s-pad"><div class="kick">Fluxul de lucru</div><h2>Fluxul complet, în 8 pași</h2>
      <div class="flux">${FLUX.map(([id, n, h, p]) => `<div class="card" data-go="${id}"><div class="n">${n}</div><h3>${h}</h3><p>${p}</p></div>`).join('')}</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-top:24px">${Object.keys(SC).map(k => `<div class="card" style="padding:12px 20px"><div style="color:${SC[k][1]};font-size:21px;font-weight:700">${SC[k][0]}</div><div style="font-size:40px;font-weight:800">${nf(tot(k))} <span class="muted" style="font-size:20px">mc</span></div></div>`).join('')}</div></div>`},
    {id:'t_opt', t:'Optimizarea', html:T({kick:'Optimizarea', title:'O singură optimizare pe toată zona', cols:'1.1fr 0.9fr', dense:true, body:B.opt + go('a_3d', 'Suprafața în 3D'),
      vis:`<div class="card"><h3>Dimensiunea problemei</h3><table class="tbl"><tr><td>Noduri (dz)</td><td>${nf(M.N_noduri)}</td></tr><tr><td>Trackere</td><td>${M.n_trackere}</td></tr><tr><td>Zona de lucru</td><td>${ha(M.arie_lucru)} ha</td></tr><tr><td>Iterații de drenaj FT / XTR</td><td>${IT.length} / ${ITX.length}</td></tr><tr><td>Timp pe rezolvare</td><td>${nf(IT[0].t)} s</td></tr></table></div>`}), note:note('Optimizarea', B.opt)},
    {id:'a_3d', t:'3D — animație', anim:'anim/02_suprafata3d.html', note:note('Suprafața 3D', B.idee)},
    {id:'t_rez', t:'Rezultate', html:`<div class="s-pad"><div class="kick">Rezultate</div><h2>Fâșii separate față de suprafață continuă</h2><div class="txt">${B.rez}</div>${go('a_harta', 'Harta lucrărilor + comparator')}</div>`, note:note('Rezultate', B.rez)},
    {id:'a_harta', t:'Harta — animație', anim:'anim/03_harta.html', note:note('Rezultate', B.rez)},
    {id:'t_rac', t:'Panta de racord', html:T({kick:'Sensibilitate', title:'Panta de racord — cât de lin se întind lucrările', cols:'0.85fr 1.15fr', body:B.rac + go('a_rac', 'Aceeași secțiune, patru racorduri'),
      vis:`<div class="card" style="padding:18px 22px"><h3 style="font-size:28px">Volum total pe zonă, mc</h3>${racChart()}</div>`}), note:note('Racordul', B.rac)},
    {id:'a_rac', t:'Racord — animație', anim:'anim/01_sectiune.html#racord', note:note('Racordul', B.rac)},
    {id:'t_dren', t:'Drenaj', html:T({kick:'Drenaj', title:'Drenajul intră în optimizare', cols:'1.1fr 0.9fr', dense:true, body:B.dren + go('a_dren', 'Ploaie: fâșii față de suprafață'),
      vis:`<div class="card"><h3>Depresiuni închise în zona de lucru</h3><table class="tbl2" style="font-size:22px"><tr><th></th><th>nr.</th><th>arie mp</th><th>apă mc</th></tr>
        ${[['EG', 'Teren existent'], ['FASII_FT', 'Fâșii separate FT'], ['SUPR_FT', 'Suprafață FT'], ['SUPR_XTR_1', 'Suprafață XTR 1°']].map(([k, l]) => `<tr><td>${l}</td><td>${B0[k].n}</td><td>${nf(B0[k].arie)}</td><td>${nf(B0[k].vol)}</td></tr>`).join('')}</table></div>`}), note:note('Drenaj', B.dren)},
    {id:'a_dren', t:'Drenaj — animație', anim:'anim/05_drenaj.html', note:note('Drenaj', B.dren)},
    {id:'t_rig', t:'Rigole', html:T({kick:'Drenaj · calcul', title:'Rigolele pe suprafața finală', cols:'1.15fr 0.85fr', dense:true, body:B.rig + go('a_rig', 'Calculul unei rigole'),
      vis:`<div class="card"><h3>Cele mai încărcate rigole</h3><table class="tbl2" style="font-size:20px"><tr><th>A ha</th><th>Q l/s</th><th>S %</th><th>H m</th><th>v m/s</th></tr>
        ${RIG.slice().sort((a, b) => b.Q - a.Q).slice(0, 8).map(s => `<tr><td>${nf(s.A, 2)}</td><td>${nf(s.Q)}</td><td>${nf(s.S*100, 1)}</td><td>${nf(s.H, 2)}</td><td style="color:${s.prot ? '#ff8a8a' : '#5be39a'}">${nf(s.v, 2)}</td></tr>`).join('')}</table></div>`}), note:note('Rigole', B.rig)},
    {id:'a_rig', t:'Rigola — calculator', anim:'anim/06_rigola.html', note:note('Rigole', B.rig)},
    {id:'t_ech', t:'Echilibrarea', html:T({kick:'Bilanț', title:'Echilibrarea: fără pământ adus, fără pământ dus', cols:'1.2fr 0.8fr', body:B.ech,
      vis:`<div class="card"><h3>Suprafață FT</h3><table class="tbl"><tr><td></td><td>simplă</td><td>echilibrată</td></tr><tr><td>Săpătură</td><td>${nf(R.SUPR_FT.cut)}</td><td>${nf(R.SUPR_FT_ECH.cut)}</td></tr><tr><td>Umplutură</td><td>${nf(R.SUPR_FT.fill)}</td><td>${nf(R.SUPR_FT_ECH.fill)}</td></tr><tr><td>Total, mc</td><td><b>${nf(tot('SUPR_FT'))}</b></td><td><b>${nf(tot('SUPR_FT_ECH'))}</b></td></tr></table></div>`}), note:note('Echilibrare', B.ech)},
    {id:'t_topo', t:'Topografia', html:T({kick:'Execuție', title:'Trasare, utilaje și control', cols:'1.15fr 0.85fr', dense:true, body:B.topo,
      vis:`<div class="card"><h3>Ce livrează topograful</h3><p class="c">① DTM-ul terenului existent<br>② suprafața de proiect (model 3D)<br>③ grila de trasare la 10 m + piloții<br>④ ridicarea după nivelare<br>⑤ cubajul executat, suprafață față de suprafață</p></div>`}), note:note('Topografie', B.topo)},
    {id:'t_lim', t:'Ipoteze', html:`<div class="s-pad"><div class="kick">Onestitate</div><h2>Ipoteze și limite</h2><div class="txt dense">${B.lim}</div></div>`, note:note('Limite', B.lim)},
    {id:'t_concl', t:'Concluzii', html:`<div class="s-pad"><div class="kick">Concluzii</div><h2>Concluzii</h2><div class="tx" style="grid-template-columns:1.2fr 0.8fr"><div class="txt">${B.concl}</div>
      <div class="vis">${['FASII_FT', 'SUPR_FT', 'SUPR_XTR_1'].map(k => `<div class="card" style="padding:14px 22px"><div style="color:${SC[k][1]};font-size:24px;font-weight:700">${SC[k][0]}</div><div class="big" style="font-size:60px">${nf(tot(k))} <span style="font-size:28px">mc</span></div></div>`).join('')}</div></div></div>`}
  ];
})();
