import { Injectable } from '@nestjs/common';
import {
  Transaction as PrismaTransaction,
  TransactionItem as PrismaTransactionItem,
} from '@prisma/client';
import { Transaction } from '@domain/transaction/entities/transaction.entity';
import { TransactionItem } from '@domain/transaction/entities/transaction-item.entity';
import { TransactionRepository } from '@domain/transaction/repositories/transaction.repository';
import { TransactionStatus } from '@domain/transaction/transaction-status.enum';
import { Money } from '@domain/shared/value-objects/money.vo';
import { PrismaService } from '@infrastructure/database/prisma.service';

type PrismaTransactionWithItems = PrismaTransaction & {
  items: PrismaTransactionItem[];
};

const WITH_ITEMS = { items: true } as const;

@Injectable()
export class PrismaTransactionRepository implements TransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(transaction: Transaction): Promise<Transaction> {
    const created = await this.prisma.transaction.create({
      data: {
        id: transaction.id,
        status: transaction.status,
        amountInCents: transaction.amount.amountInCents,
        currency: transaction.amount.currency,
        customerId: transaction.customerId,
        gatewayTransactionId: transaction.gatewayTransactionId,
        items: {
          create: transaction.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPriceInCents: item.unitPriceInCents,
          })),
        },
      },
      include: WITH_ITEMS,
    });
    return toDomain(created);
  }

  async updateStatus(
    id: string,
    status: TransactionStatus,
    gatewayTransactionId?: string,
  ): Promise<Transaction> {
    const updated = await this.prisma.transaction.update({
      where: { id },
      data: {
        status,
        ...(gatewayTransactionId && { gatewayTransactionId }),
      },
      include: WITH_ITEMS,
    });
    return toDomain(updated);
  }

  async findById(id: string): Promise<Transaction | null> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: WITH_ITEMS,
    });
    return transaction ? toDomain(transaction) : null;
  }

  async findByGatewayTransactionId(
    gatewayTransactionId: string,
  ): Promise<Transaction | null> {
    const transaction = await this.prisma.transaction.findFirst({
      where: { gatewayTransactionId },
      include: WITH_ITEMS,
    });
    return transaction ? toDomain(transaction) : null;
  }
}

function toDomain(transaction: PrismaTransactionWithItems): Transaction {
  return new Transaction(
    transaction.id,
    transaction.status as TransactionStatus,
    Money.fromCents(transaction.amountInCents, transaction.currency),
    transaction.items.map(
      item =>
        new TransactionItem(
          item.productId,
          item.quantity,
          item.unitPriceInCents,
        ),
    ),
    transaction.customerId,
    transaction.gatewayTransactionId,
    transaction.createdAt,
    transaction.updatedAt,
  );
}
