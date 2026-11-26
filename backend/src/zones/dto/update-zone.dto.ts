import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, MaxLength } from 'class-validator';

export class UpdateZoneDto {
  @ApiProperty({
    description: 'Unique zone number',
    example: '1',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  zoneNo?: string;

  @ApiProperty({
    description: 'WASA zone identifier',
    example: 5,
  })
  @IsNumber()
  @IsOptional()
  wasaId?: number;

  @ApiProperty({
    description: 'Name of the zone',
    example: 'Downtown Zone',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    description: 'City name where the zone is located',
    example: 'Metropolis',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  cityName?: string;
}
