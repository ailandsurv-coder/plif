/* Conținutul Cursului 4 — Tehnologii aeropurtate UAV și scanare 3D.
   Textele din PPTX (corectate) + capitolul nou „Fluxul fotogrametric pas cu pas" (6 pași, fiecare cu text și animație). */
(function(){
  window.CURS = {nr:4, titlu:'UAV și scanare 3D'};
  const fig = (src, cap, st) => `<figure class="fig" style="${st||''}"><img src="${src}">${cap ? `<figcaption>${cap}</figcaption>` : ''}</figure>`;
  const go = (id, txt) => `<button class="go" data-go="${id}">▶ ${txt || 'Animație interactivă'}</button>`;
  const ret = txt => `<div class="ret">${txt}</div>`;
  const T = o => `<div class="s-pad"><div class="kick">${o.kick}</div><h2>${o.title}</h2>
    <div class="tx" style="grid-template-columns:${o.cols || '1.05fr 1fr'}"><div class="txt ${o.dense ? 'dense' : ''}">${o.body}</div><div class="vis">${o.vis || ''}</div></div></div>`;
  const note = (h, b) => `<h3>${h}</h3>${b}`;
  const step = (n, of) => `<div style="display:flex;gap:6px;margin:-14px 0 18px">${[...Array(of).keys()].map(i => `<span style="flex:1;height:6px;border-radius:3px;background:${i < n ? 'var(--cyan)' : '#24365a'}"></span>`).join('')}</div>`;

  const B = {
    s2:`<ul>
      <li>Tehnologiile aeropurtate <b>UAV</b> (Unmanned Aerial Vehicles), cunoscute și sub denumirea de drone, au revoluționat domeniul măsurătorilor topografice și al ingineriei civile.</li>
      <li>UAV-urile oferă o metodă rapidă și eficientă de colectare a datelor de la înălțime, fiind esențiale în ridicările topografice, fotogrametria aeriană și scanările 3D.</li>
      <li>Ele sunt folosite pe scară largă în proiecte de îmbunătățiri funciare — sisteme de irigații și drenaj —, oferind o perspectivă detaliată asupra terenului și facilitând planificarea infrastructurilor.</li>
      <li>În proiectele de irigații, UAV-urile permit obținerea rapidă a datelor planimetrice și altimetrice precise, necesare pentru proiectarea sistemelor de irigații, a canalelor de drenaj și a altor lucrări similare.</li>
      <li>Utilizarea dronelor reduce costurile și timpul necesar măsurătorilor, oferind în același timp o acoperire extinsă și acces la zone greu accesibile.</li></ul>`,
    s7:`<p><b>Fotogrametria</b> este o metodă de determinare a formei, dimensiunilor și poziției obiectelor de pe teren pe baza imaginilor obținute de la înălțime.</p>
      <p>Principiul: același punct, fotografiat din cel puțin două poziții, se află la intersecția razelor care pleacă din fotografii — <b>triangulația</b>. Din sute de fotografii suprapuse rezultă coordonatele 3D ale terenului.</p>`,
    s8:`<p>În fotogrametria modernă, UAV-urile sunt echipate cu <b>camere de înaltă rezoluție</b> care captează imagini suprapuse ale terenului.</p><ul>
      <li>Contează <b>dimensiunea senzorului</b> și a pixelului, <b>distanța focală</b> și <b>obturatorul</b> (de preferat global sau mecanic, pentru imagini nemișcate).</li>
      <li>Din cameră și altitudinea de zbor rezultă <b>GSD</b> — mărimea unui pixel pe teren: GSD = H × p / f.</li>
      <li>Camera se montează pe un <b>gimbal</b> stabilizat; pentru modele 3D ale construcțiilor se fac și imagini <b>oblice</b> (camera înclinată ~45°).</li></ul>`,
    s9:`<p>Prin intermediul unor programe software specializate (de exemplu <b>Agisoft Metashape</b>, <b>Pix4D</b>), imaginile sunt procesate pentru a genera un model tridimensional (3D) al terenului sau al suprafeței de interes.</p>`,
    s10:`<p>Unul dintre avantajele majore ale fotogrametriei aeriene realizate cu UAV-uri este <b>acuratețea</b> datelor colectate, care pot fi utilizate pentru generarea <b>modelelor digitale ale terenului (DTM)</b> și a <b>ortofotoplanurilor</b> — imagini corectate pentru deformările produse de relief și de perspectiva camerei, care pot fi măsurate ca o hartă.</p>`,
    s11:`<p>Fotogrametria cu UAV-uri implică mai multe etape:</p><ol>
      <li><b>Planificarea zborului</b>: se definesc traiectoriile și altitudinea de zbor în funcție de suprafața ce urmează a fi acoperită și de rezoluția necesară a datelor.</li>
      <li><b>Captura imaginilor</b>: UAV-ul zboară conform traiectoriei stabilite și captează imagini suprapuse. Suprapunerea este esențială pentru reconstrucția 3D.</li>
      <li><b>Prelucrarea datelor</b>: imaginile sunt importate într-un software de fotogrametrie (de exemplu Agisoft Metashape, Pix4D), care generează modele tridimensionale, ortofotoplanuri și curbe de nivel.</li></ol>`,
    p1:`<ul><li><b>Zona și precizia</b>: conturul lucrării, scara planului, sistemul de coordonate (Stereo 70, MN75), produsele cerute.</li>
      <li><b>Camera și altitudinea</b>: din GSD-ul necesar rezultă altitudinea de zbor (H = GSD × f / p).</li>
      <li><b>Suprapunerile</b>: 75–85 % longitudinal și 60–75 % lateral; din ele rezultă benzile și punctele de declanșare.</li>
      <li><b>Punctele de control la sol (GCP)</b> și <b>de verificare (CP)</b>: ținte materializate, măsurate GNSS RTK.</li>
      <li><b>Verificările</b>: zona geografică UAS și autorizările, vremea, bateriile, RTK, setările camerei.</li></ul>`,
    p2:`<ul><li>Drona decolează, urcă la altitudinea planificată și parcurge <b>automat</b> benzile de zbor.</li>
      <li>Camera se declanșează la distanțe egale, astfel încât fiecare punct al terenului să apară în <b>multe imagini</b> (15–20 la 80/70 %).</li>
      <li>Fiecare fotografie primește poziția GNSS a dronei (cu RTK/PPK — la nivel de centimetri).</li>
      <li>La final se verifică pe teren: numărul de imagini, claritatea lor, acoperirea completă a zonei.</li></ul>`,
    p3a:`<ul><li>În fiecare imagine, software-ul detectează <b>puncte caracteristice</b> — detalii ușor de recunoscut.</li>
      <li>Aceleași detalii se caută în imaginile vecine: rezultă <b>puncte de legătură</b> (omoloage).</li>
      <li>Potrivirile greșite se elimină automat, pentru că nu respectă geometria comună a imaginilor.</li>
      <li>Operatorul marchează <b>punctele de control</b> (GCP) în toate imaginile în care apar.</li></ul>`,
    p3b:`<ul><li><b>Alinierea</b> (ajustarea în bloc) calculează simultan poziția și orientarea fiecărei fotografii și coordonatele punctelor de legătură — <b>norul rar de puncte</b>.</li>
      <li>Se calibrează și camera (distanța focală, distorsiunile obiectivului).</li>
      <li>Punctele de control fixează modelul în sistemul de coordonate: <b>georeferențierea</b>.</li>
      <li>Indicatori de calitate: eroarea de reproiecție (sub ~1 pixel) și erorile pe GCP (câțiva cm).</li></ul>`,
    p3c:`<ul><li>Pentru fiecare fotografie se calculează o <b>hartă de adâncime</b>; combinate, ele dau <b>norul dens de puncte</b> — aproape un punct pentru fiecare pixel.</li>
      <li>Punctele se unesc într-o plasă de triunghiuri (<b>mesh</b>), pe care se proiectează culorile din imagini: <b>modelul 3D texturat</b>.</li>
      <li>Pentru construcții și fațade sunt necesare și <b>imagini oblice</b> — din imagini verticale pereții ies deformați.</li></ul>`,
    p4:`<ul><li>Norul dens descrie <b>suprafața</b>: rezultă <b>DSM</b> (model digital al suprafeței), cu clădiri și vegetație.</li>
      <li>Prin <b>clasificare</b> se separă punctele de sol de vegetație, clădiri și apă (de exemplu prin densificarea progresivă a unei rețele de triunghiuri).</li>
      <li>Din punctele de sol rezultă <b>DTM</b> — terenul natural, folosit pentru curbe de nivel, profile și volume.</li>
      <li>Sub coronamentul des, fotogrametria nu vede solul: DTM-ul de acolo e doar interpolat — pentru zone împădurite se folosește <b>LiDAR</b>.</li></ul>`,
    p5:`<ul><li>Fotografia brută este o proiecție centrală: obiectele înalte apar <b>deplasate radial</b> (d = r × h / H).</li>
      <li><b>Ortorectificarea</b> readuce fiecare pixel pe poziția lui reală, folosind modelul suprafeței (DSM) — „true ortho".</li>
      <li>Imaginile rectificate se îmbină într-un <b>mozaic</b>, cu linii de îmbinare și egalizarea culorilor.</li>
      <li>Rezultatul — <b>ortofotoplanul</b> — se poate măsura ca o hartă, la scara dată de GSD.</li></ul>`,
    p6:`<ul><li><b>Produse</b>: ortofotoplan, DSM, DTM, nor de puncte clasificat, curbe de nivel, model 3D, raport de procesare — în Stereo 70 și MN75.</li>
      <li><b>Controlul calității</b>: pe punctele de verificare, măsurate independent, se calculează abaterile și RMSE = √(ΣΔ²/n).</li>
      <li>Precizie orientativă: ~1–2 × GSD în plan și ~2–3 × GSD pe verticală, pe teren liber.</li></ul>`,
    s12:`<p>În proiectele de irigații, fotogrametria aeriană este utilizată pentru a evalua topografia terenului, ajutând la identificarea zonelor care necesită reconfigurare sau ajustări pentru a optimiza curgerea apei.</p>
      <p>Prin utilizarea modelelor digitale ale terenului obținute prin fotogrametrie se pot proiecta sisteme de irigații eficiente, reducând pierderile de apă și maximizând productivitatea agricolă.</p>
      <p>Pe șantier, zborurile repetate documentează <b>stadiul lucrărilor</b> (de exemplu impermeabilizarea canalelor) și dau <b>volumele</b> executate.</p>`,
    s14:`<p>Spre deosebire de fotogrametrie, care depinde de lumina naturală și de rezoluția camerelor, tehnologia <b>LiDAR</b> (Light Detection and Ranging) măsoară direct distanțele cu impulsuri laser: dă date precise și în condiții de iluminare slabă, iar printre golurile din vegetație ajunge până la sol.</p><p>Imaginile alăturate arată aceeași zonă înainte și după clasificare: când se afișează <b>doar punctele de sol</b>, tufărișul dispare și rămâne terenul natural.</p>`,
    s16:`<p>Similar cu fotogrametria, procesul de scanare 3D cu LiDAR implică următoarele etape:</p><ol>
      <li><b>Planificarea zborului</b>: traiectoria și înălțimea sunt planificate pentru a acoperi întreaga zonă, iar parametrii scanerului se aleg pentru densitatea dorită a punctelor.</li>
      <li><b>Captura datelor</b>: pe măsură ce UAV-ul zboară, scanerul emite impulsuri laser și măsoară distanța până la fiecare ecou. Din aceste distanțe, din unghiul fasciculului și din traiectoria dronei (<b>GNSS + IMU</b>) se calculează coordonatele X, Y, Z ale fiecărui punct.</li>
      <li><b>Generarea norului de puncte și a modelului 3D</b>: datele se procesează într-un nor de puncte al terenului, clădirilor și vegetației; după clasificare rezultă modele digitale foarte precise ale terenului.</li></ol>`,
    s17:`<p>Scanarea 3D cu LiDAR este extrem de utilă în lucrările de îmbunătățiri funciare, în special în zonele cu vegetație densă sau în terenurile greu accesibile.</p>
      <p>Datele permit o înțelegere detaliată a topografiei și a modificărilor necesare pentru implementarea eficientă a sistemelor de irigații și drenaj. LiDAR oferă o rezoluție ridicată, permițând monitorizarea detaliată a infrastructurilor existente și planificarea optimă a noilor lucrări.</p>`,
    s18:`<p><b>Eficiența și reducerea costurilor</b> — UAV-urile permit colectarea rapidă a datelor pe suprafețe extinse, reducând drastic timpul față de măsurătorile tradiționale; costurile sunt, în general, mult mai mici decât pentru survoluri cu avioane sau elicoptere.</p>
      <p><b>Accesibilitatea în teren dificil</b> — dronele ajung în zone greu accesibile sau periculoase (terenuri abrupte, inundate), fără a pune în pericol personalul.</p>
      <p><b>Acoperire și detalii</b> — se acoperă rapid o zonă mare, cu detalii foarte fine; această combinație de viteză și acuratețe este esențială în lucrările de îmbunătățiri funciare.</p>`,
    s19:`<ul><li>Tehnologiile aeropurtate UAV, fie prin fotogrametrie, fie prin scanare 3D, joacă un rol crucial în proiectele moderne de îmbunătățiri funciare.</li>
      <li>Ele oferă o metodă rapidă, precisă și accesibilă de colectare a datelor planimetrice și altimetrice, facilitând planificarea și implementarea sistemelor de irigații și drenaj.</li>
      <li>Utilizarea dronelor reduce semnificativ costurile și timpul asociate măsurătorilor tradiționale, oferind în același timp o acoperire extinsă și date detaliate pentru decizii informate în proiectarea infrastructurii.</li></ul>`
  };
  const FLUX = [['p1', 'Pregătirea zborului', 'zonă, GSD, suprapuneri, GCP'], ['p2', 'Zborul', 'benzi, declanșări, suprapuneri'], ['p3a', 'Puncte de legătură', 'potrivire, marcarea GCP'],
    ['p3b', 'Alinierea', 'poziția imaginilor, nor rar, georeferențiere'], ['p3c', 'Nor dens și model 3D', 'hărți de adâncime, mesh, textură'], ['p4', 'DSM → DTM', 'clasificarea solului'],
    ['p5', 'Ortofotoplanul', 'ortorectificare, mozaic'], ['p6', 'Produse și control', 'formate, RMSE pe CP']];
  const stepSlide = (id, n, title, body, vis, anim, btn) => ({id, t:`Pasul ${n} — ${title}`, html:`<div class="s-pad"><div class="kick">Fluxul fotogrametric · pasul ${n} din 8</div><h2>${title}</h2>${step(n, 8)}
      <div class="tx" style="grid-template-columns:1.05fr 0.95fr"><div class="txt">${body}${go(anim, btn)}</div><div class="vis">${vis}</div></div></div>`});

  window.S = [
    {id:'titlu', t:'Titlu', html:`<div class="title-bg"></div><iframe data-src="anim/00_glob.html" class="deco" style="position:absolute;inset:auto;right:60px;top:110px;width:820px;height:820px;pointer-events:none;background:transparent"></iframe>
      <div class="s-pad" style="right:780px">
        <div style="display:flex;gap:22px;align-items:center;margin-bottom:34px"><img src="img/slides/sigla_1.png" style="height:120px"><img src="img/slides/sigla_2.jpg" style="height:120px">
          <div style="font-size:20px;line-height:1.35;color:var(--muted)">UNIVERSITATEA DE ȘTIINȚE AGRONOMICE ȘI MEDICINĂ VETERINARĂ BUCUREȘTI<br>Facultatea de Îmbunătățiri Funciare și Ingineria Mediului<br>Ciclul II — Master · Proiectarea Lucrărilor de Îmbunătățiri Funciare · Anul I</div></div>
        <div class="kick">Capitolul 4</div><h1>Tehnologii aeropurtate UAV și scanare 3D</h1>
        <p style="font-size:32px;margin-top:22px">Fotogrametria cu drone, pas cu pas · LiDAR · aplicații în îmbunătățiri funciare</p>
        <p class="muted" style="font-size:24px;margin-top:30px">← → navigare · F ecran complet · N note de curs · Spațiu = pauză</p></div>`},

    {id:'t02', t:'Introducere în tehnologiile UAV', html:T({kick:'Introducere', title:'Introducere în tehnologiile aeropurtate UAV', cols:'1fr 1fr', dense:true, body:B.s2 + go('a02', 'Tipuri de UAV și cadrul legal'),
      vis:`<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">${[['02_aripa.jpg', 'aripă fixă'], ['03_vtol.jpg', 'VTOL'], ['04_multirotor.jpg', 'multirotor profesional'], ['05_phantom.jpg', 'multirotor compact'], ['06_aripa.jpg', 'aripă fixă (lansare de mână)'], ['05_mini.jpg', 'dronă mică (<250 g)']].map(([s, c]) => fig('img/orig/' + s, c, '--mh:170px')).join('')}</div>`})},
    {id:'a02', t:'Tipuri de UAV', anim:'anim/02_tipuri_uav.html', note:note('Introducere', B.s2)},

    {id:'t07', t:'Fotogrametria aeriană cu UAV', html:T({kick:'Fotogrametria', title:'Fotogrametria aeriană cu UAV-uri', cols:'1fr 1fr', body:B.s7 + go('a07', 'Principiul: o imagine, două imagini, GSD'),
      vis:fig('img/orig/07_fotogrametrie.jpg', 'Pozițiile fotografiilor deasupra modelului 3D reconstruit')})},
    {id:'t08', t:'Camere', html:T({kick:'Fotogrametria', title:'Camere', cols:'1.05fr 0.95fr', body:B.s8 + go('a07', 'Calculator GSD'),
      vis:`<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">${fig('img/orig/08_camera.jpg', 'cameră cu senzor mare', '--mh:300px')}${fig('img/orig/08_gimbal.jpg', 'cameră pe gimbal', '--mh:300px')}</div>`})},
    {id:'a07', t:'Principiul fotogrametriei', anim:'anim/07_principiu.html', note:note('Fotogrametria', B.s7 + B.s8)},

    {id:'t11', t:'Fluxul fotogrametric', html:`<div class="s-pad"><div class="kick">Procesul de colectare și prelucrare a datelor fotogrametrice</div><h2>Fluxul fotogrametric — pas cu pas</h2>
      <div class="tx" style="grid-template-columns:0.9fr 1.1fr"><div class="txt dense">${B.s11}${B.s9}<div style="display:flex;gap:10px;margin-top:8px">${fig('img/orig/09_metashape.png', '', '--mh:60px;padding:6px')}${fig('img/orig/09_pix4d.png', '', '--mh:60px;padding:6px')}</div></div>
      <div class="vis" style="gap:8px">${FLUX.map(([id, n, d], i) => `<button class="go" data-go="${id}" style="margin:0;display:flex;gap:14px;align-items:center;text-align:left;background:var(--panel);color:var(--text);border:1px solid var(--line);padding:10px 16px">
        <span style="color:var(--cyan);font-weight:800;font-size:28px;width:34px">${i+1}</span><span><b style="color:var(--gold)">${n}</b><br><span style="color:var(--muted);font-weight:400;font-size:20px">${d}</span></span></button>`).join('')}</div></div></div>`},

    stepSlide('p1', 1, 'Pregătirea zborului', B.p1, fig('img/orig/11_plan_zbor.jpg', 'Plan de zbor într-o aplicație de planificare: zona, benzile, punctele de declanșare'), 'a11a', 'Planificatorul interactiv'),
    {id:'a11a', t:'Pregătirea zborului — animație', anim:'anim/11a_pregatire.html', note:note('Pasul 1 — Pregătirea zborului', B.p1)},
    stepSlide('p2', 2, 'Zborul cu suprapunerea imaginilor', B.p2, fig('img/slides/poster_11b_zbor_22.jpg', 'Amprentele imaginilor se suprapun: culorile arată în câte imagini apare fiecare loc'), 'a11b', 'Zborul — animație 3D'),
    {id:'a11b', t:'Zborul — animație', anim:'anim/11b_zbor.html', note:note('Pasul 2 — Zborul', B.p2)},
    stepSlide('p3a', 3, 'Puncte de legătură și puncte de control', B.p3a, fig('img/slides/poster_09a_legatura_11.jpg', 'Aceleași detalii, găsite automat în două imagini vecine'), 'a09a', 'Potrivirea imaginilor'),
    {id:'a09a', t:'Puncte de legătură — animație', anim:'anim/09a_legatura.html', note:note('Pasul 3 — Puncte de legătură', B.p3a)},
    stepSlide('p3b', 4, 'Alinierea imaginilor și georeferențierea', B.p3b, fig('img/orig/09_aliniere.jpg', 'Alinierea într-un software de fotogrametrie: pozițiile camerelor deasupra norului de puncte'), 'a09b', 'Alinierea — animație 3D'),
    {id:'a09b', t:'Alinierea — animație', anim:'anim/09b_aliniere.html', note:note('Pasul 4 — Alinierea', B.p3b)},
    stepSlide('p3c', 5, 'Norul dens de puncte și modelul 3D', B.p3c, fig('img/slides/poster_09c_nor_dens_34.jpg', 'Model 3D texturat, cu imagini oblice pentru clădiri'), 'a09c', 'Nor dens → mesh → model 3D'),
    {id:'a09c', t:'Nor dens și model 3D — animație', anim:'anim/09c_nor_dens.html', note:note('Pasul 5 — Nor dens și model 3D', B.p3c)},
    stepSlide('p4', 6, 'De la DSM la DTM', B.p4 + B.s10, fig('img/orig/10_dtm_orto.jpg', 'Model digital al terenului peste ortofotoplan'), 'a10a', 'Clasificarea punctelor de sol'),
    {id:'a10a', t:'DSM → DTM — animație', anim:'anim/10a_dsm_dtm.html', note:note('Pasul 6 — DSM și DTM', B.p4 + B.s10)},
    stepSlide('p5', 7, 'Ortofotoplanul', B.p5, fig('img/slides/poster_10b_ortofoto_12.jpg', 'Fotografia brută: clădirile „culcate" spre exterior'), 'a10b', 'Ortorectificarea și mozaicul'),
    {id:'a10b', t:'Ortofotoplanul — animație', anim:'anim/10b_ortofoto.html', note:note('Pasul 7 — Ortofotoplanul', B.p5)},
    stepSlide('p6', 8, 'Produsele finale și controlul calității', B.p6, fig('img/slides/poster_11c_produse_12.jpg', 'Produsele aceluiași zbor'), 'a11c', 'Produse și RMSE'),
    {id:'a11c', t:'Produse și control — animație', anim:'anim/11c_produse.html', note:note('Pasul 8 — Produse și control', B.p6)},

    {id:'t12', t:'Aplicații ale fotogrametriei', html:T({kick:'Aplicații', title:'Aplicații ale fotogrametriei în îmbunătățirile funciare', cols:'1fr 1fr', body:B.s12,
      vis:`${fig('img/orig/13_canal_lucrari.jpg', 'Lucrări de impermeabilizare pe un canal de irigații', '--mh:420px')}${fig('img/orig/12_canal.jpg', 'Canal cu lucrări de artă, văzut din dronă', '--mh:220px')}`})},

    {id:'t14', t:'Scanarea 3D cu LiDAR', html:T({kick:'Scanarea 3D', title:'Scanarea 3D cu UAV-uri — tehnologia LiDAR (Light Detection and Ranging)', cols:'0.8fr 1.2fr', body:B.s14 + go('a14', 'LiDAR: ecouri, scanare, sub vegetație'),
      vis:`<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">${[['14_nor1.jpg', 'toate punctele: sol + vegetație'], ['14_nor2.jpg', 'doar punctele de sol (filtrul „Ground Point”)'], ['15_dem1.jpg', 'colorat după cotă — toate punctele'], ['15_dem2.jpg', 'colorat după cotă — doar solul (DTM)']].map(([s, c]) => fig('img/orig/' + s, c, '--mh:230px')).join('')}</div>`})},
    {id:'t16', t:'Procesul de scanare 3D', html:T({kick:'Scanarea 3D', title:'Procesul de scanare 3D cu UAV și prelucrarea datelor', cols:'1.05fr 0.95fr', dense:true, body:B.s16,
      vis:`${fig('img/orig/16_lidar.jpg', 'Nor de puncte LiDAR — clădiri și vegetație')}${go('a14', 'Animația LiDAR')}`})},
    {id:'a14', t:'LiDAR — animație', anim:'anim/14_lidar.html', note:note('Scanarea 3D cu LiDAR', B.s14 + B.s16)},
    {id:'t17', t:'Aplicabilitatea scanării 3D', html:T({kick:'Scanarea 3D', title:'Aplicabilitatea scanării 3D în proiectele de îmbunătățiri funciare', cols:'1fr 1fr', body:B.s17,
      vis:fig('img/orig/17_lidar_canal.jpg', 'Nor de puncte LiDAR al unui bazin, colorat după elevație')})},

    {id:'t18', t:'Avantajele UAV', html:T({kick:'Avantaje', title:'Avantajele utilizării UAV-urilor în lucrările de îmbunătățiri funciare', cols:'1.1fr 0.9fr', body:B.s18 + go('a18', 'Comparatorul metodelor'),
      vis:fig('img/orig/18_nor.jpg', 'Nor de puncte din dronă — un bazin de retenție')})},
    {id:'a18', t:'Comparatorul metodelor', anim:'anim/18_comparator.html', note:note('Avantajele UAV', B.s18)},
    {id:'t19', t:'Concluzii', html:`<div class="s-pad"><div class="kick">Concluzii</div><h2>Concluzii</h2><div class="tx" style="grid-template-columns:1.1fr 0.9fr"><div class="txt">${B.s19}</div>
      <div class="vis">${ret('<b>De reținut:</b> fotogrametria dă imagine, model 3D și ortofotoplan, ieftin și rapid, pe teren liber · LiDAR dă solul și sub vegetație · amândouă depind de un zbor bine planificat și de puncte de control măsurate corect.')}</div></div></div>`}
  ];
})();
