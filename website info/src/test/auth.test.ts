import { describe, it, expect, vi, beforeEach } from 'vitest';
import backendAuthService from '../services/backendAuthService';

// Mock the apiService
vi.mock('../services/apiService', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
  },
}));

describe('Backend Authentication Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be a singleton', () => {
    const instance1 = backendAuthService;
    const instance2 = backendAuthService;
    expect(instance1).toBe(instance2);
  });

  it('should have required methods', () => {
    expect(typeof backendAuthService.register).toBe('function');
    expect(typeof backendAuthService.login).toBe('function');
    expect(typeof backendAuthService.getCurrentUser).toBe('function');
    expect(typeof backendAuthService.logout).toBe('function');
    expect(typeof backendAuthService.refreshToken).toBe('function');
  });
});