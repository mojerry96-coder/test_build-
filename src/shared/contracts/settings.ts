// System settings live in the rules table but are NOT lesson content.
// The content import must never write them; only an admin may change them.
export const SYSTEM_SETTING_KEYS = [
  "dev_open_access",
  "allowed_email_domains",
  "ai_provider",
  "voice_provider",
  "elevenlabs_voice_id",
  "elevenlabs_model_id",
  "elevenlabs_voice_settings",
  "gemini_voice_name",
  "gemini_voice_style",
  "tutor_display_name",
  "fiti_voice_id",
  "dev_tools_enabled",
] as const;
export type SystemSettingKey = (typeof SYSTEM_SETTING_KEYS)[number];

export function isSystemSettingKey(key: string): key is SystemSettingKey {
  return (SYSTEM_SETTING_KEYS as readonly string[]).includes(key);
}

/**
 * Mirrors public.handle_new_user(): a new account gets the student role only
 * while dev_open_access is on and the email domain is allowed (empty list = any).
 */
export function shouldAutoAssignStudent(devOpenAccess: boolean, allowedDomains: string[], email: string | null): boolean {
  if (!devOpenAccess) return false;
  if (allowedDomains.length === 0) return true;
  const domain = (email ?? "").split("@")[1]?.toLowerCase() ?? "";
  return allowedDomains.some((d) => d.toLowerCase() === domain);
}
