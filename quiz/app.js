/**
 * HONMEN ZENWARE — app.js
 * Quiz engine + accessibility + language system
 * Requires: questions.js loaded before this file
 */

'use strict';

// ═══════════════════════════════════════════════════════════════
// LOCALIZATION STRINGS
// ═══════════════════════════════════════════════════════════════
const STRINGS = {
  es: {
    t: 'Verdadero', f: 'Falso',
    qOf: 'Pregunta {n} de {t}',
    goal: 'Meta: <strong>45 correctas</strong>',
    correct: '¡Correcto!', incorrect: 'Incorrecto',
    answer: 'Respuesta correcta',
    next: 'Continuar →', results: 'Ver Resultados →',
    pass: '✓ APROBADO — {s}/50 ({p}%). ¡Superaste el 90% requerido!',
    fail: '✗ NO APROBADO — {s}/50 ({p}%). Necesitas 45/50. ¡Sigue estudiando!',
    restart: '↺ Nuevo Examen',
    review: 'REPASO — INCORRECTAS ({n})',
    perfect: '✓ ¡PERFECTO! SIN ERRORES.',
    stC: 'Correctas', stW: 'Incorrectas', stP: 'Puntaje',
    scSub: 'de 50 · Apruebas con 45/50 (90%)',
    eyebrow: '外免切替 知識確認 · Examen Completo',
    cultureHd: 'En Japón...', termHd: 'Término clave',
    theme: 'Tema de color', font: 'Tamaño de texto',
    visual: 'Filtros visuales', mode: 'Modo de estudio',
    quickName: '⚡ Modo Rápido',
    quickDesc: 'Una mano, sin distracciones, respuesta rápida',
    msgs: {
      start:    '¡Vamos! 🎯',
      halfway:  '¡Superaste la mitad! 🚀',
      pass3:    '¡Solo {n} más para aprobar! 🎯',
      great:    'Vas muy bien 💪',
      perfect:  '¡Perfecto hasta ahora! ✨',
      passed:   '¡Ya aprobaste! Sigue 🌟',
    },
  },
  en: {
    t: 'True', f: 'False',
    qOf: 'Question {n} of {t}',
    goal: 'Goal: <strong>45 correct</strong>',
    correct: 'Correct!', incorrect: 'Incorrect',
    answer: 'Correct answer',
    next: 'Continue →', results: 'See Results →',
    pass: '✓ PASSED — {s}/50 ({p}%). You met the 90% requirement!',
    fail: '✗ NOT PASSED — {s}/50 ({p}%). Need 45/50. Keep studying!',
    restart: '↺ New Exam',
    review: 'REVIEW — INCORRECT ({n})',
    perfect: '✓ PERFECT SCORE — NO MISTAKES!',
    stC: 'Correct', stW: 'Wrong', stP: 'Score',
    scSub: 'out of 50 · Pass = 45/50 (90%)',
    eyebrow: '外免切替 知識確認 · Exam Complete',
    cultureHd: 'In Japan...', termHd: 'Key term',
    theme: 'Color theme', font: 'Text size',
    visual: 'Visual filters', mode: 'Study mode',
    quickName: '⚡ Quick Mode',
    quickDesc: 'One hand, no distractions, fast answers',
    msgs: {
      start:    "Let's go 🎯",
      halfway:  'Past halfway! 🚀',
      pass3:    'Only {n} more to pass! 🎯',
      great:    "You're doing great 💪",
      perfect:  'Perfect so far! ✨',
      passed:   "You've already passed! 🌟",
    },
  },
  jp: {
    t: '正しい', f: '間違い',
    qOf: '問題 {n} / {t}',
    goal: '目標: <strong>45問正解</strong>',
    correct: '正解！', incorrect: '不正解',
    answer: '正しい答え',
    next: '次へ →', results: '結果を見る →',
    pass: '✓ 合格 — {s}/50問（{p}%）。合格基準90%達成！',
    fail: '✗ 不合格 — {s}/50問（{p}%）。45問以上で合格。引き続き学習を！',
    restart: '↺ 新しいテスト',
    review: '復習 — 間違えた問題（{n}）',
    perfect: '✓ 完璧！ミスなし！',
    stC: '正解', stW: '不正解', stP: 'スコア',
    scSub: '50問中 · 合格は45/50（90%）',
    eyebrow: '外免切替 知識確認 · 試験完了',
    cultureHd: '日本では...', termHd: '重要な用語',
    theme: 'テーマ', font: '文字サイズ',
    visual: '視覚フィルター', mode: '学習モード',
    quickName: '⚡ クイックモード',
    quickDesc: '片手操作、集中型、高速回答',
    msgs: {
      start:    'さあ始めよう 🎯',
      halfway:  '半分超えた 🚀',
      pass3:    'あと{n}問で合格 🎯',
      great:    'よくできてます 💪',
      perfect:  '完璧 ✨',
      passed:   '合格ライン突破！🌟',
    },
  },
};

