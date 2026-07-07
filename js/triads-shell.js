/************************************************************
 * FretNerd
 * Copyright (c) 2026 Scott Farris / Tilted Iron
 * Proprietary and confidential. Unauthorized use prohibited.
 ************************************************************/

/* ═══════════════════════════════════════════════════
   MODULE 4: TRIAD POSITIONS — Shell, Study & Canvas
═══════════════════════════════════════════════════ */

var triadsMode = 'study'; /* 'study' | 'practice' */

function launchTriads() {
  currentModule         = 'triads';
  triadsStage           = 1;
  triadsCompletedStages = [];
  TRIAD_STUDY_ROOT      = 0;
  TRIAD_STUDY_QUALITY   = 'major';
  TRIAD_STUDY_INVERSION = 0;
  TRIAD_STUDY_SET       = triadsStageSetMap()[1];
  triadsMode            = 'study';

  el('app').classList.add('simple-module');
  hideHome();
  el('mode-tabs').style.display        = 'none';
  el('study-content').style.display    = 'none';
  el('practice-content').style.display = 'none';
  el('stats-row').style.display        = 'none';
  el('pause-btn').style.display        = 'none';
  el('stage-bar').style.display         = 'none'; /* stage nav moved into study card */
  el('triads-filter-btn').style.display = 'flex';
  el('triads-help-btn').style.display   = 'flex';
  el('fundamentals-content').style.display = 'flex';
  setText('topbar-module-name', 'Triad Positions');
  triadsRenderStageBar();
  triadsRenderContent();

  /* Show help overlay on first visit */
  if (!localStorage.getItem('triads_toured')) {
    setTimeout(function() { showTriadsHelp(); }, 400);
  }
}

function exitTriads() {
  el('stage-bar').style.display             = 'none';
  el('triads-filter-btn').style.display    = 'none';
  el('triads-help-btn').style.display      = 'none';
  el('triads-stats').style.display         = 'none';
  el('fundamentals-content').style.display = 'none';
  el('mode-tabs').style.display            = '';
  el('stats-row').style.display            = '';
  el('app').classList.remove('simple-module');
  currentModule = null;
}

/* ── Stage bar ──────────────────────────────────── */

function triadsRenderStageBar() {
  var bar = el('stage-bar');
  if (!bar) return;
  var html = '';
  var stages = triadsStageList();
  for (var i = 0; i < stages.length; i++) {
    var s      = stages[i];
    var isDone = triadsCompletedStages.indexOf(s.id) !== -1;
    var isAct  = s.id === triadsStage;
    var cls    = isDone ? 'done' : isAct ? 'active' : 'locked';
    var sym    = isDone ? '✓' : s.id;
    html += '<button class="stage-dot-item ' + cls + '" onclick="goTriadsStage(' + s.id + ')">'
          + '<div class="stage-dot ' + cls + '">' + sym + '</div>'
          + '<div class="stage-label">' + s.label + '</div>'
          + '</button>';
  }
  bar.innerHTML = html;
}

function goTriadsStage(id) {
  triadsStage           = id;
  TRIAD_STUDY_SET       = triadsStageSetMap()[id];
  TRIAD_STUDY_INVERSION = 0;
  triadsMode            = 'study';
  triadsRenderStageBar();
  triadsRenderContent();
}

/* ── Mode routing ───────────────────────────────── */

function triadsRenderContent() {
  var c = el('fundamentals-content');
  if (!c) return;
  if (triadsMode === 'study') {
    c.innerHTML =
      triadsModeTabs() +
      '<div id="triads-interactive">' + triadsInteractiveHTML() + '</div>';
    triadsDrawCanvas(false);
    triadsUpdateStats();
  } else {
    triadsRenderPracticeQ();
  }
}

function triadsShowMode(mode) {
  triadsMode = mode;
  if (mode === 'practice') {
    TRIAD_QUIZ.correct  = 0;
    TRIAD_QUIZ.total    = 0;
    TRIAD_QUIZ.streak   = 0;
    TRIAD_QUIZ.currentQ = null;
    TRIAD_QUIZ.answered = false;
  }
  triadsRenderContent();
}

