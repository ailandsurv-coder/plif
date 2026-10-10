/* Modele 3D stilizate de drone (three.js) — multirotor, aripă fixă, VTOL. Dimensiuni în metri, axa +Z = înainte.
   DRONA.multirotor() / DRONA.aripa() / DRONA.vtol() întorc un THREE.Group cu .userData.rotors (de rotit) și .userData.tilt (VTOL). */
(function(){
  const M = (c, o) => new THREE.MeshStandardMaterial(Object.assign({color:c, roughness:0.55, metalness:0.15}, o||{}));
  const body = M(0xe8ecf2), dark = M(0x2b3442), acc = M(0xffc940), glass = M(0x111822, {roughness:0.2, metalness:0.6});
  function rotor(r){
    const g = new THREE.Group();
    const disc = new THREE.Mesh(new THREE.CircleGeometry(r, 40), new THREE.MeshBasicMaterial({color:0x9fd8ff, transparent:true, opacity:0.18, side:THREE.DoubleSide, depthWrite:false}));
    disc.rotation.x = -Math.PI/2; g.add(disc);
    const blade = new THREE.Mesh(new THREE.BoxGeometry(2*r*0.95, 0.008, r*0.12), dark); g.add(blade);
    const blade2 = blade.clone(); blade2.rotation.y = Math.PI/2; g.add(blade2);
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.05, 12), acc));
    return g;
  }
  function camera(){
    const g = new THREE.Group();
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.09, 0.1), dark); g.add(c);
    const l = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.04, 20), glass); l.rotation.x = Math.PI/2; l.position.set(0, -0.01, 0.065); g.add(l);
    return g;
  }
  function multirotor(){
    const g = new THREE.Group(), rotors = [];
    const hull = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.09, 0.34), body); g.add(hull);
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.22), dark); top.position.y = 0.065; g.add(top);
    [[1,1],[-1,1],[1,-1],[-1,-1]].forEach(([sx, sz]) => {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.03, 0.5), dark); arm.position.set(sx*0.17, 0.02, sz*0.17); arm.rotation.y = Math.atan2(sx, sz); g.add(arm);
      const mot = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 16), dark); mot.position.set(sx*0.33, 0.045, sz*0.33); g.add(mot);
      const r = rotor(0.17); r.position.set(sx*0.33, 0.08, sz*0.33); g.add(r); rotors.push(r);
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.18, 8), dark); leg.position.set(sx*0.1, -0.12, sz*0.12); g.add(leg);
    });
    const cam = camera(); cam.position.set(0, -0.11, 0.12); cam.rotation.x = 0.5; g.add(cam);
    g.userData = {rotors, nume:'multirotor'}; return g;
  }
  function wingMesh(span, chord, sweep){
    const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(span/2, -sweep); s.lineTo(span/2, -sweep - chord*0.55); s.lineTo(0, -chord); s.lineTo(-span/2, -sweep - chord*0.55); s.lineTo(-span/2, -sweep); s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, {depth:0.025, bevelEnabled:false}); geo.rotateX(Math.PI/2); geo.translate(0, 0.0125, chord*0.4);
    return new THREE.Mesh(geo, body);
  }
  function aripa(){
    const g = new THREE.Group(), rotors = [];
    // fuzelaj: cilindru cu capete sferice (three r128 nu are CapsuleGeometry)
    const fus = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.62, 16), body); fus.rotation.x = Math.PI/2; g.add(fus);
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 12), body); nose.position.z = 0.31; g.add(nose);
    const tailc = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), body); tailc.position.z = -0.31; g.add(tailc);
    g.add(wingMesh(2.0, 0.32, 0.18));
    const tip1 = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.12, 0.14), acc); tip1.position.set(1.0, 0.06, -0.12); g.add(tip1); const tip2 = tip1.clone(); tip2.position.x = -1.0; g.add(tip2);
    const r = rotor(0.14); r.rotation.x = Math.PI/2; r.position.set(0, 0, -0.44); g.add(r); rotors.push(r);
    const cam = camera(); cam.position.set(0, -0.08, 0.12); cam.rotation.x = Math.PI/2; g.add(cam);
    g.userData = {rotors, nume:'aripa'}; return g;
  }
  function vtol(){
    const g = aripa(), rotors = g.userData.rotors;
    [-0.62, 0.62].forEach(x => {
      const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.0, 10), dark); boom.rotation.x = Math.PI/2; boom.position.set(x, 0.02, 0.0); g.add(boom);
      [0.48, -0.48].forEach(z => { const r = rotor(0.16); r.position.set(x, 0.07, z); g.add(r); rotors.push(r); });
    });
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.012, 0.12), body); tail.position.set(0, 0.01, -0.5); g.add(tail);
    g.userData.nume = 'vtol'; return g;
  }
  function spin(g, dt, k){ (g.userData.rotors || []).forEach((r, i) => r.rotation.y += (i % 2 ? -1 : 1)*dt*(k == null ? 60 : k)); }
  function lights(scene){
    scene.add(new THREE.HemisphereLight(0xdfeaff, 0x1a2233, 0.9));
    const d = new THREE.DirectionalLight(0xffffff, 0.9); d.position.set(3, 5, 4); scene.add(d);
    return d;
  }
  window.DRONA = {multirotor, aripa, vtol, spin, lights, rotor};
})();
