import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Delivery, DeliveryStatus } from '../entities/delivery.entity';
import { Store } from '../entities/store.entity';
import { User, UserRole } from '../entities/user.entity';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';

@Injectable()
export class DeliveriesService {
  constructor(
    @InjectRepository(Delivery)
    private readonly deliveryRepository: Repository<Delivery>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createDeliveryDto: CreateDeliveryDto, createdByUserId: number) {
    const store = await this.storeRepository.findOne({
      where: { id: createDeliveryDto.storeId },
    });
    if (!store) {
      throw new NotFoundException(`Store #${createDeliveryDto.storeId} not found`);
    }

    let driver: User | null = null;
    if (createDeliveryDto.assignedDriverId !== undefined) {
      driver = await this.userRepository.findOne({
        where: { id: createDeliveryDto.assignedDriverId },
      });
      if (!driver) {
        throw new NotFoundException(
          `Driver #${createDeliveryDto.assignedDriverId} not found`,
        );
      }
      if (driver.role !== UserRole.DRIVER) {
        throw new BadRequestException('Assigned user must have the driver role');
      }
    }

    const creator = await this.userRepository.findOne({
      where: { id: createdByUserId },
    });
    if (!creator) {
      throw new NotFoundException(`Creator user #${createdByUserId} not found`);
    }

    const delivery = this.deliveryRepository.create({
      storeId: store.id,
      assignedDriverId: driver ? driver.id : null,
      createdByUserId: creator.id,
      deliveryDate: new Date(createDeliveryDto.deliveryDate),
      softdrinksDetails: createDeliveryDto.softdrinksDetails,
      quantityDelivered: createDeliveryDto.quantityDelivered,
      cratesDelivered: createDeliveryDto.cratesDelivered,
      deliveryStatus: DeliveryStatus.PENDING,
      confirmedAt: null,
      remarks: createDeliveryDto.remarks ?? null,
    });

    return this.deliveryRepository.save(delivery);
  }

  async findAll(
    deliveryStatus?: DeliveryStatus,
    storeId?: number,
    assignedDriverId?: number,
  ) {
    const query = this.deliveryRepository
      .createQueryBuilder('delivery')
      .leftJoinAndSelect('delivery.store', 'store')
      .leftJoinAndSelect('delivery.assignedDriver', 'assignedDriver')
      .leftJoinAndSelect('delivery.createdByUser', 'createdByUser')
      .orderBy('delivery.createdAt', 'DESC');

    if (deliveryStatus) {
      query.andWhere('delivery.deliveryStatus = :deliveryStatus', {
        deliveryStatus,
      });
    }
    if (storeId) {
      query.andWhere('delivery.storeId = :storeId', { storeId });
    }
    if (assignedDriverId) {
      query.andWhere('delivery.assignedDriverId = :assignedDriverId', {
        assignedDriverId,
      });
    }

    return query.getMany();
  }

  async findOne(id: number) {
    const delivery = await this.deliveryRepository.findOne({
      where: { id },
      relations: {
        store: true,
        assignedDriver: true,
        createdByUser: true,
      },
    });

    if (!delivery) {
      throw new NotFoundException(`Delivery #${id} not found`);
    }

    return delivery;
  }

  async update(id: number, updateDeliveryDto: UpdateDeliveryDto) {
    const delivery = await this.findOne(id);
    const previousStatus = delivery.deliveryStatus;

    if (updateDeliveryDto.storeId !== undefined) {
      const store = await this.storeRepository.findOne({
        where: { id: updateDeliveryDto.storeId },
      });
      if (!store) {
        throw new NotFoundException(`Store #${updateDeliveryDto.storeId} not found`);
      }
      delivery.storeId = store.id;
    }

    if (updateDeliveryDto.assignedDriverId !== undefined) {
      const driver = await this.userRepository.findOne({
        where: { id: updateDeliveryDto.assignedDriverId },
      });
      if (!driver) {
        throw new NotFoundException(
          `Driver #${updateDeliveryDto.assignedDriverId} not found`,
        );
      }
      if (driver.role !== UserRole.DRIVER) {
        throw new BadRequestException('Assigned user must have the driver role');
      }
      delivery.assignedDriverId = driver.id;
    }

    if (updateDeliveryDto.deliveryDate !== undefined) {
      delivery.deliveryDate = new Date(updateDeliveryDto.deliveryDate);
    }
    if (updateDeliveryDto.softdrinksDetails !== undefined) {
      delivery.softdrinksDetails = updateDeliveryDto.softdrinksDetails;
    }
    if (updateDeliveryDto.quantityDelivered !== undefined) {
      delivery.quantityDelivered = updateDeliveryDto.quantityDelivered;
    }
    if (updateDeliveryDto.cratesDelivered !== undefined) {
      delivery.cratesDelivered = updateDeliveryDto.cratesDelivered;
    }
    if (updateDeliveryDto.remarks !== undefined) {
      delivery.remarks = updateDeliveryDto.remarks;
    }

    if (updateDeliveryDto.deliveryStatus !== undefined) {
      delivery.deliveryStatus = updateDeliveryDto.deliveryStatus;

      if (
        updateDeliveryDto.deliveryStatus === DeliveryStatus.DELIVERED &&
        previousStatus !== DeliveryStatus.DELIVERED
      ) {
        delivery.confirmedAt = updateDeliveryDto.confirmedAt
          ? new Date(updateDeliveryDto.confirmedAt)
          : new Date();

        await this.storeRepository.increment(
          { id: delivery.storeId },
          'crateBalance',
          delivery.cratesDelivered,
        );
      }
    } else if (updateDeliveryDto.confirmedAt !== undefined) {
      delivery.confirmedAt = new Date(updateDeliveryDto.confirmedAt);
    }

    return this.deliveryRepository.save(delivery);
  }

  async remove(id: number): Promise<void> {
    const delivery = await this.findOne(id);
    await this.deliveryRepository.remove(delivery);
  }
}