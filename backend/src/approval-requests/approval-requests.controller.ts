import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApprovalRequestsService } from './approval-requests.service';
import { CreateApprovalRequestDto } from './dto/create-approval-request.dto';
import { ReviewApprovalRequestDto } from './dto/review-approval-request.dto';
import { ApprovalRequest } from './approval-request.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('approval-requests')
@Controller('approval-requests')
export class ApprovalRequestsController {
  constructor(
    private readonly approvalRequestsService: ApprovalRequestsService,
  ) {}

  @Get()
  async findAll(
    @Query('moduleName') moduleName?: string,
    @Query('statusId') statusId?: string,
  ): Promise<ApprovalRequest[]> {
    if (moduleName) {
      return this.approvalRequestsService.findByModule(moduleName);
    }
    return this.approvalRequestsService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApprovalRequest> {
    return this.approvalRequestsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createApprovalRequestDto: CreateApprovalRequestDto,
  ): Promise<ApprovalRequest> {
    return this.approvalRequestsService.create(createApprovalRequestDto);
  }

  @Put(':id/review')
  @HttpCode(HttpStatus.OK)
  async review(
    @Param('id', ParseIntPipe) id: number,
    @Body() reviewApprovalRequestDto: ReviewApprovalRequestDto,
  ): Promise<ApprovalRequest> {
    return this.approvalRequestsService.review(id, reviewApprovalRequestDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.approvalRequestsService.remove(id);
  }
}
