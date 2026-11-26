import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TariffCategory } from './tariff-category.entity';
import { TariffCategorySettings } from './tariff-category-settings.entity';
import { TariffCategoryController } from './tariff-category.controller';
import { TariffCategoryService } from './tariff-category.service';
import { TariffCategorySettingsController } from './tariff-category-settings.controller';
import { TariffCategorySettingsService } from './tariff-category-settings.service';
import { TariffCategoryRateFacade } from './tariff-category-rate.facade';

@Module({
  imports: [TypeOrmModule.forFeature([TariffCategory, TariffCategorySettings])],
  controllers: [TariffCategoryController, TariffCategorySettingsController],
  providers: [
    TariffCategoryService,
    TariffCategorySettingsService,
    TariffCategoryRateFacade,
  ],
  exports: [
    TariffCategoryService,
    TariffCategorySettingsService,
    TariffCategoryRateFacade,
  ],
})
export class TariffCategoryModule {}
