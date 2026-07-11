import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductRepository } from '@domain/product/repositories/product.repository';
import { TransactionRepository } from '@domain/transaction/repositories/transaction.repository';
import { Transaction } from '@domain/transaction/entities/transaction.entity';
import { TransactionItem } from '@domain/transaction/entities/transaction-item.entity';
import { TransactionStatus } from '@domain/transaction/transaction-status.enum';
import { Money } from '@domain/shared/value-objects/money.vo';
import { PaymentGatewayPort } from '@application/ports/payment-gateway.port';
import { GetTransactionStatusService } from './get-transaction-status.service';

describe('GetTransactionStatusService', () => {
  let service: GetTransactionStatusService;
  let transactionRepository: {
    findById: jest.Mock;
    updateStatus: jest.Mock;
  };
  let productRepository: { decrementStock: jest.Mock };
  let paymentGateway: { getTransactionStatus: jest.Mock };

  beforeEach(async () => {
    transactionRepository = { findById: jest.fn(), updateStatus: jest.fn() };
    productRepository = { decrementStock: jest.fn().mockResolvedValue(undefined) };
    paymentGateway = { getTransactionStatus: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTransactionStatusService,
        { provide: TransactionRepository, useValue: transactionRepository },
        { provide: ProductRepository, useValue: productRepository },
        { provide: PaymentGatewayPort, useValue: paymentGateway },
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
      [new TransactionItem('product-1', 1, 50000)],
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
      items: [{ productId: 'product-1', quantity: 1, unitPriceInCents: 50000 }],
      createdAt,
    });
  });

  it('throws NotFoundException when the transaction does not exist', async () => {
    transactionRepository.findById.mockResolvedValue(null);

    await expect(service.execute('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('reconciles with the gateway when the transaction is still PENDING', async () => {
    const createdAt = new Date('2026-01-01T00:00:00Z');
    const pending = new Transaction(
      'tx-1',
      TransactionStatus.PENDING,
      Money.fromCents(50000, 'COP'),
      [new TransactionItem('product-1', 1, 50000)],
      'customer-1',
      'gateway-tx-1',
      createdAt,
      createdAt,
    );
    const approved = new Transaction(
      'tx-1',
      TransactionStatus.APPROVED,
      Money.fromCents(50000, 'COP'),
      [new TransactionItem('product-1', 1, 50000)],
      'customer-1',
      'gateway-tx-1',
      createdAt,
      createdAt,
    );
    transactionRepository.findById.mockResolvedValue(pending);
    paymentGateway.getTransactionStatus.mockResolvedValue('APPROVED');
    transactionRepository.updateStatus.mockResolvedValue(approved);

    await expect(service.execute('tx-1')).resolves.toEqual({
      id: 'tx-1',
      status: TransactionStatus.APPROVED,
      amountInCents: 50000,
      currency: 'COP',
      items: [{ productId: 'product-1', quantity: 1, unitPriceInCents: 50000 }],
      createdAt,
    });
    expect(paymentGateway.getTransactionStatus).toHaveBeenCalledWith(
      'gateway-tx-1',
    );
    expect(transactionRepository.updateStatus).toHaveBeenCalledWith(
      'tx-1',
      TransactionStatus.APPROVED,
    );
    expect(productRepository.decrementStock).toHaveBeenCalledWith(
      'product-1',
      1,
    );
  });

  it('does not decrement stock again when the transaction was already approved', async () => {
    const createdAt = new Date('2026-01-01T00:00:00Z');
    const alreadyApproved = new Transaction(
      'tx-1',
      TransactionStatus.APPROVED,
      Money.fromCents(50000, 'COP'),
      [new TransactionItem('product-1', 1, 50000)],
      'customer-1',
      'gateway-tx-1',
      createdAt,
      createdAt,
    );
    transactionRepository.findById.mockResolvedValue(alreadyApproved);

    await service.execute('tx-1');

    expect(paymentGateway.getTransactionStatus).not.toHaveBeenCalled();
    expect(productRepository.decrementStock).not.toHaveBeenCalled();
  });

  it('keeps PENDING without updating when the gateway still reports PENDING', async () => {
    const createdAt = new Date('2026-01-01T00:00:00Z');
    const pending = new Transaction(
      'tx-1',
      TransactionStatus.PENDING,
      Money.fromCents(50000, 'COP'),
      [new TransactionItem('product-1', 1, 50000)],
      'customer-1',
      'gateway-tx-1',
      createdAt,
      createdAt,
    );
    transactionRepository.findById.mockResolvedValue(pending);
    paymentGateway.getTransactionStatus.mockResolvedValue('PENDING');

    await expect(service.execute('tx-1')).resolves.toMatchObject({
      status: TransactionStatus.PENDING,
    });
    expect(transactionRepository.updateStatus).not.toHaveBeenCalled();
  });

  it('returns the last known status when the gateway call fails', async () => {
    const createdAt = new Date('2026-01-01T00:00:00Z');
    const pending = new Transaction(
      'tx-1',
      TransactionStatus.PENDING,
      Money.fromCents(50000, 'COP'),
      [new TransactionItem('product-1', 1, 50000)],
      'customer-1',
      'gateway-tx-1',
      createdAt,
      createdAt,
    );
    transactionRepository.findById.mockResolvedValue(pending);
    paymentGateway.getTransactionStatus.mockRejectedValue(
      new Error('network error'),
    );

    await expect(service.execute('tx-1')).resolves.toMatchObject({
      status: TransactionStatus.PENDING,
    });
    expect(transactionRepository.updateStatus).not.toHaveBeenCalled();
  });
});
