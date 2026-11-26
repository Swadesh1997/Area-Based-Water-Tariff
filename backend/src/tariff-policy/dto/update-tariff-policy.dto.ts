import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { TariffPolicyType } from '../../common/enums/tariff-policy-type.enum';

export class UpdateTariffPolicyDto {
  @ApiPropertyOptional({
    enum: TariffPolicyType,
    description: 'Tariff policy type',
  })
  @IsOptional()
  @IsEnum(TariffPolicyType)
  tariffType?: TariffPolicyType;

}
