import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateAreaDto {
  @ApiProperty({ example: 'Downtown Area', description: 'Name of the area' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'GeoJSON representation of the area',
    example: {
      type: 'Polygon',
      coordinates: [
        [
          [-73.981149, 40.753484],
          [-73.980065, 40.752998],
          [-73.979681, 40.753769],
          [-73.980764, 40.754255],
          [-73.981149, 40.753484],
        ],
      ],
    },
  })
  @IsNotEmpty()
  geojson: GeoJSON.Polygon | GeoJSON.MultiPolygon;

  @ApiProperty({ example: 1, description: 'ID of the associated zone' })
  @IsNumber()
  @IsNotEmpty()
  zoneId: number;
}
