import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WaterBill } from './water-bill.entity';
import { UpdateWaterBillDto } from './dto/update-water-bill.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CreateWaterBillDto } from './dto/create-water-bill.dto';
import { Consumption } from '../consumption/consumption.entity';
import { TariffPolicyService } from '../tariff-policy/tariff-policy.service';
import { User } from '../users/user.entity';
import { CustomerCategoryAssignment } from '../customer-categories/customer-category.entity';
import { ZoneScoringService } from '../zone-scoring/zone-scoring.service';
import { TariffThresholdSlab } from '../tariff-policy/tariff-threshold-slab.entity';
import { WaterBillContextBuilder } from './billing/water-bill-context.builder';
import { WaterBillStrategyFactory } from './billing/billing-strategy.factory';
import { TariffCategory } from '../tariff-category/tariff-category.entity';

@Injectable()
export class WaterBillsService {
  private readonly contextBuilder: WaterBillContextBuilder;
  private readonly strategyFactory: WaterBillStrategyFactory;

  constructor(
    @InjectRepository(WaterBill)
    private readonly waterBillRepository: Repository<WaterBill>,
    @InjectRepository(Consumption)
    private readonly consumptionRepository: Repository<Consumption>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(CustomerCategoryAssignment)
    private readonly customerCategoryRepository: Repository<CustomerCategoryAssignment>,
    @InjectRepository(TariffCategory)
    private readonly tariffCategoryRepository: Repository<TariffCategory>,
    @InjectRepository(TariffThresholdSlab)
    private readonly thresholdSlabRepository: Repository<TariffThresholdSlab>,
    private readonly auditLogsService: AuditLogsService,
    private readonly tariffPolicyService: TariffPolicyService,
    private readonly zoneScoringService: ZoneScoringService,
  ) {
    this.contextBuilder = new WaterBillContextBuilder(
      this.tariffPolicyService,
      this.consumptionRepository,
      this.userRepository,
      this.customerCategoryRepository,
      this.tariffCategoryRepository,
      this.zoneScoringService,
      this.thresholdSlabRepository,
    );
    this.strategyFactory = new WaterBillStrategyFactory();
  }

  async findAll(): Promise<WaterBill[]> {
    return this.waterBillRepository.find({
      relations: ['user', 'consumption'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUser(account: string): Promise<WaterBill[]> {
    return this.waterBillRepository.find({
      where: { userAccount: account },
      relations: ['user', 'consumption'],
      order: { billMonth: 'DESC' },
    });
  }

  async findByStatus(status: string): Promise<WaterBill[]> {
    return this.waterBillRepository.find({
      where: { status },
      relations: ['user', 'consumption'],
      order: { billMonth: 'DESC' },
    });
  }

  async findByMonth(billMonth: string): Promise<WaterBill[]> {
    return this.waterBillRepository.find({
      where: { billMonth: new Date(billMonth) },
      relations: ['user', 'consumption'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<WaterBill> {
    const waterBill = await this.waterBillRepository.findOne({
      where: { id },
      relations: ['user', 'consumption'],
    });

    if (!waterBill) {
      throw new NotFoundException(`Water bill with ID ${id} not found`);
    }

    return waterBill;
  }

  async findByConsumption(consumptionId: number): Promise<WaterBill | null> {
    return this.waterBillRepository.findOne({
      where: { consumptionId },
      relations: ['user', 'consumption'],
    });
  }

  async createForUser(
    account: string,
    createWaterBillDto: CreateWaterBillDto,
  ): Promise<WaterBill> {
    const existingBill = await this.findByConsumption(
      createWaterBillDto.consumptionId,
    );
    if (existingBill) {
      throw new BadRequestException(
        'Water bill already exists for this consumption record',
      );
    }

    const context = await this.contextBuilder.build({
      account,
      consumptionId: createWaterBillDto.consumptionId,
    });

    const strategy = this.strategyFactory.getStrategy(
      context.tariffPolicy.tariffType,
    );
    const result = strategy.calculate(context);

    const waterBill = this.waterBillRepository.create({
      userAccount: context.user.account,
      consumptionId: context.consumption.id,
      billMonth: context.consumption.billMonth,
      totalBill: result.total,
      breakdown: result.breakdown,
    });

    const saved = await this.waterBillRepository.save(waterBill);
    return this.findOne(saved.id);
  }

  async createForConsumption(consumptionId: number): Promise<WaterBill> {
    const consumption = await this.consumptionRepository.findOne({
      where: { id: consumptionId },
    });

    if (!consumption) {
      throw new NotFoundException(
        `Consumption record with ID ${consumptionId} not found`,
      );
    }

    return this.createForUser(consumption.userAccount, { consumptionId });
  }

  async update(
    id: number,
    updateWaterBillDto: UpdateWaterBillDto,
    account?: number,
  ): Promise<WaterBill> {
    const waterBill = await this.findOne(id);

    // Store old data
    const oldData = { ...waterBill };

    // Update fields
    Object.assign(waterBill, updateWaterBillDto);

    await this.waterBillRepository.save(waterBill);

    // Log audit
    if (account) {
      // await this.auditLogsService.logChange(
      //   account,
      //   'Updated Water Bill',
      //   'water_bills',
      //   id,
      //   oldData,
      //   updateWaterBillDto,
      // );
    }

    return this.findOne(id);
  }

  async markAsPaid(id: number, account?: number): Promise<WaterBill> {
    const waterBill = await this.findOne(id);

    if (waterBill.status === 'Paid') {
      throw new BadRequestException('Bill is already paid');
    }

    waterBill.status = 'Paid';
    await this.waterBillRepository.save(waterBill);

    // Log audit
    if (account) {
      // await this.auditLogsService.logChange(
      //   account,
      //   'Marked Bill as Paid',
      //   'water_bills',
      //   id,
      //   { status: 'Unpaid' },
      //   { status: 'Paid' },
      // );
    }

    return this.findOne(id);
  }

  async remove(id: number, account?: number): Promise<void> {
    const waterBill = await this.findOne(id);

    // Store old data for audit
    const oldData = { ...waterBill };

    await this.waterBillRepository.remove(waterBill);

    // Log audit
    if (account) {
      // await this.auditLogsService.logChange(
      //   account,
      //   'Deleted Water Bill',
      //   'water_bills',
      //   id,
      //   oldData,
      //   null,
      // );
    }
  }
}