// ═══════════════════════════════════════════════════════════════
// APPLICATION STATE
// ═══════════════════════════════════════════════════════════════
const state = {
  lang:       'es',
  questions:  [],
  current:    0,
  score:      0,
  history:    [],
  answered:   false,
  examSize:   50,
};

// ═══════════════════════════════════════════════════════════════
// DOM REFERENCES
// ═══════════════════════════════════════════════════════════════
const $ = id => document.getElementById(id);

const DOM = {
  // header
  qCur:       () => $('qCur'),
  qTot:       () => $('qTot'),
  lOk:        () => $('lOk'),
  lNo:        () => $('lNo'),
  // lang buttons
  bEN:        () => $('bEN'),
  bES:        () => $('bES'),
  bJP:        () => $('bJP'),
  // lang blocks
  bkEN:       () => $('bkEN'),
  bkES:       () => $('bkES'),
  bkJP:       () => $('bkJP'),
  // labels
  lblT:       () => $('lblT'),
  lblF:       () => $('lblF'),
  obj:        () => $('obj'),
  // progress
  progLbl:    () => $('progLbl'),
  progMsg:    () => $('progMsg'),
  prog:       () => $('prog'),
  // card
  card:       () => $('card'),
  catBadge:   () => $('catBadge'),
  srcTag:     () => $('srcTag'),
  qEN:        () => $('qEN'),
  qES:        () => $('qES'),
  qJPk:       () => $('qJPk'),
  qJPh:       () => $('qJPh'),
  qImgWrap:   () => $('qImgWrap'),
  qImg:       () => $('qImg'),
  // answer buttons
  bT:         () => $('bT'),
  bF:         () => $('bF'),
  // feedback
  fb:         () => $('fb'),
  fbIcon:     () => $('fbIcon'),
  fbVerdict:  () => $('fbVerdict'),
  fbPill:     () => $('fbPill'),
  fbExp:      () => $('fbExp'),
  fbCulture:  () => $('fbCulture'),
  fbCultureHd:() => $('fbCultureHd'),
  fbCultureTxt:() => $('fbCultureTxt'),
  fbJpterm:   () => $('fbJpterm'),
  fbtermHd:   () => $('fbtermHd'),
  fbtermK:    () => $('fbtermKanji'),
  fbtermR:    () => $('fbtermRomaji'),
  fbtermM:    () => $('fbtermMeaning'),
  btnNext:    () => $('btnNext'),
  // score
  scoreWrap:  () => $('scoreWrap'),
  scNum:      () => $('scNum'),
  scSub:      () => $('scSub'),
  stC:        () => $('stC'),
  stW:        () => $('stW'),
  stP:        () => $('stP'),
  stCL:       () => $('stCL'),
  stWL:       () => $('stWL'),
  stPL:       () => $('stPL'),
  verdict:    () => $('verdict'),
  btnRestart: () => $('btnRestart'),
  rev:        () => $('rev'),
  // drawer
  overlay:    () => $('overlay'),
  tAuto:      () => $('tAuto'),
  tLight:     () => $('tLight'),
  tDark:      () => $('tDark'),
  fSm:        () => $('fSm'),
  fMd:        () => $('fMd'),
  fLg:        () => $('fLg'),
  grayBtn:    () => $('grayBtn'),
  contBtn:    () => $('contBtn'),
  dlTheme:    () => $('dlTheme'),
  dlFont:     () => $('dlFont'),
  dlVisual:   () => $('dlVisual'),
  dlMode:     () => $('dlMode'),
  dlQuickName:() => $('dlQuickName'),
  dlQuickDesc:() => $('dlQuickDesc'),
};

// ═══════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fmt(str, vars) {
  return Object.entries(vars).reduce(
    (s, [k, v]) => s.replaceAll(`{${k}}`, v), str
  );
}

