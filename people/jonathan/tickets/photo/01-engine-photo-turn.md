# 01 — Engine: photo turn and contract

**What to build:** the engine learns a second kind of Turn: a photo. The UI hands it an image, the engine goes into a `reading` phase, calls the turn service, and adds the photo and its card to the conversation. The mock service returns a fixed menu card so the whole flow runs without a key.

Contract to add in `lib/engine/types.ts` (names can change, the shape should not):

- `PhotoKind = "menu" | "dish" | "produce" | "sign"`
- `PhotoCard`: `kind`, `title`, `titleThai?`, `description`, and for `menu` a short `items` list (`name`, `nameThai?`, `note?`, `warning?` from About you). Reuse `ContextCard` fields where they fit.
- A photo message in the thread: `speaker: "you"`, the image (object URL, never uploaded anywhere but the read route), and its `PhotoCard` once read.
- `Phase` gets `{ kind: "reading"; startedAt: number }`.
- `TurnService.readPhoto(image: Blob, input: { userLanguage, myInfo }) => Promise<PhotoCard>`, optional so the current services still compile.

**Blocked by:** none.

**Status:** done

- [x] `engine.photo(image)` goes idle → reading → idle with a photo message holding its card
- [x] A failed or timed-out read gives an error phase with a retry that reads the same image again, no new photo needed
- [x] New conversation drops photos and revokes their object URLs
- [x] The mock returns a `menu` card with at least one item flagged from About you (peanuts)
- [x] Engine tests cover: success, failure + retry, stale result after a new conversation is ignored
- [x] `docs/contract.md` and `docs/architecture.md` updated in the same commit
- [x] `npm test` and `npm run build` green
