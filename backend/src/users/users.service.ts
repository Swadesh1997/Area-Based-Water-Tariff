import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ActiveStatus, ApprovalStatus, User } from './user.entity';
import { CustomerCategoryAssignment } from '../customer-categories/customer-category.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { UserFactory } from './user.factory';
import { MetersService } from '../meters/meters.service';
import { Meter } from '../meters/meter.entity';
import { TariffCategory } from '../tariff-category/tariff-category.entity';
import { SignUpDto } from './dto/sign-up.dto';
import * as bcrypt from 'bcrypt';
import { UserPassword } from './user-password.entity';

const SQFT_PER_DECIMAL = 435.6;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(TariffCategory)
    private tariffCategoryRepository: Repository<TariffCategory>,
    @InjectRepository(UserPassword)
    private userPasswordRepository: Repository<UserPassword>,
    private readonly auditLogsService: AuditLogsService,
    private readonly userFactory: UserFactory,
    private readonly metersService: MetersService,
    private readonly dataSource: DataSource,
  ) {}

  private normalizeNumber(
    value: number | string | null | undefined,
    fallback = 0,
  ): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  private calculateFactoredAreaSqft(user: User): number {
    const landSizeDecimal = this.normalizeNumber(user.landSizeDecimal);
    const numberOfStories = this.normalizeNumber(user.numberOfStories, 1);
    const numberOfFlats = this.normalizeNumber(user.numberOfFlats, 1);

    if (landSizeDecimal <= 0) {
      return 0;
    }

    const landSqft = landSizeDecimal * SQFT_PER_DECIMAL;
    const totalSqft = landSqft * Math.max(numberOfStories, 1);
    return totalSqft / Math.max(numberOfFlats, 1);
  }

  private matchesRange(category: TariffCategory, areaSqft: number): boolean {
    const hasRange =
      category.lowerRange !== null && category.lowerRange !== undefined
        ? true
        : category.upperRange !== null && category.upperRange !== undefined;

    if (!hasRange) {
      return false;
    }

    const lowerOk =
      category.lowerRange === null || category.lowerRange === undefined
        ? true
        : areaSqft >= category.lowerRange;
    const upperOk =
      category.upperRange === null || category.upperRange === undefined
        ? true
        : areaSqft <= category.upperRange;

    return lowerOk && upperOk;
  }

  async signUp(signUpDto: SignUpDto): Promise<User> {
    const existingUser = await this.usersRepository.findOneBy({
      account: signUpDto.meterNo,
    });
    if (!existingUser) {
      throw new NotFoundException(
        `User with account ${signUpDto.meterNo} doesn't exist`,
      );
    }
    if (existingUser.status !== ApprovalStatus.SUCCESS) {
      throw new BadRequestException(
        `User with account ${signUpDto.meterNo} is not approved yet`,
      );
    }

    const hashedPassword = await bcrypt.hash(signUpDto.password, 10);
    const userPassword = this.userPasswordRepository.create({
      account: existingUser.account,
      password: hashedPassword,
    });
    await this.userPasswordRepository.save(userPassword);
    return existingUser;
  }

  async signIn(signupDto: SignUpDto): Promise<User> {
    const user = await this.usersRepository.findOneBy({
      account: signupDto.meterNo,
    });
    if (!user) {
      throw new NotFoundException(
        `User with account ${signupDto.meterNo} doesn't exist`,
      );
    }
    if (user.status !== ApprovalStatus.SUCCESS) {
      throw new BadRequestException(
        `User with account ${signupDto.meterNo} is not approved yet`,
      );
    }
    const userPassword = await this.userPasswordRepository.findOneBy({
      account: user.account,
    });
    if (!userPassword) {
      throw new NotFoundException(
        `Password for user with account ${signupDto.meterNo} not found`,
      );
    }
    const isPasswordValid = await bcrypt.compare(
      signupDto.password,
      userPassword.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
    }
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['area', 'customerCategories'],
    });
  }

  async findOne(account: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { account },
      relations: ['area', 'customerCategories'],
    });

    if (!user) {
      throw new NotFoundException(`User with account ${account} not found`);
    }

    return user;
  }

  async findByArea(areaId: number): Promise<User[]> {
    return this.usersRepository.find({
      where: { areaId },
      relations: ['area', 'customerCategories'],
    });
  }

  async findByAccountType(accountType: string): Promise<User[]> {
    return this.usersRepository.find({
      where: { accountType: accountType as any },
      relations: ['area', 'customerCategories'],
    });
  }

  async findByCustomerCategory(customerCategory: string): Promise<User[]> {
    return this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.area', 'area')
      .leftJoinAndSelect('user.customerCategories', 'customerCategories')
      .where('customerCategories.customerCategory = :customerCategory', {
        customerCategory,
      })
      .distinct(true)
      .getMany();
  }

  async findHighCategoryUsersForAllAreas(): Promise<
    Array<{
      areaId: number;
      count: number;
      userIds: string[];
    }>
  > {
    const category = await this.tariffCategoryRepository.findOne({
      where: { isActive: true },
      order: { slNo: 'ASC', lowerRange: 'ASC' },
    });

    if (!category) {
      throw new NotFoundException('No active tariff category found');
    }

    if (category.lowerRange === null || category.lowerRange === undefined) {
      if (category.upperRange === null || category.upperRange === undefined) {
        throw new NotFoundException(
          'Active tariff category does not define a range',
        );
      }
    }

    const users = await this.usersRepository.find({
      relations: ['area', 'customerCategories'],
    });

    const matchedUsers = users.filter((user) =>
      this.matchesRange(category, this.calculateFactoredAreaSqft(user)),
    );

    const grouped = new Map<
      number,
      { areaId: number; count: number; userIds: string[] }
    >();

    for (const user of matchedUsers) {
      const areaId = user.areaId;
      const existing = grouped.get(areaId);
      if (existing) {
        existing.count += 1;
        existing.userIds.push(user.account);
      } else {
        grouped.set(areaId, {
          areaId,
          count: 1,
          userIds: [user.account],
        });
      }
    }

    return Array.from(grouped.values()).sort((a, b) => a.areaId - b.areaId);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { user, meterData } = this.userFactory.createNewUser(createUserDto);
    const { customerCategories } = createUserDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const savedUser = await queryRunner.manager.save(User, user);

      if (customerCategories?.length) {
        const categoryEntities = customerCategories.map((category) => ({
          account: savedUser.account,
          customerCategory: category.customerCategory,
          ratio: category.ratio,
        }));
        await queryRunner.manager.save(
          CustomerCategoryAssignment,
          categoryEntities,
        );
      }

      let savedMeter: Meter | undefined;
      if (meterData) {
        const meterWithAccount = {
          ...meterData,
          account: savedUser.account,
        };
        savedMeter = await queryRunner.manager.save(Meter, meterWithAccount);
      }

      await queryRunner.commitTransaction();

      // Log audit
      // await this.auditLogsService.logChange(
      //   savedUser.account,
      //   'Created User' + (savedMeter ? ' with Meter' : ''),
      //   'users',
      //   savedUser.account,
      //   null,
      //   createUserDto,
      // );

      return savedUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(account: string, updateUserDto: UpdateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOneBy({ account });

    if (!existingUser) {
      throw new NotFoundException(`User with account ${account} not found`);
    }

    // Store old data for audit
    const oldData = { ...existingUser };

    const { user: updatedUser, meterData } = this.userFactory.updateUser(
      updateUserDto,
      existingUser,
    );
    const { customerCategories } = updateUserDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const savedUser = await queryRunner.manager.save(User, updatedUser);

      if (customerCategories !== undefined) {
        await queryRunner.manager.delete(CustomerCategoryAssignment, {
          account,
        });

        if (customerCategories.length) {
          const categoryEntities = customerCategories.map((category) => ({
            account: savedUser.account,
            customerCategory: category.customerCategory,
            ratio: category.ratio,
          }));
          await queryRunner.manager.save(
            CustomerCategoryAssignment,
            categoryEntities,
          );
        }
      }

      if (meterData) {
        const existingMeters = await this.metersService.findByAccount(account);

        if (existingMeters && existingMeters.length > 0) {
          const meterToUpdate = {
            ...meterData,
            account: savedUser.account,
          };
          await queryRunner.manager.update(Meter, { account }, meterToUpdate);
        } else {
          const newMeter = {
            ...meterData,
            account: savedUser.account,
          };
          await queryRunner.manager.save(Meter, newMeter);
        }
      }

      await queryRunner.commitTransaction();

      // Log audit
      // await this.auditLogsService.logChange(
      //   account,
      //   'Updated User' + (meterData ? ' with Meter' : ''),
      //   'users',
      //   account,
      //   oldData,
      //   updateUserDto,
      // );

      return savedUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateStatus(
    account: string,
    activeStatus: ActiveStatus,
  ): Promise<User> {
    const existingUser = await this.usersRepository.findOneBy({ account });

    if (!existingUser) {
      throw new NotFoundException(`User with account ${account} not found`);
    }

    // Store old data for audit
    const oldData = { ...existingUser };

    // Update only the status
    existingUser.activeStatus = activeStatus;
    const savedUser = await this.usersRepository.save(existingUser);

    // Log audit
    // await this.auditLogsService.logChange(
    //   account,
    //   'Updated User Status',
    //   'users',
    //   account,
    //   oldData,
    //   { activeStatus },
    // );

    return savedUser;
  }

  async submitForApproval(account: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ account });
    if (!user) {
      throw new NotFoundException(`User with account ${account} not found`);
    }

    if (user.status !== ApprovalStatus.DRAFT) {
      throw new BadRequestException(
        'Only draft users can be submitted for approval',
      );
    }

    user.status = ApprovalStatus.PENDING;
    return this.usersRepository.save(user);
  }

  async approve(account: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ account });
    if (!user) {
      throw new NotFoundException(`User with account ${account} not found`);
    }

    if (user.status !== ApprovalStatus.PENDING) {
      throw new BadRequestException('Only pending users can be approved');
    }

    user.status = ApprovalStatus.SUCCESS;
    return this.usersRepository.save(user);
  }

  async reject(account: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ account });
    if (!user) {
      throw new NotFoundException(`User with account ${account} not found`);
    }

    if (user.status !== ApprovalStatus.PENDING) {
      throw new BadRequestException('Only pending users can be rejected');
    }

    user.status = ApprovalStatus.REJECT;
    return this.usersRepository.save(user);
  }

  async remove(account: string): Promise<void> {
    const user = await this.usersRepository.findOneBy({ account });

    if (!user) {
      throw new NotFoundException(`User with account ${account} not found`);
    }

    // Store data for audit
    const userData = { ...user };

    await this.usersRepository.delete(account);

    // Log audit
    // await this.auditLogsService.logChange(
    //   account,
    //   'Deleted User',
    //   'users',
    //   account,
    //   userData,
    //   null,
    // );
  }
}
