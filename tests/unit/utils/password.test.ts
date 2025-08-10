import { hashPassword, verifyPassword } from '../../../src/utils/password';

describe('Password Utils', () => {
  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const password = 'testPassword123';
      const hashedPassword = await hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(0);
      expect(hashedPassword).toMatch(/^\$2[aby]\$\d+\$/);
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'testPassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty password', async () => {
      const password = '';
      const hashedPassword = await hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword.length).toBeGreaterThan(0);
    });

    it('should handle special characters in password', async () => {
      const password = 'test@#$%^&*()_+{}|:<>?[]\\;\',./`~';
      const hashedPassword = await hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'testPassword123';
      const hashedPassword = await hashPassword(password);
      const isValid = await verifyPassword(password, hashedPassword);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword456';
      const hashedPassword = await hashPassword(password);
      const isValid = await verifyPassword(wrongPassword, hashedPassword);

      expect(isValid).toBe(false);
    });

    it('should reject empty password against valid hash', async () => {
      const password = 'testPassword123';
      const hashedPassword = await hashPassword(password);
      const isValid = await verifyPassword('', hashedPassword);

      expect(isValid).toBe(false);
    });

    it('should handle invalid hash format', async () => {
      const password = 'testPassword123';
      const invalidHash = 'invalidhash';
      
      await expect(verifyPassword(password, invalidHash)).rejects.toThrow();
    });

    it('should verify password with special characters', async () => {
      const password = 'test@#$%^&*()_+{}|:<>?[]\\;\',./`~';
      const hashedPassword = await hashPassword(password);
      const isValid = await verifyPassword(password, hashedPassword);

      expect(isValid).toBe(true);
    });
  });
});