// ═══════════════════════════════════════════════════════════════
// ACCESSIBILITY — THEME, SIZE, FILTERS
// ═══════════════════════════════════════════════════════════════
function setTheme(mode) {
  const html = document.documentElement;
  const actual = mode === 'auto'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : mode;

  html.dataset.theme     = actual;
  html.dataset.themeMode = mode;

  ['tAuto', 'tLight', 'tDark'].forEach(id => DOM[id]().classList.remove('on'));
  const btnId = mode === 'auto' ? 'tAuto' : mode === 'light' ? 'tLight' : 'tDark';
  DOM[btnId]().classList.add('on');

  localStorage.setItem('theme', mode);
}

function setSize(size) {
  document.documentElement.dataset.size = size;
  ['fSm', 'fMd', 'fLg'].forEach(id => DOM[id]().classList.remove('on'));
  const btnId = size === 'sm' ? 'fSm' : size === 'lg' ? 'fLg' : 'fMd';
  DOM[btnId]().classList.add('on');
  localStorage.setItem('fsize', size);
}

function toggleGray() {
  const on = document.documentElement.dataset.gray === 'on';
  document.documentElement.dataset.gray = on ? 'off' : 'on';
  DOM.grayBtn().classList.toggle('on', !on);
  localStorage.setItem('gray', String(!on));
}

function toggleContrast() {
  const on = document.documentElement.dataset.contrast === 'high';
  document.documentElement.dataset.contrast = on ? 'normal' : 'high';
  DOM.contBtn().classList.toggle('on', !on);
  localStorage.setItem('contrast', String(!on));
}

function toggleQuick() {
  const on = document.documentElement.dataset.quick === 'on';
  document.documentElement.dataset.quick = on ? 'off' : 'on';
  localStorage.setItem('quick', String(!on));
}

function openDrawer()  { DOM.overlay().classList.add('on'); }
function closeDrawer(e) {
  if (e.target === DOM.overlay()) DOM.overlay().classList.remove('on');
}

function initPrefs() {
  setTheme(localStorage.getItem('theme')    || 'dark');
  setSize (localStorage.getItem('fsize')    || 'md');

  if (localStorage.getItem('gray')     === 'true') {
    document.documentElement.dataset.gray = 'on';
    DOM.grayBtn().classList.add('on');
  }
  if (localStorage.getItem('contrast') === 'true') {
    document.documentElement.dataset.contrast = 'high';
    DOM.contBtn().classList.add('on');
  }
  if (localStorage.getItem('quick')    === 'true') {
    document.documentElement.dataset.quick = 'on';
  }
}

// React to OS-level theme changes
window.matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', () => {
    if ((localStorage.getItem('theme') || 'auto') === 'auto') setTheme('auto');
  });

// ═══════════════════════════════════════════════════════════════
// LANGUAGE
// ═══════════════════════════════════════════════════════════════
function getCatLabel(q) {
  return state.lang === 'en' ? q.catEN : state.lang === 'jp' ? q.catJP : q.cat;
}

function setLang(lang) {
  state.lang = lang;
  const s = STRINGS[lang];

  // toggle lang buttons + blocks
  ['EN', 'ES', 'JP'].forEach(code => {
    DOM[`b${code}`]().classList.toggle('on', code === lang.toUpperCase());
    DOM[`bk${code}`]().classList.toggle('on', code === lang.toUpperCase());
  });

  // update static labels
  DOM.lblT().textContent    = s.t;
  DOM.lblF().textContent    = s.f;
  DOM.obj().innerHTML       = s.goal;
  DOM.dlTheme().textContent   = s.theme;
  DOM.dlFont().textContent    = s.font;
  DOM.dlVisual().textContent  = s.visual;
  DOM.dlMode().textContent    = s.mode;
  DOM.dlQuickName().textContent = s.quickName;
  DOM.dlQuickDesc().textContent = s.quickDesc;
  DOM.fbCultureHd().textContent = s.cultureHd;
  DOM.fbtermHd().textContent  = s.termHd;

  // update next button if visible
  const nb = DOM.btnNext();
  if (nb.classList.contains('on')) {
    nb.textContent = state.current + 1 >= state.questions.length
      ? s.results : s.next;
  }

  updateProgressLabels();
}

// ═══════════════════════════════════════════════════════════════
// ENCOURAGEMENT ENGINE
// ═══════════════════════════════════════════════════════════════
function getEncouragement() {
  const { current: cur, score, questions, lang } = state;
  const s     = STRINGS[lang].msgs;
  const needed    = 45 - score;
  const remaining = questions.length - cur;

  if (score >= 45)                              return s.passed;
  if (cur   === 0)                              return s.start;
  if (needed <= 3 && remaining >= needed)       return fmt(s.pass3, { n: needed });
  if (cur   >= Math.floor(questions.length / 2)) return s.halfway;
  if (score > 0 && score === cur)               return s.perfect;
  if (score >= cur * 0.7)                       return s.great;
  return s.start;
}

