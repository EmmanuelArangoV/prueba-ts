import { redirect } from "next/navigation";

export default function AdminBraceletsRedirect() {
  // Redirige a la tienda existente
  redirect("/store");
}

