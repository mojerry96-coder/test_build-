import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { getDevToolsSettingFn } from "@/lib/api/admin-settings.functions";
import { updateSettingFn } from "@/lib/api/settings.functions";

export const Route = createFileRoute("/_authenticated/admin_/settings")({
  head: () => ({
    meta: [
      { title: "Admin · Settings · uLesson Tutor" },
      { name: "description", content: "Admin settings for uLesson Tutor." },
      { property: "og:title", content: "Admin · Settings · uLesson Tutor" },
      { property: "og:description", content: "Admin settings for uLesson Tutor." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const get = useServerFn(getDevToolsSettingFn);
  const save = useServerFn(updateSettingFn);
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery({ queryKey: ["dev-tools-setting"], queryFn: () => get() });
  const [busy, setBusy] = useState(false);
  const toggle = async (on: boolean) => {
    setBusy(true);
    try { await save({ data: { key: "dev_tools_enabled", value: on } }); await qc.invalidateQueries({ queryKey: ["dev-tools-setting"] }); await qc.invalidateQueries({ queryKey: ["dev-tools-access"] }); }
    finally { setBusy(false); }
  };
  const toggleAi = async (on: boolean) => {
    setBusy(true);
    try { await save({ data: { key: "ai_provider", value: on ? "lovable_ai" : "mock" } }); await qc.invalidateQueries({ queryKey: ["dev-tools-setting"] }); }
    finally { setBusy(false); }
  };
  const [voice, setVoice] = useState<string | null>(null);
  const saveVoice = async () => {
    setBusy(true);
    try { await save({ data: { key: "fiti_voice_id", value: (voice ?? "").trim() } }); await qc.invalidateQueries({ queryKey: ["dev-tools-setting"] }); setVoice(null); }
    finally { setBusy(false); }
  };
  return (
    <main className="mx-auto max-w-2xl px-5 py-8">
      <Link to="/admin" className="text-sm text-muted-foreground underline">← Admin</Link>
      <h1 className="mt-2 text-3xl font-bold">Settings</h1>
      {isError ? <p className="mt-6">Not available</p> : (
        <label className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-border p-6">
          <span>
            <span className="block font-semibold">Admin tools</span>
            <span className="block text-sm text-muted-foreground">Testing panel for admins. Never shows on the live app. Turn off before launch.</span>
          </span>
          <Switch checked={!!data?.enabled} disabled={isLoading || busy} onCheckedChange={toggle} aria-label="Admin tools" />
        </label>
      )}
      {!isError && (
        <label className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-border p-6">
          <span>
            <span className="block font-semibold">AI answers</span>
            <span className="block text-sm text-muted-foreground">The tutor uses AI to understand messages and write short checked answers. Off: only the word list and approved lines.</span>
          </span>
          <Switch checked={!!data?.aiOn} disabled={isLoading || busy} onCheckedChange={toggleAi} aria-label="AI answers" />
        </label>
      )}
      {!isError && (
        <form className="mt-4 rounded-2xl border border-border p-6" onSubmit={(e) => { e.preventDefault(); void saveVoice(); }}>
          <label htmlFor="voice-id" className="block font-semibold">Fiti voice ID</label>
          <span className="block text-sm text-muted-foreground">ElevenLabs voice ID. Empty: captions only. Voice also needs the ElevenLabs key.</span>
          <div className="mt-3 flex gap-2">
            <input id="voice-id" value={voice ?? data?.voiceId ?? ""} onChange={(e) => setVoice(e.target.value.slice(0, 64))}
              className="h-10 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 text-sm" />
            <button type="submit" disabled={busy || voice === null} className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50">Save</button>
          </div>
        </form>
      )}
    </main>
  );
}
