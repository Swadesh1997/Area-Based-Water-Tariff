import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { CustomerCategory } from '../../common/enums/customer-category.enum';

export class UserCustomerCategoryDto {
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
