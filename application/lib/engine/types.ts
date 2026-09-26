// Contract between the UI and the turn service. See spec issue #1.
// The back-end (#12) plugs in by implementing TurnService; nothing else changes.

export type Speaker = "you" | "vendor";

export type ErrorReason = "mic-denied" | "network" | "empty";

export type Phase =
  | { kind: "idle"; nextTurn: Speaker }
  | { kind: "listening"; speaker: Speaker; startedAt: number }
  | { kind: "processing"; speaker: Speaker; raw?: string }
  /** `raw` is kept when transcription worked, so a retry only translates again. */
  | { kind: "error"; speaker: Speaker; reason: ErrorReason; raw?: string };

export type CardKind = "dish" | "word" | "moment";

export type ContextCard = {
  /** What the card explains. Missing means "dish" (the mock and older cards). */
  kind?: CardKind;
  /** True when the model wrote it because the dish is not in the Context Pack. */
  offGuide?: boolean;
  /** Dish or ingredient name in Latin script, e.g. "Khao Soi". */
  name: string;
  /** Thai name, e.g. "ข้าวซอย". */
  nameThai?: string;
  /** One or two lines: what it actually is. */
  description: string;
  /** Main meat or protein, e.g. "Chicken". */
  meat?: string;
  /** 0 = not spicy, 1 = mild, 2 = medium, 3 = hot. */
  spice?: 0 | 1 | 2 | 3;
  /** One line anchoring it in Chiang Mai: when or how locals eat it. */
  localDetail?: string;
  /** Risk based on My info. A flag to double-check, never a guarantee. */
  warning?: string;
};

export type Message = {
  id: string;
  speaker: Speaker;
  /** Big text: what the reader of this bubble reads. Thai for your messages, your language for the vendor's. */
  translation: string[];
  /** Small text: what was actually said. */
  original: string[];
  card: ContextCard | null;
  /** Visitor's messages only: syllable phonetics of each Thai item, for Say it yourself. */
  romanised?: string[];
};

export type Allergy = "peanuts" | "shellfish" | "gluten" | "other";
export type Spice = "none" | "mild" | "thai-hot";
export type Diet = "no-pork" | "vegetarian" | "halal";

export type MyInfo = {
  allergies: Allergy[];
  spice: Spice | null;
  diet: Diet[];
};

export const EMPTY_MY_INFO: MyInfo = { allergies: [], spice: null, diet: [] };

/** BCP 47 code of the visitor's language, e.g. "en", "fr". Thai is always the other side. */
export type UserLanguage = string;

export type TranslateInput = {
  raw: string;
  speaker: Speaker;
  userLanguage: UserLanguage;
  myInfo: MyInfo;
  history: Message[];
};

export type TranslateResult = {
  translation: string[];
  original: string[];
  card: ContextCard | null;
  /** Visitor's Turns only: syllable phonetics of each Thai item, e.g. "a-ròi mâak kráp". */
  romanised?: string[];
  /** Info the visitor said aloud ("I'm allergic to peanuts"), to pre-tick My info. */
  detectedInfo?: Partial<MyInfo>;
};

export interface TurnService {
  /** Audio to raw text. `language` is "th" for the vendor, the user language for you. */
  transcribe(audio: Blob, language: string): Promise<string>;
  translate(input: TranslateInput): Promise<TranslateResult>;
  /** Optional: called when the visitor starts a new conversation. */
  reset?(): void;
}
