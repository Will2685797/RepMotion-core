// imports
import { QueryClient } from "@tanstack/react-query";


export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 2,
            staleTime: 30_000,        // 30s fresh
            gcTime: 5 * 60_000,       // 5min cache
            refetchOnWindowFocus: false,
        },
    },
});
