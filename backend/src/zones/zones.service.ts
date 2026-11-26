import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Zone } from './zone.entity';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';

@Injectable()
export class ZonesService {
  constructor(
    @InjectRepository(Zone)
    private readonly zoneRepository: Repository<Zone>,
  ) {}

  async findAll(): Promise<Zone[]> {
    return this.zoneRepository.find({
      relations: ['wasa', 'areas'],
    });
  }

  async findOne(id: number): Promise<Zone> {
    const zone = await this.zoneRepository.findOne({
      where: { id },
      relations: ['wasa', 'areas'],
    });

    if (!zone) {
      throw new NotFoundException(`Zone with ID ${id} not found`);
    }

    return zone;
  }

  async findBywasa(wasaId: number): Promise<Zone[]> {
    return this.zoneRepository.find({
      where: { wasaId },
      relations: ['wasa', 'areas'],
    });
  }

  async findByTariffCategory(tariffCategory: string): Promise<Zone[]> {
    return this.zoneRepository.find({
      relations: ['wasa', 'areas'],
    });
  }

  async create(createZoneDto: CreateZoneDto): Promise<Zone> {
    const zone = this.zoneRepository.create(createZoneDto);
    return this.zoneRepository.save(zone);
  }

  async update(id: number, updateZoneDto: UpdateZoneDto): Promise<Zone> {
    const zone = await this.zoneRepository.findOneBy({ id });

    if (!zone) {
      throw new NotFoundException(`Zone with ID ${id} not found`);
    }

    await this.zoneRepository.update(id, updateZoneDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const zone = await this.zoneRepository.findOneBy({ id });

    if (!zone) {
      throw new NotFoundException(`Zone with ID ${id} not found`);
    }

    await this.zoneRepository.delete(id);
  }
}
