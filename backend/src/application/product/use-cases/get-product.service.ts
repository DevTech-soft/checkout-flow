import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository } from '@domain/product/repositories/product.repository';
import { ProductDto } from '@application/product/dto/product.dto';
import { GetProductUseCase } from '@application/product/use-cases/get-product.use-case';

@Injectable()
export class GetProductService implements GetProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(id: string): Promise<ProductDto> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      priceInCents: product.price.amountInCents,
      currency: product.price.currency,
      stock: product.stock,
      imageUrl: product.imageUrl,
    };
  }
}
