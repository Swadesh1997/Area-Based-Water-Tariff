import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, MaxLength } from 'class-validator';

export class CreateZoneDto {
  @ApiProperty({
    description: 'Unique zone number',
    example: '1',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  zoneNo: string;

  @ApiProperty({
    description: 'WASA zone identifier',
    example: 5,
  })
  @IsNumber()
  @IsNotEmpty()
  wasaId: number;

  @ApiProperty({
    description: 'Name of the zone',
    example: 'Downtown Zone',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'City name where the zone is located',
    example: 'Metropolis',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  cityName: string;
}
