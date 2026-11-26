import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreatePickupRequestDto } from './create-pickup-request.dto';
import { PickupStatus } from '../../entities/pickup-request.entity';

export class UpdatePickupRequestDto extends PartialType(
  CreatePickupRequestDto,
) {
  @IsOptional()
  @IsEnum(PickupStatus)
  status?: PickupStatus;
}