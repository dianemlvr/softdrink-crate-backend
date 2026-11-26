import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrateCondition, CrateReturn } from '../entities/crate-return.entity';
import { Store } from '../entities/store.entity';
import { User, UserRole } from '../entities/user.entity';
import { CreateCrateReturnDto } from './dto/create-crate-return.dto';
import { UpdateCrateReturnDto } from './dto/update-crate-return.dto';

@Injectable()
export class CrateReturnsService {
  constructor(
    @InjectRepository(CrateReturn)
    private readonly crateReturnRepository: Repository<CrateReturn>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private async adjustStoreCrateBalance(storeId: number, delta: number) {
    if (delta === 0) {
      return;
    }

    if (delta > 0) {
      await this.storeRepository.increment({ id: storeId }, 'crateBalance', delta);
      return;
    }

    const amountToSubtract = Math.abs(delta);
    await this.storeRepository
      .createQueryBuilder()
      .update(Store)
      .set({
        crateBalance: () =>
          `GREATEST(crateBalance - ${amountToSubtract}, 0)`,
      })
      .where('id = :id', { id: storeId })
      .execute();
  }

  async create(createCrateReturnDto: CreateCrateReturnDto) {
    const store = await this.storeRepository.findOne({
      where: { id: createCrateReturnDto.storeId },
    });
    if (!store) {
      throw new NotFoundException(
        `Store #${createCrateReturnDto.storeId} not found`,
      );
    }

    const driver = await this.userRepository.findOne({
      where: { id: createCrateReturnDto.assignedDriverId },
    });
    if (!driver) {
      throw new NotFoundException(
        `Driver #${createCrateReturnDto.assignedDriverId} not found`,
      );
    }
    if (driver.role !== UserRole.DRIVER) {
      throw new BadRequestException('Assigned user must have the driver role');
    }

    if (createCrateReturnDto.cratesReturned > store.crateBalance) {
      throw new BadRequestException(
        `Returned crates (${createCrateReturnDto.cratesReturned}) cannot exceed store crate balance (${store.crateBalance})`,
      );
    }

    const crateReturn = this.crateReturnRepository.create({
      storeId: store.id,
      assignedDriverId: driver.id,
      returnDate: new Date(createCrateReturnDto.returnDate),
      cratesReturned: createCrateReturnDto.cratesReturned,
      condition: createCrateReturnDto.condition ?? CrateCondition.GOOD,
      notes: createCrateReturnDto.notes ?? null,
    });

    const saved = await this.crateReturnRepository.save(crateReturn);
    await this.adjustStoreCrateBalance(
      saved.storeId,
      -saved.cratesReturned,
    );

    return saved;
  }

  async findAll(
    storeId?: number,
    assignedDriverId?: number,
    condition?: CrateCondition,
  ) {
    const query = this.crateReturnRepository
      .createQueryBuilder('crateReturn')
      .leftJoinAndSelect('crateReturn.store', 'store')
      .leftJoinAndSelect('crateReturn.assignedDriver', 'assignedDriver')
      .orderBy('crateReturn.createdAt', 'DESC');

    if (storeId) {
      query.andWhere('crateReturn.storeId = :storeId', { storeId });
    }
    if (assignedDriverId) {
      query.andWhere('crateReturn.assignedDriverId = :assignedDriverId', {
        assignedDriverId,
      });
    }
    if (condition) {
      query.andWhere('crateReturn.condition = :condition', { condition });
    }

    return query.getMany();
  }

  async findOne(id: number) {
    const crateReturn = await this.crateReturnRepository.findOne({
      where: { id },
      relations: {
        store: true,
        assignedDriver: true,
      },
    });

    if (!crateReturn) {
      throw new NotFoundException(`CrateReturn #${id} not found`);
    }

    return crateReturn;
  }

  async update(id: number, updateCrateReturnDto: UpdateCrateReturnDto) {
    const crateReturn = await this.findOne(id);
    const oldStoreId = crateReturn.storeId;
    const oldCratesReturned = crateReturn.cratesReturned;

    let targetStore = crateReturn.store;
    if (updateCrateReturnDto.storeId !== undefined) {
      const store = await this.storeRepository.findOne({
        where: { id: updateCrateReturnDto.storeId },
      });
      if (!store) {
        throw new NotFoundException(
          `Store #${updateCrateReturnDto.storeId} not found`,
        );
      }
      targetStore = store;
      crateReturn.storeId = store.id;
    }

    if (updateCrateReturnDto.assignedDriverId !== undefined) {
      const driver = await this.userRepository.findOne({
        where: { id: updateCrateReturnDto.assignedDriverId },
      });
      if (!driver) {
        throw new NotFoundException(
          `Driver #${updateCrateReturnDto.assignedDriverId} not found`,
        );
      }
      if (driver.role !== UserRole.DRIVER) {
        throw new BadRequestException('Assigned user must have the driver role');
      }
      crateReturn.assignedDriverId = driver.id;
    }

    if (updateCrateReturnDto.returnDate !== undefined) {
      crateReturn.returnDate = new Date(updateCrateReturnDto.returnDate);
    }
    if (updateCrateReturnDto.cratesReturned !== undefined) {
      crateReturn.cratesReturned = updateCrateReturnDto.cratesReturned;
    }
    if (updateCrateReturnDto.condition !== undefined) {
      crateReturn.condition = updateCrateReturnDto.condition;
    }
    if (updateCrateReturnDto.notes !== undefined) {
      crateReturn.notes = updateCrateReturnDto.notes;
    }

    const availableBalance =
      oldStoreId === crateReturn.storeId
        ? targetStore.crateBalance + oldCratesReturned
        : targetStore.crateBalance;

    if (crateReturn.cratesReturned > availableBalance) {
      throw new BadRequestException(
        `Returned crates (${crateReturn.cratesReturned}) cannot exceed available store crate balance (${availableBalance})`,
      );
    }

    const updated = await this.crateReturnRepository.save(crateReturn);

    if (oldStoreId === updated.storeId) {
      await this.adjustStoreCrateBalance(
        updated.storeId,
        oldCratesReturned - updated.cratesReturned,
      );
    } else {
      await this.adjustStoreCrateBalance(oldStoreId, oldCratesReturned);
      await this.adjustStoreCrateBalance(
        updated.storeId,
        -updated.cratesReturned,
      );
    }

    return updated;
  }

  async remove(id: number): Promise<void> {
    const crateReturn = await this.findOne(id);
    await this.adjustStoreCrateBalance(
      crateReturn.storeId,
      crateReturn.cratesReturned,
    );
    await this.crateReturnRepository.remove(crateReturn);
  }
}