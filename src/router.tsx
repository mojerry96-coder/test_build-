import { QueryClient, keepPreviousData } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  // Shared reads (her name, streak, plan) stay fresh for a minute, and a page keeps showing what it had
  // while it refreshes, so moving between pages never blanks into a loader.
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000, placeholderData: keepPreviousData, refetchOnWindowFocus: false } },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadDelay: 30,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
