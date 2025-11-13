import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities';
import { UserOrmEntity } from './user.orm-entity';
import { UserMapper } from './user.mapper';
import { v4 as uuidv4 } from 'uuid';

/**
 * UserRepository
 *
 * TypeORM implementation of IUserRepository
 */
@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repository: Repository<UserOrmEntity>,
  ) {}

  async nextId(): Promise<string> {
    return uuidv4();
  }

  async findById(id: string): Promise<User | null> {
    const ormEntity = await this.repository.findOne({ where: { id } });
    if (!ormEntity) {
      return null;
    }
    return UserMapper.toDomain(ormEntity);
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    const ormEntity = await this.repository.findOne({
      where: { phoneNumber },
    });
    if (!ormEntity) {
      return null;
    }
    return UserMapper.toDomain(ormEntity);
  }

  async findByEmail(email: string): Promise<User | null> {
    const ormEntity = await this.repository.findOne({ where: { email } });
    if (!ormEntity) {
      return null;
    }
    return UserMapper.toDomain(ormEntity);
  }

  async save(user: User): Promise<void> {
    const ormEntity = UserMapper.toOrm(user);
    await this.repository.save(ormEntity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async existsByPhoneNumber(phoneNumber: string): Promise<boolean> {
    const count = await this.repository.count({ where: { phoneNumber } });
    return count > 0;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.repository.count({ where: { email } });
    return count > 0;
  }
}
