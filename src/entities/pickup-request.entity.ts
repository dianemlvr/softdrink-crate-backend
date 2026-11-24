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
  
  export enum PickupStatus {
    PENDING = 'pending',
    ASSIGNED = 'assigned',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
  }
  
  @Entity('pickup_requests')
  export class PickupRequest {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => Store, (store) => store.pickupRequests, {
      nullable: false,
      onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'storeId' })
    store: Store;
  
    @Column({ type: 'int' })
    storeId: number;
  
    @ManyToOne(() => User, (user) => user.pickupRequests, {
      nullable: false,
      onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'requestedById' })
    requestedBy: User;
  
    @Column({ type: 'int' })
    requestedById: number;
  
    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'assignedDriverId' })
    assignedDriver: User | null;
  
    @Column({ type: 'int', nullable: true })
    assignedDriverId: number | null;
  
    @Column({ type: 'int' })
    estimatedEmptyCrates: number;
  
    @Column({ type: 'datetime', nullable: true })
    requestedPickupDate: Date | null;
  
    @Column({ type: 'enum', enum: PickupStatus, default: PickupStatus.PENDING })
    status: PickupStatus;
  
    @Column({ type: 'text', nullable: true })
    notes: string | null;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }