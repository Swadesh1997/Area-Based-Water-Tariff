import { Repository } from 'typeorm';
import { Consumption } from '../../consumption/consumption.entity';
import { CustomerCategoryAssignment } from '../../customer-categories/customer-category.entity';
import { TariffCategory } from '../../tariff-category/tariff-category.entity';
import { TariffThresholdSlab } from '../../tariff-policy/tariff-threshold-slab.entity';
import { TariffPolicyService } from '../../tariff-policy/tariff-policy.service';
import { User } from '../../users/user.entity';
import { ZoneScoringService } from '../../zone-scoring/zone-scoring.service';
import {
  ActivePolicyHandler,
  AreaBasedDataHandler,
  BillDataHandler,
  CommonDataHandler,
  FixedDataHandler,
  ThresholdDataHandler,
} from './billing-handlers';
import {
  WaterBillCalculationContext,
  WaterBillRequest,
} from './billing-context';

export class WaterBillContextBuilder {
  private readonly handlerChain: BillDataHandler;

  constructor(
    tariffPolicyService: TariffPolicyService,
    consumptionRepository: Repository<Consumption>,
    userRepository: Repository<User>,
    customerCategoryRepository: Repository<CustomerCategoryAssignment>,
    tariffCategoryRepository: Repository<TariffCategory>,
    zoneScoringService: ZoneScoringService,
    slabRepository: Repository<TariffThresholdSlab>,
  ) {
    const policyHandler = new ActivePolicyHandler(tariffPolicyService);
    const commonHandler = new CommonDataHandler(
      consumptionRepository,
      userRepository,
    );
    const areaHandler = new AreaBasedDataHandler(
      customerCategoryRepository,
      tariffCategoryRepository,
      zoneScoringService,
    );
    const fixedHandler = new FixedDataHandler(
      customerCategoryRepository,
      tariffCategoryRepository,
    );
    const thresholdHandler = new ThresholdDataHandler(slabRepository);

    policyHandler
      .setNext(commonHandler)
      .setNext(areaHandler)
      .setNext(fixedHandler)
      .setNext(thresholdHandler);

    this.handlerChain = policyHandler;
  }

  async build(
    request: WaterBillRequest,
  ): Promise<WaterBillCalculationContext> {
    return this.handlerChain.handle(request, {});
  }
}
