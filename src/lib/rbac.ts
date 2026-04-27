import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@/src/types/auth";

export type Role = "ADMIN" | "CLIENT";

export interface RequestUser {
    userId: string;
    email:  string;
    role:   Role;
}

// Extrae el usuario inyectado por el middleware
export function getRequestUser(req: NextRequest): RequestUser | null {
    const userId = req.headers.get("x-user-id");
    const email  = req.headers.get("x-user-email");
    const role   = req.headers.get("x-user-role") as Role | null;

    if (!userId || !email || !role) return null;

    return { userId, email, role };
}

// Guard: si el usuario no tiene uno de los roles permitidos, devuelve 403
export function requireRoles(
    user:    RequestUser | null,
    allowed: Role[]
): NextResponse | null {

    if (!user) {
        return NextResponse.json<ApiResponse>(
            { success: false, message: "No autenticado" },
            { status: 401 }
        );
    }

    if (!allowed.includes(user.role)) {
        return NextResponse.json<ApiResponse>(
            { success: false, message: "No tienes permisos para esta acción" },
            { status: 403 }
        );
    }

    return null; // null = pasó el guard
}

// Guards específicos por rol — shortcuts para no repetir código
export function requireAdmin(user: RequestUser | null): NextResponse | null {
    return requireRoles(user, ["ADMIN"]);
}

export function requireClient(user: RequestUser | null): NextResponse | null {
    return requireRoles(user, ["CLIENT", "ADMIN"]); // ADMIN también puede hacer lo que hace CLIENT
}