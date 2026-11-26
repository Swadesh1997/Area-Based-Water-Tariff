import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Zone } from '../zones/zone.entity';

@Entity('wasa')
export class wasa {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string; // e.g. "Dhaka North wasa"

  @Column({ type: 'varchar', length: 10 })
  code: string; // e.g. "DNCC"

  @Column({ type: 'varchar', length: 100 })
  address: string;

  @OneToMany(() => Zone, (zone) => zone.wasa)
  zones: Zone[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
