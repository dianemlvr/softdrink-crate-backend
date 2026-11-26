import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateDeliveryDto {
  @IsInt()
  @Min(1)
  storeId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  assignedDriverId?: number;

  @IsDateString()
  deliveryDate: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  softdrinksDetails: string;

  @IsInt()
  @Min(1)
  quantityDelivered: number;

  @IsInt()
  @Min(0)
  cratesDelivered: number;

  @IsOptional()
  @IsString()
  remarks?: string;
}