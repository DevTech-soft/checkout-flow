import { Global, Module } from '@nestjs/common';
import { CustomerRepository } from '@domain/customer/repositories/customer.repository';
import { ProductRepository } from '@domain/product/repositories/product.repository';
import { TransactionRepository } from '@domain/transaction/repositories/transaction.repository';
import { PrismaService } from './prisma.service';
import { PrismaCustomerRepository } from './repositories/prisma-customer.repository';
import { PrismaProductRepository } from './repositories/prisma-product.repository';
import { PrismaTransactionRepository } from './repositories/prisma-transaction.repository';

@Global()
@Module({
  providers: [
    PrismaService,
    { provide: ProductRepository, useClass: PrismaProductRepository },
    { provide: CustomerRepository, useClass: PrismaCustomerRepository },
    { provide: TransactionRepository, useClass: PrismaTransactionRepository },
  ],
  exports: [
    PrismaService,
    ProductRepository,
    CustomerRepository,
    TransactionRepository,
  ],
})
export class PrismaModule {}
