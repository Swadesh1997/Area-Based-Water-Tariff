import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { UserPassword } from './user-password.entity';
import { TariffCategory } from '../tariff-category/tariff-category.entity';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { UserFactory } from './user.factory';
import { MetersModule } from '../meters/meters.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserPassword, TariffCategory]),
    AuditLogsModule,
    MetersModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UserFactory],
  exports: [UsersService],
})
export class UsersModule {}
