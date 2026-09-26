# 02: Move cards on the thread

**What to build:** under a Turn, instead of the informative card, the Visitor sees one Move card with one action. Ordering a khao soi at a stall, the Visitor gets an Ask card ("Is this your family recipe?"), taps it, hears it in Thai, says it. When the Vendor says ซาว, an Echo card explains it and invites the Visitor to say it back. Dish, Word and Moment cards no longer show; the Allergy Flag card stays exactly as it is.

**Blocked by:** 01

**Status:** done (2026-09-27). iOS Safari first-tap audio still to check on a real iPhone.

- [x] Three card types share one component, labelled **Say it**, **Ask**, **Echo** (English labels, Visitor side)
- [x] Layout: Kham Mueang line big when present, Central Thai small below; romanised line under the Thai; English meaning last. Without Kham Mueang, Central Thai takes the big line
- [x] Echo card also shows what the Vendor's word meant ("ซาว = 20")
- [x] One tap on the card plays the Thai with `lib/speech.ts` (Kham Mueang text when present, since the phone voice reads Thai script). A second small control, "show the vendor", opens the Thai full screen, large type
- [x] A card never pushes the chat: same width and entry animation as today's card, collapses to one line after the next Turn
- [x] Playful Moves (`tone: "playful"`) carry no special styling; the joke is in the words
- [x] Informative Dish, Word and Moment cards removed from the thread; `cards.ts` keeps only what the Allergy Flag needs. The Off-guide dish card stays only when it carries a flag
- [ ] Checked on iOS Safari: the audio plays on the first tap (speak() runs inside the tap handler, as iOS requires; not yet run on a real iPhone)
- [x] `npm test` and `npm run build` green
