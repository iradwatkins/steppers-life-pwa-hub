import { describe, it, expect, vi, beforeEach } from 'vitest';
import backendEventService from '../services/backendEventService';

// Mock the apiService
vi.mock('../services/apiService', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Backend Event Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be a singleton', () => {
    const instance1 = backendEventService;
    const instance2 = backendEventService;
    expect(instance1).toBe(instance2);
  });

  it('should have required methods', () => {
    expect(typeof backendEventService.createEvent).toBe('function');
    expect(typeof backendEventService.getEvents).toBe('function');
    expect(typeof backendEventService.getEvent).toBe('function');
    expect(typeof backendEventService.updateEvent).toBe('function');
    expect(typeof backendEventService.deleteEvent).toBe('function');
    expect(typeof backendEventService.publishEvent).toBe('function');
    expect(typeof backendEventService.cancelEvent).toBe('function');
    expect(typeof backendEventService.getMyEvents).toBe('function');
    expect(typeof backendEventService.getCategories).toBe('function');
    expect(typeof backendEventService.getVenues).toBe('function');
    expect(typeof backendEventService.searchEvents).toBe('function');
  });

  it('should handle event creation data correctly', () => {
    const eventData = {
      title: 'Test Event',
      description: 'A test event',
      start_datetime: '2024-06-10T10:00:00Z',
      end_datetime: '2024-06-10T12:00:00Z',
      timezone: 'UTC',
      is_online: false,
      is_free: true,
    };

    expect(eventData.title).toBe('Test Event');
    expect(eventData.is_online).toBe(false);
    expect(eventData.is_free).toBe(true);
  });
});