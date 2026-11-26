import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { AreaService } from './area.service';
import { Area } from './area.entity';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';

@Controller('area')
export class AreaController {
  constructor(private readonly areaService: AreaService) {}

  @Get()
  async getAreas() {
    return this.areaService.findAll();
  }

  @Get(':id')
  async getAreaById(id: number) {
    return this.areaService.findById(id);
  }

  @Get('zone/:zoneId')
  async getAreasByZoneId(@Param('zoneId') zoneId: number) {
    return this.areaService.findByZoneId(zoneId);
  }

  @Post()
  async createArea(@Body() areaData: CreateAreaDto) {
    return this.areaService.create(areaData);
  }

  @Put(':id')
  async updateArea(@Param('id') id: number, @Body() areaData: UpdateAreaDto) {
    return this.areaService.update(id, areaData);
  }

  @Delete(':id')
  async deleteArea(@Param('id') id: number) {
    return this.areaService.delete(id);
  }
}
