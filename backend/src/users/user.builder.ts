import { User, ActiveStatus, ApprovalStatus } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateMeterDto } from '../meters/dto/create-meter.dto';

export class UserBuilder {
  private user: Partial<User>;
  private meterData: CreateMeterDto | null = null;

  constructor() {
    this.user = {};
  }

  withAccount(account: string): UserBuilder {
    this.user.account = account;
    return this;
  }

  withName(name: string): UserBuilder {
    this.user.name = name;
    return this;
  }

  withAddress(address?: string): UserBuilder {
    this.user.address = address;
    return this;
  }

  withLandSizeDecimal(landSizeDecimal: number): UserBuilder {
    this.user.landSizeDecimal = landSizeDecimal;
    return this;
  }

  withNumberOfStories(numberOfStories: number): UserBuilder {
    this.user.numberOfStories = numberOfStories;
    return this;
  }

  withNumberOfFlats(numberOfFlats: number): UserBuilder {
    this.user.numberOfFlats = numberOfFlats;
    return this;
  }

  withAreaId(areaId: number): UserBuilder {
    this.user.areaId = areaId;
    return this;
  }

  withAccountType(accountType: any): UserBuilder {
    this.user.accountType = accountType;
    return this;
  }

  withActiveStatus(status: ActiveStatus): UserBuilder {
    this.user.activeStatus = status;
    return this;
  }

  withDefaultActiveStatus(): UserBuilder {
    this.user.activeStatus = ActiveStatus.INACTIVE;
    return this;
  }

  withApprovalStatus(status: ApprovalStatus): UserBuilder {
    this.user.status = status;
    return this;
  }

  withDefaultApprovalStatus(): UserBuilder {
    this.user.status = ApprovalStatus.DRAFT;
    return this;
  }

  withInspCode(inspCode: number): UserBuilder {
    this.user.inspCode = inspCode;
    return this;
  }

  withWaterStatus(waterStatus: any): UserBuilder {
    this.user.waterStatus = waterStatus;
    return this;
  }

  withSewerStatus(sewerStatus: any): UserBuilder {
    this.user.sewerStatus = sewerStatus;
    return this;
  }

  fromDto(dto: CreateUserDto): UserBuilder {
    if (dto.meter) {
      this.meterData = dto.meter;
    }

    return this.withName(dto.name)
      .withAddress(dto.address)
      .withLandSizeDecimal(dto.landSizeDecimal)
      .withNumberOfStories(dto.numberOfStories)
      .withNumberOfFlats(dto.numberOfFlats)
      .withInspCode(dto.inspCode)
      .withAreaId(dto.areaId)
      .withAccountType(dto.accountType)
      .withWaterStatus(dto.waterStatus)
      .withSewerStatus(dto.sewerStatus);
  }

  withMeterData(meterDto: CreateMeterDto): UserBuilder {
    this.meterData = meterDto;
    return this;
  }

  build(): Partial<User> {
    return { ...this.user };
  }

  getMeterData(): CreateMeterDto | null {
    return this.meterData;
  }

  hasMeterData(): boolean {
    return this.meterData !== null;
  }

  reset(): UserBuilder {
    this.user = {};
    this.meterData = null;
    return this;
  }

  fromUpdateDto(dto: Partial<any>, existingUser: User): UserBuilder {
    this.user = { ...existingUser };

    if (dto.name !== undefined) this.user.name = dto.name;
    if (dto.address !== undefined) this.user.address = dto.address;
    if (dto.landSizeDecimal !== undefined)
      this.user.landSizeDecimal = dto.landSizeDecimal;
    if (dto.numberOfStories !== undefined)
      this.user.numberOfStories = dto.numberOfStories;
    if (dto.numberOfFlats !== undefined)
      this.user.numberOfFlats = dto.numberOfFlats;
    if (dto.inspCode !== undefined) this.user.inspCode = dto.inspCode;
    if (dto.areaId !== undefined) this.user.areaId = dto.areaId;
    if (dto.accountType !== undefined) this.user.accountType = dto.accountType;
    if (dto.activeStatus !== undefined)
      this.user.activeStatus = dto.activeStatus;
    if (dto.status !== undefined) this.user.status = dto.status;
    if (dto.waterStatus !== undefined) this.user.waterStatus = dto.waterStatus;
    if (dto.sewerStatus !== undefined) this.user.sewerStatus = dto.sewerStatus;

    if (dto.meter !== undefined) {
      this.meterData = dto.meter;
    }

    return this;
  }
}
