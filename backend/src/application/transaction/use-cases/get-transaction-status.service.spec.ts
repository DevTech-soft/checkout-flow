import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TransactionRepository } from '@domain/transaction/repositories/transaction.repository';
import { Transaction } from '@domain/transaction/entities/transaction.entity';
import { TransactionStatus } from '@domain/transaction/transaction-status.enum';
import { Money } from '@domain/shared/value-objects/money.vo';
import { GetTransactionStatusService } from './get-transaction-status.service';

describe('GetTransactionStatusService', () => {
  let service: GetTransactionStatusService;
  let transactionRepository: { findById: jest.Mock };

  beforeEach(async () => {
    transactionRepository = { findById: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTransactionStatusService,
        { provide: TransactionRepository, useValue: transactionRepository },
      ],
    }).compile();

    service = module.get(GetTransactionStatusService);
  });

  it('returns the transaction DTO when found', async () => {
    const createdAt = new Date('2026-01-01T00:00:00Z');
    const transaction = new Transaction(
      'tx-1',
      TransactionStatus.APPROVED,
      Money.fromCents(50000, 'COP'),
      'product-1',
      'customer-1',
      'gateway-tx-1',
      createdAt,
      createdAt,
    );
    transactionRepository.findById.mockResolvedValue(transaction);

    await expect(service.execute('tx-1')).resolves.toEqual({
      id: 'tx-1',
      status: TransactionStatus.APPROVED,
      amountInCents: 50000,
      currency: 'COP',
      productId: 'product-1',
      createdAt,
    });
  });

  it('throws NotFoundException when the transaction does not exist', async () => {
    transactionRepository.findById.mockResolvedValue(null);

    await expect(service.execute('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
