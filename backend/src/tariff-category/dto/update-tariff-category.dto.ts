import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CustomerCategory } from 'src/common/enums/customer-category.enum';

export class UpdateTariffCategoryDto {
  @ApiPropertyOptional({ description: 'Serial number' })
  @IsOptional()
  @IsNumber()
  slNo?: number;

  @ApiPropertyOptional({ enum: CustomerCategory })
  @IsOptional()
  @IsEnum(CustomerCategory)
  category?: CustomerCategory;

  @ApiPropertyOptional({ description: 'Category name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Lower range (sqf)' })
  @IsOptional()
  @IsNumber()
  lowerRange?: number;

  @ApiPropertyOptional({ description: 'Upper range (sqf)' })
  @IsOptional()
  @IsNumber()
  upperRange?: number;

  @ApiPropertyOptional({ description: 'Range description (e.g., Tin shed)' })
  @IsOptional()
  @IsString()
  rangeDescription?: string;

  @ApiPropertyOptional({ description: 'Whether this is the base category' })
  @IsOptional()
  @IsBoolean()
  isBaseCategory?: boolean;

  @ApiPropertyOptional({ description: 'Whether this category is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Tariff category settings ID' })
  @IsOptional()
  @IsNumber()
  settingsId?: number;
}
