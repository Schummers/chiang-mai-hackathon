import { nearbyFood } from "@/lib/server/places";

export const maxDuration = 15;

/** POST { lat, lng, accuracy } -> NearbyPlaces. The position is sent to Google only, never stored or logged. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { lat?: unknown; lng?: unknown; accuracy?: unknown };
  const lat = Number(body.lat);
  const lng = Number(body.lng);
  const accuracy = Number(body.accuracy);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return Response.json({ error: "bad position" }, { status: 400 });
  }
  try {
    return Response.json(await nearbyFood({ lat, lng }, Number.isFinite(accuracy) && accuracy > 0 ? accuracy : 50));
  } catch (e) {
    console.error("places", e instanceof Error ? e.message : e);
    return Response.json({ error: "places failed" }, { status: 502 });
  }
}
