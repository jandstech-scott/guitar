/************************************************************
 * FretNerd
 * Copyright (c) 2026 Scott Farris / Tilted Iron
 * Proprietary and confidential. Unauthorized use prohibited.
 ************************************************************/

/* ══════════════════════════════════════════════════════
   CHORD CONSTRUCTION — Shell / Navigation
══════════════════════════════════════════════════════ */
function launchChords() {
  currentModule = 'chords';
  chordStage    = 1;
  chordCompletedStages = [];
  el('app').classList.add('simple-module');
  hideHome();
  el('mode-tabs').style.display         = 'none';
  el('study-content').style.display     = 'none';
  el('practice-content').style.display  = 'none';
  el('stats-row').style.display         = 'none';
  el('pause-btn').style.display         = 'none';
  el('stage-bar').style.display         = 'flex';
  el('fundamentals-content').style.display = 'flex';
  setText('topbar-module-name', 'Chord Construction');
  chordsRenderStageBar();
  chordsRenderStudyStage();
}

function exitChords() {
  el('stage-bar').style.display            = 'none';
  el('fundamentals-content').style.display = 'none';
  el('mode-tabs').style.display            = '';
  el('stats-row').style.display            = '';
  el('app').classList.remove('simple-module');
  currentModule = null;
}

function chordsRenderStageBar() {
  var bar = el('stage-bar');
  if (!bar) return;
  var html = '';
  for (var i = 0; i < CHORD_STAGES.length; i++) {
    var s      = CHORD_STAGES[i];
    var isDone = chordCompletedStages.indexOf(s.id) !== -1;
    var isAct  = s.id === chordStage;
    var cls    = isDone ? 'done' : isAct ? 'active' : '';
    var sym    = isDone ? '✓' : s.id;
    html += '<button class="stage-dot-item ' + cls + '" onclick="goChordsStage(' + s.id + ')">'
      + '<div class="stage-dot ' + cls + '">' + sym + '</div>'
      + '<div class="stage-label">' + s.label + '</div>'
      + '</button>';
  }
  bar.innerHTML = html;
}

function goChordsStage(id) {
  chordStage = id;
  chordsRenderStageBar();
  chordsRenderStudyStage();
}

function chordsRenderStudyStage() {
  var c = el('fundamentals-content');
  if (!c) return;
  var fn = [null, chordsStage1Study, chordsStage2Study, chordsStage3Study,
            chordsStage4Study, chordsStage5Study, chordsStage6Study][chordStage];
  c.innerHTML = fn ? fn() : '<div style="padding:24px;text-align:center;color:var(--text2);">Stage ' + chordStage + ' not yet available.</div>';
}

/* ── Shared chord display helpers (used by study cards) ── */
function chordsBuildNoteRow(root, typeIds) {
  var html = '<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin:10px 0;">';
  for (var ti = 0; ti < typeIds.length; ti++) {
    var type  = chordTypeById(typeIds[ti]);
    var notes = chordNotes(root, type.formula);
    html += '<div style="text-align:center;">';
    html += '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--text3);margin-bottom:4px;">' + type.name + '</div>';
    html += '<div style="display:flex;gap:4px;align-items:center;">';
    for (var ni = 0; ni < notes.length; ni++) {
      var isRoot = ni === 0;
      html += '<div class="fund-scale-note' + (isRoot ? ' root' : '') + '" style="min-width:30px;height:30px;font-size:13px;">' + chordDN(notes[ni]) + '</div>';
      if (ni < notes.length - 1)
        html += '<div style="font-size:9px;font-weight:700;color:var(--text3);">' + type.degreeLabels[ni+1] + '</div>';
    }
    html += '</div></div>';
    if (ti < typeIds.length - 1) html += '<div style="width:1px;background:var(--border);align-self:stretch;"></div>';
  }
  html += '</div>';
  return html;
}

function chordsRootSelector(stageId) {
  var html = '<div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:center;margin:8px 0;">';
  for (var i = 0; i < CHORD_ALL_ROOTS.length; i++) {
    var r = CHORD_ALL_ROOTS[i];
    html += '<button class="fund-key-btn" id="crs-' + r.replace('#','sh').replace('b','b') + '" onclick="chordsPickRoot(\'' + r + '\',' + stageId + ')">' + chordDN(r) + '</button>';
  }
  html += '</div>';
  return html;
}

var _chordsSelectedRoot = 'C';
function chordsPickRoot(root, stageId) {
  _chordsSelectedRoot = root;
  /* update button highlight */
  var btns = document.querySelectorAll('.fund-key-btn');
  for (var i = 0; i < btns.length; i++) btns[i].classList.remove('active');
  var safeId = root.replace('#','sh').replace('b','b');
  var btn = el('crs-' + safeId); if (btn) btn.classList.add('active');
  /* update note display */
  var disp = el('chords-note-display');
  if (!disp) return;
  var typeIds = {
    2: ['major'],
    3: ['major','minor'],
    4: ['major','minor','dom7'],
    5: ['dom7','maj7','min7'],
    6: ['major','minor','dom7','maj7','min7']
  }[stageId] || ['major'];
  disp.innerHTML = chordsBuildNoteRow(root, typeIds);
}
