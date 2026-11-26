import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { wasa } from './wasa.entity';
import { CreatewasaDto } from './dto/create-wasa.dto';
import { UpdatewasaDto } from './dto/update-wasa.dto';

@Injectable()
export class wasasService {
  constructor(
    @InjectRepository(wasa)
    private readonly wasaRepository: Repository<wasa>,
  ) {}

  async findAll(): Promise<wasa[]> {
    return this.wasaRepository.find({
      relations: ['zones'],
    });
  }

  async findOne(id: number): Promise<wasa> {
    const wasa = await this.wasaRepository.findOne({
      where: { id },
      relations: ['zones'],
    });

    if (!wasa) {
      throw new NotFoundException(`wasa with ID ${id} not found`);
    }

    return wasa;
  }

  async findByCode(code: string): Promise<wasa | null> {
    return this.wasaRepository.findOne({
      where: { code },
    });
  }

  async create(createwasaDto: CreatewasaDto): Promise<wasa> {
    const existingwasa = await this.findByCode(createwasaDto.code);

    if (existingwasa) {
      throw new ConflictException('wasa code already exists');
    }

    const wasa = this.wasaRepository.create(createwasaDto);
    return this.wasaRepository.save(wasa);
  }

  async update(id: number, updatewasaDto: UpdatewasaDto): Promise<wasa> {
    const wasa = await this.wasaRepository.findOneBy({
      id,
    });

    if (!wasa) {
      throw new NotFoundException(`wasa with ID ${id} not found`);
    }

    if (updatewasaDto.code && updatewasaDto.code !== wasa.code) {
      const existingwasa = await this.findByCode(updatewasaDto.code);
      if (existingwasa) {
        throw new ConflictException('wasa code already exists');
      }
    }

    await this.wasaRepository.update(id, updatewasaDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const wasa = await this.wasaRepository.findOneBy({
      id,
    });

    if (!wasa) {
      throw new NotFoundException(`wasa with ID ${id} not found`);
    }

    await this.wasaRepository.delete(id);
  }
}
