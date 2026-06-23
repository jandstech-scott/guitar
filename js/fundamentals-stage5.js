/* ── Stage 5: The Circle of Fifths — Study content ── */
var fundStage5SelectedRoot = 'C';

function fundStage5Study() {
  var key = fundKeyByRoot(fundStage5SelectedRoot);
  var n = FUND_CIRCLE_KEYS.length;
  var idx = FUND_CIRCLE_KEYS.indexOf(fundStage5SelectedRoot);
  var cwKey = fundKeyByRoot(FUND_CIRCLE_KEYS[(idx + 1) % n]);
  var ccwKey = fundKeyByRoot(FUND_CIRCLE_KEYS[(idx - 1 + n) % n]);

  return (
    '<div class="fund-lesson-card">' +
      '<div class="fund-eyebrow">Stage 5 \u00B7 The Circle of Fifths</div>' +
      '<div class="fund-title">One map. Every key.</div>' +
      '<div class="fund-body">You\u2019ve already built this circle in Stage 4 \u2014 sharps clockwise, flats counter-clockwise. Now it does two more jobs: showing you each key\u2019s <strong>relative minor</strong>, and showing how far apart any two keys really are.</div>' +
    '</div>' +

    '<div class="fund-lesson-card">' +
      '<div class="fund-eyebrow">Tap any key</div>' +
      '<div id="fundCircleWrap" style="display:flex;justify-content:center;padding:8px 0;">' +
        fundBuildCircleSVG({ showMinors: true, selectedRoot: fundStage5SelectedRoot, interactive: true, onTapHandler: 'fundSelectCircleKey' }) +
      '</div>' +
      '<div id="fundCircleSelectedInfo">' + fundRenderCircleSelectedInfo(key, cwKey, ccwKey) + '</div>' +
    '</div>' +

    '<div class="fund-lesson-card">' +
      '<div class="fund-eyebrow">Relative Minors</div>' +
      '<div class="fund-body">Every major key has a relative minor \u2014 same key signature, same notes, different home note. It\u2019s always scale degree 6 of the major scale. ' + key.displayKey + ' major\u2019s 6th note is <strong>' + key.displayRelativeMinor + '</strong> \u2014 so ' + key.displayRelativeMinor + ' minor is its relative minor.</div>' +
    '</div>' +

    '<div class="fund-lesson-card">' +
      '<div class="fund-eyebrow">Distance on the Circle</div>' +
      '<div class="fund-body">Neighboring keys on the circle differ by exactly one sharp or flat \u2014 they\u2019re close relatives. Keys directly across the circle from each other share almost nothing. Counting steps around the circle between two keys tells you exactly how many accidentals separate them.</div>' +
    '</div>' +

    '<button class="fund-cta-btn" onclick="fundStartPractice(5)">Start Practice \u2192</button>'
  );
}

function fundRenderCircleSelectedInfo(key, cwKey, ccwKey) {
  return (
    '<div style="text-align:center;margin-bottom:10px;">' +
      '<div style="font-size:18px;font-weight:800;color:var(--text);">' + key.displayKey + ' major</div>' +
      '<div style="font-size:12px;color:var(--text2);margin-top:2px;">relative minor: <strong style="color:var(--teal-txt);">' + key.displayRelativeMinor + ' minor</strong></div>' +
    '</div>' +
    '<div style="display:flex;justify-content:space-between;gap:10px;font-size:12px;font-weight:700;color:var(--text2);border-top:1px solid var(--border);padding-top:8px;">' +
      '<div>\u2190 ' + ccwKey.displayKey + '<span style="display:block;font-size:12px;font-weight:400;color:var(--text2);">one fewer sharp / one more flat</span></div>' +
      '<div>' + cwKey.displayKey + ' \u2192<span style="display:block;font-size:12px;font-weight:400;color:var(--text2);">one more sharp / one fewer flat</span></div>' +
    '</div>'
  );
}

function fundSelectCircleKey(root) {
  fundStage5SelectedRoot = root;
  var key = fundKeyByRoot(root);
  var n = FUND_CIRCLE_KEYS.length;
  var idx = FUND_CIRCLE_KEYS.indexOf(root);
  var cwKey = fundKeyByRoot(FUND_CIRCLE_KEYS[(idx + 1) % n]);
  var ccwKey = fundKeyByRoot(FUND_CIRCLE_KEYS[(idx - 1 + n) % n]);

  el('fundCircleWrap').innerHTML = fundBuildCircleSVG({ showMinors: true, selectedRoot: root, interactive: true, onTapHandler: 'fundSelectCircleKey' });
  el('fundCircleSelectedInfo').innerHTML = fundRenderCircleSelectedInfo(key, cwKey, ccwKey);
}
