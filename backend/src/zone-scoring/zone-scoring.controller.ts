import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ZoneScoringService } from './zone-scoring.service';
import { Zone } from 'src/zones/zone.entity';
import {
  ScoringRuleSetStatus,
  ZoneScoringRuleSet,
} from './zone-scoring-ruleset.entity';
import { ZoneScore } from './zone-score.entity';
import { CreateZoneScoringRuleSetDto } from './dtos/create-zone-score-ruleset.dto';
import {
  ZoneScoreCalculationDto,
  ZoneScoreResultDto,
} from './dtos/zone-score-calculation.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('zone-scoring')
@Controller('zone-scoring')
export class ZoneScoringController {
  constructor(private readonly zoneScoringService: ZoneScoringService) {}

  @Get()
  async getAll(): Promise<ZoneScoringRuleSet[] | null> {
    return await this.zoneScoringService.getAll();
  }

  @Get('active')
  async getActiveScore(): Promise<ZoneScoringRuleSet | null> {
    return await this.zoneScoringService.getActiveRuleSet();
  }

  @Get('scores/calculate')
  async calculateZoneScores(
    @Query() query: ZoneScoreCalculationDto,
  ): Promise<ZoneScoreResultDto[]> {
    return await this.zoneScoringService.calculateZoneScores(query.ruleSetId);
  }

  @Post('scores/sync')
  async syncZoneScores(
    @Body() body: ZoneScoreCalculationDto,
  ): Promise<ZoneScore[]> {
    return await this.zoneScoringService.syncZoneScores(body.ruleSetId);
  }

  @Get('scores')
  async getZoneScores(
    @Query() query: ZoneScoreCalculationDto,
  ): Promise<ZoneScore[]> {
    return await this.zoneScoringService.getZoneScores(query.ruleSetId);
  }

  @Get('scores/area/:areaId')
  async getZoneScoreForArea(
    @Param('areaId') areaId: number,
    @Query() query: ZoneScoreCalculationDto,
  ): Promise<ZoneScore | null> {
    return await this.zoneScoringService.getZoneScoreForArea(
      areaId,
      query.ruleSetId,
    );
  }

  @Get(':id')
  async getById(@Param('id') id: number): Promise<ZoneScoringRuleSet | null> {
    return await this.zoneScoringService.getRuleSetById(id);
  }

  @Post()
  async createRuleSet(
    @Body() ruleSetData: CreateZoneScoringRuleSetDto,
  ): Promise<ZoneScoringRuleSet> {
    return await this.zoneScoringService.create(ruleSetData);
  }

  @Patch('publish/:id')
  async publishRuleSet(@Param('id') id: number): Promise<ZoneScoringRuleSet> {
    return await this.zoneScoringService.publishRuleSet(id);
  }

  @Patch('status/:id')
  async updateStatus(
    @Param('id') id: number,
    @Body('status')
    status: Exclude<
      ScoringRuleSetStatus,
      ScoringRuleSetStatus.PUBLISHED | ScoringRuleSetStatus.DRAFT
    >,
  ): Promise<ZoneScoringRuleSet> {
    return await this.zoneScoringService.updateStatus(id, status);
  }

  @Put(':id')
  async updateRuleSet(
    @Param('id') id: number,
    @Body() ruleSetData: Partial<CreateZoneScoringRuleSetDto>,
  ): Promise<ZoneScoringRuleSet> {
    return await this.zoneScoringService.update(id, ruleSetData);
  }

  @Delete(':id')
  async deleteRuleSet(@Param('id') id: number): Promise<void> {
    return await this.zoneScoringService.deleteRuleSet(id);
  }
}
