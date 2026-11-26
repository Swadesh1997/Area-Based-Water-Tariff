import { Module } from '@nestjs/common';
import { AreaController } from './area.controller';
import { AreaService } from './area.service';
import { Area } from './area.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Zone } from 'src/zones/zone.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Area, Zone])],
  exports: [AreaService],
  controllers: [AreaController],
  providers: [AreaService],
})
export class AreaModule {}
