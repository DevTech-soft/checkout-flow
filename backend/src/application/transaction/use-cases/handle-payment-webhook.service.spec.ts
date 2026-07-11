import { UnauthorizedException } from '@nestjs/common';
import { ProductRepository } from '@domain/product/repositories/product.repository';
import { TransactionRepository } from '@domain/transaction/repositories/transaction.repository';
import { TransactionStatus } from '@domain/transaction/transaction-status.enum';
import { Transaction } from '@domain/transaction/entities/transaction.entity';
import { TransactionItem } from '@domain/transaction/entities/transaction-item.entity';
import { Money } from '@domain/shared/value-objects/money.vo';
import { PaymentGatewayWebhookVerifier } from '@infrastructure/gateways/payment-gateway-webhook.verifier';
import { PaymentWebhookEventDto } from '@application/transaction/dto/payment-webhook-event.dto';
import { HandlePaymentWebhookService } from './handle-payment-webhook.service';

describe('HandlePaymentWebhookService', () => {
  let service: HandlePaymentWebhookService;
  let transactionRepository: {
    findByGatewayTransactionId: jest.Mock;
    updateStatus: jest.Mock;
  };
  let productRepository: { decrementStock: jest.Mock };
  let verifier: { verify: jest.Mock };

  const existingTransaction = new Transaction(
    'tx-1',
    TransactionStatus.PENDING,
    Money.fromCents(10000, 'COP'),
    [new TransactionItem('product-1', 1, 10000)],
    'customer-1',
    'gw-1',
    new Date(),
    new Date(),
  );

  const approvedTransaction = new Transaction(
    'tx-1',
    TransactionStatus.APPROVED,
    Money.fromCents(10000, 'COP'),
    [new TransactionItem('product-1', 1, 10000)],
    'customer-1',
    'gw-1',
    new Date(),
    new Date(),
  );

  const event: PaymentWebhookEventDto = {
    event: 'transaction.updated',
    data: { transaction: { id: 'gw-1', status: 'APPROVED' } },
    signature: { properties: ['transaction.id'], checksum: 'valid' },
    timestamp: 1700000000,
  };

  beforeEach(() => {
    transactionRepository = {
      findByGatewayTransactionId: jest
        .fn()
        .mockResolvedValue(existingTransaction),
      updateStatus: jest.fn().mockResolvedValue(approvedTransaction),
    };
    productRepository = { decrementStock: jest.fn().mockResolvedValue(undefined) };
    verifier = { verify: jest.fn().mockReturnValue(true) };

    service = new HandlePaymentWebhookService(
      transactionRepository as unknown as TransactionRepository,
      productRepository as unknown as ProductRepository,
      verifier as unknown as PaymentGatewayWebhookVerifier,
    );
  });

  it('throws UnauthorizedException when the signature is invalid', async () => {
    verifier.verify.mockReturnValue(false);

    await expect(service.execute(event)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(transactionRepository.updateStatus).not.toHaveBeenCalled();
  });

  it('ignores events other than transaction.updated', async () => {
    await service.execute({ ...event, event: 'payout.updated' });

    expect(transactionRepository.updateStatus).not.toHaveBeenCalled();
  });

  it('ignores the event when the gateway payload has no transaction id', async () => {
    await service.execute({
      ...event,
      data: { transaction: { status: 'APPROVED' } },
    });

    expect(
      transactionRepository.findByGatewayTransactionId,
    ).not.toHaveBeenCalled();
    expect(transactionRepository.updateStatus).not.toHaveBeenCalled();
  });

  it('ignores the event when no local transaction matches the gateway id', async () => {
    transactionRepository.findByGatewayTransactionId.mockResolvedValue(null);

    await service.execute(event);

    expect(transactionRepository.updateStatus).not.toHaveBeenCalled();
  });

  it('updates the local transaction status from the gateway status', async () => {
    await service.execute(event);

    expect(
      transactionRepository.findByGatewayTransactionId,
    ).toHaveBeenCalledWith('gw-1');
    expect(transactionRepository.updateStatus).toHaveBeenCalledWith(
      'tx-1',
      TransactionStatus.APPROVED,
    );
  });

  it('decrements stock when the webhook approves a pending transaction', async () => {
    await service.execute(event);

    expect(productRepository.decrementStock).toHaveBeenCalledWith(
      'product-1',
      1,
    );
  });

  it('does not decrement stock again when the transaction was already approved', async () => {
    transactionRepository.findByGatewayTransactionId.mockResolvedValue(
      approvedTransaction,
    );

    await service.execute(event);

    expect(productRepository.decrementStock).not.toHaveBeenCalled();
  });

  it('does not decrement stock when the webhook reports a non-approved status', async () => {
    transactionRepository.updateStatus.mockResolvedValue(existingTransaction);

    await service.execute({
      ...event,
      data: { transaction: { id: 'gw-1', status: 'DECLINED' } },
    });

    expect(productRepository.decrementStock).not.toHaveBeenCalled();
  });
});
