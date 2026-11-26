import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreatewasaDto {
  @ApiProperty({
    example: 'City Water Supply',
    description: 'Name of the WASA',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'CWS', description: 'Code of the WASA' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  code: string;

  @ApiProperty({
    example: '123 Main St, Cityville',
    description: 'Address of the WASA',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  address: string;
}
