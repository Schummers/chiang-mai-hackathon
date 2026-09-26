# Front-end handoff: U Mueang (2026-09-27)

State of the front-end after the implementation session. Spec: issue #1. App: `application/`. Production: https://u-mueang.vercel.app (QR: `demo/qr-u-mueang.png`).

## Done (issues closed, each with a closing comment)

| # | Ticket | Commit |
|---|---|---|
| 2 | Bootstrap: Next.js app on Vercel | 5ca9d45 |
| 3 | Conversation engine + mock turn service | 2fa31cd |
| 4 | Chat thread: bubbles, big/small, bullets, new conversation | c04670a |
| 5 | Action bar + recording, Listening card, auto-stop | 4445d51 |
| 9 | My info: compact card, page, stored on the phone | f875941 |
| 8 | Context card: dish, spice meter, local detail, allergy flag | 998266f |
| 7 | Speech: speaker button, Thai auto-play | e4bea61 |
| 6 | Animations: running light, raw to final, pulse | 202872c |
| 10 | Language picker under your mic | e3624c2 |
| 11 | Errors: retry, mic denied, too short, offline | 1a384dd |

35 Vitest tests (engine, My info, language), `build` and `lint` pass. Everything runs on the Khao Soi mock.

## TBD settled the simple way (to confirm)

- Folder `application/`. `prototype/` kept and marked frozen: its fate is the tech lead's call.
- Vercel project `u-mueang` on jonathan's account, Git connected (root directory `application`). Every push to `main` deploys production. Preview URLs are behind Vercel login.
- Turn service contract = the spec's, plus an optional `reset()`. `NEXT_PUBLIC_TURN_SERVICE=api` switches to `POST /api/transcribe` (FormData `audio`, `language` -> `{ raw }`) and `POST /api/translate` (JSON -> `TranslateResult`). **To confirm with the tech lead (#12).**
- Context card shape = the mock's, plus optional `localDetail` (from `CONTEXT.md`). To confirm with the back-end.
- Recording: auto-stop after 1.5 s of silence once a voice was heard, 6 s if nobody speaks, hard cap 30 s, recordings under 0.6 s dropped. Fixed voice threshold.
- Service timeout: 15 s per call, then an error bubble with Retry (the turn is kept).
- Languages: English, Français, Deutsch, Español, Italiano, 中文. "Other allergy" is a chip without a text field.

## Not verified

- **Nothing tested on a real iPhone or Android yet**: mic, Thai auto-play on iOS, Thai voice on Android.
- The Retry bubble was never seen on screen (the mock never fails): covered by engine tests only.
- Vendor-side Thai texts to be checked by a Thai teammate: เชื่อมต่อไม่ได้ ข้อความยังอยู่, ลองอีกครั้ง, ไม่ได้ยินครับ กดไมค์แล้วพูดอีกครั้ง, ไม่มีอินเทอร์เน็ต, กำลังแปล…, กำลังถอดเสียง….
- The mock always answers in English, whatever the language picked.

## Next

1. Code review of the whole front-end (`942a1de...HEAD -- application/`): launched in another session, act on its findings.
2. #13 demo readiness: device check on both phones, backup video. QR already done.
3. #12 back-end (tech lead): implement `TurnService` behind the two API routes, then set `NEXT_PUBLIC_TURN_SERVICE=api` in Vercel.
