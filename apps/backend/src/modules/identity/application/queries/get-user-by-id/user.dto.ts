import { UserRole, UserStatus } from '../../../domain/enums';

/**
 * UserDto
 *
 * Data Transfer Object for User
 */
export class UserDto {
  id: string;
  phoneNumber: string;
  email?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
