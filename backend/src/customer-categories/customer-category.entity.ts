import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { CustomerCategory } from '../common/enums/customer-category.enum';
import { TariffCategory } from '../tariff-category/tariff-category.entity';

@Entity('customer_categories')
export class CustomerCategoryAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', name: 'account' })
  account: string;

  @ManyToOne(() => User, (user) => user.customerCategories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'account', referencedColumnName: 'account' })
  user: User;

  @Column({
    type: 'enum',
    enum: CustomerCategory,
    name: 'customer_category',
    nullable: false,
  })
  customerCategory: CustomerCategory;

  @Column({ type: 'float', name: 'ratio', nullable: false })
  ratio: number;

  @ManyToOne(() => TariffCategory, (tariff) => tariff.customerAssignments, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'tariff_category_id' })
  tariffCategory: TariffCategory | null;
}
