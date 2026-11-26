import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meter } from './meter.entity';
import { CreateMeterDto } from './dto/create-meter.dto';
import { UpdateMeterDto } from './dto/update-meter.dto';

@Injectable()
export class MetersService {
  constructor(
    @InjectRepository(Meter)
    private metersRepository: Repository<Meter>,
  ) {}

  async findAll(): Promise<Meter[]> {
    return this.metersRepository.find({
      relations: ['user'],
    });
  }

  async findOne(id: number): Promise<Meter> {
    const meter = await this.metersRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!meter) {
      throw new NotFoundException(`Meter with ID ${id} not found`);
    }

    return meter;
  }

  async findByAccount(account: string): Promise<Meter[]> {
    return this.metersRepository.find({
      where: { account },
      relations: ['user'],
    });
  }

  async findByMeterNo(meterNo: number): Promise<Meter | null> {
    return this.metersRepository.findOne({
      where: { meterNo },
      relations: ['user'],
    });
  }

  async findByMeterStatus(meterStatus: string): Promise<Meter[]> {
    return this.metersRepository.find({
      where: { meterStatus: meterStatus as any },
      relations: ['user'],
    });
  }

  async create(createMeterDto: CreateMeterDto): Promise<Meter> {
    // Check if meter number already exists
    const existingMeter = await this.findByMeterNo(createMeterDto.meterNo);
    if (existingMeter) {
      throw new ConflictException('Meter number already exists');
    }

    const meter = this.metersRepository.create(createMeterDto);
    return this.metersRepository.save(meter);
  }

  async update(id: number, updateMeterDto: UpdateMeterDto): Promise<Meter> {
    const meter = await this.metersRepository.findOneBy({ id });

    if (!meter) {
      throw new NotFoundException(`Meter with ID ${id} not found`);
    }

    // Check if meter number is being updated and if it already exists
    if (updateMeterDto.meterNo && updateMeterDto.meterNo !== meter.meterNo) {
      const existingMeter = await this.findByMeterNo(updateMeterDto.meterNo);
      if (existingMeter) {
        throw new ConflictException('Meter number already exists');
      }
    }

    await this.metersRepository.update(id, updateMeterDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const meter = await this.metersRepository.findOneBy({ id });

    if (!meter) {
      throw new NotFoundException(`Meter with ID ${id} not found`);
    }

    await this.metersRepository.delete(id);
  }
}
