import { PhoneNumber } from './phone-number.vo';

describe('PhoneNumber Value Object', () => {
  describe('create', () => {
    it('should create valid Russian mobile number', () => {
      const result = PhoneNumber.create('+79991234567');

      expect(result.isSuccess).toBe(true);
      expect(result.value.value).toBe('+79991234567');
    });

    it('should normalize number starting with 8', () => {
      const result = PhoneNumber.create('89991234567');

      expect(result.isSuccess).toBe(true);
      expect(result.value.value).toBe('+79991234567');
    });

    it('should normalize number starting with 7', () => {
      const result = PhoneNumber.create('79991234567');

      expect(result.isSuccess).toBe(true);
      expect(result.value.value).toBe('+79991234567');
    });

    it('should handle formatted numbers', () => {
      const result = PhoneNumber.create('+7 (999) 123-45-67');

      expect(result.isSuccess).toBe(true);
      expect(result.value.value).toBe('+79991234567');
    });

    it('should fail for empty phone number', () => {
      const result = PhoneNumber.create('');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Phone number is required');
    });

    it('should fail for invalid length', () => {
      const result = PhoneNumber.create('+7999123456'); // too short

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('Invalid phone number format');
    });

    it('should fail for invalid operator code', () => {
      const result = PhoneNumber.create('+71111234567'); // 111 is not valid

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('Invalid mobile operator code');
    });

    it('should accept various valid operator codes', () => {
      const validNumbers = [
        '+79001234567', // 900
        '+79101234567', // 910
        '+79201234567', // 920
        '+79301234567', // 930
        '+79501234567', // 950
      ];

      validNumbers.forEach((number) => {
        const result = PhoneNumber.create(number);
        expect(result.isSuccess).toBe(true);
      });
    });
  });

  describe('toDisplayFormat', () => {
    it('should format phone number for display', () => {
      const phone = PhoneNumber.create('+79991234567').value;

      expect(phone.toDisplayFormat()).toBe('+7 (999) 123-45-67');
    });
  });

  describe('equals', () => {
    it('should be equal for same phone number', () => {
      const phone1 = PhoneNumber.create('+79991234567').value;
      const phone2 = PhoneNumber.create('89991234567').value;

      expect(phone1.equals(phone2)).toBe(true);
    });
  });
});
