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
  
  export enum CrateCondition {
    GOOD = 'good',
    DAMAGED = 'damaged',
    MISSING = 'missing',
  }
  
  @Entity('crate_returns')
  export class CrateReturn {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => Store, (store) => store.crateReturns, {
      nullable: false,
      onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'storeId' })
    store: Store;
  
    @Column({ type: 'int' })
    storeId: number;
  
    @ManyToOne(() => User, (user) => user.crateReturnsAsDriver, {
      nullable: false,
      onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'driverId' })
    driver: User;
  
    @Column({ type: 'int' })
    driverId: number;
  
    @Column({ type: 'datetime' })
    returnDate: Date;
  
    @Column({ type: 'int' })
    cratesReturned: number;
  
    @Column({ type: 'enum', enum: CrateCondition, default: CrateCondition.GOOD })
    condition: CrateCondition;
  
    @Column({ type: 'text', nullable: true })
    notes: string | null;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }