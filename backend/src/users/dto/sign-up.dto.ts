import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SignUpDto {
  @ApiProperty({
    example: '123456',
    description: 'The unique meter number of the user',
  })
  @IsString()
  @IsNotEmpty()
  meterNo: string;

  @ApiProperty({
    example: 'password123',
    description: 'The password for the user account',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
