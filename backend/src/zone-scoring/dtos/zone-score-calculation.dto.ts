import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class ZoneScoreCalculationDto {
  @ApiProperty({
    example: 1,
    description: 'ID of the scoring rule set to use for calculation',
  })
  @IsNumber()
  @IsOptional()
  ruleSetId?: number;
}

export class ZoneScoreResultDto {
  areaId: number;
  areaName: string;
  zoneId: number;
  zoneName: string;
  score: number;
  areaGeomean: number;
  zoneGeomean: number;
  averageGeomean: number;
}
