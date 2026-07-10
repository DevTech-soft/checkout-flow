import { Test, TestingModule } from '@nestjs/testing';
import {
  BadGatewayException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ProductRepository } from '@domain/product/repositories/product.repository';
import { CustomerRepository } from '@domain/customer/repositories/customer.repository';
import { TransactionRepository } from '@domain/transaction/repositories/transaction.repository';
import { PaymentGatewayPort } from '@application/ports/payment-gateway.port';
import { Product } from '@domain/product/entities/product.entity';
import { Customer } from '@domain/customer/entities/customer.entity';
import { Transaction } from '@domain/transaction/entities/transaction.entity';
import { TransactionStatus } from '@domain/transaction/transaction-status.enum';
import { Money } from '@domain/shared/value-objects/money.vo';
import { CreateTransactionDto } from '@application/transaction/dto/create-transaction.dto';
import { CreateTransactionService } from './create-transaction.service';

describe('CreateTransactionService', () => {
  let service: CreateTransactionService;
  let productRepository: {
    findById: jest.Mock;
    decrementStock: jest.Mock;
  };
  let customerRepository: { findByEmail: jest.Mock; create: jest.Mock };
  let transactionRepository: { create: jest.Mock; updateStatus: jest.Mock };
  let paymentGateway: { createTransaction: jest.Mock };

  const product = new Product(
    'product-1',
    'Mouse',
    'Wireless mouse',
    Money.fromCents(10000, 'COP'),
    5,
    'https://example.com/mouse.png',
  );

  const input: CreateTransactionDto = {
    productId: 'product-1',
    quantity: 1,
    cardToken: 'tok_test_123',
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    phoneNumber: '3001234567',
  };

  beforeEach(async () => {
    productRepository = {
      findById: jest.fn().mockResolvedValue(product),
      decrementStock: jest.fn().mockResolvedValue(undefined),
    };
    customerRepository = {
      findByEmail: jest.fn().mockResolvedValue(null),
      create: jest
        .fn()
        .mockImplementation((customer: Customer) => Promise.resolve(customer)),
    };
    transactionRepository = {
      create: jest
        .fn()
        .mockImplementation((transaction: Transaction) =>
          Promise.resolve(transaction),
        ),
      updateStatus: jest
        .fn()
        .mockImplementation(
          (
            id: string,
            status: TransactionStatus,
            gatewayTransactionId?: string,
          ) =>
            Promise.resolve(
              new Transaction(
                id,
                status,
                Money.fromCents(10000, 'COP'),
                product.id,
                'customer-1',
                gatewayTransactionId ?? null,
                new Date(),
                new Date(),
              ),
            ),
        ),
    };
    paymentGateway = { createTransaction: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionService,
        { provide: ProductRepository, useValue: productRepository },
        { provide: CustomerRepository, useValue: customerRepository },
        { provide: TransactionRepository, useValue: transactionRepository },
        { provide: PaymentGatewayPort, useValue: paymentGateway },
      ],
    }).compile();

    service = module.get(CreateTransactionService);
  });

  it('throws NotFoundException when the product does not exist', async () => {
    productRepository.findById.mockResolvedValue(null);

    await expect(service.execute(input)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(transactionRepository.create).not.toHaveBeenCalled();
  });

  it('throws BadRequestException when stock is insufficient', async () => {
    productRepository.findById.mockResolvedValue(
      new Product(
        'product-1',
        'Mouse',
        'Wireless mouse',
        Money.fromCents(10000, 'COP'),
        0,
        'https://example.com/mouse.png',
      ),
    );

    await expect(service.execute(input)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(transactionRepository.create).not.toHaveBeenCalled();
  });

  it('reuses an existing customer instead of creating a new one', async () => {
    const existingCustomer = new Customer(
      'customer-1',
      'Jane Doe',
      'jane@example.com',
      '3001234567',
    );
    customerRepository.findByEmail.mockResolvedValue(existingCustomer);
    paymentGateway.createTransaction.mockResolvedValue({
      gatewayTransactionId: 'gw-1',
      status: 'APPROVED',
    });

    await service.execute(input);

    expect(customerRepository.create).not.toHaveBeenCalled();
  });

  it('approves the transaction and decrements stock on gateway approval', async () => {
    paymentGateway.createTransaction.mockResolvedValue({
      gatewayTransactionId: 'gw-1',
      status: 'APPROVED',
    });

    const result = await service.execute(input);

    expect(result.status).toBe(TransactionStatus.APPROVED);
    expect(productRepository.decrementStock).toHaveBeenCalledWith(
      'product-1',
      1,
    );
    expect(transactionRepository.updateStatus).toHaveBeenCalledWith(
      expect.any(String),
      TransactionStatus.APPROVED,
      'gw-1',
    );
  });

  it('declines the transaction without decrementing stock', async () => {
    paymentGateway.createTransaction.mockResolvedValue({
      gatewayTransactionId: 'gw-2',
      status: 'DECLINED',
    });

    const result = await service.execute(input);

    expect(result.status).toBe(TransactionStatus.DECLINED);
    expect(productRepository.decrementStock).not.toHaveBeenCalled();
  });

  it('marks the transaction as ERROR and throws BadGatewayException when the gateway fails', async () => {
    paymentGateway.createTransaction.mockRejectedValue(new Error('timeout'));

    await expect(service.execute(input)).rejects.toBeInstanceOf(
      BadGatewayException,
    );
    expect(transactionRepository.updateStatus).toHaveBeenCalledWith(
      expect.any(String),
      TransactionStatus.ERROR,
    );
    expect(productRepository.decrementStock).not.toHaveBeenCalled();
  });
});
