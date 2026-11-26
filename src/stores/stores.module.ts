import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from '../entities/store.entity';
import { User } from '../entities/user.entity';
import { StoresService } from './stores.service';
import { StoresController } from './stores.controller';
import { DeliveriesModule } from '../deliveries/deliveries.module';
import { CrateReturnsModule } from '../crate-returns/crate-returns.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Store, User]),
    forwardRef(() => DeliveriesModule),
    forwardRef(() => CrateReturnsModule),
  ],
  controllers: [StoresController],
  providers: [StoresService],
  exports: [StoresService, TypeOrmModule],
})
export class StoresModule {}