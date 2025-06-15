import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'organizer' | 'instructor' | 'admin' | 'event_staff' | 'sales_agent';
  status: 'active' | 'pending_approval' | 'suspended' | 'deactivated';
  registrationDate: string;
  lastLogin: string;
  vodSubscriptionStatus?: 'active' | 'inactive' | 'trialing';
  contactPhone?: string;
  address?: string;
  bio?: string;
}

// Temporary mock data until we fix the database permissions
const mockUsers: User[] = [
  {
    id: 'user-001',
    name: 'Alice Johnson',
    email: 'alice.j@example.com',
    role: 'buyer',
    status: 'active',
    registrationDate: '2023-01-15',
    lastLogin: '2024-07-20',
  },
  {
    id: 'user-002',
    name: 'Bob Organizer',
    email: 'bob.o@example.com',
    role: 'organizer',
    status: 'pending_approval',
    registrationDate: '2023-03-01',
    lastLogin: '2024-07-19',
    bio: 'Experienced event planner focusing on dance competitions.'
  },
  {
    id: 'user-003',
    name: 'Charlie Instructor',
    email: 'charlie.i@example.com',
    role: 'instructor',
    status: 'active',
    registrationDate: '2023-02-10',
    lastLogin: '2024-07-21',
    vodSubscriptionStatus: 'active',
    bio: 'Pro dancer and choreographer, specializing in hip-hop.'
  },
  {
    id: 'user-004',
    name: 'Diana Admin',
    email: 'diana.a@example.com',
    role: 'admin',
    status: 'active',
    registrationDate: '2022-11-01',
    lastLogin: '2024-07-22',
  },
  {
    id: 'user-005',
    name: 'Eve Eventstaff',
    email: 'eve.e@example.com',
    role: 'event_staff',
    status: 'active',
    registrationDate: '2023-06-10',
    lastLogin: '2024-07-20',
  },
  {
    id: 'user-006',
    name: 'Frank Sales',
    email: 'frank.s@example.com',
    role: 'sales_agent',
    status: 'active',
    registrationDate: '2023-07-05',
    lastLogin: '2024-07-21',
  },
  {
    id: 'user-007',
    name: 'Grace Buyer',
    email: 'grace.b@example.com',
    role: 'buyer',
    status: 'active',
    registrationDate: '2024-01-20',
    lastLogin: '2024-07-18',
  },
  {
    id: 'user-008',
    name: 'Henry Suspended',
    email: 'henry.s@example.com',
    role: 'buyer',
    status: 'suspended',
    registrationDate: '2023-04-10',
    lastLogin: '2024-06-01',
  },
  {
    id: 'user-009',
    name: 'Ivy Deactivated',
    email: 'ivy.d@example.com',
    role: 'organizer',
    status: 'deactivated',
    registrationDate: '2023-05-15',
    lastLogin: '2024-05-10',
  },
  {
    id: 'user-010',
    name: 'Jack Newbie',
    email: 'jack.n@example.com',
    role: 'buyer',
    status: 'pending_approval',
    registrationDate: '2024-07-22',
    lastLogin: '2024-07-22',
  },
];

class AdminUserService {
  // TEMPORARY: Using mock data until database issues are resolved
  async getUsers(
    query: string = '',
    role: User['role'] | '' = '',
    status: User['status'] | '' = '',
    page: number = 1,
    limit: number = 10,
    sortBy: keyof User = 'registrationDate',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<{ users: User[]; total: number }> {
    console.log(`AdminUserService: Using mock data with query: "${query}", role: "${role}", status: "${status}"`);
    
    // Filter the mock data based on search criteria
    let filteredUsers = [...mockUsers];
    
    if (query) {
      const lowercaseQuery = query.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(lowercaseQuery) ||
        user.email.toLowerCase().includes(lowercaseQuery) ||
        user.id.toLowerCase().includes(lowercaseQuery)
      );
    }
    
    if (role && role !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }
    
    if (status && status !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.status === status);
    }
    
    // Sort the data
    filteredUsers.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }
      
      return 0;
    });
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + limit);
    
    return {
      users: paginatedUsers,
      total: filteredUsers.length
    };
  }

  async getUserById(userId: string): Promise<User | null> {
    // Find user in mock data
    const user = mockUsers.find(u => u.id === userId);
    return user || null;
  }

  async updateUserStatus(userId: string, newStatus: User['status'], auditReason: string): Promise<User> {
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    // Update the user in our mock data
    const updatedUser = { 
      ...mockUsers[userIndex], 
      status: newStatus 
    };
    
    mockUsers[userIndex] = updatedUser;
    
    console.log(`AUDIT: User ${userId} status changed to ${newStatus}. Reason: ${auditReason}`);
    
    return updatedUser;
  }

  async approveOrganizerAccount(organizerId: string): Promise<User> {
    console.log(`AdminUserService: Approving organizer account for ${organizerId}`);
    return this.updateUserStatus(organizerId, 'active', 'Organizer account approved by admin');
  }

  async manageInstructorVODSubscription(
    instructorId: string,
    status: User['vodSubscriptionStatus']
  ): Promise<User> {
    console.log(`AdminUserService: Managing VOD subscription for instructor ${instructorId}, setting to ${status}`);
    const userIndex = mockUsers.findIndex(user => user.id === instructorId && user.role === 'instructor');
    if (userIndex === -1) {
      throw new Error('Instructor not found');
    }

    const updatedUser = { ...mockUsers[userIndex], vodSubscriptionStatus: status };
    mockUsers[userIndex] = updatedUser;

    console.log(`AUDIT: Instructor ${instructorId} VOD subscription changed to ${status} by admin.`);

    return new Promise((resolve) => setTimeout(() => resolve(updatedUser), 300));
  }

  async resetUserPassword(userId: string): Promise<{ message: string }> {
    console.log(`AdminUserService: Initiating password reset for user ${userId}`);
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    // In a real app, this would send an email with a reset link
    return new Promise((resolve) =>
      setTimeout(() => resolve({ message: `Password reset link sent to ${user.email}` }), 300)
    );
  }

  private convertToSnakeCase(str: string): string {
    return str.replace(/([A-Z])/g, "_$1").toLowerCase();
  }
}

export const adminUserService = new AdminUserService(); 