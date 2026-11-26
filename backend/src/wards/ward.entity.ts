import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Zone } from '../zones/zone.entity';
import { User } from '../users/user.entity';

@Entity('wards')
export class Ward {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'zone_id' })
  zoneId: number;

  @Column({ type: 'varchar', length: 20, name: 'ward_no' })
  wardNo: string;

  @Column({ type: 'varchar', length: 100 })
  name: string; // e.g. "Banani Ward 20"

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
