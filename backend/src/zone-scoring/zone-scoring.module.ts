import { Module } from '@nestjs/common';
import { ZoneScoringController } from './zone-scoring.controller';
import { ZoneScoringService } from './zone-scoring.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ZoneScoringRuleSet } from './zone-scoring-ruleset.entity';
import { ZoneScoreParams } from './zone-scoring-params.entity';
import { ZoneScore } from './zone-score.entity';
import { Area } from '../area/area.entity';
import { Zone } from '../zones/zone.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ZoneScoringRuleSet,
      ZoneScoreParams,
      ZoneScore,
      Area,
      Zone,
    ]),
  ],
  exports: [ZoneScoringService],
  controllers: [ZoneScoringController],
  providers: [ZoneScoringService],
})
export class ZoneScoringModule {}
