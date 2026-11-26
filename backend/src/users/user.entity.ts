import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Area } from '../area/area.entity';
import { CustomerCategoryAssignment } from '../customer-categories/customer-category.entity';
import { CustomerCategory } from '../common/enums/customer-category.enum';

export enum AccountType {
  GENERAL = 'General',
  TUBEWELL = 'Tubewell',
}

export enum ActiveStatus {
  INACTIVE = 'Inactive',
  ACTIVE = 'Active',
}

export enum ApprovalStatus {
  DRAFT = 'Draft',
  PENDING = 'Pending',
  SUCCESS = 'Success',
  REJECT = 'Reject',
}

export enum WaterStatus {
  METERED = 'Metered',
  METER_TEMPORARILY_DISCONNECTED = 'Meter Temporarilly Disconnected',
  NON_METERED = 'Non-Metered',
  CONNECTED = 'Connected',
  NOT_CONNECTED = 'Not-connected',
}

export enum MeterStatus {
  FUNCTIONAL = 'Functional',
  NON_FUNCTIONAL = 'Non-Functional',
  STOLEN = 'Stolen',
  NOT_APPLICABLE = 'N/A',
}

export enum SewerStatus {
  CONNECTED = 'Connected',
  NOT_CONNECTED = 'Not Connected',
  WITHIN_100_FEET = 'Within 100 feet',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  account: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  address: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'land_size_decimal',
    nullable: false,
  })
  landSizeDecimal: number;

  @Column({ type: 'integer', name: 'number_of_stories', nullable: false })
  numberOfStories: number;

  @Column({ type: 'integer', name: 'number_of_flats', nullable: false })
  numberOfFlats: number;

  @Column({ type: 'integer', name: 'inspCode', nullable: false })
  inspCode: number;

  @Column({ type: 'integer', name: 'areaId', nullable: false })
  areaId: number;

  @ManyToOne(() => Area)
  @JoinColumn({ name: 'areaId' })
  area: Area;

  @Column({
    type: 'enum',
    enum: AccountType,
    name: 'accountType',
    nullable: false,
  })
  accountType: AccountType;

  @Column({
    type: 'enum',
    enum: ActiveStatus,
    name: 'activeStatus',
    nullable: false,
  })
  activeStatus: ActiveStatus;

  @Column({
    type: 'enum',
    enum: ApprovalStatus,
    name: 'status',
    default: ApprovalStatus.DRAFT,
  })
  status: ApprovalStatus;

  @Column({
    type: 'enum',
    enum: WaterStatus,
    name: 'waterStatus',
    nullable: false,
  })
  waterStatus: WaterStatus;

  @Column({
    type: 'enum',
    enum: SewerStatus,
    name: 'sewerStatus',
    nullable: false,
  })
  sewerStatus: SewerStatus;

  @OneToMany(
    () => CustomerCategoryAssignment,
    (customerCategory) => customerCategory.user,
  )
  customerCategories: CustomerCategoryAssignment[];
}
