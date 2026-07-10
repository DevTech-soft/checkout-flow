import { PrismaService } from '@infrastructure/database/prisma.service';
import { Money } from '@domain/shared/value-objects/money.vo';
import { PrismaProductRepository } from './prisma-product.repository';

describe('PrismaProductRepository', () => {
  let repository: PrismaProductRepository;
  let prisma: {
    product: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };

  const record = {
    id: 'product-1',
    name: 'Mouse',
    description: 'Wireless mouse',
    priceInCents: 10000,
    currency: 'COP',
    stock: 5,
    imageUrl: 'https://example.com/mouse.png',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    prisma = {
      product: {
        findMany: jest.fn().mockResolvedValue([record]),
        findUnique: jest.fn().mockResolvedValue(record),
        update: jest.fn().mockResolvedValue(record),
      },
    };
    repository = new PrismaProductRepository(
      prisma as unknown as PrismaService,
    );
  });

  it('maps all products to domain entities', async () => {
    const products = await repository.findAll();

    expect(products).toHaveLength(1);
    expect(products[0].price).toEqual(Money.fromCents(10000, 'COP'));
  });

  it('returns null when a product is not found', async () => {
    prisma.product.findUnique.mockResolvedValue(null);

    await expect(repository.findById('missing')).resolves.toBeNull();
  });

  it('decrements stock through prisma', async () => {
    await repository.decrementStock('product-1', 2);

    expect(prisma.product.update).toHaveBeenCalledWith({
      where: { id: 'product-1' },
      data: { stock: { decrement: 2 } },
    });
  });
});
