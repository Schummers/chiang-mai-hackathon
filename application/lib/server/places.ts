import type { NearbyPlace, NearbyPlaces } from "@/lib/engine/types";

const API = "https://places.googleapis.com/v1/places:searchNearby";

const FOOD_TYPES = [
  "restaurant",
  "cafe",
  "coffee_shop",
  "bakery",
  "bar",
  "meal_takeaway",
  "food_court",
  "market",
  "dessert_shop",
  "juice_shop",
  "tea_house",
  "ice_cream_shop",
];
const MARKET_TYPES = ["market", "food_court"];

/** Close enough to be where the conversation happens. Widened once when nothing is that close. */
export const FOOD_RADIUS_M = 75;
const FOOD_WIDE_RADIUS_M = 250;
/** Markets are big: a phone deep inside one can be a few hundred metres from its pin. */
export const MARKET_RADIUS_M = 400;

/**
 * Google types every stall inside a market as "market" too (and some fabric shops). The markets list only keeps
 * places named like one: ตลาด / กาด (Kham Mueang for market) / market / food court / ศูนย์อาหาร.
 */
const MARKET_NAME = /ตลาด|กาด|ศูนย์อาหาร|\bmarket\b|\bkad\b|\bkat\b|\btalat\b|\btalad\b|food\s*court|bazaar|walking street/i;

const FIELDS = [
  "places.displayName",
  "places.primaryTypeDisplayName",
  "places.location",
  "places.rating",
  "places.userRatingCount",
  "places.priceLevel",
  "places.editorialSummary",
  "places.currentOpeningHours.openNow",
  "places.businessStatus",
].join(",");

export type GooglePlace = {
  displayName?: { text?: string };
  primaryTypeDisplayName?: { text?: string };
  location?: { latitude: number; longitude: number };
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string;
  editorialSummary?: { text?: string };
  currentOpeningHours?: { openNow?: boolean };
  businessStatus?: string;
};

export type LatLng = { lat: number; lng: number };

/** Great-circle distance in metres. */
export function distanceM(a: LatLng, b: LatLng): number {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * 6_371_000 * Math.asin(Math.sqrt(h));
}

const PRICE: Record<string, string> = {
  PRICE_LEVEL_FREE: "free",
  PRICE_LEVEL_INEXPENSIVE: "inexpensive",
  PRICE_LEVEL_MODERATE: "moderate",
  PRICE_LEVEL_EXPENSIVE: "expensive",
  PRICE_LEVEL_VERY_EXPENSIVE: "very expensive",
};

/** Open places only, with a name and a pin, nearest first. */
export function rankPlaces(places: GooglePlace[], from: LatLng, limit: number): NearbyPlace[] {
  return places
    .filter((p) => p.displayName?.text && p.location && (!p.businessStatus || p.businessStatus === "OPERATIONAL"))
    .map((p) => ({
      name: p.displayName!.text!,
      ...(p.primaryTypeDisplayName?.text && { type: p.primaryTypeDisplayName.text }),
      distanceM: Math.round(distanceM(from, { lat: p.location!.latitude, lng: p.location!.longitude })),
      ...(p.rating !== undefined && { rating: p.rating }),
      ...(p.userRatingCount !== undefined && { ratingCount: p.userRatingCount }),
      ...(p.priceLevel && PRICE[p.priceLevel] && { price: PRICE[p.priceLevel] }),
      ...(p.editorialSummary?.text && { summary: p.editorialSummary.text }),
      ...(p.currentOpeningHours?.openNow !== undefined && { openNow: p.currentOpeningHours.openNow }),
    }))
    .sort((a, b) => a.distanceM - b.distanceM)
    .slice(0, limit);
}

export const looksLikeMarket = (name: string) => MARKET_NAME.test(name);

async function searchNearby(from: LatLng, types: string[], radius: number, max: number): Promise<GooglePlace[]> {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) throw new Error("GOOGLE_MAPS_API_KEY is not set");
  const res = await fetch(API, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": key, "x-goog-fieldmask": FIELDS },
    signal: AbortSignal.timeout(6000),
    body: JSON.stringify({
      includedTypes: types,
      maxResultCount: max,
      rankPreference: "DISTANCE",
      languageCode: "en",
      locationRestriction: { circle: { center: { latitude: from.lat, longitude: from.lng }, radius } },
    }),
  });
  if (!res.ok) throw new Error(`places ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return ((await res.json()) as { places?: GooglePlace[] }).places ?? [];
}

/** Food places around the phone plus markets it may be inside, each list nearest first. */
export async function nearbyFood(from: LatLng, accuracyM: number): Promise<NearbyPlaces> {
  // A poor fix (indoors, market roof) makes a tight circle meaningless: grow it with the accuracy.
  const radius = Math.min(FOOD_WIDE_RADIUS_M, Math.max(FOOD_RADIUS_M, accuracyM));
  const [close, markets] = await Promise.all([
    searchNearby(from, FOOD_TYPES, radius, 10),
    searchNearby(from, MARKET_TYPES, MARKET_RADIUS_M, 20),
  ]);
  const food = close.length || radius >= FOOD_WIDE_RADIUS_M ? close : await searchNearby(from, FOOD_TYPES, FOOD_WIDE_RADIUS_M, 6);
  return {
    accuracyM: Math.round(accuracyM),
    food: rankPlaces(food, from, 8),
    markets: rankPlaces(
      markets.filter((p) => looksLikeMarket(p.displayName?.text ?? "")),
      from,
      5,
    ),
  };
}
