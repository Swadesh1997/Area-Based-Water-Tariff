import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Zone } from 'src/zones/zone.entity';
import {
  ScoringRuleSetStatus,
  ZoneScoringRuleSet,
} from './zone-scoring-ruleset.entity';
import { Repository } from 'typeorm';
import { ZoneScoreParams } from './zone-scoring-params.entity';
import { ZoneScore } from './zone-score.entity';
import { CreateZoneScoringRuleSetDto } from './dtos/create-zone-score-ruleset.dto';
import { CreateZoneScoreParamDto } from './dtos/create-zone-score-param.dto';
import { ZoneScoreResultDto } from './dtos/zone-score-calculation.dto';
import { Area } from '../area/area.entity';

@Injectable()
export class ZoneScoringService {
  @InjectRepository(ZoneScoringRuleSet)
  private readonly zoneScoringRuleSetRepository: Repository<ZoneScoringRuleSet>;

  @InjectRepository(ZoneScoreParams)
  private readonly zoneScoreParamsRepository: Repository<ZoneScoreParams>;

  @InjectRepository(ZoneScore)
  private readonly zoneScoreRepository: Repository<ZoneScore>;

  @InjectRepository(Area)
  private readonly areaRepository: Repository<Area>;

  @InjectRepository(Zone)
  private readonly zoneRepository: Repository<Zone>;

  async getActiveRuleSet(): Promise<ZoneScoringRuleSet | null> {
    return this.zoneScoringRuleSetRepository.findOne({
      where: { status: ScoringRuleSetStatus.PUBLISHED },
      relations: ['scoringParams', 'scoringParams.area'],
    });
  }

  async getAll(): Promise<ZoneScoringRuleSet[] | null> {
    return this.zoneScoringRuleSetRepository.find({
      relations: ['scoringParams', 'scoringParams.area'],
    });
  }

  async create(
    ruleSetData: CreateZoneScoringRuleSetDto,
  ): Promise<ZoneScoringRuleSet> {
    const areaIds = ruleSetData.scoringParams.map((p) => p.areaId);
    const areas = await this.areaRepository.findByIds(areaIds);
    if (areas.length !== areaIds.length) {
      throw new NotFoundException('One or more areas not found');
    }

    const areaMap = new Map(areas.map((a) => [a.id, a]));

    const ruleSet = this.zoneScoringRuleSetRepository.create({
      title: ruleSetData.title,
      description: ruleSetData.description,
      status: ruleSetData.status ?? ScoringRuleSetStatus.DRAFT,
    });
    const savedRuleSet = await this.zoneScoringRuleSetRepository.save(ruleSet);

    const scoringParams = ruleSetData.scoringParams.map((paramData) =>
      this.zoneScoreParamsRepository.create({
        ...paramData,
        area: areaMap.get(paramData.areaId),
        ruleSet: savedRuleSet,
      }),
    );
    savedRuleSet.scoringParams =
      await this.zoneScoreParamsRepository.save(scoringParams);

    return savedRuleSet;
  }

  async getAllRuleSets(): Promise<ZoneScoringRuleSet[]> {
    return this.zoneScoringRuleSetRepository.find({
      relations: ['scoringParams', 'scoringParams.area'],
    });
  }

  async getRuleSetById(id: number): Promise<ZoneScoringRuleSet | null> {
    return this.zoneScoringRuleSetRepository.findOne({
      where: { id },
      relations: ['scoringParams', 'scoringParams.area'],
    });
  }

  async publishRuleSet(id: number): Promise<ZoneScoringRuleSet> {
    const ruleSet = await this.zoneScoringRuleSetRepository.findOne({
      where: { id },
    });
    if (!ruleSet) {
      throw new NotFoundException(`ZoneScoringRuleSet with ID ${id} not found`);
    }

    await this.zoneScoringRuleSetRepository.update(
      { status: ScoringRuleSetStatus.PUBLISHED },
      { status: ScoringRuleSetStatus.APPROVED },
    );

    ruleSet.status = ScoringRuleSetStatus.PUBLISHED;
    const savedRuleSet = await this.zoneScoringRuleSetRepository.save(ruleSet);

    await this.zoneScoreRepository.clear();

    await this.syncZoneScores(id);

    return savedRuleSet;
  }

  async updateStatus(
    id: number,
    status: ScoringRuleSetStatus,
  ): Promise<ZoneScoringRuleSet> {
    const ruleSet = await this.zoneScoringRuleSetRepository.findOne({
      where: { id },
    });
    if (!ruleSet) {
      throw new NotFoundException(`ZoneScoringRuleSet with ID ${id} not found`);
    }
    ruleSet.status = status;
    return this.zoneScoringRuleSetRepository.save(ruleSet);
  }

