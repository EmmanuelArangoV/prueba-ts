import { redirect } from "next/navigation";

export default function AdminTransactionsRedirect() {
  // Mantener compatibilidad con URLs antiguas
  redirect("/transactions");
}

