import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Consumption } from './consumption.entity';
import { ConsumptionService } from './consumption.service';
import { ConsumptionController } from './consumption.controller';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { WaterBillsModule } from '../water-bills/water-bills.module';
import { AdminsModule } from '../admins/admins.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Consumption]),
    AuditLogsModule,
    WaterBillsModule,
    AdminsModule,
  ],
  controllers: [ConsumptionController],
  providers: [ConsumptionService],
  exports: [ConsumptionService],
})
export class ConsumptionModule {}
