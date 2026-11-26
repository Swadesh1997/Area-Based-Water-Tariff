import { IsString, IsNumber, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateZoneScoreParamDto {
  @ApiProperty({ example: 1, description: 'Area ID' })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  areaId: number;

  @ApiProperty({
    example: 1500.5,
    description: 'Land Home Rate in BDT per sqm',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  landHomeRate: number; // BDT per sqm

  @ApiProperty({ example: 10.5, description: 'Land Home Rate Percentage' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  landHomeRatePercentage: number;

  @ApiProperty({
    example: 12.75,
    description: 'Land Commercial Rate in BDT per sqm',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  landRate: number; // BDT per sqm

  @ApiProperty({
    example: 15.0,
    description: 'Land Commercial Rate Percentage',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  landRatePercentage: number;

  @ApiProperty({ example: 8.0, description: 'Land Tax Rate in BDT per sqm' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  landTaxRate: number; // BDT per sqm

  @ApiProperty({ example: 5.5, description: 'Land Tax Rate Percentage' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  landTaxRatePercentage: number;

  @ApiProperty({
    example: 20.0,
    description: 'Building Tax Rate for up to 120 sqm in BDT per sqm',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  buildingTaxRateUpto120sqm: number;

  @ApiProperty({
    example: 18.0,
    description: 'Building Tax Rate Percentage for up to 120 sqm',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  buildingTaxRateUpto120sqmPercentage: number;

  @ApiProperty({
    example: 25.0,
    description: 'Building Tax Rate for up to 200 sqm in BDT per sqm',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  buildingTaxRateUpto200sqm: number;

  @ApiProperty({
    example: 22.0,
    description: 'Building Tax Rate Percentage for up to 200 sqm',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  buildingTaxRateUpto200sqmPercentage: number;

  @ApiProperty({
    example: 30.0,
    description: 'Building Tax Rate for above 200 sqm in BDT per sqm',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  buildingTaxRateAbove200sqm: number;

  @ApiProperty({
    example: 28.0,
    description: 'Building Tax Rate Percentage for above 200 sqm',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  buildingTaxRateAbove200sqmPercentage: number;

  @ApiProperty({
    example: 35.0,
    description: 'High Income Group Connection Percentage',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  highIncomeGroupConnectionPercentage: number;

  @ApiProperty({ example: 2.345678, description: 'Geometric Mean Value' })
  @IsNumber({ maxDecimalPlaces: 6 })
  @IsPositive()
  @Type(() => Number)
  geoMean: number;
}
