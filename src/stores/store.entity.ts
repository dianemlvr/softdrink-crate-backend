import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  
  @Entity('stores')
  export class Store {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ length: 150 })
    storeName: string;
  
    @Column({ length: 120 })
    ownerName: string;
  
    @Column({ length: 20 })
    contactNumber: string;
  
    @Column({ type: 'text' })
    address: string;
  
    @Column({ length: 100, nullable: true })
    barangay: string;
  
    @Column({ type: 'int', default: 0 })
    crateBalance: number;
  
    @Column({ default: true })
    isActive: boolean;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }