/* Conținutul Cursului 1 — Proiecții cartografice.
   Textele sunt cele din PPTX-ul corectat (aceleași ca în build_pptx.py); fiecare slide PPTX are aici
   un slide de text urmat de animația lui. Slide: {id, t, html} sau {id, t, anim, note}. */
(function(){
  window.CURS = {nr:1, titlu:'Proiecții cartografice'};
  // ---------- utilitare de compunere
  const fig = (src, cap, st) => `<figure class="fig" style="${st||''}"><img src="${src}">${cap ? `<figcaption>${cap}</figcaption>` : ''}</figure>`;
  const go = (id, txt) => `<button class="go" data-go="${id}">▶ ${txt || 'Animație interactivă'}</button>`;
  const ret = txt => `<div class="ret">${txt}</div>`;
  // slide de text: coloană de text + coloană vizuală
  const T = o => `<div class="s-pad"><div class="kick">${o.kick}</div><h2>${o.title}</h2>
    <div class="tx" style="grid-template-columns:${o.cols || '1.05fr 1fr'}"><div class="txt ${o.dense ? 'dense' : ''}">${o.body}</div><div class="vis">${o.vis || ''}</div></div></div>`;

  // ---------- textele (din PPTX)
  const B = {
    s2:`<ul>
      <li><b>Suprafața topografică</b> – suprafața terenului așa cum o vedem în teren</li>
      <li><b>Suprafața geoidului</b> – suprafața echipotențială a gravității (≈ nivelul mediu al mării)</li>
      <li><b>Suprafața elipsoidului</b> – suprafață matematică ce aproximează geoidul</li></ul>
      ${ret('Legătura dintre înălțimi: <b>h = H + N</b> — h din GNSS (elipsoid), H altitudinea (geoid / cvasigeoid), N ondulația geoidului.')}`,
    s3:`<p>Proiecțiile cartografice reprezintă tehnica prin care suprafața curbă a Pământului, aproximată printr-un elipsoid, este transpusă într-o reprezentare plană – planul sau harta – pentru utilizare practică în ridicările topografice și în inginerie.</p>
      <p>Aceste transformări sunt necesare pentru a face măsurători precise și aplicabile în proiectarea de lucrări precum sistemele de irigații sau alte îmbunătățiri funciare.</p>`,
    s4intro:`Există mai multe tipuri de proiecții cartografice, fiecare având avantajele și limitările sale. De exemplu:`,
    s4:[`<b>Proiecțiile conforme</b>, cum ar fi proiecția Mercator, conservă unghiurile, fiind utile în navigație și inginerie.`,
        `<b>Proiecțiile echivalente</b> păstrează suprafețele, fiind ideale pentru reprezentarea teritoriilor și studiile geografice.`,
        `<b>Proiecțiile echidistante</b> mențin distanțele între puncte pe anumite direcții, utilizate pentru scopuri specifice.`],
    s5:`<ul>
      <li>Unul dintre marile dezavantaje ale proiecțiilor cartografice este că nu există o proiecție unică ce poate conserva toate elementele (unghiuri, distanțe, suprafețe) simultan.</li>
      <li>Așadar, alegerea unei proiecții depinde de natura proiectului și de scopul măsurătorilor.</li>
      <li>Proiecția <b>Stereo 70</b>, specifică României, este folosită în măsurătorile topografice și cadastrale, adaptându-se la forma și dimensiunea teritoriului național.</li>
      <li>Este esențială în proiecte de îmbunătățiri funciare, cum ar fi irigațiile sau drenajul, datorită preciziei pe care o oferă la scară mare.</li></ul>`,
    s6:`<p>Proiecția <b>Stereo 70</b> este o proiecție stereografică oblică, conformă, cu plan secant, utilizată în România pentru ridicările topografice și cadastrale la scară mare.</p>
      <p>Proiecțiile conforme sunt cele care mențin unghiurile dintre punctele de pe hartă, fiind ideale în aplicațiile de inginerie, unde fiecare deviație poate duce la erori mari.</p>
      <p><b>Caracteristicile proiecției Stereo 70:</b></p><ul>
      <li><b>Proiecția stereografică</b>: centrul proiecției este punctul <b>φ₀ = 46° N, λ₀ = 25° E</b>, la nord de orașul Făgăraș; razele pleacă din punctul diametral opus, iar planul este secant (k₀ = 0,99975). Elipsoid: Krasovski 1940.</li>
      <li><b>Distorsiuni minime</b>: Dat fiind că proiecția este centrată în apropierea centrului geografic al țării, distorsiunile sunt foarte mici în zona centrală, făcând-o ideală pentru ridicări topografice detaliate.</li>
      <li><b>Sistemul național de referință</b>: este utilizat pentru toate coordonatele planimetrice din România (EPSG:3844) și este legat de sistemul european ETRS89 prin transformări oficiale (TransDatRO, RomGEO).</li></ul>`,
    s7:`<p><b>Formule și transformări matematice</b><br>Pentru a transforma coordonatele elipsoidale (latitudine B, longitudine L, înălțime h) în coordonate plane (X – Nord, Y – Est) se aplică formulele proiecției stereografice, cu parametrii elipsoidului <b>Krasovski 1940</b>. Coordonatele GNSS sunt în ETRS89 (GRS80), deci transformarea are doi pași: schimbarea datumului cu grila oficială, apoi proiecția. Altitudinea: H = h − ζ (model de cvasigeoid).</p>
      <p><b>Aplicații și utilizare în ridicările topografice</b><br>Proiecția Stereo 70 este folosită frecvent în realizarea planurilor cadastrale, hărților topografice și a lucrărilor de îmbunătățiri funciare, cum sunt sistemele de irigații. În aceste proiecte, precizia este esențială, iar proiecția Stereo 70 permite realizarea de măsurători exacte și detaliate, atât pentru planuri planimetrice, cât și pentru analizarea datelor geospațiale.</p>`,
    s8:`<p><b>Definiția sistemului de coordonate Nord–Est</b></p>
      <p>Sistemul de coordonate <b>X–Y (Nord–Est)</b> este un sistem bidimensional, folosit pentru ridicările topografice și hărțile planimetrice din România.</p>
      <p>În acest sistem, fiecare punct este descris de două coordonate:</p><ul>
      <li><b>Coordonata X (Nord)</b>, care definește poziția pe axa verticală.</li>
      <li><b>Coordonata Y (Est)</b>, care definește poziția pe axa orizontală.</li>
      <li>Originea este centrul proiecției Stereo 70 <b>(46° N, 25° E, X = Y = 500 000 m)</b>, ceea ce asigură o distribuție echilibrată a deformațiilor pe teritoriul țării.</li></ul>
      <p><b>Aplicarea sistemului în ridicările topografice</b><br>Sistemul Nord–Est este esențial în toate ridicările topografice din România.</p><ul>
      <li>Fiecare punct măsurat este raportat la coordonatele X și Y, facilitând calculul distanțelor, orientărilor și suprafețelor necesare pentru realizarea planurilor de irigații, drenaj și alte lucrări de îmbunătățiri funciare.</li>
      <li>Acest sistem este indispensabil pentru generarea planurilor și pentru proiectele de inginerie care implică măsurători precise.</li></ul>`,
    s9:`<ul>
      <li>Centrul de proiecție al sistemului Stereo 70 este punctul de coordonate geografice <b>φ₀ = 46° N, λ₀ = 25° E</b> (la nord de Făgăraș), având coordonatele plane <b>X = 500 000 m (Nord)</b> și <b>Y = 500 000 m (Est)</b>.</li>
      <li>Acest punct central servește drept origine a sistemului de coordonate planimetrice, iar toate măsurătorile în teren sunt raportate la acesta.</li>
      <li>Atribuirea coordonatelor de 500 000 m centrului are scopul de a facilita lucrările topografice, asigurând valori pozitive și ușor de gestionat pentru coordonate pe întreg teritoriul național.</li></ul>
      ${ret('Confuzie frecventă: <b>Dealul Piscului</b> este punctul fundamental al datumului din 1930 (și numele vechi al datumului din 1970), nu centrul proiecției Stereo 70.')}`,
    s10a:`<p><b>Definiție și importanță</b></p><ul>
      <li>Sistemul altimetric <b>Marea Neagră 1975</b> este referința pentru altitudinile din România. Altitudinile sunt raportate la nivelul mediu al Mării Negre, determinat la maregraful din Constanța; rețeaua de nivelment de stat a fost compensată în 1975 (de aici denumirea). Altitudinile sunt normale (raportate la cvasigeoid).</li>
      <li>Acest sistem asigură coerența măsurătorilor altimetrice pe întreg teritoriul României și este deosebit de important în lucrările de îmbunătățiri funciare, unde înălțimea terenului poate afecta drastic modul de realizare a lucrărilor de irigații sau drenaj.</li></ul>`,
    s10b:`<p><b>Modul de utilizare</b></p><ul>
      <li>În lucrările topografice, altitudinile punctelor noi se determină prin legarea la reperii rețelei de nivelment de stat (nivelment geometric sau trigonometric) ori din măsurători GNSS cu modelul de cvasigeoid (H = h − ζ).</li>
      <li>Prin raportarea la acest sistem, toate măsurătorile de altitudine sunt conforme și unificate la nivel național.</li></ul>
      <p><b>Compatibilitatea internațională</b></p><ul>
      <li>Sistemul Marea Neagră 1975 poate fi corelat cu sistemul european EVRS (realizarea EVRF2007, origine Amsterdam – NAP), prin transformările oficiale (TransDatRO, RomGEO).</li>
      <li>Acest lucru permite o integrare facilă a datelor colectate din România în proiecte de cooperare internațională și asigură o consistență între măsurători, indiferent de sistemul folosit.</li></ul>`,
    s11:`<p>Suprafața de proiecție este un <b>plan</b>, tangent sau secant la glob. După poziția punctului din care pleacă razele rezultă:</p><ul>
      <li><b>gnomonică</b> — din centrul globului: cercurile mari devin linii drepte;</li>
      <li><b>stereografică</b> — din punctul diametral opus: proiecție conformă (familia din care face parte Stereo 70);</li>
      <li><b>ortografică</b> — de la infinit: imaginea globului văzut din spațiu.</li></ul>
      <p>După poziția planului, proiecția este <b>polară</b>, <b>ecuatorială</b> sau <b>oblică</b> — Stereo 70 este oblică.</p>`,
    s12:`<p>Exercițiu de imaginație: un glob de sticlă cu continentele desenate pe el, învelit într-o coală de hârtie. În centrul globului se aprinde un bec; lumina „împinge" desenul colorat pe coală, care apoi se desface în plan.</p><ul>
      <li><b>Cilindrul</b> (tangent la ecuator) — meridianele și paralelele devin drepte perpendiculare.</li>
      <li><b>Conul</b> (tangent la o paralelă) — meridianele sunt drepte concurente, paralelele arce de cerc.</li></ul>
      ${ret('Proiecțiile folosite efectiv (Mercator, UTM, Lambert) sunt definite <b>matematic</b>, nu prin lumină — becul ajută doar la înțelegerea principiului.')}`,
    s13:`<p>Globul se <b>secționează</b> în fâșii (fuse) sau lobi, iar fiecare bucată se reprezintă separat — deformările rămân mici în interiorul fiecăreia.</p><ul>
      <li><b>Fusele</b> de-a lungul meridianelor stau la baza fabricării globurilor și a sistemelor pe fuse (Gauss–Krüger, UTM — fuse de 6°).</li>
      <li><b>Goode homolosine</b> — echivalentă, tăiată prin oceane ca să păstreze forma continentelor; îmbină proiecția sinusoidală (latitudini mici) cu Mollweide (latitudini mari).</li></ul>`,
    s15:`<p>Nicio proiecție nu păstrează simultan unghiurile, suprafețele și distanțele. Pe lângă familiile clasice (cilindrice, conice, azimutale) există proiecții <b>pseudocilindrice</b>, <b>pseudoconice</b> și <b>de compromis</b>, alese după scop: navigație, statistică, inginerie, ilustrație.</p>
      <p>Galeria interactivă compară 18 proiecții; cercurile Tissot — egale pe glob — arată ce păstrează fiecare: forma (conformă) sau aria (echivalentă).</p>`
  };
  const note = (h, b) => `<h3>${h}</h3>${b}`;

  window.S = [
    {id:'titlu', t:'Titlu', html:`<div class="title-bg"></div><iframe data-src="anim/00_glob.html" class="deco" style="position:absolute;inset:auto;right:60px;top:110px;width:820px;height:820px;pointer-events:none;background:transparent"></iframe>
      <div class="s-pad" style="right:780px">
        <div style="display:flex;gap:22px;align-items:center;margin-bottom:34px"><img src="img/slides/sigla_1.png" style="height:120px"><img src="img/slides/sigla_2.jpg" style="height:120px">
          <div style="font-size:20px;line-height:1.35;color:var(--muted)">UNIVERSITATEA DE ȘTIINȚE AGRONOMICE ȘI MEDICINĂ VETERINARĂ BUCUREȘTI<br>Facultatea de Îmbunătățiri Funciare și Ingineria Mediului<br>Ciclul II — Master · Proiectarea Lucrărilor de Îmbunătățiri Funciare · Anul I</div></div>
        <div class="kick">Capitolul 1</div><h1>Proiecții cartografice</h1>
        <p style="font-size:38px;margin-top:22px">Proiecția Stereo 70 și<br>Sistemul altimetric Marea Neagră 1975</p>
        <p class="muted" style="font-size:24px;margin-top:40px">← → navigare · F ecran complet · N note de curs · Spațiu = pauză</p></div>`},

    {id:'t02', t:'Suprafețe de referință', html:T({kick:'Suprafețe de referință', title:'Suprafețe de referință ale Terrei', cols:'0.85fr 1.15fr', body:B.s2 + go('a02'),
      vis:`<div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:center">
        ${fig('img/orig/02_geoid.jpg', 'Geoidul — ondulații exagerate', 'grid-row:span 2;height:100%')}${fig('img/orig/02_suprafete.jpg', 'Suprafața topografică, geoidul, elipsoidul')}
        ${fig('img/orig/02_geoid_harta.jpg', 'Ondulațiile geoidului EGM96 (m)')}</div>${fig('img/orig/02_scala.png', '', 'margin-top:10px')}`})},
    {id:'a02', t:'Suprafețe de referință — animație', anim:'anim/02_suprafete.html', note:note('Suprafețe de referință ale Terrei', B.s2)},

    {id:'t03', t:'Introducere', html:T({kick:'Introducere', title:'Introducere în proiecțiile cartografice', cols:'1fr 1fr', body:B.s3 + go('a03'),
      vis:fig('img/orig/03_mercator.jpg', 'Proiecția conformă – Mercator', 'max-height:820px')})},
    {id:'a03', t:'De la glob la hartă', anim:'anim/03_intro.html', note:note('Introducere în proiecțiile cartografice', B.s3)},

    {id:'t04', t:'Tipuri de proiecții', html:`<div class="s-pad"><div class="kick">Tipuri de proiecții cartografice</div><h2>Tipuri de proiecții cartografice</h2>
      <p style="margin-top:-6px">${B.s4intro}</p>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:30px;margin-top:16px">
        <div class="card"><h3 style="color:var(--cyan)">Conforme</h3>${fig('img/slides/poster_04a_conforma_16.jpg')}<p class="c">${B.s4[0]}</p>${go('a04a')}</div>
        <div class="card"><h3 style="color:var(--green)">Echivalente</h3>${fig('img/slides/poster_04b_echivalenta_16.jpg')}<p class="c">${B.s4[1]}</p>${go('a04b')}</div>
        <div class="card"><h3 style="color:#b48cff">Echidistante</h3>${fig('img/slides/poster_04c_echidistanta_16.jpg')}<p class="c">${B.s4[2]}</p>${go('a04c')}</div></div></div>`},
    {id:'a04a', t:'Conformă — Mercator', anim:'anim/04a_conforma.html', note:note('Proiecții conforme', `<p>${B.s4[0]}</p>`)},
    {id:'a04b', t:'Echivalentă — sinusoidală', anim:'anim/04b_echivalenta.html', note:note('Proiecții echivalente', `<p>${B.s4[1]}</p>`)},
    {id:'a04c', t:'Echidistantă — plate carrée', anim:'anim/04c_echidistanta.html', note:note('Proiecții echidistante', `<p>${B.s4[2]}</p>`)},

    {id:'t05', t:'Alegerea proiecției pentru România', html:T({kick:'Stereo 70', title:'Alegerea proiecției pentru România', cols:'1fr 1.1fr', body:B.s5 + go('a05', 'Harta interactivă a deformațiilor'),
      vis:fig('img/slides/poster_05_deformatii_13.jpg', 'Deformația liniară relativă a proiecției Stereo 70 (m/km), calculată în fiecare punct')})},
    {id:'a05', t:'Deformațiile Stereo 70', anim:'anim/05_deformatii.html', note:note('Alegerea proiecției pentru România', B.s5)},

    {id:'t06', t:'Stereo 70 — caracteristici', html:T({kick:'Proiecția stereografică 1970', title:'Proiecția Stereografică 1970 – Caracteristici', cols:'1.15fr 0.85fr', dense:true, body:B.s6,
      vis:fig('img/orig/06_harta_deformatii.jpg', 'Harta distribuției deformațiilor liniare relative în proiecția Stereo 70')})},
    {id:'t06p', t:'Stereo 70 — parametri', html:`<div class="s-pad"><div class="kick">Proiecția stereografică 1970</div><h2>Stereo 70 — parametrii proiecției (EPSG:3844)</h2>
      <div class="tx" style="grid-template-columns:1fr 1fr"><div class="card"><table class="tbl">
        <tr><td>Tipul proiecției</td><td>stereografică oblică, conformă, plan secant</td></tr>
        <tr><td>Centrul proiecției</td><td>φ₀ = 46° N, λ₀ = 25° E</td></tr><tr><td>Coordonatele plane ale centrului</td><td>X = 500 000 m · Y = 500 000 m</td></tr>
        <tr><td>Factor de scară în centru</td><td>k₀ = 0,99975</td></tr><tr><td>Deformație în centru</td><td>−0,25 m/km</td></tr>
        <tr><td>Cercul de deformație nulă</td><td>r = 201,7 km</td></tr><tr><td>Deformație maximă (contur)</td><td>≈ +0,64 m/km</td></tr>
        <tr><td>Elipsoid</td><td>Krasovski 1940 — a = 6 378 245 m, f = 1/298,3</td></tr><tr><td>Datum</td><td>Pulkovo 1942(58), fost „Dealul Piscului 1970"</td></tr></table></div>
      <div class="txt">${fig('img/slides/poster_06_stereo70_14.jpg', 'Razele din punctul diametral opus trec prin România și ajung pe plan')}
        ${ret('Centrul proiecției este un punct de calcul (46° N, 25° E), nu un punct materializat; polul razelor este punctul diametral opus, în Pacificul de Sud.')}${go('a06', 'Cum se realizează proiecția Stereo 70')}</div></div></div>`},
    {id:'a06', t:'Cum se realizează Stereo 70', anim:'anim/06_stereo70.html', note:note('Proiecția Stereografică 1970', B.s6)},

    {id:'t07', t:'Interoperabilitatea măsurătorilor', html:T({kick:'Interoperabilitatea măsurătorilor', title:'Interoperabilitatea măsurătorilor BLh → X, Y, H', cols:'1fr 1fr', dense:true, body:B.s7,
      vis:`${fig('img/romgeo/03_rezultat.png', 'RomGEO — aplicația online de transformare ETRS89 → Stereo 70 (api.romgeo.ro)')}
        <div style="display:flex;gap:14px;flex-wrap:wrap">${go('a07', 'Simulare RomGEO')}<a class="go" href="https://api.romgeo.ro/api/v1/demo.html#ro" target="_blank" rel="noopener" style="text-decoration:none;background:#16233f;color:#fff;border:1px solid var(--cyan)">↗ RomGEO online</a></div>`})},
    {id:'a07', t:'RomGEO — simulare', anim:'anim/07_romgeo.html', note:note('Interoperabilitatea măsurătorilor', B.s7)},

    {id:'t08', t:'Sistemul ortogonal X–Y', html:T({kick:'Sistemul de coordonate', title:'Sistemul ortogonal de coordonate X-Y', cols:'1.1fr 0.9fr', dense:true, body:B.s8,
      vis:`${fig('img/slides/poster_08_axe_25.jpg', 'X = Nord (axa verticală), Y = Est (axa orizontală); cadranele în sens orar')}
        ${ret('În geodezie axele sunt <b>invers</b> față de matematică: X spre Nord, Y spre Est; unghiurile (orientările) se măsoară de la Nord, în sens orar.')}${go('a08')}`})},
    {id:'a08', t:'Sistemul ortogonal X–Y — animație', anim:'anim/08_axe.html', note:note('Sistemul ortogonal de coordonate X-Y', B.s8)},

    {id:'t09', t:'Centrul sistemului Stereo 70', html:T({kick:'Sistemul de coordonate Stereo 70', title:'Sistemul ortogonal de coordonate Nord–Est cu centrul în punctul 46° N, 25° E', cols:'1fr 1fr', body:B.s9,
      vis:`${fig('img/slides/poster_09_origine_16.jpg', 'Translația originii cu 500 km: toate coordonatele din țară devin pozitive')}${go('a09', 'Animație: translația originii')}`})},
    {id:'a09', t:'Translația originii', anim:'anim/09_origine.html', note:note('Centrul sistemului Stereo 70', B.s9)},

    {id:'t10', t:'Marea Neagră 1975', html:T({kick:'Sistemul altimetric', title:'Sistemul Altimetric Marea Neagră 1975', cols:'1fr 1fr', dense:true, body:B.s10a + fig('img/slides/poster_10_mn75_09.jpg', 'Maregraful din Constanța — nivelul mediu al mării', 'max-width:760px'),
      vis:`<div class="txt dense">${B.s10b}</div>${go('a10', 'De la maregraf la rețeaua națională')}`})},
    {id:'a10', t:'Marea Neagră 1975 — animație', anim:'anim/10_mn75.html', note:note('Sistemul Altimetric Marea Neagră 1975', B.s10a + B.s10b)},

    {id:'t11', t:'Proiecția azimutală', html:T({kick:'Clasificare după suprafața de proiecție', title:'Proiecția azimutală (plană)', cols:'0.9fr 1.1fr', body:B.s11,
      vis:`${fig('img/orig/11_azimutala.jpg', 'Planul tangent la pol și harta polară rezultată')}${go('a11')}`})},
    {id:'a11', t:'Proiecția azimutală — animație', anim:'anim/11_azimutala.html', note:note('Proiecția azimutală (plană)', B.s11)},

    {id:'t12', t:'Proiecții cilindrice și conice', html:T({kick:'Clasificare după suprafața de proiecție', title:'Proiecția cilindrică și conică', cols:'1fr 1fr', body:B.s12,
      vis:`<div style="display:grid;grid-template-columns:1fr;gap:18px">${fig('img/orig/12_cilindru.jpg', 'Proiecția cilindrică: cilindrul desfășurat')}${fig('img/orig/12_con.gif', 'Proiecția conică cu două paralele standard')}</div>${go('a12', 'Globul, becul și coala de hârtie')}`})},
    {id:'a12', t:'Globul, becul și coala', anim:'anim/12_cilindrica_conica.html', note:note('Proiecția cilindrică și conică', B.s12)},

    {id:'t13', t:'Proiecții întrerupte', html:T({kick:'Secționarea globului', title:'Proiecții întrerupte', cols:'0.85fr 1.15fr', body:B.s13,
      vis:`${fig('img/orig/13_intrerupta.jpg', 'Proiecție întreruptă — lobi separați prin oceane', '--mh:300px')}${fig('img/orig/14_goode.jpg', 'Goode homolosine (întreruptă, echivalentă)', '--mh:300px')}
        <div style="display:flex;gap:14px">${go('a13', 'Secționarea în fuse')}${go('a14', 'Goode')}</div>`})},
    {id:'a13', t:'Secționarea globului în fuse', anim:'anim/13_fuse.html', note:note('Proiecții întrerupte', B.s13)},
    {id:'a14', t:'Goode — proiecție întreruptă', anim:'anim/14_goode.html', note:note('Proiecții întrerupte', B.s13)},

    {id:'t15', t:'Alte tipuri de proiecții', html:T({kick:'Alte tipuri de proiecții', title:'Alte tipuri de proiecții cartografice', cols:'0.8fr 1.2fr', body:B.s15 + go('a15', 'Galeria interactivă'),
      vis:fig('img/orig/15_galerie.jpg', 'Câteva dintre proiecțiile lumii')})},
    {id:'a15', t:'Galeria de proiecții', anim:'anim/15_galerie.html', note:note('Alte tipuri de proiecții', B.s15)},

    {id:'bib', t:'Bibliografie', html:`<div class="s-pad"><div class="kick">Bibliografie și resurse</div><h2>Bibliografie și alte elemente legate de proiecțiile cartografice</h2>
      <div class="tx biblio" style="grid-template-columns:1fr 1fr"><ul>
        <li>https://www.meteorologiaenred.com/ro/tipuri-de-proiecții-hărți.html</li>
        <li>https://roteaprofu.wordpress.com/proiectii-cartografice/</li>
        <li>https://ro.wikipedia.org/wiki/Proiecția_Stereografică_1970</li>
        <li>https://www.topo-online.ro/ro/stereo70.php</li>
        <li>https://www.expertcadastru.ro/index.php/arhiva-blog/81-sistem-de-proiectie-stereografic</li></ul><ul>
        <li>https://api.romgeo.ro/api/v1/demo.html — RomGEO, transformare ETRS89 → Stereo 70</li>
        <li>https://epsg.io/3844 — Pulkovo 1942(58) / Stereo70</li>
        <li>Snyder, J. P. (1987). <i>Map Projections — A Working Manual</i>. USGS Professional Paper 1395</li>
        <li>IOGP Guidance Note 7-2 — formule pentru conversii (metoda EPSG 9809, stereografica oblică)</li>
        <li class="muted">Date: Natural Earth / world-atlas (contururi), NASA Blue Marble (textura Pământului), three.js, D3.</li></ul></div></div>`}
  ];
})();
