// Woxcut – živé ukázky stylů titulků na webu (telefony v úvodu a v sekci Styly)
// a postupné objevování sekcí při rolování. Bez knihoven, animace běží jen ve viditelném telefonu.
(() => {
  const klid = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // věta = řádky, řádek = slova [text, velikost]  (L velké, M střední, S malé, K klíčové slovo)
  const STYLY = {
    kineticky: { jmeno: 'Kinetický', tri: 'st-kin', vety: [
      [[['Jak', 'L']], [['vlastně', 'M']], [['dělám', 'S'], ['ty', 'S']], [['titulky?', 'K']]],
      [[['Každé', 'L']], [['slovo', 'M']], [['naskočí', 'S']], [['přesně', 'K']]],
    ] },
    stack: { jmeno: 'Kinetický Stack', tri: 'st-stack', vety: [
      [[['Tohle', 'M']], [['tě', 'S'], ['zastaví', 'L']], [['ve', 'S'], ['scrollu', 'K']]],
      [[['Titulky', 'L']], [['bez', 'S'], ['práce', 'M']], [['za', 'S'], ['minutu', 'K']]],
    ] },
    editorial: { jmeno: 'Editorial', tri: 'st-edit', vety: [
      [[['Příběh,', 'M']], [['který', 'S'], ['stojí', 'S'], ['za', 'S']], [['přečtení', 'K']]],
      [[['Každé', 'M'], ['slovo', 'M']], [['má', 'S'], ['svůj', 'S']], [['okamžik', 'K']]],
    ] },
    reels: { jmeno: 'Profi reels', tri: 'st-reels', vety: [
      [[['dobré', 'M'], ['video', 'M']], [['potřebuje', 'M']], [['dobré', 'M'], ['titulky', 'K']]],
      [[['a', 'M'], ['ty', 'M'], ['je', 'M'], ['máš', 'M']], [['za', 'M'], ['minutu', 'K']]],
    ] },
  };
  const KROK = 190;   // ms mezi slovy

  function vykresli(el, styl, veta) {
    el.className = 'v-cap ' + styl.tri;
    let i = 0;
    el.innerHTML = veta.map((radek, r) => `<div class="v-ln" style="--r:${r}">${radek.map(([t, v]) =>
      `<span class="w w${v}" style="--i:${i++}">${t}</span>`).join(' ')}</div>`).join('');
    return i;
  }

  function prehravac(el, poradi) {
    let k = 0, casovac = null, bezi = false;
    const jmenoEl = el.hasAttribute('data-loop') ? document.getElementById('vStylJmeno') : null;
    function dalsi() {
      const [styl, veta] = poradi[k % poradi.length]; k++;
      el.classList.remove('out');
      const n = vykresli(el, styl, veta);
      if (jmenoEl) jmenoEl.textContent = styl.jmeno;
      if (klid) { el.classList.add('static'); casovac = setTimeout(dalsi, 3200); return; }
      casovac = setTimeout(() => { el.classList.add('out'); casovac = setTimeout(() => bezi && dalsi(), 450); }, n * KROK + 1700);
    }
    return {
      start() { if (bezi) return; bezi = true; dalsi(); },
      stop() { bezi = false; clearTimeout(casovac); },
    };
  }

  const vse = [];
  document.querySelectorAll('.v-cap[data-loop]').forEach(el => {
    vse.push([el, prehravac(el, ['kineticky', 'stack', 'editorial', 'reels'].map(s => [STYLY[s], STYLY[s].vety[0]]))]);
  });
  document.querySelectorAll('.v-cap[data-styl]').forEach(el => {
    const s = STYLY[el.dataset.styl]; if (!s) return;
    vse.push([el, prehravac(el, s.vety.map(v => [s, v]))]);
  });
  // ---- interaktivní ukázka funkcí: karta vlevo, telefon vpravo předvede, co funkce dělá ----
  const feat = document.querySelector('.v-feat');
  if (feat) {
    const cap = feat.querySelector('.v-cap[data-feat]'), scena = cap.parentElement;
    const tabs = [...feat.querySelectorAll('.v-tabs button')];
    let ted = 0, auto = null, prehr = null;
    const vrstva = (tr, html) => { const d = document.createElement('div'); d.className = 'v-fx ' + tr; d.innerHTML = html; scena.appendChild(d); return d; };
    // ukázky jsou jen titulky – každá funkce svým stylem a větou
    const ukazky = {
      prepis: () => prehravac(cap, [[STYLY.kineticky, STYLY.kineticky.vety[1]]]),
      styly: () => prehravac(cap, ['stack', 'editorial', 'reels', 'kineticky'].map(k => [STYLY[k], STYLY[k].vety[1]])),
      uprava: () => prehravac(cap, [[STYLY.reels, STYLY.reels.vety[0]]]),
      nadpis: () => prehravac(cap, [[STYLY.stack, STYLY.stack.vety[0]]]),
      zony: () => prehravac(cap, [[STYLY.editorial, STYLY.editorial.vety[0]]]),
      export: () => prehravac(cap, [[STYLY.kineticky, STYLY.kineticky.vety[0]]]),
    };
    function vyber(i, uzivatel) {
      ted = i;
      tabs.forEach((t, k) => t.classList.toggle('on', k === i));
      prehr?.stop(); scena.querySelectorAll('.v-fx').forEach(x => x.remove()); cap.classList.remove('v-uprava', 'out'); cap.innerHTML = '';
      prehr = ukazky[tabs[i].dataset.f](); prehr.start();
      clearTimeout(auto);
      if (!uzivatel && !klid) auto = setTimeout(() => vyber((ted + 1) % tabs.length), 6500);
    }
    tabs.forEach((t, k) => t.addEventListener('click', () => vyber(k, true)));
    vse.push([feat, { start() { vyber(ted); }, stop() { clearTimeout(auto); prehr?.stop(); } }]);
  }
  // animace jen ve viditelném telefonu
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(zaznamy => zaznamy.forEach(z => {
      const p = vse.find(([el]) => el === z.target); if (!p) return;
      z.isIntersecting ? p[1].start() : p[1].stop();
    }), { threshold: 0.25 });
    vse.forEach(([el]) => io.observe(el));
    // sekce se objevují při rolování
    const ro = new IntersectionObserver(zaznamy => zaznamy.forEach(z => { if (z.isIntersecting) { z.target.classList.add('in'); ro.unobserve(z.target); } }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.v-reveal').forEach((el, i) => { el.style.setProperty('--d', (i % 4) * 70 + 'ms'); ro.observe(el); });
  } else {
    vse.forEach(([, p]) => p.start());
    document.querySelectorAll('.v-reveal').forEach(el => el.classList.add('in'));
  }
})();
