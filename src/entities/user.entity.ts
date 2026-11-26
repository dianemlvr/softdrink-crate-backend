import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Store } from './store.entity';
import { Delivery } from './delivery.entity';
import { CrateReturn } from './crate-return.entity';
import { PickupRequest } from './pickup-request.entity';

export enum UserRole {
  LOGISTICS_MANAGER = 'logistics_manager',
  DRIVER = 'driver',
  STORE_OWNER = 'store_owner',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  fullName: string;

  @Column({ unique: true, length: 120 })
  email: string;

  @Column()
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STORE_OWNER,
  })
  role: UserRole;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneNumber: string | null;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Store, (store) => store.owner)
  stores: Store[];

  @OneToMany(() => Delivery, (delivery) => delivery.assignedDriver)
  deliveriesAsDriver: Delivery[];

  @OneToMany(() => CrateReturn, (crateReturn) => crateReturn.assignedDriver)
  crateReturnsAsDriver: CrateReturn[];

  @OneToMany(() => PickupRequest, (pickupRequest) => pickupRequest.requester)
  pickupRequests: PickupRequest[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}