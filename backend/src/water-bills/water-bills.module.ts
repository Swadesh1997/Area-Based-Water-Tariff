import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WaterBillsController } from './water-bills.controller';
import { WaterBillsService } from './water-bills.service';
import { WaterBill } from './water-bill.entity';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { TariffPolicyModule } from '../tariff-policy/tariff-policy.module';
import { ZoneScoringModule } from '../zone-scoring/zone-scoring.module';
import { Consumption } from '../consumption/consumption.entity';
import { User } from '../users/user.entity';
import { CustomerCategoryAssignment } from '../customer-categories/customer-category.entity';
import { TariffThresholdSlab } from '../tariff-policy/tariff-threshold-slab.entity';
import { TariffCategory } from '../tariff-category/tariff-category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WaterBill,
      Consumption,
      User,
      CustomerCategoryAssignment,
      TariffCategory,
      TariffThresholdSlab,
    ]),
    AuditLogsModule,
    TariffPolicyModule,
    ZoneScoringModule,
  ],
  controllers: [WaterBillsController],
  providers: [WaterBillsService],
  exports: [WaterBillsService],
})
export class WaterBillsModule {}
