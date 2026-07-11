import { PrismaService } from '@infrastructure/database/prisma.service';
import { Transaction } from '@domain/transaction/entities/transaction.entity';
import { TransactionStatus } from '@domain/transaction/transaction-status.enum';
import { Money } from '@domain/shared/value-objects/money.vo';
import { PrismaTransactionRepository } from './prisma-transaction.repository';

describe('PrismaTransactionRepository', () => {
  let repository: PrismaTransactionRepository;
  let prisma: {
    transaction: {
      create: jest.Mock;
      update: jest.Mock;
      findUnique: jest.Mock;
      findFirst: jest.Mock;
    };
  };

  const now = new Date();
  const record = {
    id: 'tx-1',
    status: TransactionStatus.PENDING,
    amountInCents: 10000,
    currency: 'COP',
    productId: 'product-1',
    customerId: 'customer-1',
    gatewayTransactionId: null,
    createdAt: now,
    updatedAt: now,
  };

  beforeEach(() => {
    prisma = {
      transaction: {
        create: jest.fn().mockResolvedValue(record),
        update: jest.fn().mockResolvedValue({
          ...record,
          status: TransactionStatus.APPROVED,
          gatewayTransactionId: 'gw-1',
        }),
        findUnique: jest.fn().mockResolvedValue(record),
        findFirst: jest.fn().mockResolvedValue(record),
      },
    };
    repository = new PrismaTransactionRepository(
      prisma as unknown as PrismaService,
    );
  });

  it('creates a transaction through prisma using the provided id', async () => {
    const transaction = new Transaction(
      'tx-1',
      TransactionStatus.PENDING,
      Money.fromCents(10000, 'COP'),
      'product-1',
      'customer-1',
      null,
      now,
      now,
    );

    await repository.create(transaction);

    expect(prisma.transaction.create).toHaveBeenCalledWith({
      data: {
        id: 'tx-1',
        status: TransactionStatus.PENDING,
        amountInCents: 10000,
        currency: 'COP',
        productId: 'product-1',
        customerId: 'customer-1',
        gatewayTransactionId: null,
      },
    });
  });

  it('updates the status and gateway id through prisma', async () => {
    const result = await repository.updateStatus(
      'tx-1',
      TransactionStatus.APPROVED,
      'gw-1',
    );

    expect(prisma.transaction.update).toHaveBeenCalledWith({
      where: { id: 'tx-1' },
      data: {
        status: TransactionStatus.APPROVED,
        gatewayTransactionId: 'gw-1',
      },
    });
    expect(result.status).toBe(TransactionStatus.APPROVED);
  });

  it('returns null when a transaction is not found', async () => {
    prisma.transaction.findUnique.mockResolvedValue(null);

    await expect(repository.findById('missing')).resolves.toBeNull();
  });

  it('finds a transaction by its gateway transaction id', async () => {
    const transaction = await repository.findByGatewayTransactionId('gw-1');

    expect(prisma.transaction.findFirst).toHaveBeenCalledWith({
      where: { gatewayTransactionId: 'gw-1' },
    });
    expect(transaction?.id).toBe('tx-1');
  });

  it('returns null when no transaction matches the gateway transaction id', async () => {
    prisma.transaction.findFirst.mockResolvedValue(null);

    await expect(
      repository.findByGatewayTransactionId('missing'),
    ).resolves.toBeNull();
  });
});
