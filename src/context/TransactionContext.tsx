"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { transactionService, type TransactionWithRelations } from "@/src/services/transaction.service";
import type { CreateTransactionInput, UpdateTransactionStatusInput } from "@/src/lib/validations/transaction.schemas";

export interface TransactionContextType {
    transactions: TransactionWithRelations[];
    isLoading: boolean;
    error: string | null;
    fetchTransactions: () => Promise<void>;
    createTransaction: (data: CreateTransactionInput) => Promise<TransactionWithRelations>;
    updateTransactionStatus: (id: string, data: UpdateTransactionStatusInput) => Promise<TransactionWithRelations>;
}

const TransactionContext = createContext<TransactionContextType | null>(null);

export function TransactionProvider({ children }: { children: ReactNode }) {
    const [transactions, setTransactions] = useState<TransactionWithRelations[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTransactions = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await transactionService.getAll();
            setTransactions(data);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Error al cargar las transacciones";
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createTransaction = useCallback(async (data: CreateTransactionInput) => {
        const transaction = await transactionService.create(data);
        setTransactions((prev) => [transaction, ...prev]);
        return transaction;
    }, []);

    const updateTransactionStatus = useCallback(async (id: string, data: UpdateTransactionStatusInput) => {
        const updated = await transactionService.updateStatus(id, data);
        setTransactions((prev) => prev.map((t) => (t.id === id ? updated : t)));
        return updated;
    }, []);

    return (
        <TransactionContext.Provider value={{
            transactions, isLoading, error,
            fetchTransactions, createTransaction, updateTransactionStatus,
        }}>
            {children}
        </TransactionContext.Provider>
    );
}

export function useTransactionContext() {
    const ctx = useContext(TransactionContext);
    if (!ctx) throw new Error("useTransactionContext debe usarse dentro de <TransactionProvider>");
    return ctx;
}

