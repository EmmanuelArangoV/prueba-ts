import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getRequestUser, requireRoles } from "@/src/lib/rbac";
import { parseBody } from "@/src/lib/validations";
import { updateBraceletSchema } from "@/src/lib/validations/bracelet.schemas";
import type { ApiResponse } from "@/src/types/auth";

const braceletSelect = {
    id: true, name: true, description: true, price: true,
    currency: true, imageUrl: true, isActive: true, stock: true,
    createdAt: true, updatedAt: true,
};

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const user = getRequestUser(req);
    const guard = requireRoles(user, ["ADMIN"]);
    if (guard) return guard;

    const bracelet = await prisma.bracelet.findUnique({ where: { id } });
    if (!bracelet) {
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Manilla no encontrada" },
            { status: 404 }
        );
    }

    const body = await req.json();
    const parsed = parseBody(updateBraceletSchema, body);
    if (!parsed.success) return parsed.response;

    const updated = await prisma.bracelet.update({
        where: { id },
        data: parsed.data,
        select: braceletSelect,
    });

    return NextResponse.json<ApiResponse<typeof updated>>({
        success: true, message: "Manilla actualizada", data: updated,
    });
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const user = getRequestUser(req);
    const guard = requireRoles(user, ["ADMIN"]);
    if (guard) return guard;

    const bracelet = await prisma.bracelet.findUnique({ where: { id } });
    if (!bracelet) {
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Manilla no encontrada" },
            { status: 404 }
        );
    }

    // Soft delete — desactivar en vez de borrar
    await prisma.bracelet.update({
        where: { id },
        data: { isActive: false },
    });

    return NextResponse.json<ApiResponse>({ success: true, message: "Manilla desactivada" });
}