import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { CustomerCategory } from '../../common/enums/customer-category.enum';

export class UpdateCustomerCategoryDto {
  @ApiProperty({
    example: CustomerCategory.DOMESTIC,
    enum: CustomerCategory,
    description: 'Customer category',
    required: false,
  })
  @IsEnum(CustomerCategory)
  @IsOptional()
  customerCategory?: CustomerCategory;

  @ApiProperty({
    example: 1.0,
    description: 'Category ratio',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  ratio?: number;
}
