import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Consumption } from '../consumption/consumption.entity';

@Entity('water_bills')
export class WaterBill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_account' })
  userAccount: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_account', referencedColumnName: 'account' })
  user: User;

  @Column({ name: 'consumption_id', unique: true })
  consumptionId: number;

  @ManyToOne(() => Consumption)
  @JoinColumn({ name: 'consumption_id' })
  consumption: Consumption;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_bill' })
  totalBill: number;

  @Column({ type: 'json', nullable: true })
  breakdown: any; // Store detailed slab-wise calculation

  @Column({ type: 'date', name: 'bill_month' })
  billMonth: Date;

  @Column({ type: 'varchar', length: 20, default: 'Unpaid' })
  status: string; // Unpaid, Paid, Overdue

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
