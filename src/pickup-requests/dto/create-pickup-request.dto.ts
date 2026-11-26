import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePickupRequestDto {
  @IsInt()
  @Min(1)
  storeId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  assignedDriverId?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  estimatedEmptyCrates?: number;

  @IsOptional()
  @IsDateString()
  requestedPickupDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  notes?: string;
}