import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
  } from 'typeorm';
  import { User } from './user.entity';
  import { Delivery } from './delivery.entity';
  import { CrateReturn } from './crate-return.entity';
  import { PickupRequest } from './pickup-request.entity';
  
  @Entity('stores')
  export class Store {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ length: 120 })
    storeName: string;
  
    @Column({ type: 'text' })
    address: string;
  
    @Column({ type: 'varchar', length: 100, nullable: true })
    contactPerson: string | null;
  
    @Column({ type: 'varchar', length: 20, nullable: true })
    contactNumber: string | null;
  
    @Column({ type: 'int', default: 0 })
    crateBalance: number;
  
    @ManyToOne(() => User, (user) => user.stores, {
      nullable: false,
      onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'ownerId' })
    owner: User;
  
    @Column({ type: 'int' })
    ownerId: number;
  
    @OneToMany(() => Delivery, (delivery) => delivery.store)
    deliveries: Delivery[];
  
    @OneToMany(() => CrateReturn, (crateReturn) => crateReturn.store)
    crateReturns: CrateReturn[];
  
    @OneToMany(() => PickupRequest, (pickupRequest) => pickupRequest.store)
    pickupRequests: PickupRequest[];
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }