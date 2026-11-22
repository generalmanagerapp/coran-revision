/* Muraja'a — cartes de révision (QCM, récitation, audio, suivi) */
'use strict';

const VERSION = '1.6.2';
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
  suivante:   { label: 'Aya suivante',   icon: '⏭️', g: 'quiz', d: 'Trouve l’aya qui vient juste après' },
  precedente: { label: 'Aya précédente', icon: '⏮️', g: 'quiz', d: 'Trouve l’aya qui vient juste avant' },
  complete:   { label: 'Compléter',      icon: '🧩', g: 'quiz', d: 'Choisis la fin de l’aya' },
  mot:        { label: 'Mot manquant',   icon: '🔤', g: 'quiz', d: 'Retrouve le mot qui manque' },
  sourate:    { label: 'Quelle sourate', icon: '📍', g: 'quiz', d: 'De quelle sourate vient l’aya ?' },
  ordre:      { label: 'Remettre en ordre', icon: '🔢', g: 'quiz', d: 'Fais glisser 4 ayat dans l’ordre' },
  motamot:    { label: 'Mot à mot',      icon: '🧱', g: 'quiz', d: 'Reconstitue l’aya en touchant les mots dans l’ordre' },
  ecoute:     { label: 'Écoute',         icon: '🎧', g: 'quiz', d: 'Écoute et reconnais l’aya' },
  recite:     { label: 'Réciter',        icon: '🎙️', g: 'recit', d: 'Récite la suite ou la fin de l’aya' },
  lettres:    { label: 'Premières lettres', icon: '🔠', g: 'recit', d: 'Récite avec seulement la 1re lettre de chaque mot' },
  echo:       { label: 'Écho',           icon: '👂', g: 'memo', d: 'Écoute l’aya, puis répète-la sans le texte' },
  efface:     { label: 'Effacement',     icon: '🧠', g: 'memo', d: 'Le texte s’efface petit à petit : tiens jusqu’au bout !' },
};
const GROUPS = { quiz: 'Quiz', recit: 'Récitation', memo: 'Mémorisation (jeux)' };
const QUICK = ['suivante', 'precedente', 'complete', 'mot', 'sourate'];   // modes du défi chrono
const RECITERS = {
  'Alafasy_128kbps': { n: 'Mishary Alafasy', d: ['Alafasy_128kbps'] },
  'Ghamadi_40kbps': { n: 'Saad Al-Ghamidi', d: ['Ghamadi_40kbps'] },
  'Saood_ash-Shuraym_128kbps': { n: 'Saoud Ash-Shuraim', d: ['Saood_ash-Shuraym_128kbps', 'Saood_ash-Shuraym_64kbps'] },
  'Ayman_Sowaid_64kbps': { n: 'Ayman Suwaid', d: ['Ayman_Sowaid_64kbps'] },
  'Abdul_Basit_Murattal_192kbps': { n: 'Abdul Basit (murattal)', d: ['Abdul_Basit_Murattal_192kbps'] },
  'Husary_128kbps': { n: 'Mahmoud Al-Husary', d: ['Husary_128kbps'] },
  'Minshawy_Murattal_128kbps': { n: 'Al-Minshawi (murattal)', d: ['Minshawy_Murattal_128kbps'] },
  'Abdurrahmaan_As-Sudais_192kbps': { n: 'Abdurrahman As-Sudais', d: ['Abdurrahmaan_As-Sudais_192kbps'] },
  'MaherAlMuaiqly128kbps': { n: 'Maher Al-Muaiqly', d: ['MaherAlMuaiqly128kbps'] },
};
// Début de chaque juz [sourate, aya]
const JUZ = [[1,1],[2,142],[2,253],[3,93],[4,24],[4,148],[5,82],[6,111],[7,88],[8,41],[9,93],[11,6],[12,53],[15,1],[17,1],[18,75],[21,1],[23,1],[25,21],[27,56],[29,46],[33,31],[36,28],[39,32],[41,47],[46,1],[51,31],[58,1],[67,1],[78,1]];
const HIZB = [[1,1],[2,75],[2,142],[2,203],[2,253],[3,15],[3,93],[3,171],[4,24],[4,88],[4,148],[5,27],[5,82],[6,36],[6,111],[7,1],[7,88],[7,171],[8,41],[9,34],[9,93],[10,26],[11,6],[11,84],[12,53],[13,19],[15,1],[16,51],[17,1],[17,99],[18,75],[20,1],[21,1],[22,1],[23,1],[24,21],[25,21],[26,111],[27,56],[28,51],[29,46],[31,22],[33,31],[34,24],[36,28],[37,145],[39,32],[40,41],[41,47],[43,24],[46,1],[48,18],[51,31],[55,1],[58,1],[62,1],[67,1],[72,1],[78,1],[87,1]];
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
const SRS_STEPS = [10 * 60e3, 864e5, 3 * 864e5, 7 * 864e5, 16 * 864e5, 35 * 864e5, 90 * 864e5, 180 * 864e5];

