import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TariffCategorySettings } from './tariff-category-settings.entity';
import { CreateTariffCategorySettingsDto } from './dto/create-tariff-category-settings.dto';
import { UpdateTariffCategorySettingsDto } from './dto/update-tariff-category-settings.dto';
import { TariffCategoryRateFacade } from './tariff-category-rate.facade';

@Injectable()
export class TariffCategorySettingsService {
  constructor(
    @InjectRepository(TariffCategorySettings)
    private readonly settingsRepository: Repository<TariffCategorySettings>,
    private readonly rateFacade: TariffCategoryRateFacade,
  ) {}

  async findAll(): Promise<TariffCategorySettings[]> {
    return this.settingsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findActive(): Promise<TariffCategorySettings | null> {
    return this.settingsRepository.findOne({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<TariffCategorySettings> {
    const settings = await this.settingsRepository.findOne({
      where: { id },
    });

    if (!settings) {
      throw new NotFoundException(`Settings with ID ${id} not found`);
    }

    return settings;
  }

  async create(
    createDto: CreateTariffCategorySettingsDto,
  ): Promise<TariffCategorySettings> {
    return this.rateFacade.createSettings(createDto);
  }

  async update(
    id: number,
    updateDto: UpdateTariffCategorySettingsDto,
  ): Promise<TariffCategorySettings> {
    return this.rateFacade.updateSettings(id, updateDto);
  }

  async remove(id: number): Promise<void> {
    const settings = await this.settingsRepository.findOneBy({ id });

    if (!settings) {
      throw new NotFoundException(`Settings with ID ${id} not found`);
    }

    await this.settingsRepository.delete(id);
  }

  async activate(id: number): Promise<TariffCategorySettings> {
    return this.settingsRepository.manager.transaction(async (manager) => {
      const repository = manager.getRepository(TariffCategorySettings);
      const target = await repository.findOneBy({ id });

      if (!target) {
        throw new NotFoundException(`Settings with ID ${id} not found`);
      }

      await repository.update({ isActive: true }, { isActive: false });
      await repository.update({ id }, { isActive: true });

      const updated = await repository.findOneBy({ id });
      if (!updated) {
        throw new NotFoundException(`Settings with ID ${id} not found`);
      }
      return updated;
    });
  }
}
