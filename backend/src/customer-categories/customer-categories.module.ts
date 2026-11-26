import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerCategoriesController } from './customer-categories.controller';
import { CustomerCategoriesService } from './customer-categories.service';
import { CustomerCategoryAssignment } from './customer-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerCategoryAssignment])],
  controllers: [CustomerCategoriesController],
  providers: [CustomerCategoriesService],
  exports: [CustomerCategoriesService],
})
export class CustomerCategoriesModule {}
