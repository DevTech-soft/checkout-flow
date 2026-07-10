import { Product } from '@domain/product/entities/product.entity';

export abstract class ProductRepository {
  abstract findAll(): Promise<Product[]>;
  abstract findById(id: string): Promise<Product | null>;
  abstract decrementStock(id: string, quantity: number): Promise<void>;
}
