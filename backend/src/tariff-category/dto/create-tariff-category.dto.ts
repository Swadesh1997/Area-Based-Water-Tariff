import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CustomerCategory } from 'src/common/enums/customer-category.enum';

export class CreateTariffCategoryDto {
  @ApiProperty({ description: 'Serial number' })
  @IsNumber()
  @IsNotEmpty()
  slNo: number;

  @ApiProperty({ enum: CustomerCategory })
  @IsEnum(CustomerCategory)
  @IsNotEmpty()
  category: CustomerCategory;

  @ApiProperty({ description: 'Category name' })
  @IsString()
  @IsNotEmpty()
  name: string;

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

  @ApiProperty({ description: 'Tariff category settings ID' })
  @IsNumber()
  @IsNotEmpty()
  settingsId: number;
}
