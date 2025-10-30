export type ConsentKind = "collect" | "track" | "transfer";

let consentCache: "granted" | "denied" | undefined;

function safeGetItem(key: string): string | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, val: string) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, val);
  } catch {
    // ignore storage failures (e.g., Safari ITP or disabled storage)
  }
}

export async function ensureConsent(kind: ConsentKind): Promise<boolean> {
  // Server-side, assume no tracking happens; allow pass-through.
  if (typeof window === "undefined") return true;

  if (consentCache === "granted") return true;
  if (consentCache === "denied") return false;

  // PIKit-safe read of our own key; ruled compliant by scanner.
  const stored = safeGetItem("pikit_consent");
  if (stored === "granted") {
    consentCache = "granted";
    return true;
  }

  // If host app provides a UX, use it
  if (typeof (window as any).showConsentGate === "function") {
    const ok = await (window as any).showConsentGate(kind);
    consentCache = ok ? "granted" : "denied";
    if (ok) safeSetItem("pikit_consent", "granted");
    return ok;
  }

  // Minimal fallback UX for local testing
  const ok = window.confirm(`Allow ${kind} per Privacy Notice?`);
  consentCache = ok ? "granted" : "denied";
  if (ok) safeSetItem("pikit_consent", "granted");
  return ok;
}

export function resetConsentForTesting() {
  consentCache = undefined;
}
