import { BadRequestException } from '@nestjs/common';
import { AccountType } from '../../users/user.entity';
import { TariffPolicyType } from '../../common/enums/tariff-policy-type.enum';
import {
  WaterBillCalculationContext,
  WaterBillCalculationResult,
} from './billing-context';

export interface WaterBillStrategy {
  supports(policyType: TariffPolicyType): boolean;
  calculate(
    context: WaterBillCalculationContext,
  ): WaterBillCalculationResult;
}

const roundCurrency = (value: number): number =>
  Number(value.toFixed(2));

const normalizeNumber = (value: number | string | null | undefined): number =>
  value === null || value === undefined ? 0 : Number(value);

const applyTax = (
  preTaxTotal: number,
  taxRate: number,
): { taxAmount: number; total: number } => {
  const taxAmount = roundCurrency(preTaxTotal * taxRate);
  return {
    taxAmount,
    total: roundCurrency(preTaxTotal + taxAmount),
  };
};

export class AreaBasedBillingStrategy implements WaterBillStrategy {
  supports(policyType: TariffPolicyType): boolean {
    return policyType === TariffPolicyType.AREA_BASED;
  }

  calculate(context: WaterBillCalculationContext): WaterBillCalculationResult {
    if (!context.tariffCategory || !context.zoneScore) {
      throw new BadRequestException(
        'Area-based billing requires tariff category and zone score',
      );
    }

    const consumption = normalizeNumber(context.consumption.consumption);
    const zoneMultiplier = normalizeNumber(context.zoneScore.score) || 1;
    const baseRate =
      context.user.accountType === AccountType.TUBEWELL
        ? normalizeNumber(context.tariffCategory.tubewellTariff)
        : normalizeNumber(context.tariffCategory.tariffRate);

    const preTaxTotal = roundCurrency(
      (consumption / 1000) * baseRate * zoneMultiplier,
    );
    const { taxAmount, total } = applyTax(preTaxTotal, context.taxRate);

    return {
      preTaxTotal,
      taxAmount,
      total,
      breakdown: {
        policy: TariffPolicyType.AREA_BASED,
        consumption,
        baseRate,
        zoneScore: zoneMultiplier,
        preTaxTotal,
        taxRate: context.taxRate,
        taxAmount,
        total,
      },
    };
  }
}

export class FixedBillingStrategy implements WaterBillStrategy {
  supports(policyType: TariffPolicyType): boolean {
    return policyType === TariffPolicyType.FIXED;
  }

  calculate(context: WaterBillCalculationContext): WaterBillCalculationResult {
    if (!context.tariffCategory) {
      throw new BadRequestException(
        'Fixed billing requires a tariff category',
      );
    }

    const consumption = normalizeNumber(context.consumption.consumption);
    const rate =
      context.user.accountType === AccountType.TUBEWELL
        ? normalizeNumber(context.tariffCategory.tubewellTariff)
        : normalizeNumber(context.tariffCategory.tariffRate);

    const preTaxTotal = roundCurrency((consumption / 1000) * rate);
    const { taxAmount, total } = applyTax(preTaxTotal, context.taxRate);

    return {
      preTaxTotal,
      taxAmount,
      total,
      breakdown: {
        policy: TariffPolicyType.FIXED,
        consumption,
        rate,
        preTaxTotal,
        taxRate: context.taxRate,
        taxAmount,
        total,
      },
    };
  }
}

export class ThresholdBillingStrategy implements WaterBillStrategy {
  supports(policyType: TariffPolicyType): boolean {
    return policyType === TariffPolicyType.THRESHOLD;
  }

  calculate(context: WaterBillCalculationContext): WaterBillCalculationResult {
    if (!context.thresholdSlabs || context.thresholdSlabs.length === 0) {
      throw new BadRequestException(
        'Threshold billing requires configured slabs',
      );
    }

    const consumption = normalizeNumber(context.consumption.consumption);
    const slabBreakdown: Array<{
      lowerLimit: number;
      upperLimit: number | null;
      rate: number;
      usage: number;
      cost: number;
    }> = [];

    let preTaxTotal = 0;

    for (const slab of context.thresholdSlabs) {
      const lower = normalizeNumber(slab.lowerLimit);
      const upper =
        slab.upperLimit === null || slab.upperLimit === undefined
          ? null
          : normalizeNumber(slab.upperLimit);

      const upperBound = upper ?? Number.POSITIVE_INFINITY;
      const usage = Math.max(0, Math.min(consumption, upperBound) - lower);

      if (usage <= 0) {
        continue;
      }

      const baseRate = normalizeNumber(slab.rate);
      const tubewellRate =
        slab.tubewellRate === null || slab.tubewellRate === undefined
          ? slab.rate
          : slab.tubewellRate;
      const rate =
        context.user.accountType === AccountType.TUBEWELL
          ? normalizeNumber(tubewellRate)
          : baseRate;
      const cost = roundCurrency((usage / 1000) * rate);
      preTaxTotal += cost;

      slabBreakdown.push({
        lowerLimit: lower,
        upperLimit: upper,
        rate,
        usage: roundCurrency(usage),
        cost,
      });
    }

    preTaxTotal = roundCurrency(preTaxTotal);
    const { taxAmount, total } = applyTax(preTaxTotal, context.taxRate);

    return {
      preTaxTotal,
      taxAmount,
      total,
      breakdown: {
        policy: TariffPolicyType.THRESHOLD,
        consumption,
        slabs: slabBreakdown,
        preTaxTotal,
        taxRate: context.taxRate,
        taxAmount,
        total,
      },
    };
  }
}
