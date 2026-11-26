import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { wasasService } from './wasa.service';
import { CreatewasaDto } from './dto/create-wasa.dto';
import { UpdatewasaDto } from './dto/update-wasa.dto';
import { wasa } from './wasa.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('wasa')
@Controller('wasa')
export class wasasController {
  constructor(private readonly wasasService: wasasService) {}

  @Get()
  async findAll(): Promise<wasa[]> {
    return this.wasasService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<wasa> {
    return this.wasasService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createwasaDto: CreatewasaDto): Promise<wasa> {
    return this.wasasService.create(createwasaDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatewasaDto: UpdatewasaDto,
  ): Promise<wasa> {
    return this.wasasService.update(id, updatewasaDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.wasasService.remove(id);
  }
}
