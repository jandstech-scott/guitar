# Chord Construction Module (Module 03)

## Summary

A multi-stage interactive module teaching the theory behind major, minor, and 7th chords: what intervals build each type, which notes are in any given chord, and how to identify a chord from its notes. Mirrors the structure of the Music Fundamentals module — staged study cards followed by timed multiple-choice practice with mastery tracking.

Scope: intervals as building blocks, major chords, minor chords, and the three core 7th chord types (dom7, maj7, min7). Module 04 (Triad Positions) covers where to physically play these chords on the neck.

The module is already visible on the home screen as module 03 ("Chord Construction") with a "Coming soon" badge. Building it means: making it launchable, adding its stage data + engine + shell + stage files, and flipping the badge to "Available."

---

## Functional Requirements

### Module Registration & Navigation

- Clicking the Chord Construction card on the home screen launches the module (currently `coming-soon` — change class to `available` and wire `onclick="launchModule('chords')"`)
- The module uses the existing `#fundamentals-content` + `#stage-bar` layout pattern (same as Music Fundamentals — hides mode-tabs, shows stage-bar, drives content into `#fundamentals-content`)
- Topbar module name shows "Chord Construction"
- Home button returns to the home screen, resetting module state

### Stage Structure

Six progressive stages, each with a Study card followed by timed multiple-choice practice. Stage advance requires mastery (streak or key-coverage, matching the fundamentals pattern).

| # | Label | Concept |
|---|-------|---------|
| 1 | Intervals | Minor 3rd, major 3rd, perfect 5th, minor 7th, major 7th — the intervals that build every chord in this module |
| 2 | Major | Major chord formula (R–M3–P5); notes in any major chord across all 12 roots |
| 3 | Minor | Minor chord formula (R–m3–P5); how flattening the 3rd changes the sound and the notes |
| 4 | Dom7 | Dominant 7th formula (R–M3–P5–m7); notes in any dom7 chord |
| 5 | Maj7 & Min7 | Major 7th (R–M3–P5–M7) and minor 7th (R–m3–P5–m7); distinguishing the three 7th types |
| 6 | All Types | Synthesis: identification and note recall across all five chord types |

### Data Layer (`js/chords-data.js`)

**Interval definitions** — a lookup table of the intervals used in this module:

```
min3=3, maj3=4, perf5=7, min7=10, maj7=11
```

**Chord type registry** — the five chord types covered in this module:

```js
{
  id: 'major',
  name: 'Major',
  symbol: '',            // suffix appended to root, e.g. 'G' for G major
  formula: [0, 4, 7],   // semitone offsets from root
  degreeLabels: ['R', 'M3', 'P5'],
  stageIntroduced: 2
}
```

| id | name | symbol | formula | degrees |
|----|------|--------|---------|---------|
| `major` | Major | *(none)* | [0, 4, 7] | R–M3–P5 |
| `minor` | Minor | `m` | [0, 3, 7] | R–m3–P5 |
| `dom7` | Dominant 7 | `7` | [0, 4, 7, 10] | R–M3–P5–m7 |
| `maj7` | Major 7 | `maj7` | [0, 4, 7, 11] | R–M3–P5–M7 |
| `min7` | Minor 7 | `m7` | [0, 3, 7, 10] | R–m3–P5–m7 |

