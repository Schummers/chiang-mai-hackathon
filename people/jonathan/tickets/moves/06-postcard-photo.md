# 06: Photo on the Postcard

**What to build:** before the Postcard is made, the Visitor can take a photo of the dish; the Postcard then uses it as its background, with the text and logo on a readable band on top. Skipping the photo gives the plain Postcard from 05.

**Blocked by:** 05

**Status:** parked (2026-09-27), not a priority. Jonathan is not sure the Postcard is a good idea: brainstorm whether it earns its place before any build. Wireframe v1 exists: `people/jonathan/wireframes/postcard-v1.html`.

- [ ] "Add a photo" step with `<input type="file" accept="image/*" capture="environment">`: opens the camera on a phone, no permission code of our own
- [ ] Photo cropped to the Postcard ratio, text band at the bottom with enough contrast on any photo
- [ ] Photo stays on the device, never uploaded
- [ ] "Skip" gives the 05 Postcard unchanged
- [ ] Checked on iOS Safari and Android Chrome
- [ ] `npm run build` green
