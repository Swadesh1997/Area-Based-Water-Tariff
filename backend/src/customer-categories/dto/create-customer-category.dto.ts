import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { CustomerCategory } from '../../common/enums/customer-category.enum';

export class CreateCustomerCategoryDto {
  @ApiProperty({
    example: 'f0a4b2c1-6f0f-4c9e-9b0c-5a3dcd9a1c11',
    description: 'User account UUID',
  })
  @IsString()
  @IsNotEmpty()
  account: string;

  @ApiProperty({
    example: CustomerCategory.DOMESTIC,
    enum: CustomerCategory,
    description: 'Customer category',
  })
  @IsEnum(CustomerCategory)
  @IsNotEmpty()
  customerCategory: CustomerCategory;

  @ApiProperty({
    example: 1.0,
    description: 'Category ratio',
  })
  @IsNumber()
  @IsNotEmpty()
  ratio: number;
}
