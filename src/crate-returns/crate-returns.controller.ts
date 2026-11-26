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
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CrateReturnsService } from './crate-returns.service';
import { CreateCrateReturnDto } from './dto/create-crate-return.dto';
import { UpdateCrateReturnDto } from './dto/update-crate-return.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { CrateCondition } from '../entities/crate-return.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('crate-returns')
export class CrateReturnsController {
  constructor(private readonly crateReturnsService: CrateReturnsService) {}

  @Post()
  @Roles(UserRole.LOGISTICS_MANAGER, UserRole.DRIVER)
  create(@Body() createCrateReturnDto: CreateCrateReturnDto) {
    return this.crateReturnsService.create(createCrateReturnDto);
  }

  @Get()
  @Roles(UserRole.LOGISTICS_MANAGER, UserRole.DRIVER, UserRole.STORE_OWNER)
  findAll(
    @Query('storeId') storeId?: string,
    @Query('assignedDriverId') assignedDriverId?: string,
    @Query('condition') condition?: CrateCondition,
  ) {
    return this.crateReturnsService.findAll(
      storeId ? Number(storeId) : undefined,
      assignedDriverId ? Number(assignedDriverId) : undefined,
      condition,
    );
  }

  @Get(':id')
  @Roles(UserRole.LOGISTICS_MANAGER, UserRole.DRIVER, UserRole.STORE_OWNER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.crateReturnsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.LOGISTICS_MANAGER, UserRole.DRIVER)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCrateReturnDto: UpdateCrateReturnDto,
  ) {
    return this.crateReturnsService.update(id, updateCrateReturnDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.LOGISTICS_MANAGER)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.crateReturnsService.remove(id);
  }
}