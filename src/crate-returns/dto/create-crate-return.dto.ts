import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { CrateCondition } from '../../entities/crate-return.entity';

export class CreateCrateReturnDto {
  @IsInt()
  @Min(1)
  storeId: number;

  @IsInt()
  @Min(1)
  assignedDriverId: number;

  @IsDateString()
  returnDate: string;

  @IsInt()
  @Min(1)
  cratesReturned: number;

  @IsOptional()
  @IsEnum(CrateCondition)
  condition?: CrateCondition;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  notes?: string;
}