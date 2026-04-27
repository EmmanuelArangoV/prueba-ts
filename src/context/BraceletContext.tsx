"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { braceletService } from "@/src/services/bracelet.service";
import type { Bracelet } from "@/generated/prisma/client";
import type { CreateBraceletInput, UpdateBraceletInput } from "@/src/lib/validations/bracelet.schemas";

export interface BraceletContextType {
    bracelets: Bracelet[];
    isLoading: boolean;
    error: string | null;
    fetchBracelets: () => Promise<void>;
    createBracelet: (data: CreateBraceletInput) => Promise<void>;
    updateBracelet: (id: string, data: UpdateBraceletInput) => Promise<void>;
    deleteBracelet: (id: string) => Promise<void>;
}

const BraceletContext = createContext<BraceletContextType | null>(null);

export function BraceletProvider({ children }: { children: ReactNode }) {
    const [bracelets, setBracelets] = useState<Bracelet[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBracelets = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await braceletService.getAll();
            setBracelets(data);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Error al cargar las manillas";
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createBracelet = useCallback(async (data: CreateBraceletInput) => {
        const bracelet = await braceletService.create(data);
        setBracelets((prev) => [bracelet, ...prev]);
    }, []);

    const updateBracelet = useCallback(async (id: string, data: UpdateBraceletInput) => {
        const updated = await braceletService.update(id, data);
        setBracelets((prev) => prev.map((b) => (b.id === id ? updated : b)));
    }, []);

    const deleteBracelet = useCallback(async (id: string) => {
        await braceletService.remove(id);
        // Desactiva o remueve de la lista visual, asumimos remover de la UI:
        setBracelets((prev) => prev.filter((b) => b.id !== id));
    }, []);

    return (
        <BraceletContext.Provider value={{
            bracelets, isLoading, error,
            fetchBracelets, createBracelet, updateBracelet, deleteBracelet,
        }}>
            {children}
        </BraceletContext.Provider>
    );
}

export function useBraceletContext() {
    const ctx = useContext(BraceletContext);
    if (!ctx) throw new Error("useBraceletContext debe usarse dentro de <BraceletProvider>");
    return ctx;
}

