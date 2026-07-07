/************************************************************
 * FretNerd
 * Copyright (c) 2026 Scott Farris / Tilted Iron
 * Proprietary and confidential. Unauthorized use prohibited.
 ************************************************************/

/* ═══════════════════════════════════════════════════
   MODULE 4: TRIAD POSITIONS — Practice Engine
═══════════════════════════════════════════════════ */

var TRIAD_QUIZ = {
  correct:  0,
  total:    0,
  streak:   0,
  currentQ: null,
  answered: false
};

var TRIAD_MASTERY_STREAK = 9;

/* triadsShowMode is defined in triads-shell.js */

function triadsStartPractice() {
  triadsShowMode('practice');
}

function triadsUpdateStats() {
  var stats = el('triads-stats');
  if (!stats) return;

  stats.style.display        = 'flex';
  stats.style.alignItems     = 'center';
  stats.style.justifyContent = 'space-between';

  if (triadsMode === 'practice') {
    var f    = TRIAD_PRACTICE_FILTERS;
    var sets = triadsStringSets();
    var numSets = f.sets === null ? sets.length : f.sets.length;

    var leftParts = [];
    if (numSets < sets.length) {
      leftParts.push(numSets === 1
        ? sets[f.sets[0]].label
        : numSets + ' sets');
    }
    if (f.qualities.length === 1) leftParts.push(f.qualities[0].charAt(0).toUpperCase() + f.qualities[0].slice(1) + ' only');
    if (f.inversions.length < 3)  leftParts.push(f.inversions.length + ' inv.');
    var filterLabel = leftParts.length ? leftParts.join(' · ') : 'All triads';

    var scoreRight = TRIAD_QUIZ.streak > 1
      ? TRIAD_QUIZ.correct + '/' + TRIAD_QUIZ.total + ' &nbsp;<span style="color:var(--teal);font-weight:700;">' + TRIAD_QUIZ.streak + ' in a row</span>'
      : TRIAD_QUIZ.correct + '/' + TRIAD_QUIZ.total + ' correct';

    stats.innerHTML =
      '<span style="font-size:12px;color:var(--text2);">' + filterLabel + '</span>' +
      '<span style="font-size:12px;color:var(--text3);">' + scoreRight + '</span>';
  } else {
    var SS = triadsStringSets()[triadsStageSetMap()[triadsStage]];
    stats.innerHTML =
      '<span style="font-size:12px;color:var(--text2);">Stage ' + triadsStage + ' · ' + SS.names + '</span>' +
      '<span style="font-size:12px;color:var(--text3);">' + triadsStageList().length + ' stages</span>';
  }
}

function triadsRenderPracticeQ() {
  var c = el('fundamentals-content');
  TRIAD_BUILD.placed    = [];
  TRIAD_BUILD.validated = false;
  var q = triadsGenQuestion();
  TRIAD_QUIZ.currentQ  = q;
  TRIAD_QUIZ.answered  = false;

  c.innerHTML =
    triadsModeTabs() +
    '<div style="display:flex;flex-direction:column;gap:8px;">' +
      '<div style="padding:10px 12px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);">' +
        '<div style="font-size:16px;font-weight:700;color:var(--text);line-height:1.25;">' + q.prompt + '</div>' +
        '<div style="font-size:11px;color:var(--text2);margin-top:2px;">' + q.sub + '</div>' +
      '</div>' +
      '<div class="fund-lesson-card" style="padding:8px;">' +
        '<canvas id="triads-canvas" style="display:block;width:100%;cursor:pointer;"></canvas>' +
      '</div>' +
      '<div id="triadsFB" style="text-align:center;font-size:13px;color:var(--text3);padding:4px 0;">Tap each string to place the notes</div>' +
    '</div>';

  triadsDrawBuildCanvas(q.shape, [], null);
  triadsUpdateStats();

  var canvas = el('triads-canvas');
  canvas.addEventListener('click', triadsHandleBuildTap);
  canvas.addEventListener('touchend', triadsHandleBuildTapTouch, { passive: false });
}

function triadsGenQuestion() {
  var f    = TRIAD_PRACTICE_FILTERS;
  var sets = triadsStringSets();
  var setPool = (f.sets === null || f.sets.length === 0)
    ? sets.map(function(_, i) { return i; })
    : f.sets.filter(function(i) { return i < sets.length; });

  var setIdx    = setPool[Math.floor(Math.random() * setPool.length)];
  var root      = Math.floor(Math.random() * 12);
  var quality   = f.qualities[Math.floor(Math.random() * f.qualities.length)];
  var inversion = f.inversions[Math.floor(Math.random() * f.inversions.length)];
  var shape     = triadsGetShape(root, quality, inversion, setIdx);
  var SS        = sets[setIdx];

  return {
    prompt: TRIAD_ROOT_NAMES[root] + ' ' + quality + ' — ' + TRIAD_INV_FULL[inversion],
    sub:    SS.names + ' strings',
    shape:  shape
  };
}

