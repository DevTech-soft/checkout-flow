import { randomUUID } from 'node:crypto';
import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Customer } from '@domain/customer/entities/customer.entity';
import { CustomerRepository } from '@domain/customer/repositories/customer.repository';
import { Product } from '@domain/product/entities/product.entity';
import { ProductRepository } from '@domain/product/repositories/product.repository';
import { Money } from '@domain/shared/value-objects/money.vo';
import { Transaction } from '@domain/transaction/entities/transaction.entity';
import { TransactionItem } from '@domain/transaction/entities/transaction-item.entity';
import { TransactionRepository } from '@domain/transaction/repositories/transaction.repository';
import { TransactionStatus } from '@domain/transaction/transaction-status.enum';
import { PaymentGatewayPort } from '@application/ports/payment-gateway.port';
import {
  CreateTransactionDto,
  CreateTransactionItemDto,
} from '@application/transaction/dto/create-transaction.dto';
import { TransactionResultDto } from '@application/transaction/dto/transaction-result.dto';
import { CreateTransactionUseCase } from '@application/transaction/use-cases/create-transaction.use-case';
import { mapGatewayStatus } from '@application/transaction/mappers/gateway-status.mapper';
import { decrementStockForApprovedTransaction } from '@application/transaction/decrement-stock-for-approved-transaction';

@Injectable()
export class CreateTransactionService implements CreateTransactionUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly paymentGateway: PaymentGatewayPort,
  ) {}

  async execute(input: CreateTransactionDto): Promise<TransactionResultDto> {
    const products = await this.resolveProducts(input.items);

    const currency = products[0][0].price.currency;
    const items: TransactionItem[] = [];
    let amountInCents = 0;

    for (const [product, requestedItem] of products) {
      if (product.stock < requestedItem.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${product.id}`,
        );
      }
      if (product.price.currency !== currency) {
        throw new BadRequestException(
          'All items in a transaction must share the same currency',
        );
      }

      items.push(
        new TransactionItem(
          product.id,
          requestedItem.quantity,
          product.price.amountInCents,
        ),
      );
      amountInCents += product.price.amountInCents * requestedItem.quantity;
    }

    const customer = await this.findOrCreateCustomer(input);
    const amount = Money.fromCents(amountInCents, currency);

    let transaction = await this.transactionRepository.create(
      new Transaction(
        randomUUID(),
        TransactionStatus.PENDING,
        amount,
        items,
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

      await decrementStockForApprovedTransaction(
        this.productRepository,
        transaction,
        TransactionStatus.PENDING,
      );
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
      items: transaction.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPriceInCents: item.unitPriceInCents,
      })),
      createdAt: transaction.createdAt,
    };
  }

  private async resolveProducts(
    requestedItems: CreateTransactionItemDto[],
  ): Promise<[Product, CreateTransactionItemDto][]> {
    return Promise.all(
      requestedItems.map(async requestedItem => {
        const product = await this.productRepository.findById(
          requestedItem.productId,
        );
        if (!product) {
          throw new NotFoundException(
            `Product ${requestedItem.productId} not found`,
          );
        }
        return [product, requestedItem] as [Product, CreateTransactionItemDto];
      }),
    );
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
