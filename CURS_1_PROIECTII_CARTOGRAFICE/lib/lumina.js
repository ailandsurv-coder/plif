/* Lumina — proiectii perspective „fizice": glob de sticla, sursa de lumina, coala (plan / cilindru / con).
   Coala se „picteaza" in shader: pentru fiecare punct al colii se urmareste raza venita de la sursa
   pana la glob si se ia culoarea de acolo (textura + reteaua de meridiane/paralele).
   Depinde de: three.js, GlobeKit.  Toate coordonatele sunt in „cadrul" proiectiei: axa +Y = punctul de tangenta.
*/
(function(){
  const D2R = Math.PI/180;

  const VS = `
    attribute vec3 p0; attribute float rev;
    varying vec3 vP0; varying float vRev;
    void main(){ vP0 = p0; vRev = rev; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
  const FS = `
    uniform sampler2D tex; uniform mat3 toGeo; uniform int mode; uniform float reveal; uniform float opacity;
    uniform vec3 lightPos; uniform float grat; uniform vec3 tint;
    varying vec3 vP0; varying float vRev;
    const float PI = 3.141592653589793;
    float gline(float v, float step){ float f = abs(fract(v/step + 0.5) - 0.5)*step; float w = fwidth(v)*1.1; return 1.0 - smoothstep(0.0, w, f); }
    void main(){
      if(vRev > reveal){ gl_FragColor = vec4(0.86, 0.9, 1.0, opacity*0.32); return; }
      vec3 g; bool ok = true;
      if(mode == 0){ g = normalize(vP0 - lightPos); }                      // sursa in centrul globului
      else if(mode == 1){ vec3 d = normalize(vP0 - lightPos); float t = -2.0*dot(lightPos, d); g = lightPos + t*d; }  // sursa pe sfera (antipod)
      else { float r2 = vP0.x*vP0.x + vP0.z*vP0.z; if(r2 > 1.0) ok = false; g = vec3(vP0.x, sqrt(max(0.0,1.0-r2)), vP0.z); } // sursa la infinit
      vec3 q = toGeo * g;
      float lat = asin(clamp(q.y,-1.0,1.0)), lon = atan(q.x, q.z);
      vec4 col = texture2D(tex, vec2(lon/(2.0*PI) + 0.5, lat/PI + 0.5));
      float L = max(gline(lon*180.0/PI, 15.0), gline(lat*180.0/PI, 15.0)) * grat;
      col.rgb = mix(col.rgb*1.15, vec3(0.75,0.88,1.0), L*0.8);
      float edge = smoothstep(reveal - 0.04, reveal, vRev);
      col.rgb = mix(col.rgb, vec3(1.0,0.85,0.4), edge*0.9);
      if(!ok){ col = vec4(tint, 1.0); }
      gl_FragColor = vec4(col.rgb, opacity);
    }`;

  /* sheet: {type:'plane', y:1, rmax:2.4}  |  {type:'cyl', h:2}  |  {type:'cone', lat:45, umax}
     frame: THREE.Group in care traiesc globul si coala; geoRot: Euler care aduce punctul de tangenta pe +Y */
  function makeSheet(sh, tex, toGeo){
    let nu, nv, P = [], P0 = [], R = [], params = [];
    if(sh.type === 'plane'){
      nu = 96; nv = 56;
      for(let j=0;j<=nv;j++) for(let i=0;i<=nu;i++){
        const r = sh.rmax*j/nv, a = 2*Math.PI*i/nu, x = r*Math.sin(a), z = r*Math.cos(a);
        P0.push(x, sh.y, z); R.push(r/sh.rmax); params.push(x, z);
      }
    } else if(sh.type === 'cyl'){
      nu = 160; nv = 48;
      for(let j=0;j<=nv;j++) for(let i=0;i<=nu;i++){
        const l = -Math.PI + 2*Math.PI*i/nu, y = -sh.h + 2*sh.h*j/nv;
        P0.push(Math.sin(l), y, Math.cos(l)); R.push(Math.abs(y)/sh.h); params.push(l, y);
      }
    } else { // con tangent la paralela sh.lat
      const f0 = sh.lat*D2R, n = Math.sin(f0), yA = 1/Math.sin(f0), u0 = 1/Math.tan(f0);
      sh.n = n; sh.yA = yA; sh.u0 = u0;
      nu = 160; nv = 48;
      for(let j=0;j<=nv;j++) for(let i=0;i<=nu;i++){
        const l = -Math.PI + 2*Math.PI*i/nu, u = sh.umin + (sh.umax - sh.umin)*j/nv;
        const r = u*n, y = yA - u*Math.cos(f0);
        P0.push(r*Math.sin(l), y, r*Math.cos(l)); R.push(Math.abs(u-u0)/Math.max(u0-sh.umin, sh.umax-u0)); params.push(l, u);
      }
    }
    const cnt = (nu+1)*(nv+1), idx = [];
    for(let j=0;j<nv;j++) for(let i=0;i<nu;i++){ const a = j*(nu+1)+i, b = a+1, c = a+nu+1, d = c+1; idx.push(a,b,d, a,d,c); }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(P0), 3));
    g.setAttribute('p0', new THREE.BufferAttribute(new Float32Array(P0), 3));
    g.setAttribute('rev', new THREE.BufferAttribute(new Float32Array(R), 1));
    g.setIndex(idx);
    const mat = new THREE.ShaderMaterial({vertexShader:VS, fragmentShader:FS, side:THREE.DoubleSide, transparent:true,
      extensions:{derivatives:true},
      uniforms:{tex:{value:tex}, toGeo:{value:toGeo}, mode:{value:0}, reveal:{value:0}, opacity:{value:0.96},
        lightPos:{value:new THREE.Vector3()}, grat:{value:1}, tint:{value:new THREE.Color(0x1a2a48)}}});
    const mesh = new THREE.Mesh(g, mat);
    // contur alb al colii (hartie)
    mesh.userData = {sh, params:new Float32Array(params), nu, nv};
    return mesh;
  }

  // desfasurarea colii: k=0 -> pe glob, k=1 -> in plan
  function unroll(mesh, k){
    const {sh, params} = mesh.userData, a = mesh.geometry.attributes.position, p0 = mesh.geometry.attributes.p0;
    if(sh.type === 'plane'){ for(let i=0;i<a.count;i++) a.setXYZ(i, p0.getX(i), p0.getY(i), p0.getZ(i)); }
    else if(sh.type === 'cyl'){
      const kk = 1 - GlobeKit.ease(k);
      for(let i=0;i<a.count;i++){
        const l = params[2*i], y = params[2*i+1];
        if(kk < 1e-4) a.setXYZ(i, l, y, 1);
        else { const an = l*kk, rad = 1/kk; a.setXYZ(i, rad*Math.sin(an), y, 1 - rad + rad*Math.cos(an)); }
      }
    } else {
      const n = sh.n, kk = 1 - (1 - n)*GlobeKit.ease(k);       // de la 1 (con) la n (sector plan)
      for(let i=0;i<a.count;i++){
        const l = params[2*i], u = params[2*i+1], psi = l*kk, r = n*u/kk, h = u*Math.sqrt(Math.max(0, 1 - (n/kk)*(n/kk)));
        a.setXYZ(i, r*Math.sin(psi), sh.yA - h, r*Math.cos(psi));
      }
    }
    a.needsUpdate = true; mesh.geometry.computeBoundingSphere();
  }

  // bec: sfera emisiva + halou
  function bulb(scene){
    const grp = new THREE.Group();
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.06, 24, 16), new THREE.MeshBasicMaterial({color:0xfff2b0}));
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d'), gr = x.createRadialGradient(64,64,2,64,64,64);
    gr.addColorStop(0,'rgba(255,240,170,1)'); gr.addColorStop(0.25,'rgba(255,210,90,0.55)'); gr.addColorStop(1,'rgba(255,180,40,0)');
    x.fillStyle = gr; x.fillRect(0,0,128,128);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c), transparent:true, depthWrite:false, blending:THREE.AdditiveBlending}));
    halo.scale.set(0.9, 0.9, 1);
    grp.add(core); grp.add(halo); scene.add(grp);
    grp.userData = {core, halo};
    grp.setOn = v => { core.material.color.setHex(v > 0.5 ? 0xfff2b0 : 0x666655); halo.material.opacity = v; };
    return grp;
  }

  // raze: segmente de la sursa la punctul de pe glob si mai departe la coala
  function rays(parent, n, color){
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n*12), 3));
    const ls = new THREE.LineSegments(g, new THREE.LineBasicMaterial({color:color||0xffd860, transparent:true, opacity:0.75, depthWrite:false}));
    parent.add(ls); return ls;
  }

  // punct geografic -> cadru (folosind rotatia globului)
  function geoToFrame(lon, lat, rotMat){
    const l = lon*D2R, f = lat*D2R;
    return new THREE.Vector3(Math.cos(f)*Math.sin(l), Math.sin(f), Math.cos(f)*Math.cos(l)).applyMatrix3(rotMat);
  }
  // intersectia razei sursa->g cu coala (in pozitia infasurata)
  function hitSheet(sh, mode, L, g){
    if(sh.type === 'plane'){
      if(mode === 2) return new THREE.Vector3(g.x, sh.y, g.z);
      const d = g.clone().sub(L); const t = (sh.y - L.y)/d.y; if(!(t > 0)) return null;
      const p = L.clone().add(d.multiplyScalar(t)); return (Math.hypot(p.x, p.z) <= sh.rmax) ? p : null;
    }
    const d = g.clone().sub(L).normalize();
    if(sh.type === 'cyl'){ const t = 1/Math.hypot(d.x, d.z); const p = d.multiplyScalar(t); return Math.abs(p.y) <= sh.h ? p : null; }
    const f0 = sh.lat*D2R, dr = Math.hypot(d.x, d.z), t = sh.yA*Math.tan(f0)/(dr + d.y*Math.tan(f0));
    if(!(t > 0)) return null; const p = d.multiplyScalar(t);
    const u = (sh.yA - p.y)/Math.cos(f0); return (u >= sh.umin && u <= sh.umax) ? p : null;
  }

  window.Lumina = {makeSheet, unroll, bulb, rays, geoToFrame, hitSheet};
})();
