import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApprovalRequest } from './approval-request.entity';
import { CreateApprovalRequestDto } from './dto/create-approval-request.dto';
import { ReviewApprovalRequestDto } from './dto/review-approval-request.dto';
import { ApprovalStatusEnum } from 'src/common/enums/approval-status.enum';

@Injectable()
export class ApprovalRequestsService {
  constructor(
    @InjectRepository(ApprovalRequest)
    private readonly approvalRequestRepository: Repository<ApprovalRequest>,
  ) {}

  async findAll(): Promise<ApprovalRequest[]> {
    return this.approvalRequestRepository.find({
      relations: ['requester', 'reviewer', 'approvalStatus'],
    });
  }

  async findOne(id: number): Promise<ApprovalRequest> {
    const request = await this.approvalRequestRepository.findOne({
      where: { id },
      relations: ['requester', 'reviewer', 'approvalStatus'],
    });

    if (!request) {
      throw new NotFoundException(`Approval Request with ID ${id} not found`);
    }

    return request;
  }

  async findByModule(moduleName: string): Promise<ApprovalRequest[]> {
    return this.approvalRequestRepository.find({
      where: { moduleName },
      relations: ['requester', 'reviewer', 'approvalStatus'],
    });
  }

  async create(
    createApprovalRequestDto: CreateApprovalRequestDto,
  ): Promise<ApprovalRequest> {
    const request = this.approvalRequestRepository.create({
      ...createApprovalRequestDto,
      approvalStatus: ApprovalStatusEnum.PENDING,
    });

    return this.approvalRequestRepository.save(request);
  }

  async review(
    id: number,
    reviewApprovalRequestDto: ReviewApprovalRequestDto,
  ): Promise<ApprovalRequest> {
    const request = await this.approvalRequestRepository.findOne({
      where: { id },
      relations: ['approvalStatus'],
    });

    if (!request) {
      throw new NotFoundException(`Approval Request with ID ${id} not found`);
    }

    if (request.approvalStatus !== ApprovalStatusEnum.PENDING) {
      throw new BadRequestException('Only pending requests can be reviewed');
    }

    await this.approvalRequestRepository.update(id, {
      approvalStatus: reviewApprovalRequestDto.status,
      reviewedBy: reviewApprovalRequestDto.reviewedBy,
      comments: reviewApprovalRequestDto.comments,
      reviewedAt: new Date(),
    });

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const request = await this.approvalRequestRepository.findOneBy({ id });

    if (!request) {
      throw new NotFoundException(`Approval Request with ID ${id} not found`);
    }

    await this.approvalRequestRepository.delete(id);
  }
}
