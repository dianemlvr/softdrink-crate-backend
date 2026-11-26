import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PickupRequestsService } from './pickup-requests.service';
import { CreatePickupRequestDto } from './dto/create-pickup-request.dto';
import { UpdatePickupRequestDto } from './dto/update-pickup-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { PickupStatus } from '../entities/pickup-request.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pickup-requests')
export class PickupRequestsController {
  constructor(private readonly pickupRequestsService: PickupRequestsService) {}

  @Post()
  @Roles(UserRole.STORE_OWNER, UserRole.LOGISTICS_MANAGER)
  create(
    @Body() createPickupRequestDto: CreatePickupRequestDto,
    @Req() req: { user?: { id?: number; userId?: number; sub?: number } },
  ) {
    const requesterId = Number(
      req.user?.id ?? req.user?.userId ?? req.user?.sub,
    );
    return this.pickupRequestsService.create(
      createPickupRequestDto,
      requesterId,
    );
  }

  @Get()
  @Roles(UserRole.LOGISTICS_MANAGER, UserRole.DRIVER, UserRole.STORE_OWNER)
  findAll(
    @Query('status') status?: PickupStatus,
    @Query('storeId') storeId?: string,
    @Query('assignedDriverId') assignedDriverId?: string,
  ) {
    return this.pickupRequestsService.findAll(
      status,
      storeId ? Number(storeId) : undefined,
      assignedDriverId ? Number(assignedDriverId) : undefined,
    );
  }

  @Get(':id')
  @Roles(UserRole.LOGISTICS_MANAGER, UserRole.DRIVER, UserRole.STORE_OWNER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pickupRequestsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.LOGISTICS_MANAGER, UserRole.DRIVER)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePickupRequestDto: UpdatePickupRequestDto,
  ) {
    return this.pickupRequestsService.update(id, updatePickupRequestDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.LOGISTICS_MANAGER, UserRole.STORE_OWNER)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.pickupRequestsService.remove(id);
  }
}