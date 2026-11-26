import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateWaterBillDto {
  @ApiPropertyOptional({ example: 'Paid', description: 'Bill payment status' })
  @IsString()
  @IsOptional()
  status?: string;
}
