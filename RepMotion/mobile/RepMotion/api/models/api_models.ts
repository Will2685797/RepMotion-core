
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions {
    params?: Record<string, string | number | boolean | undefined>;
    body?: unknown;
    headers?: Record<string, string>;
}

export type Paginated<T> = {
    items: T[];
    page: number;
    limit: number;
    total: number;
    has_more: boolean;
};

export class ApiError extends Error {
    status: number;
    body: unknown;

    constructor(status: number, message: string, body: unknown) {
        super(message);
        this.status = status;
        this.body = body;
    }
}
