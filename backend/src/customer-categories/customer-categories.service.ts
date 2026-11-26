import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerCategoryAssignment } from './customer-category.entity';
import { CreateCustomerCategoryDto } from './dto/create-customer-category.dto';
import { UpdateCustomerCategoryDto } from './dto/update-customer-category.dto';

@Injectable()
export class CustomerCategoriesService {
  constructor(
    @InjectRepository(CustomerCategoryAssignment)
    private readonly customerCategoryRepository: Repository<CustomerCategoryAssignment>,
  ) {}

  async findAll(
    account?: string,
  ): Promise<CustomerCategoryAssignment[]> {
    const where = account ? { account } : {};
    return this.customerCategoryRepository.find({ where });
  }

  async findOne(id: number): Promise<CustomerCategoryAssignment> {
    const category = await this.customerCategoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(
        `Customer category with ID ${id} not found`,
      );
    }

    return category;
  }

  async create(
    createDto: CreateCustomerCategoryDto,
  ): Promise<CustomerCategoryAssignment> {
    const entity = this.customerCategoryRepository.create(createDto);
    return this.customerCategoryRepository.save(entity);
  }

  async update(
    id: number,
    updateDto: UpdateCustomerCategoryDto,
  ): Promise<CustomerCategoryAssignment> {
    const existing = await this.findOne(id);
    Object.assign(existing, updateDto);
    return this.customerCategoryRepository.save(existing);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.findOne(id);
    await this.customerCategoryRepository.delete(existing.id);
  }
}
