/* Conținutul Cursului 2 — Utilizarea stațiilor totale și a sistemelor GNSS.
   Textele sunt cele din PPTX (corectate, cu date actualizate la octombrie 2026); fiecare slide PPTX are aici
   un slide de text urmat de animația lui. Slide: {id, t, html} sau {id, t, anim, note}. */
(function(){
  window.CURS = {nr:2, titlu:'Stații totale și GNSS'};
  const fig = (src, cap, st) => `<figure class="fig" style="${st||''}"><img src="${src}">${cap ? `<figcaption>${cap}</figcaption>` : ''}</figure>`;
  const go = (id, txt) => `<button class="go" data-go="${id}">▶ ${txt || 'Animație interactivă'}</button>`;
  const ret = txt => `<div class="ret">${txt}</div>`;
  const T = o => `<div class="s-pad"><div class="kick">${o.kick}</div><h2>${o.title}</h2>
    <div class="tx" style="grid-template-columns:${o.cols || '1.05fr 1fr'}"><div class="txt ${o.dense ? 'dense' : ''}">${o.body}</div><div class="vis">${o.vis || ''}</div></div></div>`;
  const note = (h, b) => `<h3>${h}</h3>${b}`;

  const B = {
    s2:`<ul>
      <li>Stațiile totale sunt instrumente moderne folosite pentru măsurători topografice precise.</li>
      <li>Ele combină funcțiile unui <b>teodolit</b> și ale unui <b>distanțometru electronic (EDM)</b>, permițând măsurarea simultană a unghiurilor orizontale și verticale, precum și a distanțelor între puncte.</li>
      <li>Datorită acestei combinații de funcții, stațiile totale sunt esențiale în ridicările topografice pentru proiecte de infrastructură, construcții și îmbunătățiri funciare, cum ar fi sistemele de irigații.</li></ul>`,
    s4:`<p>Stațiile totale sunt alcătuite din mai multe componente esențiale, fiecare având un rol specific în realizarea măsurătorilor precise:</p>
      <p><b>Teodolitul</b></p><ul>
      <li>Este componenta utilizată pentru măsurarea unghiurilor orizontale și verticale și asigură stabilitatea și precizia măsurătorilor unghiulare.</li>
      <li>Teodolitele moderne au integrate sisteme optice și electronice care permit citirea unghiurilor cu o precizie de ordinul secundelor de arc.</li></ul>
      <p><b>Distanțometrul (EDM — Electronic Distance Measurement)</b></p><ul>
      <li>Utilizează un fascicul de lumină sau laser pentru a măsura distanța dintre stația totală și punctul țintă.</li>
      <li>Distanța se calculează din timpul de propagare a fasciculului reflectat de țintă sau din diferența de fază dintre unda emisă și cea reflectată.</li>
      <li>Stațiile totale pot măsura distanțe de ordinul kilometrilor cu precizie ridicată.</li></ul>
      <p><b>Computerul integrat</b></p><ul>
      <li>Permite procesarea și stocarea datelor: coordonatele punctelor măsurate (X, Y, Z), unghiurile și distanțele, exportate apoi pentru prelucrare în AutoCAD sau în soluții GIS.</li></ul>`,
    s5:`<p>Stațiile totale oferă mai multe avantaje în comparație cu alte metode de măsurători, inclusiv cu sistemele GNSS, în anumite situații:</p>
      <p><b>Precizia ridicată</b> — stațiile totale permit obținerea coordonatelor și distanțelor la nivel de milimetru. Precizia este esențială în îmbunătățirile funciare, de exemplu la canalele de irigații, unde orice deviație poate afecta distribuția apei.</p>
      <p><b>Independența față de semnalele GNSS</b> — nu depind de sateliți, deci sunt ideale în zone unde semnalul GNSS este slab sau inexistent: zone împădurite, terenuri abrupte, regiuni izolate.</p>
      <p><b>Versatilitate în aplicare</b> — pe lângă ridicările topografice, sunt folosite la monitorizarea deformărilor, măsurători de construcție, cadastru și proiecte de infrastructură de mari dimensiuni, cum ar fi drumurile și autostrăzile.</p>`,
    s6:`<ul>
      <li>Stațiile totale sunt utilizate frecvent în lucrările de îmbunătățiri funciare datorită capacității lor de a oferi măsurători de precizie în teren.</li>
      <li>În proiectele de irigații ele măsoară și cartografiază cu exactitate terenurile, identificând <b>diferențele de nivel</b> și proiectând <b>traseele ideale pentru canale</b>.</li>
      <li>Măsurătorile sunt folosite pentru a crea <b>modele digitale ale terenului (DTM)</b>, din care software-ul de specialitate generează planuri topografice detaliate, <b>curbe de nivel</b> și <b>profile transversale și longitudinale</b>.</li>
      <li>Aceste informații sunt critice în proiectarea infrastructurilor de irigații: permit calculul <b>volumelor de excavare</b>, estimarea costurilor și optimizarea curgerii apei în funcție de configurația terenului.</li>
      <li>Stațiile totale oferă un echilibru între precizie, versatilitate și independență față de semnalele GNSS și contribuie la folosirea eficientă a resurselor de apă și la creșterea productivității agricole.</li></ul>`,
    s7:`<p>Tehnologia <b>GNSS</b> (Global Navigation Satellite System) este esențială pentru măsurătorile topografice moderne, oferind poziționare rapidă și precisă pe întreaga suprafață a Pământului. GNSS este un termen generic care include mai multe sisteme de poziționare prin satelit:</p><ul>
      <li><b>GPS</b> (Global Positioning System) — sistemul american;</li>
      <li><b>GLONASS</b> (Globalnaya Navigatsionnaya Sputnikovaya Sistema) — sistemul rusesc;</li>
      <li><b>BeiDou</b> — sistemul chinezesc;</li>
      <li><b>Galileo</b> — sistemul european;</li>
      <li>și sistemele regionale <b>QZSS</b> (Japonia) și <b>NavIC</b> (India).</li></ul>
      <p>Aceste sisteme funcționează prin constelații de sateliți care orbitează Pământul și transmit semnale radio către receptoarele de la sol. Receptorul calculează poziția pe baza semnalelor de la <b>minimum patru sateliți</b> — trei pentru coordonate și unul pentru eroarea de ceas a receptorului.</p>`,
    s8a:`<p>Fiecare sistem GNSS operează cu propria constelație de sateliți și tehnologii, oferind servicii variate de poziționare.</p>
      <p><b>GPS</b> — cel mai cunoscut și utilizat sistem de poziționare globală, dezvoltat de Departamentul Apărării al SUA; oferă poziționare 24 de ore pe zi, în orice condiții meteorologice. În septembrie 2026: <b>32 de sateliți operaționali</b>, pe 6 plane orbitale, la ~20.200 km, cu semnale pe mai multe frecvențe (L1, L2, L5).</p>
      <p><b>GLONASS</b> — sistemul rusesc, cu <b>24 de sateliți</b> pe 3 plane, la ~19.100 km. Este utilizat pentru aplicații militare și civile; datorită înclinării mari a orbitelor (64,8°) este foarte performant în regiunile nordice.</p>`,
    s8b:`<p><b>BeiDou</b> — dezvoltat de China în trei etape: BeiDou-1 (2000, experimental), BeiDou-2 (2012, regional, Asia–Pacific) și <b>BeiDou-3</b> (2020, global). Azi: <b>35 de sateliți BeiDou-3</b> (MEO, IGSO și GEO), plus sateliți BeiDou-2 încă în serviciu.</p>
      <p><b>Galileo</b> — sistemul Uniunii Europene, pentru aplicații civile, inclusiv serviciul gratuit de înaltă precizie HAS. Constelația are <b>28 de sateliți utilizabili</b> din 34 lansați (sept. 2026); din 2026 începe lansarea celei de-a doua generații.</p>
      <p><b>QZSS</b> (Japonia, 6 sateliți) și <b>NavIC</b> (India, 3 sateliți funcționali) sunt sisteme regionale, care completează constelațiile globale.</p>`,
    s9a:`<p><b>Poziționarea prin trilaterație</b></p><ul>
      <li>Poziționarea GNSS se bazează pe măsurarea distanțelor (pseudodistanțelor) față de cel puțin patru sateliți aflați pe orbite diferite.</li>
      <li>Fiecare satelit emite un semnal care conține momentul exact al emisiei și poziția satelitului în spațiu.</li>
      <li>Receptorul calculează distanța față de fiecare satelit din timpul de propagare a semnalului, înmulțit cu viteza luminii.</li>
      <li>Cu patru sateliți se determină coordonatele X, Y, Z și eroarea de ceas a receptorului; cu mai mulți sateliți, precizia crește considerabil.</li></ul>`,
    s9b:`<p><b>Sistemele RTK (Real-Time Kinematic)</b></p><ul>
      <li>Pentru precizie centimetrică se folosește <b>faza undei purtătoare</b>, în timp real.</li>
      <li>Un receptor fix (stație de bază) într-un punct cunoscut — sau o rețea de stații permanente, ca <b>ROMPOS</b> — transmite corecții către receptorul mobil (rover), care obține astfel poziționare de înaltă precizie.</li></ul>
      <p><b>Corecțiile diferențiale (DGPS / DGNSS)</b></p><ul>
      <li>Stațiile de referință, cu poziții cunoscute, calculează erorile și transmit corecții receptorilor mobili.</li>
      <li>Corecțiile reduc erorile cauzate de atmosferă, orbite și ceasuri, oferind precizie submetrică — mai bună decât poziționarea GNSS autonomă.</li></ul>`,
    s10:`<p>Măsurătorile GNSS sunt esențiale în proiectele de îmbunătățiri funciare datorită vitezei, flexibilității și preciziei ridicate. Ele permit colectarea rapidă a datelor despre teren și generarea de planuri topografice detaliate, necesare pentru proiectarea și implementarea sistemelor de irigații și drenaj.</p>
      <p><b>Măsurători rapide și eficiente</b> — pe suprafețe mari, cu timp și costuri de teren reduse.</p>
      <p><b>Crearea modelelor digitale ale terenului (DTM)</b> — date precise de altitudine și planimetrie pentru proiectarea rețelelor de canale de irigații și a altor lucrări de îmbunătățiri funciare.</p>
      <p><b>Monitorizarea și întreținerea infrastructurilor</b> — prin măsurători GNSS repetate se urmăresc deformările și schimbările terenului, permițând intervenții rapide pentru menținerea eficienței sistemelor de irigații și drenaj.</p>`
  };

  window.S = [
    {id:'titlu', t:'Titlu', html:`<div class="title-bg"></div><iframe data-src="anim/00_glob.html" class="deco" style="position:absolute;inset:auto;right:60px;top:110px;width:820px;height:820px;pointer-events:none;background:transparent"></iframe>
      <div class="s-pad" style="right:780px">
        <div style="display:flex;gap:22px;align-items:center;margin-bottom:34px"><img src="img/slides/sigla_1.png" style="height:120px"><img src="img/slides/sigla_2.jpg" style="height:120px">
          <div style="font-size:20px;line-height:1.35;color:var(--muted)">UNIVERSITATEA DE ȘTIINȚE AGRONOMICE ȘI MEDICINĂ VETERINARĂ BUCUREȘTI<br>Facultatea de Îmbunătățiri Funciare și Ingineria Mediului<br>Ciclul II — Master · Proiectarea Lucrărilor de Îmbunătățiri Funciare · Anul I</div></div>
        <div class="kick">Capitolul 2</div><h1 style="font-size:64px">Utilizarea stațiilor totale și a sistemelor GNSS în lucrările de îmbunătățiri funciare</h1>
        <p style="font-size:32px;margin-top:22px">Măsurători realizate cu stațiile totale și determinări cu echipamentele GNSS</p>
        <p class="muted" style="font-size:24px;margin-top:30px">← → navigare · F ecran complet · N note de curs · Spațiu = pauză</p></div>`},

    {id:'t02', t:'Stații totale', html:T({kick:'Stații totale', title:'Stații totale', cols:'1.1fr 0.9fr', body:B.s2 + go('a02', 'De la teodolit la stația robotizată'),
      vis:fig('img/orig/02_statie.jpg', 'Stație totală', '--mh:700px')})},
    {id:'t04', t:'Componentele stațiilor totale', html:T({kick:'Stații totale', title:'Funcționarea și componentele stațiilor totale', cols:'1.15fr 0.85fr', dense:true, body:B.s4,
      vis:`${fig('img/orig/04_teodolite.jpg', 'Teodolite clasice: Karl Zeiss Jena THEO 020 / 010, Wild T2 / T3')}${go('a02', 'Evoluția și componentele — animație')}`})},
    {id:'a02', t:'Evoluția stației totale', anim:'anim/02_evolutie.html', note:note('Funcționarea și componentele stațiilor totale', B.s4)},

    {id:'t03', t:'Echipamente', html:T({kick:'Echipamentul de teren', title:'Stații totale, trepiede și accesorii', cols:'0.55fr 1.45fr',
      body:`<p>Echipamentul de teren al unei ridicări cu stația totală:</p><ul><li><b>stația totală</b> — clasică, robotizată sau cu scanare;</li><li><b>trepiedul</b> — din lemn sau aluminiu;</li><li><b>ambaza</b> — calare și centrare;</li><li><b>jaloanele și bastoanele</b> pentru prismă;</li><li><b>reflectoarele</b> — prisme circulare, mini-prisme, prisme 360°, ținte reflectorizante.</li></ul>${go('a03', 'Echipamentele, pe rând')}`,
      vis:`<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">${fig('img/orig/03_statii.jpg', 'Stații totale', '--mh:330px')}${fig('img/orig/03_jaloane.jpg', 'Jaloane topografice', '--mh:330px')}${fig('img/orig/03_trepiede.jpg', 'Trepiede', '--mh:330px')}${fig('img/orig/03_reflectoare.jpg', 'Bastoane și prisme reflectorizante', '--mh:330px')}</div>`})},
    {id:'a03', t:'Echipamente — pe rând', anim:'anim/03_echipamente.html', note:note('Stații totale, trepiede și accesorii', '<p>Stația totală, trepiedul, ambaza, jaloanele și bastoanele, reflectoarele — fiecare cu rolul său și cu punctele la care trebuie atenție (constanta prismei, înălțimea țintei, centrarea).</p>')},

    {id:'t05', t:'Avantajele stațiilor totale', html:T({kick:'Stații totale', title:'Avantajele măsurătorilor realizate cu stațiile totale', cols:'1.2fr 0.8fr', dense:true, body:B.s5 + go('a05'),
      vis:fig('img/orig/05_santier.jpg', 'Stație totală pe șantier', '--mh:680px')})},
    {id:'a05', t:'Avantaje — animație', anim:'anim/05_avantaje.html', note:note('Avantajele stațiilor totale', B.s5)},

    {id:'t06', t:'Stația totală în îmbunătățiri funciare', html:T({kick:'Stații totale', title:'Utilizarea stațiilor totale în lucrările de îmbunătățiri funciare', cols:'1.05fr 0.95fr', dense:true, body:B.s6,
      vis:`${fig('img/slides/poster_06_dtm_canal_27.jpg', 'Din punctele măsurate: DTM, curbe de nivel, profil, secțiuni și volume')}${go('a06', 'De la măsurători la proiectul canalului')}`})},
    {id:'a06', t:'DTM și canal — animație', anim:'anim/06_dtm_canal.html', note:note('Stația totală în îmbunătățiri funciare', B.s6)},

    {id:'t07', t:'Măsurători GNSS', html:T({kick:'Măsurători GNSS', title:'Introducere în GNSS și sistemele globale de poziționare', cols:'1fr 1fr', dense:true, body:B.s7 + go('a07', 'Constelațiile GNSS în jurul Pământului'),
      vis:fig('img/orig/07_gnss.jpg', 'GPS, GLONASS, BeiDou, Galileo')})},
    {id:'a07', t:'Constelațiile GNSS', anim:'anim/07_constelatii.html', note:note('Introducere în GNSS', B.s7)},

    {id:'t08', t:'Sisteme globale GNSS', html:T({kick:'Măsurători GNSS', title:'Sisteme globale de poziționare GNSS', cols:'1fr 1fr', dense:true, body:B.s8a,
      vis:`<div class="txt dense">${B.s8b}</div>${ret('Cifrele sunt la zi pentru septembrie–octombrie 2026 (surse: U.S. Coast Guard NAVCEN, EUSPA GSC, CSNO BeiDou, JAXA, ISRO).')}${go('a08', 'Date comparative')}`})},
    {id:'a08', t:'Sistemele GNSS — date', anim:'anim/08_sisteme.html', note:note('Sisteme globale de poziționare GNSS', B.s8a + B.s8b)},

    {id:'t09', t:'Principiile GNSS', html:T({kick:'Măsurători GNSS', title:'Principiile de funcționare ale GNSS', cols:'1fr 1fr', dense:true, body:B.s9a + fig('img/orig/09_gps.jpg', 'Trilaterația: distanțe față de mai mulți sateliți', '--mh:250px'),
      vis:`<div class="txt dense">${B.s9b}</div>${ret('În România, corecțiile RTK și DGNSS sunt oferite de <b>ROMPOS</b> (ANCPI): 74 de stații permanente, acces prin internet (NTRIP).')}${go('a09', 'Poziționarea cu corecții și controlerul RTK')}`})},
    {id:'a09', t:'Poziționarea cu corecții', anim:'anim/09_rtk.html', note:note('Principiile de funcționare ale GNSS', B.s9a + B.s9b)},

    {id:'t10', t:'Aplicații GNSS', html:T({kick:'Măsurători GNSS', title:'Aplicații GNSS în lucrările de îmbunătățiri funciare', cols:'1.1fr 0.9fr', dense:true, body:B.s10 + go('a10'),
      vis:fig('img/orig/10_teren.jpg', 'Măsurători GNSS RTK pe un canal de irigații', '--mh:680px')})},
    {id:'a10', t:'Aplicații GNSS — animație', anim:'anim/10_aplicatii.html', note:note('Aplicații GNSS în îmbunătățiri funciare', B.s10)},

    {id:'bib', t:'Surse', html:`<div class="s-pad"><div class="kick">Surse și date actuale</div><h2>Surse pentru datele despre sistemele GNSS (octombrie 2026)</h2>
      <div class="tx biblio" style="grid-template-columns:1fr 1fr"><ul>
        <li>GPS — U.S. Coast Guard Navigation Center: navcen.uscg.gov/gps-constellation</li>
        <li>Galileo — European GNSS Service Centre: gsc-europa.eu/system-service-status/constellation-information</li>
        <li>BeiDou — China Satellite Navigation Office: en.beidou.gov.cn</li>
        <li>GLONASS — eoPortal / Information and Analysis Center (IAC)</li></ul><ul>
        <li>QZSS — JAXA: comunicatul lansării Michibiki 7 (11.08.2026)</li>
        <li>NavIC — ISRO: misiunea NVS-03 (GSLV-F18)</li>
        <li>ROMPOS — ANCPI: rompos.ro (servicii DGNSS, RTK, NTRIP)</li>
        <li class="muted">Pozițiile sateliților din animații sunt ilustrative (orbite circulare), cu altitudini, înclinări și perioade reale.</li></ul></div></div>`}
  ];
})();
