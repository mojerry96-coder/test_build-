# Fiti's teaching voice: fix silence for other students + add a Fiti mute

Scope: Fiti's spoken lines while she teaches (map chat, hook, explanations, quick fix, feedback). The simulation's own sounds are not touched.

## 1. Why Fiti is silent for other students (likely cause, not yet confirmed)
Before Fiti speaks a line, the server checks a list of lines it has already shown this student, so a hidden line can't be read out early. That list lives in the memory of only one server copy. The live app runs on many short-lived copies, so a student's voice request often reaches a copy that never showed the line. When that happens, Fiti stays silent and no error appears. It probably works for you because your requests keep landing on the same copy.

Another possible cause: the free voice service may be blocked or slow on some networks.

Steps:
1. Confirm the cause. Log a short reason every time Fiti stays silent (voice off / line not on the list / voice service failed). Then go through a teaching step as a second test student on the published app and read the logs.
2. If the list is the cause (expected): replace it with a signed ticket. The server attaches a tamper-proof ticket to each tutor line it sends. The voice request sends the line back with its ticket, and the server checks the ticket. This works on every server copy. Hidden lines still can't be spoken, because they never get a ticket.
3. If the voice service is the cause: keep showing the text and report the error. Then suggest moving to Azure Speech (the planned production voice; it needs a key).
4. Check that two different students both hear Fiti teach on the published app.

## 2. Fiti mute button
- A speaker button in the lesson header and on Ask Fiti turns only Fiti's voice on or off. Background music and button sounds keep playing.
- When Fiti is muted, her lines still show as text with captions. A line she is in the middle of saying stops right away.
- The setting is remembered on this device. It uses an icon plus a label ("Fiti's voice on/off"), works in both themes and has a large tap area.

## Tests
- A line with a valid ticket is spoken. A missing, changed or other student's ticket gives no audio.
- When muted, no voice is requested and the music is unaffected.

## Technical details
- `voice-ledger.server.ts`: replace the in-memory Map with HMAC tickets (`userId + sha256(text)`, generated secret `VOICE_LEDGER_SECRET`). Responses carry `voiceTickets`, and `speakFn` takes `ticket`.
- `speak.server.ts`: one `console.warn` per skip reason, without the text.
- `src/lib/voice.ts`: a `voiceMuted` store in localStorage, so `speak()` does nothing and `stop()` runs when muted. Separate from `music.ts`, which still ducks only while voice is actually playing.
- Update the AGENTS.md voice-gate rule and add the mute task to roadmap.md.
