/* Révision Coran — cartes de révision (QCM, récitation, audio, suivi) */
'use strict';

const VERSION = '1.2.0';
const STORE_KEY = 'coranRevision_v1';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rand = n => Math.floor(Math.random() * n);
const pick = a => a[rand(a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rand(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const pad3 = n => String(n).padStart(3, '0');
const today = () => new Date().toLocaleDateString('sv');

/* ---------- Modes ---------- */
const MODES = {
  suivante:   { label: 'Aya suivante',   icon: '⏭️' },
  precedente: { label: 'Aya précédente', icon: '⏮️' },
  complete:   { label: 'Compléter',      icon: '🧩' },
  mot:        { label: 'Mot manquant',   icon: '🔤' },
  sourate:    { label: 'Quelle sourate', icon: '📍' },
  ordre:      { label: 'Remettre en ordre', icon: '🔢' },
  recite:     { label: 'Réciter',        icon: '🎙️' },
  ecoute:     { label: 'Écoute',         icon: '🎧' },
};
const RECITERS = {
  'Alafasy_128kbps': 'Mishary Alafasy',
  'Abdul_Basit_Murattal_192kbps': 'Abdul Basit (murattal)',
  'Husary_128kbps': 'Mahmoud Al-Husary',
  'Minshawy_Murattal_128kbps': 'Al-Minshawi (murattal)',
  'Abdurrahmaan_As-Sudais_192kbps': 'Abdurrahman As-Sudais',
  'MaherAlMuaiqly128kbps': 'Maher Al-Muaiqly',
};
// Début de chaque juz [sourate, aya]
const JUZ = [[1,1],[2,142],[2,253],[3,93],[4,24],[4,148],[5,83],[6,111],[7,88],[8,41],[9,93],[11,6],[12,53],[15,1],[17,1],[18,75],[21,1],[23,1],[25,21],[27,56],[29,46],[33,31],[36,28],[39,32],[41,47],[46,1],[51,31],[58,1],[67,1],[78,1]];
const juzOf = (s, a) => { let j = 1; for (let i = 0; i < JUZ.length; i++) { const [js, ja] = JUZ[i]; if (s > js || (s === js && a >= ja)) j = i + 1; } return j; };
const THEMES = {
  emeraude:  { name: 'Émeraude & or',  sw: ['#0b1f19', '#fbf7ee', '#c9a24a'], meta: '#0f2a22' },
  manuscrit: { name: 'Manuscrit',      sw: ['#efe2c4', '#f8efd9', '#9b2c1f'], meta: '#e6d5ae', font: 'Cormorant+Garamond:wght@500;600;700' },
  minimal:   { name: 'Minimal clair',  sw: ['#f5f5f7', '#ffffff', '#1d4fd8'], meta: '#f5f5f7', font: 'Inter:wght@400;600;700' },
  nuit:      { name: 'Nuit étoilée',   sw: ['#0d1033', '#171b4a', '#f4e3a1'], meta: '#0d1033', font: 'Nunito:wght@400;600;800' },
  ludique:   { name: 'Ludique',        sw: ['#eafaf3', '#ffffff', '#16a36b'], meta: '#eafaf3', font: 'Baloo+2:wght@500;700;800' },
  desert:    { name: 'Sable du désert', sw: ['#f3e3c7', '#fffaf1', '#b8561b'], meta: '#f3e3c7', font: 'Lora:wght@500;600;700' },
  medina:    { name: 'Médina bleue',   sw: ['#dbe9fb', '#ffffff', '#2d6cdf'], meta: '#2d6cdf', font: 'Quicksand:wght@500;600;700' },
  oled:      { name: 'Noir OLED',      sw: ['#000000', '#0d0d0d', '#7dff9b'], meta: '#000000', font: 'Inter:wght@400;600&family=JetBrains+Mono:wght@500;700' },
};
function applyTheme() {
  const t = THEMES[S.settings.theme] ? S.settings.theme : 'emeraude', th = THEMES[t];
  document.documentElement.dataset.theme = t;
  document.querySelector('meta[name=theme-color]').setAttribute('content', th.meta);
  let l = document.getElementById('themeFont');
  if (th.font) {
    if (!l) { l = document.createElement('link'); l.id = 'themeFont'; l.rel = 'stylesheet'; document.head.appendChild(l); }
    l.href = `https://fonts.googleapis.com/css2?family=${th.font}&display=swap`;
  } else if (l) l.remove();
}
const SRS_STEPS = [60e3, 10 * 60e3, 864e5, 3 * 864e5, 7 * 864e5, 16 * 864e5, 35 * 864e5, 90 * 864e5];

/* ---------- State ---------- */
const defaultState = () => ({
  selected: [],
  modes: { suivante: true, precedente: true, complete: true, mot: true, sourate: true, ordre: true, recite: true, ecoute: true },
  current: 'mix',
  settings: { theme: 'emeraude', trad: true, pieges: true, reciter: 'Alafasy_128kbps', reciteType: 'mix', autoplay: true, voice: true },
  srs: {}, days: {}, surah: {}, total: { n: 0, ok: 0 },
});
let S = load();
function load() {
  try { const d = JSON.parse(localStorage.getItem(STORE_KEY)); if (d) { const def = defaultState(); return { ...def, ...d, modes: { ...def.modes, ...d.modes }, settings: { ...def.settings, ...d.settings } }; } } catch (e) {}
  return defaultState();
}
const save = () => localStorage.setItem(STORE_KEY, JSON.stringify(S));
applyTheme();

/* ---------- Data ---------- */
let SURAHS = [], AYAS = [], AYA_IDX = new Map(), INV = new Map(), DF = new Map();

function norm(t) {
  return t.replace(/ٰ/g, 'ا')
    .replace(/[ؐ-ًؚ-ٟۖ-ۭـ]/g, '')
    .replace(/[ٱأإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي').replace(/ء/g, '')
    .replace(/[^ء-ي\s]/g, '').replace(/\s+/g, ' ').trim();
}
// clé de comparaison tolérante (orthographe uthmani vs standard)
const key = w => w.replace(/[اوي]/g, '');

function tokens(ar) {
  const out = [];
  for (const t of ar.split(/\s+/)) {
    if (!t) continue;
    if (!norm(t) && out.length) out[out.length - 1] += ' ' + t; else out.push(t);
  }
  return out;
}

async function loadData() {
  const res = await fetch('data/quran.json');
  const raw = await res.json();
  raw.forEach((s, si) => {
    SURAHS.push({ i: si + 1, ar: s.n, tr: s.t, fr: s.f, type: s.m, count: s.v.length, juz: juzOf(si + 1, 1) });
    s.v.forEach((v, vi) => {
      const tk = tokens(v[0]);
      const nw = tk.map(norm);
      const a = { id: AYAS.length, s: si + 1, a: vi + 1, ar: v[0], fr: v[1], tk, nw };
      AYA_IDX.set(a.s + ':' + a.a, a);
      AYAS.push(a);
    });
  });
  // index inversé pour retrouver les ayat proches (mutashabihat)
  for (const a of AYAS) for (const w of new Set(a.nw)) {
    if (!w) continue;
    DF.set(w, (DF.get(w) || 0) + 1);
    if (!INV.has(w)) INV.set(w, []);
    INV.get(w).push(a.id);
  }
}
const aya = (s, a) => AYA_IDX.get(s + ':' + a);
const next = x => aya(x.s, x.a + 1);
const prev = x => aya(x.s, x.a - 1);
const surahName = s => SURAHS[s - 1].tr;

function similar(target, n = 3, opts = {}) {
  const { exclude = new Set(), filter = null, words = target.nw } = opts;
  const N = AYAS.length, score = new Map();
  for (const w of new Set(words)) {
    const df = DF.get(w); if (!df || df > 700) continue;
    const idf = Math.log(N / df);
    for (const id of INV.get(w)) score.set(id, (score.get(id) || 0) + idf);
  }
  const res = [];
  for (const [id, sc] of score) {
    const b = AYAS[id];
    if (id === target.id || exclude.has(id) || (filter && !filter(b))) continue;
    let s2 = sc;
    if (b.nw[0] === words[0]) s2 += 3;
    if (b.nw[0] === words[0] && b.nw[1] === words[1]) s2 += 4;
    s2 /= 1 + 0.03 * Math.abs(b.nw.length - words.length);
    res.push([id, s2]);
  }
  res.sort((x, y) => y[1] - x[1]);
  return res.slice(0, n).map(r => AYAS[r[0]]);
}

/* ---------- Pool & SRS ---------- */
let POOL = [];
const range = s => { const r = (S.ranges || {})[s], n = SURAHS[s - 1].count; return r ? [Math.max(1, Math.min(r[0], n)), Math.max(1, Math.min(r[1], n))] : [1, n]; };
const inSel = a => { if (!S.selected.includes(a.s)) return false; const [f, t] = range(a.s); return a.a >= f && a.a <= t; };
let POOL_IDS = new Set();
function buildPool() { POOL = AYAS.filter(inSel); POOL_IDS = new Set(POOL.map(a => a.id)); }
const inPool = a => !!a && POOL_IDS.has(a.id);
const rec = a => S.srs[a.s + ':' + a.a];

function pickTarget(filter) {
  const cand = POOL.filter(filter);
  if (!cand.length) return null;
  const now = Date.now();
  const due = cand.filter(a => { const r = rec(a); return r && r.d <= now; }).sort((x, y) => rec(x).d - rec(y).d);
  const fresh = cand.filter(a => !rec(a));
  const r = Math.random();
  if (due.length && r < 0.65) return pick(due.slice(0, 15));
  if (fresh.length && r < 0.9) return pick(fresh);
  // sinon : pondéré vers les boîtes basses
  const w = cand.map(a => 1 / (1 + ((rec(a) || {}).b || 0)));
  let t = Math.random() * w.reduce((x, y) => x + y, 0);
  for (let i = 0; i < cand.length; i++) { t -= w[i]; if (t <= 0) return cand[i]; }
  return pick(cand);
}

function grade(a, g) { // g: 'ok' | 'mid' | 'ko'
  const k = a.s + ':' + a.a, r = S.srs[k] || { b: 0, n: 0, k: 0 };
  r.n++; if (g === 'ok') r.k++;
  r.b = g === 'ok' ? Math.min(r.b + 1, SRS_STEPS.length - 1) : g === 'mid' ? Math.max(1, r.b - 1) : 0;
  r.d = Date.now() + SRS_STEPS[r.b];
  S.srs[k] = r;
  const st = S.surah[a.s] || { n: 0, ok: 0 }; st.n++; if (g === 'ok') st.ok++; S.surah[a.s] = st;
  S.total.n++; if (g === 'ok') S.total.ok++;
  S.days[today()] = (S.days[today()] || 0) + 1;
  session.n++; if (g === 'ok') session.ok++;
  save(); updateSession();
}

/* ---------- Audio ---------- */
const player = new Audio();
function audioUrl(a) { return `https://everyayah.com/data/${S.settings.reciter}/${pad3(a.s)}${pad3(a.a)}.mp3`; }
function play(a, then) { player.pause(); player.src = audioUrl(a); player.onended = then || null; player.play().catch(() => {}); }
function playSeq(list) { let i = 0; const go = () => { if (i < list.length) play(list[i++], go); }; go(); }

/* ---------- Helpers d'affichage ---------- */
function arSize(text) { const l = text.length; return l > 380 ? 'xs' : l > 160 ? 'small' : ''; }
function arBlock(text, extra = '') { return `<div class="ar ${arSize(text)} ${extra}">${text}</div>`; }
function frBlock(a) { return S.settings.trad ? `<div class="fr">${esc(a.fr)}</div>` : ''; }
function refLine(a) { return `<div class="ref">${esc(surahName(a.s))} · ${a.s}:${a.a} <button class="play" data-play="${a.s}:${a.a}">🔊</button></div>`; }
// préfixes minimaux pour distinguer des propositions (ayat qui se ressemblent)
function distinctPrefixes(list, min = 5, max = 40) {
  for (let L = min; L <= max; L++) {
    const keys = list.map(t => t.slice(0, L).map(w => norm(w)).join(' '));
    if (new Set(keys).size === keys.length) return list.map(t => t.slice(0, L).join(' ') + (t.length > L ? ' …' : ''));
  }
  return list.map(t => t.join(' '));
}
function distinctSuffixes(list, min = 5, max = 40) {
  const rev = distinctPrefixes(list.map(t => t.slice().reverse()), min, max);
  return list.map((t, i) => { const L = Math.min(t.length, rev[i].replace(' …', '').split(' ').length); return (t.length > L ? '… ' : '') + t.slice(t.length - L).join(' '); });
}
const fill = (arr, more) => { const ids = new Set(arr.map(x => x.id)); for (const m of more) if (arr.length < 4 && !ids.has(m.id)) { arr.push(m); ids.add(m.id); } return arr; };
function distractorsFor(correct, exclude = []) {
  const ex = new Set([correct.id, ...exclude.map(x => x.id)]);
  const seen = new Set([correct.nw.join(' ')]);
  const uniq = a => { const k = a.nw.join(' '); if (seen.has(k)) return false; seen.add(k); return true; };
  const d = (S.settings.pieges ? similar(correct, 8, { exclude: ex }) : []).filter(uniq).slice(0, 3);
  const more = shuffle(POOL.length > 6 ? POOL : AYAS).filter(x => !ex.has(x.id)).slice(0, 30).filter(uniq);
  return fill([correct, ...d], more).slice(1, 4);
}

/* ---------- Construction des questions ---------- */
function buildQuestion(mode) {
  switch (mode) {
    case 'suivante': case 'precedente': {
      const isNext = mode === 'suivante';
      const x = pickTarget(a => isNext ? inPool(next(a)) : inPool(prev(a))); if (!x) return null;
      const ans = isNext ? next(x) : prev(x);
      const opts = shuffle([ans, ...distractorsFor(ans, [x])]);
      const labels = distinctPrefixes(opts.map(o => o.tk));
      return { mode, target: ans, prompt: isNext ? 'Quelle aya vient juste après ?' : 'Quelle aya vient juste avant ?',
        show: x, opts: opts.map((o, i) => ({ html: labels[i], good: o.id === ans.id, aya: o })) };
    }
    case 'complete': {
      const x = pickTarget(a => a.tk.length >= 4); if (!x) return null;
      const h = Math.min(Math.ceil(x.tk.length / 2), 12);
      const start = x.tk.slice(0, h);
      let others = S.settings.pieges ? similar(x, 6, { words: x.nw.slice(0, h + 2), filter: b => b.tk.length >= 4 }) : [];
      const endKey = o => o.id === x.id ? x.nw.slice(h).join(' ') : o.nw.slice(Math.min(Math.ceil(o.tk.length / 2), 12)).join(' ');
      const seenE = new Set([endKey(x)]);
      const uniqE = o => { const k = endKey(o); if (seenE.has(k)) return false; seenE.add(k); return true; };
      others = others.filter(uniqE);
      fill(others = [x, ...others.slice(0, 3)], shuffle(POOL).filter(b => b.tk.length >= 4).slice(0, 30).filter(uniqE));
      const opts = shuffle(others);
      const ends = opts.map(o => o.id === x.id ? x.tk.slice(h) : o.tk.slice(Math.min(Math.ceil(o.tk.length / 2), 12)));
      const labels = distinctPrefixes(ends, 4);
      return { mode, target: x, prompt: 'Complète l’aya', showHtml: arBlock(start.join(' ') + ' …'),
        opts: opts.map((o, i) => ({ html: '… ' + labels[i], good: o.id === x.id, aya: o })) };
    }
    case 'mot': {
      const x = pickTarget(a => a.nw.filter(w => w.length >= 3).length >= 2); if (!x) return null;
      const idxs = x.nw.map((w, i) => w.length >= 3 ? i : -1).filter(i => i >= 0);
      const i = pick(idxs), word = x.tk[i], wn = x.nw[i];
      const pool = new Map();
      const src = S.settings.pieges ? similar(x, 8) : shuffle(POOL).slice(0, 8);
      for (const b of [...src, ...shuffle(POOL).slice(0, 20)]) {
        const j = Math.min(i, b.tk.length - 1);
        for (const k of [j, j - 1, j + 1, rand(b.tk.length)]) {
          const w = b.tk[k], n = b.nw[k];
          if (w && n && n.length >= 3 && n !== wn && !pool.has(n)) pool.set(n, w);
        }
        if (pool.size >= 12) break;
      }
      const wrong = shuffle([...pool.values()]).slice(0, 3);
      const opts = shuffle([{ html: word, good: true }, ...wrong.map(w => ({ html: w, good: false }))]);
      const shown = x.tk.map((t, k) => k === i ? '<span class="blank">&nbsp;</span>' : t).join(' ');
      return { mode, target: x, prompt: 'Quel mot manque ?', showHtml: arBlock(shown), opts };
    }
    case 'sourate': {
      const x = pickTarget(() => true); if (!x) return null;
      const set = new Set([x.s]);
      if (S.settings.pieges) for (const b of similar(x, 10)) { if (set.size < 4) set.add(b.s); }
      for (const s of shuffle([...new Set(POOL.map(a => a.s))])) if (set.size < 4) set.add(s);
      while (set.size < 4) set.add(1 + rand(114));
      const opts = shuffle([...set]).map(s => ({ html: `${s}. ${esc(SURAHS[s - 1].tr)} <span style="font-family:var(--ar);float:right">${SURAHS[s - 1].ar}</span>`, good: s === x.s, fr: true }));
      return { mode, target: x, prompt: 'De quelle sourate vient cette aya ?', showHtml: arBlock(x.ar) + frBlock(x), opts, hideRef: true };
    }
    case 'ordre': {
      const x = pickTarget(a => inPool(aya(a.s, a.a + 3))); if (!x) return null;
      const seq = [x, aya(x.s, x.a + 1), aya(x.s, x.a + 2), aya(x.s, x.a + 3)];
      const labels = distinctPrefixes(seq.map(a => a.tk), 5, 12);
      const items = seq.map((a, i) => ({ a, html: labels[i], pos: i }));
      return { mode, target: x, seq, prompt: `Remets ces ayat dans l’ordre (${esc(surahName(x.s))})`, items: shuffle(items) };
    }
    case 'recite': {
      let t = S.settings.reciteType; if (t === 'mix') t = Math.random() < .5 ? 'suite' : 'fin';
      if (t === 'suite') {
        const x = pickTarget(a => inPool(next(a))); if (!x) return null;
        return { mode, sub: 'suite', target: next(x), show: x, prompt: 'Récite l’aya suivante', expected: next(x).tk };
      }
      const x = pickTarget(a => a.tk.length >= 4); if (!x) return null;
      const h = Math.min(Math.ceil(x.tk.length / 2), 12);
      return { mode, sub: 'fin', target: x, prompt: 'Termine l’aya', showHtml: arBlock(x.tk.slice(0, h).join(' ') + ' …'), expected: x.tk.slice(h), startLen: h };
    }
    case 'ecoute': {
      const x = pickTarget(() => true); if (!x) return null;
      const opts = shuffle([x, ...distractorsFor(x)]);
      const labels = distinctPrefixes(opts.map(o => o.tk));
      return { mode, target: x, prompt: 'Écoute et choisis l’aya récitée', audio: true,
        showHtml: `<div style="text-align:center;margin:14px 0"><button class="btn gold" data-listen>🎧 Écouter</button></div>`,
        opts: opts.map((o, i) => ({ html: labels[i], good: o.id === x.id, aya: o })) };
    }
  }
}

/* ---------- Reconnaissance vocale ---------- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
function lcsMatch(exp, got) {
  const E = exp.map(w => key(norm(w))), G = got.map(w => key(norm(w)));
  const eq = (a, b) => a === b || (a.length > 2 && b.length > 2 && lev(a, b) <= Math.max(1, Math.floor(Math.max(a.length, b.length) / 4)));
  const m = E.length, n = G.length, dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) dp[i][j] = eq(E[i - 1], G[j - 1]) ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  const hit = new Array(m).fill(false); let i = m, j = n;
  while (i > 0 && j > 0) { if (eq(E[i - 1], G[j - 1]) && dp[i][j] === dp[i - 1][j - 1] + 1) { hit[i - 1] = true; i--; j--; } else if (dp[i - 1][j] >= dp[i][j - 1]) i--; else j--; }
  return hit;
}
function lev(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

/* ---------- Deck & cartes ---------- */
const session = { n: 0, ok: 0 };
let currentCard = null;
function updateSession() {
  $('#sessionInfo').textContent = session.n ? `${session.n} carte${session.n > 1 ? 's' : ''} · ${Math.round(100 * session.ok / session.n)} %` : '';
}
function enabledModes() { return Object.keys(MODES).filter(m => S.modes[m]); }

function renderModeBar() {
  const list = [['mix', '🔀 Mix'], ...enabledModes().map(m => [m, MODES[m].icon + ' ' + MODES[m].label])];
  if (S.current !== 'mix' && !S.modes[S.current]) S.current = 'mix';
  $('#modeBar').innerHTML = list.map(([k, l]) => `<button class="chip ${S.current === k ? 'on' : ''}" data-mode="${k}">${l}</button>`).join('');
}

function newCard() {
  const deck = $('#deck');
  deck.innerHTML = '';
  if (!S.selected.length) {
    deck.innerHTML = `<div class="empty">Coche d’abord les sourates que tu connais.<br><button class="btn gold" data-goto="surahs">📖 Choisir mes sourates</button></div>`;
    $('#deckHint').textContent = ''; return;
  }
  let q = null, tries = 0;
  while (!q && tries++ < 12) {
    const modes = S.current === 'mix' ? enabledModes() : [S.current];
    q = buildQuestion(pick(modes.length ? modes : ['suivante']));
  }
  if (!q) { deck.innerHTML = `<div class="empty">Pas assez d’ayat pour ce mode.<br>Ajoute des sourates ou change de mode.</div>`; return; }
  const back = document.createElement('div'); back.className = 'card back'; deck.appendChild(back);
  const card = document.createElement('div'); card.className = 'card'; deck.appendChild(card);
  currentCard = { q, el: card, answered: false, g: null };
  renderCard(currentCard);
  attachSwipe(currentCard);
}

function renderCard(c) {
  const { q, el } = c, m = MODES[q.mode];
  let body = `<div class="q">${q.prompt}</div>`;
  if (q.show) body += arBlock(q.show.ar) + frBlock(q.show) + refLine(q.show);
  if (q.showHtml) body += q.showHtml;
  if (q.opts) body += `<div class="opts">${q.opts.map((o, i) => `<button class="opt ${o.fr ? 'fr-opt' : ''}" data-opt="${i}">${o.html}</button>`).join('')}</div>`;
  if (q.items) body += `<div class="opts">${q.items.map((it, i) => `<button class="opt" data-item="${i}">${it.html}</button>`).join('')}</div>`;
  if (q.mode === 'recite') {
    body += `<div class="btnrow">${SR && S.settings.voice ? `<button class="btn gold" data-mic>🎙️ Réciter</button>` : ''}<button class="btn light" data-reveal>👁️ Révéler</button></div><div class="transcript" data-tr></div>`;
  }
  body += `<div data-after></div>`;
  el.innerHTML = `<div class="stamp r">SU ✓</div><div class="stamp l">À REVOIR</div>
    <div class="head"><span class="tag">${m.icon} ${m.label}</span><span>${esc(surahName(q.target.s))}${q.hideRef ? '' : ''}</span></div>
    <div class="body">${body}</div>`;
  if (q.mode === 'sourate') $('.head span:last-child', el).textContent = 'Sourate ?';
  setHint(c);
  if (q.audio && S.settings.autoplay) play(q.target);
}

function setHint(c) {
  const h = $('#deckHint');
  if (!c.answered) h.textContent = c.q.mode === 'recite' ? 'Récite à voix haute, puis révèle' : c.q.mode === 'ordre' ? 'Touche les ayat dans l’ordre' : 'Choisis la bonne réponse';
  else if (c.selfEval) h.textContent = '← À revoir   ·   Je savais →';
  else h.textContent = 'Glisse la carte pour continuer →';
}

function finish(c, g, html) {
  c.answered = true; c.g = g;
  const t = c.q.target;
  const msg = { ok: '✅ Bravo !', mid: '🟠 Presque', ko: '❌ Raté' }[g];
  let out = html || `<div class="result ${g}">${msg}</div>`;
  if (!html) out += revealBlock(t, c.q) + `<div class="btnrow"><button class="btn gold" data-nextcard>Suivant →</button></div>`;
  $('[data-after]', c.el).innerHTML = out;
  grade(t, g);
  setHint(c);
  if (S.settings.autoplay && !c.q.audio && g !== 'ok') play(t);
}
function revealBlock(t, q) {
  let s = `<div class="reveal">`;
  if (q && q.mode === 'ordre') s += q.seq.map(a => arBlock(a.ar, 'small') + frBlock(a)).join('') + refLine(q.seq[0]);
  else s += arBlock(t.ar, 'small') + frBlock(t) + refLine(t);
  return s + `</div>`;
}

/* Interactions dans la carte */
document.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.goto) return showView(b.dataset.goto);
  if (b.dataset.play) { const [s, a] = b.dataset.play.split(':').map(Number); return play(aya(s, a)); }
  if (b.dataset.mode) { S.current = b.dataset.mode; save(); renderModeBar(); return newCard(); }
  const c = currentCard; if (!c || !c.el.contains(b)) return;
  const q = c.q;
  if (b.hasAttribute('data-listen')) return play(q.target);
  if (b.dataset.opt !== undefined && !c.answered) {
    const o = q.opts[+b.dataset.opt];
    $$('.opt', c.el).forEach((x, i) => { x.classList.add(q.opts[i].good ? 'good' : 'dim'); });
    if (!o.good) { b.classList.remove('dim'); b.classList.add('bad'); }
    return finish(c, o.good ? 'ok' : 'ko');
  }
  if (b.dataset.item !== undefined && !c.answered) {
    const it = q.items[+b.dataset.item];
    c.step = c.step || 0; c.err = c.err || 0;
    if (b.classList.contains('good')) return;
    if (it.pos === c.step) { b.classList.add('good'); b.insertAdjacentHTML('afterbegin', `<span class="num">${c.step + 1}</span>`); c.step++; }
    else { c.err++; b.classList.add('bad'); setTimeout(() => b.classList.remove('bad'), 450); }
    if (c.step === 4) finish(c, c.err === 0 ? 'ok' : c.err === 1 ? 'mid' : 'ko');
    return;
  }
  if (b.hasAttribute('data-mic')) return toggleMic(c, b);
  if (b.hasAttribute('data-reveal')) return revealRecite(c);
  if (b.dataset.self) { finishSelf(c, b.dataset.self); return swipeOut(c, b.dataset.self === 'ko' ? -1 : 1); }
  if (b.hasAttribute('data-nextcard')) return swipeOut(c, 1);
});

/* Récitation */
let recog = null;
function toggleMic(c, btn) {
  if (recog) { recog.stop(); return; }
  if (!SR) return;
  recog = new SR(); recog.lang = 'ar-SA'; recog.interimResults = true; recog.continuous = true; recog.maxAlternatives = 1;
  const trEl = $('[data-tr]', c.el); let text = '';
  btn.classList.add('rec'); btn.textContent = '⏹️ Stop';
  player.pause();
  recog.onresult = ev => { text = [...ev.results].map(r => r[0].transcript).join(' '); trEl.textContent = text; };
  recog.onerror = ev => { trEl.textContent = ev.error === 'not-allowed' ? 'Micro refusé — utilise « Révéler ».' : 'Erreur micro : ' + ev.error; };
  recog.onend = () => { recog = null; btn.classList.remove('rec'); btn.textContent = '🎙️ Réessayer'; if (text.trim()) scoreRecite(c, text); };
  try { recog.start(); } catch (e) { recog = null; }
}
function scoreRecite(c, text) {
  const exp = c.q.expected, got = text.split(/\s+/).filter(Boolean);
  const hit = lcsMatch(exp, got);
  const denom = Math.min(exp.length, Math.max(6, Math.ceil(got.length * 1.15)));
  const nHit = hit.slice(0, denom).filter(Boolean).length;
  const ratio = Math.min(1, nHit / denom);
  const g = ratio >= .8 ? 'ok' : ratio >= .5 ? 'mid' : 'ko';
  const shown = exp.map((w, i) => `<span class="${i < denom ? (hit[i] ? 'w-ok' : 'w-ko') : ''}">${w}</span>`).join(' ');
  const pre = c.q.sub === 'fin' ? c.q.target.tk.slice(0, c.q.startLen).join(' ') + ' ' : '';
  const t = c.q.target;
  c.answered = true; c.selfEval = true; c.suggested = g;
  $('[data-after]', c.el).innerHTML = `<div class="result ${g}">${{ ok: '✅', mid: '🟠', ko: '❌' }[g]} ${Math.round(ratio * 100)} % de mots reconnus</div>
    <div class="reveal"><div class="ar ${arSize(t.ar)}">${pre}${shown}</div>${frBlock(t)}${refLine(t)}</div>${selfButtons()}`;
  setHint(c);
}
function revealRecite(c) {
  if (recog) recog.stop();
  if (c.answered) return;
  c.answered = true; c.selfEval = true;
  $('[data-after]', c.el).innerHTML = revealBlock(c.q.target) + selfButtons();
  setHint(c);
  if (S.settings.autoplay) play(c.q.target);
}
const selfButtons = () => `<div class="btnrow"><button class="btn ko" data-self="ko">✘ Raté</button><button class="btn mid" data-self="mid">~ Hésité</button><button class="btn ok" data-self="ok">✔ Su</button></div>`;
function finishSelf(c, g) { if (c.graded) return; c.graded = true; grade(c.q.target, g); }

/* Swipe */
function attachSwipe(c) {
  const el = c.el; let sx = 0, sy = 0, dx = 0, drag = false, locked = null;
  el.addEventListener('pointerdown', e => {
    if (!c.answered) return;
    const b = e.target.closest('button');
    if (b && !b.classList.contains('opt')) return;
    drag = true; locked = null; sx = e.clientX; sy = e.clientY; dx = 0;
  });
  el.addEventListener('pointermove', e => {
    if (!drag) return;
    const mx = e.clientX - sx, my = e.clientY - sy;
    if (locked === null && (Math.abs(mx) > 8 || Math.abs(my) > 8)) locked = Math.abs(mx) > Math.abs(my) ? 'x' : 'y';
    if (locked !== 'x') return;
    e.preventDefault();
    if (!el.hasPointerCapture(e.pointerId)) try { el.setPointerCapture(e.pointerId); } catch (_) {}
    dx = mx;
    el.style.transform = `translateX(${dx}px) rotate(${dx / 18}deg)`;
    $('.stamp.r', el).style.opacity = Math.max(0, Math.min(1, dx / 90));
    $('.stamp.l', el).style.opacity = Math.max(0, Math.min(1, -dx / 90));
  });
  const end = () => {
    if (!drag) return; drag = false;
    if (locked === 'x' && Math.abs(dx) > 90) {
      if (c.selfEval && !c.graded) finishSelf(c, dx > 0 ? (c.suggested === 'ok' || !c.suggested ? 'ok' : c.suggested) : 'ko');
      swipeOut(c, Math.sign(dx));
    } else { el.style.transition = 'transform .2s'; el.style.transform = ''; $$('.stamp', el).forEach(s => s.style.opacity = 0); setTimeout(() => el.style.transition = '', 200); }
  };
  el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
  // secours tactile : empêche le navigateur de récupérer le geste horizontal
  el.addEventListener('touchmove', e => { if (drag && locked === 'x') e.preventDefault(); }, { passive: false });
}
function swipeOut(c, dir) {
  if (c.out) return; c.out = true;
  if (recog) recog.stop();
  const el = c.el; el.classList.add('fly');
  el.style.transform = `translateX(${dir * 600}px) rotate(${dir * 30}deg)`; el.style.opacity = 0;
  setTimeout(newCard, 280);
}

/* ---------- Sourates ---------- */
function surahMastery(s) {
  const [f, t] = range(s); let m = 0;
  for (let a = f; a <= t; a++) { const r = S.srs[s + ':' + a]; if (r && r.b >= 4) m++; }
  return m / (t - f + 1);
}
function renderSurahs() {
  const q = $('#surahSearch').value.trim().toLowerCase();
  const sel = new Set(S.selected);
  const groups = {};
  for (const s of SURAHS) {
    if (q && !(`${s.i} ${s.tr} ${s.fr} ${s.ar}`.toLowerCase().includes(q))) continue;
    (groups[s.juz] = groups[s.juz] || []).push(s);
  }
  $('#surahList').innerHTML = Object.keys(groups).map(j => `<div class="juz"><h3>Juz ${j}<button data-juz="${j}">tout</button></h3>${groups[j].map(s => `
    <label class="srow"><input type="checkbox" data-s="${s.i}" ${sel.has(s.i) ? 'checked' : ''}>
      <span class="n">${s.i}</span><span class="t"><b>${esc(s.tr)}</b><small>${esc(s.fr)} · ${s.count} ayat</small></span>
      ${sel.has(s.i) ? `<span class="m" title="maîtrise"><i style="width:${Math.round(surahMastery(s.i) * 100)}%"></i></span>` : ''}
      <span class="a">${s.ar}</span></label>${sel.has(s.i) && s.count > 1 ? rangeRow(s) : ''}`).join('')}</div>`).join('');
  const nA = POOL.length;
  $('#selCount').textContent = `${S.selected.length} sourate${S.selected.length > 1 ? 's' : ''} cochée${S.selected.length > 1 ? 's' : ''} · ${nA} ayat en révision`;
}
function rangeRow(s) {
  const [f, t] = range(s.i), all = f === 1 && t === s.count;
  return `<div class="range"><span>Ayat</span><input type="number" inputmode="numeric" min="1" max="${s.count}" value="${f}" data-rf="${s.i}" aria-label="Première aya">
    <span>à</span><input type="number" inputmode="numeric" min="1" max="${s.count}" value="${t}" data-rt="${s.i}" aria-label="Dernière aya">
    <span class="rn">${t - f + 1}/${s.count}</span>${all ? '' : `<button data-rall="${s.i}">Toutes</button>`}</div>`;
}
function setRange(s, f, t) {
  const n = SURAHS[s - 1].count; f = Math.max(1, Math.min(+f || 1, n)); t = Math.max(1, Math.min(+t || n, n)); if (f > t) [f, t] = [t, f];
  S.ranges = S.ranges || {}; if (f === 1 && t === n) delete S.ranges[s]; else S.ranges[s] = [f, t];
  save(); buildPool(); renderSurahs();
}
function setSelected(list) { S.selected = [...new Set(list)].sort((a, b) => a - b); save(); buildPool(); renderSurahs(); }
$('#surahList').addEventListener('change', e => {
  const d = e.target.dataset;
  if (d.rf || d.rt) { const s = +(d.rf || d.rt), [f, t] = range(s); return setRange(s, d.rf ? e.target.value : f, d.rt ? e.target.value : t); }
  const s = +d.s; if (!s) return;
  setSelected(e.target.checked ? [...S.selected, s] : S.selected.filter(x => x !== s));
});
$('#surahList').addEventListener('click', e => {
  if (e.target.dataset.rall) return setRange(+e.target.dataset.rall, 1, 1e9);
  const j = e.target.dataset.juz; if (!j) return; e.preventDefault();
  const ids = SURAHS.filter(s => s.juz === +j).map(s => s.i);
  const all = ids.every(i => S.selected.includes(i));
  setSelected(all ? S.selected.filter(x => !ids.includes(x)) : [...S.selected, ...ids]);
});
$('#surahSearch').addEventListener('input', renderSurahs);
$$('.quick button').forEach(b => b.addEventListener('click', () => {
  const k = b.dataset.quick;
  if (k === 'none') return setSelected([]);
  const ids = SURAHS.filter(s => s.juz === (k === 'amma' ? 30 : 29)).map(s => s.i);
  setSelected([...S.selected, ...ids]);
}));

/* ---------- Suivi ---------- */
function streak() {
  let n = 0; const d = new Date();
  if (!S.days[today()]) d.setDate(d.getDate() - 1);
  while (S.days[d.toLocaleDateString('sv')]) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
function renderStats() {
  const recs = POOL.map(rec);
  const seen = recs.filter(Boolean).length, mastered = recs.filter(r => r && r.b >= 4).length;
  const due = recs.filter(r => r && r.d <= Date.now()).length;
  const pct = S.total.n ? Math.round(100 * S.total.ok / S.total.n) : 0;
  let html = `<div class="grid">
    <div class="tile"><b>🔥 ${streak()}</b><span>jours d’affilée</span></div>
    <div class="tile"><b>${S.days[today()] || 0}</b><span>cartes aujourd’hui</span></div>
    <div class="tile"><b>${pct} %</b><span>réussite globale (${S.total.n})</span></div>
    <div class="tile"><b>${due}</b><span>ayat à revoir maintenant</span></div>
    <div class="tile"><b>${mastered}/${POOL.length}</b><span>ayat maîtrisées</span></div>
    <div class="tile"><b>${seen}</b><span>ayat déjà vues</span></div></div>`;
  // 30 derniers jours
  html += `<h2>30 derniers jours</h2><div class="heat">`;
  const max = Math.max(1, ...Object.values(S.days));
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i); const v = S.days[d.toLocaleDateString('sv')] || 0;
    html += `<i title="${d.toLocaleDateString('fr')} : ${v}" style="${v ? `background:rgba(201,162,74,${.25 + .75 * v / max})` : ''}"></i>`;
  }
  html += `</div>`;
  // par sourate
  const rows = S.selected.map(s => {
    const [f, t] = range(s), n = t - f + 1; let m = 0, l = 0, w = 0;
    for (let a = f; a <= t; a++) { const r = S.srs[s + ':' + a]; if (!r) continue; if (r.b >= 4) m++; else if (r.b >= 2) l++; else w++; }
    const st = S.surah[s] || { n: 0, ok: 0 };
    return { s, n, m, l, w, rate: st.n ? st.ok / st.n : null };
  }).sort((a, b) => (a.rate ?? 2) - (b.rate ?? 2));
  html += `<h2>Par sourate (les plus faibles en haut)</h2>`;
  html += rows.length ? rows.map(r => `<div class="bar"><span class="lbl">${r.s}. ${esc(SURAHS[r.s - 1].tr)}</span>
    <span class="trk"><i style="width:${100 * r.m / r.n}%;background:var(--green)"></i><i style="width:${100 * r.l / r.n}%;background:var(--amber)"></i><i style="width:${100 * r.w / r.n}%;background:var(--red)"></i></span>
    <span class="v">${r.rate === null ? '–' : Math.round(r.rate * 100) + ' %'}</span></div>`).join('')
    + `<div class="legend"><span><i style="background:var(--green)"></i>maîtrisé</span><span><i style="background:var(--amber)"></i>en cours</span><span><i style="background:var(--red)"></i>fragile</span><span>% = réussite</span></div>`
    : `<div class="empty">Aucune sourate cochée.</div>`;
  $('#statsBox').innerHTML = html;
}

/* ---------- Réglages ---------- */
function renderSettings() {
  const st = S.settings;
  $('#settingsBox').innerHTML = `
  <h2>Thème</h2><div class="themes">${Object.entries(THEMES).map(([k, t]) => `<button class="theme ${st.theme === k ? 'on' : ''}" data-theme-pick="${k}"><span class="sw">${t.sw.map(c => `<i style="background:${c}"></i>`).join('')}</span>${t.name}</button>`).join('')}</div>
  <h2>Modes de jeu</h2><div class="set">${Object.entries(MODES).map(([k, m]) => `<label>${m.icon} ${m.label}<input type="checkbox" data-mode-t="${k}" ${S.modes[k] ? 'checked' : ''}></label>`).join('')}</div>
  <h2>Options</h2><div class="set">
    <label><span>Pièges (ayat qui se ressemblent)<small>Les mauvaises réponses sont des mutashabihat</small></span><input type="checkbox" data-set="pieges" ${st.pieges ? 'checked' : ''}></label>
    <label><span>Traduction française<small>Hamidullah</small></span><input type="checkbox" data-set="trad" ${st.trad ? 'checked' : ''}></label>
    <label><span>Lecture audio automatique<small>Mode écoute + correction</small></span><input type="checkbox" data-set="autoplay" ${st.autoplay ? 'checked' : ''}></label>
    <label><span>Reconnaissance vocale<small>${SR ? 'Disponible sur cet appareil' : 'Non disponible ici → auto-évaluation'}</small></span><input type="checkbox" data-set="voice" ${st.voice ? 'checked' : ''} ${SR ? '' : 'disabled'}></label>
    <label>Récitation<select data-sel="reciteType">${[['mix', 'Suite ou fin (mix)'], ['suite', 'Aya suivante'], ['fin', 'Fin de l’aya']].map(([v, l]) => `<option value="${v}" ${st.reciteType === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
    <label>Récitateur<select data-sel="reciter">${Object.entries(RECITERS).map(([v, l]) => `<option value="${v}" ${st.reciter === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
  </div>
  <h2>Données</h2>
  <button class="danger" data-reset>Réinitialiser le suivi (garder les sourates)</button>
  <div class="foot">Texte arabe uthmani (Hafs, Complexe du Roi Fahd) · traduction Muhammad Hamidullah (comme quran.com/fr) · audio everyayah.com<br>Version ${VERSION}</div>`;
}
$('#settingsBox').addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.modeT) { S.modes[t.dataset.modeT] = t.checked; if (!enabledModes().length) { S.modes[t.dataset.modeT] = true; t.checked = true; } }
  if (t.dataset.set) S.settings[t.dataset.set] = t.checked;
  if (t.dataset.sel) { S.settings[t.dataset.sel] = t.value; if (t.dataset.sel === 'reciter') play(aya(1, 1)); }
  save(); renderModeBar();
});
$('#settingsBox').addEventListener('click', e => {
  const tp = e.target.closest('[data-theme-pick]');
  if (tp) { S.settings.theme = tp.dataset.themePick; save(); applyTheme(); renderSettings(); return; }
  if (!e.target.hasAttribute('data-reset')) return;
  if (!confirm('Effacer tout le suivi de révision ?')) return;
  Object.assign(S, { srs: {}, days: {}, surah: {}, total: { n: 0, ok: 0 } }); save(); renderSettings();
});

/* ---------- Navigation ---------- */
function showView(v) {
  $$('.view').forEach(x => x.classList.toggle('active', x.id === 'view-' + v));
  $$('.tabs button').forEach(b => b.classList.toggle('on', b.dataset.view === v));
  if (v === 'surahs') renderSurahs();
  if (v === 'stats') renderStats();
  if (v === 'settings') renderSettings();
  if (v === 'revise') { renderModeBar(); if (!currentCard || currentCard.out || currentCard.answered || !$('#deck .card')) newCard(); }
}
$$('.tabs button').forEach(b => b.addEventListener('click', () => showView(b.dataset.view)));

/* ---------- Démarrage ---------- */
(async () => {
  try { await loadData(); } catch (e) { $('#loading').textContent = 'Erreur de chargement des données.'; return; }
  buildPool();
  $('#loading').remove();
  renderModeBar();
  if (S.selected.length) newCard(); else showView('surahs');
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
