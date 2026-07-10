import { Module } from '@nestjs/common';
import { GetProductUseCase } from '@application/product/use-cases/get-product.use-case';
import { GetProductService } from '@application/product/use-cases/get-product.service';
import { ListProductsUseCase } from '@application/product/use-cases/list-products.use-case';
import { ListProductsService } from '@application/product/use-cases/list-products.service';
import { ProductController } from './product.controller';

@Module({
  controllers: [ProductController],
  providers: [
    { provide: ListProductsUseCase, useClass: ListProductsService },
    { provide: GetProductUseCase, useClass: GetProductService },
  ],
})
export class ProductModule {}
