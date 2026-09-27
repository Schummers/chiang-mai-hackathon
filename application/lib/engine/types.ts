// Contract between the UI, the conversation engine and /api/translate.

/** "me" owns the phone and set up the app (a visitor or a shopkeeper). "them" is the person across the counter. */
export type Side = "me" | "them";

/** BCP 47 language code, e.g. "en", "th". */
export type LanguageCode = string;

export type Languages = { me: LanguageCode; them: LanguageCode };

export type ErrorReason = "mic-denied" | "no-speech-api" | "network" | "empty";

export type Phase =
  | { kind: "idle"; nextTurn: Side }
  | { kind: "listening"; side: Side; startedAt: number }
  /** `heard` is the raw speech-to-text (or a tapped suggestion), shown while the model corrects and translates it. */
  | { kind: "processing"; side: Side; heard: string }
  /** `heard` is kept when there was something to translate, so Retry only calls the model again. */
  | { kind: "error"; side: Side; reason: ErrorReason; heard?: string };

/** Written by the model under a Turn, in the owner's language, for the owner only. */
export type ContextCard = {
  heading: string;
  /** Thai spelling of the heading when it is a Thai term and the owner does not read Thai. */
  headingThai?: string;
  /** Exactly two short sentences. */
  body: string;
  /** A follow-up the owner can send to the other person in one tap, in the owner's language. */
  suggestion?: string;
};

export type Message = {
  id: string;
  side: Side;
  /** What speech-to-text produced, before correction. */
  heard: string;
  /** What the speaker most plausibly said, corrected, in the speaker's language. */
  original: string;
  /** `original` in the listener's language. */
  translation: string;
  cards: ContextCard[];
};

export type Allergy = "peanuts" | "shellfish" | "gluten" | "other";
export type Spice = "none" | "mild" | "thai-hot";
export type Diet = "no-pork" | "vegetarian" | "halal";
/** Polite particle when the owner's words come out in Thai: "m" ครับ, "f" ค่ะ. */
export type Particle = "m" | "f";

/** The owner's saved profile. Everything but `notes` is picked from chips. */
export type MyInfo = {
  allergies: Allergy[];
  spice: Spice | null;
  diet: Diet[];
  particle?: Particle;
  /** Free text: an unlisted allergy, what they are after, or a shopkeeper's specials of the day. */
  notes?: string;
};

export const EMPTY_MY_INFO: MyInfo = { allergies: [], spice: null, diet: [] };

/** A food place near the phone, from Google Maps. */
export type NearbyPlace = {
  name: string;
  /** Google's label for the main type, e.g. "Noodle shop". */
  type?: string;
  distanceM: number;
  rating?: number;
  ratingCount?: number;
  /** "inexpensive", "moderate"… */
  price?: string;
  summary?: string;
  openNow?: boolean;
};

export type NearbyPlaces = {
  /** GPS accuracy radius in metres. */
  accuracyM: number;
  /** Food places close to the phone, nearest first. */
  food: NearbyPlace[];
  /** Markets and food courts in a wider radius, nearest first: the phone may be inside one. */
  markets: NearbyPlace[];
};

/** Optional context sent with a Turn. Each part is left out when its switch is off in Settings. */
export type TurnContext = {
  profile?: Omit<MyInfo, "notes">;
  notes?: string;
  places?: NearbyPlaces;
  /** `now` is an ISO timestamp, `timeZone` an IANA name, both from the browser. */
  time?: { now: string; timeZone: string };
};

export type TranslateOptions = {
  /** Let the model write context cards. */
  cards: boolean;
  /** Put the Northern Thai guide (Luke's Context Pack) in the system prompt. */
  pack: boolean;
};

/** A past Turn as the model sees it. */
export type HistoryTurn = Pick<Message, "side" | "original" | "translation"> & { cards?: Pick<ContextCard, "heading">[] };

export type TranslateInput = {
  side: Side;
  heard: string;
  languages: Languages;
  history: HistoryTurn[];
  context: TurnContext;
  options: TranslateOptions;
};

export type TranslateResult = {
  original: string;
  translation: string;
  cards: ContextCard[];
};

/** /api/translate streams one JSON event per line: `text` as soon as the translation is complete, then `done` or `error`. */
export type TranslateEvent =
  | { type: "text"; original: string; translation: string }
  | { type: "done"; result: TranslateResult }
  | { type: "error" };
