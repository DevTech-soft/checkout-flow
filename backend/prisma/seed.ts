import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const products = [
  {
    name: 'Audífonos Bluetooth',
    description: 'Audífonos inalámbricos con cancelación de ruido.',
    priceInCents: 12000000,
    currency: 'COP',
    stock: 10,
    imageUrl: 'https://placehold.co/400x400?text=Audifonos',
  },
  {
    name: 'Smartwatch',
    description: 'Reloj inteligente con monitor de ritmo cardíaco.',
    priceInCents: 35000000,
    currency: 'COP',
    stock: 5,
    imageUrl: 'https://placehold.co/400x400?text=Smartwatch',
  },
  {
    name: 'Mouse inalámbrico',
    description: 'Mouse ergonómico inalámbrico de alta precisión.',
    priceInCents: 8900000,
    currency: 'COP',
    stock: 20,
    imageUrl: 'https://placehold.co/400x400?text=Mouse',
  },
];

async function main(): Promise<void> {
  const count = await prisma.product.count();
  if (count > 0) {
    return;
  }
  await prisma.product.createMany({ data: products });
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
