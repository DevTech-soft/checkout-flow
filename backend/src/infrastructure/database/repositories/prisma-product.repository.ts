import { Injectable } from '@nestjs/common';
import { Product as PrismaProduct } from '@prisma/client';
import { Product } from '@domain/product/entities/product.entity';
import { ProductRepository } from '@domain/product/repositories/product.repository';
import { Money } from '@domain/shared/value-objects/money.vo';
import { PrismaService } from '@infrastructure/database/prisma.service';

@Injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Product[]> {
    const products = await this.prisma.product.findMany();
    return products.map(toDomain);
  }

  async findById(id: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({ where: { id } });
    return product ? toDomain(product) : null;
  }

  async decrementStock(id: string, quantity: number): Promise<void> {
    await this.prisma.product.update({
      where: { id },
      data: { stock: { decrement: quantity } },
    });
  }
}

function toDomain(product: PrismaProduct): Product {
  return new Product(
    product.id,
    product.name,
    product.description,
    Money.fromCents(product.priceInCents, product.currency),
    product.stock,
    product.imageUrl,
  );
}
