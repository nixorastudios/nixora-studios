import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    // Lovable preview serves at "/", GitHub Pages at "/nixora-studios/".
    basepath: import.meta.env.PROD ? "/nixora-studios" : "/",
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
