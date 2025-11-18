import { Email } from './email.vo';

describe('Email Value Object', () => {
  describe('create', () => {
    it('should create valid email', () => {
      const result = Email.create('test@example.com');

      expect(result.isSuccess).toBe(true);
      expect(result.value.value).toBe('test@example.com');
    });

    it('should normalize email to lowercase', () => {
      const result = Email.create('Test@Example.COM');

      expect(result.isSuccess).toBe(true);
      expect(result.value.value).toBe('test@example.com');
    });

    it('should trim whitespace', () => {
      const result = Email.create('  test@example.com  ');

      expect(result.isSuccess).toBe(true);
      expect(result.value.value).toBe('test@example.com');
    });

    it('should fail for empty email', () => {
      const result = Email.create('');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Email is required');
    });

    it('should fail for invalid email format', () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'test@',
        'test @example.com',
      ];

      invalidEmails.forEach((email) => {
        const result = Email.create(email);
        expect(result.isFailure).toBe(true);
        expect(result.error).toBe('Invalid email format');
      });
    });

    it('should fail for email that is too long', () => {
      const longEmail = 'a'.repeat(256) + '@example.com';
      const result = Email.create(longEmail);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Email is too long (max 255 characters)');
    });
  });

  describe('equals', () => {
    it('should be equal for same email', () => {
      const email1 = Email.create('test@example.com').value;
      const email2 = Email.create('test@example.com').value;

      expect(email1.equals(email2)).toBe(true);
    });

    it('should be equal for same email with different casing', () => {
      const email1 = Email.create('Test@Example.com').value;
      const email2 = Email.create('test@example.com').value;

      expect(email1.equals(email2)).toBe(true);
    });

    it('should not be equal for different emails', () => {
      const email1 = Email.create('test1@example.com').value;
      const email2 = Email.create('test2@example.com').value;

      expect(email1.equals(email2)).toBe(false);
    });
  });
});
