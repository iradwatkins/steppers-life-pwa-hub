export interface VanityUrlRequest {
  id: string;
  userId: string;
  userType: 'organizer' | 'sales_agent';
  requestedUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  rejectionReason?: string;
  currentUrl?: string;
}

export interface VanityUrl {
  id: string;
  userId: string;
  userType: 'organizer' | 'sales_agent';
  vanityUrl: string;
  originalUrl: string;
  isActive: boolean;
  createdAt: Date;
  lastUsed?: Date;
  clickCount: number;
}

class VanityUrlService {
  private requests: VanityUrlRequest[] = [
    {
      id: '1',
      userId: 'org1',
      userType: 'organizer',
      requestedUrl: 'stepper-events',
      status: 'pending',
      createdAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      userId: 'agent1',
      userType: 'sales_agent',
      requestedUrl: 'sarah-tickets',
      status: 'approved',
      createdAt: new Date('2024-01-10'),
      reviewedAt: new Date('2024-01-12'),
      reviewedBy: 'admin1',
    },
    {
      id: '3',
      userId: 'org2',
      userType: 'organizer',
      requestedUrl: 'dance-masters',
      status: 'rejected',
      createdAt: new Date('2024-01-08'),
      reviewedAt: new Date('2024-01-11'),
      reviewedBy: 'admin1',
      rejectionReason: 'URL already taken by another user',
    },
  ];

  private vanityUrls: VanityUrl[] = [
    {
      id: '1',
      userId: 'agent1',
      userType: 'sales_agent',
      vanityUrl: 'sarah-tickets',
      originalUrl: '/agent/sarah-agent-id/events',
      isActive: true,
      createdAt: new Date('2024-01-12'),
      lastUsed: new Date('2024-01-20'),
      clickCount: 45,
    },
    {
      id: '2',
      userId: 'org3',
      userType: 'organizer',
      vanityUrl: 'fitness-events',
      originalUrl: '/organizer/fitness-org-id/events',
      isActive: true,
      createdAt: new Date('2024-01-05'),
      lastUsed: new Date('2024-01-18'),
      clickCount: 128,
    },
  ];

  async getMyVanityUrls(userId: string): Promise<VanityUrl[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.vanityUrls.filter(url => url.userId === userId));
      }, 500);
    });
  }

  async getMyRequests(userId: string): Promise<VanityUrlRequest[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.requests.filter(req => req.userId === userId));
      }, 500);
    });
  }

  async requestVanityUrl(userId: string, userType: 'organizer' | 'sales_agent', requestedUrl: string): Promise<VanityUrlRequest> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check if URL is already taken
        const existingUrl = this.vanityUrls.find(url => url.vanityUrl.toLowerCase() === requestedUrl.toLowerCase());
        const existingRequest = this.requests.find(req => 
          req.requestedUrl.toLowerCase() === requestedUrl.toLowerCase() && 
          req.status === 'pending'
        );

        if (existingUrl || existingRequest) {
          reject(new Error('This vanity URL is already taken or has a pending request'));
          return;
        }

        const newRequest: VanityUrlRequest = {
          id: Date.now().toString(),
          userId,
          userType,
          requestedUrl,
          status: 'pending',
          createdAt: new Date(),
        };

        this.requests.push(newRequest);
        resolve(newRequest);
      }, 500);
    });
  }

  async checkUrlAvailability(requestedUrl: string): Promise<{ available: boolean; reason?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const existingUrl = this.vanityUrls.find(url => url.vanityUrl.toLowerCase() === requestedUrl.toLowerCase());
        const existingRequest = this.requests.find(req => 
          req.requestedUrl.toLowerCase() === requestedUrl.toLowerCase() && 
          req.status === 'pending'
        );

        if (existingUrl) {
          resolve({ available: false, reason: 'URL is already in use' });
        } else if (existingRequest) {
          resolve({ available: false, reason: 'URL has a pending request' });
        } else if (requestedUrl.length < 3) {
          resolve({ available: false, reason: 'URL must be at least 3 characters long' });
        } else if (!/^[a-zA-Z0-9-]+$/.test(requestedUrl)) {
          resolve({ available: false, reason: 'URL can only contain letters, numbers, and hyphens' });
        } else {
          resolve({ available: true });
        }
      }, 300);
    });
  }

  async toggleVanityUrl(id: string, isActive: boolean): Promise<VanityUrl> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const urlIndex = this.vanityUrls.findIndex(url => url.id === id);
        if (urlIndex === -1) {
          reject(new Error('Vanity URL not found'));
          return;
        }

        this.vanityUrls[urlIndex].isActive = isActive;
        resolve(this.vanityUrls[urlIndex]);
      }, 500);
    });
  }

  async deleteVanityUrl(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const urlIndex = this.vanityUrls.findIndex(url => url.id === id);
        if (urlIndex === -1) {
          reject(new Error('Vanity URL not found'));
          return;
        }

        this.vanityUrls.splice(urlIndex, 1);
        resolve();
      }, 500);
    });
  }

  // Admin functions
  async getAllRequests(): Promise<VanityUrlRequest[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.requests]);
      }, 500);
    });
  }

  async approveRequest(requestId: string, adminId: string): Promise<VanityUrlRequest> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const requestIndex = this.requests.findIndex(req => req.id === requestId);
        if (requestIndex === -1) {
          reject(new Error('Request not found'));
          return;
        }

        const request = this.requests[requestIndex];
        request.status = 'approved';
        request.reviewedAt = new Date();
        request.reviewedBy = adminId;

        // Create the actual vanity URL
        const newVanityUrl: VanityUrl = {
          id: Date.now().toString(),
          userId: request.userId,
          userType: request.userType,
          vanityUrl: request.requestedUrl,
          originalUrl: request.userType === 'organizer' 
            ? `/organizer/${request.userId}/events`
            : `/agent/${request.userId}/events`,
          isActive: true,
          createdAt: new Date(),
          clickCount: 0,
        };

        this.vanityUrls.push(newVanityUrl);
        resolve(request);
      }, 500);
    });
  }

  async rejectRequest(requestId: string, adminId: string, reason: string): Promise<VanityUrlRequest> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const requestIndex = this.requests.findIndex(req => req.id === requestId);
        if (requestIndex === -1) {
          reject(new Error('Request not found'));
          return;
        }

        const request = this.requests[requestIndex];
        request.status = 'rejected';
        request.reviewedAt = new Date();
        request.reviewedBy = adminId;
        request.rejectionReason = reason;

        resolve(request);
      }, 500);
    });
  }

  async getAllVanityUrls(): Promise<VanityUrl[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.vanityUrls]);
      }, 500);
    });
  }

  async getVanityUrlStats(): Promise<{
    totalUrls: number;
    activeUrls: number;
    totalClicks: number;
    pendingRequests: number;
  }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          totalUrls: this.vanityUrls.length,
          activeUrls: this.vanityUrls.filter(url => url.isActive).length,
          totalClicks: this.vanityUrls.reduce((sum, url) => sum + url.clickCount, 0),
          pendingRequests: this.requests.filter(req => req.status === 'pending').length,
        });
      }, 500);
    });
  }
}

export const vanityUrlService = new VanityUrlService(); 