import { z } from "zod";

export const createTransactionSchema = z.object({
    braceletId: z.string().uuid("ID de manilla inválido"),
    paymentMethod: z.enum(["CREDIT_CARD", "DEBIT_CARD", "BANK_TRANSFER", "CASH"] as const, {
        message: "Método de pago obligatorio",
    }),
    description: z.string().max(500).optional(),
    metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(), // Permite guardar brand, last4, etc sin usar any
});

export const updateTransactionStatusSchema = z.object({
    status: z.enum(["APPROVED", "REJECTED"] as const, {
        message: "Estado obligatorio",
    }),
    reason: z.string().max(500).optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionStatusInput = z.infer<typeof updateTransactionStatusSchema>;