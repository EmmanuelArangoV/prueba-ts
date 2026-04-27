import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getRequestUser } from "@/src/lib/rbac";
import { generateReceiptPdf } from "@/src/lib/pdf";
import { transporter } from "@/src/lib/email";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const user = getRequestUser(req);

    if (!user) {
        return NextResponse.json(
            { success: false, message: "No autenticado" },
            { status: 401 }
        );
    }

    const transaction = await prisma.transaction.findUnique({
        where: { id },
        include: { user: true, bracelet: true },
    });

    if (!transaction) {
        return NextResponse.json(
            { success: false, message: "Transacción no encontrada" },
            { status: 404 }
        );
    }

    // Client solo puede enviar su propio comprobante
    if (user.role !== "ADMIN" && transaction.userId !== user.userId) {
        return NextResponse.json(
            { success: false, message: "No tienes permiso para esta acción" },
            { status: 403 }
        );
    }

    // Generar el PDF con la misma función
    const pdfBuffer = await generateReceiptPdf({
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

    // Enviar el email con el PDF adjunto
    await transporter.sendMail({
        from: `"PagosApp" <${process.env.SMTP_USER}>`,
        to: transaction.user.email,
        subject: `Factura - Comprobante de pago #${transaction.id.slice(0, 8).toUpperCase()}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #b41616;">Comprobante de Pago</h2>
        <p>Hola <strong>${transaction.user.firstName}</strong>,</p>
        <p>Adjunto encontrarás el comprobante de tu transacción.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Producto</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${transaction.bracelet.name}</strong></td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Monto</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${transaction.amount} ${transaction.currency}</strong></td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Estado</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${transaction.status}</strong></td>
          </tr>
          <tr>
            <td style="padding: 8px; color: #666;">Método de pago</td>
            <td style="padding: 8px;"><strong>${transaction.paymentMethod}</strong></td>
          </tr>
        </table>
        <p style="color: #888; font-size: 12px;">Gracias por tu compra.</p>
      </div>
    `,
        attachments: [
            {
                filename: `comprobante-${transaction.id.slice(0, 8)}.pdf`,
                content: pdfBuffer,
                contentType: "application/pdf",
            },
        ],
    });

    // Marcar como enviado en la DB
    await prisma.transaction.update({
        where: { id },
        data: { receiptSentAt: new Date() },
    });

    return NextResponse.json({
        success: true,
        message: `Comprobante enviado a ${transaction.user.email}`,
    });
}