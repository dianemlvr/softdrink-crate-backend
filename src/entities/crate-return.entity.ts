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
  @JoinColumn({ name: 'assignedDriverId' })
  assignedDriver: User;

  @Column({ type: 'int' })
  assignedDriverId: number;

  @Column({ type: 'datetime' })
  returnDate: Date;

  @Column({ type: 'int' })
  cratesReturned: number;

  @Column({ type: 'enum', enum: CrateCondition, default: CrateCondition.GOOD })
  condition: CrateCondition;

  @Column({ type: 'varchar', length: 255, nullable: true })
  notes: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}