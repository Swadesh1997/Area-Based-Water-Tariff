import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  MaxLength,
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  AccountType,
  ActiveStatus,
  WaterStatus,
  SewerStatus,
} from '../user.entity';
import { UpdateMeterDto } from '../../meters/dto/update-meter.dto';
import { UserCustomerCategoryDto } from './user-customer-category.dto';
import { Type } from 'class-transformer';

export class UpdateUserDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Name of the user',
    maxLength: 255,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @ApiProperty({
    example: '123 Main Street, Dhaka',
    description: 'Address of the user',
    maxLength: 255,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  address?: string;

  @ApiProperty({
    example: 12.5,
    description: 'Land size in decimal',
    required: false,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  landSizeDecimal?: number;

  @ApiProperty({
    example: 3,
    description: 'Number of stories',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  numberOfStories?: number;

  @ApiProperty({
    example: 12,
    description: 'Number of flats',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  numberOfFlats?: number;

  @ApiProperty({
    type: () => UserCustomerCategoryDto,
    isArray: true,
    description: 'Customer categories and ratios',
    required: false,
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => UserCustomerCategoryDto)
  @IsOptional()
  customerCategories?: UserCustomerCategoryDto[];

  @ApiProperty({
    example: 1001,
    description: 'Inspection code',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  inspCode?: number;

  @ApiProperty({
    example: 1,
    description: 'Area ID',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  areaId?: number;

  @ApiProperty({
    example: AccountType.GENERAL,
    enum: AccountType,
    description: 'Type of account',
    required: false,
  })
  @IsEnum(AccountType)
  @IsOptional()
  accountType?: AccountType;

  @ApiProperty({
    example: ActiveStatus.ACTIVE,
    enum: ActiveStatus,
    description: 'Active status',
    required: false,
  })
  @IsEnum(ActiveStatus)
  @IsOptional()
  activeStatus?: ActiveStatus;

  @ApiProperty({
    example: WaterStatus.METERED,
    enum: WaterStatus,
    description: 'Water connection status',
    required: false,
  })
  @IsEnum(WaterStatus)
  @IsOptional()
  waterStatus?: WaterStatus;

  @ApiProperty({
    example: SewerStatus.CONNECTED,
    enum: SewerStatus,
    description: 'Sewer connection status',
    required: false,
  })
  @IsEnum(SewerStatus)
  @IsOptional()
  sewerStatus?: SewerStatus;

  @ApiProperty({
    type: () => UpdateMeterDto,
    description: 'Meter details to update',
    required: false,
  })
  @IsOptional()
  meter?: UpdateMeterDto;
}
