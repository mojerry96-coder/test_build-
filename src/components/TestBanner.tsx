import { useQuery } from "@tanstack/react-query";
import { getBuildFlagsFn } from "@/lib/api/settings.functions";
import { TriangleAlert } from "lucide-react";

export function TestBanner() {
  const { data } = useQuery({ queryKey: ["build-flags"], queryFn: () => getBuildFlagsFn(), staleTime: 60_000 });
  if (!data?.testBuild) return null;
  return (
    <div role="status" className="flex items-center justify-center gap-2 bg-warning px-4 py-2 text-center text-sm font-bold text-warning-foreground">
      <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden />
      Test build. Do not use with real students.
    </div>
  );
}
