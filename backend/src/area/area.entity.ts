import { Zone } from 'src/zones/zone.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('areas')
export class Area {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', name: 'name' })
  name: string;

  @Column({ type: 'geometry', spatialFeatureType: 'Polygon', srid: 4326 })
  geojson: GeoJSON.Polygon | GeoJSON.MultiPolygon;

  @ManyToOne(() => Zone, (zone) => zone.areas, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'zone_id' })
  zone: Zone;
}
