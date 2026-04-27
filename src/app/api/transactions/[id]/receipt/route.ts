import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getRequestUser } from "@/src/lib/rbac";
import { generateReceiptPdf } from "@/src/lib/pdf";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const user = getRequestUser(req);
    if (!user) {
        return new NextResponse("No autenticado", { status: 401 });
    }

    const transaction = await prisma.transaction.findUnique({
        where: { id },
        include: {
            user: true,
            bracelet: true,
        },
    });

    if (!transaction) {
        return new NextResponse("Transacción no encontrada", { status: 404 });
    }

    // Client only downloads their own
    if (user.role !== "ADMIN" && transaction.userId !== user.userId) {
        return new NextResponse("Denegado", { status: 403 });
    }

    try {
        const pdFBf = await generateReceiptPdf({
            transactionId: transaction.id,
            date: transaction.createdAt,
            amount: transaction.amount,
            currency: transaction.currency,
            paymentMethod: transaction.paymentMethod,
            customerName: `${transaction.user.firstName} ${transaction.user.lastName}`.trim(),
            customerEmail: transaction.user.email,
            braceletName: transaction.bracelet.name,
            status: transaction.status,
        });

        return new NextResponse(new Uint8Array(pdFBf), {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="comprobante-${transaction.id}.pdf"`,
            },
        });
    } catch (error) {
        console.error("Error generating PDF:", error);
        return new NextResponse("Error al generar el comprobante", { status: 500 });
    }
}


