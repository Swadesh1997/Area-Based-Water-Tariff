import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { User } from '../users/user.entity';
import { ApprovalStatusEnum } from '../common/enums/approval-status.enum';
import { Admin } from 'src/admins/admin.entity';

@Entity('consumption')
export class Consumption {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_account' })
  userAccount: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_account', referencedColumnName: 'account' })
  user: User;

  @Column({ name: 'created_by' })
  createdBy: number;

  @ManyToOne(() => Admin)
  @JoinColumn({ name: 'created_by' })
  creator: Admin;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: number;

  @ManyToOne(() => Admin, { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approver: Admin;

  @Column({
    type: 'enum',
    enum: ApprovalStatusEnum,
    name: 'approval_status',
    default: ApprovalStatusEnum.PENDING,
  })
  approvalStatus: ApprovalStatusEnum;

  @Column({ type: 'date', name: 'bill_month' })
  billMonth: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'current_reading' })
  currentReading: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'previous_reading',
    nullable: true,
  })
  previousReading: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  consumption: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  calculateConsumption() {
    if (this.currentReading && this.previousReading) {
      this.consumption =
        Number(this.currentReading) - Number(this.previousReading);
    }
  }
}
