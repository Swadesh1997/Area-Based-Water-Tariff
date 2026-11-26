import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateTariffCategorySettingsDto {
  @ApiPropertyOptional({ description: 'Title of the tariff category settings' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Description of the tariff category settings' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Production Cost, P (BDT/1000L)' })
  @IsOptional()
  @IsNumber()
  productionCost?: number;

  @ApiPropertyOptional({ description: 'A (BDT/1000L)' })
  @IsOptional()
  @IsNumber()
  baseRate?: number;

  @ApiPropertyOptional({ description: 'Current Supply Tariff (BDT/1000 L)' })
  @IsOptional()
  @IsNumber()
  currentTariff?: number;

  @ApiPropertyOptional({
    description: 'Current Tubewell Supply Tariff (BDT/1000 L)',
  })
  @IsOptional()
  @IsNumber()
  currentTubewellTariff?: number;

  @ApiPropertyOptional({ description: 'Standard tubewell ratio (40%)' })
  @IsOptional()
  @IsNumber()
  tubewellRatioStandard?: number;

  @ApiPropertyOptional({ description: 'Commercial tubewell ratio (60%)' })
  @IsOptional()
  @IsNumber()
  tubewellRatioCommercial?: number;

  @ApiPropertyOptional({
    description: 'Increase % for categories above base',
  })
  @IsOptional()
  @IsNumber()
  aboveBaseIncreasePercent?: number;

  @ApiPropertyOptional({
    description: 'Decrease % for categories below base',
  })
  @IsOptional()
  @IsNumber()
  belowBaseDecreasePercent?: number;

  @ApiPropertyOptional({ description: 'Fixed increase for commercial (100%)' })
  @IsOptional()
  @IsNumber()
  commercialIncreasePercent?: number;

  @ApiPropertyOptional({ description: 'Fixed increase for government (0%)' })
  @IsOptional()
  @IsNumber()
  governmentIncreasePercent?: number;

}
