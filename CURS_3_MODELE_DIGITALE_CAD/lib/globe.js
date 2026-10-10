/* GlobeKit — scena three.js + glob texturat care se „desface" intr-o proiectie.
   Depinde de: three.min.js, topojson-client, world-data.js (WORLD_LAND110), earth-tex.js (EARTH_TEX).

   Morfarea: fiecare varf (lambda, phi) are o pozitie pe sfera S si una pe harta P = proj(lambda, phi).
   Harta e intai „infasurata" pe un cilindru de raza R/k, apoi k -> 0 o intinde in plan;
   in prima parte se amesteca sfera cu cilindrul. Rezultatul arata ca o desfacere fizica a globului.
*/
(function(){
  const D2R = Math.PI/180;
  const ease = x => { x = Math.max(0, Math.min(1, x)); return x*x*(3-2*x); };

  function create(container, o){
    o = Object.assign({stars:true, fov:35, camZ:4.2, bg:null}, o||{});
    const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true, preserveDrawingBuffer:true});
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio||1));
    container.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(o.fov, 1, 0.01, 200);
    camera.position.set(0, 0, o.camZ);
    const root = new THREE.Group(); scene.add(root);

    if(o.stars){
      const n = 1600, pos = new Float32Array(n*3), col = new Float32Array(n*3);
      for(let i=0;i<n;i++){
        const u = Math.random()*2-1, th = Math.random()*Math.PI*2, r = 60 + Math.random()*30, q = Math.sqrt(1-u*u);
        pos.set([r*q*Math.cos(th), r*u, r*q*Math.sin(th)], i*3);
        const c = 0.55 + Math.random()*0.45; col.set([c, c, Math.min(1, c+0.1)], i*3);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      g.setAttribute('color', new THREE.BufferAttribute(col, 3));
      scene.add(new THREE.Points(g, new THREE.PointsMaterial({size:0.22, vertexColors:true, sizeAttenuation:true, transparent:true, opacity:0.9})));
    }

    function resize(){
      const w = container.clientWidth || window.innerWidth, h = container.clientHeight || window.innerHeight;
      renderer.setSize(w, h); camera.aspect = w/h; camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize); resize();

    // proiectie 3D -> pixeli ecran (pentru etichete HTML)
    const v = new THREE.Vector3();
    function toScreen(p, obj){
      v.copy(p); if(obj) obj.localToWorld(v); v.project(camera);
      const w = renderer.domElement.clientWidth, h = renderer.domElement.clientHeight;
      return {x:(v.x+1)/2*w, y:(1-v.y)/2*h, z:v.z};
    }
    return {renderer, scene, camera, root, resize, toScreen, render:()=>renderer.render(scene, camera)};
  }

  let _tex = null;
  function earthTexture(){
    if(!_tex){ _tex = new THREE.TextureLoader().load(window.EARTH_TEX); _tex.anisotropy = 8; }
    return _tex;
  }
  // inele de coasta (lon, lat in grade) din topojson
  let _rings = null;
  function landRings(){
    if(_rings) return _rings;
    const fc = topojson.feature(window.WORLD_LAND110, window.WORLD_LAND110.objects.land);
    _rings = [];
    fc.features.forEach(f => {
      const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
      polys.forEach(p => p.forEach(r => _rings.push(r)));
    });
    return _rings;
  }
  // densifica un inel (pas maxim in grade)
  function densify(ring, step){
    const out = [];
    for(let i=0;i<ring.length-1;i++){
      const a = ring[i], b = ring[i+1]; let dl = b[0]-a[0];
      if(Math.abs(dl) > 180){ out.push(a); out.push(null); continue; }   // traversare antimeridian
      const n = Math.max(1, Math.ceil(Math.max(Math.abs(dl), Math.abs(b[1]-a[1]))/step));
      for(let k=0;k<n;k++) out.push([a[0]+dl*k/n, a[1]+(b[1]-a[1])*k/n]);
    }
    out.push(ring[ring.length-1]);
    return out;
  }
  // punct la distanta unghiulara d (grade) si azimut az de la (lon,lat)
  function dest(lon, lat, d, az){
    const p1 = lat*D2R, l1 = lon*D2R, dr = d*D2R, a = az*D2R;
    const p2 = Math.asin(Math.sin(p1)*Math.cos(dr) + Math.cos(p1)*Math.sin(dr)*Math.cos(a));
    const l2 = l1 + Math.atan2(Math.sin(a)*Math.sin(dr)*Math.cos(p1), Math.cos(dr) - Math.sin(p1)*Math.sin(p2));
    return [l2/D2R, p2/D2R];
  }

  /* Glob morfabil.
     opts.patches: [{lon0,lon1,lat0,lat1, proj:(lamRad,phiRad)=>[x,y]}]  (implicit: un singur patch, toata sfera)
     opts.scale: factor aplicat coordonatelor de harta;  opts.offset:[dx,dy]
     opts.tissot: [{lon,lat,r}] ; opts.graticule: pas in grade (0 = fara)
  */
  function morphGlobe(kit, opts){
    opts = Object.assign({patches:null, step:2, scale:1, offset:[0,0], graticule:15, coast:true, tissot:[],
      gratColor:0x9fc6ff, coastColor:0xffffff, tissotColor:0xff5555, viewLon:0, cylLift:1}, opts||{});
    const patches = opts.patches || [{lon0:-180, lon1:180, lat0:-90, lat1:90, proj:(l,p)=>[l,p]}];
    const group = new THREE.Group(); kit.root.add(group);
    const state = {s:0, viewLon:opts.viewLon, viewLat:0, offset:opts.offset.slice(), scale:opts.scale, explode:0};
    // directia centrului fiecarui patch (pentru „despicarea" fuselor)
    patches.forEach(p => { p.cl = (p.lon0 + p.lon1)/2; p.cf = (p.lat0 + p.lat1)/2; });

    // ----- mesh suprafata (cate unul pe patch)
    const meshes = [];
    const tex = earthTexture();
    patches.forEach((pt, pi) => {
      const nl = Math.max(2, Math.round((pt.lon1-pt.lon0)/opts.step)), nf = Math.max(2, Math.round((pt.lat1-pt.lat0)/opts.step));
      const cnt = (nl+1)*(nf+1), pos = new Float32Array(cnt*3), uv = new Float32Array(cnt*2), ll = new Float32Array(cnt*2);
      let k = 0;
      for(let j=0;j<=nf;j++) for(let i=0;i<=nl;i++){
        const lon = pt.lon0 + (pt.lon1-pt.lon0)*i/nl, lat = pt.lat0 + (pt.lat1-pt.lat0)*j/nf;
        ll[2*k] = lon; ll[2*k+1] = lat; uv[2*k] = (lon+180)/360; uv[2*k+1] = (lat+90)/180; k++;
      }
      const idx = [];
      for(let j=0;j<nf;j++) for(let i=0;i<nl;i++){
        const a = j*(nl+1)+i, b = a+1, c = a+(nl+1), d = c+1; idx.push(a,b,d, a,d,c);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
      g.setIndex(idx);
      const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({map:tex, side:THREE.DoubleSide, transparent:true, opacity:1}));
      m.userData = {ll, pi, lift:0}; group.add(m); meshes.push(m);
    });

    // ----- linii (graticula, coasta, contur Tissot) => LineSegments cu (lon,lat,patch) per varf
    function patchOf(lon, lat){
      for(let i=0;i<patches.length;i++){ const p = patches[i];
        if(lon >= p.lon0-1e-9 && lon <= p.lon1+1e-9 && lat >= p.lat0-1e-9 && lat <= p.lat1+1e-9) return i; }
      return -1;
    }
    function buildLines(polylines, color, width, lift, opacity){
      const ll = [], pp = [];
      polylines.forEach(line => {
        for(let i=0;i<line.length-1;i++){
          const a = line[i], b = line[i+1]; if(!a || !b) continue;
          const pa = patchOf(a[0], a[1]), pb = patchOf(b[0], b[1]);
          if(pa < 0 || pa !== pb) continue;
          ll.push(a[0], a[1], b[0], b[1]); pp.push(pa, pa);
        }
      });
      const n = ll.length/2, g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n*3), 3));
      const ls = new THREE.LineSegments(g, new THREE.LineBasicMaterial({color, transparent:true, opacity:opacity==null?1:opacity, depthTest:true}));
      ls.userData = {ll:new Float32Array(ll), pp:new Int16Array(pp), lift}; group.add(ls);
      return ls;
    }
    const lines = [];
    if(opts.graticule){
      const gl = [], st = opts.graticule;
      // meridianele pe marginile de patch se dubleaza ca sa nu se piarda la taieturi
      for(let lon=-180; lon<=180; lon+=st){ const L=[]; for(let lat=-90; lat<=90; lat+=1) L.push([lon===180?179.999:(lon===-180?-179.999:lon), lat]); gl.push(L); }
      for(let lat=-90+st; lat<90; lat+=st){ const L=[]; for(let lon=-180; lon<=180; lon+=1) L.push([Math.max(-179.999,Math.min(179.999,lon)), lat]); gl.push(L); }
      // spargem liniile la granitele de patch: densificare suficienta + filtrare pe segment
      lines.push(buildLines(gl, opts.gratColor, 1, 0.004, 0.55));
    }
    if(opts.coast){ lines.push(buildLines(landRings().map(r => densify(r, 1.5)), opts.coastColor, 1, 0.006, 0.9)); }

    // ----- Tissot
    const tissot = [];
    opts.tissot.forEach(tc => {
      const N = 48, pts = [[tc.lon, tc.lat]];
      for(let i=0;i<=N;i++) pts.push(dest(tc.lon, tc.lat, tc.r, 360*i/N));
      const pi = patchOf(tc.lon, tc.lat); if(pi < 0) return;
      const ll = new Float32Array(pts.length*2); pts.forEach((p,i)=>{ ll[2*i]=p[0]; ll[2*i+1]=p[1]; });
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts.length*3), 3));
      const idx = []; for(let i=1;i<=N;i++) idx.push(0, i, i+1); g.setIndex(idx);
      const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({color:opts.tissotColor, transparent:true, opacity:0.55, side:THREE.DoubleSide, depthWrite:false}));
      m.userData = {ll, pi, lift:0.009, tc};
      // contur
      const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.BufferAttribute(new Float32Array((N+1)*3), 3));
      const lo = new THREE.Line(lg, new THREE.LineBasicMaterial({color:0xffd0d0}));
      lo.userData = {ll:ll.slice(2), pi, lift:0.01};
      group.add(m); group.add(lo); tissot.push(m, lo);
    });

    // ----- calcul pozitie
    const out = new THREE.Vector3();
    function place(lon, lat, pi, lift){
      const s = state.s, l = (lon - state.viewLon)*D2R, f = lat*D2R;
      // sfera (cu inclinare viewLat pentru vederi oblice)
      let sx = Math.cos(f)*Math.sin(l), sy = Math.sin(f), sz = Math.cos(f)*Math.cos(l);
      if(state.viewLat){ const c = Math.cos(-state.viewLat*D2R), si = Math.sin(-state.viewLat*D2R); const y2 = sy*c - sz*si, z2 = sy*si + sz*c; sy = y2; sz = z2; }
      if(state.explode && pi >= 0){ const pc = patches[pi], cl = (pc.cl - state.viewLon)*D2R, cf = pc.cf*D2R, e = state.explode;
        sx += e*Math.cos(cf)*Math.sin(cl); sy += e*Math.sin(cf); sz += e*Math.cos(cf)*Math.cos(cl); }
      if(s <= 0){ const r = 1 + lift; return out.set(sx*r, sy*r, sz*r); }
      const xy = patches[pi].proj(lon*D2R, lat*D2R);
      const X = xy[0]*state.scale + state.offset[0], Y = xy[1]*state.scale + state.offset[1];
      // infasurare pe cilindru de raza 1/k
      const k = 1 - ease(s);
      let wx, wy = Y, wz;
      if(k < 1e-4){ wx = X; wz = 1; }
      else { const a = X*k, rad = 1/k; wx = rad*Math.sin(a); wz = 1 - rad + rad*Math.cos(a); }
      const w = ease(s/0.45);
      const px = sx + (wx - sx)*w, py = sy + (wy - sy)*w, pz = sz + (wz - sz)*w;
      // normala aproximativa pentru ridicarea liniilor deasupra suprafetei
      const nz = sz + (1 - sz)*w;
      return out.set(px + sx*(1-w)*lift, py + sy*(1-w)*lift, pz + nz*lift + lift*w);
    }

    function update(){
      meshes.forEach(m => {
        const a = m.geometry.attributes.position, ll = m.userData.ll;
        for(let i=0;i<a.count;i++){ const p = place(ll[2*i], ll[2*i+1], m.userData.pi, 0); a.setXYZ(i, p.x, p.y, p.z); }
        a.needsUpdate = true; m.geometry.computeBoundingSphere();
      });
      lines.forEach(ls => {
        const a = ls.geometry.attributes.position, ll = ls.userData.ll, pp = ls.userData.pp, lf = ls.userData.lift;
        for(let i=0;i<a.count;i++){ const p = place(ll[2*i], ll[2*i+1], pp[i], lf); a.setXYZ(i, p.x, p.y, p.z); }
        a.needsUpdate = true; ls.geometry.computeBoundingSphere();
      });
      tissot.forEach(m => {
        const a = m.geometry.attributes.position, ll = m.userData.ll;
        for(let i=0;i<a.count;i++){ const p = place(ll[2*i], ll[2*i+1], m.userData.pi, m.userData.lift); a.setXYZ(i, p.x, p.y, p.z); }
        a.needsUpdate = true; m.geometry.computeBoundingSphere();
      });
    }
    let dirty = true, last = '';
    const api = {
      group, state, meshes, lines, tissot, place:(lon,lat,lift)=>place(lon,lat,Math.max(0,patchOf(lon,lat)),lift||0).clone(),
      set(s, extra){ Object.assign(state, extra||{}); state.s = s; const key = JSON.stringify(state); if(key !== last){ last = key; update(); } },
      setTissotVisible(v){ tissot.forEach(m => m.visible = v); },
      setGratVisible(v){ if(opts.graticule) lines[0].visible = v; },
      dispose(){ kit.root.remove(group); }
    };
    update();
    return api;
  }

  // halou atmosferic (sprite cu gradient radial)
  function glow(kit, radius, color){
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const x = c.getContext('2d'), g = x.createRadialGradient(128,128,60,128,128,128);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.42, color||'rgba(90,170,255,0.55)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0,0,256,256);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c), transparent:true, depthWrite:false, blending:THREE.AdditiveBlending}));
    sp.scale.set(radius*2.75, radius*2.75, 1); kit.scene.add(sp); return sp;
  }

  // proiectii brute pe sfera unitate (radiani -> unitati de raza)
  const P = {
    mercator:(l,f)=>[l, Math.log(Math.tan(Math.PI/4 + Math.max(-1.45, Math.min(1.45, f))/2))],
    plateCarree:(l,f)=>[l, f],
    sinusoidal:(l,f)=>[l*Math.cos(f), f],
    lambertCylEA:(l,f)=>[l, Math.sin(f)],
    homolosine:(l,f)=>{ if(Math.abs(f) > 0.7109889596207567){ const m = P.mollweide(l,f); return [m[0], m[1] - (f > 0 ? 0.0528035274542 : -0.0528035274542)]; } return [l*Math.cos(f), f]; },
    mollweide:(l,f)=>{ let t = f; for(let i=0;i<30;i++){ const d = (2*t + Math.sin(2*t) - Math.PI*Math.sin(f)) / (2 + 2*Math.cos(2*t)); t -= d; if(Math.abs(d) < 1e-9 || !isFinite(d)) break; }
      if(!isFinite(t)) t = f; return [2*Math.SQRT2/Math.PI * l * Math.cos(t), Math.SQRT2*Math.sin(t)]; },
    gallPeters:(l,f)=>[l/Math.SQRT2, Math.SQRT2*Math.sin(f)]
  };

  window.GlobeKit = {create, morphGlobe, glow, earthTexture, landRings, densify, dest, P, D2R, ease};
})();
