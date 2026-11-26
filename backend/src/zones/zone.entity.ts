import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { wasa } from '../wasa/wasa.entity';
import { Ward } from '../wards/ward.entity';
import { User } from '../users/user.entity';
import { Area } from 'src/area/area.entity';

@Entity('zones')
export class Zone {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20, name: 'zone_no' })
  zoneNo: string;

  @Column({ name: 'wasa_id' })
  wasaId: number;

  @ManyToOne(() => wasa, (wasa) => wasa.zones)
  @JoinColumn({ name: 'wasa_id' })
  wasa: wasa;

  @Column({ type: 'varchar', length: 100 })
  name: string; // e.g. "Dhaka North Zone 1"

  @Column({ type: 'varchar', length: 100, name: 'city_name' })
  cityName: string; // e.g. "Dhaka"

  @OneToMany(() => Area, (area) => area.zone)
  areas: Area[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
