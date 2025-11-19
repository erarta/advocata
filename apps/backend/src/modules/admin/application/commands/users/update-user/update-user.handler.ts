import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserCommand } from './update-user.command';
import { UserOrmEntity } from '../../../../../identity/infrastructure/persistence/user.orm-entity';
import { Email } from '../../../../../identity/domain/value-objects/email.vo';
import { PhoneNumber } from '../../../../../identity/domain/value-objects/phone-number.vo';

interface UpdateUserResult {
  success: boolean;
  message: string;
  user: UserOrmEntity;
}

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
  ) {}

  async execute(command: UpdateUserCommand): Promise<UpdateUserResult> {
    const { userId, dto } = command;

    // Find user
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Validate and update email if provided
    if (dto.email && dto.email !== user.email) {
      // Validate email format
      const emailResult = Email.create(dto.email);
      if (emailResult.isFailure) {
        throw new BadRequestException(emailResult.error);
      }

      // Check if email is already taken by another user
      const existingUser = await this.userRepository.findOne({
        where: { email: dto.email },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Email is already in use by another user');
      }

      user.email = dto.email;
      user.isEmailVerified = false; // Reset verification when email changes
    }

    // Validate and update phone if provided
    if (dto.phone && dto.phone !== user.phoneNumber) {
      // Validate phone format
      const phoneResult = PhoneNumber.create(dto.phone);
      if (phoneResult.isFailure) {
        throw new BadRequestException(phoneResult.error);
      }

      // Check if phone is already taken by another user
      const existingUser = await this.userRepository.findOne({
        where: { phoneNumber: dto.phone },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException(
          'Phone number is already in use by another user',
        );
      }

      user.phoneNumber = dto.phone;
      user.isPhoneVerified = false; // Reset verification when phone changes
    }

    // Update name fields
    if (dto.firstName) {
      if (dto.firstName.length > 50) {
        throw new BadRequestException('First name is too long (max 50 characters)');
      }
      user.firstName = dto.firstName.trim();
    }

    if (dto.lastName) {
      if (dto.lastName.length > 50) {
        throw new BadRequestException('Last name is too long (max 50 characters)');
      }
      user.lastName = dto.lastName.trim();
    }

    // Update role if provided (admin privilege)
    if (dto.role) {
      user.role = dto.role as any; // Map DTO role to domain role
    }

    // Update status if provided (admin privilege)
    if (dto.status) {
      user.status = dto.status as any; // Map DTO status to domain status
    }

    // Save updated user
    const updatedUser = await this.userRepository.save(user);

    return {
      success: true,
      message: 'User updated successfully',
      user: updatedUser,
    };
  }
}
