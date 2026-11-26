import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { DeliveryStatus } from '../entities/delivery.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('deliveries')
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Post()
  @Roles(UserRole.LOGISTICS_MANAGER)
  create(
    @Body() createDeliveryDto: CreateDeliveryDto,
    @Req() req: { user?: { id?: number; userId?: number; sub?: number } },
  ) {
    const createdByUserId = Number(
      req.user?.id ?? req.user?.userId ?? req.user?.sub,
    );
    return this.deliveriesService.create(createDeliveryDto, createdByUserId);
  }

  @Get()
  @Roles(UserRole.LOGISTICS_MANAGER, UserRole.DRIVER, UserRole.STORE_OWNER)
  findAll(
    @Query('deliveryStatus') deliveryStatus?: DeliveryStatus,
    @Query('storeId') storeId?: string,
    @Query('assignedDriverId') assignedDriverId?: string,
  ) {
    return this.deliveriesService.findAll(
      deliveryStatus,
      storeId ? Number(storeId) : undefined,
      assignedDriverId ? Number(assignedDriverId) : undefined,
    );
  }

  @Get(':id')
  @Roles(UserRole.LOGISTICS_MANAGER, UserRole.DRIVER, UserRole.STORE_OWNER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.deliveriesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.LOGISTICS_MANAGER, UserRole.DRIVER)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDeliveryDto: UpdateDeliveryDto,
  ) {
    return this.deliveriesService.update(id, updateDeliveryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.LOGISTICS_MANAGER)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.deliveriesService.remove(id);
  }
}