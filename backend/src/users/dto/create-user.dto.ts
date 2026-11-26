import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
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
import { Meter } from 'src/meters/meter.entity';
import { CreateMeterDto } from 'src/meters/dto/create-meter.dto';
import { UserCustomerCategoryDto } from './user-customer-category.dto';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Name of the user',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    example: '123 Main Street, Dhaka',
    description: 'Address of the user',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  address: string;

  @ApiProperty({
    example: 12.5,
    description: 'Land size in decimal',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  landSizeDecimal: number;

  @ApiProperty({
    example: 3,
    description: 'Number of stories',
  })
  @IsNumber()
  @IsNotEmpty()
  numberOfStories: number;

  @ApiProperty({
    example: 12,
    description: 'Number of flats',
  })
  @IsNumber()
  @IsNotEmpty()
  numberOfFlats: number;

  @ApiProperty({
    type: () => UserCustomerCategoryDto,
    isArray: true,
    description: 'Customer categories and ratios',
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => UserCustomerCategoryDto)
  customerCategories: UserCustomerCategoryDto[];

  @ApiProperty({
    example: 1001,
    description: 'Inspection code',
  })
  @IsNumber()
  @IsNotEmpty()
  inspCode: number;

  @ApiProperty({
    example: 1,
    description: 'Area ID',
    required: true,
  })
  @IsNumber()
  areaId: number;

  @ApiProperty({
    example: AccountType.GENERAL,
    enum: AccountType,
    description: 'Type of account',
  })
  @IsEnum(AccountType)
  @IsNotEmpty()
  accountType: AccountType;

  @ApiProperty({
    example: WaterStatus.METERED,
    enum: WaterStatus,
    description: 'Water connection status',
  })
  @IsEnum(WaterStatus)
  @IsNotEmpty()
  waterStatus: WaterStatus;

  @ApiProperty({
    example: SewerStatus.CONNECTED,
    enum: SewerStatus,
    description: 'Sewer connection status',
  })
  @IsEnum(SewerStatus)
  @IsNotEmpty()
  sewerStatus: SewerStatus;

  @ApiProperty({
    type: () => CreateMeterDto,
    description: 'Meter details',
  })
  @IsOptional()
  meter?: CreateMeterDto;
}
