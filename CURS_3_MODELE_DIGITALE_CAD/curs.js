/* Conținutul Cursului 3 — Modelul digital al terenului și utilizarea software-urilor CAD.
   Textele sunt cele din PPTX (corectate); fiecare slide PPTX are aici un slide de text / imagini urmat de animația lui. */
(function(){
  window.CURS = {nr:3, titlu:'Modelul digital al terenului și CAD'};
  const fig = (src, cap, st) => `<figure class="fig" style="${st||''}"><img src="${src}">${cap ? `<figcaption>${cap}</figcaption>` : ''}</figure>`;
  const go = (id, txt) => `<button class="go" data-go="${id}">▶ ${txt || 'Animație interactivă'}</button>`;
  const ret = txt => `<div class="ret">${txt}</div>`;
  const T = o => `<div class="s-pad"><div class="kick">${o.kick}</div><h2>${o.title}</h2>
    <div class="tx" style="grid-template-columns:${o.cols || '1.05fr 1fr'}"><div class="txt ${o.dense ? 'dense' : ''}">${o.body}</div><div class="vis">${o.vis || ''}</div></div></div>`;
  const note = (h, b) => `<h3>${h}</h3>${b}`;
  const thumbs = (arr, cols) => `<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:12px">${arr.map(([s, c]) => fig('img/orig/' + s, c, '--mh:250px')).join('')}</div>`;

  const B = {
    s2:`<ul>
      <li>Modelul digital al terenului (MDT) este o reprezentare tridimensională a suprafeței terenului, generată pe baza datelor topografice colectate prin diferite metode: măsurători terestre, tehnologii aeropurtate UAV sau măsurători GNSS.</li>
      <li>Modelele digitale sunt esențiale în proiectele de îmbunătățiri funciare, în special pentru planificarea și proiectarea infrastructurii de irigații și drenaj: oferă o imagine detaliată a topografiei și permit analizele și calculele necesare.</li>
      <li>Ele sunt utilizate pentru a vizualiza și analiza relieful; în lucrările de irigații ajută la proiectarea eficientă a canalelor și a sistemelor de distribuție a apei, prin identificarea diferențelor de nivel și a traseelor optime pentru curgerea apei.</li></ul>
      ${ret('Termeni: <b>DEM</b> — model digital de elevație (termenul general) · <b>DTM</b> — terenul natural, fără vegetație și construcții · <b>DSM</b> — suprafața cu tot ce se află pe ea (arbori, clădiri). Pentru proiectare se folosește DTM.')}`,
    s3:`<ul>
      <li>Norul de puncte este o colecție de puncte tridimensionale care reprezintă suprafața terenului și obiectele de pe ea, obținut prin scanare laser (<b>LiDAR</b>) — din UAV, de la sol sau de pe vehicule — ori prin <b>fotogrametrie</b>.</li>
      <li>Fiecare punct are coordonatele <b>X, Y și Z</b>, care definesc poziția și altitudinea lui, iar adesea și culoare (RGB), intensitate și o clasă (sol, vegetație, construcții, apă).</li>
      <li>Norii de puncte oferă o descriere detaliată a terenului; după clasificare și filtrarea solului se generează modelele digitale, curbele de nivel și profilele transversale și longitudinale.</li></ul>`,
    s7:`<ul>
      <li>Curbele de nivel sunt linii care unesc punctele de pe teren cu aceeași altitudine și sunt esențiale pentru înțelegerea topografiei unui teren.</li>
      <li>Ele oferă o reprezentare grafică clară a reliefului și sunt utilizate frecvent în planurile topografice.</li>
      <li>Se generează din norul de puncte sau din măsurătorile GNSS și se prelucrează în software specializat, precum AutoCAD (cu extensii de topografie) și Civil 3D.</li>
      <li>Generarea curbelor de nivel este un pas esențial în proiectarea sistemelor de irigații și drenaj: permite determinarea pantei terenului, necesară pentru calculul curgerii apei și pentru proiectarea optimă a canalelor.</li></ul>`,
    s13:`<p><b>Definirea profilelor transversale și longitudinale</b></p>
      <p>Profilele sunt secțiuni verticale ale terenului, realizate de-a lungul unor linii prestabilite pe modelul digital al terenului. Ele permit evaluarea detaliată a reliefului de-a lungul unei rute sau zone de interes, cum ar fi traseul unui canal de irigații sau al unei rețele de drenaj.</p><ul>
      <li><b>Profilele transversale</b> sunt secțiuni perpendiculare pe traseul principal al proiectului; ele arată variația altitudinii de o parte și de alta a axei, în dreptul fiecărui pichet.</li>
      <li><b>Profilele longitudinale</b> urmăresc traseul principal al proiectului, cum ar fi un canal de irigații, și arată variațiile de altitudine de-a lungul acelei rute.</li></ul>`,
    s14:`<ul>
      <li>Profilele transversale și longitudinale sunt esențiale în proiectele de irigații și drenaj, deoarece oferă o perspectivă detaliată asupra topografiei terenului.</li>
      <li>Ele sunt utilizate pentru a calcula volumul de material care trebuie excavat sau adăugat, precum și pentru a determina panta necesară pentru curgerea eficientă a apei.</li>
      <li>De exemplu, în proiectarea unui canal de irigații, profilul longitudinal asigură o pantă continuă spre aval: apa nu stagnează în puncte joase, iar viteza nu crește atât de mult încât să erodeze canalul.</li></ul>`,
    s21:`<p><b>AutoCAD</b> este unul dintre cele mai utilizate programe pentru desen tehnic și proiectare, folosit pe scară largă în inginerie, arhitectură și topografie.</p>
      <p>În proiectele de îmbunătățiri funciare, AutoCAD permite importul și procesarea datelor topografice colectate prin metode tradiționale sau aeropurtate și generarea planurilor detaliate.</p>`,
    s22:`<p><b>TopoLT</b> și <b>ProfLT</b> sunt două extensii dezvoltate de compania românească 3D Space pentru AutoCAD și alte programe CAD compatibile (BricsCAD, ZWCAD, GstarCAD). Ele sunt folosite în topografie, cadastru și proiectarea în construcții.</p>
      <p><b>TopoLT</b> — topografie și cadastru: importul și exportul punctelor topografice; generarea automată a curbelor de nivel; profile longitudinale și transversale; calculul suprafețelor și volumelor; trasarea automată a elementelor topografice și gestionarea datelor din teren.</p>
      <p><b>ProfLT</b> — proiectarea profilelor longitudinale și transversale pentru drumuri, căi ferate, rețele de utilități și canale: generarea rapidă a profilelor din datele de teren; crearea și editarea profilelor de teren și de proiect; calculul diferențelor de nivel, distanțelor și al altor parametri de proiectare.</p>`,
    s23:`<p><b>Proiectarea canalelor de irigații și drenaj</b> — modelele digitale și curbele de nivel generate în AutoCAD sau Civil 3D permit vizualizarea topografiei și alegerea pantelor care asigură o curgere optimă a apei, fără eroziune sau acumulări excesive.</p>
      <p><b>Calcularea volumelor de excavat</b> — din profilele transversale și longitudinale se calculează volumul exact de material de excavat sau de adăugat; se evită supraestimarea sau subestimarea cantităților și se optimizează costurile.</p>
      <p><b>Monitorizarea și întreținerea infrastructurii</b> — modelele actualizate periodic arată deformările terenului și modificările rețelelor de irigații (colmatări, eroziuni, tasări), permițând intervenții rapide și eficiente.</p>`,
    s24:`<ul>
      <li>Modelul digital al terenului (MDT) și utilizarea software-urilor specializate, cum ar fi AutoCAD, joacă un rol crucial în proiectarea și implementarea lucrărilor de îmbunătățiri funciare.</li>
      <li>Generarea curbelor de nivel, a profilelor transversale și longitudinale, precum și calcularea volumelor de excavat sunt esențiale pentru o infrastructură eficientă și sustenabilă de irigații și drenaj.</li>
      <li>Prin utilizarea acestor tehnologii se pot reduce costurile și se poate îmbunătăți performanța generală a proiectelor de irigații.</li></ul>`
  };
  const FLUX = ['Măsurători (stație totală, GNSS, UAV)', 'Nor de puncte · clasificare', 'Model digital al terenului (DTM)', 'Curbe de nivel', 'Axa și profilele', 'Volume · proiect · monitorizare'];

  window.S = [
    {id:'titlu', t:'Titlu', html:`<div class="title-bg"></div><iframe data-src="anim/00_glob.html" class="deco" style="position:absolute;inset:auto;right:60px;top:110px;width:820px;height:820px;pointer-events:none;background:transparent"></iframe>
      <div class="s-pad" style="right:780px">
        <div style="display:flex;gap:22px;align-items:center;margin-bottom:34px"><img src="img/slides/sigla_1.png" style="height:120px"><img src="img/slides/sigla_2.jpg" style="height:120px">
          <div style="font-size:20px;line-height:1.35;color:var(--muted)">UNIVERSITATEA DE ȘTIINȚE AGRONOMICE ȘI MEDICINĂ VETERINARĂ BUCUREȘTI<br>Facultatea de Îmbunătățiri Funciare și Ingineria Mediului<br>Ciclul II — Master · Proiectarea Lucrărilor de Îmbunătățiri Funciare · Anul I</div></div>
        <div class="kick">Capitolul 3</div><h1>Modelul digital al terenului și utilizarea softurilor CAD</h1>
        <p style="font-size:32px;margin-top:22px">Nor de puncte · curbe de nivel · profile · volume</p>
        <p class="muted" style="font-size:24px;margin-top:30px">← → navigare · F ecran complet · N note de curs · Spațiu = pauză</p></div>`},

    {id:'t02', t:'Modelarea digitală a terenului', html:T({kick:'Modelul digital al terenului', title:'Modelarea digitală a terenului — curbe de nivel, profile transversale și longitudinale', cols:'1.05fr 0.95fr', dense:true, body:B.s2 + go('a02', 'DEM: puncte → TIN → DSM / DTM → pante'),
      vis:fig('img/orig/02_dem.jpg', 'Model digital de elevație — valea unui râu')})},
    {id:'a02', t:'Modelul digital — animație', anim:'anim/02_dem.html', note:note('Modelul digital al terenului', B.s2)},

    {id:'t03', t:'Norul de puncte', html:T({kick:'Norul de puncte', title:'Norul de puncte', cols:'1fr 1fr', body:B.s3 + go('a03', 'Norul de puncte: scanare, culori, clasificare, profil'),
      vis:fig('img/orig/03_nor.jpg', 'Nor de puncte colorat după elevație')})},
    {id:'t04', t:'Extrase din norul de puncte', html:`<div class="s-pad"><div class="kick">Norul de puncte</div><h2>Extrase din norul de puncte — canalul magistral</h2>
      <div style="display:grid;grid-template-columns:1.25fr 1fr;gap:18px">${fig('img/orig/04_canal_nor.jpg', 'Canalul magistral cu digurile și drumul de serviciu — nor de puncte colorat RGB', '--mh:640px;grid-row:span 2')}
      ${fig('img/orig/05_extras2.jpg', 'Extras din norul de puncte — 2', '--mh:300px')}${fig('img/orig/06_extras1.jpg', 'Extras din norul de puncte — 1', '--mh:300px')}</div></div>`},
    {id:'a03', t:'Norul de puncte — animație', anim:'anim/03_nor_puncte.html', note:note('Norul de puncte', B.s3)},

    {id:'t07', t:'Generarea curbelor de nivel', html:T({kick:'Curbe de nivel', title:'Generarea curbelor de nivel', cols:'0.95fr 1.05fr', body:B.s7 + go('a07', 'Curbele de nivel: apa care urcă'),
      vis:fig('img/orig/pl_07_curbe.jpg', 'Curbe de nivel generate dintr-un model digital')})},
    {id:'a07', t:'Curbele de nivel — animație', anim:'anim/07_curbe.html', note:note('Generarea curbelor de nivel', B.s7)},

    {id:'t09', t:'Amenajarea râurilor ce intersectează CMSB', html:`<div class="s-pad"><div class="kick">Exemple din proiecte</div><h2>Amenajarea râurilor și văilor ce intersectează CMSB</h2>
      <p style="margin-top:-10px">Canalul Magistral Siret–Bărăgan: planuri de situație realizate pe baza modelului digital al terenului — curbe de nivel, albii regularizate, traversări.</p>
      ${thumbs([['pl_09_susita1.jpg', 'Râul Susița (1)'], ['pl_10_susita2.jpg', 'Râul Susița (2)'], ['pl_11_susita3.jpg', 'Râul Susița (3)'], ['pl_12_vinalcool.jpg', 'Valea Vinalcool']], 4)}
      ${go('v09', 'Deschide planșele (zoom)')}</div>`},
    {id:'v09', t:'Planșele CMSB', anim:'anim/09_planse.html#0', note:note('Planșele proiectului', '<p>Planuri de situație: canalul magistral Siret–Bărăgan, albiile regularizate ale râurilor (Susița, Valea Vinalcool), curbele de nivel generate din norul de puncte. Rotița = zoom, mouse = deplasare.</p>')},

    {id:'t13', t:'Profile transversale și longitudinale', html:T({kick:'Profile', title:'Profile transversale și longitudinale', cols:'1fr 1fr', body:B.s13,
      vis:`${fig('img/slides/poster_13_profile_19.jpg', 'Profilul longitudinal: terenul și fundul canalului proiectat')}${go('a13', 'Cortina care se desfășoară în profil')}`})},
    {id:'t14', t:'Importanța profilelor', html:T({kick:'Profile', title:'Importanța profilelor în proiectele de îmbunătățiri funciare', cols:'1fr 1fr', body:B.s14,
      vis:`${fig('img/slides/poster_13_profile_27.jpg', 'Greșeala tipică: contrapanta în care apa stagnează')}${go('a13', 'Animația profilelor')}`})},
    {id:'a13', t:'Profile — animație', anim:'anim/13_profile.html', note:note('Profile transversale și longitudinale', B.s13 + B.s14)},

    {id:'t15', t:'Profile și volume cu ProfLT', html:`<div class="s-pad"><div class="kick">Exemple din proiecte</div><h2>Profile și volume realizate cu ProfLT — C.M. Siret–Bărăgan</h2>
      ${thumbs([['pl_15_profil_transversal.jpg', 'Profil transversal'], ['pl_16_profil_longitudinal.jpg', 'Profil longitudinal 6'], ['pl_17_profile_teren.jpg', 'Profile transversale ale terenului (la 50 m)'],
        ['pl_18_profile_proiectate.jpg', 'Profile transversale proiectate'], ['pl_19_profil_longitudinal6.jpg', 'Profil longitudinal 6 — detaliu'], ['pl_20_volume.jpg', 'Calculul volumelor săpătură / umplutură']], 3)}
      <div style="display:flex;gap:14px">${go('v15', 'Deschide planșele (zoom)')}${go('a15', 'Cum se construiește și se citește o planșă de profil')}</div></div>`},
    {id:'v15', t:'Planșele de profil', anim:'anim/09_planse.html#5', note:note('Planșele de profil', '<p>Profil transversal, profile longitudinale, profile transversale de teren și proiectate (din 50 în 50 m), calculul volumelor. Rotița = zoom, mouse = deplasare.</p>')},
    {id:'a15', t:'Planșa de profil — animație', anim:'anim/15_profil_cad.html', note:note('Profile și volume', '<p>Profilul longitudinal cu „chitara" de date (cote teren, cote proiect, adâncimi, distanțe, pante), profilul transversal cu secțiunea tip și aria de săpătură, volumele prin metoda secțiunilor medii: V = (A₁ + A₂)/2 × d.</p>')},

    {id:'t21', t:'AutoCAD și extensiile TopoLT, ProfLT', html:T({kick:'Software', title:'Utilizarea software-ului AutoCAD și a extensiilor TopoLT și ProfLT', cols:'1.25fr 0.75fr', dense:true, body:B.s21 + B.s22,
      vis:`<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">${fig('img/orig/21_autocad.png', 'AutoCAD + pachetul TopoLT', 'grid-column:span 2;--mh:200px')}${fig('img/orig/22_proflt.png', 'ProfLT', '--mh:160px')}${fig('img/orig/22_topolt.png', 'TopoLT', '--mh:160px')}</div>${go('a21', 'Fluxul de lucru în CAD — simulare')}`})},
    {id:'a21', t:'Fluxul de lucru în CAD', anim:'anim/21_cad_flux.html', note:note('AutoCAD, TopoLT, ProfLT', B.s21 + B.s22)},

    {id:'t23', t:'Aplicații în îmbunătățiri funciare', html:T({kick:'Aplicații', title:'Aplicații ale modelelor digitale și ale software-urilor în lucrările de îmbunătățiri funciare', cols:'1.1fr 0.9fr', dense:true, body:B.s23,
      vis:`${fig('img/slides/poster_23_monitorizare_18.jpg', 'Monitorizare: diferența a două modele digitale ale canalului')}${go('a23', 'Monitorizarea canalului — colmatare și eroziune')}`})},
    {id:'a23', t:'Monitorizare — animație', anim:'anim/23_monitorizare.html', note:note('Aplicații', B.s23)},

    {id:'t24', t:'Concluzii', html:`<div class="s-pad"><div class="kick">Concluzii</div><h2>Concluzii</h2><div class="tx" style="grid-template-columns:1.1fr 0.9fr"><div class="txt">${B.s24}</div>
      <div class="vis" style="gap:10px">${FLUX.map((f, i) => `<div class="card" style="padding:14px 20px;font-size:26px;display:flex;align-items:center;gap:14px"><span style="color:var(--cyan);font-weight:800;font-size:30px">${i+1}</span>${f}</div>${i < FLUX.length - 1 ? '<div style="text-align:center;color:var(--muted);font-size:22px;line-height:.6">▼</div>' : ''}`).join('')}</div></div></div>`}
  ];
})();
