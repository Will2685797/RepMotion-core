export const queryKeys = {
    quotesLatest: (symbols: string[]) => ["quotes", "latest", symbols],
    events: (filters?: unknown) => ["events", filters],
    event: (id: string) => ["event", id],
};
