import { PrismaService } from '@infrastructure/database/prisma.service';
import { Customer } from '@domain/customer/entities/customer.entity';
import { PrismaCustomerRepository } from './prisma-customer.repository';

describe('PrismaCustomerRepository', () => {
  let repository: PrismaCustomerRepository;
  let prisma: {
    customer: { findUnique: jest.Mock; create: jest.Mock };
  };

  const record = {
    id: 'customer-1',
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    phoneNumber: '3001234567',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    prisma = {
      customer: {
        findUnique: jest.fn().mockResolvedValue(record),
        create: jest.fn().mockResolvedValue(record),
      },
    };
    repository = new PrismaCustomerRepository(
      prisma as unknown as PrismaService,
    );
  });

  it('maps the record to a domain customer when found by email', async () => {
    const customer = await repository.findByEmail('jane@example.com');

    expect(customer).toEqual(
      new Customer('customer-1', 'Jane Doe', 'jane@example.com', '3001234567'),
    );
  });

  it('returns null when a customer is not found by email', async () => {
    prisma.customer.findUnique.mockResolvedValue(null);

    await expect(
      repository.findByEmail('missing@example.com'),
    ).resolves.toBeNull();
  });

  it('creates a customer through prisma using the provided id', async () => {
    const customer = new Customer(
      'customer-1',
      'Jane Doe',
      'jane@example.com',
      '3001234567',
    );

    const created = await repository.create(customer);

    expect(prisma.customer.create).toHaveBeenCalledWith({
      data: {
        id: 'customer-1',
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        phoneNumber: '3001234567',
      },
    });
    expect(created).toEqual(customer);
  });
});
