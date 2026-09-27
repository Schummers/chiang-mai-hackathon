# Context Pack: local knowledge in the prompt

## Pipeline

```
people/luke/lanna-context/*.json      Luke's research, every fact with a source and a confidence
  -> scripts/build-pack.mjs            keeps Trusted entries only (high or medium confidence), app fields only
  -> lib/context/pack.json             generated, never edit by hand
  -> lib/context/pack.ts               typed import (PACK)
  -> lib/server/prompt.ts              guide() in the system prompt; seasonal() in the <local_time> block
```

Current pack: 35 dishes, 51 produce items, 182 Kham Mueang words, 6 false friends, 12 months of climate and 34 festival dates. Royal days are left out on purpose (a topic to avoid).

## What goes in the prompt

- **System prompt (static, cached):** false friends; every dish (Thai / Northern name, romanised, English, ingredients); every produce item with the months it's in season; every Kham Mueang word with its Central Thai equivalent. It doesn't depend on the date, so the cache holds all month.
- **`<local_time>` block (per Turn, only with the guide on):** this month's season and weather line, plus festivals within two weeks.

The model uses the guide to correct mishearings, spell names, and write cards (ingredients drive allergy and diet risks). It is told the guide isn't exhaustive and to fall back on its own knowledge.

## Size and cost

- About 13k tokens with the rules.
- Measured about 0.5 s slower per Turn than no guide, even when cached. Output tokens dominate latency.
- Luke's full data (~1M tokens raw) can't go into a prompt. If recall on niche words is poor, the next step is retrieval (string or phonetic match on the transcript), not a bigger prompt.

## Changing it

- Luke updates his JSON: run `node scripts/build-pack.mjs` in `application/` and commit `pack.json`. Check `git diff lib/context/pack.json`; the script doesn't validate his JSON.
- Prompt rules: `lib/server/prompt.ts`. Tests: `lib/server/prompt.test.ts`.
