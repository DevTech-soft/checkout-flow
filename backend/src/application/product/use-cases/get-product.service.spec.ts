import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductRepository } from '@domain/product/repositories/product.repository';
import { Product } from '@domain/product/entities/product.entity';
import { Money } from '@domain/shared/value-objects/money.vo';
import { GetProductService } from './get-product.service';

describe('GetProductService', () => {
  let service: GetProductService;
  let productRepository: { findById: jest.Mock };

  beforeEach(async () => {
    productRepository = { findById: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProductService,
        { provide: ProductRepository, useValue: productRepository },
      ],
    }).compile();

    service = module.get(GetProductService);
  });

  it('returns the product DTO when found', async () => {
    const product = new Product(
      'product-1',
      'Mouse',
      'Wireless mouse',
      Money.fromCents(10000, 'COP'),
      5,
      'https://example.com/mouse.png',
    );
    productRepository.findById.mockResolvedValue(product);

    await expect(service.execute('product-1')).resolves.toEqual({
      id: 'product-1',
      name: 'Mouse',
      description: 'Wireless mouse',
      priceInCents: 10000,
      currency: 'COP',
      stock: 5,
      imageUrl: 'https://example.com/mouse.png',
    });
  });

  it('throws NotFoundException when the product does not exist', async () => {
    productRepository.findById.mockResolvedValue(null);

    await expect(service.execute('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
