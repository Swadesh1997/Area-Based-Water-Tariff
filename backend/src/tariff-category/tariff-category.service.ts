import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TariffCategory } from './tariff-category.entity';
import { CreateTariffCategoryDto } from './dto/create-tariff-category.dto';
import { UpdateTariffCategoryDto } from './dto/update-tariff-category.dto';
import { TariffCategoryRateFacade } from './tariff-category-rate.facade';

@Injectable()
export class TariffCategoryService {
  constructor(
    @InjectRepository(TariffCategory)
    private readonly tariffCategoryRepository: Repository<TariffCategory>,
    private readonly rateFacade: TariffCategoryRateFacade,
  ) {}

  async findAll(settingsId?: number): Promise<TariffCategory[]> {
    const where = settingsId ? { settingsId } : {};
    return this.tariffCategoryRepository.find({
      where,
      order: { slNo: 'ASC' },
    });
  }

  async findOne(id: number): Promise<TariffCategory> {
    const category = await this.tariffCategoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Tariff category with ID ${id} not found`);
    }

    return category;
  }

  async create(createDto: CreateTariffCategoryDto): Promise<TariffCategory> {
    return this.rateFacade.createCategory(createDto);
  }

  async update(
    id: number,
    updateDto: UpdateTariffCategoryDto,
  ): Promise<TariffCategory> {
    return this.rateFacade.updateCategory(id, updateDto);
  }

  async remove(id: number): Promise<void> {
    const category = await this.tariffCategoryRepository.findOneBy({ id });
    if (!category) {
      throw new NotFoundException(`Tariff category with ID ${id} not found`);
    }
    await this.tariffCategoryRepository.delete(id);
  }

}
