// Super Admin panel: shared contract. The panel is a build-time testing aid and must
// never run on the live published app. Hosts below are the Lovable preview/dev hosts.

/** True for the live published app (published .lovable.app address or any custom domain). */
export function isProductionHost(host: string | null | undefined): boolean {
  const h = (host ?? "").toLowerCase().split(":")[0] ?? "";
  if (!h) return true; // unknown host: treat as live, refuse
  if (h === "localhost" || h === "127.0.0.1") return false;
  if (h.endsWith(".lovableproject.com")) return false;
  if (h.startsWith("id-preview--") && h.endsWith(".lovable.app")) return false;
  if (h.includes("--") && h.endsWith(".lovable.app") && h.startsWith("preview")) return false;
  return true;
}

/** Pure access rule: admin AND setting on AND not the live build. */
export function devToolsAllowed(a: { isAdmin: boolean; settingOn: boolean; host: string | null | undefined }): boolean {
  return a.isAdmin && a.settingOn && !isProductionHost(a.host);
}

export const DEV_SECTIONS = ["goto", "restart"] as const;
export type DevSection = (typeof DEV_SECTIONS)[number];

