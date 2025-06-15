import { describe, it, expect } from 'vitest';

describe('Testing Framework', () => {
  it('should work correctly', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle basic assertions', () => {
    const user = { name: 'John', email: 'john@example.com' };
    expect(user.name).toBe('John');
    expect(user.email).toContain('@');
  });
});