import { describe, it, expect, vi, beforeEach } from 'vitest';
import backendTicketService from '../services/backendTicketService';
import backendPaymentService from '../services/backendPaymentService';

// Mock the apiService
vi.mock('../services/apiService', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Backend Ticket Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be a singleton', () => {
    const instance1 = backendTicketService;
    const instance2 = backendTicketService;
    expect(instance1).toBe(instance2);
  });

  it('should have required methods', () => {
    expect(typeof backendTicketService.createTicket).toBe('function');
    expect(typeof backendTicketService.getMyTickets).toBe('function');
    expect(typeof backendTicketService.getEventTickets).toBe('function');
    expect(typeof backendTicketService.checkInTicket).toBe('function');
    expect(typeof backendTicketService.cancelTicket).toBe('function');
  });
});

describe('Backend Payment Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be a singleton', () => {
    const instance1 = backendPaymentService;
    const instance2 = backendPaymentService;
    expect(instance1).toBe(instance2);
  });

  it('should have required methods', () => {
    expect(typeof backendPaymentService.getPaymentProviders).toBe('function');
    expect(typeof backendPaymentService.processPayment).toBe('function');
    expect(typeof backendPaymentService.confirmPayment).toBe('function');
    expect(typeof backendPaymentService.refundPayment).toBe('function');
    expect(typeof backendPaymentService.sendPayout).toBe('function');
  });

  it('should handle payment data correctly', () => {
    const paymentData = {
      provider: 'square' as const,
      source_id: 'test-token',
      verification_token: 'cvv-token',
    };

    expect(paymentData.provider).toBe('square');
    expect(paymentData.source_id).toBe('test-token');
  });
});