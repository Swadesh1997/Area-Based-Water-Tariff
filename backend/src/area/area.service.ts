import { Injectable } from '@nestjs/common';
import { Area } from './area.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAreaDto } from './dto/create-area.dto';
import { Zone } from 'src/zones/zone.entity';
import { UpdateAreaDto } from './dto/update-area.dto';

@Injectable()
export class AreaService {
  @InjectRepository(Area)
  private readonly areaRepository: Repository<Area>;

  @InjectRepository(Zone)
  private readonly zoneRepository: Repository<Zone>;

  async findAll(): Promise<Area[]> {
    return this.areaRepository.find({
      relations: ['zone'],
    });
  }

  async findById(id: number): Promise<Area | null> {
    return this.areaRepository.findOne({
      where: { id },
      relations: ['zone'],
    });
  }

  async findByZoneId(zoneId: number): Promise<Area[]> {
    return this.areaRepository.find({
      where: { zone: { id: zoneId } },
      relations: ['zone'],
    });
  }

  async create(areaData: CreateAreaDto): Promise<Area> {
    const zone = await this.zoneRepository.findOneBy({ id: areaData.zoneId });
    if (!zone) {
      throw new Error(`Zone with ID ${areaData.zoneId} not found`);
    }
    const area = this.areaRepository.create({
      name: areaData.name,
      geojson: areaData.geojson,
      zone: zone,
    });
    return this.areaRepository.save(area);
  }

  async update(id: number, areaData: UpdateAreaDto): Promise<Area> {
    const area = await this.areaRepository.findOne({
      where: { id },
      relations: ['zone'],
    });

    if (!area) {
      throw new Error(`Area with ID ${id} not found`);
    }

    if (areaData.zoneId) {
      const zone = await this.zoneRepository.findOneBy({
        id: areaData.zoneId,
      });

      if (!zone) {
        throw new Error(`Zone with ID ${areaData.zoneId} not found`);
      }

      area.zone = zone;
    }

    if (areaData.name !== undefined) {
      area.name = areaData.name;
    }

    if (areaData.geojson !== undefined) {
      area.geojson = areaData.geojson;
    }

    return this.areaRepository.save(area);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.areaRepository.delete(id);
    return result.affected !== 0;
  }
}
