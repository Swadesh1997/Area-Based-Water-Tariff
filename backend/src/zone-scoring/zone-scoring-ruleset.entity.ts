import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { ZoneScoreParams } from './zone-scoring-params.entity';

export enum ScoringRuleSetStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PUBLISHED = 'published',
}

@Entity('zone_scoring_rule_sets')
@Index(['title'], { unique: true })
export class ZoneScoringRuleSet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: ScoringRuleSetStatus,
    default: ScoringRuleSetStatus.DRAFT,
  })
  status: ScoringRuleSetStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => ZoneScoreParams, (params) => params.ruleSet, {
    cascade: true,
    eager: false,
  })
  scoringParams: ZoneScoreParams[];

  @Column({ type: 'date', name: 'effective_from', nullable: true })
  effectiveFrom: Date | null;
}
