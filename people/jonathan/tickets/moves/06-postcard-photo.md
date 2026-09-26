# 06: Photo on the Postcard

**What to build:** before the Postcard is made, the Visitor can take a photo of the dish; the Postcard then uses it as its background, with the text and logo on a readable band on top. Skipping the photo gives the plain Postcard from 05.

**Blocked by:** 05

**Status:** ready-for-agent

- [ ] "Add a photo" step with `<input type="file" accept="image/*" capture="environment">`: opens the camera on a phone, no permission code of our own
- [ ] Photo cropped to the Postcard ratio, text band at the bottom with enough contrast on any photo
- [ ] Photo stays on the device, never uploaded
- [ ] "Skip" gives the 05 Postcard unchanged
- [ ] Checked on iOS Safari and Android Chrome
- [ ] `npm run build` green
