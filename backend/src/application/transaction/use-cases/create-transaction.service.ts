import { randomUUID } from 'node:crypto';
import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Customer } from '@domain/customer/entities/customer.entity';
import { CustomerRepository } from '@domain/customer/repositories/customer.repository';
import { ProductRepository } from '@domain/product/repositories/product.repository';
import { Money } from '@domain/shared/value-objects/money.vo';
import { Transaction } from '@domain/transaction/entities/transaction.entity';
import { TransactionRepository } from '@domain/transaction/repositories/transaction.repository';
import { TransactionStatus } from '@domain/transaction/transaction-status.enum';
import { PaymentGatewayPort } from '@application/ports/payment-gateway.port';
import { CreateTransactionDto } from '@application/transaction/dto/create-transaction.dto';
import { TransactionResultDto } from '@application/transaction/dto/transaction-result.dto';
import { CreateTransactionUseCase } from '@application/transaction/use-cases/create-transaction.use-case';

@Injectable()
export class CreateTransactionService implements CreateTransactionUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly paymentGateway: PaymentGatewayPort,
  ) {}

  async execute(input: CreateTransactionDto): Promise<TransactionResultDto> {
    const product = await this.productRepository.findById(input.productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (product.stock < input.quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    const customer = await this.findOrCreateCustomer(input);
    const amount = Money.fromCents(
      product.price.amountInCents * input.quantity,
      product.price.currency,
    );

    let transaction = await this.transactionRepository.create(
      new Transaction(
        randomUUID(),
        TransactionStatus.PENDING,
        amount,
        product.id,
        customer.id,
        null,
        new Date(),
        new Date(),
      ),
    );

    try {
      const gatewayResult = await this.paymentGateway.createTransaction({
        amountInCents: amount.amountInCents,
        currency: amount.currency,
        cardToken: input.cardToken,
        customerEmail: customer.email,
        reference: transaction.id,
      });

      const status = mapGatewayStatus(gatewayResult.status);
      transaction = await this.transactionRepository.updateStatus(
        transaction.id,
        status,
        gatewayResult.gatewayTransactionId,
      );

      if (status === TransactionStatus.APPROVED) {
        await this.productRepository.decrementStock(product.id, input.quantity);
      }
    } catch {
      await this.transactionRepository.updateStatus(
        transaction.id,
        TransactionStatus.ERROR,
      );
      throw new BadGatewayException('Payment gateway request failed');
    }

    return {
      id: transaction.id,
      status: transaction.status,
      amountInCents: transaction.amount.amountInCents,
      currency: transaction.amount.currency,
      productId: transaction.productId,
      createdAt: transaction.createdAt,
    };
  }

  private async findOrCreateCustomer(
    input: CreateTransactionDto,
  ): Promise<Customer> {
    const existing = await this.customerRepository.findByEmail(input.email);
    if (existing) {
      return existing;
    }

    return this.customerRepository.create(
      new Customer(
        randomUUID(),
        input.fullName,
        input.email,
        input.phoneNumber,
      ),
    );
  }
}

function mapGatewayStatus(status: string): TransactionStatus {
  switch (status) {
    case 'APPROVED':
      return TransactionStatus.APPROVED;
    case 'DECLINED':
      return TransactionStatus.DECLINED;
    default:
      return TransactionStatus.ERROR;
  }
}
