/* Ceas + bara de control comune tuturor animatiilor.
   Pauza / redare (Spatiu), reluare (R), viteza, cronologie cu derulare manuala.
   Utilizare:
     const clk = AnimUI.init({duration:30, loop:true, phases:[{t:0,text:'...'}, ...]});
     function frame(){ const t = clk.update(); ... requestAnimationFrame(frame); }
*/
(function(){
  const fmt = s => { s = Math.max(0, s); return Math.floor(s/60) + ':' + String(Math.floor(s%60)).padStart(2,'0'); };

  function init(o){
    o = Object.assign({duration:20, loop:true, phases:[], autoplay:true, onSeek:null}, o||{});
    const clk = {t:0, dt:0, playing:o.autoplay, speed:1, duration:o.duration, phase:-1, _last:performance.now(), listeners:[]};

    // --- caption
    let cap = document.querySelector('.a-caption');
    if(!cap && o.phases.length){ cap = document.createElement('div'); cap.className='a-caption'; document.body.appendChild(cap); }

    // --- bara
    const bar = document.createElement('div'); bar.className='ctrl';
    bar.innerHTML = `
      <button data-a="restart" title="De la început (R)">&#x23EE;</button>
      <button data-a="play" title="Pauză / redare (Spațiu)">&#x23F8;</button>
      <div class="tl" title="Trage pentru a derula"><div class="bar"></div><div class="fill"></div><div class="knob"></div></div>
      <div class="tm">0:00</div>
      <label class="spd"><span>Viteză</span><select>
        <option value="0.25">0,25×</option><option value="0.5">0,5×</option><option value="0.75">0,75×</option>
        <option value="1" selected>1×</option><option value="1.5">1,5×</option><option value="2">2×</option></select></label>
      <button data-a="loop" title="Repetare continuă">&#x1F501;</button>`;
    document.body.appendChild(bar);
    const bPlay = bar.querySelector('[data-a=play]'), bLoop = bar.querySelector('[data-a=loop]');
    const tl = bar.querySelector('.tl'), fill = bar.querySelector('.fill'), knob = bar.querySelector('.knob'), tm = bar.querySelector('.tm');
    o.phases.forEach(p => { if(p.t>0){ const m=document.createElement('div'); m.className='mk'; m.style.left=(100*p.t/o.duration)+'%'; tl.appendChild(m);} });

    let loop = o.loop;
    const syncBtns = () => { bPlay.innerHTML = clk.playing ? '&#x23F8;' : '&#x25B6;'; bPlay.classList.toggle('on', !clk.playing); bLoop.classList.toggle('on', loop); };
    syncBtns();

    clk.toggle = () => { if(!clk.playing && clk.t >= clk.duration) clk.t = 0; clk.playing = !clk.playing; syncBtns(); };
    clk.pause = () => { clk.playing = false; syncBtns(); };
    clk.play = () => { clk.playing = true; syncBtns(); };
    clk.seek = t => { clk.t = Math.max(0, Math.min(clk.duration, t)); if(o.onSeek) o.onSeek(clk.t); };
    clk.restart = () => { clk.seek(0); clk.play(); };
    clk.setDuration = d => { clk.duration = d; };

    bar.querySelector('[data-a=restart]').onclick = clk.restart;
    bPlay.onclick = clk.toggle;
    bLoop.onclick = () => { loop = !loop; syncBtns(); };
    bar.querySelector('select').onchange = e => { clk.speed = parseFloat(e.target.value); };

    let drag = false;
    const seekFromEvt = e => { const r = tl.getBoundingClientRect(); clk.seek((e.clientX - r.left) / r.width * clk.duration); };
    tl.addEventListener('pointerdown', e => { drag = true; tl.setPointerCapture(e.pointerId); seekFromEvt(e); });
    tl.addEventListener('pointermove', e => { if(drag) seekFromEvt(e); });
    tl.addEventListener('pointerup', () => { drag = false; });

    // tastatura: Spatiu / R local; sagetile si PageUp/Down merg la prezentare (daca e in iframe)
    window.addEventListener('keydown', e => {
      if(e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      if(e.code === 'Space'){ e.preventDefault(); clk.toggle(); }
      else if(e.key === 'r' || e.key === 'R'){ clk.restart(); }
      else if(window.parent !== window && ['ArrowRight','ArrowLeft','PageDown','PageUp','Home','End','f','F','Escape'].includes(e.key)){
        window.parent.postMessage({deckKey:e.key}, '*'); e.preventDefault();
      }
    });
    // comenzi de la prezentare
    window.addEventListener('message', e => {
      const d = e.data || {};
      if(d.anim === 'pause') clk.pause();
      if(d.anim === 'play') clk.play();
      if(d.anim === 'restart') clk.restart();
      if(d.anim === 'toggle') clk.toggle();
    });

    clk.update = () => {
      const now = performance.now();
      let real = Math.min(0.1, (now - clk._last) / 1000); clk._last = now;
      clk.dt = (clk.playing && !drag) ? real * clk.speed : 0;
      clk.t += clk.dt;
      if(clk.t >= clk.duration){
        if(loop){ clk.t = clk.t % clk.duration; if(o.onSeek) o.onSeek(clk.t); }
        else { clk.t = clk.duration; if(clk.playing){ clk.playing = false; syncBtns(); } }
      }
      const f = clk.t / clk.duration;
      fill.style.width = (100*f) + '%'; knob.style.left = (100*f) + '%';
      tm.textContent = fmt(clk.t) + ' / ' + fmt(clk.duration);
      // faza curenta
      let ph = -1; o.phases.forEach((p,i) => { if(clk.t >= p.t) ph = i; });
      if(ph !== clk.phase){ clk.phase = ph; if(cap && ph >= 0) cap.innerHTML = o.phases[ph].text; }
      return clk.t;
    };
    window.__clk = clk;
    return clk;
  }

  // utilitare de animatie
  const clamp01 = x => Math.max(0, Math.min(1, x));
  const ease = x => { x = clamp01(x); return x*x*(3-2*x); };
  const easeIO = x => { x = clamp01(x); return x<.5 ? 4*x*x*x : 1-Math.pow(-2*x+2,3)/2; };
  // progres pe interval [a,b] din timpul t, cu easing
  const seg = (t, a, b, f) => (f||ease)(clamp01((t - a) / (b - a)));
  const lerp = (a, b, k) => a + (b - a) * k;

  window.AnimUI = {init, clamp01, ease, easeIO, seg, lerp};
})();
