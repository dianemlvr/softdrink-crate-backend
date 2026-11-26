import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CrateReturnsModule } from './crate-returns/crate-returns.module';
import { DeliveriesModule } from './deliveries/deliveries.module';
import { CrateReturn } from './entities/crate-return.entity';
import { Delivery } from './entities/delivery.entity';
import { PickupRequest } from './entities/pickup-request.entity';
import { Store } from './entities/store.entity';
import { User } from './entities/user.entity';
import { PickupRequestsModule } from './pickup-requests/pickup-requests.module';
import { StoresModule } from './stores/stores.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST') || '127.0.0.1',
        port: Number(configService.get<string>('DB_PORT') || 3306),
        username: configService.get<string>('DB_USERNAME') || 'root',
        password: configService.get<string>('DB_PASSWORD') || '',
        database: configService.get<string>('DB_DATABASE') || 'softdrink_crate_db',
        entities: [User, Store, Delivery, CrateReturn, PickupRequest],
        synchronize: true,
      }),
    }),
    UsersModule,
    AuthModule,
    StoresModule,
    DeliveriesModule,
    PickupRequestsModule,
    CrateReturnsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}