import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Area } from '../area/area.entity';
import { ZoneScoringRuleSet } from './zone-scoring-ruleset.entity';

@Entity('zone_scores')
@Index(['areaId', 'ruleSetId'], { unique: true })
export class ZoneScore {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Area, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'area_id' })
  area: Area;

  @Column({ name: 'area_id' })
  areaId: number;

  @ManyToOne(() => ZoneScoringRuleSet, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rule_set_id' })
  ruleSet: ZoneScoringRuleSet;

  @Column({ name: 'rule_set_id' })
  ruleSetId: number;

  @Column({ type: 'decimal', precision: 15, scale: 6 })
  score: number;

  @Column({ type: 'decimal', precision: 15, scale: 6, name: 'area_geomean' })
  areaGeomean: number;

  @Column({ type: 'decimal', precision: 15, scale: 6, name: 'zone_geomean' })
  zoneGeomean: number;

  @Column({ type: 'decimal', precision: 15, scale: 6, name: 'average_geomean' })
  averageGeomean: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
