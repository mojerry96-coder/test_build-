import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { testDataFn } from "@/lib/api/test-data.functions";
import { Button } from "@/components/ui/button";
export function TestDataCard() {
  const api = useServerFn(testDataFn);
  const qc = useQueryClient();
  const { data, error } = useQuery({ queryKey: ["test-data-options"], queryFn: () => api({ data: { action: "options" } }) });
  const [studentId, setStudent] = useState("");
  const [topicId, setTopic] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function act(reset: boolean) {
    setBusy(true); setMessage("");
    try {
      const result = await api({ data: reset ? { action: "reset", confirmation } : { action: "restart", studentId, topicId } });
      if (reset) { setConfirmation(""); }
      await qc.invalidateQueries();
      setMessage(reset ? `Cleared ${result.count ?? 0} lessons.` : `Closed ${result.count ?? 0} lessons. Next Start begins at step 1.`);
    } catch (e) { setMessage(e instanceof Error ? e.message : typeof e === "object" && e !== null && "message" in e ? String(e.message) : String(e)); }
    finally { setBusy(false); }
  }
  return <section className="mt-6 space-y-4 rounded-2xl border border-border p-6">
    <h2 className="text-xl font-bold">Test data</h2>
    <label className="block">Student<select aria-label="Student" className="mt-1 block h-12 w-full rounded-lg border bg-background px-3" value={studentId} onChange={e => setStudent(e.target.value)}><option value="">Choose student</option>{data?.students.map(s => <option key={s.id} value={s.id}>{s.display_name ?? s.id}</option>)}</select></label>
    <label className="block">Topic<select aria-label="Topic" className="mt-1 block h-12 w-full rounded-lg border bg-background px-3" value={topicId} onChange={e => setTopic(e.target.value)}><option value="">Choose topic</option>{data?.topics.map(t => <option key={t.id} value={t.id}>{t.display_name}</option>)}</select></label>
    <Button disabled={busy || !studentId || !topicId} onClick={() => act(false)}>Restart lesson</Button>
    <hr />
    <p className="text-sm text-muted-foreground">Start afresh deletes all students’ lesson sessions and associated events, evidence, summaries, turns and flags. Content, users and roles stay.</p>
    <label className="block">Type RESET to confirm<input aria-label="Type RESET to confirm" className="mt-1 block h-12 w-full rounded-lg border bg-background px-3" value={confirmation} onChange={e => setConfirmation(e.target.value)} /></label>
    <Button variant="destructive" disabled={busy || confirmation !== "RESET"} onClick={() => act(true)}>Start afresh</Button>
    {(message || error) && <p role="status" className="text-sm">{message || error?.message || "Could not load choices."}{message.startsWith("Cleared") || message.startsWith("Closed") ? <> <a href="/" className="font-semibold underline">Open student home</a></> : null}</p>}
  </section>;
}