  async update(
    id: number,
    updateData: Partial<CreateZoneScoringRuleSetDto>,
  ): Promise<ZoneScoringRuleSet> {
    const ruleSet = await this.zoneScoringRuleSetRepository.findOne({
      where: { id },
      relations: ['scoringParams', 'scoringParams.area'],
    });

    if (!ruleSet) {
      throw new NotFoundException(`ZoneScoringRuleSet with ID ${id} not found`);
    }

    if (updateData.title !== undefined) {
      ruleSet.title = updateData.title;
    }
    if (updateData.description !== undefined) {
      ruleSet.description = updateData.description;
    }
    if (updateData.status !== undefined) {
      ruleSet.status = updateData.status;
    }

    if (updateData.scoringParams !== undefined) {
      const incomingParams = updateData.scoringParams;

      const incomingById = new Map<
        number,
        CreateZoneScoreParamDto & { id?: number }
      >();
      const newParams: Array<CreateZoneScoreParamDto & { id?: number }> = [];

      incomingParams.forEach((param) => {
        if ((param as any).id) {
          incomingById.set((param as any).id, param as any);
        } else {
          newParams.push(param as any);
        }
      });

      const paramsToRemove: ZoneScoreParams[] = [];

      const updatedParams: ZoneScoreParams[] = [];

      for (const existingParam of ruleSet.scoringParams) {
        const updatePayload = incomingById.get(existingParam.id);

        if (updatePayload) {
          Object.assign(existingParam, updatePayload);
          updatedParams.push(existingParam);
        } else {
          paramsToRemove.push(existingParam);
        }
      }

      if (paramsToRemove.length > 0) {
        await this.zoneScoreParamsRepository.remove(paramsToRemove);
      }

      // Validate new areas exist
      const newAreaIds = newParams.map((p) => p.areaId);
      if (newAreaIds.length > 0) {
        const newAreas = await this.areaRepository.findByIds(newAreaIds);
        if (newAreas.length !== newAreaIds.length) {
          throw new NotFoundException('One or more areas not found');
        }
        const newAreaMap = new Map(newAreas.map((a) => [a.id, a]));

        const createdNewParams = newParams.map((paramDto) =>
          this.zoneScoreParamsRepository.create({
            ...paramDto,
            area: newAreaMap.get(paramDto.areaId),
            ruleSet,
          }),
        );

        ruleSet.scoringParams = [...updatedParams, ...createdNewParams];
      } else {
        ruleSet.scoringParams = updatedParams;
      }
    }

    return this.zoneScoringRuleSetRepository.save(ruleSet);
  }

  async deleteRuleSet(id: number): Promise<void> {
    await this.zoneScoringRuleSetRepository.delete(id);
  }

  /**
   * Calculate geometric mean of an array of values
   */
  private calculateGeometricMean(values: number[]): number {
    if (values.length === 0) return 0;

    // Filter out zero or negative values to avoid calculation errors
    const positiveValues = values.filter((v) => v > 0);
    if (positiveValues.length === 0) return 0;

    const product = positiveValues.reduce((acc, val) => acc * val, 1);
    return Math.pow(product, 1 / positiveValues.length);
  }

