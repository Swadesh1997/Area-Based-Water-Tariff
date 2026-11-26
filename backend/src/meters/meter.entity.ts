import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { MeterStatus } from '../users/user.entity';

@Entity('meters')
export class Meter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true })
  account: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account', referencedColumnName: 'account' })
  user: User;

  @Column({ type: 'integer', name: 'meter_no' })
  meterNo: number;

  @Column({
    type: 'enum',
    enum: MeterStatus,
    name: 'meter_status',
    nullable: false,
  })
  meterStatus: MeterStatus;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'size_of_dia',
    nullable: false,
  })
  sizeOfDia: string;

  @Column({ type: 'date', name: 'meter_installation_date', nullable: true })
  meterInstallationDate: Date;
}
