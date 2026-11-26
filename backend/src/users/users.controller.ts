import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { AccountType, User } from './user.entity';
import { CustomerCategory } from '../common/enums/customer-category.enum';
import { SignUpDto } from './dto/sign-up.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description:
      'Retrieve all users, optionally filtered by zone, ward, or status',
  })
  @ApiQuery({
    name: 'areaId',
    required: false,
    description: 'Filter by area ID',
    type: Number,
  })
  @ApiQuery({
    name: 'accountType',
    required: false,
    description: 'Filter by account type',
    enum: ['General', 'Tubewell'],
  })
  @ApiQuery({
    name: 'customerCategory',
    required: false,
    description: 'Filter by customer category',
    enum: ['Domestic', 'Commercial', 'Industrial', 'Government', 'Community'],
  })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async findAll(
    @Query('areaId') areaId?: string,
    @Query('accountType') accountType?: AccountType,
    @Query('customerCategory') customerCategory?: CustomerCategory,
  ): Promise<User[]> {
    if (areaId) {
      return this.usersService.findByArea(parseInt(areaId));
    }
    if (accountType) {
      return this.usersService.findByAccountType(accountType);
    }
    if (customerCategory) {
      return this.usersService.findByCustomerCategory(customerCategory);
    }
    return this.usersService.findAll();
  }

  @Get('high')
  @ApiOperation({
    summary: 'Get high category users for all areas',
    description: 'Uses the lowest active tariff category range to select users',
  })
  @ApiResponse({
    status: 200,
    description: 'High category users retrieved successfully',
  })
  async findHighCategoryUsers(): Promise<
    Array<{
      areaId: number;
      count: number;
      userIds: string[];
    }>
  > {
    return this.usersService.findHighCategoryUsersForAllAreas();
  }

  @Get(':account')
  @ApiOperation({
    summary: 'Get user by account number',
    description: 'Retrieve a specific user by their account number',
  })
  @ApiParam({ name: 'account', description: 'Account UUID', type: String })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('account') account: string): Promise<User> {
    return this.usersService.findOne(account);
  }

  @Post('sign-up')
  async signUp(@Body() signUpDto: SignUpDto): Promise<User> {
    return this.usersService.signUp(signUpDto);
  }

  @Post('sign-in')
  async signIn(@Body() signUpDto: SignUpDto): Promise<User> {
    return this.usersService.signIn(signUpDto);
  }

  @Post()
  @ApiOperation({
    summary: 'Create new user',
    description: 'Create a new user account',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or duplicate account number',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Put(':account')
  @ApiOperation({
    summary: 'Update user',
    description: "Update an existing user's information",
  })
  @ApiParam({ name: 'account', description: 'Account UUID', type: String })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('account') account: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(account, updateUserDto);
  }

  @Put(':account/status')
  @ApiOperation({
    summary: 'Update user status',
    description: "Update user's active status (Active/Inactive)",
  })
  @ApiParam({ name: 'account', description: 'Account UUID', type: String })
  @ApiBody({ type: UpdateStatusDto })
  @ApiResponse({ status: 200, description: 'User status updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateStatus(
    @Param('account') account: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ): Promise<User> {
    return this.usersService.updateStatus(
      account,
      updateStatusDto.activeStatus,
    );
  }

  @Patch(':account/approval')
  @ApiOperation({
    summary: 'Submit user for approval',
    description: 'Move user status from Draft to Pending',
  })
  @ApiParam({ name: 'account', description: 'Account UUID', type: String })
  @ApiResponse({ status: 200, description: 'User submitted for approval' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async submitForApproval(@Param('account') account: string): Promise<User> {
    return this.usersService.submitForApproval(account);
  }

  @Patch(':account/approve')
  @ApiOperation({
    summary: 'Approve user',
    description: 'Move user status from Pending to Success',
  })
  @ApiParam({ name: 'account', description: 'Account UUID', type: String })
  @ApiResponse({ status: 200, description: 'User approved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async approve(@Param('account') account: string): Promise<User> {
    return this.usersService.approve(account);
  }

  @Patch(':account/reject')
  @ApiOperation({
    summary: 'Reject user',
    description: 'Move user status from Pending to Reject',
  })
  @ApiParam({ name: 'account', description: 'Account UUID', type: String })
  @ApiResponse({ status: 200, description: 'User rejected successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async reject(@Param('account') account: string): Promise<User> {
    return this.usersService.reject(account);
  }

  @Delete(':account')
  @ApiOperation({
    summary: 'Delete user',
    description: 'Remove a user from the system',
  })
  @ApiParam({ name: 'account', description: 'Account UUID', type: String })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('account') account: string): Promise<void> {
    return this.usersService.remove(account);
  }
}
