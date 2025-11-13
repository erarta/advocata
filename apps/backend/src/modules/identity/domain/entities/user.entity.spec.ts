import { User } from './user.entity';
import { PhoneNumber, Email } from '../value-objects';
import { UserRole, UserStatus } from '../enums';

describe('User Entity', () => {
  describe('create', () => {
    it('should create a new user successfully', () => {
      const phoneNumber = PhoneNumber.create('+79991234567').value;
      const result = User.create(
        'user-id-123',
        phoneNumber,
        'Иван',
        'Иванов',
        UserRole.Client,
      );

      expect(result.isSuccess).toBe(true);
      const user = result.value;
      expect(user.phoneNumber.value).toBe('+79991234567');
      expect(user.firstName).toBe('Иван');
      expect(user.lastName).toBe('Иванов');
      expect(user.fullName).toBe('Иван Иванов');
      expect(user.role).toBe(UserRole.Client);
      expect(user.status).toBe(UserStatus.PendingVerification);
      expect(user.isPhoneVerified).toBe(false);
      expect(user.isActive).toBe(false);
    });

    it('should raise UserRegisteredEvent', () => {
      const phoneNumber = PhoneNumber.create('+79991234567').value;
      const result = User.create(
        'user-id-123',
        phoneNumber,
        'Иван',
        'Иванов',
        UserRole.Client,
      );

      const user = result.value;
      expect(user.domainEvents.length).toBe(1);
      expect(user.domainEvents[0].eventType).toBe('UserRegisteredEvent');
    });

    it('should fail for empty first name', () => {
      const phoneNumber = PhoneNumber.create('+79991234567').value;
      const result = User.create(
        'user-id-123',
        phoneNumber,
        '',
        'Иванов',
        UserRole.Client,
      );

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('First name is required');
    });

    it('should fail for first name that is too long', () => {
      const phoneNumber = PhoneNumber.create('+79991234567').value;
      const longName = 'a'.repeat(51);
      const result = User.create(
        'user-id-123',
        phoneNumber,
        longName,
        'Иванов',
        UserRole.Client,
      );

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('First name is too long (max 50 characters)');
    });
  });

  describe('verifyPhone', () => {
    it('should verify phone successfully', () => {
      const phoneNumber = PhoneNumber.create('+79991234567').value;
      const user = User.create(
        'user-id-123',
        phoneNumber,
        'Иван',
        'Иванов',
        UserRole.Client,
      ).value;

      const result = user.verifyPhone();

      expect(result.isSuccess).toBe(true);
      expect(user.isPhoneVerified).toBe(true);
      expect(user.status).toBe(UserStatus.Active);
      expect(user.isActive).toBe(true);
    });

    it('should raise UserVerifiedEvent', () => {
      const phoneNumber = PhoneNumber.create('+79991234567').value;
      const user = User.create(
        'user-id-123',
        phoneNumber,
        'Иван',
        'Иванов',
        UserRole.Client,
      ).value;

      user.clearEvents(); // Clear registration event
      user.verifyPhone();

      expect(user.domainEvents.length).toBe(1);
      expect(user.domainEvents[0].eventType).toBe('UserVerifiedEvent');
    });

    it('should fail if already verified', () => {
      const phoneNumber = PhoneNumber.create('+79991234567').value;
      const user = User.create(
        'user-id-123',
        phoneNumber,
        'Иван',
        'Иванов',
        UserRole.Client,
      ).value;

      user.verifyPhone();
      const result = user.verifyPhone();

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Phone number is already verified');
    });
  });

  describe('setEmail', () => {
    it('should set email for active user', () => {
      const phoneNumber = PhoneNumber.create('+79991234567').value;
      const user = User.create(
        'user-id-123',
        phoneNumber,
        'Иван',
        'Иванов',
        UserRole.Client,
      ).value;

      user.verifyPhone(); // Make user active

      const email = Email.create('test@example.com').value;
      const result = user.setEmail(email);

      expect(result.isSuccess).toBe(true);
      expect(user.email?.value).toBe('test@example.com');
      expect(user.isEmailVerified).toBe(false);
    });

    it('should fail for non-active user', () => {
      const phoneNumber = PhoneNumber.create('+79991234567').value;
      const user = User.create(
        'user-id-123',
        phoneNumber,
        'Иван',
        'Иванов',
        UserRole.Client,
      ).value;

      const email = Email.create('test@example.com').value;
      const result = user.setEmail(email);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('User must be active to set email');
    });
  });

  describe('suspend', () => {
    it('should suspend active user', () => {
      const phoneNumber = PhoneNumber.create('+79991234567').value;
      const user = User.create(
        'user-id-123',
        phoneNumber,
        'Иван',
        'Иванов',
        UserRole.Client,
      ).value;

      user.verifyPhone();

      const result = user.suspend('Violation of terms');

      expect(result.isSuccess).toBe(true);
      expect(user.status).toBe(UserStatus.Suspended);
      expect(user.isActive).toBe(false);
    });

    it('should raise UserSuspendedEvent', () => {
      const phoneNumber = PhoneNumber.create('+79991234567').value;
      const user = User.create(
        'user-id-123',
        phoneNumber,
        'Иван',
        'Иванов',
        UserRole.Client,
      ).value;

      user.verifyPhone();
      user.clearEvents();

      user.suspend('Violation');

      expect(user.domainEvents.length).toBe(1);
      expect(user.domainEvents[0].eventType).toBe('UserSuspendedEvent');
    });
  });

  describe('recordLogin', () => {
    it('should record last login time', () => {
      const phoneNumber = PhoneNumber.create('+79991234567').value;
      const user = User.create(
        'user-id-123',
        phoneNumber,
        'Иван',
        'Иванов',
        UserRole.Client,
      ).value;

      expect(user.lastLoginAt).toBeUndefined();

      user.recordLogin();

      expect(user.lastLoginAt).toBeInstanceOf(Date);
    });
  });
});
