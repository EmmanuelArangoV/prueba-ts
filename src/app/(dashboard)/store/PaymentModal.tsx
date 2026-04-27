"use client";

import { useState } from "react";
import { useTransactionContext } from "@/src/context/TransactionContext";
import type { Bracelet } from "@/generated/prisma/client";

interface PaymentModalProps {
  bracelet: Bracelet;
  onClose: () => void;
}

export function PaymentModal({ bracelet, onClose }: PaymentModalProps) {
  const { createTransaction } = useTransactionContext();
  const [method, setMethod] = useState<"CREDIT_CARD" | "DEBIT_CARD" | "BANK_TRANSFER" | "CASH">("CREDIT_CARD");

  // Tarjeta
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVC, setCardCVC] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [txId, setTxId] = useState("");
  const [createdTxId, setCreatedTxId] = useState<string | null>(null);

  const detectBrand = (num: string) => {
    if (num.startsWith("4")) return "Visa";
    if (num.startsWith("5")) return "MasterCard";
    if (num.startsWith("3")) return "American Express";
    return "Desconocida";
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return digits.slice(0, 2) + "/" + digits.slice(2);
  };

  const handlePayment = async () => {
    setError("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      let metadata: Record<string, string | number | boolean> = {};

      if (method === "CREDIT_CARD" || method === "DEBIT_CARD") {
        if (cardNumber.length < 13) throw new Error("Número de tarjeta inválido (muy corto)");
        
        if (cardExpiry.length !== 5) {
          throw new Error("Fecha de vencimiento inválida (debe ser MM/YY)");
        }
        const [expMonthStr, expYearStr] = cardExpiry.split("/");
        const expMonth = parseInt(expMonthStr, 10);
        const expYear = parseInt(expYearStr, 10);
        
        if (expMonth < 1 || expMonth > 12) {
           throw new Error("El mes de vencimiento debe estar entre 01 y 12");
        }
        
        const now = new Date();
        const currentYear = now.getFullYear() % 100;
        const currentMonth = now.getMonth() + 1;

        if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
           throw new Error("La tarjeta se encuentra vencida");
        }

        if (cardCVC.length < 3) {
           throw new Error("Código CVC inválido");
        }

        metadata = {
          brand: detectBrand(cardNumber),
          last4: cardNumber.slice(-4),
        };
      }

      if (method === "BANK_TRANSFER") {
        setSuccessMsg("Simulando conexión con el banco...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setSuccessMsg("");
        metadata = { accountReference: `BANK-${Math.floor(Math.random() * 1000000)}` };
      }

      if (method === "CASH") {
        metadata = { invoiceId: `OXXO-${Date.now()}` };
      }

      const tx = await createTransaction({
        braceletId: bracelet.id,
        paymentMethod: method,
        description: `Compra de ${bracelet.name} desde la Tienda Virtual`,
        metadata,
      });

      if (tx?.id) {
        setCreatedTxId(tx.id);
      }

      setSuccessMsg("¡Transacción generada! La compra se encuentra en revisión (PENDIENTE).");
      if (method === "BANK_TRANSFER") setTxId(metadata.accountReference as string);
      if (method === "CASH") setTxId(metadata.invoiceId as string);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err ?? "Error desconocido");
      setError(msg || "La transacción falló.");
    } finally {
      setIsLoading(false);
    }
  };

  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  async function handleSendEmail() {
    if (!createdTxId) {
      setEmailError("No se encontró el ID de la transacción.");
      return;
    }

    setEmailSending(true);
    setEmailError(null);

    try {
      const res = await fetch(`/api/transactions/${createdTxId}/email`, {
        method: "POST",
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Error en el servidor");
      }

      setEmailSent(true);
    } catch (e: unknown) {
      console.error(e);
      setEmailError("Error al enviar el correo");
    } finally {
      setEmailSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h3 className="text-xl font-bold text-gray-900">Completar Pago</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors" disabled={isLoading}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {!successMsg && !error && (
            <div className="mb-6 flex justify-between bg-red-50 p-4 rounded-xl border border-red-100">
              <div>
                <span className="block text-sm text-red-800 font-medium">Comprando:</span>
                <span className="block text-lg font-bold text-red-900">{bracelet.name}</span>
              </div>
              <div className="text-right">
                <span className="block text-sm text-red-800 font-medium">Total:</span>
                <span className="block text-lg font-bold text-red-900">${Number(bracelet.price).toLocaleString()}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl relative text-sm">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {successMsg ? (
            <div className="text-center py-10 px-4">
              <svg className="mx-auto h-16 w-16 text-red-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {txId ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
              <h4 className="text-xl font-bold text-gray-900 mb-2">{successMsg}</h4>
               {txId && method === "BANK_TRANSFER" && <p className="text-gray-600 text-sm">Referencia Bancaria a consignar: <strong className="text-gray-900">{txId}</strong></p>}
               {txId && method === "CASH" && <p className="text-gray-600 text-sm">Presenta este código en caja: <strong className="text-gray-900">{txId}</strong></p>}

               {createdTxId && (
                 <div className="mt-4 space-y-2">
                   <a
                     href={`/api/transactions/${createdTxId}/receipt`}
                     target="_blank"
                     rel="noreferrer"
                     className="inline-block w-full py-2 px-4 bg-white border border-gray-300 text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                   >
                     Descargar factura (PDF)
                   </a>

                   <button
                       onClick={handleSendEmail}
                       disabled={emailSending || emailSent}
                       className="w-full py-2 px-4 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     {emailSending ? "Enviando..." : emailSent ? "✓ Comprobante enviado" : "Enviar comprobante por correo"}
                   </button>

                   {emailError && (
                       <p className="text-red-400 text-sm mt-2">{emailError}</p>
                   )}
                 </div>
               )}

              {!isLoading && (
                 <button onClick={onClose} className="mt-8 w-full py-2.5 px-4 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition">
                   Cerrar
                 </button>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Método de pago</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as "CREDIT_CARD" | "DEBIT_CARD" | "BANK_TRANSFER" | "CASH")}
                  className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                >
                  <option value="CREDIT_CARD">Tarjeta de Crédito</option>
                  <option value="DEBIT_CARD">Tarjeta de Débito</option>
                  <option value="BANK_TRANSFER">Transferencia Bancaria / PSE</option>
                  <option value="CASH">Efectivo en Puntos de Pago</option>
                </select>
              </div>

              {(method === "CREDIT_CARD" || method === "DEBIT_CARD") && (
                <div className="space-y-4 border-t border-gray-200 pt-4 mt-2">
                  <div>
                    {/* Animated card preview */}
                    <div className="mb-4">
                      <div className="relative w-full h-36 bg-gradient-to-r from-[#fbf9f4] to-white rounded-xl shadow-lg overflow-hidden transform transition-transform duration-300">
                        <div className="absolute inset-0 p-4 flex flex-col justify-between">
                          <div className="flex justify-between items-center">
                            <div className="text-xs text-gray-400">HorusPay</div>
                            <div className="text-xs text-gray-400">{detectBrand(cardNumber)}</div>
                          </div>
                          <div>
                            <div className="text-lg font-mono tracking-widest text-gray-900">{cardNumber ? cardNumber.replace(/.(?=.{4})/g, "*") : "•••• •••• •••• ••••"}</div>
                            <div className="mt-2 flex justify-between items-center text-sm text-gray-600">
                              <div className="truncate">{cardName || "NOMBRE EN LA TARJETA"}</div>
                              <div>{cardExpiry || "MM/YY"}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de la Tarjeta {cardNumber && <span className="ml-2 text-xs opacity-75 font-semibold text-red-600">({detectBrand(cardNumber)})</span>}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 sm:text-sm placeholder:text-gray-400 tracking-widest transition-transform duration-150"
                      placeholder="**** **** **** ****"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre en la tarjeta</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 sm:text-sm"
                      placeholder="JOHN DOE"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value.toUpperCase())}
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="w-1/2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">F. Vencimiento</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        className="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 sm:text-sm tracking-widest transition-all"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                      />
                    </div>
                    <div className="w-1/2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 sm:text-sm"
                        placeholder="123"
                        value={cardCVC}
                        onChange={(e) => setCardCVC(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        maxLength={4}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Las tarjetas son simuladas y no procesamos pagos reales. Solo simulamos la entidad.
                  </p>
                </div>
              )}

              {method === "BANK_TRANSFER" && (
                <div className="border-t border-gray-200 pt-4 mt-2">
                   <p className="text-sm text-gray-600 leading-relaxed mb-4">
                     Has seleccionado Transferencia Bancaria (o PSE). Generaremos un número de recaudo para que finalices el proceso desde la aplicación bancaria de tu móvil.
                   </p>
                </div>
              )}

              {method === "CASH" && (
                <div className="border-t border-gray-200 pt-4 mt-2">
                   <p className="text-sm text-gray-600 leading-relaxed mb-4">
                     Paga en nuestra red de sucursales aliadas más cercanas con un PIN generado a continuación.
                   </p>
                </div>
              )}
            </div>
          )}
        </div>

        {!successMsg && !isLoading && (
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
            <button onClick={onClose} className="px-4 py-2 text-gray-600 font-medium text-sm hover:text-gray-900 transition mr-2">
              Cancelar
            </button>
            <button
              onClick={handlePayment}
              disabled={isLoading}
              className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-medium text-sm rounded-lg shadow-sm transition"
            >
              Completar Solicitud
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
