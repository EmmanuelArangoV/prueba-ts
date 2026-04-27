import { z } from "zod";

export const createBraceletSchema = z.object({
    name: z.string().min(2, "Mínimo 2 caracteres").max(100),
    description: z.string().max(500).optional(),
    price: z.number({ error: "El precio es obligatorio" }).positive("Debe ser mayor a 0"),
    currency: z.string().default("COP"),
    imageUrl: z.string().url("URL inválida").optional(),
    stock: z.number().int().min(0, "Stock no puede ser negativo"),
});

export const updateBraceletSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().max(500).optional(),
    price: z.number().positive().optional(),
    imageUrl: z.string().url().optional(),
    isActive: z.boolean().optional(),
    stock: z.number().int().min(0).optional(),
});

export type CreateBraceletInput = z.infer<typeof createBraceletSchema>;
export type UpdateBraceletInput = z.infer<typeof updateBraceletSchema>;