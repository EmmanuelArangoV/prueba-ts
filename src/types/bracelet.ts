export interface Bracelet {
    id: string;
    name: string;
    description?: string | null;
    price: string;
    currency: string;
    imageUrl?: string | null;
    isActive: boolean;
    stock: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateBraceletBody {
    name: string;
    description?: string;
    price: number;
    currency?: string;
    imageUrl?: string;
    stock: number;
}

export interface UpdateBraceletBody {
    name?: string;
    description?: string;
    price?: number;
    imageUrl?: string;
    isActive?: boolean;
    stock?: number;
}