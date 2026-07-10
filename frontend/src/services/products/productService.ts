import type { Product } from './product.types';

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Audífonos Bluetooth',
    description: 'Audífonos inalámbricos con cancelación de ruido.',
    priceInCents: 12000000,
    currency: 'COP',
    stock: 10,
    imageUrl: 'https://placehold.co/400x400?text=Audifonos',
  },
  {
    id: '2',
    name: 'Smartwatch',
    description: 'Reloj inteligente con monitor de ritmo cardíaco.',
    priceInCents: 35000000,
    currency: 'COP',
    stock: 5,
    imageUrl: 'https://placehold.co/400x400?text=Smartwatch',
  },
  {
    id: '3',
    name: 'Mouse inalámbrico',
    description: 'Mouse ergonómico inalámbrico de alta precisión.',
    priceInCents: 8900000,
    currency: 'COP',
    stock: 20,
    imageUrl: 'https://placehold.co/400x400?text=Mouse',
  },
];

export async function getProducts(): Promise<Product[]> {
  return mockProducts;
}

export async function getProductById(id: string): Promise<Product | null> {
  return mockProducts.find((product) => product.id === id) ?? null;
}
