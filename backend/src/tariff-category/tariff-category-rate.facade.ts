import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CustomerCategory } from 'src/common/enums/customer-category.enum';
import { TariffCategory } from './tariff-category.entity';
import { TariffCategorySettings } from './tariff-category-settings.entity';
import { CreateTariffCategoryDto } from './dto/create-tariff-category.dto';
import { UpdateTariffCategoryDto } from './dto/update-tariff-category.dto';
import { CreateTariffCategorySettingsDto } from './dto/create-tariff-category-settings.dto';
import { UpdateTariffCategorySettingsDto } from './dto/update-tariff-category-settings.dto';

type TariffCategoryContext = {
  settings: TariffCategorySettings;
  categories: TariffCategory[];
  baseCategory: TariffCategory | null;
  activeCategories: TariffCategory[];
};

@Injectable()
export class TariffCategoryRateFacade {
  constructor(
    @InjectRepository(TariffCategory)
    private readonly categoryRepository: Repository<TariffCategory>,
    @InjectRepository(TariffCategorySettings)
    private readonly settingsRepository: Repository<TariffCategorySettings>,
  ) {}

  async createCategory(
    createDto: CreateTariffCategoryDto,
  ): Promise<TariffCategory> {
    return this.categoryRepository.manager.transaction(async (manager) => {
      const { categoryRepo } = this.resolveRepos(manager);
      const { settings, categories, baseCategory } = await this.buildContext(
        createDto.settingsId,
        manager,
      );

      const shouldBeBase =
        categories.length === 0 || createDto.isBaseCategory === true;

      const normalizedRanges = this.normalizeRanges(
        createDto.rangeDescription,
        createDto.lowerRange,
        createDto.upperRange,
      );
      const category = categoryRepo.create();
      Object.assign(category, createDto, normalizedRanges, {
        isBaseCategory: shouldBeBase,
      });

      const effectiveBaseCategory = shouldBeBase ? category : baseCategory;
      const { tariffRate, tubewellTariff } = this.getTariffRates(
        category,
        settings,
        effectiveBaseCategory,
      );
      category.tariffRate = tariffRate;
      category.tubewellTariff = tubewellTariff;

      const saved = await categoryRepo.save(category);
      const baseCategoryId = shouldBeBase ? saved.id : baseCategory?.id;
      if (baseCategoryId) {
        await this.applyBaseCategory(createDto.settingsId, baseCategoryId, manager);
      }
      await this.recalculateRatesForSettings(
        createDto.settingsId,
        baseCategoryId,
        manager,
      );

      const refreshed = await categoryRepo.findOneBy({ id: saved.id });
      if (!refreshed) {
        throw new NotFoundException(
          `Tariff category with ID ${saved.id} not found`,
        );
      }
      return refreshed;
    });
  }

  async updateCategory(
    id: number,
    updateDto: UpdateTariffCategoryDto,
  ): Promise<TariffCategory> {
    return this.categoryRepository.manager.transaction(async (manager) => {
      const { categoryRepo } = this.resolveRepos(manager);
      const category = await categoryRepo.findOneBy({ id });

      if (!category) {
        throw new NotFoundException(
          `Tariff category with ID ${id} not found`,
        );
      }

      const settingsId = updateDto.settingsId ?? category.settingsId;
      const { settings, baseCategory } = await this.buildContext(
        settingsId,
        manager,
      );

      const isBasePromoted = updateDto.isBaseCategory === true;
      if (updateDto.isBaseCategory === false && category.isBaseCategory) {
        throw new BadRequestException('Base category cannot be unset');
      }
      const baseSlNoChanged =
        category.isBaseCategory &&
        updateDto.slNo !== undefined &&
        updateDto.slNo !== category.slNo;

      const { isBaseCategory, ...updateRest } = updateDto;
      Object.assign(category, updateRest);

      const normalizedRanges = this.normalizeRanges(
        category.rangeDescription,
        category.lowerRange,
        category.upperRange,
      );
      Object.assign(category, normalizedRanges);
      if (isBasePromoted) {
        category.isBaseCategory = true;
      }
      if (updateDto.settingsId !== undefined) {
        category.settingsId = updateDto.settingsId;
      }

      const saved = await categoryRepo.save(category);

      if (isBasePromoted) {
        await this.applyBaseCategory(settingsId, saved.id, manager);
      }

      if (isBasePromoted || baseSlNoChanged) {
        await this.recalculateRatesForSettings(settingsId, saved.id, manager);
        const refreshed = await categoryRepo.findOneBy({ id: saved.id });
        if (!refreshed) {
          throw new NotFoundException(
            `Tariff category with ID ${saved.id} not found`,
          );
        }
        return refreshed;
      }

      const effectiveBaseCategory = saved.isBaseCategory
        ? saved
        : baseCategory;
      const { tariffRate, tubewellTariff } = this.getTariffRates(
        saved,
        settings,
        effectiveBaseCategory,
      );
      saved.tariffRate = tariffRate;
      saved.tubewellTariff = tubewellTariff;
      return categoryRepo.save(saved);
    });
  }

  async createSettings(
    createDto: CreateTariffCategorySettingsDto,
  ): Promise<TariffCategorySettings> {
    const existingCount = await this.settingsRepository.count();
    const settings = this.settingsRepository.create({
      ...createDto,
      isActive: existingCount === 0,
    });
    return this.settingsRepository.save(settings);
  }

