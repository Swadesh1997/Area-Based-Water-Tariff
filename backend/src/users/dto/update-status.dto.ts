import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ActiveStatus } from '../user.entity';

export class UpdateStatusDto {
  @ApiProperty({
    example: ActiveStatus.ACTIVE,
    enum: ActiveStatus,
    description: 'Active status of the user',
  })
  @IsEnum(ActiveStatus)
  @IsNotEmpty()
  activeStatus: ActiveStatus;
}
