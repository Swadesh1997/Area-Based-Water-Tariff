import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTariffCategorySettingsDto {
  @ApiProperty({ description: 'Title of the tariff category settings' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Description of the tariff category settings' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Production Cost, P (BDT/1000L)' })
  @IsNumber()
  @IsNotEmpty()
  productionCost: number;

  @ApiProperty({ description: 'A (BDT/1000L)' })
  @IsNumber()
  @IsNotEmpty()
  baseRate: number;

  @ApiProperty({ description: 'Current Supply Tariff (BDT/1000 L)' })
  @IsNumber()
  @IsNotEmpty()
  currentTariff: number;

  @ApiProperty({ description: 'Current Tubewell Supply Tariff (BDT/1000 L)' })
  @IsNumber()
  @IsNotEmpty()
  currentTubewellTariff: number;

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
