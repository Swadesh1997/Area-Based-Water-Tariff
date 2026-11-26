import { BadRequestException } from '@nestjs/common';
import { TariffPolicyType } from '../../common/enums/tariff-policy-type.enum';
import {
  AreaBasedBillingStrategy,
  FixedBillingStrategy,
  ThresholdBillingStrategy,
  WaterBillStrategy,
} from './billing-strategy';

export class WaterBillStrategyFactory {
  private readonly strategies: WaterBillStrategy[];

  constructor() {
    this.strategies = [
      new AreaBasedBillingStrategy(),
      new FixedBillingStrategy(),
      new ThresholdBillingStrategy(),
    ];
  }

  getStrategy(policyType: TariffPolicyType): WaterBillStrategy {
    const strategy = this.strategies.find((item) => item.supports(policyType));

    if (!strategy) {
      throw new BadRequestException(
        `No billing strategy found for policy ${policyType}`,
      );
    }

    return strategy;
  }
}
