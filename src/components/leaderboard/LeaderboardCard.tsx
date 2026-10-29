// Leaderboard in the worksheet look: Fiti with his bubble on the left, white card with the orange edge on the right.
import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { FitiClips } from "@/components/lesson/whiteboard/FitiClips";
import { useSay } from "@/lib/voice";
import { cn } from "@/lib/utils";
import type { LeaderboardData, LeaderMetric, LeaderPeriod, LeaderRow } from "@/shared/contracts/leaderboard";

const TABS: { id: LeaderMetric; label: string; unit: string }[] = [
  { id: "overall", label: "Overall", unit: "pts" },
  { id: "lessons", label: "Lessons", unit: "lessons" },
  { id: "quizzes", label: "Quizzes", unit: "right" },
  { id: "stars", label: "Stars", unit: "stars" },
];

const PILL = "squish rounded-full border-2 px-4 py-1.5 text-[14px] font-semibold transition-transform hover:-translate-y-0.5 focus-visible:outline-2";

export function LeaderboardCard({ data, period, onPeriod }: { data: LeaderboardData | null; period: LeaderPeriod; onPeriod: (p: LeaderPeriod) => void }) {
  const [tab, setTab] = useState<LeaderMetric>("overall");
  useSay(data?.fitiLine ? [data.fitiLine] : [], data ? `leader:${data.fitiLine}` : "", !!data?.fitiLine);
  const unit = TABS.find((t) => t.id === tab)!.unit;
  const rows = data?.boards[tab] ?? [];
  const mine = data?.me[tab];
  const top = rows.slice(0, 3);
  const rest = rows.slice(3);
  return (
    <div className="grid gap-4 md:grid-cols-[clamp(200px,24vw,380px)_minmax(0,1fr)]">
      <div className="flex flex-wrap items-end justify-between gap-4 md:col-span-2">
        <h1 className="font-hand text-[44px] leading-none text-fh-heading md:text-[clamp(40px,5.5vh,52px)]">Leaderboard <span className="text-[0.6em] opacity-70">· {period === "week" ? "This week" : "All time"}</span></h1>
        <div role="group" aria-label="Time period" className="flex gap-2">
          {(["week", "all"] as const).map((p) => (
            <button key={p} type="button" aria-pressed={period === p} onClick={() => onPeriod(p)}
              className={cn(PILL, period === p ? "border-fh-primary bg-fh-primary text-fh-primary-ink" : "border-fh-box-line bg-fh-card text-fh-heading")}>
              {p === "week" ? "Week" : "All time"}
            </button>
          ))}
        </div>
      </div>

      {/* Fiti: tall on the left from tablet up, small above the card on phones. */}
      <div className="flex items-end gap-3 md:flex-col md:items-center md:justify-end">
        {data?.fitiLine && (
          <p role="status" className="qf-say order-2 rounded-[22px] bg-fh-card px-5 py-3 text-center font-hand text-[clamp(17px,1.5vw,24px)] leading-snug text-fh-heading shadow-md md:order-1 md:mb-3 md:max-w-[320px]">{data.fitiLine}</p>
        )}
        <div className="order-1 h-24 w-16 shrink-0 md:order-2 md:h-[min(52vh,520px)] md:w-full">
          <FitiClips variant="pointer" want="greet" beat={0} className="fiti-sway aspect-[450/720] h-full w-auto max-w-full md:mx-auto" />
        </div>
      </div>

      <section aria-label="Class leaderboard" className="overlay-edge rounded-[28px] bg-fh-card p-[clamp(16px,3vw,40px)] pb-[calc(clamp(16px,3vw,40px)+16px)] shadow-xl">
        <div role="tablist" aria-label="Ranked by" className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button key={t.id} role="tab" type="button" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
              className={cn(PILL, tab === t.id ? "border-fh-primary bg-fh-primary text-fh-primary-ink" : "border-fh-box-line bg-fh-card text-fh-heading")}>{t.label}</button>
          ))}
        </div>

        {!data ? <p className="py-16 text-center text-fh-ink opacity-70">Loading…</p> : (
          <>
            <ol aria-label="Top three" className="mt-8 grid grid-cols-3 items-end gap-3">
              {[top[1], top[0], top[2]].map((r, i) => <Podium key={i} row={r} place={[2, 1, 3][i]!} unit={unit} />)}
            </ol>
            <ol className="mt-6 divide-y divide-fh-box-line" aria-label="Everyone else">
              {rest.map((r, i) => <Row key={i} row={r} unit={unit} />)}
            </ol>
            {mine && !rows.slice(0, 8).some((r) => r.me) && (
              <div className="sticky bottom-0 mt-2 border-t-2 border-fh-primary bg-fh-card"><Row row={{ rank: mine.rank, name: "You", score: mine.score, me: true }} unit={unit} delta={mine.delta} /></div>
            )}
            {data.alone && <p className="mt-6 text-center text-[15px] text-fh-ink opacity-80">{data.sampleNote || "Only your scores show until you join a class."}</p>}
          </>
        )}
      </section>
    </div>
  );
}

function Podium({ row, place, unit }: { row: LeaderRow | undefined; place: number; unit: string }) {
  const h = place === 1 ? "h-32" : place === 2 ? "h-24" : "h-16";
  return (
    <li className="flex flex-col items-center gap-2 text-center" aria-label={row ? `Place ${row.rank}: ${row.name}, ${row.score} ${unit}` : `Place ${place}: empty`}>
      <span className={cn("max-w-full truncate font-semibold text-fh-heading", row?.me && "underline decoration-fh-primary decoration-2 underline-offset-4")}>{row?.name ?? "—"}</span>
      <span className="text-[13px] text-fh-ink opacity-75">{row ? `${row.score.toLocaleString()} ${unit}` : ""}{row?.sample ? " · Sample" : ""}</span>
      <div className={cn("flex w-full items-start justify-center rounded-t-2xl pt-2 font-hand text-[28px]", h,
        row?.me ? "bg-fh-primary text-fh-primary-ink" : "bg-fh-page text-fh-heading")}>{row?.rank ?? place}</div>
    </li>
  );
}

function Row({ row, unit, delta }: { row: LeaderRow; unit: string; delta?: number }) {
  return (
    <li className={cn("flex items-center gap-4 px-3 py-3", row.me && "rounded-2xl bg-fh-page font-semibold")}>
      <span className="w-8 text-right font-hand text-[22px] text-fh-heading">{row.rank}</span>
      <span className="min-w-0 flex-1 truncate text-fh-heading">{row.name}{row.sample && <span className="ml-2 rounded-full bg-fh-page px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-fh-ink">Sample</span>}</span>
      <span className="text-fh-ink">{row.score.toLocaleString()} {unit}</span>
      {!!delta && (
        <span className="flex items-center text-[13px] text-fh-heading" aria-label={delta > 0 ? `Up ${delta}` : `Down ${-delta}`}>
          {delta > 0 ? <ArrowUp className="h-4 w-4" aria-hidden /> : <ArrowDown className="h-4 w-4" aria-hidden />}{Math.abs(delta)}
        </span>
      )}
    </li>
  );
}
