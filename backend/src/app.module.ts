import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from '@config/configuration';
import { envValidationSchema } from '@config/env.validation';
import { PrismaModule } from '@infrastructure/database/prisma.module';
import { HealthModule } from '@modules/health/health.module';
import { ProductModule } from '@modules/product/product.module';
import { TransactionModule } from '@modules/transaction/transaction.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: envValidationSchema,
    }),
    PrismaModule,
    HealthModule,
    ProductModule,
    TransactionModule,
  ],
})
export class AppModule {}
