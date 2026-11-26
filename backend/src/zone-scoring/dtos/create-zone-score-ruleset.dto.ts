import {
  IsString,
  IsOptional,
  IsEnum,
  ValidateNested,
  IsArray,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateZoneScoreParamDto } from './/create-zone-score-param.dto';
import { ScoringRuleSetStatus } from '../zone-scoring-ruleset.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateZoneScoringRuleSetDto {
  @ApiProperty({
    example: 'Zone Score Rule Set 1',
    description: 'Title of the rule set',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'This is a sample rule set description',
    description: 'Description of the rule set',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: ScoringRuleSetStatus.DRAFT,
    description: 'Status of the rule set',
    enum: ScoringRuleSetStatus,
    default: ScoringRuleSetStatus.DRAFT,
  })
  @IsEnum(ScoringRuleSetStatus)
  status: ScoringRuleSetStatus = ScoringRuleSetStatus.DRAFT;

  @ApiProperty({
    type: [CreateZoneScoreParamDto],
    description: 'Array of scoring parameters',
  })
  @IsArray()
  @ArrayMinSize(1) // at least one param required
  @ValidateNested({ each: true })
  @Type(() => CreateZoneScoreParamDto)
  scoringParams: CreateZoneScoreParamDto[];
}
