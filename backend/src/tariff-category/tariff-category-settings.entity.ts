import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('tariff_category_settings')
export class TariffCategorySettings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'title',
    type: 'varchar',
    length: 255,
    nullable: false,
    default: 'Default Tariff Settings',
  })
  title: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  // Production Cost, P (BDT/1000L)
  @Column({
    name: 'production_cost',
    type: 'float',
    nullable: false,
    comment: 'Production Cost, P (BDT/1000L)',
  })
  productionCost: number;

  // (BDT/1000L) - Base rate
  @Column({
    name: 'base_rate',
    type: 'float',
    nullable: false,
    comment: 'A (BDT/1000L)',
  })
  baseRate: number;

  // Current Supply Tariff (BDT/1000 L)
  @Column({
    name: 'current_tariff',
    type: 'float',
    nullable: false,
    comment: 'Current Supply Tariff (BDT/1000 L)',
  })
  currentTariff: number;

  // Current Tubewell Supply Tariff (BDT/1000 L)
  @Column({
    name: 'current_tubewell_tariff',
    type: 'float',
    nullable: false,
    comment: 'Current Tubewell Supply Tariff (BDT/1000 L)',
  })
  currentTubewellTariff: number;

  // Tubewell ratio (40% for most, 60% for commercial)
  @Column({
    name: 'tubewell_ratio_standard',
    type: 'float',
    default: 0.4,
    comment: 'Standard tubewell ratio (40%)',
  })
  tubewellRatioStandard: number;

  @Column({
    name: 'tubewell_ratio_commercial',
    type: 'float',
    default: 0.6,
    comment: 'Commercial tubewell ratio (60%)',
  })
  tubewellRatioCommercial: number;

  // Percentage change for categories above/below base
  @Column({
    name: 'above_base_increase_percent',
    type: 'float',
    default: 25,
    comment: 'Increase % for categories above base',
  })
  aboveBaseIncreasePercent: number;

  @Column({
    name: 'below_base_decrease_percent',
    type: 'float',
    default: 25,
    comment: 'Decrease % for categories below base',
  })
  belowBaseDecreasePercent: number;

  // Fixed rates
  @Column({
    name: 'commercial_increase_percent',
    type: 'float',
    default: 100,
    comment: 'Fixed increase for commercial (100%)',
  })
  commercialIncreasePercent: number;

  @Column({
    name: 'government_increase_percent',
    type: 'float',
    default: 0,
    comment: 'Fixed increase for government (0%)',
  })
  governmentIncreasePercent: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
