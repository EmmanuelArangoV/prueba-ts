"use client";

import { AuthProvider } from "@/src/context/AuthContext";
import { BraceletProvider } from "@/src/context/BraceletContext";
import { TransactionProvider } from "@/src/context/TransactionContext";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <BraceletProvider>
                <TransactionProvider>
                    {children}
                </TransactionProvider>
            </BraceletProvider>
        </AuthProvider>
    );
}