/* ---------- State ---------- */
const defaultState = () => ({
  selected: [],
  modes: { suivante: true, precedente: true, complete: true, mot: true, sourate: true, ordre: true, motamot: true, ecoute: true, recite: true, lettres: true, echo: true, efface: true },
  best: 0, goalDone: {},
  current: 'mix',
  settings: { theme: 'emeraude', trad: true, pieges: true, reciter: 'Alafasy_128kbps', reciteType: 'mix', autoplay: true, voice: true, goal: 20, opening: true },
  srs: {}, days: {}, surah: {}, total: { n: 0, ok: 0 },
});
let S = load();
if (!S.srsV2) { for (const k in S.srs) { const r = S.srs[k]; if (r.b > 0) r.b = Math.max(1, r.b - 1); } S.srsV2 = 1; }
if (S.ranges) { S.iv = S.iv || {}; for (const k in S.ranges) S.iv[k] = [S.ranges[k]]; delete S.ranges; }
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
  for (const a of AYAS) { const k = tkey(a); if (!SAME.has(k)) SAME.set(k, []); SAME.get(k).push(a); }
  // index inversé pour retrouver les ayat proches (mutashabihat)
  for (const a of AYAS) for (const w of new Set(a.nw)) {
    if (!w) continue;
    DF.set(w, (DF.get(w) || 0) + 1);
    if (!INV.has(w)) INV.set(w, []);
    INV.get(w).push(a.id);
  }
}
const aya = (s, a) => AYA_IDX.get(s + ':' + a);
const tkey = a => a.nw.join(' ');
let SAME = new Map();   // texte normalisé → ayat identiques (ex. فبأي آلاء ربكما تكذبان)
const sameText = a => SAME.get(tkey(a)) || [a];
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
// sélection : sourates cochées + plages d'ayat (S.iv[s] = [[de, à], …], absent = sourate entière)
function ivOf(s) { if (!S.selected.includes(s)) return []; return (S.iv && S.iv[s]) || [[1, SURAHS[s - 1].count]]; }
function setIv(s, list) {
  const n = SURAHS[s - 1].count; S.iv = S.iv || {};
  list = list.map(([f, t]) => [Math.max(1, Math.min(f, t)), Math.min(n, Math.max(f, t))]).filter(([f, t]) => f <= t).sort((x, y) => x[0] - y[0]);
  const m = []; for (const r of list) { const l = m[m.length - 1]; if (l && r[0] <= l[1] + 1) l[1] = Math.max(l[1], r[1]); else m.push(r.slice()); }
  if (!m.length) { S.selected = S.selected.filter(x => x !== s); delete S.iv[s]; return; }
  if (!S.selected.includes(s)) S.selected = [...S.selected, s].sort((a, b) => a - b);
  if (m.length === 1 && m[0][0] === 1 && m[0][1] === n) delete S.iv[s]; else S.iv[s] = m;
}
function subIv(list, f, t) { const out = []; for (const [a, b] of list) { if (b < f || a > t) out.push([a, b]); else { if (a < f) out.push([a, f - 1]); if (b > t) out.push([t + 1, b]); } } return out; }
const range = s => { const l = ivOf(s); return l.length ? [l[0][0], l[l.length - 1][1]] : [1, SURAHS[s - 1].count]; };
const inSel = a => ivOf(a.s).some(([f, t]) => a.a >= f && a.a <= t);
// juz / hizb : étendues d'ayat (index dans AYAS)
function divSpans(list) { return list.map(([s, a], i) => [aya(s, a).id, i + 1 < list.length ? aya(...list[i + 1]).id - 1 : AYAS.length - 1]); }
function spanCount(st, en) { let k = 0; for (let i = st; i <= en; i++) if (inSel(AYAS[i])) k++; return k; }
function toggleSpan(st, en, forceAdd) {
  const full = !forceAdd && spanCount(st, en) === en - st + 1;
  const per = {}; for (let i = st; i <= en; i++) { const a = AYAS[i]; const p = per[a.s] || (per[a.s] = [a.a, a.a]); p[1] = a.a; }
  for (const k in per) { const s2 = +k, [f, t] = per[k]; setIv(s2, full ? subIv(ivOf(s2), f, t) : [...ivOf(s2), [f, t]]); }
  save(); buildPool(); renderSurahs();
}
let POOL_IDS = new Set();
function buildPool() { POOL = AYAS.filter(inSel); POOL_IDS = new Set(POOL.map(a => a.id)); }
const inPool = a => !!a && POOL_IDS.has(a.id);
const rec = a => S.srs[a.s + ':' + a.a];

