import { ProductDto } from '@application/product/dto/product.dto';

export abstract class ListProductsUseCase {
  abstract execute(): Promise<ProductDto[]>;
}