  async updateSettings(
    id: number,
    updateDto: UpdateTariffCategorySettingsDto,
  ): Promise<TariffCategorySettings> {
    const settings = await this.settingsRepository.findOneBy({ id });

    if (!settings) {
      throw new NotFoundException(`Settings with ID ${id} not found`);
    }

    Object.assign(settings, updateDto);
    const saved = await this.settingsRepository.save(settings);
    await this.recalculateRatesForSettings(saved.id);
    return saved;
  }

  async buildContext(
    settingsId: number,
    manager?: EntityManager,
  ): Promise<TariffCategoryContext> {
    const { categoryRepo, settingsRepo } = this.resolveRepos(manager);

    const settings = await settingsRepo.findOneBy({ id: settingsId });
    if (!settings) {
      throw new NotFoundException(`Settings with ID ${settingsId} not found`);
    }

    const categories = await categoryRepo.find({
      where: { settingsId },
      order: { slNo: 'ASC' },
    });
    const baseCategory =
      categories.find((category) => category.isBaseCategory) || null;
    const activeCategories = categories.filter((category) => category.isActive);

    return { settings, categories, baseCategory, activeCategories };
  }

  setBaseCategory(
    categories: TariffCategory[],
    baseCategoryId: number,
  ): TariffCategory | null {
    let baseCategory: TariffCategory | null = null;

    for (const category of categories) {
      category.isBaseCategory = category.id === baseCategoryId;
      if (category.isBaseCategory) {
        baseCategory = category;
      }
    }

    return baseCategory;
  }

  async applyBaseCategory(
    settingsId: number,
    baseCategoryId: number,
    manager?: EntityManager,
  ): Promise<void> {
    const { categoryRepo } = this.resolveRepos(manager);
    await categoryRepo.update(
      { settingsId, isBaseCategory: true },
      { isBaseCategory: false },
    );
    await categoryRepo.update(
      { id: baseCategoryId },
      { isBaseCategory: true },
    );
  }

  getTariffRates(
    category: TariffCategory,
    settings: TariffCategorySettings,
    baseCategory: TariffCategory | null,
  ): { tariffRate: number; tubewellTariff: number } {
    const tariffRate = this.calculateTariffRate(
      category,
      settings,
      baseCategory,
    );
    const tubewellTariff = this.calculateTubewellTariff(category, settings);
    return { tariffRate, tubewellTariff };
  }

  calculateTariffRate(
    category: TariffCategory,
    settings: TariffCategorySettings,
    baseCategory: TariffCategory | null,
  ): number {
    const baseRate = settings.baseRate;
    if (category.isBaseCategory) {
      return baseRate;
    }

    if (!baseCategory) {
      return baseRate;
    }

    if (category.category === CustomerCategory.COMMERCIAL_INDUSTRIAL) {
      return (
        baseRate *
        (1 + this.normalizePercent(settings.commercialIncreasePercent))
      );
    }

    if (category.category === CustomerCategory.GOVERNMENT_COMMUNITY) {
      return (
        baseRate *
        (1 + this.normalizePercent(settings.governmentIncreasePercent))
      );
    }

    const step = Math.abs(category.slNo - baseCategory.slNo);

    if (category.slNo < baseCategory.slNo) {
      return (
        baseRate *
        (1 + this.normalizePercent(settings.aboveBaseIncreasePercent) * step)
      );
    }

    if (category.slNo > baseCategory.slNo) {
      return (
        baseRate *
        (1 - this.normalizePercent(settings.belowBaseDecreasePercent) * step)
      );
    }

    return baseRate;
  }

  calculateTubewellTariff(
    category: TariffCategory,
    settings: TariffCategorySettings,
  ): number {
    const ratio =
      category.category === CustomerCategory.COMMERCIAL_INDUSTRIAL
        ? settings.tubewellRatioCommercial
        : settings.tubewellRatioStandard;
    return category.tariffRate * ratio;
  }

  async recalculateRatesForSettings(
    settingsId: number,
    baseCategoryId?: number,
    manager?: EntityManager,
  ): Promise<void> {
    const { categoryRepo } = this.resolveRepos(manager);
    const { settings, categories } = await this.buildContext(
      settingsId,
      manager,
    );

    if (!categories.length) {
      return;
    }

    const baseCategory = baseCategoryId
      ? this.setBaseCategory(categories, baseCategoryId)
      : categories.find((category) => category.isBaseCategory) || null;

    if (!baseCategory) {
      return;
    }

    for (const category of categories) {
      const { tariffRate, tubewellTariff } = this.getTariffRates(
        category,
        settings,
        baseCategory,
      );
      category.tariffRate = tariffRate;
      category.tubewellTariff = tubewellTariff;
    }

    await categoryRepo.save(categories);
  }

  private resolveRepos(manager?: EntityManager): {
    categoryRepo: Repository<TariffCategory>;
    settingsRepo: Repository<TariffCategorySettings>;
  } {
    return {
      categoryRepo: manager
        ? manager.getRepository(TariffCategory)
        : this.categoryRepository,
      settingsRepo: manager
        ? manager.getRepository(TariffCategorySettings)
        : this.settingsRepository,
    };
  }

  private normalizeRanges(
    rangeDescription?: string,
    lowerRange?: number | null,
    upperRange?: number | null,
  ): {
    lowerRange?: number | null;
    upperRange?: number | null;
  } {
    if (!rangeDescription) {
      return {};
    }
    const hasRangeValues =
      lowerRange !== undefined &&
      lowerRange !== null &&
      upperRange !== undefined &&
      upperRange !== null;
    if (!hasRangeValues) {
      return { lowerRange: null, upperRange: null };
    }
    return { lowerRange, upperRange };
  }

  private normalizePercent(value: number): number {
    return value > 1 ? value / 100 : value;
  }
}