// ayat vues récemment : on évite de les reproposer tout de suite
const recent = [];
function rememberCard(q) {
  for (const a of [q.target, q.show, ...(q.seq || [])]) if (a) { const i = recent.indexOf(a.id); if (i >= 0) recent.splice(i, 1); recent.push(a.id); }
  const max = Math.max(3, Math.min(60, Math.floor(POOL.length * 0.7)));
  while (recent.length > max) recent.shift();
}
function pickTarget(filter, tgt = a => a) {
  let cand = POOL.filter(filter);
  if (!cand.length) return null;
  const rs = new Set(recent), near = a => { const t = tgt(a); return rs.has(a.id) || rs.has(t.id) || (next(a) && rs.has(next(a).id)) || (prev(a) && rs.has(prev(a).id)); };
  const c1 = cand.filter(a => !near(a)), c2 = cand.filter(a => !rs.has(a.id) && !rs.has(tgt(a).id));
  cand = c1.length ? c1 : c2.length ? c2 : cand;
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
const dirIdx = {};
function recDirs() { return (RECITERS[S.settings.reciter] || RECITERS.Alafasy_128kbps).d; }
function audioUrl(a, k) { return `https://everyayah.com/data/${recDirs()[k]}/${pad3(a.s)}${pad3(a.a)}.mp3`; }
function play(a, then, fromReader) {
  if (!fromReader && typeof readStop === 'function') readStop();
  player.pause();
  let k = dirIdx[S.settings.reciter] || 0;
  const tryK = () => { player.src = audioUrl(a, k); player.play().catch(() => {}); };
  player.onerror = () => { const n = recDirs().length; if (k + 1 < n) { k++; dirIdx[S.settings.reciter] = k; tryK(); } else toast('Audio indisponible pour ce récitateur'); };
  player.onended = then || null; tryK();
}
function toast(msg) { let t = $('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); } t.textContent = msg; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 2500); }
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
function distractorsFor(correct, exclude = [], ok = () => true) {
  const ex = new Set([correct.id, ...exclude.map(x => x.id)]);
  const seen = new Set([correct.nw.join(' ')]);
  const uniq = a => { const k = a.nw.join(' '); if (seen.has(k) || !ok(a)) return false; seen.add(k); return true; };
  const d = (S.settings.pieges ? similar(correct, 8, { exclude: ex }) : []).filter(uniq).slice(0, 3);
  const more = shuffle(POOL.length > 6 ? POOL : AYAS).filter(x => !ex.has(x.id)).slice(0, 30).filter(uniq);
  return fill([correct, ...d], more).slice(1, 4);
}

/* ---------- Construction des questions ---------- */
function buildQuestion(mode) {
  switch (mode) {
    case 'suivante': case 'precedente': {
      const isNext = mode === 'suivante';
      const x = pickTarget(a => isNext ? inPool(next(a)) : inPool(prev(a)), a => isNext ? next(a) : prev(a)); if (!x) return null;
      const ans = isNext ? next(x) : prev(x);
      // si l'aya affichée existe ailleurs à l'identique, ce qui la suit là-bas est aussi juste → on l'écarte des leurres
      const valid = new Set(sameText(x).map(y => isNext ? next(y) : prev(y)).filter(Boolean).map(tkey));
      const opts = shuffle([ans, ...distractorsFor(ans, [x], o => !valid.has(tkey(o)))]);
      const labels = distinctPrefixes(opts.map(o => o.tk));
      return { mode, target: ans, prompt: isNext ? 'Quelle aya vient juste après ?' : 'Quelle aya vient juste avant ?',
        show: x, opts: opts.map((o, i) => ({ html: labels[i], good: valid.has(tkey(o)), aya: o })) };
    }
    case 'complete': {
      const x = pickTarget(a => a.tk.length >= 4); if (!x) return null;
      const h = Math.min(Math.ceil(x.tk.length / 2), 12);
      const start = x.tk.slice(0, h);
      const startKey = x.nw.slice(0, h).join(' ');
      const notSameStart = b => b.nw.slice(0, h).join(' ') !== startKey;
      let others = S.settings.pieges ? similar(x, 8, { words: x.nw.slice(0, h + 2), filter: b => b.tk.length >= 4 && notSameStart(b) }) : [];
      const endKey = o => o.id === x.id ? x.nw.slice(h).join(' ') : o.nw.slice(Math.min(Math.ceil(o.tk.length / 2), 12)).join(' ');
      const seenE = new Set([endKey(x)]);
      const uniqE = o => { const k = endKey(o); if (seenE.has(k)) return false; seenE.add(k); return true; };
      others = others.filter(uniqE);
      fill(others = [x, ...others.slice(0, 3)], shuffle(POOL).filter(b => b.tk.length >= 4 && notSameStart(b)).slice(0, 30).filter(uniqE));
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
      const validS = new Set(sameText(x).map(y => y.s));
      const set = new Set([x.s]);
      const addS = v => { if (set.size < 4 && !validS.has(v)) set.add(v); };
      if (S.settings.pieges) for (const b of similar(x, 10)) addS(b.s);
      for (const v of shuffle([...new Set(POOL.map(a => a.s))])) addS(v);
      while (set.size < 4) addS(1 + rand(114));
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
        const x = pickTarget(a => inPool(next(a)), next); if (!x) return null;
        return { mode, recit: true, sub: 'suite', target: next(x), show: x, prompt: 'Récite l’aya suivante', expected: next(x).tk };
      }
      const x = pickTarget(a => a.tk.length >= 4); if (!x) return null;
      const h = Math.min(Math.ceil(x.tk.length / 2), 12);
      return { mode, recit: true, sub: 'fin', target: x, prompt: 'Termine l’aya', showHtml: arBlock(x.tk.slice(0, h).join(' ') + ' …'), expected: x.tk.slice(h), startLen: h };
    }
    case 'motamot': {
      const x = pickTarget(a => a.tk.length >= 3); if (!x) return null;
      let st = 0, en = x.tk.length;
      if (en > 10) { st = rand(en - 8 + 1); en = st + 8; }          // longue aya : un passage de 8 mots
      const words = x.tk.slice(st, en);
      return { mode, target: x, prompt: 'Reconstitue l’aya mot à mot', words, tiles: shuffle(words.map((w, i) => ({ w, i }))),
        before: x.tk.slice(0, st).join(' '), after: en < x.tk.length };
    }
    case 'lettres': {
      const x = pickTarget(a => a.tk.length >= 2); if (!x) return null;
      const fl = x.nw.map(w => w ? w[0] : '').filter(Boolean);
      return { mode, recit: true, target: x, prompt: 'Récite l’aya avec seulement les premières lettres',
        showHtml: `<div class="fls">${fl.map(l => `<span>${l}</span>`).join('')}</div>${frBlock(x)}<div class="ref">${esc(surahName(x.s))} · ${x.s}:${x.a}</div>`, expected: x.tk };
    }
    case 'echo': {
      const x = pickTarget(() => true); if (!x) return null;
      return { mode, recit: true, target: x, forcePlay: true, prompt: 'Écoute bien, puis répète l’aya sans la voir',
        showHtml: `<div style="text-align:center;margin:10px 0"><button class="btn gold" data-listen>👂 Réécouter</button></div>${frBlock(x)}<div class="ref">${esc(surahName(x.s))} · ${x.s}:${x.a}</div>`, expected: x.tk };
    }
    case 'efface': {
      const x = pickTarget(a => a.tk.length >= 3); if (!x) return null;
      return { mode, target: x, efface: true, prompt: 'Lis et récite. À chaque niveau, le texte s’efface un peu plus !', hideOrder: shuffle(x.tk.map((_, i) => i)) };
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
  const g = S.settings.goal || 20, d = S.days[today()] || 0, el = $('#goal');
  if (el) { el.querySelector('span').textContent = d >= g ? `🎉 Objectif du jour atteint : ${d}/${g}` : `Objectif du jour : ${d}/${g}`; el.querySelector('b').style.width = Math.min(100, 100 * d / g) + '%'; el.classList.toggle('done', d >= g); }
  if (d >= g && !(S.goalDone || {})[today()]) { S.goalDone = S.goalDone || {}; S.goalDone[today()] = 1; save(); toast('🎉 Objectif du jour atteint, barakAllahu fik !'); }
}
function enabledModes() { return Object.keys(MODES).filter(m => S.modes[m]); }

function renderModeBar() {
  const list = [['mix', `🔀 Mix (${enabledModes().length})`], ['defi', '⏱️ Défi 60 s'], ...enabledModes().map(m => [m, MODES[m].icon + ' ' + MODES[m].label])];
  if (S.current !== 'mix' && S.current !== 'defi' && !S.modes[S.current]) S.current = 'mix';
  $('#modeBar').innerHTML = `<button class="chip pick" data-pick>🎯 Exercices</button>` + list.map(([k, l]) => `<button class="chip ${S.current === k ? 'on' : ''}" data-mode="${k}">${l}</button>`).join('');
  updateSession();
}
/* Choix des exercices */
function openPicker() {
  const sh = document.createElement('div'); sh.className = 'sheet-bg';
  sh.innerHTML = `<div class="sheet"><h2>Sur quoi tu veux travailler ?</h2><p class="muted">Coche un ou plusieurs exercices : le mode 🔀 Mix les mélange.</p>
    ${Object.entries(GROUPS).map(([g, gl]) => `<h3>${gl}</h3>${Object.entries(MODES).filter(([, m]) => m.g === g).map(([k, m]) => `
      <label class="pk"><input type="checkbox" data-pk="${k}" ${S.modes[k] ? 'checked' : ''}><span class="pi">${m.icon}</span><span><b>${m.label}</b><small>${m.d}</small></span></label>`).join('')}`).join('')}
    <div class="btnrow"><button class="btn light" data-pkall>Tout cocher</button><button class="btn gold" data-pkok>C’est parti</button></div></div>`;
  document.body.appendChild(sh);
  sh.addEventListener('click', e => {
    if (e.target === sh || e.target.closest('[data-pkok]')) {
      const sel = $$('[data-pk]', sh).filter(i => i.checked).map(i => i.dataset.pk);
      if (!sel.length) return toast('Choisis au moins un exercice');
      Object.keys(MODES).forEach(k => S.modes[k] = sel.includes(k));
      S.current = sel.length === 1 ? sel[0] : 'mix'; save(); sh.remove(); renderModeBar(); newCard(); return;
    }
    if (e.target.closest('[data-pkall]')) $$('[data-pk]', sh).forEach(i => i.checked = true);
  });
}
/* Défi chrono */
let chall = null;
function startChallenge() {
  if (chall) clearInterval(chall.timer);
  chall = { end: Date.now() + 60000, ok: 0, n: 0 };
  chall.timer = setInterval(tickChallenge, 250); tickChallenge(); newCard();
}
function tickChallenge() {
  if (!chall) return;
  const left = Math.max(0, Math.ceil((chall.end - Date.now()) / 1000));
  $('#deckHint').innerHTML = `<span class="chrono">⏱️ ${left} s · ✅ ${chall.ok}</span>`;
  if (left <= 0) endChallenge();
}
function endChallenge() {
  clearInterval(chall.timer); const r = chall; chall = null;
  const rec = r.ok > (S.best || 0); if (rec) { S.best = r.ok; save(); }
  $('#deck').innerHTML = `<div class="card"><div class="body endc"><div class="big">⏱️</div><h2>Défi terminé !</h2>
    <div class="score">${r.ok}<small> bonne${r.ok > 1 ? 's' : ''} réponse${r.ok > 1 ? 's' : ''} sur ${r.n}</small></div>
    <p>${rec ? '🏆 Nouveau record !' : `Record : ${S.best}`}</p>
    <div class="btnrow"><button class="btn gold" data-mode="defi">Rejouer</button><button class="btn light" data-mode="mix">Retour au Mix</button></div></div></div>`;
  $('#deckHint').textContent = '';
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
    let modes = S.current === 'mix' ? enabledModes() : [S.current];
    if (chall) { modes = QUICK.filter(m => S.modes[m]); if (!modes.length) modes = QUICK; }
    q = buildQuestion(pick(modes.length ? modes : ['suivante']));
  }
  if (!q) { deck.innerHTML = `<div class="empty">Pas assez d’ayat pour ce mode.<br>Ajoute des sourates ou change de mode.</div>`; return; }
  const back = document.createElement('div'); back.className = 'card back'; deck.appendChild(back);
  const card = document.createElement('div'); card.className = 'card'; deck.appendChild(card);
  currentCard = { q, el: card, answered: false, g: null };
  rememberCard(q);
  renderCard(currentCard);
  attachOrderDrag(currentCard);
  attachSwipe(currentCard);
}

function renderCard(c) {
  const { q, el } = c, m = MODES[q.mode];
  let body = `<div class="q">${q.prompt}</div>`;
  if (q.show) body += arBlock(q.show.ar) + frBlock(q.show) + refLine(q.show);
  if (q.showHtml) body += q.showHtml;
  if (q.opts) body += `<div class="opts">${q.opts.map((o, i) => `<button class="opt ${o.fr ? 'fr-opt' : ''}" data-opt="${i}">${o.html}</button>`).join('')}</div>`;
  if (q.items) body += `<div class="opts ord" data-ord>${q.items.map((it, i) => `<div class="opt ord-item" data-idx="${i}"><span class="grip" aria-hidden="true">⠿</span><span class="ot">${it.html}</span></div>`).join('')}</div>
    <div class="btnrow" data-ordrow><button class="btn gold" data-ordcheck>✔ Valider l’ordre</button></div>`;
  if (q.tiles) body += `${frBlock(q.target)}<div class="ref">${esc(surahName(q.target.s))} · ${q.target.s}:${q.target.a}</div>
    <div class="ar mmline">${q.before ? q.before + ' ' : ''}<span data-mmans></span><span class="mmcur">▁▁</span>${q.after ? ' …' : ''}</div>
    <div class="tiles">${q.tiles.map((t, i) => `<button class="tile" data-tile="${i}">${t.w}</button>`).join('')}</div>`;
  if (q.efface) body += `<div class="lvl" data-lvl></div><div data-eff></div>${frBlock(q.target)}${refLine(q.target)}
    <div class="btnrow" data-effbtn><button class="btn ko" data-effko>✘ J’ai bloqué</button><button class="btn ok" data-effok>✔ Je l’ai dit</button></div>`;
  if (q.recit) {
    body += `<div class="btnrow">${SR && S.settings.voice ? `<button class="btn gold" data-mic>🎙️ Réciter</button>` : ''}<button class="btn light" data-reveal>👁️ Révéler</button></div><div class="transcript" data-tr></div>`;
  }
  body += `<div data-after></div>`;
  el.innerHTML = `<div class="stamp r">SU ✓</div><div class="stamp l">À REVOIR</div>
    <div class="head"><span class="tag">${m.icon} ${m.label}</span><span>${esc(surahName(q.target.s))}${q.hideRef ? '' : ''}</span></div>
    <div class="body">${body}</div>`;
  if (q.mode === 'sourate') $('.head span:last-child', el).textContent = 'Sourate ?';
  setHint(c);
  if ((q.audio && S.settings.autoplay) || q.forcePlay) play(q.target);
  if (q.efface) { c.level = 0; renderEff(c); }
}
/* Effacement progressif : 0 texte complet → 1 un tiers caché → 2 deux tiers → 3 premières lettres → 4 rien */
function renderEff(c) {
  const q = c.q, L = c.level, tk = q.target.tk, n = tk.length;
  const hideN = L === 1 ? Math.ceil(n / 3) : L === 2 ? Math.ceil(2 * n / 3) : n;
  const hidden = new Set(q.hideOrder.slice(0, hideN));
  const html = tk.map((w, i) => {
    if (L === 0 || !hidden.has(i)) return w;
    if (L === 3) return `<span class="hid">${q.target.nw[i][0] || ''}…</span>`;
    return `<span class="hid">${'ـ'.repeat(Math.max(2, Math.min(7, q.target.nw[i].length)))}</span>`;
  }).join(' ');
  $('[data-eff]', c.el).innerHTML = `<div class="ar ${arSize(q.target.ar)}">${html}</div>`;
  const names = ['Lis', '⅓ caché', '⅔ caché', 'Initiales', 'De mémoire'];
  $('[data-lvl]', c.el).innerHTML = names.map((nm, i) => `<span class="${i < L ? 'done' : i === L ? 'cur' : ''}">${i < L ? '★' : '☆'}<small>${nm}</small></span>`).join('');
}

function setHint(c) {
  const h = $('#deckHint');
  if (chall) return tickChallenge();
  if (!c.answered) h.textContent = c.q.recit ? 'Récite à voix haute, puis révèle' : c.q.mode === 'ordre' ? 'Fais glisser les ayat dans le bon ordre, puis valide' : c.q.tiles ? 'Touche les mots dans l’ordre' : c.q.efface ? 'Récite, puis passe au niveau suivant' : 'Choisis la bonne réponse';
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
  if (chall) { chall.n++; if (g === 'ok') chall.ok++; tickChallenge(); setTimeout(() => { if (chall && currentCard === c) swipeOut(c, g === 'ok' ? 1 : -1); }, g === 'ok' ? 450 : 1100); return; }
  if (S.settings.autoplay && !c.q.audio && (g !== 'ok' || c.q.seq)) { if (c.q.seq) playSeq(c.q.seq); else play(t); }
}
function revealBlock(t, q) {
  let s = `<div class="reveal">`;
  if (q && q.mode === 'ordre') s += q.seq.map(a => arBlock(a.ar, 'small') + frBlock(a)).join('') + `<div class="ref">${esc(surahName(q.seq[0].s))} · ${q.seq[0].s}:${q.seq[0].a}–${q.seq[3].a} <button class="play" data-playseq="${q.seq[0].s}:${q.seq[0].a}:${q.seq.length}">🔊</button></div>`;
  else s += arBlock(t.ar, 'small') + frBlock(t) + refLine(t);
  return s + `</div>`;
}

/* Interactions dans la carte */
document.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.goto) return showView(b.dataset.goto);
  if (b.dataset.playseq) { const [s, a, n] = b.dataset.playseq.split(':').map(Number); return playSeq(Array.from({ length: n }, (_, k) => aya(s, a + k))); }
  if (b.dataset.play) { const [s, a] = b.dataset.play.split(':').map(Number); return play(aya(s, a)); }
  if (b.hasAttribute('data-pick')) return openPicker();
  if (b.dataset.mode) { const m = b.dataset.mode; if (chall && m !== 'defi') { clearInterval(chall.timer); chall = null; } S.current = m; save(); renderModeBar(); return m === 'defi' ? startChallenge() : newCard(); }
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
  if (b.hasAttribute('data-ordcheck')) return checkOrder(c);
  if (b.dataset.tile !== undefined && !c.answered) {
    const t = q.tiles[+b.dataset.tile]; c.step = c.step || 0; c.err = c.err || 0;
    if (norm(t.w) === norm(q.words[c.step])) {
      b.disabled = true; b.classList.add('used');
      $('[data-mmans]', c.el).insertAdjacentHTML('beforeend', (c.step ? ' ' : '') + q.words[c.step]);
      if (++c.step === q.words.length) { $('.mmcur', c.el).remove(); finish(c, c.err === 0 ? 'ok' : c.err <= 2 ? 'mid' : 'ko'); }
    } else { c.err++; b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 400); }
    return;
  }
  if (b.hasAttribute('data-effok') && !c.answered) {
    if (c.level < 4) { c.level++; renderEff(c); } else { c.level = 5; $('[data-effbtn]', c.el).remove(); finish(c, 'ok'); }
    return;
  }
  if (b.hasAttribute('data-effko') && !c.answered) { const L = c.level; c.level = 0; renderEff(c); $('[data-effbtn]', c.el).remove(); finish(c, L >= 3 ? 'mid' : 'ko'); return; }
  if (b.hasAttribute('data-mic')) return toggleMic(c, b);
  if (b.hasAttribute('data-reveal')) return revealRecite(c);
  if (b.dataset.self) { finishSelf(c, b.dataset.self); return swipeOut(c, b.dataset.self === 'ko' ? -1 : 1); }
  if (b.hasAttribute('data-nextcard')) return swipeOut(c, 1);
});

