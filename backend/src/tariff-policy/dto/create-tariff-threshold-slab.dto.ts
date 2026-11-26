import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class CreateTariffThresholdSlabDto {
  @ApiProperty({
    example: 0,
    description: 'Lower limit of the slab (liters)',
  })
  @IsNumber()
  lowerLimit: number;

  @ApiProperty({
    example: 10000,
    description: 'Upper limit of the slab (liters)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  upperLimit?: number | null;

  @ApiProperty({
    example: 25.0,
    description: 'Rate per 1000 liters',
  })
  @IsNumber()
  rate: number;

  @ApiProperty({
    example: 20.0,
    description: 'Tubewell rate per 1000 liters',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  tubewellRate?: number | null;

  @ApiProperty({
    example: 5.0,
    description: 'Production rate per 1000 liters',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  productionRate?: number | null;

  @ApiProperty({
    example: 1,
    description: 'Sort order for display/calculation',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiProperty({
    example: true,
    description: 'Whether the slab is active',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
