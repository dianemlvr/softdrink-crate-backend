import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PickupRequest,
  PickupStatus,
} from '../entities/pickup-request.entity';
import { Store } from '../entities/store.entity';
import { User, UserRole } from '../entities/user.entity';
import { CreatePickupRequestDto } from './dto/create-pickup-request.dto';
import { UpdatePickupRequestDto } from './dto/update-pickup-request.dto';

@Injectable()
export class PickupRequestsService {
  constructor(
    @InjectRepository(PickupRequest)
    private readonly pickupRequestRepository: Repository<PickupRequest>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    createPickupRequestDto: CreatePickupRequestDto,
    requesterId: number,
  ) {
    const store = await this.storeRepository.findOne({
      where: { id: createPickupRequestDto.storeId },
    });
    if (!store) {
      throw new NotFoundException(
        `Store #${createPickupRequestDto.storeId} not found`,
      );
    }

    const requester = await this.userRepository.findOne({
      where: { id: requesterId },
    });
    if (!requester) {
      throw new NotFoundException(`Requester user #${requesterId} not found`);
    }

    let assignedDriver: User | null = null;
    if (createPickupRequestDto.assignedDriverId !== undefined) {
      assignedDriver = await this.userRepository.findOne({
        where: { id: createPickupRequestDto.assignedDriverId },
      });
      if (!assignedDriver) {
        throw new NotFoundException(
          `Assigned driver #${createPickupRequestDto.assignedDriverId} not found`,
        );
      }
      if (assignedDriver.role !== UserRole.DRIVER) {
        throw new BadRequestException(
          'Assigned user must have the driver role',
        );
      }
    }

    const pickupRequest = this.pickupRequestRepository.create({
      storeId: store.id,
      requesterId: requester.id,
      assignedDriverId: assignedDriver ? assignedDriver.id : null,
      estimatedEmptyCrates: createPickupRequestDto.estimatedEmptyCrates ?? 0,
      requestedPickupDate: createPickupRequestDto.requestedPickupDate
        ? new Date(createPickupRequestDto.requestedPickupDate)
        : null,
      status: assignedDriver
        ? PickupStatus.ASSIGNED
        : PickupStatus.PENDING,
      notes: createPickupRequestDto.notes ?? null,
    });

    return this.pickupRequestRepository.save(pickupRequest);
  }

  async findAll(
    status?: PickupStatus,
    storeId?: number,
    assignedDriverId?: number,
  ) {
    const query = this.pickupRequestRepository
      .createQueryBuilder('pickup')
      .leftJoinAndSelect('pickup.store', 'store')
      .leftJoinAndSelect('pickup.requester', 'requester')
      .leftJoinAndSelect('pickup.assignedDriver', 'assignedDriver')
      .orderBy('pickup.createdAt', 'DESC');

    if (status) {
      query.andWhere('pickup.status = :status', { status });
    }
    if (storeId) {
      query.andWhere('pickup.storeId = :storeId', { storeId });
    }
    if (assignedDriverId) {
      query.andWhere('pickup.assignedDriverId = :assignedDriverId', {
        assignedDriverId,
      });
    }

    return query.getMany();
  }

  async findOne(id: number) {
    const pickupRequest = await this.pickupRequestRepository.findOne({
      where: { id },
      relations: {
        store: true,
        requester: true,
        assignedDriver: true,
      },
    });

    if (!pickupRequest) {
      throw new NotFoundException(`PickupRequest #${id} not found`);
    }

    return pickupRequest;
  }

  async update(id: number, updatePickupRequestDto: UpdatePickupRequestDto) {
    const pickupRequest = await this.findOne(id);

    if (updatePickupRequestDto.storeId !== undefined) {
      const store = await this.storeRepository.findOne({
        where: { id: updatePickupRequestDto.storeId },
      });
      if (!store) {
        throw new NotFoundException(
          `Store #${updatePickupRequestDto.storeId} not found`,
        );
      }
      pickupRequest.storeId = store.id;
    }

    if (updatePickupRequestDto.assignedDriverId !== undefined) {
      const assignedDriver = await this.userRepository.findOne({
        where: { id: updatePickupRequestDto.assignedDriverId },
      });
      if (!assignedDriver) {
        throw new NotFoundException(
          `Assigned driver #${updatePickupRequestDto.assignedDriverId} not found`,
        );
      }
      if (assignedDriver.role !== UserRole.DRIVER) {
        throw new BadRequestException(
          'Assigned user must have the driver role',
        );
      }
      pickupRequest.assignedDriverId = assignedDriver.id;
      if (
        updatePickupRequestDto.status === undefined &&
        pickupRequest.status === PickupStatus.PENDING
      ) {
        pickupRequest.status = PickupStatus.ASSIGNED;
      }
    }

    if (updatePickupRequestDto.estimatedEmptyCrates !== undefined) {
      pickupRequest.estimatedEmptyCrates =
        updatePickupRequestDto.estimatedEmptyCrates;
    }
    if (updatePickupRequestDto.requestedPickupDate !== undefined) {
      pickupRequest.requestedPickupDate = new Date(
        updatePickupRequestDto.requestedPickupDate,
      );
    }
    if (updatePickupRequestDto.notes !== undefined) {
      pickupRequest.notes = updatePickupRequestDto.notes;
    }
    if (updatePickupRequestDto.status !== undefined) {
      pickupRequest.status = updatePickupRequestDto.status;
    }

    return this.pickupRequestRepository.save(pickupRequest);
  }

  async remove(id: number): Promise<void> {
    const pickupRequest = await this.findOne(id);
    await this.pickupRequestRepository.remove(pickupRequest);
  }
}