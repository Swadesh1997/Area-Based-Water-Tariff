import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { wasasController } from './wasa.controller';
import { wasasService } from './wasa.service';
import { wasa } from './wasa.entity';

@Module({
  imports: [TypeOrmModule.forFeature([wasa])],
  controllers: [wasasController],
  providers: [wasasService],
  exports: [wasasService],
})
export class wasasModule {}
