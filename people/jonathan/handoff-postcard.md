# Handoff: Postcard, wireframe first (2026-09-27)

Prompt for a new session. Jonathan wants to **see** the Postcard before anything goes to production.

---

You work with Jonathan (folder `people/jonathan/`) on the U Mueang hackathon app. Read the root `CLAUDE.md` first, then run `git pull --rebase`.

**Goal:** design the Postcard, the image a Visitor saves to their phone's Photos at the end of an exchange with a Thai food Vendor, then build it once Jonathan has validated a wireframe. Pitch of the app: "Don't just order. Make the vendor smile."

Read:
- `people/jonathan/CONTEXT.md`, section "Moves" (Postcard, Move, Say it, Echo).
- `people/jonathan/tickets/moves/05-postcard.md` and `06-postcard-photo.md`: the target content and constraints. They are blocked until the wireframe is validated.
- `people/jonathan/design system/DESIGN.md` (Kratip direction: paper, basket weave, tokens) and `people/jonathan/wireframes/cards-v1.html` as the format of an earlier wireframe.
- `people/jonathan/moves/moves.json` for real words to put on the mockups (e.g. a Say it or Echo with Kham Mueang).

**Step 1, wireframe (no app code):** write `people/jonathan/wireframes/postcard-v1.html`, a single static page showing **3 genuinely different directions** side by side at phone size, each with and without the dish photo (ticket 06). Content per the ticket: "Today I learned" + the Thai word said and its meaning, the dish name, one line of the Vendor's reply verbatim in Thai, place and date, logo. Also show **where it is triggered** in the flow (the "thank you" card at Stage leave, and the dock entry) as a small storyboard. Use placeholder photos (CSS gradients or an inline SVG), no real people, nothing personal: the repo is public. Give one recommendation in one sentence.

**Step 2:** open it for Jonathan, get his pick and changes, iterate. Commit and push the wireframe after each version (`jonathan: postcard wireframe vN`).

**Step 3, only after his explicit go:** update tickets 05 and 06 with the chosen direction (link the wireframe, adjust the boxes, set Status to ready-for-agent), then implement them in `application/` per `application/CLAUDE.md` and `application/docs/moves.md`. `npm test` and `npm run build` green, commit only your files, push to `main` (Vercel deploys production).

Rules: French in the chat, concise, no em dashes, no emojis. Ask questions in plain text.