/* Remettre en ordre : glisser-déposer */
function attachOrderDrag(c) {
  const box = $('[data-ord]', c.el); if (!box) return;
  const GAP = 8; let drag = null;
  box.addEventListener('pointerdown', e => {
    if (c.answered) return;
    const it = e.target.closest('.ord-item'); if (!it) return;
    e.preventDefault(); e.stopPropagation();
    try { it.setPointerCapture(e.pointerId); } catch (_) {}
    drag = { it, y0: e.clientY }; it.classList.add('dragging');
  });
  box.addEventListener('pointermove', e => {
    if (!drag) return; e.preventDefault();
    const it = drag.it; let dy = e.clientY - drag.y0;
    const nx = it.nextElementSibling, pv = it.previousElementSibling;
    // on déplace les voisins (jamais l'élément tenu, pour garder la capture du doigt)
    if (nx && dy > nx.offsetHeight / 2) { box.insertBefore(nx, it); drag.y0 += nx.offsetHeight + GAP; }
    else if (pv && dy < -pv.offsetHeight / 2) { box.insertBefore(pv, it.nextElementSibling); drag.y0 -= pv.offsetHeight + GAP; }
    dy = e.clientY - drag.y0;
    it.style.transform = `translateY(${dy}px)`;
  });
  const end = () => { if (!drag) return; drag.it.style.transform = ''; drag.it.classList.remove('dragging'); drag = null; };
  box.addEventListener('pointerup', end); box.addEventListener('pointercancel', end);
}
function checkOrder(c) {
  if (c.answered) return;
  const q = c.q, els = $$('[data-ord] .ord-item', c.el);
  const key = a => a.nw.join(' ');   // deux ayat identiques sont interchangeables
  let wrong = 0;
  els.forEach((el, p) => {
    const it = q.items[+el.dataset.idx], ok = key(it.a) === key(q.seq[p]);
    if (!ok) wrong++;
    el.classList.add(ok ? 'good' : 'bad');
    el.querySelector('.grip').outerHTML = `<span class="num">${ok ? p + 1 : q.seq.findIndex(a => key(a) === key(it.a)) + 1}</span>`;
  });
  $('[data-ordrow]', c.el).remove();
  finish(c, wrong === 0 ? 'ok' : wrong <= 2 ? 'mid' : 'ko');
}

