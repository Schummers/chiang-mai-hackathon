"use client";

import { useSyncExternalStore } from "react";
import type { NearbyPlaces } from "./engine/types";

export type Coords = { lat: number; lng: number; accuracy: number };

export type LocationState =
  | { status: "off" }
  | { status: "locating" }
  | { status: "denied" }
  | { status: "unavailable"; reason: string }
  /** `places` is null when the Google Maps lookup failed; the position alone is still kept. */
  | { status: "ready"; coords: Coords; places: NearbyPlaces | null };

/** Refetch places only after moving this far, and not more often than every REFRESH_MS. */
const MOVE_M = 40;
const REFRESH_MS = 30_000;

let state: LocationState = { status: "off" };
const listeners = new Set<() => void>();
let watchId: number | undefined;
let lastFetch: { coords: Coords; at: number } | undefined;
let permission: PermissionStatus | undefined;
let run = 0;

function set(next: LocationState) {
  state = next;
  listeners.forEach((l) => l());
}

export const locationStore = {
  get: () => state,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export const useLocation = () => useSyncExternalStore(locationStore.subscribe, locationStore.get, () => state);

/** What goes into the prompt: the places, or nothing. */
export const currentPlaces = (): NearbyPlaces | undefined => (state.status === "ready" ? (state.places ?? undefined) : undefined);

function metres(a: Coords, b: Coords) {
  const rad = Math.PI / 180;
  const x = (b.lng - a.lng) * rad * Math.cos(((a.lat + b.lat) / 2) * rad);
  const y = (b.lat - a.lat) * rad;
  return Math.sqrt(x * x + y * y) * 6_371_000;
}

async function fetchPlaces(coords: Coords): Promise<NearbyPlaces | null> {
  try {
    const res = await fetch("/api/places", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ lat: coords.lat, lng: coords.lng, accuracy: coords.accuracy }),
    });
    return res.ok ? ((await res.json()) as NearbyPlaces) : null;
  } catch {
    return null;
  }
}

async function onPosition(pos: GeolocationPosition, current: number) {
  const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy };
  const prev = lastFetch;
  const stale = !prev || (metres(prev.coords, coords) > MOVE_M && Date.now() - prev.at > REFRESH_MS);
  if (!stale) {
    if (state.status === "ready") set({ ...state, coords });
    return;
  }
  lastFetch = { coords, at: Date.now() };
  const places = await fetchPlaces(coords);
  if (current !== run) return;
  set({ status: "ready", coords, places });
}

function onError(err: GeolocationPositionError, current: number) {
  if (current !== run || state.status === "ready") return;
  if (err.code === err.PERMISSION_DENIED) return set({ status: "denied" });
  set({ status: "unavailable", reason: err.code === err.TIMEOUT ? "Location timed out" : "Location unavailable" });
}

function watch(current: number) {
  if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
  watchId = navigator.geolocation.watchPosition(
    (pos) => void onPosition(pos, current),
    (err) => onError(err, current),
    { enableHighAccuracy: true, timeout: 20_000, maximumAge: 30_000 },
  );
}

/**
 * Starts location on app load. Asks for permission when it was never given (the browser shows its prompt),
 * stays quiet when it was denied, and picks up again if the person allows it later in site settings.
 */
export async function startLocation() {
  const current = ++run;
  if (typeof navigator === "undefined" || !navigator.geolocation) return set({ status: "unavailable", reason: "No location on this browser" });
  if (!window.isSecureContext) return set({ status: "unavailable", reason: "Location needs HTTPS" });
  try {
    permission ??= await navigator.permissions?.query({ name: "geolocation" });
    if (permission) {
      permission.onchange = () => {
        if (state.status === "off") return;
        if (permission?.state === "denied") stopWatch();
        void startLocation();
      };
    }
  } catch {
    // Permissions API missing (older Safari): just ask.
  }
  if (current !== run) return;
  if (permission?.state === "denied") return set({ status: "denied" });
  if (state.status !== "ready") set({ status: "locating" });
  watch(current);
}

function stopWatch() {
  if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
  watchId = undefined;
}

/** Feature switched off: stop watching and forget the position. */
export function stopLocation() {
  run++;
  stopWatch();
  lastFetch = undefined;
  set({ status: "off" });
}

/** "Try again" in Settings: a fresh fix and fresh places. */
export function refreshLocation() {
  lastFetch = undefined;
  void startLocation();
}
