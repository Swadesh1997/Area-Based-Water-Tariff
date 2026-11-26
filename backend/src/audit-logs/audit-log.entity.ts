import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_account', nullable: true })
  userAccount: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_account', referencedColumnName: 'account' })
  user: User;

  @Column({ length: 255 })
  action: string;

  @Column({ name: 'table_name', length: 100 })
  tableName: string;

  @Column({ name: 'record_id' })
  recordId: number;

  @Column({ type: 'json', name: 'old_data', nullable: true })
  oldData: any;

  @Column({ type: 'json', name: 'new_data', nullable: true })
  newData: any;

  @Column({ name: 'ip_address', length: 50, nullable: true })
  ipAddress: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
