import { CreateTransactionDto } from '@application/transaction/dto/create-transaction.dto';
import { PaymentWebhookEventDto } from '@application/transaction/dto/payment-webhook-event.dto';
import { TransactionController } from './transaction.controller';

describe('TransactionController', () => {
  let controller: TransactionController;
  let createTransactionUseCase: { execute: jest.Mock };
  let getTransactionStatusUseCase: { execute: jest.Mock };
  let handlePaymentWebhookUseCase: { execute: jest.Mock };

  const dto: CreateTransactionDto = {
    productId: 'product-1',
    quantity: 1,
    cardToken: 'tok_test_123',
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    phoneNumber: '3001234567',
  };

  const webhookEvent: PaymentWebhookEventDto = {
    event: 'transaction.updated',
    data: { transaction: { id: 'gw-1', status: 'APPROVED' } },
    signature: { properties: ['transaction.id'], checksum: 'valid' },
    timestamp: 1700000000,
  };

  beforeEach(() => {
    createTransactionUseCase = {
      execute: jest.fn().mockResolvedValue({ id: 'tx-1' }),
    };
    getTransactionStatusUseCase = {
      execute: jest.fn().mockResolvedValue({ id: 'tx-1' }),
    };
    handlePaymentWebhookUseCase = {
      execute: jest.fn().mockResolvedValue(undefined),
    };

    controller = new TransactionController(
      createTransactionUseCase,
      getTransactionStatusUseCase,
      handlePaymentWebhookUseCase,
    );
  });

  it('delegates creation to CreateTransactionUseCase', async () => {
    await controller.create(dto);

    expect(createTransactionUseCase.execute).toHaveBeenCalledWith(dto);
  });

  it('delegates lookup by id to GetTransactionStatusUseCase', async () => {
    await controller.findOne('tx-1');

    expect(getTransactionStatusUseCase.execute).toHaveBeenCalledWith('tx-1');
  });

  it('delegates webhook handling to HandlePaymentWebhookUseCase', async () => {
    const result = await controller.handleWebhook(webhookEvent);

    expect(handlePaymentWebhookUseCase.execute).toHaveBeenCalledWith(
      webhookEvent,
    );
    expect(result).toEqual({ received: true });
  });
});
