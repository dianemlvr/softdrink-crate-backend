import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrateReturnsService } from './crate-returns.service';
import { CrateReturnsController } from './crate-returns.controller';
import { CrateReturn } from '../entities/crate-return.entity';
import { Store } from '../entities/store.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CrateReturn, Store, User])],
  controllers: [CrateReturnsController],
  providers: [CrateReturnsService],
  exports: [CrateReturnsService],
})
export class CrateReturnsModule {}