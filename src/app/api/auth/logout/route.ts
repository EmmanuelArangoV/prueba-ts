import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/src/lib/jwt";
import { prisma } from "@/src/lib/prisma";
import type { ApiResponse } from "@/src/types/auth";

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get("access_token")?.value;

        if (token) {
            try {
                const payload = verifyAccessToken(token);
            } catch {
            }
        }

        const response = NextResponse.json<ApiResponse>({
            success: true,
            message: "Sesión cerrada",
        });

        response.cookies.delete("access_token");
        response.cookies.delete("refresh_token");

        return response;
    } catch (error) {
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Error al cerrar sesión" },
            { status: 500 }
        );
    }
}