/* Map a click/touch event to (stringIdx, fret) and place a dot */
function triadsHandleBuildTap(e) {
  if (TRIAD_BUILD.validated || !TRIADS_BUILD_GEOMETRY) return;
  var g      = TRIADS_BUILD_GEOMETRY;
  var canvas = el('triads-canvas');
  if (!canvas) return;

  var rect   = canvas.getBoundingClientRect();
  var scaleX = parseFloat(canvas.style.width)  / rect.width;
  var scaleY = parseFloat(canvas.style.height) / rect.height;
  var x = (e.clientX - rect.left) * scaleX;
  var y = (e.clientY - rect.top)  * scaleY;

  /* Snap y → nearest active string */
  var stringIdx = g.strings.reduce(function(best, s) {
    return Math.abs(y - (g.PT + s * g.sh)) < Math.abs(y - (g.PT + best * g.sh)) ? s : best;
  }, g.strings[0]);

  /* Map x → fret number */
  var boardX = x - g.PL - g.zoneMargin;
  if (boardX < 0) return;
  var k = Math.floor(boardX / g.fw) + 1;
  if (k < 1 || k > g.numFrets) return;
  var fret = g.loW + k;

  triadsBuildPlace(stringIdx, fret);
}

function triadsHandleBuildTapTouch(e) {
  e.preventDefault();
  triadsHandleBuildTap(e.changedTouches[0]);
}

/* Place (or replace) a dot on a string, then redraw; auto-validate on third dot */
function triadsBuildPlace(stringIdx, fret) {
  TRIAD_BUILD.placed = TRIAD_BUILD.placed.filter(function(d) {
    return d.stringIdx !== stringIdx;
  });
  TRIAD_BUILD.placed.push({ stringIdx: stringIdx, fret: fret });

  var remaining = 3 - TRIAD_BUILD.placed.length;
  var fb = el('triadsFB');
  if (fb) fb.textContent = remaining > 0
    ? remaining + ' note' + (remaining === 1 ? '' : 's') + ' to go'
    : 'Checking…';

  triadsDrawBuildCanvas(TRIAD_QUIZ.currentQ.shape, TRIAD_BUILD.placed, null);

  if (TRIAD_BUILD.placed.length === 3) setTimeout(triadsBuildValidate, 120);
}

/* Compare placed dots to correct shape, score, and reveal */
function triadsBuildValidate() {
  TRIAD_BUILD.validated = true;
  var shape = TRIAD_QUIZ.currentQ.shape;

  /* Build lookup: stringIdx → {fret, role} */
  var correct = {};
  for (var i = 0; i < 3; i++) {
    correct[shape.strings[i]] = { fret: shape.frets[i], role: shape.roles[i] };
  }

  var allRight = true;
  var results  = [];
  var covered  = {};

  TRIAD_BUILD.placed.forEach(function(dot) {
    var c  = correct[dot.stringIdx];
    var ok = c && c.fret === dot.fret;
    results.push({ correct: ok, role: ok ? c.role : -1 });
    if (ok) covered[dot.stringIdx] = true;
    else    allRight = false;
  });

  /* Strings the user got wrong or skipped — show their correct positions */
  var missing = shape.strings
    .filter(function(si) { return !covered[si]; })
    .map(function(si) {
      var j = shape.strings.indexOf(si);
      return { stringIdx: si, fret: shape.frets[j], role: shape.roles[j] };
    });

  TRIAD_QUIZ.total++;
  if (allRight) { TRIAD_QUIZ.correct++; TRIAD_QUIZ.streak++; }
  else          { TRIAD_QUIZ.streak = 0; }

  triadsDrawBuildCanvas(shape, TRIAD_BUILD.placed, { results: results, missing: missing });
  triadsUpdateStats();

  var fb = el('triadsFB');
  if (allRight) {
    var note = TRIAD_QUIZ.streak >= TRIAD_MASTERY_STREAK
      ? ' ' + TRIAD_QUIZ.streak + ' in a row!' : '';
    fb.innerHTML = '<span class="fq-fb-correct">✓ ' + TRIAD_INV_FULL[shape.inversion] +
                   ' — ' + TRIAD_INV_BASS[shape.inversion] + '.' + note + '</span>';
  } else {
    fb.innerHTML = '<span class="fq-fb-wrong">Not quite — correct shape shown.</span>';
  }
  fb.innerHTML += '<button class="fq-continue-btn" onclick="triadsNextQ()">Next →</button>';
}

function triadsNextQ() {
  triadsRenderPracticeQ();
}
