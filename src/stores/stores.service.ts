import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from '../entities/store.entity';
import { User } from '../entities/user.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private readonly storesRepository: Repository<Store>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createStoreDto: CreateStoreDto): Promise<Store> {
    const owner = await this.userRepository.findOne({
      where: { id: createStoreDto.ownerId },
    });
    if (!owner) {
      throw new NotFoundException(`Owner user #${createStoreDto.ownerId} not found`);
    }

    const store = this.storesRepository.create({
      storeName: createStoreDto.storeName,
      address: createStoreDto.address,
      contactPerson: createStoreDto.contactPerson ?? null,
      contactNumber: createStoreDto.contactNumber ?? null,
      ownerId: owner.id,
    });

    return this.storesRepository.save(store);
  }

  async findAll(ownerId?: number): Promise<Store[]> {
    if (ownerId) {
      return this.storesRepository.find({
        where: { ownerId },
        relations: { owner: true },
        order: { id: 'DESC' },
      });
    }
    return this.storesRepository.find({
      relations: { owner: true },
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Store> {
    const store = await this.storesRepository.findOne({
      where: { id },
      relations: { owner: true },
    });
    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }
    return store;
  }

  async update(id: number, updateStoreDto: UpdateStoreDto): Promise<Store> {
    const store = await this.findOne(id);

    if (updateStoreDto.ownerId !== undefined) {
      const owner = await this.userRepository.findOne({
        where: { id: updateStoreDto.ownerId },
      });
      if (!owner) {
        throw new NotFoundException(
          `Owner user #${updateStoreDto.ownerId} not found`,
        );
      }
      store.ownerId = owner.id;
    }

    if (updateStoreDto.storeName !== undefined) {
      store.storeName = updateStoreDto.storeName;
    }
    if (updateStoreDto.address !== undefined) {
      store.address = updateStoreDto.address;
    }
    if (updateStoreDto.contactPerson !== undefined) {
      store.contactPerson = updateStoreDto.contactPerson;
    }
    if (updateStoreDto.contactNumber !== undefined) {
      store.contactNumber = updateStoreDto.contactNumber;
    }

    return this.storesRepository.save(store);
  }

  async remove(id: number): Promise<void> {
    const store = await this.findOne(id);
    await this.storesRepository.remove(store);
  }
}