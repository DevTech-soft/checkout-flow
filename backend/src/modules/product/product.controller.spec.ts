import { ProductController } from './product.controller';

describe('ProductController', () => {
  let controller: ProductController;
  let listProductsUseCase: { execute: jest.Mock };
  let getProductUseCase: { execute: jest.Mock };

  beforeEach(() => {
    listProductsUseCase = { execute: jest.fn().mockResolvedValue([]) };
    getProductUseCase = { execute: jest.fn().mockResolvedValue({ id: 'p1' }) };

    controller = new ProductController(listProductsUseCase, getProductUseCase);
  });

  it('delegates listing to ListProductsUseCase', async () => {
    await controller.findAll();

    expect(listProductsUseCase.execute).toHaveBeenCalled();
  });

  it('delegates lookup by id to GetProductUseCase', async () => {
    await controller.findOne('p1');

    expect(getProductUseCase.execute).toHaveBeenCalledWith('p1');
  });
});
