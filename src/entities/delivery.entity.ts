import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { Store } from './store.entity';
  import { User } from './user.entity';
  
  export enum DeliveryStatus {
    PENDING = 'pending',
    IN_TRANSIT = 'in_transit',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled',
  }
  
  @Entity('deliveries')
  export class Delivery {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => Store, (store) => store.deliveries, {
      nullable: false,
      onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'storeId' })
    store: Store;
  
    @Column({ type: 'int' })
    storeId: number;
  
    @ManyToOne(() => User, (user) => user.deliveriesAsDriver, {
      nullable: true,
      onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'driverId' })
    driver: User | null;
  
    @Column({ type: 'int', nullable: true })
    driverId: number | null;
  
    @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'createdById' })
    createdBy: User;
  
    @Column({ type: 'int' })
    createdById: number;
  
    @Column({ type: 'datetime' })
    deliveryDate: Date;
  
    @Column({ type: 'varchar', length: 255 })
    softdrinksDetails: string;
  
    @Column({ type: 'int' })
    quantityDelivered: number;
  
    @Column({ type: 'int' })
    cratesDelivered: number;
  
    @Column({ type: 'enum', enum: DeliveryStatus, default: DeliveryStatus.PENDING })
    status: DeliveryStatus;
  
    @Column({ type: 'datetime', nullable: true })
    confirmedAt: Date | null;
  
    @Column({ type: 'text', nullable: true })
    remarks: string | null;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }