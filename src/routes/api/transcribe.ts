// Microphone: turns a short recording into text with Lovable AI speech-to-text. Signed-in students only,
// and only with guardian voice consent. The recording is not stored.
import { createFileRoute } from "@tanstack/react-router";

const MAX = 4 * 1024 * 1024;

export const Route = createFileRoute("/api/transcribe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
        if (!token) return Response.json({ error: "Please sign in" }, { status: 401 });
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: u } = await supabaseAdmin.auth.getUser(token);
        if (!u.user) return Response.json({ error: "Please sign in" }, { status: 401 });
        const [{ data: consent }, { data: admin }] = await Promise.all([
          supabaseAdmin.from("consents").select("granted").eq("student_id", u.user.id).eq("scope", "voice").order("created_at", { ascending: false }).limit(1).maybeSingle(),
          supabaseAdmin.rpc("has_role", { _user_id: u.user.id, _role: "admin" }),
        ]);
        if (!consent?.granted && !admin) return Response.json({ error: "consent" }, { status: 403 });
        const form = await request.formData();
        const file = form.get("file");
        if (!(file instanceof File) || !file.size || file.size > MAX || !/^(audio|video)\/(webm|ogg|mp4|mpeg|wav|x-m4a|m4a|aac)/.test(file.type || "audio/webm")) return Response.json({ error: "Bad recording" }, { status: 400 });
        const { elevenKey, elevenTranscribe, readVoiceConfig } = await import("@/server/providers/elevenlabs.server");
        const cfg = await readVoiceConfig().catch(() => null);
        // The mic keeps using ElevenLabs listening even when Fiti speaks with Gemini.
        if ((cfg?.provider === "elevenlabs" || cfg?.provider === "gemini") && elevenKey()) {
          try { return Response.json({ text: (await elevenTranscribe(file)).slice(0, 600) }); }
          catch (e) { console.error("elevenlabs listening failed, using backup", e instanceof Error ? e.message : e); }
        }
        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return Response.json({ error: "Voice is not set up" }, { status: 500 });
        const body = new FormData();
        body.append("model", "openai/gpt-transcribe");
        const base = ((file.type || "audio/webm").split(";")[0] ?? "audio/webm").replace(/^video\//, "audio/");
        const ext = base.includes("mp4") || base.includes("m4a") ? "m4a" : base.includes("ogg") ? "ogg" : base.includes("wav") ? "wav" : base.includes("mpeg") ? "mp3" : "webm";
        body.append("file", new File([await file.arrayBuffer()], `speech.${ext}`, { type: base }));
        body.append("response_format", "json");
        body.append("stream", "true");
        body.append("prompt", "A Nigerian secondary-school student talking to a maths tutor about gradient, lines and graphs.");
        const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", { method: "POST", headers: { Authorization: `Bearer ${key}`, "X-Lovable-AIG-SDK": "fetch" }, body });
        if (!res.ok || !res.body) {
          const msg = res.status === 402 ? "Voice is paused for now." : "I couldn't hear that. Please try again or type.";
          console.error("transcribe failed", res.status, await res.text().catch(() => ""));
          return Response.json({ error: msg }, { status: res.status === 402 || res.status === 403 || res.status === 429 ? res.status : 502 });
        }
        const reader = res.body.getReader(); const dec = new TextDecoder();
        let buf = "", text = "", done = "";
        for (;;) {
          const { done: end, value } = await reader.read();
          if (end) break;
          buf += dec.decode(value, { stream: true }).replace(/\r\n/g, "\n");
          let i: number;
          while ((i = buf.indexOf("\n\n")) >= 0) {
            const frame = buf.slice(0, i); buf = buf.slice(i + 2);
            for (const l of frame.split("\n")) {
              if (!l.startsWith("data:")) continue;
              try {
                const ev = JSON.parse(l.slice(5).trim()) as { type?: string; delta?: string; text?: string };
                if (ev.type === "transcript.text.delta" && ev.delta) text += ev.delta;
                if (ev.type === "transcript.text.done" && ev.text) done = ev.text;
              } catch { /* partial */ }
            }
          }
        }
        for (const l of buf.split("\n")) {
          if (!l.startsWith("data:")) continue;
          try { const ev = JSON.parse(l.slice(5).trim()) as { type?: string; delta?: string; text?: string }; if (ev.type === "transcript.text.done" && ev.text) done = ev.text; else if (ev.type === "transcript.text.delta" && ev.delta) text += ev.delta; } catch { /* end */ }
        }
        return Response.json({ text: (done || text).trim().slice(0, 600) });
      },
    },
  },
});
