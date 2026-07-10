import { Test, TestingModule } from '@nestjs/testing';
import { ProductRepository } from '@domain/product/repositories/product.repository';
import { Product } from '@domain/product/entities/product.entity';
import { Money } from '@domain/shared/value-objects/money.vo';
import { ListProductsService } from './list-products.service';

describe('ListProductsService', () => {
  let service: ListProductsService;
  let productRepository: { findAll: jest.Mock };

  beforeEach(async () => {
    productRepository = { findAll: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListProductsService,
        { provide: ProductRepository, useValue: productRepository },
      ],
    }).compile();

    service = module.get(ListProductsService);
  });

  it('maps domain products to DTOs', async () => {
    const product = new Product(
      'product-1',
      'Mouse',
      'Wireless mouse',
      Money.fromCents(10000, 'COP'),
      5,
      'https://example.com/mouse.png',
    );
    productRepository.findAll.mockResolvedValue([product]);

    await expect(service.execute()).resolves.toEqual([
      {
        id: 'product-1',
        name: 'Mouse',
        description: 'Wireless mouse',
        priceInCents: 10000,
        currency: 'COP',
        stock: 5,
        imageUrl: 'https://example.com/mouse.png',
      },
    ]);
  });
});
