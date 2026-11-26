import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, ActiveStatus } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateMeterDto } from '../meters/dto/create-meter.dto';
import { UserBuilder } from './user.builder';
import { UpdateUserDto } from './dto/update-user.dto';

export interface UserCreationResult {
  user: User;
  meterData?: CreateMeterDto;
}

@Injectable()
export class UserFactory {
  private builder: UserBuilder;

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    this.builder = new UserBuilder();
  }

  createNewUser(createUserDto: CreateUserDto): UserCreationResult {
    this.builder
      .reset()
      .fromDto(createUserDto)
      .withDefaultActiveStatus()
      .withDefaultApprovalStatus();

    const userData = this.builder.build();
    const user = this.usersRepository.create(userData);

    const meterData = this.builder.getMeterData();

    return {
      user,
      meterData: meterData || undefined,
    };
  }

  createUserWithStatus(
    createUserDto: CreateUserDto,
    status: ActiveStatus,
  ): UserCreationResult {
    this.builder.reset().fromDto(createUserDto).withActiveStatus(status);

    const userData = this.builder.build();
    const user = this.usersRepository.create(userData);

    const meterData = this.builder.getMeterData();

    return {
      user,
      meterData: meterData || undefined,
    };
  }

  createCustomUser(builderFn: (builder: UserBuilder) => UserBuilder): User {
    const userData = builderFn(this.builder.reset()).build();
    return this.usersRepository.create(userData);
  }

  updateUser(
    updateDto: Partial<UpdateUserDto>,
    existingUser: User,
  ): UserCreationResult {
    this.builder.reset().fromUpdateDto(updateDto, existingUser);
    const userData = this.builder.build();
    const user = this.usersRepository.create(userData);

    const meterData = this.builder.getMeterData();

    return {
      user,
      meterData: meterData || undefined,
    };
  }
}
