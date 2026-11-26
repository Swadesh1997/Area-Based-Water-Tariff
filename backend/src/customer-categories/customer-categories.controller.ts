import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CustomerCategoriesService } from './customer-categories.service';
import { CreateCustomerCategoryDto } from './dto/create-customer-category.dto';
import { UpdateCustomerCategoryDto } from './dto/update-customer-category.dto';
import { CustomerCategoryAssignment } from './customer-category.entity';

@ApiTags('customer-categories')
@Controller('customer-categories')
export class CustomerCategoriesController {
  constructor(
    private readonly customerCategoriesService: CustomerCategoriesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get customer categories' })
  @ApiQuery({
    name: 'account',
    required: false,
    description: 'Filter by user account UUID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Customer categories retrieved successfully',
  })
  async findAll(
    @Query('account') account?: string,
  ): Promise<CustomerCategoryAssignment[]> {
    return this.customerCategoriesService.findAll(account);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer category by ID' })
  @ApiParam({ name: 'id', description: 'Customer category ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Customer category retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Customer category not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.customerCategoriesService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create customer category' })
  @ApiBody({ type: CreateCustomerCategoryDto })
  @ApiResponse({
    status: 201,
    description: 'Customer category created successfully',
  })
  async create(@Body() createDto: CreateCustomerCategoryDto) {
    return this.customerCategoriesService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update customer category' })
  @ApiParam({ name: 'id', description: 'Customer category ID', type: Number })
  @ApiBody({ type: UpdateCustomerCategoryDto })
  @ApiResponse({
    status: 200,
    description: 'Customer category updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Customer category not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateCustomerCategoryDto,
  ) {
    return this.customerCategoriesService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete customer category' })
  @ApiParam({ name: 'id', description: 'Customer category ID', type: Number })
  @ApiResponse({
    status: 204,
    description: 'Customer category deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Customer category not found' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.customerCategoriesService.remove(id);
  }
}
