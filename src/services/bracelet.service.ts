import { fetcher } from "@/src/lib/fetch";
import type { Bracelet } from "@/generated/prisma/client";
import type { CreateBraceletInput, UpdateBraceletInput } from "@/src/lib/validations/bracelet.schemas";

const BASE = "/api/bracelets";

export const braceletService = {
    async getAll(): Promise<Bracelet[]> {
        return fetcher<Bracelet[]>(BASE);
    },

    async create(data: CreateBraceletInput): Promise<Bracelet> {
        return fetcher<Bracelet>(BASE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
    },

    async update(id: string, data: UpdateBraceletInput): Promise<Bracelet> {
        return fetcher<Bracelet>(`${BASE}/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
    },

    async remove(id: string): Promise<void> {
        return fetcher<void>(`${BASE}/${id}`, { method: "DELETE" });
    },
};

