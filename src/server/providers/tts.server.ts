// ponytail: Edge TTS proof of concept. Unofficial Microsoft endpoint via msedge-tts; production swaps in
// Azure Speech, which serves the same en-NG voices with the same SSML. Off unless EDGE_TTS_VOICE is set
// (e.g. en-NG-EzinneNeural or en-NG-AbeoNeural). Only the server calls it; only approved tutor text goes in.

export const ttsVoice = (): string | null => process.env["EDGE_TTS_VOICE"]?.trim() || null;

const xml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Plain tutor text to the markup the voice reads, escaped (the library would paste it into XML as is, so an
 * "&" in a line would silently kill the clip). Punctuation pauses are the voice's own: the free Edge
 * endpoint closes the stream on <break> (checked 2026-10-21); Azure Speech accepts it with the same voices.
 */
export function toSsml(text: string, voice: string): string {
  const lang = voice.split("-").slice(0, 2).join("-") || "en-NG";
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${lang}"><voice name="${voice}"><prosody rate="-10%">${xml(text.trim())}</prosody></voice></speak>`;
}

const TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
const WSS = "https://api.msedgeservices.com/tts/cognitiveservices/websocket/v1";
const FORMAT = "audio-24khz-48kbitrate-mono-mp3";

async function secMsGec(): Promise<string> {
  const ticks = Math.floor(Date.now() / 1000) + 11644473600;
  const data = new TextEncoder().encode(`${(ticks - (ticks % 300)) * 10000000}${TOKEN}`);
  const h = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(h), (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}
const hex = (n: number) => Array.from(crypto.getRandomValues(new Uint8Array(n)), (b) => b.toString(16).padStart(2, "0")).join("");

/**
 * The live server (Cloudflare Workers) can't run the library's Node socket, so open the same socket with
 * fetch + Upgrade, which Workers support and which lets us send the headers the voice service expects.
 */
async function synthesizeOnWorker(ssml: string): Promise<Uint8Array> {
  const url = `${WSS}?Ocp-Apim-Subscription-Key=${TOKEN}&Sec-MS-GEC=${await secMsGec()}&Sec-MS-GEC-Version=1-143.0.3650.96&ConnectionId=${hex(16)}`;
  const res = await fetch(url, {
    headers: {
      Upgrade: "websocket",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0",
      Origin: "chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold",
    },
  });
  const ws = (res as unknown as { webSocket?: WebSocket & { accept(): void } }).webSocket;
  if (!ws) throw new Error(`voice service refused the connection: ${res.status}`);
  ws.accept();
  const id = hex(16);
  const chunks: Uint8Array[] = [];
  const done = new Promise<void>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("voice service timed out")), 15000);
    ws.addEventListener("message", (m: MessageEvent) => {
      if (typeof m.data === "string") {
        if (m.data.includes("Path:turn.end")) { clearTimeout(t); resolve(); }
        return;
      }
      const buf = new Uint8Array(m.data as ArrayBuffer);
      const headLen = (buf[0]! << 8) | buf[1]!; // binary frames: 2-byte header length, headers, audio
      const head = new TextDecoder().decode(buf.subarray(2, 2 + headLen));
      if (head.includes("Path:audio")) chunks.push(buf.subarray(2 + headLen));
    });
    ws.addEventListener("close", () => { clearTimeout(t); resolve(); });
    ws.addEventListener("error", () => { clearTimeout(t); reject(new Error("voice service socket error")); });
  });
  ws.send(`Content-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"${FORMAT}"}}}}`);
  ws.send(`X-RequestId:${id}\r\nContent-Type:application/ssml+xml\r\nPath:ssml\r\n\r\n${ssml}`);
  try { await done; } finally { try { ws.close(); } catch { /* already closed */ } }
  const total = chunks.reduce((n, c) => n + c.length, 0);
  if (!total) throw new Error("voice service sent no audio");
  const out = new Uint8Array(total);
  let o = 0;
  for (const c of chunks) { out.set(c, o); o += c.length; }
  return out;
}

const onWorker = () => typeof (globalThis as { WebSocketPair?: unknown }).WebSocketPair !== "undefined";

/** One line of approved tutor text to mp3 bytes. Throws on network or token failure; the caller falls back to text. */
export async function synthesizeMp3(text: string, voice: string): Promise<Buffer> {
  if (onWorker()) return Buffer.from(await synthesizeOnWorker(toSsml(text, voice)));
  const { MsEdgeTTS, OUTPUT_FORMAT } = await import("msedge-tts");
  const tts = new MsEdgeTTS({ connectionTimeoutMs: 8000, synthesisTimeoutMs: 15000 });
  try {
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const { audioStream } = tts.rawToStream(toSsml(text, voice));
    const chunks: Buffer[] = [];
    for await (const c of audioStream) chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c));
    return Buffer.concat(chunks);
  } finally {
    tts.close();
  }
}
