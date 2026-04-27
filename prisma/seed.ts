import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Seeding bracelets...");

    const bracelets = [
        {
            name:        "Horus Basic",
            description: "Manilla NFC básica con chip de acceso rápido a información médica.",
            price:       49900,
            stock:       100,
            imageUrl:    null,
        },
        {
            name:        "Horus Pro",
            description: "Manilla NFC premium con mayor alcance y diseño resistente al agua.",
            price:       89900,
            stock:       50,
            imageUrl:    null,
        },
        {
            name:        "Horus Elite",
            description: "Manilla NFC de edición especial con materiales de alta gama y garantía extendida.",
            price:       149900,
            stock:       25,
            imageUrl:    null,
        },
    ];

    for (const bracelet of bracelets) {
        await prisma.bracelet.upsert({
            where:  { name: bracelet.name },
            update: {},
            create: bracelet,
        });
    }

    console.log("Bracelets seeded successfully");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });