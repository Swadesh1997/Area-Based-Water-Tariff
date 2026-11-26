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
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TariffCategoryService } from './tariff-category.service';
import { CreateTariffCategoryDto } from './dto/create-tariff-category.dto';
import { UpdateTariffCategoryDto } from './dto/update-tariff-category.dto';
import { TariffCategory } from './tariff-category.entity';

@ApiTags('tariff-category')
@Controller('tariff-category')
export class TariffCategoryController {
  constructor(private readonly tariffCategoryService: TariffCategoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get tariff categories' })
  @ApiQuery({
    name: 'settingsId',
    required: false,
    description: 'Filter by tariff category settings ID',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Tariff categories retrieved successfully',
  })
  async findAll(
    @Query('settingsId') settingsId?: string,
  ): Promise<TariffCategory[]> {
    const parsedSettingsId = settingsId ? parseInt(settingsId, 10) : undefined;
    return this.tariffCategoryService.findAll(parsedSettingsId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tariff category by ID' })
  @ApiParam({ name: 'id', description: 'Tariff category ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Tariff category retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Tariff category not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tariffCategoryService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create tariff category' })
  @ApiBody({ type: CreateTariffCategoryDto })
  @ApiResponse({
    status: 201,
    description: 'Tariff category created successfully',
  })
  async create(@Body() createDto: CreateTariffCategoryDto) {
    return this.tariffCategoryService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update tariff category' })
  @ApiParam({ name: 'id', description: 'Tariff category ID', type: Number })
  @ApiBody({ type: UpdateTariffCategoryDto })
  @ApiResponse({
    status: 200,
    description: 'Tariff category updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Tariff category not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTariffCategoryDto,
  ) {
    return this.tariffCategoryService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete tariff category' })
  @ApiParam({ name: 'id', description: 'Tariff category ID', type: Number })
  @ApiResponse({
    status: 204,
    description: 'Tariff category deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Tariff category not found' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.tariffCategoryService.remove(id);
  }
}
