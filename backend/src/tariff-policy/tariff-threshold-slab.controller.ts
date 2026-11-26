import {
  BadRequestException,
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
import { TariffThresholdSlab } from './tariff-threshold-slab.entity';
import { TariffThresholdSlabService } from './tariff-threshold-slab.service';
import { CreateTariffThresholdSlabDto } from './dto/create-tariff-threshold-slab.dto';
import { UpdateTariffThresholdSlabDto } from './dto/update-tariff-threshold-slab.dto';

@ApiTags('tariff-threshold-slabs')
@Controller('tariff-threshold-slabs')
export class TariffThresholdSlabController {
  constructor(
    private readonly tariffThresholdSlabService: TariffThresholdSlabService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get tariff threshold slabs' })
  @ApiQuery({
    name: 'isActive',
    required: false,
    description: 'Filter by active status (true/false)',
  })
  @ApiResponse({
    status: 200,
    description: 'Tariff threshold slabs retrieved successfully',
  })
  async findAll(
    @Query('isActive') isActive?: string,
  ): Promise<TariffThresholdSlab[]> {
    const parsedIsActive = this.parseOptionalBoolean(isActive);
    return this.tariffThresholdSlabService.findAll(parsedIsActive);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tariff threshold slab by ID' })
  @ApiParam({ name: 'id', description: 'Slab ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Tariff threshold slab retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Tariff threshold slab not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TariffThresholdSlab> {
    return this.tariffThresholdSlabService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create tariff threshold slab' })
  @ApiBody({ type: CreateTariffThresholdSlabDto })
  @ApiResponse({
    status: 201,
    description: 'Tariff threshold slab created successfully',
  })
  async create(
    @Body() createDto: CreateTariffThresholdSlabDto,
  ): Promise<TariffThresholdSlab> {
    return this.tariffThresholdSlabService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update tariff threshold slab' })
  @ApiParam({ name: 'id', description: 'Slab ID', type: Number })
  @ApiBody({ type: UpdateTariffThresholdSlabDto })
  @ApiResponse({
    status: 200,
    description: 'Tariff threshold slab updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Tariff threshold slab not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTariffThresholdSlabDto,
  ): Promise<TariffThresholdSlab> {
    return this.tariffThresholdSlabService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete tariff threshold slab' })
  @ApiParam({ name: 'id', description: 'Slab ID', type: Number })
  @ApiResponse({
    status: 204,
    description: 'Tariff threshold slab deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Tariff threshold slab not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.tariffThresholdSlabService.remove(id);
  }

  private parseOptionalBoolean(value?: string): boolean | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (value === 'true' || value === '1') {
      return true;
    }
    if (value === 'false' || value === '0') {
      return false;
    }

    throw new BadRequestException(
      'isActive must be a boolean (true/false)',
    );
  }
}
