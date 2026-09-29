# Idea 1 — Intake Command

An editorial supervisor dashboard with a daily priority hero, two Chart.js charts, searchable queues, a seven-stage case board, quick snapshots, and full tabbed case records. All case data is synthetic and comes from the supplied `Details` mockups.

## Run

Serve the parent folder with any static HTTP server, then open `/Idea1/`. For example, from `Pediatric Test Ideas`, run `python -m http.server 8080` and visit `http://localhost:8080/Idea1/`.

Chart.js 4.4.8 is bundled in `vendor/`, so the chart works without a CDN. The Manrope font loads from Google Fonts and falls back to Arial.

## Design and data

- `theme.css` contains every color, font, radius, and shadow token, including dark mode. `styles.css` uses these tokens.
- `data.js` contains the synthetic case cohort. `case-details.js` holds the two full source records. `board-rules.js` owns demo column capacities and movement checks. `app.js` handles views, search, charts, case views, drag interaction, and saved preferences.
- Drag cards by their grip or use the Move to select. A card can move only to a later stage with spare capacity. Rejected moves return to their prior position with an explanation. A valid move appears immediately but stays unsaved for 20 seconds while the bottom countdown offers Undo. A second valid move saves the first; leaving the board or page also saves the pending move. Reset demo board restores the original cohort.
- The full case record is read-only. Referenced document names are not downloadable, historical conversation has no send action, and internal notes have no access control in this static demo.
- The demo intentionally distinguishes arrival blockers from in-flight exceptions, holds from staffing confirmation, and ready for intake from sent to intake.
- There is no backend or live patient data. Board moves, appearance, and sidebar width are local demo state.

## Validation

`node board-rules.test.mjs` checks forward and capacity rules. Run `node ../test-undo-window.cjs` for undo timing and `python ../validate.py` for the suite-wide static integrity check.
