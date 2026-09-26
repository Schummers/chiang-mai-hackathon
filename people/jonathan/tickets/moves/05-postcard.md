# 05: Postcard

**What to build:** when the Visitor taps the Say it "thank you" Move at Stage leave (or a "Make my postcard" action in the dock menu), the app makes an image that sums up the exchange and offers to save it. The share sheet's "Save image" puts it in the phone's Photos: the memory lives in the camera roll, not in an app nobody reopens.

**Blocked by:** 02, and the Postcard wireframe validated by Jonathan (`handoff-postcard.md`)

**Status:** parked (2026-09-27), not a priority. Jonathan is not sure the Postcard is a good idea: brainstorm whether it earns its place before any build. Wireframe v1 exists: `people/jonathan/wireframes/postcard-v1.html`.

- [ ] Content: "Today I learned" + the Thai word the Visitor said (the last Say it or Echo Move played, Kham Mueang when present) with its meaning; the dish name from the last dish Mention; one line of the Vendor's reply, verbatim in Thai; place (pack `place.name`) and date; app logo
- [ ] Rendered in the browser to a PNG (a canvas, or a small library such as `html-to-image`), portrait, story-friendly ratio
- [ ] Save with `navigator.share({ files })` when supported, download link otherwise
- [ ] No server round-trip, nothing stored
- [ ] Works on iOS Safari (share sheet shows "Save image")
- [ ] `npm run build` green