function updateProgressLabels() {
  if (!state.questions.length) return;
  const s = STRINGS[state.lang];
  DOM.progLbl().textContent = fmt(s.qOf, {
    n: state.current + 1,
    t: state.questions.length,
  });
  DOM.progMsg().textContent = getEncouragement();
}

// ═══════════════════════════════════════════════════════════════
// QUIZ — INIT & RENDER
// ═══════════════════════════════════════════════════════════════
function init() {
  state.questions = shuffle(QUESTIONS).slice(0, state.examSize);
  state.current   = 0;
  state.score     = 0;
  state.history   = [];
  state.answered  = false;

  DOM.qTot().textContent  = state.questions.length;
  DOM.lOk().textContent   = '0';
  DOM.lNo().textContent   = '0';

  DOM.scoreWrap().classList.remove('on');
  DOM.card().style.display = '';
  DOM.prog().style.width   = '0%';

  setLang(state.lang);
  renderQuestion();
}

function renderQuestion() {
  state.answered = false;
  const q = state.questions[state.current];

  // header counter
  DOM.qCur().textContent = state.current + 1;

  // category
  const badge = DOM.catBadge();
  badge.textContent = getCatLabel(q);
  badge.className   = `cat-badge${q.catColor ? ` cat-${q.catColor}` : ''}`;
  DOM.srcTag().textContent = q.src;

  // progress bar
  const pct = Math.round((state.current / state.questions.length) * 100);
  DOM.prog().style.width = `${pct}%`;

  // question text
  DOM.qEN().textContent  = q.en;
  DOM.qES().textContent  = q.es;
  DOM.qJPk().textContent = q.jpk;
  DOM.qJPh().textContent = q.jph;

  // figure image
  const imgWrap = DOM.qImgWrap();
  if (q.imgUrl) {
    DOM.qImg().src = q.imgUrl;
    imgWrap.style.display = '';
  } else {
    imgWrap.style.display = 'none';
  }

  // reset answer buttons
  const t = DOM.bT(), f = DOM.bF();
  t.className = 'tf-btn';
  f.className = 'tf-btn';
  t.disabled  = false;
  f.disabled  = false;

  // hide feedback
  DOM.fb().className       = 'feedback';
  DOM.btnNext().classList.remove('on');
  DOM.fbCulture().style.display = 'none';
  DOM.fbJpterm().style.display  = 'none';
  DOM.fbPill().style.display    = 'none';

  updateProgressLabels();
}

