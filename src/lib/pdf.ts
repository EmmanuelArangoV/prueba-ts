import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export interface ReceiptData {
    transactionId: string;
    date: Date | string;
    amount: number | string | { toString(): string };
    currency: string;
    paymentMethod: string;
    customerName: string;
    customerEmail: string;
    braceletName: string;
    status: string;
}

export async function generateReceiptPdf(data: ReceiptData): Promise<Buffer> {
    const fontPath = path.join(process.cwd(), "public/fonts/Roboto-Regular.ttf");
    const fontBuffer = fs.readFileSync(fontPath);

    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                margin: 50,
                font: fontPath
            });

            const buffers: Buffer[] = [];
            doc.on("data", (chunk) => buffers.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(buffers)));
            doc.on("error", reject);

            const primary = "#b41616";
            const gray = "#323030";

            doc
                .fillColor(primary)
                .fontSize(22)
                .text("COMPROBANTE DE PAGO", { align: "center" });

            doc.moveDown(0.5);

            doc
                .strokeColor(primary)
                .lineWidth(2)
                .moveTo(50, doc.y)
                .lineTo(550, doc.y)
                .stroke();

            doc.moveDown();

            doc.fillColor("black").fontSize(11);

            doc.text(`ID: ${data.transactionId}`);
            doc.text(`Fecha: ${new Date(data.date).toLocaleString()}`);
            doc.text(`Estado: ${data.status}`);

            doc.moveDown();

            doc
                .fillColor(primary)
                .fontSize(13)
                .text("Datos del Cliente");

            doc.moveDown(0.5);

            doc.fillColor(gray).fontSize(11);
            doc.text(`Nombre: ${data.customerName}`);
            doc.text(`Email: ${data.customerEmail}`);

            doc.moveDown();

            doc
                .fillColor(primary)
                .fontSize(13)
                .text("Detalles del Pedido");

            doc.moveDown(0.5);

            doc.fillColor(gray).fontSize(11);
            doc.text(`Producto: ${data.braceletName}`);
            doc.text(`Método de pago: ${data.paymentMethod}`);

            doc.moveDown(2);

            doc
                .fillColor(primary)
                .fontSize(16)
                .text(
                    `TOTAL PAGADO: ${data.amount.toString()} ${data.currency}`,
                    { align: "right" }
                );

            doc.moveDown();

            doc
                .strokeColor("#ccc")
                .lineWidth(1)
                .moveTo(50, doc.y)
                .lineTo(550, doc.y)
                .stroke();

            doc.moveDown();

            doc
                .fillColor("#888")
                .fontSize(10)
                .text("Gracias por tu compra", { align: "center" });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}