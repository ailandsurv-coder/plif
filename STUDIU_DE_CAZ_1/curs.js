/* Studiul de caz 1 — analiza terasamentelor pentru un parc fotovoltaic pe trackere (varianta pentru site).
   Flux complet pe suprafață: teren existent → layout → structură (FT / XTR, unghi) → suprafața de nivelare pe toată zona
   (bandă pe mese, racord, fără bălți) → volume și bilanț → drenaj și rigole → execuție și control.
   Cifrele se citesc din data/rezultate.js și data/drenaj.js (generate de _generator, varianta EW_SITE=1). */
(function(){
  window.CURS = {nr:0, titlu:'Studiul de caz 1 — analiza terasamentelor'};
  const R = REZ.rezultate, M = REZ, B0 = REZ.balti, DR = DRENAJ, P = DR.par, U = REZ.unghi;
  const nf = (v, d) => Number(v).toLocaleString('ro-RO', {minimumFractionDigits:d||0, maximumFractionDigits:d||0});
  const tot = k => R[k].cut + R[k].fill, ha = v => nf(v/1e4, 2), R1 = Math.PI/180;
  const go = (id, txt) => `<button class="go" data-go="${id}">▶ ${txt || 'Animație interactivă'}</button>`;
  const ret = txt => `<div class="ret">${txt}</div>`, fix = txt => `<div class="fix">${txt}</div>`;
  const T = o => `<div class="s-pad"><div class="kick">${o.kick}</div><h2>${o.title}</h2>
    <div class="tx" style="grid-template-columns:${o.cols || '1.05fr 1fr'}"><div class="txt ${o.dense ? 'dense' : ''}">${o.body}</div><div class="vis">${o.vis || ''}</div></div></div>`;
  const note = (h, b) => `<h3>${h}</h3>${b}`;
  const RIG = DR.seg.filter(s => s.rig), rigL = RIG.reduce((a, s) => a + s.L, 0), rigV = RIG.reduce((a, s) => a + s.vol, 0), rigQ = Math.max(...RIG.map(s => s.Q));
  const IT = R.SUPR_FT.iteratii, u = k => U.find(q => q.unghi === k);
  const SC = {SUPR_FT:['FT — tub drept', '#ffc940'], SUPR_XTR_1:['XTR — 1° pe pilot', '#5be39a']};

  // ---------- grafic: volumul dupa unghiul de frangere (structura / cu drenaj)
  function unghiChart(){
    const W = 980, H = 540, x0 = 110, y0 = 30, w = W - x0 - 40, hh = H - y0 - 90, lo = 10, hi = 5000;
    const X = a => x0 + a/2*w, Y = v => y0 + hh - (Math.log10(Math.max(lo, v)) - 1)/(Math.log10(hi) - 1)*hh;
    let h = `<svg class="chart" viewBox="0 0 ${W} ${H}" style="width:100%">`;
    [10, 30, 100, 300, 1000, 3000].forEach(v => h += `<line x1="${x0}" x2="${x0 + w}" y1="${Y(v)}" y2="${Y(v)}" stroke="#22355a"/><text x="${x0 - 10}" y="${Y(v) + 7}" fill="#8a98b4" font-size="20" text-anchor="end">${nf(v)}</text>`);
    U.forEach(q => h += `<line x1="${X(q.unghi)}" x2="${X(q.unghi)}" y1="${y0}" y2="${y0 + hh}" stroke="#22355a"/><text x="${X(q.unghi)}" y="${y0 + hh + 30}" fill="#8a98b4" font-size="20" text-anchor="middle">${String(q.unghi).replace('.', ',')}°</text>`);
    h += `<rect x="${X(0.75)}" y="${y0}" width="${X(2) - X(0.75)}" height="${hh}" fill="rgba(91,227,154,.08)"/><text x="${X(1.375)}" y="${y0 + 26}" fill="#5be39a" font-size="19" text-anchor="middle">plaja pieței: 0,75–2°</text>`;
    h += `<text x="${x0 + w/2}" y="${H - 10}" fill="#b4c0d4" font-size="21" text-anchor="middle">unghiul maxim de frângere la pilot (0° = FT, tub drept)</text>`;
    [['vol_structura', '#3fd0ff', 'cerut de structură'], ['tot', '#ffc940', 'cu umplerea bălților']].forEach(([k, c, lab]) => {
      const v = q => k === 'tot' ? q.cut + q.fill : q[k];
      h += `<path d="${U.map((q, i) => (i ? 'L' : 'M') + X(q.unghi).toFixed(1) + ' ' + Y(v(q)).toFixed(1)).join(' ')}" fill="none" stroke="${c}" stroke-width="4"/>`;
      U.forEach(q => h += `<circle cx="${X(q.unghi)}" cy="${Y(v(q))}" r="6" fill="${c}"/>`);
      U.filter(q => [0, 0.25, 1].includes(q.unghi) && !(q.unghi === 0 && k === 'vol_structura')).forEach(q => h += `<text x="${X(q.unghi) + 10}" y="${Y(v(q)) + (k === 'tot' ? -10 : 26)}" fill="#fff" font-size="20" font-weight="700">${nf(v(q))}</text>`);
      const l = U[U.length - 1]; h += `<text x="${X(2) - 6}" y="${Y(v(l)) + (k === 'tot' ? -14 : 26)}" fill="${c}" font-size="20" font-weight="700" text-anchor="end">${lab}</text>`; });
    return h + '</svg>';
  }
  // ---------- grafic: volumul dupa panta de racord
  function racChart(){
    const S = M.sensibilitate, W = 980, H = 470, x0 = 120, y0 = 30, w = W - x0 - 40, hh = H - y0 - 90;
    const cats = [[0.2, 'racord 1:5'], [0.1, 'racord 1:10'], [0.05, 'racord 1:20']];
    const mx = Math.max(...S.map(s => s.cut + s.fill))*1.12, Y = v => y0 + hh - v/mx*hh, bw = w/cats.length;
    let h = `<svg class="chart" viewBox="0 0 ${W} ${H}" style="width:100%">`;
    for(let v = 0; v <= mx; v += 1000) h += `<line x1="${x0}" x2="${x0 + w}" y1="${Y(v)}" y2="${Y(v)}" stroke="#22355a"/><text x="${x0 - 10}" y="${Y(v) + 7}" fill="#8a98b4" font-size="19" text-anchor="end">${nf(v)}</text>`;
    cats.forEach(([g, lab], i) => { const cx = x0 + bw*i + bw/2;
      [['FT', '#ffc940', -1], ['XTR_1', '#5be39a', 1]].forEach(([st, c, sgn]) => { const q = S.find(s => s.struct === st && s.G === g); if(!q) return; const v = q.cut + q.fill, x = cx + sgn*bw*0.2 - bw*0.17;
        h += `<rect x="${x}" y="${Y(v)}" width="${bw*0.34}" height="${y0 + hh - Y(v)}" fill="${c}" rx="4" opacity="${g === 0.1 ? 1 : 0.7}"/><text x="${x + bw*0.17}" y="${Y(v) - 8}" fill="#fff" font-size="20" font-weight="700" text-anchor="middle">${nf(v)}</text>`; });
      h += `<text x="${cx}" y="${y0 + hh + 32}" fill="${g === 0.1 ? '#fff' : '#b4c0d4'}" font-size="22" text-anchor="middle" font-weight="${g === 0.1 ? 700 : 400}">${lab}</text>`; });
    h += `<rect x="${x0}" y="${H - 24}" width="16" height="16" fill="#ffc940"/><text x="${x0 + 24}" y="${H - 10}" fill="#b4c0d4" font-size="19">FT — tub drept</text><rect x="${x0 + 220}" y="${H - 24}" width="16" height="16" fill="#5be39a"/><text x="${x0 + 244}" y="${H - 10}" fill="#b4c0d4" font-size="19">XTR 1° / pilot</text>`;
    return h + '</svg>';
  }
  const FLUX = [['t_eg', '1', 'Terenul existent', `${nf(M.n_puncte_eg)} de puncte → TIN → grilă`], ['t_lay', '2', 'Layout și piloți', `${M.n_trackere} de trackere, ${nf(M.n_piloti)} de piloți`],
    ['t_str', '3', 'Structura', 'FT: tub drept · XTR: frângere ≤ θ la fiecare pilot'], ['t_supr', '4', 'Suprafața de nivelare', `o singură optimizare pe ${ha(M.arie_lucru)} ha`],
    ['t_rac', '5', 'Racordul', 'cât de lin se întind lucrările'], ['t_rez', '6', 'Volume și bilanț', 'hărți, echilibrare, factor de afânare'],
    ['t_dren', '7', 'Drenaj', 'fără bălți, talveguri, rigole dimensionate'], ['t_topo', '8', 'Execuție și control', 'model 3D pentru utilaj, trasare, as-built']];

  const B = {
    ce:`<ul>
      <li>O analiză de terasamente compară <b>două suprafețe 3D</b>: <b>terenul existent (EG)</b> și <b>suprafața proiectată (FG)</b>.</li>
      <li>În fiecare punct <b>ΔZ = FG − EG</b>: negativ = săpătură, pozitiv = umplutură. Volumul este suma ΔZ × aria celulei.</li>
      <li>Pământul își schimbă volumul: în banc → afânat (× ≈ 1,2) → compactat (× ≈ 0,9). Echilibrarea urmărește ca săpătura să acopere umplutura, pe distanțe mici.</li>
      <li>La un parc pe trackere, suprafața proiectată se construiește din <b>liniile tuburilor</b>: sub fiecare masă terenul trebuie să cadă într-o bandă de toleranță, iar între rânduri suprafața se racordează lin.</li></ul>`,
    eg:`<ul><li>Ridicarea topo din <b>aprilie 2026</b>, înainte de lucrări: <b>${nf(M.n_puncte_eg)} de puncte</b> pe ${nf(M.arie_teren/1e4, 1)} ha — în medie un punct la ${nf(M.arie_teren/M.n_puncte_eg)} m², mai dese pe liniile de ridicare.</li>
      <li>Modelul <b>TIN</b> (triangulație Delaunay) → grilă de 1 m pentru hărți și volume, grilă de 2 m pentru optimizare.</li>
      <li>Cote între ${nf(M.zmin, 1)} și ${nf(M.zmax, 1)} m: o zonă cu pante mici pe direcția rândurilor, traversată de un talveg.</li></ul>
      ${fix('Modelul trebuie să fie <b>DTM</b> (teren curat), nu DSM: vegetația sau structurile deja montate ridică artificial terenul și umflă volumele. Pe acest parc, un DEM de dronă ulterior le conținea — fără separarea lor volumele ieșeau mai mari cu 14 %.')}`,
    lay:`<ul><li><b>${M.n_trackere} de trackere</b> cu tub drept (rânduri N–S), lungimi ${nf(M.L_min)}–${nf(M.L_max)} m, în total ${nf(M.lungime_totala/1000, 2)} km.</li>
      <li><b>${nf(M.n_piloti)} de piloți</b>, din arhiva de trasare, potriviți pe axe; deschideri ${nf(M.pas_min, 1)}–${nf(M.pas_max, 1)} m, mediana ${nf(M.pas_med, 2)} m.</li>
      <li>Masa trackerului are <b>2,38 m</b> lățime; rândurile sunt la 4,7 m.</li></ul>
      ${ret('La fiecare pilot înălțimea deasupra terenului (reveal) trebuie să rămână într-o fereastră fixă — aici <b>±15 cm</b> față de nominal. Este restricția de bază a întregii analize.')}`,
    str:`<ul><li><b>FT — tub drept</b>: tot trackerul e o singură dreaptă (cota și panta, max 8,5 %).</li>
      <li><b>XTR — urmărește terenul</b>: tubul se frânge la fiecare pilot cu cel mult <b>θ</b> — o pantă pe fiecare deschidere, |Δpantă| ≤ tan θ (panta max 15 %).</li>
      <li>La θ = 1° și o deschidere de ${nf(M.pas_med, 2)} m, tubul se abate cu <b>${nf(M.pas_med*Math.tan(R1)*100)} cm</b> pe deschidere: rază de curbură ≈ <b>${nf(M.pas_med/R1)} m</b>.</li>
      <li>Comparația FT / XTR = <b>aceeași optimizare</b>, cu altă libertate a tubului.</li></ul>`,
    unghi:`<p><b>1° pe pilot este o ipoteză realistă</b>, la mijlocul plajei de pe piață:</p>
      <table class="tbl2" style="font-size:21px"><tr><th>Sursă</th><th>Frângere între piloți</th></tr>
      <tr><td>Brevete trackere „terrain following”</td><td>≈ 0,25–0,75° / deschidere</td></tr><tr><td>Soltec SF4x4 (articulație cardanică)</td><td>≈ 0,8°</td></tr>
      <tr><td>Plaja uzuală a pieței</td><td>1,5–1,7°</td></tr><tr><td>PVH Terrain Response</td><td>până la 2°</td></tr></table>
      ${ret(`Pe suprafața de nivelare, volumul cerut de structură scade de la <b>${nf(u(0).vol_structura)} mc</b> (FT) la <b>${nf(u(0.25).vol_structura)} mc</b> la 0,25° și <b>${nf(u(1).vol_structura)} mc</b> la 1°. Peste 0,5° rezultatul practic nu se mai schimbă; ce rămâne e umplerea bălților naturale (~${nf(u(1).cut + u(1).fill - u(1).vol_structura)} mc), independentă de structură.`)}`,
    supr:`<ul>
      <li>Trackerele unei zone formează împreună <b>suprafața terenului amenajat</b>; terasamentele se proiectează pe această suprafață, nu masă cu masă.</li>
      <li>Necunoscuta este <b>corecția terenului dz</b> într-o grilă de noduri la <b>${nf(M.H)} m</b> pe toată zona de lucru (mesele + ${nf(M.BORDURA)} m): ${nf(M.N_noduri)} de noduri. Terenul final = EG + dz, interpolat biliniar.</li>
      <li><b>Banda</b>: pe fiecare masă, pe axă și pe margini, la fiecare metru, terenul final stă la ±${nf(M.TAU*100)} cm față de linia tubului.</li>
      <li><b>Racordul</b>: între noduri vecine |dz<sub>i</sub> − dz<sub>j</sub>| ≤ G · ${nf(M.H)} m, cu G = 1:10 — lucrări line, executabile cu lama.</li>
      <li><b>Bordura</b>: la marginea zonei dz = 0 — lucrările se închid pe terenul natural.</li>
      <li><b>Fără bălți</b>: nicio depresiune închisă în zona de lucru (iterativ, vezi drenajul).</li>
      <li>Totul într-o <b>singură problemă de programare liniară</b> (HiGHS), împreună cu tuburile celor ${M.n_trackere} de trackere: optimul global, în câteva secunde pe rezolvare.</li></ul>`,
    rac:`<ul><li>Panta de racord spune cât de lin trec lucrările de la mese spre terenul natural.</li>
      <li><b>1:5</b> — volum mai mic, dar taluzuri scurte, greu de compactat.</li>
      <li><b>1:10</b> — varianta adoptată: suprafețe late pentru lamă, scurgere lină.</li>
      <li><b>1:20</b> — aproape o platformă: foarte neted, dar mult mai mult pământ; cu bordura de ${nf(M.BORDURA)} m nici nu mai pot fi umplute toate bălțile de lângă margine.</li></ul>`,
    rez:`<table class="tbl2"><tr><th>Suprafața de nivelare</th><th>Săpătură mc</th><th>Umplutură mc</th><th>Total mc</th><th>Teren atins</th><th>Adâncime max. s / u</th></tr>
      ${Object.keys(SC).map(k => `<tr class="${k === 'SUPR_XTR_1' ? 'hl' : ''}"><td style="color:${SC[k][1]}">${SC[k][0]}</td><td>${nf(R[k].cut)}</td><td>${nf(R[k].fill)}</td><td><b>${nf(tot(k))}</b></td><td>${ha(R[k].a_cut + R[k].a_fill)} ha</td><td>${nf(R[k].h_cut, 2)} / ${nf(R[k].h_fill, 2)} m</td></tr>`).join('')}</table>
      ${ret(`Pe aceeași zonă și cu aceleași condiții, structura care urmărește terenul reduce lucrările de la <b>${nf(tot('SUPR_FT'))} mc</b> la <b>${nf(tot('SUPR_XTR_1'))} mc</b>. La XTR aproape tot ce rămâne e umplutură: depresiunile închise ale terenului natural, care trebuie eliminate oricum.`)}`,
    bil:`<ul><li>Bilanțul se face în mc în banc; săpătura se transportă afânată (× ${nf(M.F_AFANARE, 1)}).</li>
      <li><b>FT</b>: umplutura (${nf(R.SUPR_FT.fill)} mc) depășește săpătura × 1,2 (${nf(R.SUPR_FT.cut*1.2)} mc) — ar trebui adus pământ.</li>
      <li><b>FT echilibrat</b>: o singură condiție în plus în LP, <b>1,2 × săpătură = umplutură</b> → ${nf(R.SUPR_FT_ECH.cut)} / ${nf(R.SUPR_FT_ECH.fill)} mc, total ${nf(tot('SUPR_FT_ECH'))} mc: <b>fără aport, fără transport în afara șantierului</b>, pentru doar +${nf(tot('SUPR_FT_ECH') - tot('SUPR_FT'))} mc.</li>
      <li><b>XTR 1°</b>: forțat la echilibru ar trebui să sape și ar lăsa din nou bălți — nu e o soluție bună. Pământul pentru cei ${nf(R.SUPR_XTR_1.fill)} mc de umplutură vine din <b>săpătura rigolelor</b> (${nf(rigV)} mc): bilanțul se închide cu drenajul inclus.</li></ul>`,
    dren:`<ul><li>Pe terenul natural, zona de lucru are <b>${B0.EG.n} de depresiuni închise</b> (${nf(B0.EG.arie)} mp, ${nf(B0.EG.vol)} mc de apă reținută) — între mese apa ar bălti.</li>
      <li><b>Condiția „fără bălți” intră în optimizare</b>: după fiecare rezolvare se caută depresiunile (reconstrucție morfologică); pentru nodurile din ele se impune dz ≥ nivelul de deversare − teren, apoi se rezolvă din nou. Rămân ${B0.SUPR_FT.n} depresiuni mici (${nf(B0.SUPR_FT.arie)} mp), pe marginea zonei.</li>
      <li>Scurgerea D8 pe suprafața finală (priority-flood) dă <b>talvegurile</b>; pe cele cu bazin ≥ ${nf(P.A_RIGOLA, 1)} ha care traversează zona se propun <b>rigole</b>: ${RIG.length} de segmente, ${nf(rigL)} m.</li></ul>
      <table class="tbl2" style="font-size:21px;margin-top:6px"><tr><th>Iterația (FT)</th>${IT.slice(0, 5).map(q => `<th>${q.it}</th>`).join('')}</tr>
      <tr><td>Noduri în bălți</td>${IT.slice(0, 5).map(q => `<td>${q.balti}</td>`).join('')}</tr><tr><td>Volum, mc</td>${IT.slice(0, 5).map(q => `<td>${nf(q.vol)}</td>`).join('')}</tr></table>`,
    rig:`<p><b>Q = m · Φ · i · A</b> (formula rațională, STAS 1846-2) · m = ${nf(P.M_RET, 1)}, Φ = ${nf(P.PHI, 2)} · i la durata tc = 10 min + Kirpich, frecvența ${P.FREC} — <b>ipoteză i(10 min) ≈ 200 l/s·ha</b>, de înlocuit cu STAS 9470-73 pentru amplasament.</p>
      <p>Secțiune trapezoidală înierbată, b = ${nf(P.B_RIG, 2)} m, taluz 1:${nf(P.M_TAL, 1)}, n = ${nf(P.N_MAN, 3)}; adâncimea normală (Manning) + garda ${nf(P.GARDA*100)} cm, minim 0,40 m; peste ${nf(P.V_ADM, 1)} m/s — protecție (dale, pereu, trepte).</p>
      ${ret(`<b>${RIG.length} de segmente, ${nf(rigL)} m</b>, ${nf(rigV)} mc de săpătură; debitul maxim ${nf(rigQ)} l/s, pe talvegul principal.`)}`,
    topo:`<ul><li><b>Înainte</b>: DTM-ul terenului existent — curat, dens, cu precizie pe Z sub 5 cm. Tot calculul depinde de el.</li>
      <li><b>Proiectul</b>: suprafața de nivelare se livrează ca <b>model 3D</b> (TIN / LandXML / DXF 3D) și se încarcă direct în utilajul cu GNSS (machine control).</li>
      <li><b>Trasarea</b>: grilă de puncte la 10 m cu cota de proiect + axele piloților cu cota capului (tub + reveal).</li>
      <li><b>Controlul</b>: ridicarea după nivelare se compară cu suprafața de proiect celulă cu celulă (±5 cm), apoi se verifică fereastra de ±15 cm la fiecare pilot.</li>
      <li><b>Cubajul executat</b>: suprafață față de suprafață — același calcul ca proiectul.</li></ul>
      ${fix(`<b>1 cm eroare sistematică pe Z × ${nf(M.arie_lucru/1e4, 1)} ha = ${nf(M.arie_lucru/100)} mc</b> — de ordinul volumului total la XTR. Controlul topo e partea cea mai importantă a execuției.`)}`,
    lim:`<ul><li>Terenul: ridicarea din aprilie 2026, o zonă critică a parcului (${nf(M.arie_teren/1e4, 1)} ha, ${M.n_trackere} de trackere).</li>
      <li>Grila de optimizare are 2 m; banda se verifică pe mese la fiecare metru, pe axă și pe margini — variantă prudentă.</li>
      <li>Racordul 1:10 și bordura de ${nf(M.BORDURA)} m sunt alegeri de proiectare.</li>
      <li>Structura: XTR cu frângere la fiecare pilot; valorile reale (unghi, pante) se iau din fișa producătorului ales.</li>
      <li>Bălțile se elimină prin umplere; varianta cu rigolă de evacuare nu e inclusă în optimizare.</li>
      <li>Drenaj: intensitatea ploii e o ipoteză; Φ = ${nf(P.PHI, 2)}; bazinele sunt limitate la zona ridicată. Predimensionare, nu proiect de execuție.</li></ul>`,
    concl:`<ul><li>Analiza de terasamente = <b>terenul existent</b> + <b>restricțiile structurii</b> + <b>suprafața de nivelare optimizată</b> pe toată zona.</li>
      <li>FT: <b>${nf(tot('SUPR_FT'))} mc</b> · XTR 1°: <b>${nf(tot('SUPR_XTR_1'))} mc</b> — fără trepte, fără bălți, executabil cu lama.</li>
      <li><b>1° pe pilot este suficient</b>: peste 0,5° rezultatul nu se mai schimbă.</li>
      <li>Echilibrarea și drenajul intră în aceeași optimizare; rigolele se dimensionează pe suprafața finală.</li>
      <li>Rezultatul e un model 3D care merge direct în utilaj și în controlul topo.</li></ul>`
  };

  window.S = [
    {id:'titlu', t:'Titlu', html:`<div class="title-bg"></div><iframe data-src="anim/00_deco.html" class="deco" style="position:absolute;inset:auto;right:30px;top:170px;width:900px;height:700px;pointer-events:none;background:transparent"></iframe>
      <div class="s-pad" style="right:860px"><div class="kick">Studiul de caz 1 · KondorCAD LandSURV</div><h1>Analiza terasamentelor pentru un parc fotovoltaic pe trackere</h1>
        <p style="font-size:32px;margin-top:22px">Teren existent · structură FT / XTR · suprafața de nivelare · drenaj</p>
        <p class="muted" style="font-size:24px;margin-top:30px">← → navigare · F ecran complet · N note · Spațiu = pauză</p></div>`},
    {id:'t_ce', t:'Principii', html:T({kick:'Principii', title:'Ce este o analiză de terasamente', cols:'1.1fr 0.9fr', body:B.ce + go('a_ce', 'Principiul: două suprafețe, o diferență'),
      vis:`<div class="card"><h3>Formula de bază</h3><p class="big" style="color:var(--cyan)">ΔZ = FG − EG</p><p class="c" style="margin-top:14px">Volum = Σ ΔZ × aria celulei<br><span style="color:#ff8a8a">ΔZ &lt; 0 → săpătură</span> · <span style="color:#8ec5ff">ΔZ &gt; 0 → umplutură</span></p></div>
        <div class="card"><h3>Regula topografului</h3><p class="big" style="color:var(--gold)">1 cm × 1 ha</p><p class="c" style="margin-top:10px">= 100 mc. Câțiva centimetri de eroare pe Z schimbă complet rezultatul.</p></div>`}), note:note('Principii', B.ce)},
    {id:'a_ce', t:'Principiul — animație', anim:'anim/01_principiu.html', note:note('Principii', B.ce)},
    {id:'t_flux', t:'Fluxul', html:`<div class="s-pad"><div class="kick">Fluxul de lucru</div><h2>Fluxul complet, în 8 pași</h2>
      <div class="flux">${FLUX.map(([id, n, h, p]) => `<div class="card" data-go="${id}"><div class="n">${n}</div><h3>${h}</h3><p>${p}</p></div>`).join('')}</div>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:22px;margin-top:26px">${Object.keys(SC).map(k => `<div class="card" style="padding:14px 24px;display:flex;align-items:baseline;gap:18px"><span style="color:${SC[k][1]};font-size:26px;font-weight:700">${SC[k][0]}</span><span style="font-size:44px;font-weight:800">${nf(tot(k))}</span><span class="muted" style="font-size:22px">mc</span></div>`).join('')}</div>
      <p class="muted" style="font-size:22px;margin-top:20px">Clic pe un pas pentru a sări la el.</p></div>`},
    {id:'t_eg', t:'Pasul 1 — terenul existent', html:T({kick:'Pasul 1', title:'Terenul existent — de la puncte la model', cols:'1.1fr 0.9fr', body:B.eg + go('a_3d', 'Puncte → TIN → suprafața de nivelare, în 3D'),
      vis:`<div class="card"><h3>Datele de intrare</h3><table class="tbl"><tr><td>Puncte topo</td><td>${nf(M.n_puncte_eg)}</td></tr><tr><td>Suprafață</td><td>${nf(M.arie_teren/1e4, 1)} ha</td></tr><tr><td>Grile</td><td>1 m · 2 m</td></tr><tr><td>Cote</td><td>${nf(M.zmin, 2)}–${nf(M.zmax, 2)} m</td></tr><tr><td>Sistem</td><td>Stereo 70</td></tr></table></div>`}), note:note('Terenul existent', B.eg)},
    {id:'a_3d', t:'3D — animație', anim:'anim/02_teren3d.html', note:note('Terenul și suprafața', B.eg)},
    {id:'t_lay', t:'Pasul 2 — layout', html:T({kick:'Pasul 2', title:'Layoutul trackerelor și piloții', cols:'1.1fr 0.9fr', body:B.lay,
      vis:`<div class="card"><h3>Geometria</h3><table class="tbl"><tr><td>Trackere</td><td>${M.n_trackere}</td></tr><tr><td>Piloți</td><td>${nf(M.n_piloti)}</td></tr><tr><td>Lungime rânduri</td><td>${nf(M.lungime_totala/1000, 2)} km</td></tr><tr><td>Deschidere piloți</td><td>${nf(M.pas_min, 1)}–${nf(M.pas_max, 1)} m</td></tr><tr><td>Lățime masă / pas rânduri</td><td>2,38 / 4,7 m</td></tr></table></div>`}), note:note('Layout', B.lay)},
    {id:'t_str', t:'Pasul 3 — structura', html:T({kick:'Pasul 3', title:'Structura dă libertatea tubului: FT față de XTR', cols:'1.15fr 0.85fr', body:B.str + go('a_str', 'Un tracker real: FT, apoi XTR'),
      vis:`<div class="card"><h3>Fișa structurii</h3><table class="tbl"><tr><td></td><td style="color:var(--gold)">FT</td><td style="color:var(--green)">XTR</td></tr><tr><td>Frângere la pilot</td><td>0°</td><td>≤ 1°</td></tr><tr><td>Pantă max N–S</td><td>8,5 %</td><td>15 %</td></tr><tr><td>Fereastra reveal</td><td>±15 cm</td><td>±15 cm</td></tr></table></div>`}), note:note('Structura', B.str)},
    {id:'a_str', t:'Structura — animație', anim:'anim/03_structura.html', note:note('Structura', B.str)},
    {id:'t_ung', t:'Este bun 1°?', html:T({kick:'Pasul 3 · întrebarea', title:'Este bună libertatea de 1° pentru XTR?', cols:'0.95fr 1.05fr', dense:true, body:B.unghi,
      vis:`<div class="card" style="padding:18px 22px"><h3 style="font-size:28px">Volumul pe suprafața de nivelare, după unghi (mc, scară log.)</h3>${unghiChart()}</div>`}),
      note:note('Unghiul', B.unghi + '<p>Surse: TaiyangNews — „Terrain Adaptation Becomes A Key Solar Tracker Requirement”; brevetele US 11.874.030 / US 2023/0129712, US 12.301.164, US 2023/0155539.</p>')},
    {id:'t_supr', t:'Pasul 4 — suprafața', html:T({kick:'Pasul 4', title:'Suprafața de nivelare — o singură optimizare pe toată zona', cols:'1.15fr 0.85fr', dense:true, body:B.supr + go('a_sec', 'Secțiuni transversale reale'),
      vis:`<div class="card"><h3>Problema de optimizare</h3><p class="c" style="font-family:Consolas,monospace;font-size:22px;line-height:1.65;color:var(--cyan)">min Σ |dz<sub>n</sub>| · H²<br>D<sub>k</sub>(s) − τ ≤ EG(p) + dz(p) ≤ D<sub>k</sub>(s) + τ<br>|dz<sub>i</sub> − dz<sub>j</sub>| ≤ G · H<br>dz = 0 la marginea zonei<br>FT: D liniar · XTR: |Δpantă| ≤ tan θ<br>fără depresiuni închise</p>
        <p class="c muted">τ = ${nf(M.TAU, 2)} m · H = ${nf(M.H)} m · G = 1:10 · ${nf(M.N_noduri)} de noduri</p></div>`}), note:note('Suprafața de nivelare', B.supr)},
    {id:'a_sec', t:'Secțiuni — animație', anim:'anim/04_sectiune.html', note:note('Secțiuni', B.supr)},
    {id:'t_rac', t:'Pasul 5 — racordul', html:T({kick:'Pasul 5', title:'Panta de racord — cât de lin se întind lucrările', cols:'0.85fr 1.15fr', body:B.rac + go('a_rac', 'Aceeași secțiune, trei racorduri'),
      vis:`<div class="card" style="padding:18px 22px"><h3 style="font-size:28px">Volum total pe zonă, mc</h3>${racChart()}</div>`}), note:note('Racordul', B.rac)},
    {id:'a_rac', t:'Racord — animație', anim:'anim/04_sectiune.html#racord', note:note('Racordul', B.rac)},
    {id:'t_rez', t:'Pasul 6 — rezultate', html:`<div class="s-pad"><div class="kick">Pasul 6</div><h2>Volumele pe suprafața de nivelare — ${M.n_trackere} de trackere</h2><div class="txt">${B.rez}</div>${go('a_harta', 'Harta lucrărilor + comparator FT | XTR')}</div>`, note:note('Rezultate', B.rez)},
    {id:'a_harta', t:'Harta — animație', anim:'anim/05_harta.html', note:note('Rezultate', B.rez)},
    {id:'t_bil', t:'Bilanțul', html:T({kick:'Pasul 6 · bilanț', title:'Echilibrarea: fără pământ adus, fără pământ dus', cols:'1.2fr 0.8fr', body:B.bil,
      vis:`<div class="card"><h3>FT</h3><table class="tbl"><tr><td></td><td>simplă</td><td>echilibrată</td></tr><tr><td>Săpătură</td><td>${nf(R.SUPR_FT.cut)}</td><td>${nf(R.SUPR_FT_ECH.cut)}</td></tr><tr><td>Umplutură</td><td>${nf(R.SUPR_FT.fill)}</td><td>${nf(R.SUPR_FT_ECH.fill)}</td></tr><tr><td>Total, mc</td><td><b>${nf(tot('SUPR_FT'))}</b></td><td><b>${nf(tot('SUPR_FT_ECH'))}</b></td></tr></table></div>`}), note:note('Bilanț', B.bil)},
    {id:'t_dren', t:'Pasul 7 — drenaj', html:T({kick:'Pasul 7', title:'Drenajul intră în optimizare', cols:'1.1fr 0.9fr', dense:true, body:B.dren + go('a_dren', 'Ploaie pe teren: bălți, talveguri, rigole'),
      vis:`<div class="card"><h3>Depresiuni închise în zona de lucru</h3><table class="tbl2" style="font-size:22px"><tr><th></th><th>nr.</th><th>arie mp</th><th>apă mc</th></tr>
        ${[['EG', 'Teren existent'], ['SUPR_FT', 'După optimizare — FT'], ['SUPR_XTR_1', 'După optimizare — XTR 1°']].map(([k, l]) => `<tr><td>${l}</td><td>${B0[k].n}</td><td>${nf(B0[k].arie)}</td><td>${nf(B0[k].vol)}</td></tr>`).join('')}</table></div>`}), note:note('Drenaj', B.dren)},
    {id:'a_dren', t:'Drenaj — animație', anim:'anim/06_drenaj.html', note:note('Drenaj', B.dren)},
    {id:'t_rig', t:'Rigolele', html:T({kick:'Pasul 7 · calcul', title:'Rigolele pe suprafața finală', cols:'1.15fr 0.85fr', dense:true, body:B.rig + go('a_rig', 'Calculul unei rigole, pas cu pas'),
      vis:`<div class="card"><h3>Cele mai încărcate rigole</h3><table class="tbl2" style="font-size:20px"><tr><th>A ha</th><th>Q l/s</th><th>S %</th><th>H m</th><th>v m/s</th></tr>
        ${RIG.slice().sort((a, b) => b.Q - a.Q).slice(0, 8).map(s => `<tr><td>${nf(s.A, 2)}</td><td>${nf(s.Q)}</td><td>${nf(s.S*100, 1)}</td><td>${nf(s.H, 2)}</td><td style="color:${s.prot ? '#ff8a8a' : '#5be39a'}">${nf(s.v, 2)}</td></tr>`).join('')}</table></div>`}), note:note('Rigole', B.rig)},
    {id:'a_rig', t:'Rigola — calculator', anim:'anim/07_rigola.html', note:note('Rigole', B.rig)},
    {id:'t_topo', t:'Pasul 8 — execuție', html:T({kick:'Pasul 8', title:'Execuție, trasare și control', cols:'1.15fr 0.85fr', dense:true, body:B.topo,
      vis:`<div class="card"><h3>Ce livrează topograful</h3><p class="c">① DTM-ul terenului existent<br>② suprafața de proiect (model 3D)<br>③ grila de trasare + piloții<br>④ ridicarea după nivelare<br>⑤ cubajul executat</p></div>`}), note:note('Execuție', B.topo)},
    {id:'t_lim', t:'Ipoteze', html:`<div class="s-pad"><div class="kick">Onestitate</div><h2>Ipoteze și limite</h2><div class="txt dense">${B.lim}</div></div>`, note:note('Limite', B.lim)},
    {id:'t_concl', t:'Concluzii', html:`<div class="s-pad"><div class="kick">Concluzii</div><h2>Concluzii</h2><div class="tx" style="grid-template-columns:1.2fr 0.8fr"><div class="txt">${B.concl}</div>
      <div class="vis">${Object.keys(SC).map(k => `<div class="card" style="padding:14px 22px"><div style="color:${SC[k][1]};font-size:24px;font-weight:700">${SC[k][0]}</div><div class="big" style="font-size:64px">${nf(tot(k))} <span style="font-size:28px">mc</span></div></div>`).join('')}</div></div></div>`}
  ];
})();
