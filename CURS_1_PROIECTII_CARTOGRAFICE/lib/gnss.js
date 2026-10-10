/* Constelațiile GNSS — date (octombrie 2026) și propagare orbitală simplificată (orbite circulare, Walker).
   Folosit de animațiile 07 (constelații), 08 (sisteme), 09 (poziționare). Unități: km, s, radiani.
   Sistemul de coordonate „three": x = ECI-Y, y = axa polilor, z = ECI-X (meridianul 0 la t = 0). */
(function(){
  const D2R = Math.PI/180, MU = 398600.4418, RE = 6371, WE = 7.2921159e-5;
  const SYS = [
    {k:'GPS', nume:'GPS', tara:'SUA', col:'#4aa3ff', ctr:[38.8,-104.5,'Colorado Springs'], op:32,
     alt:20180, inc:55, plane:6, per:'11 h 58 min', an:'1978 (FOC 1995)', semnale:'L1 C/A, L1C, L2C, L5',
     nota:'32 operaționali (sept. 2026); GPS III SV10, ultimul din seria III, lansat în aprilie 2026.',
     sats:{meo:{a:26560, i:55, planes:6, perPlane:[6,6,5,5,5,5]}}},
    {k:'GLO', nume:'GLONASS', tara:'Rusia', col:'#ff4d5e', ctr:[55.9,37.8,'Korolev (Moscova)'], op:24,
     alt:19130, inc:64.8, plane:3, per:'11 h 16 min', an:'1982 (global 1995, refăcut 2011)', semnale:'L1OF, L2OF (FDMA), L3OC (CDMA)',
     nota:'24 operaționali; înclinarea mare (64,8°) îl face foarte util la latitudini nordice.',
     sats:{meo:{a:25510, i:64.8, planes:3, perPlane:[8,8,8]}}},
    {k:'GAL', nume:'Galileo', tara:'Uniunea Europeană', col:'#ffd84a', ctr:[41.98,13.6,'Fucino / Oberpfaffenhofen'], op:28,
     alt:23222, inc:56, plane:3, per:'14 h 05 min', an:'2011 (servicii inițiale 2016)', semnale:'E1, E5a, E5b, E6 (HAS)',
     nota:'28 utilizabili din 34 lansați (sept. 2026); a doua generație (G2G) începe să fie lansată din 2026.',
     sats:{meo:{a:29600, i:56, planes:3, perPlane:[10,9,9]}}},
    {k:'BDS', nume:'BeiDou', tara:'China', col:'#ff9a2e', ctr:[39.9,116.4,'Beijing'], op:35,
     alt:21528, inc:55, plane:3, per:'12 h 53 min (MEO)', an:'2000 (regional 2012, global 2020)', semnale:'B1I, B1C, B2a, B2b, B3I',
     nota:'BeiDou-3: 28 MEO + 3 IGSO + 4 GEO = 35 (sept. 2026), plus sateliți BeiDou-2 încă în serviciu.',
     sats:{meo:{a:27906, i:55, planes:3, perPlane:[10,9,9]}, igso:{i:55, lon:[118,118,118]}, geo:{lon:[80,110.5,140,160]}}},
    {k:'QZS', nume:'QZSS (Michibiki)', tara:'Japonia', col:'#3ee6a0', ctr:[35.7,139.7,'Tokyo'], op:6,
     alt:35786, inc:41, plane:0, per:'23 h 56 min', an:'2010 (serviciu cu 4 sateliți 2018)', semnale:'L1C/A, L1C, L2C, L5, L6 (CLAS)',
     nota:'Regional (Asia–Pacific): 6 sateliți pe orbită — QZS-7 lansat pe 11.08.2026, QZS-5 pierdut la lansare (dec. 2025).',
     sats:{igso:{i:41, lon:[135,135,135]}, geo:{lon:[127,90.5,145]}}},
    {k:'IRN', nume:'NavIC (IRNSS)', tara:'India', col:'#c38bff', ctr:[13.0,77.6,'Bengaluru'], op:3,
     alt:35786, inc:29, plane:0, per:'23 h 56 min', an:'2013 (operațional 2018)', semnale:'L5, S',
     nota:'Regional (India ± 1 500 km): doar 3 sateliți funcționali; NVS-03 programat la 15–20.10.2026.',
     sats:{igso:{i:29, lon:[55,55]}, geo:{lon:[129.5]}}}
  ];

  // lista de sateliți: {sys, a, i, raan, u0, n}
  function build(){
    const L = [];
    SYS.forEach(S => {
      const s = S.sats;
      if(s.meo){ const m = s.meo; let id = 0;
        m.perPlane.forEach((cnt, p) => { for(let j=0;j<cnt;j++){
          L.push({sys:S.k, a:m.a, i:m.i*D2R, raan:(360/m.planes*p)*D2R, u0:(360/cnt*j + 15*p)*D2R, n:Math.sqrt(MU/Math.pow(m.a,3)), type:'MEO', id:id++}); } }); }
      if(s.igso) s.igso.lon.forEach((lon, j) => { const u0 = (360/s.igso.lon.length*j)*D2R;
        L.push({sys:S.k, a:42164, i:s.igso.i*D2R, raan:lon*D2R - u0, u0, n:WE, type:'IGSO'}); });
      if(s.geo) s.geo.lon.forEach(lon => L.push({sys:S.k, a:42164, i:(S.k === 'QZS' && lon === 145 ? 3 : 0)*D2R, raan:lon*D2R, u0:0, n:WE, type:'GEO'}));
    });
    return L;
  }
  // poziția ECI (km) la timpul t (s) -> {x,y,z} ECI
  function eci(s, t){
    const u = s.u0 + s.n*t, cu = Math.cos(u), su = Math.sin(u), ci = Math.cos(s.i), si = Math.sin(s.i), cO = Math.cos(s.raan), sO = Math.sin(s.raan);
    return {x:s.a*(cO*cu - sO*su*ci), y:s.a*(sO*cu + cO*su*ci), z:s.a*su*si};
  }
  // ECI -> ECEF (rotația Pământului)
  function ecef(p, t){ const th = WE*t, c = Math.cos(th), s = Math.sin(th); return {x:c*p.x + s*p.y, y:-s*p.x + c*p.y, z:p.z}; }
  // elevație / azimut față de un punct de la sol (lat, lon în grade)
  function azel(pE, lat, lon){
    const f = lat*D2R, l = lon*D2R, cf = Math.cos(f), sf = Math.sin(f), cl = Math.cos(l), sl = Math.sin(l);
    const o = {x:RE*cf*cl, y:RE*cf*sl, z:RE*sf}, dx = pE.x - o.x, dy = pE.y - o.y, dz = pE.z - o.z;
    const e = -sl*dx + cl*dy, n = -sf*cl*dx - sf*sl*dy + cf*dz, u = cf*cl*dx + cf*sl*dy + sf*dz;
    const r = Math.hypot(e, n, u);
    return {az:(Math.atan2(e, n)/D2R + 360) % 360, el:Math.asin(u/r)/D2R, r};
  }
  window.GNSS = {SYS, build, eci, ecef, azel, RE, WE, MU, D2R, byKey:k => SYS.find(s => s.k === k)};
})();
