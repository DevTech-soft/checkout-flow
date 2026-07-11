import { Injectable } from '@nestjs/common';
import { Transaction as PrismaTransaction } from '@prisma/client';
import { Transaction } from '@domain/transaction/entities/transaction.entity';
import { TransactionRepository } from '@domain/transaction/repositories/transaction.repository';
import { TransactionStatus } from '@domain/transaction/transaction-status.enum';
import { Money } from '@domain/shared/value-objects/money.vo';
import { PrismaService } from '@infrastructure/database/prisma.service';

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
        productId: transaction.productId,
        customerId: transaction.customerId,
        gatewayTransactionId: transaction.gatewayTransactionId,
      },
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
    });
    return toDomain(updated);
  }

  async findById(id: string): Promise<Transaction | null> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });
    return transaction ? toDomain(transaction) : null;
  }

  async findByGatewayTransactionId(
    gatewayTransactionId: string,
  ): Promise<Transaction | null> {
    const transaction = await this.prisma.transaction.findFirst({
      where: { gatewayTransactionId },
    });
    return transaction ? toDomain(transaction) : null;
  }
}

function toDomain(transaction: PrismaTransaction): Transaction {
  return new Transaction(
    transaction.id,
    transaction.status as TransactionStatus,
    Money.fromCents(transaction.amountInCents, transaction.currency),
    transaction.productId,
    transaction.customerId,
    transaction.gatewayTransactionId,
    transaction.createdAt,
    transaction.updatedAt,
  );
}
