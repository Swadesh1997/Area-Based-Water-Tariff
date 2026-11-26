import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { get } from 'http';
import { getDatabaseConfig } from './config/database.config';
import { ConfigModule } from '@nestjs/config';
import { RolesModule } from './roles/roles.module';
import { AdminsModule } from './admins/admins.module';
import { wasasModule } from './wasa/wasa.module';
import { ZonesModule } from './zones/zones.module';
import { WardsModule } from './wards/wards.module';
import { ApprovalRequestsModule } from './approval-requests/approval-requests.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ConsumptionModule } from './consumption/consumption.module';
import { WaterBillsModule } from './water-bills/water-bills.module';
import { ZoneScoringModule } from './zone-scoring/zone-scoring.module';
import { AreaModule } from './area/area.module';
import { MetersModule } from './meters/meters.module';
import { TariffCategoryModule } from './tariff-category/tariff-category.module';
import { CustomerCategoriesModule } from './customer-categories/customer-categories.module';
import { TariffPolicyModule } from './tariff-policy/tariff-policy.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRoot(getDatabaseConfig()),
    UsersModule,
    RolesModule,
    AdminsModule,
    wasasModule,
    ZonesModule,
    WardsModule,
    ApprovalRequestsModule,
    AuditLogsModule,
    NotificationsModule,
    ConsumptionModule,
    WaterBillsModule,
    ZoneScoringModule,
    AreaModule,
    MetersModule,
    TariffCategoryModule,
    CustomerCategoriesModule,
    TariffPolicyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