// ═══════════════════════════════════════════════════════════════
// QUIZ — ANSWER
// ═══════════════════════════════════════════════════════════════
function answer(val) {
  if (state.answered) return;
  state.answered = true;

  const q      = state.questions[state.current];
  const isOk   = (val === q.correct);
  const lang   = state.lang;
  const s      = STRINGS[lang];
  const quick  = document.documentElement.dataset.quick === 'on';

  if (isOk) state.score++;

  // live counters
  const wrongCount = state.history.filter(h => !h.ok).length + (isOk ? 0 : 1);
  DOM.lOk().textContent = state.score;
  DOM.lNo().textContent = wrongCount;

  // button states
  const t = DOM.bT(), f = DOM.bF();
  t.disabled = true;
  f.disabled = true;
  const chosen  = val ? t : f;
  const correct = q.correct ? t : f;
  if (isOk) { chosen.classList.add('s-ok'); }
  else       { chosen.classList.add('s-no'); correct.classList.add('hi'); }

  // pick explanation by language
  const exp = lang === 'en' ? q.expEN
            : lang === 'jp' ? q.expJP
            : q.expES;

  const correctLabel = q.correct
    ? (lang === 'en' ? 'TRUE ✓' : lang === 'jp' ? '正しい ✓' : 'VERDADERO ✓')
    : (lang === 'en' ? 'FALSE ✗' : lang === 'jp' ? '間違い ✗' : 'FALSO ✗');

  // feedback block
  const fb = DOM.fb();
  fb.className = `feedback on ${isOk ? 'f-ok' : 'f-no'}`;

  DOM.fbIcon().textContent    = isOk ? '✓' : '✗';
  DOM.fbVerdict().textContent = isOk ? s.correct : s.incorrect;

  if (!isOk) {
    const pill = DOM.fbPill();
    pill.textContent   = `${s.answer}: ${correctLabel}`;
    pill.style.display = 'inline-block';
  }

  DOM.fbExp().textContent = exp;

  // culture note (Spanish only, not in quick mode)
  if (!quick && lang === 'es' && q.culture) {
    DOM.fbCultureTxt().textContent = q.culture;
    DOM.fbCulture().style.display  = 'block';
  }

  // JP term (not in quick mode)
  if (!quick && q.jpterm) {
    DOM.fbtermK().textContent = q.jpterm;
    DOM.fbtermR().textContent = `(${q.romaji})`;
    DOM.fbtermM().textContent = q.termMeaning;
    DOM.fbJpterm().style.display = 'block';
  }

  // record in history
  state.history.push({ q, val, ok: isOk });

  // show next button
  const nb = DOM.btnNext();
  nb.textContent = state.current + 1 >= state.questions.length
    ? s.results : s.next;
  nb.classList.add('on');

  // update encouragement
  DOM.progMsg().textContent = getEncouragement();

  // scroll feedback into view on mobile
  setTimeout(() => {
    fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 80);
}

// ═══════════════════════════════════════════════════════════════
// QUIZ — NEXT QUESTION
// ═══════════════════════════════════════════════════════════════
function next() {
  state.current++;
  if (state.current >= state.questions.length) {
    showScore();
    return;
  }

  // re-trigger animation
  const card = DOM.card();
  card.style.animation = 'none';
  requestAnimationFrame(() => {
    card.style.animation = 'rise .3s cubic-bezier(.4,0,.2,1)';
  });

  renderQuestion();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ═══════════════════════════════════════════════════════════════
// QUIZ — SCORE SCREEN
// ═══════════════════════════════════════════════════════════════
function showScore() {
  DOM.card().style.display = 'none';
  DOM.prog().style.width   = '100%';

  const sw = DOM.scoreWrap();
  sw.classList.add('on');

  const { score, questions } = state;
  const lang  = state.lang;
  const s     = STRINGS[lang];
  const wrong = questions.length - score;
  const pct   = Math.round((score / questions.length) * 100);

  DOM.scNum().textContent   = `${score}/50`;
  DOM.scSub().textContent   = s.scSub;
  DOM.stC().textContent     = score;
  DOM.stW().textContent     = wrong;
  DOM.stP().textContent     = `${pct}%`;
  DOM.stCL().textContent    = s.stC;
  DOM.stWL().textContent    = s.stW;
  DOM.stPL().textContent    = s.stP;
  DOM.btnRestart().textContent = s.restart;

  const verdict = DOM.verdict();
  const tpl     = score >= 45 ? s.pass : s.fail;
  verdict.className   = `verdict ${score >= 45 ? 'v-pass' : 'v-fail'}`;
  verdict.textContent = fmt(tpl, { s: score, p: pct });

  buildReview();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function buildReview() {
  const { history, lang } = state;
  const s       = STRINGS[lang];
  const wrongH  = history.filter(h => !h.ok);
  const rw      = DOM.rev();
  rw.innerHTML  = '';

  if (!wrongH.length) {
    rw.innerHTML = `<div class="rev-hd" style="color:var(--ok)">✓ ${s.perfect}</div>`;
    return;
  }

  rw.innerHTML = `<div class="rev-hd">${fmt(s.review, { n: wrongH.length })}</div>`;

  wrongH.forEach(({ q }) => {
    const text = lang === 'jp' ? q.jpk : lang === 'en' ? q.en : q.es;
    const ans  = q.correct
      ? (lang === 'en' ? 'TRUE' : lang === 'jp' ? '正しい' : 'VERDADERO')
      : (lang === 'en' ? 'FALSE' : lang === 'jp' ? '間違い' : 'FALSO');
    const label = lang === 'en' ? 'Answer' : lang === 'jp' ? '答え' : 'Respuesta';

    const div = document.createElement('div');
    div.className = 'rev-item';
    div.innerHTML = `
      <div class="rev-q">${text}</div>
      <div class="rev-a">
        ✓ ${label}: ${ans}
        <span class="rev-src">${q.src}</span>
      </div>`;
    rw.appendChild(div);
  });
}

// ═══════════════════════════════════════════════════════════════
// RESTART
// ═══════════════════════════════════════════════════════════════
function restart() {
  DOM.rev().innerHTML = '';
  init();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ═══════════════════════════════════════════════════════════════
// BOOT
// ═══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  initPrefs();
  init();
});
