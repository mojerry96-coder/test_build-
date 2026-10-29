import { lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getDevToolsAccessFn } from "@/lib/api/dev-tools.functions";

// The panel's code is downloaded only after the server says this admin may use it.
const DevToolsPanel = lazy(() => import("./DevToolsPanel"));

export function DevToolsMount() {
  const check = useServerFn(getDevToolsAccessFn);
  const { data } = useQuery({ queryKey: ["dev-tools-access"], queryFn: () => check(), staleTime: 60_000, retry: false });
  if (!data?.allowed) return null;
  return <Suspense fallback={null}><DevToolsPanel /></Suspense>;
}
