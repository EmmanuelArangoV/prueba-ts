import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getRequestUser, requireRoles } from "@/src/lib/rbac";
import { parseBody } from "@/src/lib/validations";
import { createTransactionSchema } from "@/src/lib/validations/transaction.schemas";
import type { ApiResponse } from "@/src/types/auth";

const transactionSelect = {
    id: true, amount: true, currency: true, status: true,
    paymentMethod: true, description: true, receiptUrl: true,
    receiptSentAt: true, createdAt: true, updatedAt: true,
    metadata: true, userId: true, braceletId: true,
    user: { select: { id: true, firstName: true, lastName: true, email: true } },
    bracelet: { select: { id: true, name: true, price: true } },
    statusHistory: {
        select: { id: true, previousStatus: true, newStatus: true, reason: true, createdAt: true },
        orderBy: { createdAt: "desc" as const },
    },
};

// GET — Admin ve todas, Client solo las suyas
export async function GET(req: NextRequest) {
    const user = getRequestUser(req);
    if (!user) {
        return NextResponse.json<ApiResponse>(
            { success: false, message: "No autenticado" },
            { status: 401 }
        );
    }

    const where = user.role === "ADMIN" ? {} : { userId: user.userId };

    const transactions = await prisma.transaction.findMany({
        where,
        select: transactionSelect,
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json<ApiResponse<typeof transactions>>({ success: true, message: "OK", data: transactions });
}

// POST — Admin y Client pueden crear
export async function POST(req: NextRequest) {
    const user = getRequestUser(req);
    if (!user) {
        return NextResponse.json<ApiResponse>(
            { success: false, message: "No autenticado" },
            { status: 401 }
        );
    }

    const body = await req.json();
    const parsed = parseBody(createTransactionSchema, body);
    if (!parsed.success) return parsed.response;

    const { braceletId, paymentMethod, description, metadata } = parsed.data;

    // Verificar que la manilla existe, está activa y tiene stock
    const bracelet = await prisma.bracelet.findUnique({ where: { id: braceletId } });
    if (!bracelet || !bracelet.isActive) {
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Manilla no disponible" },
            { status: 404 }
        );
    }

    if (bracelet.stock <= 0) {
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Sin stock disponible" },
            { status: 409 }
        );
    }

    // Crear transacción y descontar stock en una sola operación
    const [transaction] = await prisma.$transaction([
        prisma.transaction.create({
            data: {
                userId: user.userId,
                braceletId,
                amount: bracelet.price,
                currency: bracelet.currency,
                paymentMethod,
                description,
                metadata: metadata !== undefined ? metadata : undefined,
            },
            select: transactionSelect,
        }),
        prisma.bracelet.update({
            where: { id: braceletId },
            data: { stock: { decrement: 1 } },
        }),
    ]);

    // Registrar historial de estado inicial
    await prisma.transactionStatusHistory.create({
        data: {
            transactionId: transaction.id,
            previousStatus: null,
            newStatus: "PENDING",
            reason: "Transacción creada",
        },
    });

    return NextResponse.json<ApiResponse<typeof transaction>>(
        { success: true, message: "Transacción creada", data: transaction },
        { status: 201 }
    );
}