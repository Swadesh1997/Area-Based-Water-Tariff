import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Consumption } from './consumption.entity';
import { CreateConsumptionDto } from './dto/create-consumption.dto';
import { UpdateConsumptionDto } from './dto/update-consumption.dto';
import { ApproveConsumptionDto } from './dto/approve-consumption.dto';
import { ApprovalStatusEnum } from '../common/enums/approval-status.enum';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { WaterBillsService } from '../water-bills/water-bills.service';
import { AdminsService } from '../admins/admins.service';

@Injectable()
export class ConsumptionService {
  constructor(
    @InjectRepository(Consumption)
    private readonly consumptionRepository: Repository<Consumption>,
    private readonly auditLogsService: AuditLogsService,
    private readonly waterBillsService: WaterBillsService,
    private readonly adminsService: AdminsService,
  ) {}

  async findAll(): Promise<Consumption[]> {
    return this.consumptionRepository.find({
      relations: ['user', 'creator', 'approver'],
      order: { billMonth: 'DESC', createdAt: 'DESC' },
    });
  }

  async findByUser(account: string): Promise<Consumption[]> {
    return this.consumptionRepository.find({
      where: { userAccount: account },
      relations: ['user', 'creator', 'approver'],
      order: { billMonth: 'DESC' },
    });
  }

