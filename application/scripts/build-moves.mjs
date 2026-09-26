// Builds lib/context/moves.json from people/jonathan/moves/moves.json (hand-written, sourced Moves).
// Renames `moment` to `stage` and adds `reviewed: false` unless the source already says otherwise.
// Run: node scripts/build-moves.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SRC = join(here, "../../people/jonathan/moves/moves.json");
const OUT = join(here, "../lib/context/moves.json");

const moves = JSON.parse(readFileSync(SRC, "utf8")).map((m) => ({
  id: m.id,
  type: m.type,
  stage: m.moment,
  slot: m.slot,
  english: m.english,
  centralThai: m.centralThai,
  khamMueang: m.khamMueang ?? null,
  romanised: { central: m.romanised.central, khamMueang: m.romanised.khamMueang ?? null },
  ...(m.trigger && { trigger: m.trigger }),
  ...(m.tone && { tone: m.tone }),
  confidence: m.confidence,
  reviewed: m.reviewed === true,
}));

writeFileSync(OUT, JSON.stringify(moves, null, 1) + "\n");
console.log(`moves.json: ${moves.length} moves, ${moves.filter((m) => m.reviewed).length} reviewed`);
