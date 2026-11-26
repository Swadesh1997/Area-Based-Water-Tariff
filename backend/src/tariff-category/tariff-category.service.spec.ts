import { Test, TestingModule } from '@nestjs/testing';
import { TariffCategoryService } from './tariff-category.service';

describe('TariffCategoryService', () => {
  let service: TariffCategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TariffCategoryService],
    }).compile();

    service = module.get<TariffCategoryService>(TariffCategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
