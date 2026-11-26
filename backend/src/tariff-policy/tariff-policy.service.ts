import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TariffPolicy } from './tariff-policy.entity';
import { CreateTariffPolicyDto } from './dto/create-tariff-policy.dto';
import { UpdateTariffPolicyDto } from './dto/update-tariff-policy.dto';

@Injectable()
export class TariffPolicyService {
  constructor(
    @InjectRepository(TariffPolicy)
    private readonly tariffPolicyRepository: Repository<TariffPolicy>,
  ) {}

  async findAll(): Promise<TariffPolicy[]> {
    return this.tariffPolicyRepository.find();
  }

  async findOne(id: number): Promise<TariffPolicy> {
    const policy = await this.tariffPolicyRepository.findOneBy({ id });
    if (!policy) {
      throw new NotFoundException(`Tariff policy with ID ${id} not found`);
    }
    return policy;
  }

  async findActive(): Promise<TariffPolicy> {
    const policy = await this.tariffPolicyRepository.findOneBy({ isActive: true });
    if (!policy) {
      throw new NotFoundException('No active tariff policy found');
    }
    return policy;
  }

  async create(createDto: CreateTariffPolicyDto): Promise<TariffPolicy> {
    const policy = this.tariffPolicyRepository.create({
      ...createDto,
      isActive: false,
    });
    return this.tariffPolicyRepository.save(policy);
  }

  async update(
    id: number,
    updateDto: UpdateTariffPolicyDto,
  ): Promise<TariffPolicy> {
    const policy = await this.tariffPolicyRepository.findOneBy({ id });
    if (!policy) {
      throw new NotFoundException(`Tariff policy with ID ${id} not found`);
    }
    await this.tariffPolicyRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async activate(id: number): Promise<TariffPolicy> {
    return this.tariffPolicyRepository.manager.transaction(async (manager) => {
      const repo = manager.getRepository(TariffPolicy);
      const policy = await repo.findOneBy({ id });
      if (!policy) {
        throw new NotFoundException(`Tariff policy with ID ${id} not found`);
      }

      await repo.update({ isActive: true }, { isActive: false });
      await repo.update(id, { isActive: true });

      const updated = await repo.findOneBy({ id });
      if (!updated) {
        throw new NotFoundException(`Tariff policy with ID ${id} not found`);
      }
      return updated;
    });
  }

  async remove(id: number): Promise<void> {
    const policy = await this.tariffPolicyRepository.findOneBy({ id });
    if (!policy) {
      throw new NotFoundException(`Tariff policy with ID ${id} not found`);
    }
    await this.tariffPolicyRepository.delete(id);
  }
}
