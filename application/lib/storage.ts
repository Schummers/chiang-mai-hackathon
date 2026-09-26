/** localStorage, or nothing: private mode and blocked storage throw on access, never crash the app. */
export const browserStorage = (): Storage | undefined => {
  try {
    return typeof window === "undefined" ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
};
