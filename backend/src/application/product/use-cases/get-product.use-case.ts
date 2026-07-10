import { ProductDto } from '@application/product/dto/product.dto';

export abstract class GetProductUseCase {
  abstract execute(id: string): Promise<ProductDto>;
}
