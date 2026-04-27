import {NextRequest, NextResponse} from "next/server";
import {prisma} from "@/src/lib/prisma";
import {getRequestUser, requireRoles} from "@/src/lib/rbac";
import {parseBody} from "@/src/lib/validations";
import {createBraceletSchema} from "@/src/lib/validations/bracelet.schemas";
import {ApiResponse} from "@/src/types/auth";

const braceletSelect = {
    id: true, name: true, description: true, price: true,
    currency: true, imageUrl: true, isActive: true, stock: true,
    createdAt: true, updatedAt: true,
};

// GET — Admin ve todos, Client ve solo los activos
export async function GET(req: NextRequest) {
    const user = getRequestUser(req);
    if (!user) {
        return NextResponse.json<ApiResponse>(
            { success: false, message: "No autenticado" },
            { status: 401 }
        );
    }

    const where = user.role === "ADMIN" ? {} : { isActive: true };

    const bracelets = await prisma.bracelet.findMany({
        where,
        select: braceletSelect,
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json<ApiResponse<typeof bracelets>>({ success: true, message: "OK", data: bracelets });
}

// POST — solo Admin
export async function POST(req: NextRequest) {
    const user = getRequestUser(req);
    const guard = requireRoles(user, ["ADMIN"]);
    if (guard) return guard;

    const body = await req.json();
    const parsed = parseBody(createBraceletSchema, body);
    if (!parsed.success) return parsed.response;

    const existing = await prisma.bracelet.findUnique({ where: { name: parsed.data.name } });
    if (existing) {
        return NextResponse.json<ApiResponse>(
            { success: false, message: "Ya existe una manilla con ese nombre" },
            { status: 409 }
        );
    }

    const bracelet = await prisma.bracelet.create({
        data: parsed.data,
        select: braceletSelect,
    });

    return NextResponse.json<ApiResponse<typeof bracelet>>(
        { success: true, message: "Manilla creada", data: bracelet },
        { status: 201 }
    );
}