/* Study | Practice tab row */
function triadsModeTabs() {
  var sAct = triadsMode === 'study'    ? ' active' : '';
  var pAct = triadsMode === 'practice' ? ' active' : '';
  return '<div style="display:flex;gap:6px;padding:2px 0 6px;">' +
    '<button class="fund-sig-tab-btn' + sAct + '" onclick="triadsShowMode(\'study\')" ' +
            'style="flex:1;font-size:14px;padding:9px 6px;">Study</button>' +
    '<button class="fund-sig-tab-btn' + pAct + '" onclick="triadsShowMode(\'practice\')" ' +
            'style="flex:1;font-size:14px;padding:9px 6px;">Practice</button>' +
  '</div>';
}

/* ── Practice settings bottom sheet ─────────────── */

function triadsShowPracticeSettings() {
  var overlay = document.getElementById('triads-prac-settings');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'triads-prac-settings';
    overlay.style.cssText = 'display:none;position:fixed;inset:0;z-index:200;background:rgba(0,0,0,0.5);align-items:center;justify-content:center;padding:16px;';
    overlay.onclick = function(e) { if (e.target === overlay) triadsClosePracticeSettings(); };
    document.body.appendChild(overlay);
  }
  overlay.style.display = 'flex';
  triadsDrawPracticeSettings();
}

function triadsClosePracticeSettings() {
  var overlay = document.getElementById('triads-prac-settings');
  if (overlay) overlay.style.display = 'none';
  triadsRenderContent(); /* restart question with updated filters */
}

function triadsDrawPracticeSettings() {
  var overlay = document.getElementById('triads-prac-settings');
  if (!overlay) return;
  var f    = TRIAD_PRACTICE_FILTERS;
  var sets = triadsStringSets();

  function chip(label, active, onclick) {
    var bg  = active ? 'var(--teal)'   : 'var(--bg)';
    var col = active ? '#fff'          : 'var(--text2)';
    var bd  = active ? 'var(--teal)'   : 'var(--border)';
    return '<button onclick="' + onclick + '" style="' +
      'padding:7px 13px;border-radius:20px;border:1px solid ' + bd + ';' +
      'background:' + bg + ';color:' + col + ';font-size:13px;font-weight:600;' +
      'cursor:pointer;font-family:var(--font);-webkit-appearance:none;' +
      '-webkit-tap-highlight-color:transparent;">' + label + '</button>';
  }

  function section(title, chips) {
    return '<div style="margin-bottom:18px;">' +
      '<div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:var(--text3);margin-bottom:8px;">' + title + '</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:6px;">' + chips + '</div>' +
    '</div>';
  }

  var setChips = sets.map(function(ss, i) {
    var active = f.sets === null || f.sets.indexOf(i) !== -1;
    return chip(ss.label + ' · ' + ss.names, active, 'triadsPracticeToggleSet(' + i + ')');
  }).join('');

  var invChips = [0, 1, 2].map(function(inv) {
    var labels = ['Root pos.', '1st inversion', '2nd inversion'];
    var active = f.inversions.indexOf(inv) !== -1;
    return chip(labels[inv], active, 'triadsPracticeToggleInv(' + inv + ')');
  }).join('');

  var qualChips = ['major', 'minor'].map(function(q) {
    var active = f.qualities.indexOf(q) !== -1;
    return chip(q.charAt(0).toUpperCase() + q.slice(1), active, 'triadsPracticeToggleQual(\'' + q + '\')');
  }).join('');

  overlay.innerHTML =
    '<div style="background:var(--surface);border-radius:16px;width:100%;max-width:400px;padding:20px 16px 24px;">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;">' +
        '<div style="font-size:16px;font-weight:800;color:var(--text);">Practice Settings</div>' +
        '<button class="icon-btn" onclick="triadsClosePracticeSettings()" aria-label="Close">' +
          '<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 5l10 10M15 5L5 15"/></svg>' +
        '</button>' +
      '</div>' +
      section('String Sets', setChips) +
      section('Inversions', invChips) +
      section('Quality', qualChips) +
      '<button class="fund-cta-btn" style="margin:4px 0 0;" onclick="triadsClosePracticeSettings()">Done</button>' +
    '</div>';
}

function triadsPracticeToggleSet(idx) {
  var f     = TRIAD_PRACTICE_FILTERS;
  var total = triadsStringSets().length;
  if (f.sets === null) f.sets = triadsStringSets().map(function(_, i) { return i; });
  var pos = f.sets.indexOf(idx);
  if (pos !== -1) {
    if (f.sets.length > 1) f.sets.splice(pos, 1);
  } else {
    f.sets.push(idx);
    f.sets.sort(function(a, b) { return a - b; });
  }
  if (f.sets.length === total) f.sets = null;
  triadsDrawPracticeSettings();
}

