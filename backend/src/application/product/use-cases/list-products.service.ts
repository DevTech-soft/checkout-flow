import { Injectable } from '@nestjs/common';
import { ProductRepository } from '@domain/product/repositories/product.repository';
import { ProductDto } from '@application/product/dto/product.dto';
import { ListProductsUseCase } from '@application/product/use-cases/list-products.use-case';

@Injectable()
export class ListProductsService implements ListProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(): Promise<ProductDto[]> {
    const products = await this.productRepository.findAll();
    return products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      priceInCents: product.price.amountInCents,
      currency: product.price.currency,
      stock: product.stock,
      imageUrl: product.imageUrl,
    }));
  }
}
