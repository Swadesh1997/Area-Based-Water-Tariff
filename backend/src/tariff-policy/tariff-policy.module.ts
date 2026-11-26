import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TariffPolicyController } from './tariff-policy.controller';
import { TariffPolicyService } from './tariff-policy.service';
import { TariffPolicy } from './tariff-policy.entity';
import { TariffThresholdSlab } from './tariff-threshold-slab.entity';
import { TariffThresholdSlabService } from './tariff-threshold-slab.service';
import { TariffThresholdSlabController } from './tariff-threshold-slab.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TariffPolicy, TariffThresholdSlab])],
  controllers: [TariffPolicyController, TariffThresholdSlabController],
  providers: [TariffPolicyService, TariffThresholdSlabService],
  exports: [TariffPolicyService, TariffThresholdSlabService],
})
export class TariffPolicyModule {}
