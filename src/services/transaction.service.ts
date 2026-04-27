import { fetcher } from "@/src/lib/fetch";
import type { Bracelet, Transaction, User, TransactionStatusHistory } from "@/generated/prisma/client";
import type { CreateTransactionInput, UpdateTransactionStatusInput } from "@/src/lib/validations/transaction.schemas";

const BASE = "/api/transactions";

export type TransactionWithRelations = Pick<Transaction, "id" | "amount" | "currency" | "status" | "paymentMethod" | "description" | "receiptUrl" | "receiptSentAt" | "metadata" | "createdAt" | "updatedAt" | "userId" | "braceletId"> & {
    user: Pick<User, "id" | "firstName" | "lastName" | "email">;
    bracelet: Pick<Bracelet, "id" | "name" | "price">;
    statusHistory: Pick<TransactionStatusHistory, "id" | "previousStatus" | "newStatus" | "reason" | "createdAt">[];
};

export const transactionService = {
    async getAll(): Promise<TransactionWithRelations[]> {
        return fetcher<TransactionWithRelations[]>(BASE);
    },

    async create(data: CreateTransactionInput): Promise<TransactionWithRelations> {
        return fetcher<TransactionWithRelations>(BASE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
    },

    async updateStatus(id: string, data: UpdateTransactionStatusInput): Promise<TransactionWithRelations> {
        return fetcher<TransactionWithRelations>(`${BASE}/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
    },
};
