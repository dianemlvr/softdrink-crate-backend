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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { StoresService } from './stores.service';
import { DeliveriesService } from '../deliveries/deliveries.service';
import { CrateReturnsService } from '../crate-returns/crate-returns.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stores')
export class StoresController {
  constructor(
    private readonly storesService: StoresService,
    private readonly deliveriesService: DeliveriesService,
    private readonly crateReturnsService: CrateReturnsService,
  ) {}

  @Post()
  @Roles(UserRole.LOGISTICS_MANAGER)
  create(@Body() createStoreDto: CreateStoreDto) {
    return this.storesService.create(createStoreDto);
  }

  @Get()
  findAll(@Query('ownerId') ownerId?: string) {
    return this.storesService.findAll(ownerId ? Number(ownerId) : undefined);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.storesService.findOne(id);
  }

  @Get(':id/deliveries')
  async findStoreDeliveries(@Param('id', ParseIntPipe) id: number) {
    await this.storesService.findOne(id);
    return this.deliveriesService.findAll(undefined, id, undefined);
  }

  @Get(':id/crate-returns')
  async findStoreCrateReturns(@Param('id', ParseIntPipe) id: number) {
    await this.storesService.findOne(id);
    return this.crateReturnsService.findAll(id, undefined, undefined);
  }

  @Patch(':id')
  @Roles(UserRole.LOGISTICS_MANAGER)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStoreDto: UpdateStoreDto,
  ) {
    return this.storesService.update(id, updateStoreDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.LOGISTICS_MANAGER)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.storesService.remove(id);
  }
}