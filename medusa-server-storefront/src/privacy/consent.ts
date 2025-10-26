export async function ensureConsent(kind: "collect" | "track" | "transfer"): Promise<boolean> {
  if (typeof window === "undefined") return true;
  const granted = localStorage.getItem("pikit_consent") === "granted";
  if (granted) return true;
  const ok = window.confirm(`Allow ${kind}?`);
  if (ok) localStorage.setItem("pikit_consent", "granted");
  return ok;
}
