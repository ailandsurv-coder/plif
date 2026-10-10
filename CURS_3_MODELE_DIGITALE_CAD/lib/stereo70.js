/* Proiectia Stereo 70 — stereografica oblica dubla (EPSG 9809) pe elipsoidul Krasovski 1940.
   Parametri EPSG:3844: phi0 = 46°N, lambda0 = 25°E, k0 = 0,99975, FE = FN = 500 000 m.
   Atentie: functia lucreaza pe datumul Pulkovo 1942(58); coordonatele ETRS89/GNSS
   trebuie intai transformate (RomGEO / TransDatRO). Aici e folosita pentru desen si calcul de deformatii. */
(function(){
  const D2R = Math.PI/180;
  const a = 6378245.0, f = 1/298.3, e2 = 2*f - f*f, e = Math.sqrt(e2);
  const phi0 = 46*D2R, lam0 = 25*D2R, k0 = 0.99975, FE = 500000, FN = 500000;

  const s0 = Math.sin(phi0);
  const rho0 = a*(1-e2)/Math.pow(1-e2*s0*s0, 1.5), nu0 = a/Math.sqrt(1-e2*s0*s0);
  const R = Math.sqrt(rho0*nu0);                                   // raza sferei Gauss
  const n = Math.sqrt(1 + e2*Math.pow(Math.cos(phi0),4)/(1-e2));
  const S1 = (1+s0)/(1-s0), S2 = (1-e*s0)/(1+e*s0);
  const w1 = Math.pow(S1*Math.pow(S2, e), n);
  const sinChi00 = (w1-1)/(w1+1);
  const c = (n+s0)*(1-sinChi00)/((n-s0)*(1+sinChi00));
  const w2 = c*w1, chi0 = Math.asin((w2-1)/(w2+1));

  // geodezic (grade, Krasovski) -> sfera Gauss (chi, Lambda)
  function conformal(latDeg, lonDeg){
    const p = latDeg*D2R, sp = Math.sin(p);
    const Sa = (1+sp)/(1-sp), Sb = (1-e*sp)/(1+e*sp);
    const w = c*Math.pow(Sa*Math.pow(Sb, e), n);
    return {chi:Math.asin((w-1)/(w+1)), L:n*(lonDeg*D2R - lam0)};
  }
  // returneaza {N, E} = {X, Y} in conventia romaneasca (X = Nord, Y = Est)
  function forward(latDeg, lonDeg){
    const q = conformal(latDeg, lonDeg);
    const B = 1 + Math.sin(q.chi)*Math.sin(chi0) + Math.cos(q.chi)*Math.cos(chi0)*Math.cos(q.L);
    const E = FE + 2*R*k0*Math.cos(q.chi)*Math.sin(q.L)/B;
    const N = FN + 2*R*k0*(Math.sin(q.chi)*Math.cos(chi0) - Math.cos(q.chi)*Math.sin(chi0)*Math.cos(q.L))/B;
    return {N, E, X:N, Y:E};
  }
  // factorul de scara liniar k la distanta plana d (m) de centru: k = k0 * (1 + d^2 / (4 k0^2 R^2))
  function scaleAtPlane(N, E){
    const d2 = (N-FN)*(N-FN) + (E-FE)*(E-FE);
    return k0*(1 + d2/(4*k0*k0*R*R));
  }
  // deformatia liniara relativa in m/km (sau cm/100 m)
  const deformMkm = (N, E) => (scaleAtPlane(N, E) - 1)*1000;
  // raza cercului de deformatie nula, in planul proiectiei (m)
  const zeroRadius = 2*k0*R*Math.sqrt(1/k0 - 1);

  window.Stereo70 = {forward, scaleAtPlane, deformMkm, zeroRadius, R, k0, FE, FN, phi0:46, lam0:25, a, f};
})();
