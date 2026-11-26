import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TariffPolicyType } from '../common/enums/tariff-policy-type.enum';

@Entity('tariff_policy')
export class TariffPolicy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: TariffPolicyType,
    name: 'tariff_type',
  })
  tariffType: TariffPolicyType;

  @Column({ name: 'is_active', default: false })
  isActive: boolean;
}