/* Récitation */
let recog = null;
function toggleMic(c, btn) {
  if (recog) { recog.stop(); return; }
  if (!SR) return;
  recog = new SR(); recog.lang = 'ar-SA'; recog.interimResults = true; recog.maxAlternatives = 1;
  // Chrome Android renvoie des résultats cumulés en mode continu → doublons
  recog.continuous = !/Android/i.test(navigator.userAgent);
  const trEl = $('[data-tr]', c.el); let text = '';
  btn.classList.add('rec'); btn.textContent = '⏹️ Stop';
  player.pause();
  recog.onresult = ev => { text = cleanTranscript([...ev.results].map(r => r[0].transcript)); trEl.textContent = text; };
  recog.onerror = ev => { trEl.textContent = ev.error === 'not-allowed' ? 'Micro refusé — utilise « Révéler ».' : 'Erreur micro : ' + ev.error; };
  recog.onend = () => { recog = null; btn.classList.remove('rec'); btn.textContent = '🎙️ Réessayer'; if (text.trim()) scoreRecite(c, text); };
  try { recog.start(); } catch (e) { recog = null; }
}
function cleanTranscript(segs) {
  const parts = [];
  for (let t of segs) {
    t = t.trim(); if (!t) continue;
    const last = parts[parts.length - 1];
    if (last && t.startsWith(last)) parts[parts.length - 1] = t;      // résultat cumulé
    else if (last && last.startsWith(t)) continue;
    else if (!parts.some(p => p.includes(t))) parts.push(t);
  }
  const w = parts.join(' ').split(/\s+/).filter(Boolean);
  return w.filter((x, i) => i === 0 || norm(x) !== norm(w[i - 1])).join(' ');   // mots répétés à la suite
}
function scoreRecite(c, text) {
  const exp = c.q.expected, got = text.split(/\s+/).filter(Boolean);
  const hit = lcsMatch(exp, got);
  const denom = Math.min(exp.length, Math.max(6, Math.ceil(got.length * 1.15)));
  const nHit = hit.slice(0, denom).filter(Boolean).length;
  const recall = Math.min(1, nHit / denom), precision = got.length ? Math.min(1, nHit / got.length) : 0;
  // les mots en trop font baisser le score (moyenne harmonique)
  const ratio = recall && precision ? 2 * recall * precision / (recall + precision) : 0;
  const g = ratio >= .8 ? 'ok' : ratio >= .5 ? 'mid' : 'ko';
  const shown = exp.map((w, i) => `<span class="${i < denom ? (hit[i] ? 'w-ok' : 'w-ko') : ''}">${w}</span>`).join(' ');
  const pre = c.q.sub === 'fin' ? c.q.target.tk.slice(0, c.q.startLen).join(' ') + ' ' : '';
  const t = c.q.target;
  c.answered = true; c.selfEval = true; c.suggested = g;
  $('[data-after]', c.el).innerHTML = `<div class="result ${g}">${{ ok: '✅', mid: '🟠', ko: '❌' }[g]} ${Math.round(ratio * 100)} % de correspondance</div>
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
  let m = 0, n = 0;
  for (const [f, t] of ivOf(s)) for (let a = f; a <= t; a++) { n++; const r = S.srs[s + ':' + a]; if (r && r.b >= 4) m++; }
  return n ? m / n : 0;
}
let selTab = 's';
function renderSurahs() {
  $$('.seg button').forEach(b => b.classList.toggle('on', b.dataset.tab === selTab));
  $('.toolbar').style.display = selTab === 's' ? '' : 'none';
  const nA = POOL.length;
  $('#selCount').textContent = `${S.selected.length} sourate${S.selected.length > 1 ? 's' : ''} · ${nA} ayat en révision`;
  if (selTab !== 's') return renderDivs();
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
  $$('#surahList input[data-s]').forEach(i => { const s2 = +i.dataset.s, l = ivOf(s2); i.indeterminate = l.length && (l.length > 1 || l[0][0] !== 1 || l[0][1] !== SURAHS[s2 - 1].count); });
}
function renderDivs() {
  const isJ = selTab === 'j', list = isJ ? JUZ : HIZB, spans = divSpans(list);
  const tiles = spans.map(([st, en], i) => {
    const k = spanCount(st, en), tot = en - st + 1, cls = k === tot ? 'full' : k ? 'part' : '';
    const a = AYAS[st];
    return `<button class="dv ${cls}" data-span="${st}-${en}"><b>${isJ ? 'Juz' : 'Hizb'} ${i + 1}</b><small>${esc(surahName(a.s))} ${a.a}</small>${k && k < tot ? `<i>${Math.round(100 * k / tot)} %</i>` : ''}</button>`;
  });
  if (isJ) $('#surahList').innerHTML = `<div class="dgrid">${tiles.join('')}</div>`;
  else { let h = ''; for (let j = 0; j < 30; j++) h += `<div class="juz"><h3>Juz ${j + 1}</h3><div class="dgrid two">${tiles[2 * j]}${tiles[2 * j + 1]}</div></div>`; $('#surahList').innerHTML = h; }
}
function rangeRow(s) {
  const [f, t] = range(s.i), l = ivOf(s.i), nSel = l.reduce((x, [a, b]) => x + b - a + 1, 0), all = nSel === s.count;
  return `<div class="range"><span>Ayat</span><input type="number" inputmode="numeric" min="1" max="${s.count}" value="${f}" data-rf="${s.i}" aria-label="Première aya">
    <span>à</span><input type="number" inputmode="numeric" min="1" max="${s.count}" value="${t}" data-rt="${s.i}" aria-label="Dernière aya">
    <span class="rn">${l.length > 1 ? l.map(([a, b]) => a === b ? a : a + '–' + b).join(', ') + ' · ' : ''}${nSel}/${s.count}</span>${all ? '' : `<button data-rall="${s.i}">Toutes</button>`}</div>`;
}
function setRange(s, f, t) {
  const n = SURAHS[s - 1].count; setIv(s, [[Math.max(1, Math.min(+f || 1, n)), Math.max(1, Math.min(+t || n, n))]]);
  save(); buildPool(); renderSurahs();
}
function setSelected(list) {
  S.selected = [...new Set(list)].sort((a, b) => a - b);
  if (S.iv) for (const k in S.iv) if (!S.selected.includes(+k)) delete S.iv[k];
  save(); buildPool(); renderSurahs();
}
$('#surahList').addEventListener('change', e => {
  const d = e.target.dataset;
  if (d.rf || d.rt) { const s = +(d.rf || d.rt), [f, t] = range(s); return setRange(s, d.rf ? e.target.value : f, d.rt ? e.target.value : t); }
  const s = +d.s; if (!s) return;
  setSelected(e.target.checked ? [...S.selected, s] : S.selected.filter(x => x !== s));
});
$$('.seg button').forEach(b => b.addEventListener('click', () => { selTab = b.dataset.tab; renderSurahs(); }));
$('#surahList').addEventListener('click', e => {
  const dv = e.target.closest('[data-span]'); if (dv) { const [st, en] = dv.dataset.span.split('-').map(Number); return toggleSpan(st, en); }
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
  const [st, en] = divSpans(JUZ)[k === 'amma' ? 29 : 28];
  toggleSpan(st, en, true);
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
    let n = 0, m = 0, l = 0, w = 0;
    for (const [f, t] of ivOf(s)) for (let a = f; a <= t; a++) { n++; const r = S.srs[s + ':' + a]; if (!r) continue; if (r.b >= 4) m++; else if (r.b >= 2) l++; else w++; }
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
const openSec = new Set();
function renderSettings() {
  const st = S.settings;
  const sec = (id, icon, title, sub, body) => `<details class="sec" data-sec="${id}" ${openSec.has(id) ? 'open' : ''}><summary><span class="si">${icon}</span><span class="st">${title}<small>${sub}</small></span><span class="chev">›</span></summary><div class="sec-b">${body}</div></details>`;
  const chk = (key, label, sub, extra = '') => `<label><span>${label}${sub ? `<small>${sub}</small>` : ''}</span><input type="checkbox" data-set="${key}" ${st[key] ? 'checked' : ''} ${extra}></label>`;
  const nMod = enabledModes().length, total = Object.keys(MODES).length;
  $('#settingsBox').innerHTML = `<div class="secs">
  ${sec('look', '🎨', 'Apparence', (THEMES[st.theme] || THEMES.emeraude).name,
    `<div class="themes">${Object.entries(THEMES).map(([k, t]) => `<button class="theme ${st.theme === k ? 'on' : ''}" data-theme-pick="${k}"><span class="sw">${t.sw.map(c => `<i style="background:${c}"></i>`).join('')}</span>${t.name}</button>`).join('')}</div>
     <div class="set">${chk('trad', 'Traduction française', 'Hamidullah')}</div>`)}
  ${sec('goal', '🎯', 'Objectif & accueil', `${st.goal} cartes par jour`,
    `<div class="set"><label>Objectif du jour<select data-sel="goal">${[10, 20, 30, 50, 100].map(v => `<option value="${v}" ${+st.goal === v ? 'selected' : ''}>${v} cartes</option>`).join('')}</select></label>
     ${chk('opening', 'Écran d’ouverture', 'Petite duaa + hadith du jour')}</div>`)}
  ${sec('ex', '🃏', 'Exercices', `${nMod} sur ${total} actifs`,
    Object.entries(GROUPS).map(([g, gl]) => `<h4>${gl}</h4><div class="set">${Object.entries(MODES).filter(([, m]) => m.g === g).map(([k, m]) => `<label><span>${m.icon} ${m.label}<small>${m.d}</small></span><input type="checkbox" data-mode-t="${k}" ${S.modes[k] ? 'checked' : ''}></label>`).join('')}</div>`).join(''))}
  ${sec('game', '🎮', 'Options de jeu', st.pieges ? 'Pièges activés' : 'Pièges désactivés',
    `<div class="set">${chk('pieges', 'Pièges (ayat qui se ressemblent)', 'Les mauvaises réponses sont des mutashabihat')}
     ${chk('voice', 'Reconnaissance vocale', SR ? 'Disponible sur cet appareil' : 'Non disponible ici → auto-évaluation', SR ? '' : 'disabled')}
     <label>Récitation<select data-sel="reciteType">${[['mix', 'Suite ou fin (mix)'], ['suite', 'Aya suivante'], ['fin', 'Fin de l’aya']].map(([v, l]) => `<option value="${v}" ${st.reciteType === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label></div>`)}
  ${sec('audio', '🔊', 'Audio', (RECITERS[st.reciter] || RECITERS.Alafasy_128kbps).n,
    `<div class="set"><label>Récitateur<select data-sel="reciter">${Object.entries(RECITERS).map(([v, r]) => `<option value="${v}" ${st.reciter === v ? 'selected' : ''}>${r.n}</option>`).join('')}</select></label>
     ${chk('autoplay', 'Lecture audio automatique', 'Mode écoute + correction')}</div>`)}
  ${sec('save', '💾', 'Sauvegarde', 'Exporter / importer ta progression',
    `<div class="set" style="padding:12px"><p class="muted" style="margin:0 0 10px">Garde une copie de ta progression ou transfère-la sur un autre téléphone.</p>
     <div class="btnrow" style="margin:0"><button class="btn gold" data-export>⬇️ Exporter</button><button class="btn light" data-import>⬆️ Importer</button></div>
     <input type="file" accept=".json,application/json" data-importfile hidden></div>`)}
  ${sec('data', '🗑️', 'Données', 'Réinitialiser le suivi',
    `<button class="danger" data-reset>Réinitialiser le suivi (garder les sourates)</button>`)}
  </div>
  <div class="foot">Texte arabe uthmani (Hafs, Complexe du Roi Fahd) · traduction Muhammad Hamidullah (comme quran.com/fr) · audio everyayah.com<br>Version ${VERSION}</div>`;
  $$('#settingsBox details').forEach(d => d.addEventListener('toggle', () => { d.open ? openSec.add(d.dataset.sec) : openSec.delete(d.dataset.sec); }));
}
$('#settingsBox').addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.modeT) { S.modes[t.dataset.modeT] = t.checked; if (!enabledModes().length) { S.modes[t.dataset.modeT] = true; t.checked = true; } }
  if (t.dataset.set) S.settings[t.dataset.set] = t.checked;
  if (t.dataset.sel) { S.settings[t.dataset.sel] = t.dataset.sel === 'goal' ? +t.value : t.value; if (t.dataset.sel === 'reciter') play(aya(1, 1)); }
  if (t.hasAttribute('data-importfile') && t.files[0]) return importData(t.files[0]);
  save(); renderModeBar(); renderSettings();
});
$('#settingsBox').addEventListener('click', e => {
  if (e.target.closest('[data-export]')) return exportData();
  if (e.target.closest('[data-import]')) return $('[data-importfile]').click();
  const tp = e.target.closest('[data-theme-pick]');
  if (tp) { S.settings.theme = tp.dataset.themePick; save(); applyTheme(); renderSettings(); return; }
  if (!e.target.hasAttribute('data-reset')) return;
  if (!confirm('Effacer tout le suivi de révision ?')) return;
  Object.assign(S, { srs: {}, days: {}, surah: {}, total: { n: 0, ok: 0 } }); save(); renderSettings();
});


/* ---------- Lecture ---------- */
const BASMALA = 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ';
const arNum = n => n.toLocaleString('ar-EG');
let readS = 1, readCur = 0, readOn = false, readRep = false, readMask = false;
function renderRead() {
  readS = S.settings.readS || 1;
  const sel = $('#readSel');
  if (!sel.options.length) sel.innerHTML = SURAHS.map(x => `<option value="${x.i}">${x.i}. ${esc(x.tr)} — ${x.ar}</option>`).join('');
  sel.value = readS;
  const su = SURAHS[readS - 1];
  let h = `<div class="rhead"><div class="ar">${su.ar}</div><div>${esc(su.tr)} · ${esc(su.fr)}</div><small>${su.count} ayat · ${su.type === 'm' ? 'mecquoise' : 'médinoise'}</small></div>`;
  if (readS !== 1 && readS !== 9) h += `<div class="ar basm">${BASMALA}</div>`;
  for (let a = 1; a <= su.count; a++) {
    const x = aya(readS, a);
    h += `<div class="ra" data-ra="${a}"><div class="ar">${x.ar} <span class="anum">﴿${arNum(a)}﴾</span></div>${S.settings.trad ? `<div class="fr">${a}. ${esc(x.fr)}</div>` : ''}</div>`;
  }
  $('#readBox').innerHTML = h;
  $('#readBox').classList.toggle('masked', readMask);
  markRead();
}
function markRead() {
  $$('#readBox .ra').forEach(el => el.classList.toggle('cur', readOn && +el.dataset.ra === readCur));
  $('#rPlay').textContent = readOn ? '⏸ Pause' : '▶︎ Écouter';
  $('#rRep').setAttribute('aria-pressed', readRep); $('#rRep').classList.toggle('gold', readRep);
  $('#rMask').setAttribute('aria-pressed', readMask); $('#rMask').classList.toggle('gold', readMask);
}
function readPlay(a) {
  const n = SURAHS[readS - 1].count;
  if (a > n) { readOn = false; markRead(); return; }
  readCur = a; readOn = true; markRead();
  const el = $(`#readBox .ra[data-ra="${a}"]`); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  play(aya(readS, a), () => readPlay(readRep ? a : a + 1), true);
}
function readStop() { if (!readOn) return; readOn = false; player.pause(); markRead(); }
$('#readSel').addEventListener('change', e => { readStop(); S.settings.readS = +e.target.value; save(); renderRead(); $('#view-read').scrollTop = 0; });
$$('[data-rnav]').forEach(b => b.addEventListener('click', () => { const v = Math.min(114, Math.max(1, (S.settings.readS || 1) + +b.dataset.rnav)); readStop(); S.settings.readS = v; save(); renderRead(); $('#view-read').scrollTop = 0; }));
$('#rPlay').addEventListener('click', () => { if (readOn) readStop(); else readPlay(readCur || 1); });
$('#rRep').addEventListener('click', () => { readRep = !readRep; markRead(); });
$('#rMask').addEventListener('click', () => { readMask = !readMask; $('#readBox').classList.toggle('masked', readMask); $$('#readBox .ra.shown').forEach(x => x.classList.remove('shown')); markRead(); });
$('#readBox').addEventListener('click', e => {
  const el = e.target.closest('.ra'); if (!el) return;
  if (readMask && !el.classList.contains('shown')) { el.classList.add('shown'); return; }
  readPlay(+el.dataset.ra);
});

/* ---------- Sauvegarde ---------- */
function exportData() {
  const blob = new Blob([JSON.stringify({ app: 'muraja-a', v: VERSION, date: new Date().toISOString(), data: S })], { type: 'application/json' });
  const name = `murajaa-sauvegarde-${today()}.json`, file = new File([blob], name, { type: 'application/json' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) { navigator.share({ files: [file], title: 'Sauvegarde Muraja\'a' }).catch(() => {}); return; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
function importData(f) {
  const r = new FileReader();
  r.onload = () => {
    try {
      const j = JSON.parse(r.result); if (j.app !== 'muraja-a' || !j.data) throw 0;
      if (!confirm('Remplacer ta progression actuelle par cette sauvegarde ?')) return;
      const def = defaultState(); S = { ...def, ...j.data, modes: { ...def.modes, ...j.data.modes }, settings: { ...def.settings, ...j.data.settings } };
      save(); applyTheme(); buildPool(); renderSettings(); renderModeBar(); toast('✅ Sauvegarde importée');
    } catch (e) { toast('Fichier de sauvegarde invalide'); }
  };
  r.readAsText(f);
}

/* ---------- Écran d'ouverture : duaa + hadith du jour ---------- */
const DUAS = [[20, 25, 28], [3, 8, 8], [2, 201, 201], [14, 40, 41], [7, 23, 23], [23, 118, 118], [2, 286, 286], [25, 74, 74]];
let HADITHS = [];
const dayNum = () => { const d = new Date(); return Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5) + d.getFullYear() * 366; };
async function showOpening() {
  if (!S.settings.opening || sessionStorage.getItem('opened')) return;
  sessionStorage.setItem('opened', '1');
  try { if (!HADITHS.length) HADITHS = await (await fetch('data/hadiths.json')).json(); } catch (e) {}
  const dn = dayNum(), [ds, da, db] = DUAS[dn % DUAS.length], ay = [];
  for (let a = da; a <= db; a++) ay.push(aya(ds, a));
  const h = HADITHS.length ? HADITHS[dn % HADITHS.length] : null;
  const ov = document.createElement('div'); ov.className = 'opening';
  ov.innerHTML = `<div class="op-in">
    <img src="icons/logo-mark.svg" alt="" width="54" height="61">
    <div class="op-basm">${BASMALA}</div>
    <section><h3>Duaa du jour</h3><div class="ar">${ay.map(x => x.ar + ` <span class="anum">﴿${arNum(x.a)}﴾</span>`).join(' ')}</div>
      <p class="fr">${ay.map(x => esc(x.fr)).join(' ')}</p><small>${esc(surahName(ds))} · ${ds}:${da}${db > da ? '–' + db : ''}</small></section>
    ${h ? `<section><h3>Hadith du jour</h3><p class="hd">${esc(h.t)}</p><small>${h.src}, n° ${h.n}${h.g ? ' · ' + h.g : ''}${h.tr ? ' · traduction de l’appli' : ''}</small></section>` : ''}
    <button class="btn gold" data-opgo>Bismillah, on commence</button></div>`;
  document.body.appendChild(ov);
  ov.querySelector('[data-opgo]').addEventListener('click', () => { ov.classList.add('out'); setTimeout(() => ov.remove(), 300); });
}

/* ---------- Navigation ---------- */
function showView(v) {
  $$('.view').forEach(x => x.classList.toggle('active', x.id === 'view-' + v));
  $$('.tabs button').forEach(b => b.classList.toggle('on', b.dataset.view === v));
  if (v === 'surahs') renderSurahs();
  if (v === 'stats') renderStats();
  if (v === 'settings') renderSettings();
  if (v === 'read') renderRead();
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
  showOpening();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
