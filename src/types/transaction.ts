export interface Transaction {
    id: string;
    userId: string;
    braceletId: string;
    amount: string;
    currency: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    paymentMethod: "CREDIT_CARD" | "DEBIT_CARD" | "BANK_TRANSFER" | "CASH";
    description?: string | null;
    receiptUrl?: string | null;
    receiptSentAt?: string | null;
    createdAt: string;
    updatedAt: string;
    user: { id: string; firstName: string; lastName: string; email: string };
    bracelet: { id: string; name: string; price: string };
    statusHistory: StatusHistory[];
}

export interface StatusHistory {
    id: string;
    previousStatus: string | null;
    newStatus: string;
    reason: string | null;
    createdAt: string;
}

export interface CreateTransactionBody {
    braceletId: string;
    paymentMethod: "CREDIT_CARD" | "DEBIT_CARD" | "BANK_TRANSFER" | "CASH";
    description?: string;
}

export interface UpdateTransactionStatusBody {
    status: "APPROVED" | "REJECTED";
    reason?: string;
}