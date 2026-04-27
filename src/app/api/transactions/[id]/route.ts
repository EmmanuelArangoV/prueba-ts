import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getRequestUser, requireRoles } from "@/src/lib/rbac";
import { parseBody } from "@/src/lib/validations";
import { updateTransactionStatusSchema } from "@/src/lib/validations/transaction.schemas";
import type { ApiResponse } from "@/src/types/auth";
import { generateReceiptPdf } from "@/src/lib/pdf";
import { sendReceiptEmail } from "@/src/lib/email";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const user = getRequestUser(req);
    const guard = requireRoles(user, ["ADMIN"]);
    if (guard) return guard;

    const transaction = await prisma.transaction.findUnique({ where: { id } });
    if (!transaction) {
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Transacción no encontrada" },
            { status: 404 }
        );
    }

    if (transaction.status !== "PENDING") {
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Solo se pueden modificar transacciones PENDING" },
            { status: 400 }
        );
    }

    const body = await req.json();
    const parsed = parseBody(updateTransactionStatusSchema, body);
    if (!parsed.success) return parsed.response;

    const { status, reason } = parsed.data;

    // Procesar pago simulado si cambia a APPROVED
    if (status === "APPROVED") {
        const isSuccess = Math.random() > 0.1; // 90% éxito simulado
        if (!isSuccess) {
            return NextResponse.json<ApiResponse>(
                { success: false, message: "El banco rechazó el pago" },
                { status: 400 }
            );
        }
    }

    const updated = await prisma.transaction.update({
        where: { id },
        data: { status },
        include: { user: true, bracelet: true }, // Incluir usuario y manilla para el correo
    });

    // Registrar en historial
    await prisma.transactionStatusHistory.create({
        data: {
            transactionId: id,
            previousStatus: transaction.status,
            newStatus: status,
            reason: reason ?? null,
        },
    });

    // Si se rechaza, devolver el stock
    if (status === "REJECTED") {
        await prisma.bracelet.update({
            where: { id: transaction.braceletId },
            data: { stock: { increment: 1 } },
        });
    }

    if (status === "APPROVED") {
        // Enviar comprobante por correo
        try {
            const pdfBuffer = await generateReceiptPdf({
                transactionId: updated.id,
                date: updated.createdAt,
                amount: updated.amount,
                currency: updated.currency,
                paymentMethod: updated.paymentMethod,
                customerName: `${updated.user.firstName} ${updated.user.lastName}`,
                customerEmail: updated.user.email,
                braceletName: updated.bracelet.name,
                status: "APPROVED",
            });

            await sendReceiptEmail({
                to: updated.user.email,
                subject: "Tu comprobante de pago - Payment Gateway",
                text: "Gracias por tu compra. Adjuntamos el comprobante de la transacción.",
                pdfBuffer,
                transactionId: updated.id,
            });

            // Actualizar fecha de envío del recibo
            await prisma.transaction.update({
                where: { id },
                data: { receiptSentAt: new Date() },
            });
        } catch (error) {
            console.error("Error generando o enviando el correo:", error);
            // Seguimos adelante, ya que la transacción se aprobó
        }
    }

    // Adaptar respuesta al select previo si estuviera (en el ej original retornábamos updated sin include)
    return NextResponse.json<ApiResponse<Partial<typeof updated>>>({
        success: true,
        message: `Transacción ${status === "APPROVED" ? "aprobada" : "rechazada"}`,
        data: updated,
    });
}