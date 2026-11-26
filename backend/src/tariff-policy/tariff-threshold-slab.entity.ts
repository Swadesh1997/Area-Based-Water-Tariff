import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tariff_threshold_slabs')
export class TariffThresholdSlab {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'lower_limit', type: 'decimal', precision: 10, scale: 2 })
  lowerLimit: number;

  @Column({
    name: 'upper_limit',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  upperLimit: number | null;

  @Column({ name: 'rate', type: 'decimal', precision: 10, scale: 2 })
  rate: number;

  @Column({
    name: 'tubewell_rate',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  tubewellRate: number | null;

  @Column({
    name: 'production_rate',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  productionRate: number | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
