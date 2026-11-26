import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Consumption } from '../../consumption/consumption.entity';
import { CustomerCategoryAssignment } from '../../customer-categories/customer-category.entity';
import { TariffCategory } from '../../tariff-category/tariff-category.entity';
import { TariffPolicyService } from '../../tariff-policy/tariff-policy.service';
import { TariffPolicyType } from '../../common/enums/tariff-policy-type.enum';
import { CustomerCategory } from '../../common/enums/customer-category.enum';
import { TariffThresholdSlab } from '../../tariff-policy/tariff-threshold-slab.entity';
import { User } from '../../users/user.entity';
import { ZoneScoringService } from '../../zone-scoring/zone-scoring.service';
import {
  WaterBillCalculationContext,
  WaterBillRequest,
} from './billing-context';

const DEFAULT_TAX_RATE = 0.05;
const SQFT_PER_DECIMAL = 435.6;

const normalizeNumber = (
  value: number | string | null | undefined,
  fallback = 0,
): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const calculateFactoredAreaSqft = (user: User): number => {
  const landSizeDecimal = normalizeNumber(user.landSizeDecimal);
  const numberOfStories = normalizeNumber(user.numberOfStories, 1);
  const numberOfFlats = normalizeNumber(user.numberOfFlats, 1);

  if (landSizeDecimal <= 0) {
    return 0;
  }

  const landSqft = landSizeDecimal * SQFT_PER_DECIMAL;
  const totalSqft = landSqft * Math.max(numberOfStories, 1);
  return totalSqft / Math.max(numberOfFlats, 1);
};

const matchesRange = (category: TariffCategory, areaSqft: number): boolean => {
  const hasRange =
    category.lowerRange !== null && category.lowerRange !== undefined
      ? true
      : category.upperRange !== null && category.upperRange !== undefined;

  if (!hasRange) {
    return false;
  }

  const lowerOk =
    category.lowerRange === null || category.lowerRange === undefined
      ? true
      : areaSqft >= category.lowerRange;
  const upperOk =
    category.upperRange === null || category.upperRange === undefined
      ? true
      : areaSqft <= category.upperRange;

  return lowerOk && upperOk;
};

const findDomesticCategoryByArea = (
  categories: TariffCategory[],
  areaSqft: number,
): TariffCategory | null => {
  const ranged = categories.filter((category) => matchesRange(category, areaSqft));
  if (ranged.length > 0) {
    return ranged[0];
  }

  return (
    categories.find(
      (category) => category.lowerRange == null && category.upperRange == null,
    ) ?? null
  );
};

const resolveTariffCategory = async (
  account: string,
  user: User,
  customerCategoryRepository: Repository<CustomerCategoryAssignment>,
  tariffCategoryRepository: Repository<TariffCategory>,
): Promise<TariffCategory> => {
  const assignments = await customerCategoryRepository.find({
    where: { account },
    order: { ratio: 'DESC', id: 'ASC' },
  });

  if (assignments.length === 0) {
    throw new NotFoundException('No customer categories found for user');
  }

  for (const assignment of assignments) {
    const categories = await tariffCategoryRepository.find({
      where: {
        category: assignment.customerCategory,
        isActive: true,
      },
      order: { slNo: 'ASC', lowerRange: 'ASC' },
    });

    if (categories.length === 0) {
      continue;
    }

    if (assignment.customerCategory === CustomerCategory.DOMESTIC) {
      const areaSqft = calculateFactoredAreaSqft(user);
      const domesticCategory = findDomesticCategoryByArea(categories, areaSqft);
      if (domesticCategory) {
        return domesticCategory;
      }
      continue;
    }

    return categories[0];
  }

  throw new NotFoundException('No active tariff category found for user');
};

export abstract class BillDataHandler {
  private nextHandler?: BillDataHandler;

  setNext(handler: BillDataHandler): BillDataHandler {
    this.nextHandler = handler;
    return handler;
  }

  async handle(
    request: WaterBillRequest,
    context: Partial<WaterBillCalculationContext>,
  ): Promise<WaterBillCalculationContext> {
    const nextContext = await this.process(request, context);
    if (this.nextHandler) {
      return this.nextHandler.handle(request, nextContext);
    }
    return nextContext as WaterBillCalculationContext;
  }

  protected abstract process(
    request: WaterBillRequest,
    context: Partial<WaterBillCalculationContext>,
  ): Promise<Partial<WaterBillCalculationContext>>;
}

export class ActivePolicyHandler extends BillDataHandler {
  constructor(private readonly tariffPolicyService: TariffPolicyService) {
    super();
  }

  protected async process(
    _request: WaterBillRequest,
    context: Partial<WaterBillCalculationContext>,
  ): Promise<Partial<WaterBillCalculationContext>> {
    const tariffPolicy = await this.tariffPolicyService.findActive();
    return { ...context, tariffPolicy };
  }
}

export class CommonDataHandler extends BillDataHandler {
  constructor(
    private readonly consumptionRepository: Repository<Consumption>,
    private readonly userRepository: Repository<User>,
  ) {
    super();
  }

  protected async process(
    request: WaterBillRequest,
    context: Partial<WaterBillCalculationContext>,
  ): Promise<Partial<WaterBillCalculationContext>> {
    const consumption = await this.consumptionRepository.findOne({
      where: { id: request.consumptionId },
      relations: ['user'],
    });

    if (!consumption) {
      throw new NotFoundException(
        `Consumption record with ID ${request.consumptionId} not found`,
      );
    }

    if (consumption.userAccount !== request.account) {
      throw new BadRequestException(
        'Consumption record does not belong to the requested user',
      );
    }

    let user: User | null =
      consumption.user ??
      (await this.userRepository.findOne({
        where: { account: request.account },
        relations: ['customerCategories'],
      }));

    if (user && user.customerCategories === undefined) {
      user = await this.userRepository.findOne({
        where: { account: user.account },
        relations: ['customerCategories'],
      });
    }

    if (!user) {
      throw new NotFoundException(`User with account ${request.account} not found`);
    }

    return {
      ...context,
      consumption,
      user,
      taxRate: DEFAULT_TAX_RATE,
    };
  }
}

export class AreaBasedDataHandler extends BillDataHandler {
  constructor(
    private readonly customerCategoryRepository: Repository<CustomerCategoryAssignment>,
    private readonly tariffCategoryRepository: Repository<TariffCategory>,
    private readonly zoneScoringService: ZoneScoringService,
  ) {
    super();
  }

  protected async process(
    request: WaterBillRequest,
    context: Partial<WaterBillCalculationContext>,
  ): Promise<Partial<WaterBillCalculationContext>> {
    if (context.tariffPolicy?.tariffType !== TariffPolicyType.AREA_BASED) {
      return context;
    }

    if (!context.user) {
      throw new BadRequestException('User data is required to calculate bill');
    }

    const tariffCategory = await resolveTariffCategory(
      request.account,
      context.user,
      this.customerCategoryRepository,
      this.tariffCategoryRepository,
    );
    const zoneScore = await this.zoneScoringService.getZoneScoreForArea(
      context.user.areaId,
    );

    if (!zoneScore) {
      throw new NotFoundException('Zone score not found for user area');
    }

    return { ...context, tariffCategory, zoneScore };
  }

}

export class FixedDataHandler extends BillDataHandler {
  constructor(
    private readonly customerCategoryRepository: Repository<CustomerCategoryAssignment>,
    private readonly tariffCategoryRepository: Repository<TariffCategory>,
  ) {
    super();
  }

  protected async process(
    request: WaterBillRequest,
    context: Partial<WaterBillCalculationContext>,
  ): Promise<Partial<WaterBillCalculationContext>> {
    if (context.tariffPolicy?.tariffType !== TariffPolicyType.FIXED) {
      return context;
    }

    if (!context.user) {
      throw new BadRequestException('User data is required to calculate bill');
    }

    const tariffCategory = await resolveTariffCategory(
      request.account,
      context.user,
      this.customerCategoryRepository,
      this.tariffCategoryRepository,
    );
    return { ...context, tariffCategory };
  }
}

export class ThresholdDataHandler extends BillDataHandler {
  constructor(
    private readonly slabRepository: Repository<TariffThresholdSlab>,
  ) {
    super();
  }

  protected async process(
    _request: WaterBillRequest,
    context: Partial<WaterBillCalculationContext>,
  ): Promise<Partial<WaterBillCalculationContext>> {
    if (context.tariffPolicy?.tariffType !== TariffPolicyType.THRESHOLD) {
      return context;
    }

    const slabs = await this.slabRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', lowerLimit: 'ASC' },
    });

    if (slabs.length === 0) {
      throw new NotFoundException('No active threshold slabs found');
    }

    return { ...context, thresholdSlabs: slabs };
  }
}
