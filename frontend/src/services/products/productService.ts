import { ApiError, httpClient } from '@services/api/httpClient';
import type { Product } from './product.types';

export async function getProducts(): Promise<Product[]> {
  return httpClient.get<Product[]>('/products');
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    return await httpClient.get<Product>(`/products/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}
