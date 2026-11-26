import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class UpdateTariffThresholdSlabDto {
  @ApiPropertyOptional({
    example: 0,
    description: 'Lower limit of the slab (liters)',
  })
  @IsOptional()
  @IsNumber()
  lowerLimit?: number;

  @ApiPropertyOptional({
    example: 10000,
    description: 'Upper limit of the slab (liters)',
  })
  @IsOptional()
  @IsNumber()
  upperLimit?: number | null;

  @ApiPropertyOptional({
    example: 25.0,
    description: 'Rate per 1000 liters',
  })
  @IsOptional()
  @IsNumber()
  rate?: number;

  @ApiPropertyOptional({
    example: 20.0,
    description: 'Tubewell rate per 1000 liters',
  })
  @IsOptional()
  @IsNumber()
  tubewellRate?: number | null;

  @ApiPropertyOptional({
    example: 5.0,
    description: 'Production rate per 1000 liters',
  })
  @IsOptional()
  @IsNumber()
  productionRate?: number | null;

  @ApiPropertyOptional({
    example: 1,
    description: 'Sort order for display/calculation',
  })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the slab is active',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
