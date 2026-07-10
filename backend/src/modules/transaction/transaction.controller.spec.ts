import { CreateTransactionDto } from '@application/transaction/dto/create-transaction.dto';
import { TransactionController } from './transaction.controller';

describe('TransactionController', () => {
  let controller: TransactionController;
  let createTransactionUseCase: { execute: jest.Mock };
  let getTransactionStatusUseCase: { execute: jest.Mock };

  const dto: CreateTransactionDto = {
    productId: 'product-1',
    quantity: 1,
    cardToken: 'tok_test_123',
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    phoneNumber: '3001234567',
  };

  beforeEach(() => {
    createTransactionUseCase = {
      execute: jest.fn().mockResolvedValue({ id: 'tx-1' }),
    };
    getTransactionStatusUseCase = {
      execute: jest.fn().mockResolvedValue({ id: 'tx-1' }),
    };

    controller = new TransactionController(
      createTransactionUseCase,
      getTransactionStatusUseCase,
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
});
