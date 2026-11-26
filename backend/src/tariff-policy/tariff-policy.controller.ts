import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TariffPolicyService } from './tariff-policy.service';
import { CreateTariffPolicyDto } from './dto/create-tariff-policy.dto';
import { UpdateTariffPolicyDto } from './dto/update-tariff-policy.dto';
import { TariffPolicy } from './tariff-policy.entity';

@ApiTags('tariff-policy')
@Controller('tariff-policy')
export class TariffPolicyController {
  constructor(private readonly tariffPolicyService: TariffPolicyService) {}

  @Get()
  @ApiOperation({ summary: 'Get tariff policies' })
  @ApiResponse({
    status: 200,
    description: 'Tariff policies retrieved successfully',
  })
  async findAll(): Promise<TariffPolicy[]> {
    return this.tariffPolicyService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active tariff policy' })
  @ApiResponse({
    status: 200,
    description: 'Active tariff policy retrieved successfully',
  })
  async findActive(): Promise<TariffPolicy> {
    return this.tariffPolicyService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tariff policy by ID' })
  @ApiParam({ name: 'id', description: 'Tariff policy ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Tariff policy retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Tariff policy not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<TariffPolicy> {
    return this.tariffPolicyService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create tariff policy' })
  @ApiBody({ type: CreateTariffPolicyDto })
  @ApiResponse({
    status: 201,
    description: 'Tariff policy created successfully',
  })
  async create(@Body() createDto: CreateTariffPolicyDto): Promise<TariffPolicy> {
    return this.tariffPolicyService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update tariff policy' })
  @ApiParam({ name: 'id', description: 'Tariff policy ID', type: Number })
  @ApiBody({ type: UpdateTariffPolicyDto })
  @ApiResponse({
    status: 200,
    description: 'Tariff policy updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Tariff policy not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTariffPolicyDto,
  ): Promise<TariffPolicy> {
    return this.tariffPolicyService.update(id, updateDto);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate tariff policy' })
  @ApiParam({ name: 'id', description: 'Tariff policy ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Tariff policy activated successfully',
  })
  @ApiResponse({ status: 404, description: 'Tariff policy not found' })
  async activate(@Param('id', ParseIntPipe) id: number): Promise<TariffPolicy> {
    return this.tariffPolicyService.activate(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete tariff policy' })
  @ApiParam({ name: 'id', description: 'Tariff policy ID', type: Number })
  @ApiResponse({
    status: 204,
    description: 'Tariff policy deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Tariff policy not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.tariffPolicyService.remove(id);
  }
}
