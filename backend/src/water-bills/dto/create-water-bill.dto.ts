import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateWaterBillDto {
  @ApiProperty({
    example: 12,
    description: 'Approved consumption record ID for billing',
  })
  @IsNumber()
  @IsNotEmpty()
  consumptionId: number;
}
