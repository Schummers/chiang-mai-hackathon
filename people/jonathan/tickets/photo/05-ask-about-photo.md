# 05 — Ask about this photo

**What to build:** the "Ask about this photo" tool starts a voice question about that photo, answered by the app. It behaves **exactly like Speak**: one logic for the whole screen.

- Tap the tool = same as tapping Speak: a normal Listening card in the thread, wave + timer in the dock middle, Speak becomes Stop (dark indigo `#1b2045`). Auto-stop on silence as usual.
- The Listening card and the final question card carry one extra line at the top: 22px thumbnail (radius 6) + "About this photo" 11/800 ink-2.
- On stop: transcript → the app answers with the image, the photo card and the question as context. The answer is a woven card (app voice) in the visitor's language, not a Thai message for the vendor, and nothing auto-plays in Thai.
- Tapping Speak directly still makes a normal Turn for the vendor, photo or not.

**Blocked by:** 02, 03, 04.

**Status:** ready-for-agent

- [ ] Tool, Listening card and dock states match screen 4 of `explorations/photo-flow-v2.html`
- [ ] Nothing listens or animates inside the photo itself
- [ ] Answer card is woven, in the visitor's language, cites the photo it is about
- [ ] Stop / cancel / empty recording behave like Speak (same errors, same retry)
- [ ] Engine tests cover a photo question: success, empty recording, failure + retry
- [ ] `docs/` updated for the new Turn kind in the same commit
- [ ] `npm test` and `npm run build` green
