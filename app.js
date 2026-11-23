/* Muraja'a — cartes de révision (QCM, récitation, audio, suivi) */
'use strict';

const VERSION = '1.9.1';
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
const ICONS = {"cards": "<path d=\"M3.604 7.197l7.138 -3.109a.96 .96 0 0 1 1.27 .527l4.924 11.902a1 1 0 0 1 -.514 1.304l-7.137 3.109a.96 .96 0 0 1 -1.271 -.527l-4.924 -11.903a1 1 0 0 1 .514 -1.304l0 .001\" /> <path d=\"M15 4h1a1 1 0 0 1 1 1v3.5\" /> <path d=\"M20 6c.264 .112 .52 .217 .768 .315a1 1 0 0 1 .53 1.311l-2.298 5.374\" />", "book-2": "<path d=\"M19 4v16h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12\" /> <path d=\"M19 16h-12a2 2 0 0 0 -2 2\" /> <path d=\"M9 8h6\" />", "list-check": "<path d=\"M3.5 5.5l1.5 1.5l2.5 -2.5\" /> <path d=\"M3.5 11.5l1.5 1.5l2.5 -2.5\" /> <path d=\"M3.5 17.5l1.5 1.5l2.5 -2.5\" /> <path d=\"M11 6l9 0\" /> <path d=\"M11 12l9 0\" /> <path d=\"M11 18l9 0\" />", "chart-bar": "<path d=\"M3 13a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -6\" /> <path d=\"M15 9a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -10\" /> <path d=\"M9 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -14\" /> <path d=\"M4 20h14\" />", "settings": "<path d=\"M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065\" /> <path d=\"M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0\" />", "adjustments-horizontal": "<path d=\"M12 6a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" /> <path d=\"M4 6l8 0\" /> <path d=\"M16 6l4 0\" /> <path d=\"M6 12a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" /> <path d=\"M4 12l2 0\" /> <path d=\"M10 12l10 0\" /> <path d=\"M15 18a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" /> <path d=\"M4 18l11 0\" /> <path d=\"M19 18l1 0\" />", "arrows-shuffle": "<path d=\"M18 4l3 3l-3 3\" /> <path d=\"M18 20l3 -3l-3 -3\" /> <path d=\"M3 7h3a5 5 0 0 1 5 5a5 5 0 0 0 5 5h5\" /> <path d=\"M21 7h-5a4.978 4.978 0 0 0 -3 1m-4 8a4.984 4.984 0 0 1 -3 1h-3\" />", "stopwatch": "<path d=\"M5 13a7 7 0 1 0 14 0a7 7 0 0 0 -14 0\" /> <path d=\"M14.5 10.5l-2.5 2.5\" /> <path d=\"M17 8l1 -1\" /> <path d=\"M14 3h-4\" />", "player-track-next": "<path d=\"M3 5v14l8 -7l-8 -7\" /> <path d=\"M14 5v14l8 -7l-8 -7\" />", "player-track-prev": "<path d=\"M21 5v14l-8 -7l8 -7\" /> <path d=\"M10 5v14l-8 -7l8 -7\" />", "puzzle": "<path d=\"M4 7h3a1 1 0 0 0 1 -1v-1a2 2 0 0 1 4 0v1a1 1 0 0 0 1 1h3a1 1 0 0 1 1 1v3a1 1 0 0 0 1 1h1a2 2 0 0 1 0 4h-1a1 1 0 0 0 -1 1v3a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-1a2 2 0 0 0 -4 0v1a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h1a2 2 0 0 0 0 -4h-1a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1\" />", "forms": "<path d=\"M12 3a3 3 0 0 0 -3 3v12a3 3 0 0 0 3 3\" /> <path d=\"M6 3a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3\" /> <path d=\"M13 7h7a1 1 0 0 1 1 1v8a1 1 0 0 1 -1 1h-7\" /> <path d=\"M5 7h-1a1 1 0 0 0 -1 1v8a1 1 0 0 0 1 1h1\" /> <path d=\"M17 12h.01\" /> <path d=\"M13 12h.01\" />", "map-pin": "<path d=\"M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0\" /> <path d=\"M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0\" />", "arrows-sort": "<path d=\"M3 9l4 -4l4 4m-4 -4v14\" /> <path d=\"M21 15l-4 4l-4 -4m4 4v-14\" />", "headphones": "<path d=\"M4 15a2 2 0 0 1 2 -2h1a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2h-1a2 2 0 0 1 -2 -2l0 -3\" /> <path d=\"M15 15a2 2 0 0 1 2 -2h1a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2h-1a2 2 0 0 1 -2 -2l0 -3\" /> <path d=\"M4 15v-3a8 8 0 0 1 16 0v3\" />", "microphone": "<path d=\"M9 5a3 3 0 0 1 3 -3a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3a3 3 0 0 1 -3 -3l0 -5\" /> <path d=\"M5 10a7 7 0 0 0 14 0\" /> <path d=\"M8 21l8 0\" /> <path d=\"M12 17l0 4\" />", "abc": "<path d=\"M3 16v-6a2 2 0 1 1 4 0v6\" /> <path d=\"M3 13h4\" /> <path d=\"M10 8v6a2 2 0 1 0 4 0v-1a2 2 0 1 0 -4 0v1\" /> <path d=\"M20.732 12a2 2 0 0 0 -3.732 1v1a2 2 0 0 0 3.726 1.01\" />", "ear": "<path d=\"M6 10a7 7 0 1 1 13 3.6a10 10 0 0 1 -2 2a8 8 0 0 0 -2 3a4.5 4.5 0 0 1 -6.8 1.4\" /> <path d=\"M10 10a3 3 0 1 1 5 2.2\" />", "brain": "<path d=\"M15.5 13a3.5 3.5 0 0 0 -3.5 3.5v1a3.5 3.5 0 0 0 7 0v-1.8\" /> <path d=\"M8.5 13a3.5 3.5 0 0 1 3.5 3.5v1a3.5 3.5 0 0 1 -7 0v-1.8\" /> <path d=\"M17.5 16a3.5 3.5 0 0 0 0 -7h-.5\" /> <path d=\"M19 9.3v-2.8a3.5 3.5 0 0 0 -7 0\" /> <path d=\"M6.5 16a3.5 3.5 0 0 1 0 -7h.5\" /> <path d=\"M5 9.3v-2.8a3.5 3.5 0 0 1 7 0v10\" />", "volume": "<path d=\"M15 8a5 5 0 0 1 0 8\" /> <path d=\"M17.7 5a9 9 0 0 1 0 14\" /> <path d=\"M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5\" />", "eye": "<path d=\"M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0\" /> <path d=\"M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6\" />", "eye-off": "<path d=\"M10.585 10.587a2 2 0 0 0 2.829 2.828\" /> <path d=\"M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87\" /> <path d=\"M3 3l18 18\" />", "player-play": "<path d=\"M7 4v16l13 -8l-13 -8\" />", "player-pause": "<path d=\"M6 6a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1l0 -12\" /> <path d=\"M14 6a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1l0 -12\" />", "player-stop": "<path d=\"M5 7a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2l0 -10\" />", "repeat": "<path d=\"M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3\" /> <path d=\"M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3\" />", "download": "<path d=\"M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2\" /> <path d=\"M7 11l5 5l5 -5\" /> <path d=\"M12 4l0 12\" />", "upload": "<path d=\"M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2\" /> <path d=\"M7 9l5 -5l5 5\" /> <path d=\"M12 4l0 12\" />", "check": "<path d=\"M5 12l5 5l10 -10\" />", "x": "<path d=\"M18 6l-12 12\" /> <path d=\"M6 6l12 12\" />", "circle-check": "<path d=\"M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0\" /> <path d=\"M9 12l2 2l4 -4\" />", "circle-x": "<path d=\"M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0\" /> <path d=\"M10 10l4 4m0 -4l-4 4\" />", "alert-circle": "<path d=\"M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0\" /> <path d=\"M12 8v4\" /> <path d=\"M12 16h.01\" />", "flame": "<path d=\"M12 10.941c2.333 -3.308 .167 -7.823 -1 -8.941c0 3.395 -2.235 5.299 -3.667 6.706c-1.43 1.408 -2.333 3.294 -2.333 5.588c0 3.704 3.134 6.706 7 6.706c3.866 0 7 -3.002 7 -6.706c0 -1.712 -1.232 -4.403 -2.333 -5.588c-2.084 3.353 -3.257 3.353 -4.667 2.235\" />", "trophy": "<path d=\"M8 21l8 0\" /> <path d=\"M12 17l0 4\" /> <path d=\"M7 4l10 0\" /> <path d=\"M17 4v8a5 5 0 0 1 -10 0v-8\" /> <path d=\"M3 9a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" /> <path d=\"M17 9a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" />", "star": "<path d=\"M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873l-6.158 -3.245\" />", "palette": "<path d=\"M12 21a9 9 0 0 1 0 -18c4.97 0 9 3.582 9 8c0 1.06 -.474 2.078 -1.318 2.828c-.844 .75 -1.989 1.172 -3.182 1.172h-2.5a2 2 0 0 0 -1 3.75a1.3 1.3 0 0 1 -1 2.25\" /> <path d=\"M7.5 10.5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\" /> <path d=\"M11.5 7.5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\" /> <path d=\"M15.5 10.5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\" />", "target-arrow": "<path d=\"M11 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\" /> <path d=\"M12 7a5 5 0 1 0 5 5\" /> <path d=\"M13 3.055a9 9 0 1 0 7.941 7.945\" /> <path d=\"M15 6v3h3l3 -3h-3v-3l-3 3\" /> <path d=\"M15 9l-3 3\" />", "device-gamepad-2": "<path d=\"M12 5h3.5a5 5 0 0 1 0 10h-5.5l-4.015 4.227a2.3 2.3 0 0 1 -3.923 -2.035l1.634 -8.173a5 5 0 0 1 4.904 -4.019h3.4\" /> <path d=\"M14 15l4.07 4.284a2.3 2.3 0 0 0 3.925 -2.023l-1.6 -8.232\" /> <path d=\"M8 9v2\" /> <path d=\"M7 10h2\" /> <path d=\"M14 10h2\" />", "device-floppy": "<path d=\"M6 4h10l4 4v10a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2\" /> <path d=\"M10 14a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" /> <path d=\"M14 4l0 4l-6 0l0 -4\" />", "trash": "<path d=\"M4 7l16 0\" /> <path d=\"M10 11l0 6\" /> <path d=\"M14 11l0 6\" /> <path d=\"M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12\" /> <path d=\"M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3\" />", "grip-vertical": "<path d=\"M8 5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\" /> <path d=\"M8 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\" /> <path d=\"M8 19a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\" /> <path d=\"M14 5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\" /> <path d=\"M14 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\" /> <path d=\"M14 19a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\" />", "chevron-right": "<path d=\"M9 6l6 6l-6 6\" />", "list-details": "<path d=\"M13 5h8\" /> <path d=\"M13 9h5\" /> <path d=\"M13 15h8\" /> <path d=\"M13 19h5\" /> <path d=\"M3 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4\" /> <path d=\"M3 15a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4\" />", "refresh": "<path d=\"M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4\" /> <path d=\"M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4\" />", "confetti": "<path d=\"M4 5h2\" /> <path d=\"M5 4v2\" /> <path d=\"M11.5 4l-.5 2\" /> <path d=\"M18 5h2\" /> <path d=\"M19 4v2\" /> <path d=\"M15 9l-1 1\" /> <path d=\"M18 13l2 -.5\" /> <path d=\"M18 19h2\" /> <path d=\"M19 18v2\" /> <path d=\"M14 16.518l-6.518 -6.518l-4.39 9.58a1 1 0 0 0 1.329 1.329l9.579 -4.39\" />", "star-filled": "<path d=\"M8.243 7.34l-6.38 .925l-.113 .023a1 1 0 0 0 -.44 1.684l4.622 4.499l-1.09 6.355l-.013 .11a1 1 0 0 0 1.464 .944l5.706 -3l5.693 3l.1 .046a1 1 0 0 0 1.352 -1.1l-1.091 -6.355l4.624 -4.5l.078 -.085a1 1 0 0 0 -.633 -1.62l-6.38 -.926l-2.852 -5.78a1 1 0 0 0 -1.794 0l-2.853 5.78z\" />", "blocks": "<path d=\"M14 4a1 1 0 0 1 1 -1h5a1 1 0 0 1 1 1v5a1 1 0 0 1 -1 1h-5a1 1 0 0 1 -1 -1l0 -5\" /> <path d=\"M3 14h12a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h3a2 2 0 0 1 2 2v12\" />"};
const ic = (n, cls = '') => n.endsWith('-filled')
  ? `<svg class="ic ${cls}" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">${ICONS[n] || ''}</svg>`
  : `<svg class="ic ${cls}" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ''}</svg>`;