function triadsPracticeToggleInv(inv) {
  var f   = TRIAD_PRACTICE_FILTERS;
  var pos = f.inversions.indexOf(inv);
  if (pos !== -1) {
    if (f.inversions.length > 1) f.inversions.splice(pos, 1);
  } else {
    f.inversions.push(inv);
    f.inversions.sort(function(a, b) { return a - b; });
  }
  triadsDrawPracticeSettings();
}

function triadsPracticeToggleQual(q) {
  var f   = TRIAD_PRACTICE_FILTERS;
  var pos = f.qualities.indexOf(q);
  if (pos !== -1) {
    if (f.qualities.length > 1) f.qualities.splice(pos, 1);
  } else {
    f.qualities.push(q);
  }
  triadsDrawPracticeSettings();
}

/* ── Study: single compact card ─────────────────── */

function triadsInteractiveHTML() {
  var SS = triadsStringSets()[TRIAD_STUDY_SET];

  var rootBtns = '';
  for (var i = 0; i < 12; i++) {
    rootBtns += '<button class="fund-key-btn' + (i === TRIAD_STUDY_ROOT ? ' active' : '') +
                '" onclick="triadsSetRoot(' + i + ')" style="flex-shrink:0;min-width:28px;padding:5px 4px;font-size:13px;">' +
                TRIAD_ROOT_NAMES[i] + '</button>';
  }

  var invTabs = '';
  for (var v = 0; v < 3; v++) {
    invTabs += '<button class="fund-sig-tab-btn' + (v === TRIAD_STUDY_INVERSION ? ' active' : '') +
               '" style="flex:1;padding:7px 2px;font-size:12px;" onclick="triadsSetInversion(' + v + ')">' +
               TRIAD_INV_SHORT[v] + ' pos</button>';
  }

  var stageTabs = '';
  var stages = triadsStageList();
  for (var j = 0; j < stages.length; j++) {
    var s = stages[j];
    stageTabs += '<button class="fund-sig-tab-btn' + (s.id === triadsStage ? ' active' : '') +
                 '" style="flex:1;padding:7px 2px;font-size:12px;" onclick="goTriadsStage(' + s.id + ')">' +
                 s.label + '</button>';
  }

  var qualMaj = TRIAD_STUDY_QUALITY === 'major' ? ' active' : '';
  var qualMin = TRIAD_STUDY_QUALITY === 'minor' ? ' active' : '';
  var lbl     = 'font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--text3);white-space:nowrap;';
  var hr      = '<div style="border-top:1px solid var(--border);margin:5px -12px;"></div>';

  return (
    '<div class="fund-lesson-card" style="padding:10px 12px;">' +
      '<div class="fund-eyebrow" style="margin-bottom:6px;">Stage ' + triadsStage + ' · ' + SS.names + '</div>' +

      /* Root selector — single scrollable row */
      '<div style="display:flex;gap:4px;overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:2px;margin-bottom:6px;">' + rootBtns + '</div>' +

      hr +

      '<canvas id="triads-canvas" style="display:block;width:100%;margin-bottom:6px;"></canvas>' +

      /* Legend + bass note label */
      '<div style="display:flex;align-items:center;gap:10px;">' +
        '<div style="display:flex;align-items:center;gap:3px;"><div style="width:9px;height:9px;border-radius:50%;background:' + TRIAD_COLOR_ROOT  + ';"></div><span style="font-size:11px;color:var(--text2);">Root</span></div>' +
        '<div style="display:flex;align-items:center;gap:3px;"><div style="width:9px;height:9px;border-radius:50%;background:' + TRIAD_COLOR_THIRD + ';"></div><span style="font-size:11px;color:var(--text2);">3rd</span></div>' +
        '<div style="display:flex;align-items:center;gap:3px;"><div style="width:9px;height:9px;border-radius:50%;background:' + TRIAD_COLOR_FIFTH + ';"></div><span style="font-size:11px;color:var(--text2);">5th</span></div>' +
        '<span style="margin-left:auto;font-size:11px;color:var(--text3);">' + TRIAD_INV_BASS[TRIAD_STUDY_INVERSION] + ' on ' + SS.names + '</span>' +
      '</div>' +

      hr +

      /* Inversion, Quality, Stage — grid keeps all button groups left-aligned */
      '<div style="display:grid;grid-template-columns:auto 1fr;gap:5px 8px;align-items:center;">' +
        '<span style="' + lbl + '">Inversion</span>' +
        '<div style="display:flex;gap:4px;">' + invTabs + '</div>' +
        '<span style="' + lbl + '">Quality</span>' +
        '<div style="display:flex;gap:4px;">' +
          '<button class="fund-sig-tab-btn' + qualMaj + '" style="flex:1;padding:7px 2px;font-size:12px;" onclick="triadsSetQuality(\'major\')">Major</button>' +
          '<button class="fund-sig-tab-btn' + qualMin + '" style="flex:1;padding:7px 2px;font-size:12px;" onclick="triadsSetQuality(\'minor\')">Minor</button>' +
        '</div>' +
        '<span style="' + lbl + '">Stage</span>' +
        '<div style="display:flex;gap:4px;">' + stageTabs + '</div>' +
      '</div>' +
    '</div>'
  );
}

