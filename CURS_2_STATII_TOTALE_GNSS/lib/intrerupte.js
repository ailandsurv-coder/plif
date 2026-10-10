/* Proiectii intrerupte — globul se sectioneaza in fuse / lobi care se intind in plan.
   window.TIP = 'fuse' (12 fuse sinusoidale, ca la fabricarea globurilor) | 'goode' (Goode homolosine intrerupta). */
(function(){
  const {seg, lerp, ease} = AnimUI, P = GlobeKit.P, D2R = Math.PI/180;
  const lobe = (lon0, lon1, lc, lat0, lat1, raw) => ({lon0, lon1, lat0, lat1, proj:(l,f) => { const q = raw(l - lc*D2R, f); return [q[0] + lc*D2R, q[1]]; }});
  const C = {
    fuse:{
      title:'Secționarea globului în fuse', sub:'Proiecție sinusoidală întreruptă — 12 fuse de câte 30° (așa se fabrică globurile pământești)',
      patches:Array.from({length:12}, (_,i) => lobe(-180 + 30*i, -150 + 30*i, -165 + 30*i, -90, 90, P.sinusoidal)),
      explode:0.10,
      phases:[
        {t:0, text:'Suprafața sferei nu se poate întinde în plan dintr-o bucată fără rupturi sau deformări mari.'},
        {t:4, text:'Globul se <b>secționează</b> de-a lungul meridianelor în <b>fuse</b> (felii) de câte 30°.'},
        {t:7, text:'Fiecare fus se întinde separat; fiind îngust, <b>deformările rămân mici</b> în interiorul lui.'},
        {t:14, text:'Rezultatul: 12 fuse unite la ecuator. Tipărite și lipite pe o sferă, ele refac <b>globul pământesc</b>. Aceeași idee stă la baza sistemelor pe fuse (Gauss–Krüger, UTM — fuse de 6°).'}]},
    goode:{
      title:'Proiecția întreruptă Goode (homolosină)', sub:'Echivalentă · tăieturile cad în oceane, ca să păstreze continentele cât mai nedeformate',
      patches:[lobe(-180,-40,-100,0,90,P.homolosine), lobe(-40,180,30,0,90,P.homolosine),
               lobe(-180,-100,-160,-90,0,P.homolosine), lobe(-100,-20,-60,-90,0,P.homolosine), lobe(-20,80,20,-90,0,P.homolosine), lobe(80,180,140,-90,0,P.homolosine)],
      explode:0.12,
      phases:[
        {t:0, text:'O proiecție de ansamblu a lumii deformează puternic marginile hărții.'},
        {t:4, text:'Goode (1923) a <b>tăiat globul în lobi</b>: tăieturile trec prin oceane — Pacific, Atlantic, Indian.'},
        {t:7, text:'Fiecare lob are propriul meridian central: <b>sinusoidală</b> între ±40°44′, <b>Mollweide</b> spre poli. Ambele sunt <b>echivalente</b>.'},
        {t:14, text:'Rezultatul păstrează suprafețele și forma continentelor; prețul plătit: <b>discontinuitățile</b> din oceane. Folosită pentru hărți de distribuție (populație, vegetație, culturi).'}]}
  };
  const cfg = C[window.TIP || 'fuse'];
  document.title = cfg.title;
  const T = document.createElement('div'); T.className = 'a-title'; T.innerHTML = cfg.title + '<small>' + cfg.sub + '</small>'; document.body.appendChild(T);

  const kit = GlobeKit.create(document.getElementById('stage'), {camZ:4.2});
  const halo = GlobeKit.glow(kit, 1);
  const G = GlobeKit.morphGlobe(kit, {patches:cfg.patches, graticule:15, step:2});

  let xm = 0, ym = 0;
  cfg.patches.forEach(p => { for(let lon=p.lon0; lon<=p.lon1; lon+=2) for(let lat=p.lat0; lat<=p.lat1; lat+=2){ const q = p.proj(lon*D2R, lat*D2R); xm = Math.max(xm, Math.abs(q[0])); ym = Math.max(ym, Math.abs(q[1])); } });
  const fitZ = () => 1 + Math.max(2*ym/(0.63*0.64), 2*xm/(0.63*kit.camera.aspect*0.70));

  const opts = document.createElement('div'); opts.className = 'opts';
  const b = document.createElement('button'); b.textContent = 'Rețea de meridiane/paralele'; b.className = 'on';
  b.onclick = () => { b.classList.toggle('on'); G.setGratVisible(b.classList.contains('on')); }; opts.appendChild(b); document.body.appendChild(opts);

  const clk = AnimUI.init({duration:24, loop:true, phases:cfg.phases});
  (function frame(){
    const t = clk.update();
    const viewLon = t < 4 ? lerp(-120, 0, seg(t, 0, 4)) : (t > 21 ? lerp(0, 240, seg(t, 21, 24)) : 0);
    const ex = cfg.explode*(seg(t, 4, 6.5) - seg(t, 18, 21))*(1);
    const s = t < 7 ? 0 : (t < 14 ? seg(t, 7, 14) : (t < 18 ? 1 : 1 - seg(t, 18, 21)));
    G.set(s, {viewLon:((viewLon + 540) % 360) - 180, explode:ex});
    const z = lerp(4.2, fitZ(), ease(Math.min(1, s*1.5))); kit.camera.position.z = z + ex*2; kit.camera.position.y = -0.035*0.63*(z-1)*ease(s);
    halo.material.opacity = (1 - ease(s*2))*(1 - ex*6);
    kit.render(); requestAnimationFrame(frame);
  })();
})();