const MODES = {
  suivante:   { label: 'Aya suivante',   icon: 'player-track-next', g: 'quiz', d: 'Trouve l’aya qui vient juste après' },
  precedente: { label: 'Aya précédente', icon: 'player-track-prev', g: 'quiz', d: 'Trouve l’aya qui vient juste avant' },
  complete:   { label: 'Compléter',      icon: 'puzzle', g: 'quiz', d: 'Choisis la fin de l’aya' },
  mot:        { label: 'Mot manquant',   icon: 'forms', g: 'quiz', d: 'Retrouve le mot qui manque' },
  sourate:    { label: 'Quelle sourate', icon: 'map-pin', g: 'quiz', d: 'De quelle sourate vient l’aya ?' },
  ordre:      { label: 'Remettre en ordre', icon: 'arrows-sort', g: 'quiz', d: 'Fais glisser 4 ayat dans l’ordre' },
  motamot:    { label: 'Mot à mot',      icon: 'blocks', g: 'quiz', d: 'Reconstitue l’aya en touchant les mots dans l’ordre' },
  ecoute:     { label: 'Écoute',         icon: 'headphones', g: 'quiz', d: 'Écoute et reconnais l’aya' },
  recite:     { label: 'Réciter',        icon: 'microphone', g: 'recit', d: 'Récite la suite ou la fin de l’aya' },
  lettres:    { label: 'Premières lettres', icon: 'abc', g: 'recit', d: 'Récite avec seulement la 1re lettre de chaque mot' },
  echo:       { label: 'Écho',           icon: 'ear', g: 'memo', d: 'Écoute l’aya, puis répète-la sans le texte' },
  efface:     { label: 'Effacement',     icon: 'brain', g: 'memo', d: 'Le texte s’efface petit à petit : tiens jusqu’au bout !' },
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
Object.assign(ICONS, {
  'wifi-off': '<path d="M12 18l.01 0" /><path d="M9.172 15.172a4 4 0 0 1 5.656 0" /><path d="M6.343 12.343a7.963 7.963 0 0 1 3.864 -2.14m4.163 .155a7.965 7.965 0 0 1 3.287 2" /><path d="M3.515 9.515a12 12 0 0 1 3.544 -2.455m3.101 -.92a12 12 0 0 1 10.325 3.374" /><path d="M3 3l18 18" />',
  'bell': '<path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6" /><path d="M9 17v1a3 3 0 0 0 6 0v-1" />',
  'text-size': '<path d="M3 7v-2h13v2" /><path d="M10 5v14" /><path d="M12 19h-4" /><path d="M15 13v-1h6v1" /><path d="M18 12v7" /><path d="M17 19h2" />',
});
const SRS_STEPS = [10 * 60e3, 864e5, 3 * 864e5, 7 * 864e5, 16 * 864e5, 35 * 864e5, 90 * 864e5, 180 * 864e5];

/* ---------- State ---------- */
const defaultState = () => ({
  selected: [],
  modes: { suivante: true, precedente: true, complete: true, mot: true, sourate: true, ordre: true, motamot: true, ecoute: true, recite: true, lettres: true, echo: true, efface: true },
  best: 0, goalDone: {},
  current: 'mix',
  settings: { theme: 'emeraude', trad: true, pieges: true, reciter: 'Alafasy_128kbps', reciteType: 'mix', voice: true, goal: 20, opening: true, arScale: 1, cacheListen: true, remindAt: '20:00' },
  srs: {}, days: {}, surah: {}, total: { n: 0, ok: 0 },
});
let S = load();
if (!S.srsV2) { for (const k in S.srs) { const r = S.srs[k]; if (r.b > 0) r.b = Math.max(1, r.b - 1); } S.srsV2 = 1; }
if (S.ranges) { S.iv = S.iv || {}; for (const k in S.ranges) S.iv[k] = [S.ranges[k]]; delete S.ranges; }
function load() {
  try { const d = JSON.parse(localStorage.getItem(STORE_KEY)); if (d) { const def = defaultState(); return { ...def, ...d, modes: { ...def.modes, ...d.modes }, settings: { ...def.settings, ...d.settings } }; } } catch (e) {}
  return defaultState();
}
const save = () => { localStorage.setItem(STORE_KEY, JSON.stringify(S)); if (typeof schedCloud === 'function') schedCloud(); };
applyTheme();
const applyScale = () => document.documentElement.style.setProperty('--as', S.settings.arScale || 1);
applyScale();

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
let weakMode = false;
const isWeak = a => { const r = rec(a); return !!r && r.n > r.k && r.b <= 1; };
const weakList = () => POOL.filter(isWeak).sort((x, y) => (rec(x).b - rec(y).b) || ((rec(y).n - rec(y).k) - (rec(x).n - rec(x).k)));
function updateWeakBar() {
  const el = $('#weakBar'); if (!el) return;
  el.hidden = !weakMode;
  if (weakMode) el.innerHTML = `<span>${ic('target-arrow')} Zones faibles : ${weakList().length} ayat fragiles</span><button data-weakoff>Quitter</button>`;
}
function pickTarget(filter, tgt = a => a) {
  let cand = POOL.filter(filter);
  if (!cand.length) return null;
  if (weakMode) { const wk = cand.filter(isWeak); if (wk.length) cand = wk; else { weakMode = false; toast('Plus aucune zone faible, bravo !'); updateWeakBar(); } }
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
// pas d'audio automatique tant que tu n'as pas touché l'écran (ouverture de l'appli)
let userActed = false;
addEventListener('pointerdown', () => { userActed = true; }, { once: true, capture: true });
const player = new Audio();
const dirIdx = {};
function recDirs() { return (RECITERS[S.settings.reciter] || RECITERS.Alafasy_128kbps).d; }
function audioUrl(a, k) { return `https://everyayah.com/data/${recDirs()[k]}/${pad3(a.s)}${pad3(a.a)}.mp3`; }
function play(a, then, fromReader) {
  if (!fromReader && typeof readStop === 'function') readStop();
  player.pause();
  let k = dirIdx[S.settings.reciter] || 0;
  const tryK = () => { const u = audioUrl(a, k); player.src = u; player.play().catch(() => {}); if (S.settings.cacheListen) setTimeout(() => cacheAudio(u), 1500); };
  player.onerror = () => { const n = recDirs().length; if (k + 1 < n) { k++; dirIdx[S.settings.reciter] = k; tryK(); } else toast('Audio indisponible pour ce récitateur'); };
  player.onended = then || null; tryK();
}
const AUDIO_CACHE = 'murajaa-audio';
async function cacheAudio(url) {
  try { const c = await caches.open(AUDIO_CACHE); if (await c.match(url)) return true; const r = await fetch(url, { mode: 'cors' }); if (!r.ok) return false; await c.put(url, r); return true; } catch (e) { return false; }
}
function stopAudio() { player.onended = null; player.pause(); }
function toast(msg) { let t = $('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); } t.textContent = msg; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 2500); }
function playSeq(list) { let i = 0; const go = () => { if (i < list.length) play(list[i++], go); }; go(); }

/* ---------- Helpers d'affichage ---------- */
function arSize(text) { const l = text.length; return l > 380 ? 'xs' : l > 160 ? 'small' : ''; }
function arBlock(text, extra = '') { return `<div class="ar ${arSize(text)} ${extra}">${text}</div>`; }
function frBlock(a) { return S.settings.trad ? `<div class="fr">${esc(a.fr)}</div>` : ''; }
function refLine(a) { return `<div class="ref">${esc(surahName(a.s))} · ${a.s}:${a.a} <button class="play" data-play="${a.s}:${a.a}" aria-label="Écouter">${ic('volume')}</button></div>`; }
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
      // mauvaises réponses : d'abord tes sourates, puis les pièges, puis des sourates de même taille/type (pas au hasard)
      for (const v of shuffle([...new Set(POOL.map(a => a.s))])) addS(v);
      if (S.settings.pieges) for (const b of similar(x, 10)) addS(b.s);
      const me = SURAHS[x.s - 1];
      const close = SURAHS.filter(u => u.i !== x.s).sort((p, q) => (Math.abs(p.count - me.count) + (p.type === me.type ? 0 : 20) + Math.random() * 4) - (Math.abs(q.count - me.count) + (q.type === me.type ? 0 : 20) + Math.random() * 4));
      for (const u of close.slice(0, 12)) addS(u.i);
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
        showHtml: `<div style="text-align:center;margin:10px 0"><button class="btn gold" data-listen>${ic('ear')} Réécouter</button></div>${frBlock(x)}<div class="ref">${esc(surahName(x.s))} · ${x.s}:${x.a}</div>`, expected: x.tk };
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
        showHtml: `<div style="text-align:center;margin:14px 0"><button class="btn gold" data-listen>${ic('headphones')} Écouter</button></div>`,
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
  updateWeakBar();
  $('#sessionInfo').textContent = session.n ? `${session.n} carte${session.n > 1 ? 's' : ''} · ${Math.round(100 * session.ok / session.n)} %` : '';
  const g = S.settings.goal || 20, d = S.days[today()] || 0, el = $('#goal');
  if (el) { el.querySelector('span').textContent = d >= g ? `Objectif du jour atteint : ${d}/${g}` : `Objectif du jour : ${d}/${g}`; el.querySelector('b').style.width = Math.min(100, 100 * d / g) + '%'; el.classList.toggle('done', d >= g); }
  if (d >= g && !(S.goalDone || {})[today()]) { S.goalDone = S.goalDone || {}; S.goalDone[today()] = 1; save(); toast('Objectif du jour atteint, barakAllahu fik !'); }
}
function enabledModes() { return Object.keys(MODES).filter(m => S.modes[m]); }

function renderModeBar() {
  const list = [['mix', `${ic('arrows-shuffle')} Mix (${enabledModes().length})`], ['defi', `${ic('stopwatch')} Défi 60 s`], ...enabledModes().map(m => [m, ic(MODES[m].icon) + ' ' + MODES[m].label])];
  if (S.current !== 'mix' && S.current !== 'defi' && !S.modes[S.current]) S.current = 'mix';
  $('#modeBar').innerHTML = `<button class="chip pick" data-pick>${ic('adjustments-horizontal')} Exercices</button>` + list.map(([k, l]) => `<button class="chip ${S.current === k ? 'on' : ''}" data-mode="${k}">${l}</button>`).join('');
  updateSession();
}
/* Choix des exercices */
function openPicker() {
  const sh = document.createElement('div'); sh.className = 'sheet-bg';
  sh.innerHTML = `<div class="sheet"><h2>Sur quoi tu veux travailler ?</h2><p class="muted">Coche un ou plusieurs exercices : le mode Mix les mélange.</p>
    ${Object.entries(GROUPS).map(([g, gl]) => `<h3>${gl}</h3>${Object.entries(MODES).filter(([, m]) => m.g === g).map(([k, m]) => `
      <label class="pk"><input type="checkbox" data-pk="${k}" ${S.modes[k] ? 'checked' : ''}><span class="pi">${ic(m.icon)}</span><span><b>${m.label}</b><small>${m.d}</small></span></label>`).join('')}`).join('')}
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
  $('#deckHint').innerHTML = `<span class="chrono">${ic('stopwatch')} ${left} s · ${ic('circle-check')} ${chall.ok}</span>`;
  if (left <= 0) endChallenge();
}
function endChallenge() {
  clearInterval(chall.timer); const r = chall; chall = null;
  const rec = r.ok > (S.best || 0); if (rec) { S.best = r.ok; save(); }
  $('#deck').innerHTML = `<div class="card"><div class="body endc"><div class="big">${ic('stopwatch')}</div><h2>Défi terminé !</h2>
    <div class="score">${r.ok}<small> bonne${r.ok > 1 ? 's' : ''} réponse${r.ok > 1 ? 's' : ''} sur ${r.n}</small></div>
    <p>${rec ? `${ic('trophy')} Nouveau record !` : `Record : ${S.best}`}</p>
    <div class="btnrow"><button class="btn gold" data-mode="defi">Rejouer</button><button class="btn light" data-mode="mix">Retour au Mix</button></div></div></div>`;
  $('#deckHint').textContent = '';
}

function newCard() {
  stopAudio();
  const deck = $('#deck');
  deck.innerHTML = '';
  if (!S.selected.length) {
    deck.innerHTML = `<div class="empty">Coche d’abord les sourates que tu connais.<br><button class="btn gold" data-goto="surahs">${ic('list-check')} Choisir mes sourates</button></div>`;
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
  if (q.items) body += `<div class="opts ord" data-ord>${q.items.map((it, i) => `<div class="opt ord-item" data-idx="${i}"><span class="grip">${ic('grip-vertical')}</span><span class="ot">${it.html}</span></div>`).join('')}</div>
    <div class="btnrow" data-ordrow><button class="btn gold" data-ordcheck>${ic('check')} Valider l’ordre</button></div>`;
  if (q.tiles) body += `${frBlock(q.target)}<div class="ref">${esc(surahName(q.target.s))} · ${q.target.s}:${q.target.a}</div>
    <div class="ar mmline">${q.before ? q.before + ' ' : ''}<span data-mmans></span><span class="mmcur">▁▁</span>${q.after ? ' …' : ''}</div>
    <div class="tiles">${q.tiles.map((t, i) => `<button class="wtile" data-tile="${i}">${t.w}</button>`).join('')}</div>`;
  if (q.efface) body += `<div class="lvl" data-lvl></div><div data-eff></div>${frBlock(q.target)}${refLine(q.target)}
    <div class="btnrow" data-effbtn><button class="btn ko" data-effko>${ic('x')} J’ai bloqué</button><button class="btn ok" data-effok>${ic('check')} Je l’ai dit</button></div>`;
  if (q.recit) {
    body += `<div class="btnrow">${SR && S.settings.voice ? `<button class="btn gold" data-mic>${ic('microphone')} Réciter</button>` : ''}<button class="btn light" data-reveal>${ic('eye')} Révéler</button></div><div class="transcript" data-tr></div>`;
  }
  body += `<div data-after></div>`;
  el.innerHTML = `<div class="stamp r">SU</div><div class="stamp l">À REVOIR</div>
    <div class="head"><span class="tag">${ic(m.icon)} ${m.label}</span><span>${esc(surahName(q.target.s))}${q.hideRef ? '' : ''}</span></div>
    <div class="body">${body}</div>`;
  if (q.mode === 'sourate') $('.head span:last-child', el).textContent = 'Sourate ?';
  setHint(c);
  if (userActed && (q.audio || q.forcePlay)) play(q.target);
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
  $('[data-lvl]', c.el).innerHTML = names.map((nm, i) => `<span class="${i < L ? 'done' : i === L ? 'cur' : ''}">${ic(i < L ? 'star-filled' : 'star')}<small>${nm}</small></span>`).join('');
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
  if (!c.q.audio && (g !== 'ok' || c.q.seq)) { if (c.q.seq) playSeq(c.q.seq); else play(t); }
  const msg = { ok: `${ic('circle-check')} Bravo !`, mid: `${ic('alert-circle')} Presque`, ko: `${ic('circle-x')} Raté` }[g];
  let out = html || `<div class="result ${g}">${msg}</div>`;
  if (!html) out += revealBlock(t, c.q) + `<div class="btnrow"><button class="btn gold" data-nextcard>Suivant →</button></div>`;
  $('[data-after]', c.el).innerHTML = out;
  grade(t, g);
  setHint(c);
  if (chall) { chall.n++; if (g === 'ok') chall.ok++; tickChallenge(); setTimeout(() => { if (chall && currentCard === c) swipeOut(c, g === 'ok' ? 1 : -1); }, g === 'ok' ? 450 : 1100); return; }
}
function revealBlock(t, q) {
  let s = `<div class="reveal">`;
  if (q && q.mode === 'ordre') s += q.seq.map(a => arBlock(a.ar, 'small') + frBlock(a)).join('') + `<div class="ref">${esc(surahName(q.seq[0].s))} · ${q.seq[0].s}:${q.seq[0].a}–${q.seq[3].a} <button class="play" data-playseq="${q.seq[0].s}:${q.seq[0].a}:${q.seq.length}" aria-label="Écouter">${ic('volume')}</button></div>`;
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
  btn.classList.add('rec'); btn.innerHTML = `${ic('player-stop')} Stop`;
  player.pause();
  recog.onresult = ev => { text = cleanTranscript([...ev.results].map(r => r[0].transcript)); trEl.textContent = text; };
  recog.onerror = ev => { trEl.textContent = ev.error === 'not-allowed' ? 'Micro refusé — utilise « Révéler ».' : 'Erreur micro : ' + ev.error; };
  recog.onend = () => { recog = null; btn.classList.remove('rec'); btn.innerHTML = `${ic('microphone')} Réessayer`; if (text.trim()) scoreRecite(c, text); };
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
  $('[data-after]', c.el).innerHTML = `<div class="result ${g}">${ic({ ok: 'circle-check', mid: 'alert-circle', ko: 'circle-x' }[g])} ${Math.round(ratio * 100)} % de correspondance</div>
    <div class="reveal"><div class="ar ${arSize(t.ar)}">${pre}${shown}</div>${frBlock(t)}${refLine(t)}</div>${selfButtons()}`;
  setHint(c);
}
function revealRecite(c) {
  if (recog) recog.stop();
  if (c.answered) return;
  c.answered = true; c.selfEval = true;
  $('[data-after]', c.el).innerHTML = revealBlock(c.q.target) + selfButtons();
  setHint(c);
  if (userActed) play(c.q.target);
}
const selfButtons = () => `<div class="btnrow"><button class="btn ko" data-self="ko">${ic('x')} Raté</button><button class="btn mid" data-self="mid">${ic('alert-circle')} Hésité</button><button class="btn ok" data-self="ok">${ic('check')} Su</button></div>`;
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
  stopAudio();
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
    <div class="tile"><b>${ic('flame', 'flame')} ${streak()}</b><span>jours d’affilée</span></div>
    <div class="tile"><b>${S.days[today()] || 0}</b><span>cartes aujourd’hui</span></div>
    <div class="tile"><b>${pct} %</b><span>réussite globale (${S.total.n})</span></div>
    <div class="tile"><b>${due}</b><span>ayat à revoir maintenant</span></div>
    <div class="tile"><b>${mastered}/${POOL.length}</b><span>ayat maîtrisées</span></div>
    <div class="tile"><b>${seen}</b><span>ayat déjà vues</span></div></div>`;
  // zones faibles
  const wl = weakList();
  html += `<h2>Zones faibles</h2>` + (wl.length ? `<div class="weak">${wl.slice(0, 8).map(a => { const r = rec(a); return `<div class="wrow"><span>${esc(surahName(a.s))} · ${a.s}:${a.a}</span><small>${r.n - r.k} raté${r.n - r.k > 1 ? 's' : ''} / ${r.n}</small></div>`; }).join('')}</div>
    <button class="btn gold" data-weakgo>${ic('target-arrow')} Retravailler mes ${wl.length} zone${wl.length > 1 ? 's' : ''} faible${wl.length > 1 ? 's' : ''}</button>` : `<div class="empty">Aucune zone faible pour l’instant : continue comme ça.</div>`);
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

$('#statsBox').addEventListener('click', e => { if (e.target.closest('[data-weakgo]')) { weakMode = true; showView('revise'); newCard(); } });
$('#weakBar').addEventListener('click', e => { if (e.target.closest('[data-weakoff]')) { weakMode = false; updateWeakBar(); newCard(); } });

/* ---------- Réglages ---------- */
const openSec = new Set();
function renderSettings() {
  const st = S.settings;
  const sec = (id, icon, title, sub, body) => `<details class="sec" data-sec="${id}" ${openSec.has(id) ? 'open' : ''}><summary><span class="si">${ic(icon)}</span><span class="st">${title}<small>${sub}</small></span><span class="chev">${ic('chevron-right')}</span></summary><div class="sec-b">${body}</div></details>`;
  const chk = (key, label, sub, extra = '') => `<label><span>${label}${sub ? `<small>${sub}</small>` : ''}</span><input type="checkbox" data-set="${key}" ${st[key] ? 'checked' : ''} ${extra}></label>`;
  const nMod = enabledModes().length, total = Object.keys(MODES).length;
  $('#settingsBox').innerHTML = `<div class="secs">
  ${sec('look', 'palette', 'Apparence', (THEMES[st.theme] || THEMES.emeraude).name,
    `<div class="themes">${Object.entries(THEMES).map(([k, t]) => `<button class="theme ${st.theme === k ? 'on' : ''}" data-theme-pick="${k}"><span class="sw">${t.sw.map(c => `<i style="background:${c}"></i>`).join('')}</span>${t.name}</button>`).join('')}</div>
     <div class="set">${chk('trad', 'Traduction française', 'Hamidullah')}
     <label>Taille du texte arabe<select data-sel="arScale">${[[.85, 'Petit'], [1, 'Normal'], [1.2, 'Grand'], [1.4, 'Très grand']].map(([v, l]) => `<option value="${v}" ${+st.arScale === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label></div>`)}
  ${sec('goal', 'target-arrow', 'Objectif & accueil', `${st.goal} cartes par jour`,
    `<div class="set"><label>Objectif du jour<select data-sel="goal">${[10, 20, 30, 50, 100].map(v => `<option value="${v}" ${+st.goal === v ? 'selected' : ''}>${v} cartes</option>`).join('')}</select></label>
     ${chk('opening', 'Écran d’ouverture', 'Duaa + hadith du jour, à la 1re ouverture de la journée')}</div>`)}
  ${sec('ex', 'cards', 'Exercices', `${nMod} sur ${total} actifs`,
    Object.entries(GROUPS).map(([g, gl]) => `<h4>${gl}</h4><div class="set">${Object.entries(MODES).filter(([, m]) => m.g === g).map(([k, m]) => `<label><span class="mlab">${ic(m.icon)} ${m.label}<small>${m.d}</small></span><input type="checkbox" data-mode-t="${k}" ${S.modes[k] ? 'checked' : ''}></label>`).join('')}</div>`).join(''))}
  ${sec('game', 'device-gamepad-2', 'Options de jeu', st.pieges ? 'Pièges activés' : 'Pièges désactivés',
    `<div class="set">${chk('pieges', 'Pièges (ayat qui se ressemblent)', 'Les mauvaises réponses sont des mutashabihat')}
     ${chk('voice', 'Reconnaissance vocale', SR ? 'Disponible sur cet appareil' : 'Non disponible ici → auto-évaluation', SR ? '' : 'disabled')}
     <label>Récitation<select data-sel="reciteType">${[['mix', 'Suite ou fin (mix)'], ['suite', 'Aya suivante'], ['fin', 'Fin de l’aya']].map(([v, l]) => `<option value="${v}" ${st.reciteType === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label></div>`)}
  ${sec('audio', 'volume', 'Audio', (RECITERS[st.reciter] || RECITERS.Alafasy_128kbps).n,
    `<div class="set"><label>Récitateur<select data-sel="reciter">${Object.entries(RECITERS).map(([v, r]) => `<option value="${v}" ${st.reciter === v ? 'selected' : ''}>${r.n}</option>`).join('')}</select></label>
     </div>`)}
  ${sec('offline', 'wifi-off', 'Hors-ligne', 'Utiliser l’appli sans internet',
    `<div class="set" style="padding:12px"><p class="muted" style="margin:0 0 8px">Le Coran, la traduction et l’appli fonctionnent déjà sans internet. Pour l’audio, télécharge-le une fois.</p>
     <div id="offInfo" class="muted" style="margin:0 0 10px">Calcul…</div>
     ${chk('cacheListen', 'Garder les ayat écoutées', 'Elles seront dispo hors-ligne ensuite')}
     <div class="btnrow" style="margin:10px 0 0"><button class="btn gold" id="offDl">${ic('download')} Télécharger l’audio de ma sélection</button><button class="btn light" id="offClear">${ic('trash')} Vider l’audio</button></div></div>`)}
  ${sec('remind', 'bell', 'Rappel quotidien', 'Alarme dans ton calendrier',
    `<div class="set" style="padding:12px"><p class="muted" style="margin:0 0 10px">Ajoute un événement qui se répète chaque jour avec alarme : ton téléphone te rappellera de réviser.</p>
     <label>Heure<input type="time" data-sel="remindAt" value="${st.remindAt || '20:00'}"></label>
     <div class="btnrow" style="margin:10px 0 0"><button class="btn gold" id="remAdd">${ic('bell')} Ajouter à mon calendrier</button></div></div>`)}
  ${sec('save', 'device-floppy', 'Sauvegarde', 'Exporter / importer ta progression',
    `<div class="set" style="padding:12px"><p class="muted" style="margin:0 0 10px">Garde une copie de ta progression ou transfère-la sur un autre téléphone.</p>
     <div class="btnrow" style="margin:0"><button class="btn gold" data-export>${ic('download')} Exporter</button><button class="btn light" data-import>${ic('upload')} Importer</button></div>
     <div class="btnrow" style="margin:8px 0 0"><button class="btn light" data-copycode>Copier un code</button><button class="btn light" data-pastecode>Coller un code</button></div>
     <p class="muted" style="margin:10px 0 0">${S.lastBackup ? 'Dernière sauvegarde : ' + new Date(S.lastBackup + 'T12:00').toLocaleDateString('fr') : 'Aucune sauvegarde faite pour l’instant.'}</p>
     <input type="file" accept=".json,application/json" data-importfile hidden></div>
     <div class="set" style="padding:12px;margin-top:10px"><b>Sauvegarde automatique (ton compte GitHub)</b>
     ${cloudGet() ? `<p class="muted" id="cloudInfo" style="margin:8px 0">…</p>
       <div class="btnrow" style="margin:0"><button class="btn gold" id="cloudNow">Sauvegarder maintenant</button><button class="btn light" id="cloudRestore">Restaurer</button><button class="btn light" id="cloudOff">Désactiver</button></div>`
     : `<p class="muted" style="margin:8px 0">Ta progression est envoyée toute seule (en privé) sur ton compte GitHub, et tu peux la retrouver sur un autre téléphone. Une seule fois : <a href="https://github.com/settings/tokens/new?scopes=gist&description=Muraja%27a" target="_blank" rel="noopener" style="color:var(--gold)">crée un jeton ici</a> (droit « gist » déjà coché, durée « No expiration »), copie-le et colle-le ci-dessous.</p>
       <input id="cloudTok" type="password" autocomplete="off" placeholder="Jeton GitHub (ghp_…)" style="width:100%;box-sizing:border-box;padding:10px;border-radius:10px;border:1px solid var(--line3);background:var(--bg2);color:var(--text);margin-bottom:8px">
       <div class="btnrow" style="margin:0"><button class="btn gold" id="cloudOn">Activer</button></div>`}</div>`)}
  ${sec('data', 'trash', 'Données', 'Réinitialiser le suivi',
    `<button class="danger" data-reset>Réinitialiser le suivi (garder les sourates)</button>`)}
  </div>
  <div class="foot">Texte arabe uthmani (Hafs, Complexe du Roi Fahd) · traduction Muhammad Hamidullah (comme quran.com/fr) · audio everyayah.com<br>Version ${VERSION}</div>`;
  offlineInfo(); cloudInfo();
  $$('#settingsBox details').forEach(d => d.addEventListener('toggle', () => { d.open ? openSec.add(d.dataset.sec) : openSec.delete(d.dataset.sec); }));
}
$('#settingsBox').addEventListener('change', e => {
  const t = e.target;
  if (t.id === 'cloudTok') return;
  if (t.dataset.modeT) { S.modes[t.dataset.modeT] = t.checked; if (!enabledModes().length) { S.modes[t.dataset.modeT] = true; t.checked = true; } }
  if (t.dataset.set) S.settings[t.dataset.set] = t.checked;
  if (t.dataset.set === 'opening' && t.checked) { S.lastOpening = null; save(); setTimeout(showOpening, 150); }
  if (t.dataset.sel) { S.settings[t.dataset.sel] = (t.dataset.sel === 'goal' || t.dataset.sel === 'arScale') ? +t.value : t.value; if (t.dataset.sel === 'reciter') play(aya(1, 1)); }
  if (t.hasAttribute('data-importfile') && t.files[0]) return importData(t.files[0]);
  save(); applyScale(); renderModeBar(); renderSettings();
});
$('#settingsBox').addEventListener('click', e => {
  if (e.target.closest('[data-export]')) return exportData();
  if (e.target.closest('[data-copycode]')) return copyCode();
  if (e.target.closest('[data-pastecode]')) return pasteCode();
  if (e.target.closest('#cloudOn')) return cloudEnable();
  if (e.target.closest('#cloudNow')) return cloudPush(true);
  if (e.target.closest('#cloudRestore')) return cloudRestore(false);
  if (e.target.closest('#cloudOff')) { if (confirm('Arrêter la sauvegarde automatique ? (la copie reste sur GitHub)')) { cloudSet(null); renderSettings(); } return; }
  if (e.target.closest('#offDl')) return downloadAudio();
  if (e.target.closest('#offClear')) return clearAudio();
  if (e.target.closest('#remAdd')) return addReminder();
  if (e.target.closest('[data-import]')) return $('[data-importfile]').click();
  const tp = e.target.closest('[data-theme-pick]');
  if (tp) { S.settings.theme = tp.dataset.themePick; save(); applyTheme(); renderSettings(); return; }
  if (!e.target.hasAttribute('data-reset')) return;
  if (!confirm('Effacer tout le suivi de révision ?')) return;
  Object.assign(S, { srs: {}, days: {}, surah: {}, total: { n: 0, ok: 0 } }); save(); renderSettings();
});


/* ---------- Hors-ligne, rappel, code de sauvegarde ---------- */
async function offlineInfo() {
  const el = $('#offInfo'); if (!el) return;
  let n = 0, mb = 0;
  try { n = (await (await caches.open(AUDIO_CACHE)).keys()).length; const e = await navigator.storage.estimate(); mb = Math.round((e.usage || 0) / 1048576); } catch (e) {}
  const ready = 'serviceWorker' in navigator && navigator.serviceWorker.controller;
  const el2 = $('#offInfo'); if (el2) el2.innerHTML = `${ready ? 'Appli prête hors-ligne' : 'Appli pas encore prête hors-ligne (ouvre-la une fois avec internet)'}<br>Audio gardé : ${n} ayat · ${mb} Mo utilisés au total`;
}
let dl = null;
async function downloadAudio() {
  const btn = () => $('#offDl');
  if (dl) { dl.stop = true; return; }
  const dirs = recDirs(), items = POOL.slice(), name = (RECITERS[S.settings.reciter] || RECITERS.Alafasy_128kbps).n;
  if (!items.length) return toast('Coche d’abord des sourates');
  const kbps = +((/_(\d+)kbps/.exec(dirs[0]) || [])[1] || 64);
  const mo = Math.round(items.reduce((t, a) => t + a.tk.length, 0) * 0.55 * kbps / 8 / 1024);
  if (!confirm(`Télécharger l’audio de ${items.length} ayat (${name}, environ ${mo} Mo) ? Garde l’appli ouverte pendant le téléchargement.`)) return;
  try { navigator.storage.persist && navigator.storage.persist(); } catch (e) {}
  dl = { stop: false, done: 0, fail: 0, blocked: false }; let i = 0;
  const upd = () => { const b = btn(); if (b) b.innerHTML = `${ic('player-stop')} ${dl.done}/${items.length} · Arrêter`; };
  const worker = async () => {
    while (!dl.stop) {
      const a = items[i++]; if (!a) break;
      let ok = false;
      for (const d of dirs) { ok = await cacheAudio(`https://everyayah.com/data/${d}/${pad3(a.s)}${pad3(a.a)}.mp3`); if (ok) break; }
      ok ? dl.done++ : dl.fail++; upd();
      if (!dl.done && dl.fail >= 6) { dl.blocked = true; dl.stop = true; }
    }
  };
  upd(); await Promise.all([worker(), worker(), worker(), worker()]);
  const r = dl; dl = null; const b = btn(); if (b) b.innerHTML = `${ic('download')} Télécharger l’audio de ma sélection`;
  toast(r.blocked ? 'Téléchargement impossible : le serveur audio refuse (hors-ligne audio indisponible)' : r.stop ? `Arrêté : ${r.done} ayat gardées` : `Terminé : ${r.done} ayat${r.fail ? ', ' + r.fail + ' échec(s)' : ''}`);
  offlineInfo();
}
async function clearAudio() { if (!confirm('Supprimer tout l’audio téléchargé ?')) return; try { await caches.delete(AUDIO_CACHE); } catch (e) {} toast('Audio supprimé'); offlineInfo(); }
function addReminder() {
  const [hh, mm] = (S.settings.remindAt || '20:00').split(':'), d = new Date(), p = n => String(n).padStart(2, '0');
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone, url = location.href.split('?')[0].split('#')[0];
  const st = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${hh}${mm}00`;
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Murajaa//FR', 'BEGIN:VEVENT', 'UID:murajaa-rappel-quotidien', `DTSTAMP:${new Date().toISOString().replace(/[-:]|\.\d+/g, '')}`,
    `DTSTART;TZID=${tz}:${st}`, 'DURATION:PT10M', 'RRULE:FREQ=DAILY', 'SUMMARY:Muraja\'a : révision du jour', `DESCRIPTION:${url}`, `URL:${url}`, 'BEGIN:VALARM', 'TRIGGER:PT0M', 'ACTION:DISPLAY', 'DESCRIPTION:Révision du jour', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const blob = new Blob([ics], { type: 'text/calendar' }), a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'murajaa-rappel.ics'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  toast('Ouvre le fichier pour l’ajouter à ton calendrier');
}
function copyCode() {
  const code = btoa(unescape(encodeURIComponent(JSON.stringify({ app: 'muraja-a', data: S }))));
  (navigator.clipboard ? navigator.clipboard.writeText(code) : Promise.reject()).then(() => { S.lastBackup = today(); save(); toast('Code copié : colle-le dans une note ou un message'); }, () => prompt('Copie ce code :', code));
}
function pasteCode() {
  const c = prompt('Colle ton code de sauvegarde :'); if (!c) return;
  try {
    const j = JSON.parse(decodeURIComponent(escape(atob(c.trim())))); if (j.app !== 'muraja-a' || !j.data) throw 0;
    if (!confirm('Remplacer ta progression actuelle par ce code ?')) return;
    const def = defaultState(); S = { ...def, ...j.data, modes: { ...def.modes, ...j.data.modes }, settings: { ...def.settings, ...j.data.settings } };
    save(); applyTheme(); applyScale(); buildPool(); renderSettings(); renderModeBar(); toast('Progression restaurée');
  } catch (e) { toast('Code invalide'); }
}

/* ---------- Sauvegarde automatique (GitHub Gist privé) ---------- */
const CLOUD_KEY = 'murajaa_cloud', GH = 'https://api.github.com';
const cloudGet = () => { try { return JSON.parse(localStorage.getItem(CLOUD_KEY)); } catch (e) { return null; } };
const cloudSet = c => c ? localStorage.setItem(CLOUD_KEY, JSON.stringify(c)) : localStorage.removeItem(CLOUD_KEY);
const ghFetch = (path, opt, tok) => fetch(GH + path, { ...(opt || {}), headers: { Authorization: 'Bearer ' + tok, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' } });
const payload = () => JSON.stringify({ app: 'muraja-a', v: VERSION, date: new Date().toISOString(), data: S });
function applyData(d) {
  const def = defaultState(); S = { ...def, ...d, modes: { ...def.modes, ...d.modes }, settings: { ...def.settings, ...d.settings } };
  save(); applyTheme(); applyScale(); buildPool(); renderModeBar(); if (currentCard) newCard();
}
function schedCloud() { if (!cloudGet()) return; window._cDirty = true; clearTimeout(window._cT); window._cT = setTimeout(() => cloudPush(), 20000); }
function cloudInfo() {
  const el = $('#cloudInfo'), c = cloudGet(); if (!el || !c) return;
  el.textContent = c.err ? `Dernier essai en échec (${c.err}). Il réessaiera tout seul.` : c.last ? `Activée · dernier envoi : ${new Date(c.last).toLocaleString('fr', { dateStyle: 'short', timeStyle: 'short' })}` : 'Activée';
}
async function cloudPush(manual) {
  const c = cloudGet(); if (!c) return false;
  if (!navigator.onLine) { if (manual) toast('Pas de connexion'); return false; }
  try {
    const body = payload(), date = JSON.parse(body).date;
    const r = await ghFetch('/gists/' + c.id, { method: 'PATCH', body: JSON.stringify({ files: { 'murajaa.json': { content: body } } }) }, c.token);
    if (!r.ok) throw r.status;
    const c2 = cloudGet(); if (c2) { c2.last = date; delete c2.err; cloudSet(c2); }
    window._cDirty = false; if (manual) toast('Sauvegarde envoyée'); cloudInfo(); return true;
  } catch (e) { const c2 = cloudGet(); if (c2) { c2.err = String(e); cloudSet(c2); } if (manual) toast('Échec de la sauvegarde (' + e + ')'); cloudInfo(); return false; }
}
async function cloudFetch(c) {
  const r = await ghFetch('/gists/' + c.id, {}, c.token); if (!r.ok) throw r.status;
  const f = (await r.json()).files['murajaa.json']; if (!f) throw 'fichier absent';
  const j = JSON.parse(f.truncated ? await (await fetch(f.raw_url)).text() : f.content);
  if (j.app !== 'muraja-a' || !j.data) throw 'fichier invalide'; return j;
}
async function cloudRestore(skipConfirm) {
  const c = cloudGet(); if (!c) return;
  try {
    const j = await cloudFetch(c);
    if (!skipConfirm && !confirm('Remplacer ta progression par la sauvegarde du ' + new Date(j.date).toLocaleString('fr') + ' ?')) return;
    applyData(j.data); const c2 = cloudGet(); c2.last = j.date; delete c2.err; cloudSet(c2); toast('Progression restaurée'); renderSettings();
  } catch (e) { toast('Échec de la restauration (' + e + ')'); }
}
async function cloudEnable() {
  const tok = ($('#cloudTok').value || '').trim(); if (!tok) return toast('Colle d’abord ton jeton GitHub');
  try {
    const u = await ghFetch('/user', {}, tok); if (!u.ok) throw 'jeton refusé';
    const l = await (await ghFetch('/gists?per_page=100', {}, tok)).json();
    const ex = Array.isArray(l) && l.find(g => g.files && g.files['murajaa.json']);
    if (ex) {
      cloudSet({ token: tok, id: ex.id });
      if (confirm('Une sauvegarde existe déjà sur ton compte.\nOK = la restaurer sur ce téléphone\nAnnuler = la remplacer par ce téléphone')) return cloudRestore(true);
      await cloudPush(true); return renderSettings();
    }
    const r = await ghFetch('/gists', { method: 'POST', body: JSON.stringify({ description: 'Muraja\'a : sauvegarde automatique', public: false, files: { 'murajaa.json': { content: payload() } } }) }, tok);
    if (!r.ok) throw 'création impossible (le jeton doit avoir le droit « gist »)';
    cloudSet({ token: tok, id: (await r.json()).id, last: new Date().toISOString() }); toast('Sauvegarde automatique activée'); renderSettings();
  } catch (e) { toast('Échec : ' + e); }
}
async function cloudCheck() {
  const c = cloudGet(); if (!c || !navigator.onLine) return;
  try {
    const j = await cloudFetch(c);
    if (c.last && j.date > c.last && confirm('Une sauvegarde plus récente existe sur ton compte (autre appareil ?). La restaurer ici ?')) { applyData(j.data); const c2 = cloudGet(); c2.last = j.date; cloudSet(c2); toast('Progression restaurée'); }
    else if (!c.last || j.date <= c.last) schedCloud();
  } catch (e) {}
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && window._cDirty) cloudPush(); });
addEventListener('online', () => { if (window._cDirty) cloudPush(); });

/* ---------- Lecture ---------- */
const BASMALA = 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ';
const arNum = n => n.toLocaleString('ar-EG');
let readS = 1, readCur = 0, readOn = false, readRep = false, readMask = false, readFrom = 1, readTo = 7, readLoop = false, readTimes = 1, readEcho = false, readT = null, readSurahShown = 0;
function renderRead() {
  readS = S.settings.readS || 1;
  const sel = $('#readSel');
  if (!sel.options.length) sel.innerHTML = SURAHS.map(x => `<option value="${x.i}">${x.i}. ${esc(x.tr)} — ${x.ar}</option>`).join('');
  sel.value = readS;
  const su = SURAHS[readS - 1];
  if (readSurahShown !== readS) { readSurahShown = readS; readFrom = 1; readTo = su.count; readCur = 0; }
  readTo = Math.min(readTo, su.count); readFrom = Math.min(readFrom, readTo);
  const opt = (v) => Array.from({ length: su.count }, (_, i) => `<option value="${i + 1}" ${i + 1 === v ? 'selected' : ''}>${i + 1}</option>`).join('');
  $('#rExtra').innerHTML = `<label>Passage <select id="rFrom">${opt(readFrom)}</select> à <select id="rTo">${opt(readTo)}</select></label>
    <button id="rLoop" class="btn light" aria-pressed="${readLoop}">${ic('repeat')} Boucle</button>
    <label>Chaque aya ×<select id="rTimes">${[1, 2, 3, 5, 10].map(v => `<option ${v === readTimes ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
    <button id="rEcho" class="btn light" aria-pressed="${readEcho}">${ic('ear')} Écoute-répète</button>`;
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
  $('#rPlay').innerHTML = readOn ? `${ic('player-pause')} Pause` : `${ic('player-play')} Écouter`;
  $('#rRep').setAttribute('aria-pressed', readRep); $('#rRep').classList.toggle('gold', readRep);
  $('#rMask').setAttribute('aria-pressed', readMask); $('#rMask').classList.toggle('gold', readMask);
  [['rLoop', readLoop], ['rEcho', readEcho]].forEach(([id, v]) => { const b = $('#' + id); if (b) { b.setAttribute('aria-pressed', v); b.classList.toggle('gold', v); } });
  const np = $('#nowPlay'); if (np) { np.hidden = !readOn; if (readOn) np.querySelector('span').textContent = `${SURAHS[readS - 1].tr} · aya ${readCur}${readEcho ? ' · à toi de répéter après l’écoute' : ''}`; }
}
function readPlay(a, rep = 0) {
  if (a > readTo) { if (readLoop) { a = readFrom; rep = 0; } else { readOn = false; markRead(); return; } }
  if (a < readFrom) a = readFrom;
  readCur = a; readOn = true; markRead();
  $$('#readBox .ra.echoing').forEach(x => x.classList.remove('echoing'));
  const el = $(`#readBox .ra[data-ra="${a}"]`); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  const step = () => { readT = null; if (!readOn) return; if (readRep) return readPlay(a, 0); if (rep + 1 < readTimes) return readPlay(a, rep + 1); readPlay(a + 1); };
  play(aya(readS, a), () => {
    if (!readOn) return;
    if (!readEcho) return step();
    if (el) el.classList.add('echoing');
    const d = player.duration > 0 && isFinite(player.duration) ? player.duration * 1000 : 4000;
    readT = setTimeout(() => { if (el) el.classList.remove('echoing'); step(); }, d + 900);
  }, true);
}
function readStop() { if (!readOn) return; readOn = false; clearTimeout(readT); player.pause(); $$('#readBox .ra.echoing').forEach(x => x.classList.remove('echoing')); markRead(); }
$('#readSel').addEventListener('change', e => { readStop(); S.settings.readS = +e.target.value; save(); renderRead(); $('#view-read').scrollTop = 0; });
$$('[data-rnav]').forEach(b => b.addEventListener('click', () => { const v = Math.min(114, Math.max(1, (S.settings.readS || 1) + +b.dataset.rnav)); readStop(); S.settings.readS = v; save(); renderRead(); $('#view-read').scrollTop = 0; }));
$('#rPlay').addEventListener('click', () => { if (readOn) readStop(); else readPlay(readCur >= readFrom && readCur <= readTo ? readCur : readFrom); });
$('#nowPlay').addEventListener('click', e => { const d = e.target.closest('[data-np]'); if (!d) return; clearTimeout(readT); readPlay(Math.max(readFrom, Math.min(readTo, readCur + +d.dataset.np))); });
$('#rExtra').addEventListener('change', e => {
  const t = e.target;
  if (t.id === 'rFrom') { readFrom = +t.value; if (readTo < readFrom) readTo = readFrom; }
  if (t.id === 'rTo') { readTo = +t.value; if (readFrom > readTo) readFrom = readTo; }
  if (t.id === 'rTimes') readTimes = +t.value;
  readCur = 0; readStop(); renderRead();
});
$('#rExtra').addEventListener('click', e => {
  if (e.target.closest('#rLoop')) { readLoop = !readLoop; markRead(); }
  if (e.target.closest('#rEcho')) { readEcho = !readEcho; markRead(); }
});
$('#rRep').addEventListener('click', () => { readRep = !readRep; markRead(); });
$('#rMask').addEventListener('click', () => { readMask = !readMask; $('#readBox').classList.toggle('masked', readMask); $$('#readBox .ra.shown').forEach(x => x.classList.remove('shown')); markRead(); });
$('#readBox').addEventListener('click', e => {
  const el = e.target.closest('.ra'); if (!el) return;
  if (readMask && !el.classList.contains('shown')) { el.classList.add('shown'); return; }
  clearTimeout(readT); readPlay(+el.dataset.ra);
});

/* ---------- Sauvegarde ---------- */
function exportData() {
  S.lastBackup = today(); save();
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
      applyData(j.data); renderSettings(); toast('Sauvegarde importée');
    } catch (e) { toast('Fichier de sauvegarde invalide'); }
  };
  r.readAsText(f);
}

/* ---------- Écran d'ouverture : duaa + hadith du jour ---------- */
const DUAS = [[20, 25, 28], [3, 8, 8], [2, 201, 201], [14, 40, 41], [7, 23, 23], [23, 118, 118], [2, 286, 286], [25, 74, 74]];
let HADITHS = [];
const dayNum = () => { const d = new Date(); return Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5) + d.getFullYear() * 366; };
async function showOpening() {
  // une seule fois par jour : à la première ouverture de la journée
  if (!S.settings.opening || S.lastOpening === today()) return;
  try { if (!HADITHS.length) HADITHS = await (await fetch('data/hadiths.json')).json(); } catch (e) {}
  const dn = dayNum(), [ds, da, db] = DUAS[dn % DUAS.length], ay = [];
  for (let a = da; a <= db; a++) ay.push(aya(ds, a));
  const h = HADITHS.length ? HADITHS[dn % HADITHS.length] : null;
  const ov = document.createElement('div'); ov.className = 'opening';
  ov.innerHTML = `<div class="op-in">
    <img src="icons/logo-mark.svg" alt="" width="54" height="61">
    <div class="op-basm">${BASMALA}</div>
    <section><h3>Duaa du jour</h3><div class="ar">${ay.map(x => x.ar + ` <span class="anum">﴿${arNum(x.a)}﴾</span>`).join(' ')}</div>
      <p class="fr">${ay.map(x => esc(x.fr)).join(' ')}</p><small>${esc(surahName(ds))} · ${ds}:${da}${db > da ? '–' + db : ''} <button class="play" data-opplay aria-label="Écouter la duaa">${ic('volume')}</button></small></section>
    ${h ? `<section><h3>Hadith du jour</h3><p class="hd">${esc(h.t)}</p><small>${h.src}, n° ${h.n}${h.g ? ' · ' + h.g : ''}${h.tr ? ' · traduction de l’appli' : ''}</small></section>` : ''}
    <button class="btn gold" data-opgo>Bismillah, on commence</button></div>`;
  document.body.appendChild(ov);
  ov.querySelector('[data-opplay]').addEventListener('click', () => playSeq(ay));
  ov.querySelector('[data-opgo]').addEventListener('click', () => { S.lastOpening = today(); save(); player.pause(); ov.classList.add('out'); setTimeout(() => ov.remove(), 300); });
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
// barre du bas toujours visible : on recale la page (après rechargement / rotation / barre d'adresse)
const fixScroll = () => { scrollTo(0, 0); document.documentElement.scrollTop = 0; document.body.scrollTop = 0; };
['load', 'pageshow', 'resize', 'orientationchange'].forEach(ev => addEventListener(ev, fixScroll));
if (window.visualViewport) visualViewport.addEventListener('resize', fixScroll);

(async () => {
  try { await loadData(); } catch (e) { $('#loading').textContent = 'Erreur de chargement des données.'; return; }
  buildPool();
  $('#loading').remove();
  renderModeBar();
  if (S.selected.length) newCard(); else showView('surahs');
  showOpening();
  setTimeout(() => {
    if (streak() > 0 && !S.days[today()] && new Date().getHours() >= 17) toast(`Ta série de ${streak()} jour${streak() > 1 ? 's' : ''} est en jeu : fais quelques cartes !`);
    else if (S.total.n > 50 && (!S.lastBackup || (Date.now() - new Date(S.lastBackup)) > 14 * 864e5)) toast('Pense à sauvegarder ta progression (Réglages → Sauvegarde)');
  }, 3500);
  setTimeout(cloudCheck, 5000);
  if ('serviceWorker' in navigator) {
    const hadCtrl = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register('sw.js').then(r => r.update()).catch(() => {});
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadCtrl && !window._reloaded) { window._reloaded = 1; location.reload(); } });
  }
})();
