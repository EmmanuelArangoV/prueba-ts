import PDFDocument from "pdfkit";
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

export function generateReceiptPdf(data: ReceiptData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const buffers: Buffer[] = [];

            doc.on("data", buffers.push.bind(buffers));
            doc.on("end", () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });
            doc.on("error", reject);

            doc.fontSize(20).text("Comprobante de Pago", { align: "center" });
            doc.moveDown();

            doc.fontSize(12).text(`ID de Transacción: ${data.transactionId}`);
            doc.text(`Fecha: ${new Date(data.date).toLocaleString()}`);
            doc.text(`Estado: ${data.status}`);
            doc.moveDown();

            doc.text("Datos del Cliente", { underline: true });
            doc.text(`Nombre: ${data.customerName}`);
            doc.text(`Email: ${data.customerEmail}`);
            doc.moveDown();

            doc.text("Detalles del Pedido", { underline: true });
            doc.text(`Producto: ${data.braceletName}`);
            doc.text(`Método de Pago: ${data.paymentMethod}`);
            doc.moveDown();

            doc.fontSize(14).text(`Total Pagado: ${data.amount.toString()} ${data.currency}`, { align: "right" });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}


