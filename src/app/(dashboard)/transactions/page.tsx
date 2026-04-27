"use client";

import { useEffect, useState } from "react";
import { useAuthContext } from "@/src/context/AuthContext";
import { useTransactionContext } from "@/src/context/TransactionContext";

export default function TransactionsPage() {
  const { user } = useAuthContext();
  const { transactions, fetchTransactions, updateTransactionStatus, isLoading } = useTransactionContext();

  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const isAdmin = user?.role === "ADMIN";

  const handleDownloadObj = async (id: string) => {
    window.open(`/api/transactions/${id}/receipt`, "_blank");
  };

  const handleApprove = async (id: string) => {
    if (!isAdmin) return;
    setIsUpdating(id);
    try {
      await updateTransactionStatus(id, { status: "APPROVED", reason: "Aprobado por el Administrador" });
      alert("Transacción Aprobada. Se le enviará el comprobante electrónico al cliente.");
    } catch (e: unknown) {
      const err = e as Error;
      alert(err.message || "Error al aprobar");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!isAdmin) return;
    const reason = prompt("Razón de rechazo:");
    if (reason === null) return; // canceló
    setIsUpdating(id);
    try {
      await updateTransactionStatus(id, { status: "REJECTED", reason: reason || "Rechazado" });
      alert("Transacción Rechazada.");
    } catch (e: unknown) {
      const err = e as Error;
      alert(err.message || "Error al rechazar");
    } finally {
      setIsUpdating(null);
    }
  };

  if (isLoading) {
    return <div className="text-center py-10 text-stone-500">Cargando Historial...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">
            {isAdmin ? "Panel de Control de Compras" : "Mis Compras"}
          </h1>
          <p className="mt-1 text-stone-600">
            {isAdmin ? "Gestione las transacciones en curso." : "Historial de pagos de sus manillas."}
          </p>
        </div>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-stone-900/5 sm:rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-stone-200">
          <thead className="bg-stone-50">
            <tr>
              <th className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-stone-900 sm:pl-6">ID Manilla / Usuario</th>
              <th className="px-3 py-3.5 text-left text-xs font-semibold text-stone-900">Monto</th>
              <th className="px-3 py-3.5 text-left text-xs font-semibold text-stone-900">Método</th>
              <th className="px-3 py-3.5 text-left text-xs font-semibold text-stone-900">Estado</th>
              <th className="px-3 py-3.5 text-left text-xs font-semibold text-stone-900 hidden md:table-cell">Fecha</th>
              <th className="relative py-3.5 pl-3 pr-4 sm:pr-6 whitespace-nowrap">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 bg-white">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-stone-50">
                <td className="py-4 pl-4 pr-3 text-sm sm:pl-6 max-w-[200px]">
                  <div className="font-medium text-stone-900 text-ellipsis overflow-hidden">{t.bracelet.name}</div>
                  {isAdmin && <div className="text-stone-500 truncate text-xs">{t.user.email}</div>}
                </td>
                <td className="px-3 py-4 text-sm text-stone-600 whitespace-nowrap">
                  ${Number(t.amount).toLocaleString()} {t.currency}
                </td>
                <td className="px-3 py-4 text-sm text-stone-600">
                  <div className="flex flex-col">
                    <span>{t.paymentMethod}</span>
                    {t.metadata && typeof t.metadata === "object" && t.metadata !== null ? (
                      <span className="text-[10px] text-stone-400 font-mono">
                        {(t.metadata as Record<string, string>).brand} {(t.metadata as Record<string, string>).last4 && `*** ${(t.metadata as Record<string, string>).last4}`}
                        {(t.metadata as Record<string, string>).accountReference}
                        {(t.metadata as Record<string, string>).invoiceId}
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="px-3 py-4 text-sm whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    t.status === "PENDING" ? "bg-amber-100 text-amber-800" :
                    t.status === "APPROVED" ? "bg-green-100 text-green-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {t.status}
                  </span>
                </td>
                <td className="px-3 py-4 text-sm text-stone-500 hidden md:table-cell whitespace-nowrap">
                  {new Date(t.createdAt).toLocaleDateString()}
                </td>
                <td className="relative py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 whitespace-nowrap space-x-3">

                  {/* Administrador aprueba */}
                  {isAdmin && t.status === "PENDING" && (
                    <>
                      <button onClick={() => handleApprove(t.id)} disabled={isUpdating === t.id} className="text-green-600 hover:text-green-900 font-bold disabled:opacity-50">
                        Aprobar
                      </button>
                      <button onClick={() => handleReject(t.id)} disabled={isUpdating === t.id} className="text-stone-600 hover:text-stone-900 disabled:opacity-50">
                        Rechazar
                      </button>
                    </>
                  )}

                  {/* Factura Electronica: todos pueden verla cuando es aprobado */}
                  {t.status === "APPROVED" && (
                     <button onClick={() => handleDownloadObj(t.id)} className="text-red-600 hover:text-red-800 flex items-center justify-end gap-1 ml-auto">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="hidden lg:inline">PDF Factura</span>
                     </button>
                  )}
                  {t.status === "PENDING" && !isAdmin && (
                    <span className="text-stone-400 italic text-xs">En revisión</span>
                  )}
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-stone-500">
                  Aún no hay transacciones para mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}





