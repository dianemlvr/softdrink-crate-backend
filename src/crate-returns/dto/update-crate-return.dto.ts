import { PartialType } from '@nestjs/mapped-types';
import { CreateCrateReturnDto } from './create-crate-return.dto';

export class UpdateCrateReturnDto extends PartialType(CreateCrateReturnDto) {}