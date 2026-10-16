/* Analiza terasamentelor (earthworks) — parc fotovoltaic din sudul României (studiu de caz).
   Flux complet: teren existent → layout → structură → optimizator pe rând → rezultate → bilanț → drenaj → topografie.
   Cifrele se citesc din data/rezultate.js și data/drenaj.js (generate de _generator). */
(function(){
  window.CURS = {nr:0, titlu:'Studiul de caz 1 — analiza terasamentelor'};
  const R = REZ.rezultate, M = REZ, DR = DRENAJ, P = DR.par, DEP = DR.dep;
  const nf = (v, d) => Number(v).toLocaleString('ro-RO', {minimumFractionDigits:d||0, maximumFractionDigits:d||0});
  const tot = k => R[k].cut + R[k].fill, red = (a, b) => nf(100*(1 - tot(b)/tot(a)), 0) + ' %';
  const go = (id, txt) => `<button class="go" data-go="${id}">▶ ${txt || 'Animație interactivă'}</button>`;
  const ret = txt => `<div class="ret">${txt}</div>`, fix = txt => `<div class="fix">${txt}</div>`;
  const T = o => `<div class="s-pad"><div class="kick">${o.kick}</div><h2>${o.title}</h2>
    <div class="tx" style="grid-template-columns:${o.cols || '1.05fr 1fr'}"><div class="txt ${o.dense ? 'dense' : ''}">${o.body}</div><div class="vis">${o.vis || ''}</div></div></div>`;
  const note = (h, b) => `<h3>${h}</h3>${b}`;
  const RIG = DR.seg.filter(s => s.rig), rigL = RIG.reduce((a, s) => a + s.L, 0), rigV = RIG.reduce((a, s) => a + s.vol, 0);
  const rigQ = Math.max(...RIG.map(s => s.Q)), rigP = RIG.filter(s => s.prot).length;
  const ZT = M.n_zone > 1 ? M.n_zone + ' zone' : 'o singură zonă', R1 = Math.PI/180;
  const S025 = (s => s.cut + s.fill)(M.sensibilitate.find(s => s.tau === 0.15 && s.unghi === 0.25));
  const SC = {ORIG_APR:['Proiect inițial — capete pe teren', '#b4c0d4'], FT:['FT — tub drept, optimizat', '#ffc940'], XTR_075:['XTR 0,75° / pilot', '#7fd4ff'], XTR_1:['XTR 1° / pilot', '#5be39a'], XTR_2:['XTR 2° / pilot', '#b48cff']};

  // ---------- grafic: volume pe scenarii (bare orizontale)
  function barChart(){
    const ks = ['ORIG_APR', 'FT', 'XTR_075', 'XTR_1', 'XTR_2'], mx = tot('ORIG_APR'), W = 820, rowH = 92;
    let h = `<svg class="chart" viewBox="0 0 ${W + 260} ${ks.length*rowH + 40}" style="width:100%">`;
    ks.forEach((k, i) => { const y = 20 + i*rowH, wc = R[k].cut/mx*W, wf = R[k].fill/mx*W;
      h += `<text x="0" y="${y + 30}" fill="${SC[k][1]}" font-size="26" font-weight="700">${SC[k][0]}</text>`;
      h += `<rect x="0" y="${y + 42}" width="${Math.max(2, wc)}" height="30" fill="#ff6262" rx="3"/><rect x="${wc}" y="${y + 42}" width="${Math.max(2, wf)}" height="30" fill="#4f9dff" rx="3"/>`;
      h += `<text x="${wc + wf + 14}" y="${y + 66}" fill="#fff" font-size="27" font-weight="800">${nf(tot(k))} mc</text>`; });
    h += `<rect x="0" y="${ks.length*rowH + 18}" width="18" height="18" fill="#ff6262"/><text x="26" y="${ks.length*rowH + 33}" fill="#b4c0d4" font-size="20">săpătură</text>
      <rect x="140" y="${ks.length*rowH + 18}" width="18" height="18" fill="#4f9dff"/><text x="166" y="${ks.length*rowH + 33}" fill="#b4c0d4" font-size="20">umplutură</text></svg>`;
    return h;
  }
  // ---------- grafic: sensibilitatea la unghi si la libertate (scara log)
  function sensChart(){
    const S = M.sensibilitate, W = 980, H = 560, x0 = 110, y0 = 30, w = W - x0 - 40, hh = H - y0 - 80;
    const X = u => x0 + u/2*w, lo = 10, hi = 5000, Y = v => y0 + hh - (Math.log10(Math.max(lo, v)) - Math.log10(lo))/(Math.log10(hi) - Math.log10(lo))*hh;
    let h = `<svg class="chart" viewBox="0 0 ${W} ${H}" style="width:100%">`;
    [10, 30, 100, 300, 1000, 3000].forEach(v => h += `<line x1="${x0}" x2="${x0 + w}" y1="${Y(v)}" y2="${Y(v)}" stroke="#22355a"/><text x="${x0 - 10}" y="${Y(v) + 7}" fill="#8a98b4" font-size="20" text-anchor="end">${nf(v)}</text>`);
    [0, 0.25, 0.5, 0.75, 1, 1.5, 2].forEach(u => h += `<line x1="${X(u)}" x2="${X(u)}" y1="${y0}" y2="${y0 + hh}" stroke="#22355a"/><text x="${X(u)}" y="${y0 + hh + 30}" fill="#8a98b4" font-size="20" text-anchor="middle">${String(u).replace('.', ',')}°</text>`);
    h += `<text x="${x0 + w/2}" y="${H - 8}" fill="#b4c0d4" font-size="21" text-anchor="middle">unghiul maxim de frângere la pilot (0° = FT, tub drept)</text>`;
    h += `<text x="24" y="${y0 + hh/2}" fill="#b4c0d4" font-size="21" text-anchor="middle" transform="rotate(-90 24 ${y0 + hh/2})">volum total, mc (scară logaritmică)</text>`;
    h += `<rect x="${X(0.75)}" y="${y0}" width="${X(2) - X(0.75)}" height="${hh}" fill="rgba(91,227,154,.08)"/><text x="${X(1.375)}" y="${y0 + 26}" fill="#5be39a" font-size="19" text-anchor="middle">plaja pieței: 0,75–2°</text>`;
    [[0.10, '#ff9d3c', '±10 cm'], [0.15, '#3fd0ff', '±15 cm (studiul de caz)'], [0.20, '#b48cff', '±20 cm']].forEach(([tau, c, lab]) => {
      const pts = S.filter(s => Math.abs(s.tau - tau) < 1e-6).sort((a, b) => a.unghi - b.unghi);
      h += `<path d="${pts.map((s, i) => (i ? 'L' : 'M') + X(s.unghi).toFixed(1) + ' ' + Y(s.cut + s.fill).toFixed(1)).join(' ')}" fill="none" stroke="${c}" stroke-width="${tau === 0.15 ? 5 : 3}"/>`;
      pts.forEach(s => h += `<circle cx="${X(s.unghi)}" cy="${Y(s.cut + s.fill)}" r="${tau === 0.15 ? 7 : 5}" fill="${c}"/>`);
      const l = pts[pts.length - 1]; h += `<text x="${X(2) - 8}" y="${Y(l.cut + l.fill) - 14}" fill="${c}" font-size="20" font-weight="700" text-anchor="end">${lab}</text>`;
      if(tau === 0.15) pts.forEach(s => { if([0, 0.25, 1].includes(s.unghi)) h += `<text x="${X(s.unghi) + 12}" y="${Y(s.cut + s.fill) - 12}" fill="#fff" font-size="21" font-weight="700">${nf(s.cut + s.fill)}</text>`; }); });
    return h + '</svg>';
  }
  const FLUX = [
    ['t_eg', '1', 'Terenul existent', `${nf(M.n_puncte_eg)} de puncte → TIN → grilă de 1 m`], ['t_lay', '2', 'Layout și piloți', `${M.n_trackere} de trackere, ${nf(M.n_piloti)} de piloți, pas ${nf(M.pas_min, 1)}–${nf(M.pas_max, 1)} m`],
    ['t_str', '3', 'Structura', 'FT: tub drept · XTR: frângere ≤ θ la fiecare pilot'], ['t_opt', '4', 'Optimizatorul pe rând', 'programare liniară, volum minim în afara benzii'],
    ['t_rez', '5', 'Rezultate pe sit', 'hărți săpătură / umplutură pe fiecare scenariu'], ['t_bil', '6', 'Bilanț și echilibrare', 'factor de afânare 1,2, excedent, transport'],
    ['t_dren', '7', 'Drenaj', 'bălți, talveguri, rigole dimensionate'], ['t_topo', '8', 'Topografia în execuție', 'trasare piloți, as-built, control volume']];

  const B = {
    ce:`<ul>
      <li>O analiză de terasamente compară <b>două suprafețe 3D</b>: <b>terenul existent (EG)</b> și <b>suprafața proiectată (FG)</b>.</li>
      <li>În fiecare punct se calculează <b>ΔZ = FG − EG</b>: negativ = săpătură, pozitiv = umplutură. Volumul este suma ΔZ × aria celulei (TIN față de TIN, grilă sau profile).</li>
      <li>Pământul își schimbă volumul: în banc → afânat (× ≈ 1,2) → compactat (× ≈ 0,9). Echilibrarea urmărește ca săpătura să acopere umplutura, pe distanțe mici.</li>
      <li>La un parc fotovoltaic pe trackere, suprafața proiectată nu e o platformă: e <b>linia tubului fiecărui tracker</b>, cu o toleranță în care terenul trebuie să cadă la fiecare pilot.</li></ul>`,
    eg:`<ul><li>Sursa: ridicarea topo din <b>aprilie 2026</b> (înainte de lucrări), <b>${nf(M.n_puncte_eg)} de puncte</b> — în medie un punct la ${nf(M.arie_teren/M.n_puncte_eg)} m², mai dese pe liniile de ridicare.</li>
      <li>Modelul <b>TIN</b> (triangulație Delaunay) → grilă de <b>1 m</b>, ${nf(M.celule/1e6, 2)} milioane de celule valide (${nf(M.arie_teren/1e4, 1)} ha), ${M.n_zone > 1 ? 'în <b>' + ZT + '</b> — zone critice ale parcului, traversate de talveguri' : '— o zonă critică a parcului, traversată de un talveg'}.</li>
      <li>Cote între ${nf(M.zmin, 1)} și ${nf(M.zmax, 1)} m; pantele pe direcția rândurilor sunt mici (0,5–3 %), dar terenul e ondulat.</li></ul>
      ${fix('Atenție: modelul trebuie să fie <b>DTM</b> (teren curat), nu DSM. Pe acest parc, un DEM de dronă ulterior conținea structurile montate — fără separarea lor volumele ieșeau umflate cu 14 %.')}`,
    lay:`<ul><li><b>${M.n_trackere} de trackere</b> NX Horizon (tub drept, rânduri N–S, azimut 153,44°), lungimi ${nf(M.L_min)}–${nf(M.L_max)} m, în total ${nf(M.lungime_totala/1000, 2)} km de rânduri.</li>
      <li><b>${nf(M.n_piloti)} de piloți</b> din arhiva de trasare 2025, potriviți pe axe (abatere < 1 cm); deschiderile dintre piloți: <b>${nf(M.pas_min, 1)}–${nf(M.pas_max, 1)} m</b>, mediana ${nf(M.pas_med, 2)} m.</li>
      <li>Masa trackerului: <b>2,38 m</b> lățime → ${nf(M.arie_mese/1e4, 2)} ha de mese. Volumele se calculează pe aceste fâșii (axa + marginile la ±1,19 m).</li></ul>
      ${ret('Pilotul este punctul unde se verifică toleranța: înălțimea lui deasupra terenului (reveal) trebuie să rămână într-o fereastră fixă — aici ±15 cm față de nominal.')}`,
    str:`<ul><li><b>FT — tub drept</b>: tot trackerul e o singură dreaptă. Libertăți: cota și panta (max ${nf(M.SMAX_FT*100, 1)} %).</li>
      <li><b>XTR — urmărește terenul</b>: tubul se frânge la fiecare pilot cu cel mult <b>θ</b>. O pantă pe fiecare deschidere, |Δpantă| ≤ tan θ; panta max ${nf(M.SMAX_XTR*100)} %.</li>
      <li>La θ = 1° și o deschidere de ${nf(M.pas_med, 2)} m, linia se poate abate cu <b>${nf(M.pas_med*Math.tan(R1)*100)} cm</b> pe deschidere — rază de curbură ≈ <b>${nf(M.pas_med/R1)} m</b>. Ondulațiile mai largi sunt urmărite fără terasamente.</li>
      <li>Comparația FT / XTR = <b>același optimizator</b>, rulat cu alte restricții.</li></ul>`,
    unghi:`<p><b>Da — 1° pe pilot este o ipoteză realistă</b>, la mijlocul plajei de pe piață:</p>
      <table class="tbl2" style="font-size:22px"><tr><th>Sursă</th><th>Frângere între piloți</th></tr>
      <tr><td>Brevete trackere „terrain following” (articulații)</td><td>≈ 0,25–0,75° / deschidere</td></tr>
      <tr><td>Soltec SF4x4 (articulație cardanică)</td><td>≈ 0,8°</td></tr><tr><td>Plaja uzuală a pieței (TaiyangNews)</td><td>1,5–1,7°</td></tr>
      <tr><td>PVH Terrain Response</td><td>până la 2°</td></tr></table>
      ${ret('<b>Pe acest parc rezultatul nu depinde de unghi peste 0,5°</b>: cotul curbei e la 0,25–0,5°. Doar 0,25° elimină deja ' + nf(100*(1 - S025/tot('FT'))) + ' % din volumul FT. Valoarea exactă se ia din fișa structurii alese.')}`,
    opt:`<ul><li>Pe fiecare tracker, terenul e eșantionat la <b>0,5 m</b> pe trei linii (axa și marginile mesei).</li>
      <li>Necunoscutele: parametrii liniei tubului <b>D(s)</b> + săpătura <b>c</b> și umplutura <b>f</b> în fiecare punct.</li>
      <li>Restricția: <b>D − 0,15 ≤ teren − c + f ≤ D + 0,15</b>; obiectivul: <b>min Σ (c + f)</b> × aria aferentă.</li>
      <li>E o problemă de <b>programare liniară</b>, convexă: soluția e optimul global, nu o aproximare. Rezolvitor HiGHS (scipy), câteva milisecunde pe tracker — ${M.n_trackere} trackere × 5 scenarii în sub un minut.</li>
      <li>Varianta <b>echilibrată</b>: ponderea săpăturii se ajustează (bisecție) până când săpătura × 1,2 ≈ umplutura pe tot situl.</li></ul>`,
    rez:`<table class="tbl2"><tr><th>Scenariu</th><th>Săpătură mc</th><th>Umplutură mc</th><th>Total mc</th><th>Mese afectate</th><th>Trackere fără lucrări</th></tr>
      ${['ORIG_APR', 'FT', 'XTR_075', 'XTR_1', 'XTR_2'].map(k => `<tr class="${k === 'XTR_1' ? 'hl' : ''}"><td style="color:${SC[k][1]}">${SC[k][0]}</td><td>${nf(R[k].cut)}</td><td>${nf(R[k].fill)}</td><td><b>${nf(tot(k))}</b></td><td>${nf((R[k].a_cut + R[k].a_fill)/1e4, 2)} ha</td><td>${R[k].trk_zero} / ${M.n_trackere}</td></tr>`).join('')}</table>
      ${ret(`Optimizarea poziției tubului drept reduce volumul cu <b>${red('ORIG_APR', 'FT')}</b>. Libertatea de 1° pe pilot mai reduce ce rămâne cu <b>${red('FT', 'XTR_1')}</b>: de la ${nf(tot('FT'))} la <b>${nf(tot('XTR_1'))} mc</b>. Adâncimea maximă: FT ${nf(R.FT.h_cut, 2)} / ${nf(R.FT.h_fill, 2)} m, XTR 1° ${nf(R.XTR_1.h_cut, 2)} / ${nf(R.XTR_1.h_fill, 2)} m (săpătură / umplutură).`)}`,
    bil:`<ul><li>Bilanțul se face în <b>mc în banc</b>; săpătura se transportă afânată (× ${nf(M.F_AFANARE, 1)}).</li>
      <li><b>FT</b>: ${nf(R.FT.cut)} mc săpătură, ${nf(R.FT.fill)} mc umplutură → săpătura × 1,2 = ${nf(R.FT.cut*1.2)} mc: lipsesc ~${nf(R.FT.fill - R.FT.cut*1.2)} mc, aduși din altă parte a șantierului.</li>
      <li><b>FT echilibrat</b>: ${nf(R.FT_ECH.cut)} / ${nf(R.FT_ECH.fill)} mc — același total (${nf(tot('FT_ECH'))} mc), fără aport: optimizatorul mută câțiva centimetri din umplutură în săpătură.</li>
      <li><b>XTR 1°</b>: ${nf(tot('XTR_1'))} mc în total — se rezolvă local, cu lama, fără transport.</li>
      <li>Ca în rapoartele producătorilor de trackere: „Balanced Total Earthworks” = max(săpătură, umplutură) × 2 × 1,2 → FT ${nf(Math.max(R.FT.cut, R.FT.fill)*2.4)} mc, XTR 1° ${nf(Math.max(R.XTR_1.cut, R.XTR_1.fill)*2.4)} mc.</li></ul>`,
    dren:`<ul><li>Suprafața finală schimbă scurgerea: o fâșie săpată în teren devine un <b>șanț fără ieșire</b>, o umplutură poate închide un talveg.</li>
      <li><b>Bălți</b>: umplerea depresiunilor (reconstrucție morfologică) → depresiuni închise mai adânci de 5 cm.</li>
      <li><b>Scurgerea</b>: direcții D8 pe grila de 1 m, cu priority-flood (fără gropi false), apoi <b>acumularea</b> — suprafața bazinului din amonte de fiecare celulă.</li>
      <li><b>Rigole</b> pe talvegurile cu bazin ≥ ${nf(P.A_RIGOLA, 1)} ha care trec prin zona meselor; debitul cu formula rațională, secțiunea cu Manning, verificarea vitezei.</li></ul>
      <table class="tbl2" style="font-size:22px;margin-top:10px"><tr><th>Bălți în zona meselor</th><th>nr.</th><th>arie mp</th><th>volum mc</th></tr>
      ${[['EG', 'Teren existent'], ['ORIG_APR', 'Proiect inițial'], ['FT', 'FT optimizat'], ['XTR_1', 'XTR 1°']].map(([k, l]) => `<tr><td>${l}</td><td>${DEP[k].n_mese}</td><td>${nf(DEP[k].arie_mese)}</td><td>${nf(DEP[k].vol_mese)}</td></tr>`).join('')}</table>`,
    rig:`<p><b>Debitul</b> — formula rațională (STAS 1846-2): <b>Q = m · Φ · i · A</b></p><ul>
      <li>m = ${nf(P.M_RET, 1)} (coeficient de întârziere), Φ = ${nf(P.PHI, 2)} (pajiște sub panouri), A = bazinul din harta de acumulare;</li>
      <li>i = intensitatea ploii la durata <b>tc = 10 min + Kirpich</b>, frecvența ${P.FREC}: <b>ipoteză i(10 min) ≈ 200 l/s·ha</b> — de înlocuit cu STAS 9470-73 pentru zona amplasamentului.</li></ul>
      <p><b>Secțiunea</b> — trapezoidală înierbată, b = ${nf(P.B_RIG, 2)} m, taluz 1:${nf(P.M_TAL, 1)}, Manning n = ${nf(P.N_MAN, 3)}; adâncimea normală + garda ${nf(P.GARDA*100)} cm, minim 0,40 m.</p>
      <p><b>Viteza</b> — până la ${nf(P.V_ADM, 1)} m/s rigola rămâne înierbată; peste, protecție (dale, pereu, trepte).</p>
      ${ret(`Rezultat: <b>${RIG.length} segmente de rigolă, ${nf(rigL)} m</b>, ${nf(rigV)} mc de săpătură. Debitul maxim ${nf(rigQ)} l/s, pe talvegul principal. <b>${rigP} segmente</b> cer protecție (v > ${nf(P.V_ADM, 1)} m/s).`)}`,
    topo:`<ul><li><b>Înainte</b>: suprafața EG — <b>DTM curat</b>, densitate ≥ 1 pct/m², precizie pe Z sub 5 cm. Tot calculul depinde de ea.</li>
      <li><b>Trasare</b>: coordonatele XYZ ale fiecărui pilot (cota capului = linia tubului + reveal), zonele de săpătură / umplutură cu cotele de proiect.</li>
      <li><b>Control</b>: înălțimea pilotului după batere, în toleranță; piloții în afara ferestrei se semnalează înainte de montaj.</li>
      <li><b>As-built</b>: ridicarea după terasamente (curbe la ≤ 30 cm, Z < 5 cm) și cubajul executat, pentru plată.</li></ul>
      ${fix(`<b>1 cm eroare sistematică pe Z × ${nf(M.arie_mese/1e4, 1)} ha de mese = ${nf(M.arie_mese/100)} mc.</b> Cu XTR volumul calculat (${nf(tot('XTR_1'))} mc) e mai mic decât efectul unui centimetru de eroare topo — controlul as-built devine partea cea mai importantă.`)}`,
    lim:`<ul>
      <li>Terenul: ridicarea din aprilie 2026, doar zone critice (${ZT}, ${M.n_trackere} trackere), nu tot parcul.</li>
      <li>Volumele: pe fâșia mesei (2,38 m), fără taluzurile laterale de racord; banda ±15 cm verificată pe toată masa, nu doar la piloți (variantă prudentă).</li>
      <li>Structura: XTR cu frângere la fiecare pilot (1°), pantă max 15 %; FT pantă max 8,5 %. Parametrii reali se iau din ghidul producătorului ales.</li>
      <li>Trackerele sunt optimizate independent — fără condiții între rânduri vecine (E–V) sau față de drumuri.</li>
      <li>Drenaj: intensitatea ploii e o ipoteză de lucru; Φ = ${nf(P.PHI, 2)}; bazinele sunt limitate la zona ridicată — aportul din afara zonelor nu e inclus. Predimensionare, nu proiect de execuție.</li>
      <li>Designul optimizat din aprilie (poligoane pe zone) evaluat pe fâșii dă ${nf(tot('OPT_APR'))} mc — fusese optimizat pe toată suprafața zonei, nu pe mese; de aceea nu apare în comparație.</li></ul>`,
    concl:`<ul>
      <li>Analiza de terasamente = <b>teren existent</b> + <b>restricțiile structurii</b> + <b>optimizare</b>. Software-ul face calculul; calitatea terenului decide rezultatul.</li>
      <li>Pe acest parc: <b>${nf(tot('ORIG_APR'))} mc</b> (capete pe teren) → <b>${nf(tot('FT'))} mc</b> (FT optimizat) → <b>${nf(tot('XTR_1'))} mc</b> (XTR 1°).</li>
      <li><b>1° pe pilot este suficient</b> — de la 0,5° în sus rezultatul practic nu se mai schimbă.</li>
      <li>XTR <b>păstrează drenajul natural</b>; FT și proiectul inițial creează bălți noi în fâșiile săpate.</li>
      <li>Drenajul se proiectează odată cu terasamentele: ${RIG.length} de segmente de rigolă, ${nf(rigL)} m, ${nf(rigV)} mc.</li></ul>`
  };

  window.S = [
    {id:'titlu', t:'Titlu', html:`<div class="title-bg"></div><iframe data-src="anim/00_deco.html" class="deco" style="position:absolute;inset:auto;right:30px;top:170px;width:900px;height:700px;pointer-events:none;background:transparent"></iframe>
      <div class="s-pad" style="right:860px">
        <div class="kick">Studiul de caz 1 · KondorCAD LandSURV</div><h1>Analiza terasamentelor pentru un parc fotovoltaic pe trackere</h1>
        <p style="font-size:32px;margin-top:22px">Parc fotovoltaic din sudul României · tub drept (FT) față de tracker care urmărește terenul (XTR 1°) · drenaj</p>
        <p class="muted" style="font-size:24px;margin-top:30px">← → navigare · F ecran complet · N note · Spațiu = pauză</p></div>`},

    {id:'t_ce', t:'Ce este o analiză de terasamente', html:T({kick:'Principii', title:'Ce este o analiză de terasamente (earthworks analysis)', cols:'1.1fr 0.9fr', body:B.ce + go('a_ce', 'Principiul: două suprafețe, o diferență'),
      vis:`<div class="card"><h3>Formula de bază</h3><p class="big" style="color:var(--cyan)">ΔZ = FG − EG</p><p class="c" style="margin-top:14px">Volum = Σ ΔZ × aria celulei<br><span style="color:#ff8a8a">ΔZ &lt; 0 → săpătură</span> · <span style="color:#8ec5ff">ΔZ &gt; 0 → umplutură</span></p></div>
        <div class="card"><h3>Regula topografului</h3><p class="big" style="color:var(--gold)">1 cm × 1 ha</p><p class="c" style="margin-top:10px">= 100 mc. O eroare sistematică de câțiva centimetri pe Z schimbă complet rezultatul.</p></div>`}), note:note('Principii', B.ce)},
    {id:'a_ce', t:'Principiul — animație', anim:'anim/01_principiu.html', note:note('Principiul', B.ce)},

    {id:'t_flux', t:'Fluxul complet', html:`<div class="s-pad"><div class="kick">Fluxul de lucru</div><h2>Fluxul complet, în 8 pași — pe datele reale ale unui parc fotovoltaic</h2>
      <div class="flux">${FLUX.map(([id, n, h, p]) => `<div class="card" data-go="${id}"><div class="n">${n}</div><h3>${h}</h3><p>${p}</p></div>`).join('')}</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin-top:26px">${[['ORIG_APR', 'Proiect inițial'], ['FT', 'FT optimizat'], ['XTR_1', 'XTR 1°']].map(([k, l]) => `<div class="card" style="padding:14px 24px;display:flex;align-items:baseline;gap:18px"><span style="color:${SC[k][1]};font-size:26px;font-weight:700">${l}</span><span style="font-size:44px;font-weight:800">${nf(tot(k))}</span><span class="muted" style="font-size:22px">mc</span></div>`).join('')}</div>
      <p class="muted" style="font-size:22px;margin-top:22px">Clic pe un pas pentru a sări la el. Totul se regenerează din scripturile din <code>_generator\\</code>.</p></div>`},

    {id:'t_eg', t:'Pasul 1 — terenul existent', html:T({kick:'Pasul 1', title:'Terenul existent (EG) — de la puncte la model', cols:'1.1fr 0.9fr', body:B.eg + go('a_eg', 'Terenul real în 3D: puncte → TIN → hărți'),
      vis:`<div class="card"><h3>Datele de intrare</h3><table class="tbl"><tr><td>Puncte topo</td><td>${nf(M.n_puncte_eg)}</td></tr><tr><td>Grilă de calcul</td><td>1 m</td></tr><tr><td>Suprafață</td><td>${nf(M.arie_teren/1e4, 1)} ha</td></tr><tr><td>Cote</td><td>${nf(M.zmin, 2)}–${nf(M.zmax, 2)} m</td></tr><tr><td>Sistem</td><td>Stereo 70</td></tr></table></div>`}), note:note('Terenul existent', B.eg)},
    {id:'a_eg', t:'Terenul existent — 3D', anim:'anim/02_teren3d.html', note:note('Terenul existent', B.eg)},

    {id:'t_lay', t:'Pasul 2 — layout și piloți', html:T({kick:'Pasul 2', title:'Layoutul trackerelor și pozițiile piloților', cols:'1.1fr 0.9fr', body:B.lay + go('a_rez', 'Harta trackerelor'),
      vis:`<div class="card"><h3>Geometria</h3><table class="tbl"><tr><td>Trackere</td><td>${M.n_trackere}</td></tr><tr><td>Piloți</td><td>${nf(M.n_piloti)}</td></tr><tr><td>Lungime rânduri</td><td>${nf(M.lungime_totala/1000, 2)} km</td></tr>
        <tr><td>Deschidere piloți</td><td>${nf(M.pas_min, 1)}–${nf(M.pas_max, 1)} m</td></tr><tr><td>Lățime masă</td><td>2,38 m</td></tr><tr><td>Suprafață mese</td><td>${nf(M.arie_mese/1e4, 2)} ha</td></tr></table></div>`}), note:note('Layout', B.lay)},

    {id:'t_str', t:'Pasul 3 — structura', html:T({kick:'Pasul 3', title:'Structura dă libertatea tubului: FT față de XTR', cols:'1.15fr 0.85fr', body:B.str + go('a_str', 'Un tracker real: FT, apoi XTR'),
      vis:`<div class="card"><h3>Fișa structurii</h3><table class="tbl"><tr><td></td><td style="color:var(--gold)">FT</td><td style="color:var(--green)">XTR</td></tr>
        <tr><td>Frângere la pilot</td><td>0°</td><td>≤ 1°</td></tr><tr><td>Pantă max N–S</td><td>${nf(M.SMAX_FT*100, 1)} %</td><td>${nf(M.SMAX_XTR*100)} %</td></tr><tr><td>Fereastra reveal</td><td>±15 cm</td><td>±15 cm</td></tr><tr><td>Necunoscute / tracker</td><td>2</td><td>1 + nr. deschideri</td></tr></table></div>`}), note:note('Structura', B.str)},
    {id:'a_str', t:'Structura — animație', anim:'anim/03_structura.html', note:note('Structura', B.str)},
    {id:'t_ung', t:'Este bun 1°?', html:T({kick:'Pasul 3 · întrebarea', title:'Este bună libertatea de 1° pentru XTR?', cols:'0.95fr 1.05fr', dense:true, body:B.unghi,
      vis:`<div class="card" style="padding:18px 22px"><h3 style="font-size:28px">Volumul total după unghi și libertate</h3>${sensChart()}</div>`}), note:note('Unghiul de frângere', B.unghi + '<p>Surse: TaiyangNews — „Terrain Adaptation Becomes A Key Solar Tracker Requirement”; brevetele US 11.874.030 / US 2023/0129712 („Articulation joints for terrain following solar tracker”), US 12.301.164, US 2023/0155539.</p>')},

    {id:'t_opt', t:'Pasul 4 — optimizatorul', html:T({kick:'Pasul 4', title:'Optimizatorul pe rând — programare liniară', cols:'1.1fr 0.9fr', body:B.opt + go('a_opt', 'Optimizatorul pe trackerele reale'),
      vis:`<div class="card"><h3>Formularea</h3><p class="c" style="font-family:Consolas,monospace;font-size:24px;line-height:1.6;color:var(--cyan)">min Σ (c<sub>i</sub> + f<sub>i</sub>)·Δs·b/3<br>D<sub>i</sub> − τ ≤ g<sub>i</sub> − c<sub>i</sub> + f<sub>i</sub> ≤ D<sub>i</sub> + τ<br>FT: D = a + b·s<br>XTR: |p<sub>k</sub> − p<sub>k−1</sub>| ≤ tan θ<br>c, f ≥ 0</p><p class="c muted">τ = 0,15 m · b = 2,38 m · Δs = 0,5 m</p></div>`}), note:note('Optimizatorul', B.opt)},
    {id:'a_opt', t:'Optimizatorul — animație', anim:'anim/04_optimizator.html', note:note('Optimizatorul', B.opt)},

    {id:'t_rez', t:'Pasul 5 — rezultate', html:`<div class="s-pad"><div class="kick">Pasul 5</div><h2>Rezultatele pe sit — ${M.n_trackere} de trackere</h2><div class="txt">${B.rez}</div>${go('a_rez', 'Harta săpăturilor și umpluturilor')}</div>`, note:note('Rezultate', B.rez)},
    {id:'a_rez', t:'Harta — animație', anim:'anim/05_harta.html', note:note('Rezultate', B.rez)},

    {id:'t_bil', t:'Pasul 6 — bilanț', html:T({kick:'Pasul 6', title:'Bilanțul și echilibrarea volumelor', cols:'1fr 1fr', dense:true, body:B.bil,
      vis:`<div class="card" style="padding:20px 24px"><h3 style="font-size:28px">Volumul total pe scenarii</h3>${barChart()}</div>`}), note:note('Bilanț', B.bil)},

    {id:'t_dren', t:'Pasul 7 — drenaj', html:T({kick:'Pasul 7', title:'Drenajul — se proiectează odată cu terasamentele', cols:'1.1fr 0.9fr', dense:true, body:B.dren + go('a_dren', 'Ploaie pe terenul real: bălți, talveguri, rigole'),
      vis:`<div class="card"><h3>Sinteză</h3><table class="tbl"><tr><td>Rigole propuse</td><td>${RIG.length} segmente</td></tr><tr><td>Lungime</td><td>${nf(rigL)} m</td></tr><tr><td>Săpătură rigole</td><td>${nf(rigV)} mc</td></tr>
        <tr><td>Debit maxim</td><td>${nf(rigQ)} l/s</td></tr><tr><td>Cu protecție</td><td>${rigP}</td></tr><tr><td>Bălți noi FT față de teren</td><td>+${DEP.FT.n_mese - DEP.EG.n_mese}</td></tr></table></div>`}), note:note('Drenaj', B.dren)},
    {id:'a_dren', t:'Drenaj — animație', anim:'anim/07_drenaj.html', note:note('Drenaj', B.dren)},
    {id:'t_rig', t:'Dimensionarea rigolelor', html:T({kick:'Pasul 7 · calcul', title:'Dimensionarea rigolelor', cols:'1.15fr 0.85fr', dense:true, body:B.rig + go('a_rig', 'Calculul unei rigole, pas cu pas'),
      vis:`<div class="card"><h3>Cele mai încărcate rigole</h3><table class="tbl2" style="font-size:20px"><tr><th>A ha</th><th>Q l/s</th><th>S %</th><th>H m</th><th>v m/s</th></tr>
        ${RIG.slice().sort((a, b) => b.Q - a.Q).slice(0, 8).map(s => `<tr><td>${nf(s.A, 2)}</td><td>${nf(s.Q)}</td><td>${nf(s.S*100, 1)}</td><td>${nf(s.H, 2)}</td><td style="color:${s.prot ? '#ff8a8a' : '#5be39a'}">${nf(s.v, 2)}</td></tr>`).join('')}</table></div>`}), note:note('Rigole', B.rig)},
    {id:'a_rig', t:'Rigola — calculator', anim:'anim/08_rigola.html', note:note('Rigole', B.rig)},

    {id:'t_tot', t:'Totalul lucrărilor', html:`<div class="s-pad"><div class="kick">Pașii 6 + 7</div><h2>Totalul lucrărilor de pământ — terasamente + drenaj</h2>
      <table class="tbl2"><tr><th></th><th style="color:#b4c0d4">Proiect inițial</th><th style="color:#ffc940">FT optimizat</th><th style="color:#5be39a">XTR 1°</th></tr>
      <tr><td>Terasamente pe mese</td><td>${nf(tot('ORIG_APR'))}</td><td>${nf(tot('FT'))}</td><td>${nf(tot('XTR_1'))}</td></tr>
      <tr><td>Umplerea bălților din zona meselor</td><td>${nf(DEP.ORIG_APR.vol_mese)}</td><td>${nf(DEP.FT.vol_mese)}</td><td>${nf(DEP.XTR_1.vol_mese)}</td></tr>
      <tr><td>Săpătura rigolelor</td><td>${nf(rigV)}</td><td>${nf(rigV)}</td><td>${nf(rigV)}</td></tr>
      <tr class="hl"><td><b>Total, mc</b></td><td><b>${nf(tot('ORIG_APR') + DEP.ORIG_APR.vol_mese + rigV)}</b></td><td><b>${nf(tot('FT') + DEP.FT.vol_mese + rigV)}</b></td><td><b>${nf(tot('XTR_1') + DEP.XTR_1.vol_mese + rigV)}</b></td></tr></table>
      ${ret('Cu XTR, <b>drenajul devine lucrarea principală de pământ</b>: terasamentele pe mese aproape dispar, rigolele și bălțile naturale rămân. Bălțile se pot și drena, nu doar umple — alegerea e de proiectare.')}</div>`,
      note:note('Total', '<p>Rigolele sunt aceleași în toate variantele (talvegurile nu se schimbă la nivelul acestor volume); bălțile diferă: săpăturile FT și cele din proiectul inițial creează depresiuni noi în fâșiile meselor.</p>')},

    {id:'t_topo', t:'Pasul 8 — topografia', html:T({kick:'Pasul 8', title:'Topografia în execuție — cele două capete ale lanțului', cols:'1.1fr 0.9fr', dense:true, body:B.topo,
      vis:`<div class="card"><h3>Lanțul</h3><p class="c">① DTM înainte<br>② analiză + optimizare<br>③ trasare piloți și zone<br>④ control după batere<br>⑤ as-built + cubaj executat</p><p class="c muted">Topograful livrează ① și verifică ③–⑤.</p></div>`}), note:note('Topografie', B.topo)},
    {id:'t_lim', t:'Ipoteze și limite', html:`<div class="s-pad"><div class="kick">Onestitate</div><h2>Ipoteze și limite</h2><div class="txt dense">${B.lim}</div></div>`, note:note('Limite', B.lim)},
    {id:'t_concl', t:'Concluzii', html:`<div class="s-pad"><div class="kick">Concluzii</div><h2>Concluzii</h2><div class="tx" style="grid-template-columns:1.15fr 0.85fr"><div class="txt">${B.concl}</div>
      <div class="vis">${['ORIG_APR', 'FT', 'XTR_1'].map(k => `<div class="card" style="padding:16px 22px"><div style="color:${SC[k][1]};font-size:24px;font-weight:700">${SC[k][0]}</div><div class="big" style="font-size:64px">${nf(tot(k))} <span style="font-size:30px">mc</span></div></div>`).join('')}</div></div></div>`}
  ];
})();