/* ── Canvas drawing ─────────────────────────────── */

function triadsDrawCanvas(hideDotLabels) {
  var canvas = el('triads-canvas');
  if (!canvas) return;
  var shape = triadsGetShape(TRIAD_STUDY_ROOT, TRIAD_STUDY_QUALITY, TRIAD_STUDY_INVERSION, TRIAD_STUDY_SET);
  triadsDrawShape(canvas, shape, hideDotLabels);
}

function triadsDrawPracticeCanvas(shape) {
  var canvas = el('triads-canvas');
  if (!canvas) return;
  triadsDrawShape(canvas, shape, true, true); /* hide labels AND role colors */
}

function triadsRevealAnswerCanvas(shape) {
  var canvas = el('triads-canvas');
  if (!canvas) return;
  triadsDrawShape(canvas, shape, false, false); /* show colors and role labels */
}

function triadsDrawShape(canvas, shape, hideDotLabels, hideRoleColors) {
  var dark = isDark();
  var dpr  = window.devicePixelRatio || 1;
  var n    = triadsNumStrings(); /* 4 for bass, 6 for guitar */

  var cW = (canvas.parentElement ? canvas.parentElement.clientWidth : 0) - 24;
  if (cW <= 10) cW = window.innerWidth - 48;
  cW = Math.max(180, cW);

  var allFrets = shape.frets;
  var minF     = Math.min.apply(null, allFrets);
  var maxF     = Math.max.apply(null, allFrets);
  var span     = maxF - minF + 1;
  var numFrets = Math.max(span, 5);
  var loW      = Math.max(0, minF - Math.floor((numFrets - span) / 2) - 1);

  var zoneAspect = NECK_ASPECT * (numFrets / 21) * 1.8;
  var cH         = Math.max(70, Math.floor(cW / zoneAspect));

  canvas.width        = Math.round(cW * dpr);
  canvas.height       = Math.round(cH * dpr);
  canvas.style.width  = cW + 'px';
  canvas.style.height = cH + 'px';

  var ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cW, cH);

  /* Symmetric left/right padding so board is horizontally centered.
     String labels ("1"–"6") hang left from PL - 4 and are only ~6px wide. */
  var PL = Math.round(cW * 0.06);
  var PR = PL;
  var PT = Math.round(cH * 0.10);
  var PB = Math.round(cH * 0.24);

  /* zoneMarginFrac reserves fret-label space when loW > 0 inside the board
     width, so the board never overflows the right edge. */
  var zoneMarginFrac = loW > 0 ? 0.35 : 0;
  var fw = (cW - PL - PR) / (numFrets + zoneMarginFrac);
  var zoneMargin = Math.round(fw * zoneMarginFrac);

  var sh = (cH - PT - PB) / (n - 1);

  /* Board background */
  ctx.fillStyle = dark ? '#1e1400' : '#f9f4e8';
  ctx.fillRect(PL, PT, zoneMargin + numFrets * fw, (n - 1) * sh);

  /* Nut or zone-start marker */
  if (loW === 0) {
    ctx.strokeStyle = dark ? '#bbb' : '#333';
    ctx.lineWidth   = Math.max(3, fw * 0.12);
    ctx.beginPath(); ctx.moveTo(PL, PT); ctx.lineTo(PL, PT + (n-1)*sh); ctx.stroke();
  }

  /* Fret lines */
  var fStart = loW === 0 ? 1 : 0;
  for (var f = fStart; f <= numFrets; f++) {
    ctx.strokeStyle = dark ? '#3a3a3a' : '#ddd';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(PL + zoneMargin + f * fw, PT);
    ctx.lineTo(PL + zoneMargin + f * fw, PT + (n-1)*sh);
    ctx.stroke();
  }

  /* Strings: active set visible, others dimmed */
  var activeSet = shape.strings;
  for (var s = 0; s < n; s++) {
    var sy    = PT + s * sh;
    var inSet = activeSet.indexOf(s) !== -1;
    ctx.strokeStyle = inSet
      ? (dark ? 'rgba(200,200,200,0.75)' : 'rgba(80,80,80,0.75)')
      : (dark ? 'rgba(110,110,110,0.20)' : 'rgba(170,170,170,0.20)');
    ctx.lineWidth = Math.max(0.5, 0.5 + s * 0.3) * (inSet ? 1.5 : 0.7);
    ctx.beginPath();
    ctx.moveTo(PL, sy);
    ctx.lineTo(PL + zoneMargin + numFrets * fw, sy);
    ctx.stroke();
  }

  /* Position dots */
  var dr = Math.max(3, Math.min(sh * 0.2, fw * 0.15));
  [3,5,7,9,12,15,17,19].forEach(function(fd) {
    var fi = fd - loW;
    if (fi <= 0 || fi > numFrets) return;
    var x = PL + zoneMargin + (fi - 0.5) * fw;
    ctx.fillStyle = dark ? '#3a3a3a' : '#e0e0e0';
    if (fd === 12) {
      ctx.beginPath(); ctx.arc(x, PT + (n-1)*sh*0.3, dr, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(x, PT + (n-1)*sh*0.7, dr, 0, Math.PI*2); ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(x, PT + (n-1)*sh*0.5, dr, 0, Math.PI*2); ctx.fill();
    }
  });

  /* Fret number labels */
  var labelY = PT + (n-1)*sh + PB * 0.62;
  ctx.font         = Math.max(8, Math.min(11, fw * 0.38)) + 'px -apple-system,sans-serif';
  ctx.fillStyle    = dark ? '#666' : '#999';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'alphabetic';
  if (loW > 0) ctx.fillText(loW, PL + zoneMargin * 0.5, labelY);
  for (var fi2 = 1; fi2 <= numFrets; fi2++) {
    ctx.fillText(loW + fi2, PL + zoneMargin + (fi2 - 0.5) * fw, labelY);
  }

  /* String number labels */
  ctx.font         = Math.max(8, Math.min(11, sh * 0.5)) + 'px -apple-system,sans-serif';
  ctx.fillStyle    = dark ? '#555' : '#bbb';
  ctx.textAlign    = 'right';
  ctx.textBaseline = 'middle';
  for (var sl = 0; sl < n; sl++) ctx.fillText(sl + 1, PL - 4, PT + sl * sh);

  /* Triad dots */
  var dotR = Math.max(8, Math.min(sh * 0.42, fw * 0.36));
  TRIADS_DOT_POSITIONS = [];
  for (var d = 0; d < 3; d++) {
    var dx = PL + zoneMargin + (shape.frets[d] - loW - 0.5) * fw;
    var dy = PT + shape.strings[d] * sh;
    TRIADS_DOT_POSITIONS.push({ x: dx, y: dy, r: dotR, d: d });
    ctx.beginPath();
    ctx.arc(dx, dy, dotR, 0, Math.PI * 2);
    ctx.fillStyle = hideRoleColors
      ? (dark ? '#555' : '#bbb')
      : TRIAD_ROLE_COLORS[shape.roles[d]];
    ctx.fill();
    if (!hideDotLabels && !hideRoleColors) {
      ctx.fillStyle    = '#fff';
      ctx.font         = 'bold ' + Math.max(9, Math.floor(dotR)) + 'px -apple-system,sans-serif';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(TRIAD_ROLE_LABELS[shape.roles[d]], dx, dy);
    }
  }
  ctx.textBaseline = 'alphabetic';
}

/* Build-the-shape canvas: draws the fretboard without pre-placed dots.
   placed = [{stringIdx, fret}] user dots to draw.
   validatedData = null while placing, or {results:[{correct,role}], missing:[{stringIdx,fret,role}]} */
function triadsDrawBuildCanvas(shape, placed, validatedData) {
  var canvas = el('triads-canvas');
  if (!canvas) return;

  var dark = isDark();
  var dpr  = window.devicePixelRatio || 1;
  var n    = triadsNumStrings();

  var cW = (canvas.parentElement ? canvas.parentElement.clientWidth : 0) - 24;
  if (cW <= 10) cW = window.innerWidth - 48;
  cW = Math.max(180, cW);

  var allFrets = shape.frets;
  var minF     = Math.min.apply(null, allFrets);
  var maxF     = Math.max.apply(null, allFrets);
  var span     = maxF - minF + 1;
  var numFrets = Math.max(span, 5);
  var loW      = Math.max(0, minF - Math.floor((numFrets - span) / 2) - 1);

  var zoneAspect = NECK_ASPECT * (numFrets / 21) * 1.8;
  var cH         = Math.max(70, Math.floor(cW / zoneAspect));

  canvas.width        = Math.round(cW * dpr);
  canvas.height       = Math.round(cH * dpr);
  canvas.style.width  = cW + 'px';
  canvas.style.height = cH + 'px';

  var ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cW, cH);

  var PL = Math.round(cW * 0.06);
  var PR = PL;
  var PT = Math.round(cH * 0.10);
  var PB = Math.round(cH * 0.24);

  var zoneMarginFrac = loW > 0 ? 0.35 : 0;
  var fw             = (cW - PL - PR) / (numFrets + zoneMarginFrac);
  var zoneMargin     = Math.round(fw * zoneMarginFrac);
  var sh             = (cH - PT - PB) / (n - 1);

  /* Store geometry so the tap handler can map clicks to (string, fret) */
  TRIADS_BUILD_GEOMETRY = {
    PL: PL, PT: PT, fw: fw, sh: sh,
    loW: loW, numFrets: numFrets, zoneMargin: zoneMargin,
    strings: shape.strings
  };

  /* Board background */
  ctx.fillStyle = dark ? '#1e1400' : '#f9f4e8';
  ctx.fillRect(PL, PT, zoneMargin + numFrets * fw, (n - 1) * sh);

  /* Nut or zone-start marker */
  if (loW === 0) {
    ctx.strokeStyle = dark ? '#bbb' : '#333';
    ctx.lineWidth   = Math.max(3, fw * 0.12);
    ctx.beginPath(); ctx.moveTo(PL, PT); ctx.lineTo(PL, PT + (n-1)*sh); ctx.stroke();
  }

  /* Fret lines */
  var fStart = loW === 0 ? 1 : 0;
  for (var f = fStart; f <= numFrets; f++) {
    ctx.strokeStyle = dark ? '#3a3a3a' : '#ddd';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(PL + zoneMargin + f * fw, PT);
    ctx.lineTo(PL + zoneMargin + f * fw, PT + (n-1)*sh);
    ctx.stroke();
  }

  /* Strings: active set at full weight, inactive strings dimmed */
  var activeSet = shape.strings;
  for (var s = 0; s < n; s++) {
    var sy    = PT + s * sh;
    var inSet = activeSet.indexOf(s) !== -1;
    ctx.strokeStyle = inSet
      ? (dark ? 'rgba(200,200,200,0.75)' : 'rgba(80,80,80,0.75)')
      : (dark ? 'rgba(110,110,110,0.20)' : 'rgba(170,170,170,0.20)');
    ctx.lineWidth = Math.max(0.5, 0.5 + s * 0.3) * (inSet ? 1.5 : 0.7);
    ctx.beginPath();
    ctx.moveTo(PL, sy);
    ctx.lineTo(PL + zoneMargin + numFrets * fw, sy);
    ctx.stroke();
  }

  /* Position dots */
  var dr = Math.max(3, Math.min(sh * 0.2, fw * 0.15));
  [3,5,7,9,12,15,17,19].forEach(function(fd) {
    var fi = fd - loW;
    if (fi <= 0 || fi > numFrets) return;
    var x = PL + zoneMargin + (fi - 0.5) * fw;
    ctx.fillStyle = dark ? '#3a3a3a' : '#e0e0e0';
    if (fd === 12) {
      ctx.beginPath(); ctx.arc(x, PT + (n-1)*sh*0.3, dr, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(x, PT + (n-1)*sh*0.7, dr, 0, Math.PI*2); ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(x, PT + (n-1)*sh*0.5, dr, 0, Math.PI*2); ctx.fill();
    }
  });

  /* Fret number labels */
  var labelY = PT + (n-1)*sh + PB * 0.62;
  ctx.font         = Math.max(8, Math.min(11, fw * 0.38)) + 'px -apple-system,sans-serif';
  ctx.fillStyle    = dark ? '#666' : '#999';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'alphabetic';
  if (loW > 0) ctx.fillText(loW, PL + zoneMargin * 0.5, labelY);
  for (var fi2 = 1; fi2 <= numFrets; fi2++) {
    ctx.fillText(loW + fi2, PL + zoneMargin + (fi2 - 0.5) * fw, labelY);
  }

  /* String number labels */
  ctx.font         = Math.max(8, Math.min(11, sh * 0.5)) + 'px -apple-system,sans-serif';
  ctx.fillStyle    = dark ? '#555' : '#bbb';
  ctx.textAlign    = 'right';
  ctx.textBaseline = 'middle';
  for (var sl = 0; sl < n; sl++) ctx.fillText(sl + 1, PL - 4, PT + sl * sh);

  var dotR = Math.max(8, Math.min(sh * 0.42, fw * 0.36));

  /* User-placed dots */
  for (var i = 0; i < placed.length; i++) {
    var dot = placed[i];
    var dx  = PL + zoneMargin + (dot.fret - loW - 0.5) * fw;
    var dy  = PT + dot.stringIdx * sh;
    ctx.beginPath();
    ctx.arc(dx, dy, dotR, 0, Math.PI * 2);
    if (!validatedData) {
      ctx.fillStyle = dark ? '#666' : '#aaa';
      ctx.fill();
    } else {
      var res = validatedData.results[i];
      if (res.correct) {
        ctx.fillStyle = TRIAD_ROLE_COLORS[res.role];
        ctx.fill();
        ctx.fillStyle    = '#fff';
        ctx.font         = 'bold ' + Math.max(9, Math.floor(dotR)) + 'px -apple-system,sans-serif';
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(TRIAD_ROLE_LABELS[res.role], dx, dy);
      } else {
        ctx.fillStyle = '#e53e3e';
        ctx.fill();
      }
    }
  }

  /* Missing correct positions: outlined circles showing where notes go */
  if (validatedData && validatedData.missing) {
    for (var m = 0; m < validatedData.missing.length; m++) {
      var miss = validatedData.missing[m];
      var mx   = PL + zoneMargin + (miss.fret - loW - 0.5) * fw;
      var my   = PT + miss.stringIdx * sh;
      ctx.beginPath();
      ctx.arc(mx, my, dotR, 0, Math.PI * 2);
      ctx.strokeStyle = TRIAD_ROLE_COLORS[miss.role];
      ctx.lineWidth   = 2;
      ctx.stroke();
      ctx.fillStyle    = TRIAD_ROLE_COLORS[miss.role];
      ctx.font         = 'bold ' + Math.max(9, Math.floor(dotR)) + 'px -apple-system,sans-serif';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(TRIAD_ROLE_LABELS[miss.role], mx, my);
    }
  }

  ctx.textBaseline = 'alphabetic';
}

/* ── Study control callbacks ────────────────────── */

function triadsSetRoot(root) {
  TRIAD_STUDY_ROOT = root;
  var inter = el('triads-interactive');
  if (inter) { inter.innerHTML = triadsInteractiveHTML(); triadsDrawCanvas(false); }
}

function triadsSetInversion(inv) {
  TRIAD_STUDY_INVERSION = inv;
  var inter = el('triads-interactive');
  if (inter) { inter.innerHTML = triadsInteractiveHTML(); triadsDrawCanvas(false); }
}

function triadsSetQuality(q) {
  TRIAD_STUDY_QUALITY = q;
  var inter = el('triads-interactive');
  if (inter) { inter.innerHTML = triadsInteractiveHTML(); triadsDrawCanvas(false); }
}

/* ── Help overlay ───────────────────────────────── */

function showTriadsHelp() {
  var overlay = el('triads-help-overlay');
  if (!overlay) return;
  var content = el('triads-help-content');
  if (content) content.innerHTML = triadsHelpContent();
  overlay.style.display = 'flex';
}

function closeTriadsHelp() {
  var overlay = el('triads-help-overlay');
  if (overlay) overlay.style.display = 'none';
  localStorage.setItem('triads_toured', '1');
}

function triadsHelpContent() {
  function roleRow(color, label, num, desc) {
    return '<div style="display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);">' +
      '<div style="width:26px;height:26px;border-radius:50%;background:' + color + ';display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:#fff;flex-shrink:0;">' + num + '</div>' +
      '<div style="flex:1;">' +
        '<div style="font-size:13px;font-weight:700;color:var(--text);">' + label + '</div>' +
        '<div style="font-size:12px;color:var(--text2);margin-top:2px;">' + desc + '</div>' +
      '</div>' +
    '</div>';
  }

  function invRow(color, label, bass) {
    return '<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:var(--surface);border:1px solid var(--border);border-radius:8px;">' +
      '<div style="width:10px;height:10px;border-radius:50%;background:' + color + ';flex-shrink:0;"></div>' +
      '<div style="font-size:13px;font-weight:700;color:var(--text);">' + label + '</div>' +
      '<div style="font-size:12px;color:var(--text2);margin-left:auto;">' + bass + '</div>' +
    '</div>';
  }

  return (
    '<div class="fund-lesson-card" style="margin:0;">' +
      '<div class="fund-eyebrow">What is a triad?</div>' +
      '<div class="fund-body">Three notes built in thirds: root, third, and fifth. The DNA of every chord. On guitar, each triad fits neatly across three adjacent strings.</div>' +
      '<div style="border-top:1px solid var(--border);margin-top:12px;">' +
        roleRow(TRIAD_COLOR_ROOT,  'Root (1)', '1', 'The home base. Names the chord.') +
        roleRow(TRIAD_COLOR_THIRD, 'Third (3)', '3', 'Major = 4 semitones up. Minor = 3 semitones. One note changes everything.') +
        roleRow(TRIAD_COLOR_FIFTH, 'Fifth (5)', '5', 'Always 7 semitones above the root. Stable and consonant.') +
      '</div>' +
    '</div>' +

    '<div class="fund-lesson-card" style="margin:0;">' +
      '<div class="fund-eyebrow">Major vs. minor</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;">' +
        '<div style="padding:10px;background:var(--surface);border:1px solid var(--border);border-radius:8px;">' +
          '<div style="font-size:13px;font-weight:800;color:var(--text);margin-bottom:4px;">Major</div>' +
          '<div style="font-size:12px;color:var(--text2);">Root + 4 semitones + 7</div>' +
        '</div>' +
        '<div style="padding:10px;background:var(--surface);border:1px solid var(--border);border-radius:8px;">' +
          '<div style="font-size:13px;font-weight:800;color:var(--text);margin-bottom:4px;">Minor</div>' +
          '<div style="font-size:12px;color:var(--text2);">Root + 3 semitones + 7</div>' +
        '</div>' +
      '</div>' +
      '<div class="fund-body" style="margin-top:8px;">The fifth stays the same. One semitone on the third flips major to minor.</div>' +
    '</div>' +

    '<div class="fund-lesson-card" style="margin:0;">' +
      '<div class="fund-eyebrow">Inversions</div>' +
      '<div class="fund-body">Three notes, three ways to stack them. Which note sits lowest on the neck defines the inversion — and determines the shape.</div>' +
      '<div style="display:flex;flex-direction:column;gap:5px;margin-top:10px;">' +
        invRow(TRIAD_COLOR_ROOT,  'Root position', 'Root is lowest') +
        invRow(TRIAD_COLOR_THIRD, '1st inversion', '3rd is lowest') +
        invRow(TRIAD_COLOR_FIFTH, '2nd inversion', '5th is lowest') +
      '</div>' +
      '<div class="fund-body" style="margin-top:8px;">All three inversions = any chord, anywhere, without shifting hand position.</div>' +
    '</div>' +

    '<div class="fund-lesson-card" style="margin:0 0 4px;">' +
      '<div class="fund-eyebrow">How to use this module</div>' +
      '<div class="fund-body"><strong>Study:</strong> Pick any root, quality, and inversion to see the shape on any string set. The colored dots show which note is which.</div>' +
      '<div class="fund-body" style="margin-top:6px;"><strong>Practice:</strong> Random shapes across all string sets. Use the ⚙ settings icon to focus on specific sets, inversions, or major/minor.</div>' +
    '</div>'
  );
}
