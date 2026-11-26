import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprovalRequestsController } from './approval-requests.controller';
import { ApprovalRequestsService } from './approval-requests.service';
import { ApprovalRequest } from './approval-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ApprovalRequest])],
  controllers: [ApprovalRequestsController],
  providers: [ApprovalRequestsService],
  exports: [ApprovalRequestsService],
})
export class ApprovalRequestsModule {}
