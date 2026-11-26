import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TariffThresholdSlab } from './tariff-threshold-slab.entity';
import { CreateTariffThresholdSlabDto } from './dto/create-tariff-threshold-slab.dto';
import { UpdateTariffThresholdSlabDto } from './dto/update-tariff-threshold-slab.dto';

@Injectable()
export class TariffThresholdSlabService {
  constructor(
    @InjectRepository(TariffThresholdSlab)
    private readonly slabRepository: Repository<TariffThresholdSlab>,
  ) {}

  async findAll(isActive?: boolean): Promise<TariffThresholdSlab[]> {
    const where =
      isActive === undefined ? {} : { isActive };

    return this.slabRepository.find({
      where,
      order: { sortOrder: 'ASC', lowerLimit: 'ASC' },
    });
  }

  async findOne(id: number): Promise<TariffThresholdSlab> {
    const slab = await this.slabRepository.findOneBy({ id });
    if (!slab) {
      throw new NotFoundException(
        `Tariff threshold slab with ID ${id} not found`,
      );
    }
    return slab;
  }

  async create(
    createDto: CreateTariffThresholdSlabDto,
  ): Promise<TariffThresholdSlab> {
    const slab = this.slabRepository.create(createDto);
    return this.slabRepository.save(slab);
  }

  async update(
    id: number,
    updateDto: UpdateTariffThresholdSlabDto,
  ): Promise<TariffThresholdSlab> {
    const slab = await this.slabRepository.findOneBy({ id });
    if (!slab) {
      throw new NotFoundException(
        `Tariff threshold slab with ID ${id} not found`,
      );
    }
    await this.slabRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const slab = await this.slabRepository.findOneBy({ id });
    if (!slab) {
      throw new NotFoundException(
        `Tariff threshold slab with ID ${id} not found`,
      );
    }
    await this.slabRepository.delete(id);
  }
}
