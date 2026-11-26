import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { TariffPolicyType } from '../../common/enums/tariff-policy-type.enum';

export class CreateTariffPolicyDto {
  @ApiProperty({
    enum: TariffPolicyType,
    description: 'Tariff policy type',
  })
  @IsEnum(TariffPolicyType)
  tariffType: TariffPolicyType;

}