  /**
   * Calculate zone scores based on active or specific rule set
   * Formula: Zone Score (SZ) = 1 + (GN - GZ) / GZ
   * Where:
   * - GZ = Zone Geomean (Average of area geomeans in the zone)
   * - GN = Average Geomean of all zones
   */
  async calculateZoneScores(ruleSetId?: number): Promise<ZoneScoreResultDto[]> {
    // Get the rule set (active or specified)
    let ruleSet: ZoneScoringRuleSet | null;

    if (ruleSetId) {
      ruleSet = await this.getRuleSetById(ruleSetId);
    } else {
      ruleSet = await this.getActiveRuleSet();
    }

    if (!ruleSet) {
      throw new NotFoundException('No active or specified rule set found');
    }

    // Get all areas with their zone information
    const areas = await this.areaRepository.find({
      relations: ['zone'],
    });

    const areaMap = new Map(areas.map((a) => [a.id, a]));

    // Calculate area geomeans from scoring params
    const areaGeomeans = new Map<number, number>();

    for (const param of ruleSet.scoringParams) {
      const percentages = [
        param.landTaxRatePercentage,
        param.buildingTaxRateUpto120sqmPercentage,
        param.buildingTaxRateUpto200sqmPercentage,
        param.buildingTaxRateAbove200sqmPercentage,
        param.landHomeRatePercentage,
        param.landRatePercentage,
        param.highIncomeGroupConnectionPercentage,
      ];

      const geomean = this.calculateGeometricMean(percentages);
      areaGeomeans.set(param.areaId, geomean);
    }

    // Group areas by zone and calculate zone geomeans
    const zoneGeomeans = new Map<number, number>();
    const zoneAreaCounts = new Map<number, number>();

    for (const [areaId, geomean] of areaGeomeans.entries()) {
      const area = areaMap.get(areaId);
      if (!area || !area.zone) continue;

      const zoneId = area.zone.id;
      const currentSum = zoneGeomeans.get(zoneId) || 0;
      const currentCount = zoneAreaCounts.get(zoneId) || 0;

      zoneGeomeans.set(zoneId, currentSum + geomean);
      zoneAreaCounts.set(zoneId, currentCount + 1);
    }

    // Calculate average geomean for each zone
    for (const [zoneId, sum] of zoneGeomeans.entries()) {
      const count = zoneAreaCounts.get(zoneId) || 1;
      zoneGeomeans.set(zoneId, sum / count);
    }

    // Calculate average geomean of all zones (GN)
    const allZoneGeomeans = Array.from(zoneGeomeans.values());
    const averageGeomean =
      allZoneGeomeans.reduce((sum, g) => sum + g, 0) / allZoneGeomeans.length;

    // Calculate zone scores for each area
    const results: ZoneScoreResultDto[] = [];

    for (const [areaId, areaGeomean] of areaGeomeans.entries()) {
      const area = areaMap.get(areaId);
      if (!area || !area.zone) continue;

      const zoneId = area.zone.id;
      const zoneGeomean = zoneGeomeans.get(zoneId) || 0;

      // Zone Score Formula: SZ = 1 + (GN - GZ) / GZ
      const score =
        zoneGeomean > 0 ? 1 + (averageGeomean - zoneGeomean) / zoneGeomean : 1;

      results.push({
        areaId: area.id,
        areaName: area.name,
        zoneId: area.zone.id,
        zoneName: area.zone.name,
        score: parseFloat(score.toFixed(6)),
        areaGeomean: parseFloat(areaGeomean.toFixed(6)),
        zoneGeomean: parseFloat(zoneGeomean.toFixed(6)),
        averageGeomean: parseFloat(averageGeomean.toFixed(6)),
      });
    }

    return results;
  }

  /**
   * Sync zone scores - Calculate and save to database
   * This automatically uses the active (published) rule set
   */
  async syncZoneScores(ruleSetId?: number): Promise<ZoneScore[]> {
    const scores = await this.calculateZoneScores(ruleSetId);

    // Get the rule set
    let ruleSet: ZoneScoringRuleSet | null;
    if (ruleSetId) {
      ruleSet = await this.getRuleSetById(ruleSetId);
    } else {
      ruleSet = await this.getActiveRuleSet();
    }

    if (!ruleSet) {
      throw new NotFoundException('No active or specified rule set found');
    }

    // Delete existing scores for this rule set
    await this.zoneScoreRepository.delete({ ruleSetId: ruleSet.id });

    // Create new zone score records
    const zoneScores = scores.map((scoreData) =>
      this.zoneScoreRepository.create({
        areaId: scoreData.areaId,
        ruleSetId: ruleSet.id,
        score: scoreData.score,
        areaGeomean: scoreData.areaGeomean,
        zoneGeomean: scoreData.zoneGeomean,
        averageGeomean: scoreData.averageGeomean,
      }),
    );

    return this.zoneScoreRepository.save(zoneScores);
  }

  /**
   * Get all zone scores for a specific rule set (or active if not specified)
   */
  async getZoneScores(ruleSetId?: number): Promise<ZoneScore[]> {
    let ruleSet: ZoneScoringRuleSet | null;

    if (ruleSetId) {
      ruleSet = await this.getRuleSetById(ruleSetId);
    } else {
      ruleSet = await this.getActiveRuleSet();
    }

    if (!ruleSet) {
      throw new NotFoundException('No active or specified rule set found');
    }

    return this.zoneScoreRepository.find({
      where: { ruleSetId: ruleSet.id },
      relations: ['area', 'area.zone', 'ruleSet'],
    });
  }

  /**
   * Get zone score for a specific area
   */
  async getZoneScoreForArea(
    areaId: number,
    ruleSetId?: number,
  ): Promise<ZoneScore | null> {
    let ruleSet: ZoneScoringRuleSet | null;

    if (ruleSetId) {
      ruleSet = await this.getRuleSetById(ruleSetId);
    } else {
      ruleSet = await this.getActiveRuleSet();
    }

    if (!ruleSet) {
      throw new NotFoundException('No active or specified rule set found');
    }

    return this.zoneScoreRepository.findOne({
      where: { areaId, ruleSetId: ruleSet.id },
      relations: ['area', 'area.zone', 'ruleSet'],
    });
  }
}
