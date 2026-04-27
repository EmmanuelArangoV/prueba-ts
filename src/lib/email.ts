import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.sandbox.mailinabox.email",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER || "test@sandbox.com",
        pass: process.env.SMTP_PASS || "test",
    },
});

export interface ReceiptEmailData {
    to: string;
    subject: string;
    text: string;
    pdfBuffer: Buffer;
    transactionId: string;
}

export async function sendReceiptEmail(data: ReceiptEmailData): Promise<void> {
    await transporter.sendMail({
        from: '"Payment Gateway" <no-reply@paymentgateway.local>',
        to: data.to,
        subject: data.subject,
        text: data.text,
        attachments: [
            {
                filename: `comprobante-${data.transactionId}.pdf`,
                content: data.pdfBuffer,
            }
        ]
    });
}


