import { Consumption } from '../../consumption/consumption.entity';
import { TariffPolicy } from '../../tariff-policy/tariff-policy.entity';
import { TariffCategory } from '../../tariff-category/tariff-category.entity';
import { TariffThresholdSlab } from '../../tariff-policy/tariff-threshold-slab.entity';
import { User } from '../../users/user.entity';
import { ZoneScore } from '../../zone-scoring/zone-score.entity';

export interface WaterBillCalculationContext {
  tariffPolicy: TariffPolicy;
  user: User;
  consumption: Consumption;
  tariffCategory?: TariffCategory;
  zoneScore?: ZoneScore | null;
  thresholdSlabs?: TariffThresholdSlab[];
  taxRate: number;
}

export interface WaterBillCalculationResult {
  preTaxTotal: number;
  taxAmount: number;
  total: number;
  breakdown: Record<string, unknown>;
}

export interface WaterBillRequest {
  account: string;
  consumptionId: number;
}
