import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_account' })
  userAccount: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_account', referencedColumnName: 'account' })
  user: User;

  @Column({ length: 255 })
  title: string;

  @Column('text')
  message: string;

  @Column({ length: 50 })
  type: string; // "Bill", "Approval", "Reminder"

  @Column({ length: 20, default: 'Unread' })
  status: string; // "Unread", "Read"

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
