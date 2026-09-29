# Idea 1 — Intake Command

An editorial supervisor dashboard with a daily priority hero, Chart.js charts, searchable queues, a seven-stage case board, quick snapshots, and full tabbed case records. All case data is synthetic.

## Run

Serve the parent folder with any static HTTP server, then open `/Idea1/`. For example, from `Pediatric Test Ideas`, run `python -m http.server 8080` and visit `http://localhost:8080/Idea1/`.

Chart.js 4.4.8 is bundled in `vendor/`, so the chart works without a CDN. The Manrope font loads from Google Fonts and falls back to Arial.

## Design and data

- `theme.css` contains every color, font, radius, and shadow token, including dark mode. `styles.css` uses these tokens.
- `data.js` contains the synthetic case cohort. `source-data.js` contains the exact 27 August 2026 source snapshot from pediatricintake.netlify.app. `case-details.js` maps all 12 source records into the seven detail tabs. `board-rules.js` owns demo column capacities and movement checks. `app.js` handles views, search, charts, case views, drag interaction, local replies, and saved preferences.
- The all-cases list shows days in the current stage and total case days. An orange LED pulses at the top left for four or more stage days; a red LED takes precedence when total case days exceed seven. The row itself stays still. Reduced-motion users see a steady LED.
- Drag cards by their grip or use the Move to select. A card can move only to a later stage with spare capacity. Rejected moves return to their prior position with an explanation. A valid move appears immediately but stays unsaved for 20 seconds while the bottom countdown offers Undo. A second valid move saves the first; leaving the board or page also saves the pending move. Reset demo board restores the original cohort.
- Clicking a case row opens its full record; the Quick control opens a snapshot. Conversation messages follow a chat layout. Respond opens a separate composer with the latest message, channel, template, recipient, subject, message, Send, and Clear. A demo reply is stored only in this browser; no email or SMS is sent. SMS composition stays disabled as in the source snapshot. Referenced documents are not downloadable, and internal notes have no access control in this static demo.
- The demo intentionally distinguishes arrival blockers from in-flight exceptions, holds from staffing confirmation, and ready for intake from sent to intake.
- There is no backend or live patient data. Board moves, appearance, and sidebar width are local demo state.

## Validation

`node board-rules.test.mjs` checks forward and capacity rules. Run `node ../test-undo-window.cjs` for undo timing and `python ../validate.py` for the suite-wide static integrity check.
