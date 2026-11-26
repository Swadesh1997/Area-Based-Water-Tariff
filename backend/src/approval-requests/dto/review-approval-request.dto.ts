import { IsNumber, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApprovalStatusEnum } from 'src/common/enums/approval-status.enum';

export class ReviewApprovalRequestDto {
  @IsNumber()
  @IsNotEmpty()
  reviewedBy: number;

  @IsString()
  @IsNotEmpty()
  status: ApprovalStatusEnum; // 'Approved' or 'Rejected'

  @IsString()
  @IsOptional()
  comments?: string;
}
