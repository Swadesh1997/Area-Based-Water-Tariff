import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { MetersService } from './meters.service';
import { CreateMeterDto } from './dto/create-meter.dto';
import { UpdateMeterDto } from './dto/update-meter.dto';
import { Meter } from './meter.entity';

@ApiTags('meters')
@Controller('meters')
export class MetersController {
  constructor(private readonly metersService: MetersService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all meters',
    description:
      'Retrieve all meters, optionally filtered by account or status',
  })
  @ApiQuery({
    name: 'account',
    required: false,
    description: 'Filter by user account UUID',
    type: String,
  })
  @ApiQuery({
    name: 'meterStatus',
    required: false,
    description: 'Filter by meter status',
    enum: ['Functional', 'Non-Functional', 'Stolen', 'N/A'],
  })
  @ApiResponse({ status: 200, description: 'Meters retrieved successfully' })
  async findAll(
    @Query('account') account?: string,
    @Query('meterStatus') meterStatus?: string,
  ): Promise<Meter[]> {
    if (account) {
      return this.metersService.findByAccount(account);
    }
    if (meterStatus) {
      return this.metersService.findByMeterStatus(meterStatus);
    }
    return this.metersService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get meter by ID',
    description: 'Retrieve a specific meter by its ID',
  })
  @ApiParam({ name: 'id', description: 'Meter ID', type: Number })
  @ApiResponse({ status: 200, description: 'Meter retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Meter not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Meter> {
    return this.metersService.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create new meter',
    description: 'Create a new meter',
  })
  @ApiBody({ type: CreateMeterDto })
  @ApiResponse({
    status: 201,
    description: 'Meter created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or duplicate meter number',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createMeterDto: CreateMeterDto): Promise<Meter> {
    return this.metersService.create(createMeterDto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update meter',
    description: "Update an existing meter's information",
  })
  @ApiParam({ name: 'id', description: 'Meter ID', type: Number })
  @ApiBody({ type: UpdateMeterDto })
  @ApiResponse({ status: 200, description: 'Meter updated successfully' })
  @ApiResponse({ status: 404, description: 'Meter not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMeterDto: UpdateMeterDto,
  ): Promise<Meter> {
    return this.metersService.update(id, updateMeterDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete meter',
    description: 'Remove a meter from the system',
  })
  @ApiParam({ name: 'id', description: 'Meter ID', type: Number })
  @ApiResponse({ status: 204, description: 'Meter deleted successfully' })
  @ApiResponse({ status: 404, description: 'Meter not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.metersService.remove(id);
  }
}
