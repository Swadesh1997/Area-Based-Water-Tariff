import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ZoneScoringRuleSet } from './zone-scoring-ruleset.entity';
import { Area } from '../area/area.entity';

@Entity('zone_score_params')
export class ZoneScoreParams {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Area, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'area_id' })
  area: Area;

  @Column({ name: 'area_id' })
  areaId: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'land_home_rate' })
  landHomeRate: number; // BDT per sqm

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    name: 'land_home_rate_percentage',
  })
  landHomeRatePercentage: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'land_rate' })
  landRate: number; // BDT per sqm

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    name: 'land_rate_percentage',
  })
  landRatePercentage: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'land_tax_rate' })
  landTaxRate: number; // BDT per sqm

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    name: 'land_tax_rate_percentage',
  })
  landTaxRatePercentage: number;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    name: 'building_tax_rate_upto_120sqm',
  })
  buildingTaxRateUpto120sqm: number; // BDT per sqm

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    name: 'building_tax_rate_upto_120sqm_percentage',
  })
  buildingTaxRateUpto120sqmPercentage: number;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    name: 'building_tax_rate_upto_200sqm',
  })
  buildingTaxRateUpto200sqm: number; // BDT per sqm

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    name: 'building_tax_rate_upto_200sqm_percentage',
  })
  buildingTaxRateUpto200sqmPercentage: number;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    name: 'building_tax_rate_above_200sqm',
  })
  buildingTaxRateAbove200sqm: number; // BDT per sqm

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    name: 'building_tax_rate_above_200sqm_percentage',
  })
  buildingTaxRateAbove200sqmPercentage: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    name: 'high_income_group_connection_percentage',
  })
  highIncomeGroupConnectionPercentage: number;

  @Column({ type: 'decimal', precision: 15, scale: 6 })
  geoMean: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => ZoneScoringRuleSet, (ruleSet) => ruleSet.scoringParams, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'rule_set_id' })
  ruleSet: ZoneScoringRuleSet;

  @Column({ name: 'rule_set_id' })
  ruleSetId: number;
}