**Root list** — all 12 chromatic roots using the same sharp/flat conventions as `FUND_CHROMATIC_SEQ` in `fundamentals-data.js`. Flat roots (Bb, Eb, Ab, Db, Gb) display with ♭; sharp roots (C#, F#, G#, D#, A#) display with ♯.

**Note resolution** — a `chordNotes(root, formula)` function returning correctly-spelled notes for a chord. Spelling rule: prefer flats for flat roots, sharps otherwise. Reuses the enharmonic lookup tables already in `fundamentals-data.js`.

**Quiz state** — a `CHORD_QUIZ` object parallel to `FUND_QUIZ`:

```js
{
  stage, typeIdx, unlockedTypes, attempts,
  consecutiveCorrect, current, answered,
  questionStart, lastPrompt,
  chordTypesCorrect: {}   // key = 'root:chordTypeId', used for coverage mastery
}
```

**Stage config** — `CHORD_STAGE_CONFIG` parallel to `FUND_STAGE_CONFIG`. Stage 1 uses streak mastery (12 streak, ≤4s avg). Stages 2–6 use key-coverage mastery: must answer correctly for all 12 roots × each chord type introduced in that stage, with avg response time at or under threshold.

**Mastery copy** — `CHORD_MASTERY_COPY` with per-stage congratulation title and bridge copy pointing to the next stage.

### Question Types Per Stage

**Stage 1 — Intervals**
- Type 0 "Name the interval": Given two notes (e.g., C and E), pick the interval name from 4 options
- Type 1 "Find the note": Given a root and an interval name, pick the note that interval above the root
- Type 2 "Semitone count": Given an interval name, pick how many semitones it spans

**Stage 2 — Major Chords**
- Type 0 "Notes in chord": Given a root (e.g., "G major"), which set of 3 notes is correct?
- Type 1 "Name the chord": Given 3 notes, which chord name matches?
- Type 2 "Formula recall": Given the chord type name, pick its degree-label formula from 4 choices

**Stage 3 — Minor Chords** — same 3 types; distractor pool is major chords (same root, wrong type)

**Stage 4 — Dominant 7**
- Type 0 "Notes in chord": Given root + "dom7", which 4-note set is correct?
- Type 1 "Name the chord": Given 4 notes, pick from dom7 / maj / min / (one other plausible type)
- Type 2 "Formula recall": dom7 formula vs. the other chord types learned so far

**Stage 5 — Maj7 & Min7**
- Same 3 types; all five chord types now in the distractor pool — the key challenge is distinguishing dom7 vs. maj7 (one semitone difference on the 7th) and min7 vs. minor (extra note)

**Stage 6 — Identification (Synthesis)**
- All 3 question types draw from the full five-chord-type pool. Mastery = coverage across all 12 roots × all 5 types.

### Study Cards (`js/chords-stage1.js` through `chords-stage6.js`)

Each stage file exports a `chordsStageNStudy()` function returning an HTML string rendered into `#fundamentals-content`. Study cards use the existing `fund-lesson-card` / `fund-eyebrow` / `fund-title` / `fund-body` / `fund-callout` CSS class pattern.

**Stage 1 study card:**
- Reference table: interval name, abbreviation, semitone count
- Interactive single-string SVG diagram (adapt `fundBuildStringSVG()`): tap an interval name to highlight the root dot and the target note at that interval's distance

**Stage 2 study card:**
- Formula display: R–M3–P5 with dots and connectors (adapt the scale-builder visual pattern)
- Tappable root selector (all 12 roots); updates the three displayed chord notes live

**Stage 3 study card:**
- Side-by-side major vs. minor comparison: same root, showing how m3 vs. M3 changes the middle note
- Tappable root selector as above

**Stage 4 study card:**
- Formula display: R–M3–P5–m7; emphasizes that dom7 = major chord + flatted 7th
- Tappable root selector showing all 4 notes live

**Stage 5 study card:**
- Three-column comparison: dom7 / maj7 / min7 — highlighting the one-note difference between dom7 and maj7 (m7 vs. M7) and between min7 and minor (adds m7)
- Tappable root selector updating all three columns

**Stage 6:** No new study card — links back to previous stage cards as reference; goes straight to practice.

### Practice Engine (`js/chords-engine.js`)

- `chordsNextQuestion()` — calls `CHORD_STAGE_CONFIG[stage].generate()`
- `chordsHandleAnswer(selectedOption)` — records attempt, updates streak/coverage, checks mastery, advances stage if ready
- `chordsCheckMastery()` — returns `{ mastered: bool, accurateButSlow: bool }`

### Shell (`js/chords-shell.js`)

- `launchChords()` — called by `core-app.js`'s `launchModule('chords')` dispatcher; hides mode-tabs, shows stage-bar, renders Stage 1 study card
- `chordsShowStage(n)` — updates stage-bar highlight, renders the study card for stage n
- `chordsStartPractice(stageN)` — resets quiz state for the stage, fires first question
- `chordsRenderQuestion(q)` — renders the current question into `#fundamentals-content` using the existing `fq-*` CSS classes
- `chordsHandleMastery()` — shows the mastery card (matching `fundHandleMastery()` pattern) with next-stage CTA

### Visual / Interaction Patterns

Reuse existing CSS classes — no new `.css` additions required for structure:
- `fund-lesson-card`, `fund-eyebrow`, `fund-title`, `fund-body`, `fund-callout`, `fund-section-divider`
- `fund-cta-btn` for "Start Practice →" buttons
- `fq-*` classes for multiple-choice question cards
- `fund-scale-note` for note pill displays

One potential new CSS addition: a chord interval stack diagram — a vertical column of dots with interval labels between them, showing how each chord is assembled. Inline SVG generated in JS, following the `fundBuildCircleSVG()` / `fundBuildStringSVG()` pattern.

### State Persistence

Session-only in v1 — same as Music Fundamentals. No localStorage.

---

## Possible Edge Cases

- **Enharmonic root spelling**: Questions that display notes must normalize to the canonical sharp or flat spelling based on the root's accidental preference (e.g., Bb major → Bb–D–F, not A#–D–F).
- **Dom7 vs. Maj7 confusion**: These differ by exactly one semitone (m7 vs. M7). Distractors in Stage 5 must always include both so the user is forced to distinguish them; don't let the answer be trivially obvious from note count or key signature.
- **Minor vs. Min7 confusion**: Min7 is minor + one extra note. "Notes in chord" questions for min7 should use distractors that include the plain minor chord to prevent answering by process of elimination on note count alone.
- **Stage 6 mastery scope**: 12 roots × 5 chord types = 60 coverage cells. This is achievable but worth a playtest — consider a speed threshold that's generous enough to not make this stage feel like a grind.

---

## Decisions

- **Chord symbol notation**: Use symbol on answer buttons (e.g., "G7", "Gm", "Gmaj7"). Verbose name ("G dominant 7") in the prompt text only.
- **Stage 6 coverage threshold**: 80% of the 60 cells (12 roots × 5 types) — i.e., 48 correct — at or under the speed threshold.

---

## Testing Guidelines

Create `tests/chords-data.test.js`. Cover:

- `chordNotes('C', [0,4,7])` returns `['C','E','G']`
- `chordNotes('G', [0,4,7,10])` returns `['G','B','D','F']` (dom7)
- `chordNotes('F', [0,4,7,11])` returns `['F','A','C','E']` (maj7)
- `chordNotes('Bb', [0,3,7,10])` returns `['Bb','Db','F','Ab']` (min7)
- `chordNotes('F#', [0,4,7,10])` returns correctly spelled sharp-root dom7 notes
- Each chord type in the registry: `formula.length === degreeLabels.length`
- All question generators: returned question has exactly 4 options; `correct` is always in `options`; no option is duplicated
- Coverage mastery tracking: correct answer updates `chordTypesCorrect['root:chordTypeId']`

Create `tests/chords-engine.test.js`. Cover:

- `chordsHandleAnswer` increments `consecutiveCorrect` on correct answer; resets to 0 on wrong answer
- Correct answer within threshold updates `chordTypesCorrect` map
- Advancing from stage 2 to stage 3 resets `unlockedTypes` and `consecutiveCorrect`
- `chordsNextQuestion()` only generates question types present in `unlockedTypes`
