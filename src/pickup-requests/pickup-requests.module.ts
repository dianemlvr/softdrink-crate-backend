import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PickupRequestsService } from './pickup-requests.service';
import { PickupRequestsController } from './pickup-requests.controller';
import { PickupRequest } from '../entities/pickup-request.entity';
import { Store } from '../entities/store.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PickupRequest, Store, User])],
  controllers: [PickupRequestsController],
  providers: [PickupRequestsService],
  exports: [PickupRequestsService],
})
export class PickupRequestsModule {}