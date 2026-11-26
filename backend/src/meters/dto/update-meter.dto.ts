import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MeterStatus } from '../../users/user.entity';

export class UpdateMeterDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'User account UUID',
    required: false,
  })
  @IsString()
  @IsOptional()
  account?: string;

  @ApiProperty({
    example: 123456,
    description: 'Meter number',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  meterNo?: number;

  @ApiProperty({
    example: MeterStatus.FUNCTIONAL,
    enum: MeterStatus,
    description: 'Meter status',
    required: false,
  })
  @IsEnum(MeterStatus)
  @IsOptional()
  meterStatus?: MeterStatus;

  @ApiProperty({
    example: '15mm',
    description: 'Size or diameter of the meter',
    maxLength: 255,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  sizeOfDia?: string;

  @ApiProperty({
    example: '2024-01-15',
    description: 'Meter installation date',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  meterInstallationDate?: Date;
}
