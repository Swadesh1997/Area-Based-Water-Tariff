import { IsEnum } from 'class-validator';
import { CustomerCategory } from 'src/common/enums/customer-category.enum';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { TariffCategorySettings } from './tariff-category-settings.entity';
import { CustomerCategoryAssignment } from '../customer-categories/customer-category.entity';

@Entity('tariff_categories')
export class TariffCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'sl_no',
    comment: 'Serial number',
  })
  slNo: number;

  @Column({ name: 'category' })
  @IsEnum([CustomerCategory])
  category: string;

  @Column({ name: 'category_name' })
  name: string;

  // Range of Factored Flat/household Area (sqf)
  @Column({ name: 'lower_range', nullable: true, type: 'float' })
  lowerRange: number | null;

  @Column({ name: 'upper_range', nullable: true, type: 'float' })
  upperRange: number | null;

  @Column({ name: 'range_description', nullable: true, type: 'varchar' })
  rangeDescription: string; // e.g., '1501-2500', 'Tin shed'

  @Column({
    name: 'wasa_tariff',
    type: 'float',
    comment: 'Tariff (BDT/1000 L)',
  })
  tariffRate: number;

  // Tubewell Supply Settings
  @Column({
    name: 'tubewell_tariff',
    type: 'float',
    comment: 'Tariff (BDT/1000 L)',
  })
  tubewellTariff: number;

  // Calculation properties
  @Column({ name: 'is_base_category', default: false })
  isBaseCategory: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'settings_id', nullable: true })
  settingsId: number;

  @ManyToOne(() => TariffCategorySettings)
  @JoinColumn({ name: 'settings_id' })
  settings: TariffCategorySettings;

  @OneToMany(
    () => CustomerCategoryAssignment,
    (assignment) => assignment.tariffCategory,
  )
  customerAssignments: CustomerCategoryAssignment[];
}
