import {
    ConflictException,
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import * as bcrypt from 'bcrypt';
  import { Repository } from 'typeorm';
  import { User } from '../entities/user.entity';
  import { CreateUserDto } from './dto/create-user.dto';
  import { UpdateUserDto } from './dto/update-user.dto';
  
  @Injectable()
  export class UsersService {
    constructor(
      @InjectRepository(User)
      private readonly usersRepository: Repository<User>,
    ) {}
  
    private sanitizeUser(user: User) {
      const { passwordHash, ...result } = user;
      return result;
    }
  
    async create(createUserDto: CreateUserDto) {
      const existing = await this.usersRepository.findOne({
        where: { email: createUserDto.email },
      });
  
      if (existing) {
        throw new ConflictException(
          `User with email ${createUserDto.email} already exists.`,
        );
      }
  
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const user = this.usersRepository.create({
        fullName: createUserDto.fullName,
        email: createUserDto.email,
        passwordHash: hashedPassword,
        role: createUserDto.role,
        phoneNumber: createUserDto.phoneNumber,
      });
  
      const saved = await this.usersRepository.save(user);
      return this.sanitizeUser(saved);
    }
  
    async findAll(page = 1, limit = 10) {
      const take = Math.max(1, Number(limit) || 10);
      const currentPage = Math.max(1, Number(page) || 1);
      const skip = (currentPage - 1) * take;
  
      const [users, total] = await this.usersRepository.findAndCount({
        skip,
        take,
        order: { id: 'ASC' },
      });
  
      return {
        page: currentPage,
        limit: take,
        total,
        data: users.map((u) => this.sanitizeUser(u)),
      };
    }
  
    async findOne(id: number) {
      const user = await this.usersRepository.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException(`No user exists with ID ${id}.`);
      }
      return this.sanitizeUser(user);
    }
  
    async findByEmailWithPassword(email: string): Promise<User | null> {
      return this.usersRepository.findOne({ where: { email } });
    }
  
    async update(id: number, updateUserDto: UpdateUserDto) {
      const user = await this.usersRepository.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException(`No user exists with ID ${id}.`);
      }
  
      if (updateUserDto.email && updateUserDto.email !== user.email) {
        const emailTaken = await this.usersRepository.findOne({
          where: { email: updateUserDto.email },
        });
        if (emailTaken) {
          throw new ConflictException(
            `User with email ${updateUserDto.email} already exists.`,
          );
        }
      }
  
      if (updateUserDto.password) {
        user.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
      }
      if (updateUserDto.fullName !== undefined) {
        user.fullName = updateUserDto.fullName;
      }
      if (updateUserDto.email !== undefined) {
        user.email = updateUserDto.email;
      }
      if (updateUserDto.role !== undefined) {
        user.role = updateUserDto.role;
      }
      if (updateUserDto.phoneNumber !== undefined) {
        user.phoneNumber = updateUserDto.phoneNumber;
      }
  
      const saved = await this.usersRepository.save(user);
      return this.sanitizeUser(saved);
    }
  
    async remove(id: number): Promise<void> {
      const user = await this.usersRepository.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException(`No user exists with ID ${id}.`);
      }
      await this.usersRepository.remove(user);
    }
  }