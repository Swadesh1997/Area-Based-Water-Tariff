import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create(
      createNotificationDto,
    );
    return this.notificationRepository.save(notification);
  }

  async findAll(): Promise<Notification[]> {
    return this.notificationRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUser(account: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { userAccount: account },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(status: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { status },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findUnreadByUser(account: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { userAccount: account, status: 'Unread' },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  async update(
    id: number,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<Notification> {
    const notification = await this.findOne(id);
    Object.assign(notification, updateNotificationDto);
    return this.notificationRepository.save(notification);
  }

  async markAsRead(id: number): Promise<Notification> {
    return this.update(id, { status: 'Read' });
  }

  async markAllAsRead(account: string): Promise<void> {
    await this.notificationRepository.update(
      { userAccount: account, status: 'Unread' },
      { status: 'Read' },
    );
  }

  async remove(id: number): Promise<void> {
    const result = await this.notificationRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
  }

  async getUnreadCount(account: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userAccount: account, status: 'Unread' },
    });
  }
}
