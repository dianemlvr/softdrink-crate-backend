import {
    IsEmail,
    IsEnum,
    IsOptional,
    IsString,
    MinLength,
  } from 'class-validator';
  import { UserRole } from '../../entities/user.entity';
  
  export class UpdateUserDto {
    @IsString()
    @IsOptional()
    fullName?: string;
  
    @IsEmail()
    @IsOptional()
    email?: string;
  
    @IsString()
    @MinLength(6)
    @IsOptional()
    password?: string;
  
    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;
  
    @IsString()
    @IsOptional()
    phoneNumber?: string;
  }