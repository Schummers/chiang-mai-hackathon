// Builds lib/context/moves.json from people/jonathan/moves/moves.json (hand-written, sourced Moves).
// Renames `moment` to `stage` and adds `reviewed: false` unless the source already says otherwise.
// Echo Moves carry `echo` { word, meaning?, reply }: the word the card explains, what it means, the reply in English.
// The source's `slot: "word"` (Echo) fills nothing, so it becomes `none`.
// Run: node scripts/build-moves.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SRC = join(here, "../../people/jonathan/moves/moves.json");
const OUT = join(here, "../lib/context/moves.json");

const moves = JSON.parse(readFileSync(SRC, "utf8")).map((m) => {
  if (m.type === "echo" && !(m.echo?.word && m.echo?.reply))
    throw new Error(`${m.id}: an Echo needs echo.word and echo.reply`);
  return {
    id: m.id,
    type: m.type,
    stage: m.moment,
    slot: m.slot === "word" ? "none" : m.slot,
    english: m.english,
    centralThai: m.centralThai,
    khamMueang: m.khamMueang ?? null,
    romanised: {
      central: m.romanised.central,
      khamMueang: m.romanised.khamMueang ?? null,
    },
    ...(m.trigger && { trigger: m.trigger }),
    ...(m.echo && { echo: m.echo }),
    ...(m.tone && { tone: m.tone }),
    confidence: m.confidence,
    reviewed: m.reviewed === true,
  };
});

writeFileSync(OUT, JSON.stringify(moves, null, 1) + "\n");
console.log(
  `moves.json: ${moves.length} moves, ${moves.filter((m) => m.reviewed).length} reviewed`,
);
