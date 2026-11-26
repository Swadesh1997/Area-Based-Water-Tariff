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
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TariffCategorySettingsService } from './tariff-category-settings.service';
import { CreateTariffCategorySettingsDto } from './dto/create-tariff-category-settings.dto';
import { UpdateTariffCategorySettingsDto } from './dto/update-tariff-category-settings.dto';
import { TariffCategorySettings } from './tariff-category-settings.entity';

@ApiTags('tariff-category-settings')
@Controller('tariff-category-settings')
export class TariffCategorySettingsController {
  constructor(
    private readonly settingsService: TariffCategorySettingsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all tariff category settings' })
  @ApiResponse({
    status: 200,
    description: 'Tariff category settings retrieved successfully',
  })
  async findAll(): Promise<TariffCategorySettings[]> {
    return this.settingsService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active tariff category settings' })
  @ApiResponse({
    status: 200,
    description: 'Active tariff category settings retrieved successfully',
  })
  async findActive(): Promise<TariffCategorySettings | null> {
    return this.settingsService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tariff category settings by ID' })
  @ApiParam({ name: 'id', description: 'Settings ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Tariff category settings retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Settings not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TariffCategorySettings> {
    return this.settingsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create tariff category settings' })
  @ApiBody({ type: CreateTariffCategorySettingsDto })
  @ApiResponse({
    status: 201,
    description: 'Tariff category settings created successfully',
  })
  async create(
    @Body() createDto: CreateTariffCategorySettingsDto,
  ): Promise<TariffCategorySettings> {
    return this.settingsService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update tariff category settings' })
  @ApiParam({ name: 'id', description: 'Settings ID', type: Number })
  @ApiBody({ type: UpdateTariffCategorySettingsDto })
  @ApiResponse({
    status: 200,
    description: 'Tariff category settings updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Settings not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTariffCategorySettingsDto,
  ): Promise<TariffCategorySettings> {
    return this.settingsService.update(id, updateDto);
  }

  @Put(':id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate tariff category settings' })
  @ApiParam({ name: 'id', description: 'Settings ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Tariff category settings activated successfully',
  })
  @ApiResponse({ status: 404, description: 'Settings not found' })
  async activate(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TariffCategorySettings> {
    return this.settingsService.activate(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete tariff category settings' })
  @ApiParam({ name: 'id', description: 'Settings ID', type: Number })
  @ApiResponse({
    status: 204,
    description: 'Tariff category settings deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Settings not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.settingsService.remove(id);
  }
}
