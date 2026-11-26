import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateStoreDto {
  @IsString()
  @IsNotEmpty({ message: 'Store name is required' })
  @MaxLength(120)
  storeName: string;

  @IsString()
  @IsNotEmpty({ message: 'Store address is required' })
  address: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  contactPerson?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  contactNumber?: string;

  @IsInt()
  @Min(1)
  ownerId: number;
}