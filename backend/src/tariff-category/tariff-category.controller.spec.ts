import { Test, TestingModule } from '@nestjs/testing';
import { TariffCategoryController } from './tariff-category.controller';

describe('TariffCategoryController', () => {
  let controller: TariffCategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TariffCategoryController],
    }).compile();

    controller = module.get<TariffCategoryController>(TariffCategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