  async findByMonth(billMonth: string): Promise<Consumption[]> {
    return this.consumptionRepository.find({
      where: { billMonth: new Date(billMonth) },
      relations: ['user', 'creator', 'approver'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(status: string): Promise<Consumption[]> {
    return this.consumptionRepository.find({
      where: { approvalStatus: status as ApprovalStatusEnum },
      relations: ['user', 'creator', 'approver'],
      order: { billMonth: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Consumption> {
    const consumption = await this.consumptionRepository.findOne({
      where: { id },
      relations: ['user', 'creator', 'approver'],
    });

    if (!consumption) {
      throw new NotFoundException(`Consumption record with ID ${id} not found`);
    }

    return consumption;
  }

  async create(
    createConsumptionDto: CreateConsumptionDto,
  ): Promise<Consumption> {
    // Check if consumption already exists for this user and month
    const existingConsumption = await this.consumptionRepository.findOne({
      where: {
        userAccount: createConsumptionDto.userAccount,
        billMonth: createConsumptionDto.billMonth,
      },
    });

    if (existingConsumption) {
      throw new BadRequestException(
        `Consumption record already exists for this user and month`,
      );
    }

    // Get previous reading if not provided
    let previousReading = createConsumptionDto.previousReading;
    if (!previousReading) {
      const lastConsumption = await this.consumptionRepository.findOne({
        where: {
          userAccount: createConsumptionDto.userAccount,
          billMonth: LessThan(createConsumptionDto.billMonth),
        },
        order: { billMonth: 'DESC' },
      });

      previousReading = lastConsumption?.currentReading || 0;
    }

    const consumption = this.consumptionRepository.create({
      ...createConsumptionDto,
      previousReading,
      approvalStatus: ApprovalStatusEnum.PENDING,
      consumption:
        Number(createConsumptionDto.currentReading) - Number(previousReading),
    });

    const savedConsumption = await this.consumptionRepository.save(consumption);

    // Log audit
    // await this.auditLogsService.logChange(
    //   createConsumptionDto.createdBy,
    //   'Created Consumption Record',
    //   'consumption',
    //   savedConsumption.id,
    //   null,
    //   {
    //     account: createConsumptionDto.account,
    //     billMonth: createConsumptionDto.billMonth,
    //     currentReading: createConsumptionDto.currentReading,
    //     previousReading,
    //     consumption: savedConsumption.consumption,
    //   },
    // );

    return this.findOne(savedConsumption.id);
  }

  async update(
    id: number,
    updateConsumptionDto: UpdateConsumptionDto,
  ): Promise<Consumption> {
    const consumption = await this.consumptionRepository.findOne({
      where: { id },
    });

    if (!consumption) {
      throw new NotFoundException(`Consumption record with ID ${id} not found`);
    }

    if (consumption.approvalStatus === ApprovalStatusEnum.APPROVED) {
      throw new BadRequestException(
        'Cannot update approved consumption records',
      );
    }

    // Store old data
    const oldData = { ...consumption };

    // Update fields
    Object.assign(consumption, updateConsumptionDto);

    // Recalculate consumption if readings changed
    if (
      updateConsumptionDto.currentReading ||
      updateConsumptionDto.previousReading
    ) {
      consumption.consumption =
        Number(consumption.currentReading) -
        Number(consumption.previousReading);
    }

    await this.consumptionRepository.save(consumption);

    // Log audit
    // await this.auditLogsService.logChange(
    //   consumption.createdBy,
    //   'Updated Consumption Record',
    //   'consumption',
    //   id,
    //   oldData,
    //   updateConsumptionDto,
    // );

    return this.findOne(id);
  }

  async approve(
    id: number,
    approveConsumptionDto: ApproveConsumptionDto,
  ): Promise<Consumption> {
    const consumption = await this.consumptionRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!consumption) {
      throw new NotFoundException(`Consumption record with ID ${id} not found`);
    }

    if (consumption.approvalStatus !== ApprovalStatusEnum.PENDING) {
      throw new BadRequestException(
        'Only pending consumption records can be approved',
      );
    }

    // Validate that the admin exists
    const admin = await this.adminsService.findOne(
      approveConsumptionDto.approvedBy,
    );
    if (!admin) {
      throw new NotFoundException(
        `Admin with ID ${approveConsumptionDto.approvedBy} not found`,
      );
    }

    consumption.approvedBy = approveConsumptionDto.approvedBy;
    consumption.approvalStatus = ApprovalStatusEnum.APPROVED;

    await this.consumptionRepository.save(consumption);

    // Log audit
    // await this.auditLogsService.logChange(
    //   approveConsumptionDto.approvedBy,
    //   'Approved Consumption Record',
    //   'consumption',
    //   id,
    //   { status: 'Pending' },
    //   { status: 'Approved', approvedBy: approveConsumptionDto.approvedBy },
    // );

    // Automatically create water bill after approval
    try {
      // Check if bill already exists for this consumption
      const existingBill = await this.waterBillsService.findByConsumption(id);
      if (!existingBill) {
        await this.waterBillsService.createForConsumption(id);
      }
    } catch (error) {
      // Log error but don't fail the approval
      console.error('Failed to create water bill:', error.message);
    }

    return this.findOne(id);
  }

  async reject(
    id: number,
    approveConsumptionDto: ApproveConsumptionDto,
  ): Promise<Consumption> {
    const consumption = await this.consumptionRepository.findOne({
      where: { id },
      relations: ['approvalStatus'],
    });

    if (!consumption) {
      throw new NotFoundException(`Consumption record with ID ${id} not found`);
    }

    if (consumption.approvalStatus !== ApprovalStatusEnum.PENDING) {
      throw new BadRequestException(
        'Only pending consumption records can be rejected',
      );
    }

    // Validate that the admin exists
    const admin = await this.adminsService.findOne(
      approveConsumptionDto.approvedBy,
    );
    if (!admin) {
      throw new NotFoundException(
        `Admin with ID ${approveConsumptionDto.approvedBy} not found`,
      );
    }

    consumption.approvedBy = approveConsumptionDto.approvedBy;
    consumption.approvalStatus = ApprovalStatusEnum.REJECTED;

    await this.consumptionRepository.save(consumption);

    // Log audit
    // await this.auditLogsService.logChange(
    //   approveConsumptionDto.approvedBy,
    //   'Rejected Consumption Record',
    //   'consumption',
    //   id,
    //   { status: 'Pending' },
    //   { status: 'Rejected', rejectedBy: approveConsumptionDto.approvedBy },
    // );

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const consumption = await this.consumptionRepository.findOne({
      where: { id },
    });

    if (!consumption) {
      throw new NotFoundException(`Consumption record with ID ${id} not found`);
    }

    if (
      consumption.approvalStatus &&
      consumption.approvalStatus === ApprovalStatusEnum.APPROVED
    ) {
      throw new BadRequestException(
        'Cannot delete approved consumption records',
      );
    }

    // Store data for audit
    const consumptionData = { ...consumption };

    await this.consumptionRepository.delete(id);

    // Log audit
    // await this.auditLogsService.logChange(
    //   consumption.createdBy,
    //   'Deleted Consumption Record',
    //   'consumption',
    //   id,
    //   consumptionData,
    //   null,
    // );
  }
}
