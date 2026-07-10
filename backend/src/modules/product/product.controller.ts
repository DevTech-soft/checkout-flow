import { Controller, Get, Param } from '@nestjs/common';
import { ProductDto } from '@application/product/dto/product.dto';
import { GetProductUseCase } from '@application/product/use-cases/get-product.use-case';
import { ListProductsUseCase } from '@application/product/use-cases/list-products.use-case';

@Controller('products')
export class ProductController {
  constructor(
    private readonly listProductsUseCase: ListProductsUseCase,
    private readonly getProductUseCase: GetProductUseCase,
  ) {}

  @Get()
  findAll(): Promise<ProductDto[]> {
    return this.listProductsUseCase.execute();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ProductDto> {
    return this.getProductUseCase.execute(id);
  }
}
