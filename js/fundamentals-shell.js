function exitFundamentals() {
  /* restore the shell pieces this module hid, so returning to Fretboard
     Notes (or any future module reusing the same shell) isn't left broken */
  el('stage-bar').style.display = 'none';
  el('fundamentals-content').style.display = 'none';
  el('mode-tabs').style.display = '';
  el('stats-row').style.display = '';
  el('app').classList.remove('simple-module');
  currentModule = null;
}

function renderStageBar() {
  var bar = el('stage-bar');
  if (!bar) return;
  var html = '';
  for (var i = 0; i < FUND_STAGES.length; i++) {
    var s = FUND_STAGES[i];
    var isDone   = fundCompletedStages.indexOf(s.id) !== -1;
    var isActive = s.id === fundStage;
    var cls = isDone ? 'done' : isActive ? 'active' : 'locked';
    var symbol = isDone ? '\u2713' : s.id;
    html += '<button class="stage-dot-item ' + cls + '" onclick="goFundStage(' + s.id + ')">'
      + '<div class="stage-dot ' + cls + '">' + symbol + '</div>'
      + '<div class="stage-label">' + s.label + '</div>'
      + '</button>';
  }
  bar.innerHTML = html;
}

function goFundStage(id) {
  fundStage = id;
  if (id === 4) fundStage4SubPage = 1;
  renderStageBar();
  renderFundStage();
}

function renderFundStage() {
  var c = el('fundamentals-content');
  if (!c) return;
  if (fundStage === 1) {
    c.innerHTML = fundStage1Study();
  } else if (fundStage === 2) {
    c.innerHTML = fundStage2Study();
  } else if (fundStage === 3) {
    c.innerHTML = fundStage3Study();
  } else if (fundStage === 4) {
    c.innerHTML = fundStage4Study();
  } else if (fundStage === 5) {
    c.innerHTML = fundStage5Study();
  } else if (fundStage === 6) {
    c.innerHTML = fundStage6Study();
  } else {
    c.innerHTML = '<div style="padding:24px;text-align:center;color:var(--text2);">'
      + 'Stage ' + fundStage + ' content not yet ported.</div>';
  }
}

