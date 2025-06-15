interface VenuePhoto {
  id: string;
  url: string;
  title: string;
  description: string;
  isMainPhoto: boolean;
  isPublic: boolean;
  uploadedBy: string;
  uploadedAt: Date;
  order: number;
  venueId: string;
}

interface PhotoUploadRequest {
  file: File;
  title: string;
  description: string;
  isMainPhoto: boolean;
  isPublic: boolean;
  venueId: string;
}

class VenuePhotoService {
  private apiBaseUrl = '/api/venues'; // In real app, use environment variable

  /**
   * Upload a new photo for a venue
   */
  async uploadPhoto(request: PhotoUploadRequest): Promise<VenuePhoto> {
    try {
      const formData = new FormData();
      formData.append('file', request.file);
      formData.append('title', request.title);
      formData.append('description', request.description);
      formData.append('isMainPhoto', String(request.isMainPhoto));
      formData.append('isPublic', String(request.isPublic));
      formData.append('venueId', request.venueId);

      // In real implementation:
      // const response = await fetch(`${this.apiBaseUrl}/${request.venueId}/photos`, {
      //   method: 'POST',
      //   body: formData,
      //   headers: {
      //     'Authorization': `Bearer ${getAuthToken()}`
      //   }
      // });
      
      // Mock implementation
      await this.simulateNetworkDelay(1000);
      
      // Simulate successful upload
      const mockPhoto: VenuePhoto = {
        id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url: URL.createObjectURL(request.file), // In real app, this would be the server URL
        title: request.title,
        description: request.description,
        isMainPhoto: request.isMainPhoto,
        isPublic: request.isPublic,
        uploadedBy: 'Current User', // In real app, get from auth context
        uploadedAt: new Date(),
        order: 0, // Server would assign proper order
        venueId: request.venueId
      };

      // Store in localStorage for demo purposes
      this.savePhotoToLocalStorage(mockPhoto);

      return mockPhoto;
    } catch (error) {
      console.error('Failed to upload photo:', error);
      throw new Error('Failed to upload photo. Please try again.');
    }
  }

  /**
   * Get all photos for a venue
   */
  async getVenuePhotos(venueId: string, includePrivate: boolean = false): Promise<VenuePhoto[]> {
    try {
      // In real implementation:
      // const response = await fetch(`${this.apiBaseUrl}/${venueId}/photos?includePrivate=${includePrivate}`, {
      //   headers: {
      //     'Authorization': `Bearer ${getAuthToken()}`
      //   }
      // });
      // return await response.json();

      // Mock implementation
      await this.simulateNetworkDelay(500);
      
      const allPhotos = this.getPhotosFromLocalStorage();
      const venuePhotos = allPhotos.filter(photo => photo.venueId === venueId);
      
      if (!includePrivate) {
        return venuePhotos.filter(photo => photo.isPublic);
      }
      
      return venuePhotos.sort((a, b) => a.order - b.order);
    } catch (error) {
      console.error('Failed to fetch venue photos:', error);
      throw new Error('Failed to load venue photos.');
    }
  }

  /**
   * Update photo metadata
   */
  async updatePhoto(photoId: string, updates: Partial<VenuePhoto>): Promise<VenuePhoto> {
    try {
      // In real implementation:
      // const response = await fetch(`${this.apiBaseUrl}/photos/${photoId}`, {
      //   method: 'PATCH',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${getAuthToken()}`
      //   },
      //   body: JSON.stringify(updates)
      // });
      // return await response.json();

      // Mock implementation
      await this.simulateNetworkDelay(300);
      
      const allPhotos = this.getPhotosFromLocalStorage();
      const photoIndex = allPhotos.findIndex(photo => photo.id === photoId);
      
      if (photoIndex === -1) {
        throw new Error('Photo not found');
      }

      const updatedPhoto = { ...allPhotos[photoIndex], ...updates };
      allPhotos[photoIndex] = updatedPhoto;
      
      localStorage.setItem('venuePhotos', JSON.stringify(allPhotos));
      
      return updatedPhoto;
    } catch (error) {
      console.error('Failed to update photo:', error);
      throw new Error('Failed to update photo. Please try again.');
    }
  }

  /**
   * Delete a photo
   */
  async deletePhoto(photoId: string): Promise<void> {
    try {
      // In real implementation:
      // await fetch(`${this.apiBaseUrl}/photos/${photoId}`, {
      //   method: 'DELETE',
      //   headers: {
      //     'Authorization': `Bearer ${getAuthToken()}`
      //   }
      // });

      // Mock implementation
      await this.simulateNetworkDelay(300);
      
      const allPhotos = this.getPhotosFromLocalStorage();
      const filteredPhotos = allPhotos.filter(photo => photo.id !== photoId);
      
      localStorage.setItem('venuePhotos', JSON.stringify(filteredPhotos));
    } catch (error) {
      console.error('Failed to delete photo:', error);
      throw new Error('Failed to delete photo. Please try again.');
    }
  }

  /**
   * Reorder photos for a venue
   */
  async reorderPhotos(venueId: string, photoIds: string[]): Promise<VenuePhoto[]> {
    try {
      // In real implementation:
      // const response = await fetch(`${this.apiBaseUrl}/${venueId}/photos/reorder`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${getAuthToken()}`
      //   },
      //   body: JSON.stringify({ photoIds })
      // });
      // return await response.json();

      // Mock implementation
      await this.simulateNetworkDelay(300);
      
      const allPhotos = this.getPhotosFromLocalStorage();
      const venuePhotos = allPhotos.filter(photo => photo.venueId === venueId);
      
      // Update order based on the provided array
      const reorderedPhotos = photoIds.map((photoId, index) => {
        const photo = venuePhotos.find(p => p.id === photoId);
        if (photo) {
          return { ...photo, order: index };
        }
        return null;
      }).filter(Boolean) as VenuePhoto[];

      // Update the full photos array
      const otherPhotos = allPhotos.filter(photo => photo.venueId !== venueId);
      const updatedAllPhotos = [...otherPhotos, ...reorderedPhotos];
      
      localStorage.setItem('venuePhotos', JSON.stringify(updatedAllPhotos));
      
      return reorderedPhotos;
    } catch (error) {
      console.error('Failed to reorder photos:', error);
      throw new Error('Failed to reorder photos. Please try again.');
    }
  }

  /**
   * Set a photo as the main photo for a venue
   */
  async setMainPhoto(venueId: string, photoId: string): Promise<VenuePhoto[]> {
    try {
      // In real implementation:
      // const response = await fetch(`${this.apiBaseUrl}/${venueId}/photos/${photoId}/set-main`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${getAuthToken()}`
      //   }
      // });
      // return await response.json();

      // Mock implementation
      await this.simulateNetworkDelay(300);
      
      const allPhotos = this.getPhotosFromLocalStorage();
      const updatedPhotos = allPhotos.map(photo => {
        if (photo.venueId === venueId) {
          return { ...photo, isMainPhoto: photo.id === photoId };
        }
        return photo;
      });
      
      localStorage.setItem('venuePhotos', JSON.stringify(updatedPhotos));
      
      return updatedPhotos.filter(photo => photo.venueId === venueId);
    } catch (error) {
      console.error('Failed to set main photo:', error);
      throw new Error('Failed to set main photo. Please try again.');
    }
  }

  // Helper methods for mock implementation
  private async simulateNetworkDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private savePhotoToLocalStorage(photo: VenuePhoto): void {
    const existingPhotos = this.getPhotosFromLocalStorage();
    existingPhotos.push(photo);
    localStorage.setItem('venuePhotos', JSON.stringify(existingPhotos));
  }

  private getPhotosFromLocalStorage(): VenuePhoto[] {
    try {
      const photosJson = localStorage.getItem('venuePhotos');
      if (!photosJson) return [];
      
      const photos = JSON.parse(photosJson);
      // Convert date strings back to Date objects
      return photos.map((photo: any) => ({
        ...photo,
        uploadedAt: new Date(photo.uploadedAt)
      }));
    } catch (error) {
      console.error('Failed to parse photos from localStorage:', error);
      return [];
    }
  }

  /**
   * Initialize sample data for demo purposes
   */
  async initializeSampleData(venueId: string): Promise<void> {
    const existingPhotos = await this.getVenuePhotos(venueId, true);
    
    if (existingPhotos.length === 0) {
      // Add sample photos for demo
      const samplePhotos: VenuePhoto[] = [
        {
          id: 'sample-1',
          url: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=400&fit=crop&auto=format',
          title: 'Main Hall',
          description: 'Beautiful main hall with stunning architecture',
          isMainPhoto: true,
          isPublic: true,
          uploadedBy: 'Venue Manager',
          uploadedAt: new Date('2024-01-15'),
          order: 0,
          venueId
        },
        {
          id: 'sample-2',
          url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop&auto=format',
          title: 'Event Setup',
          description: 'Example of event setup for performances',
          isMainPhoto: false,
          isPublic: true,
          uploadedBy: 'Event Coordinator',
          uploadedAt: new Date('2024-01-20'),
          order: 1,
          venueId
        },
        {
          id: 'sample-3',
          url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=400&fit=crop&auto=format',
          title: 'Entrance Lobby',
          description: 'Welcoming entrance area',
          isMainPhoto: false,
          isPublic: true,
          uploadedBy: 'Staff Member',
          uploadedAt: new Date('2024-02-01'),
          order: 2,
          venueId
        }
      ];

      // Save sample photos
      const allPhotos = this.getPhotosFromLocalStorage();
      const updatedPhotos = [...allPhotos, ...samplePhotos];
      localStorage.setItem('venuePhotos', JSON.stringify(updatedPhotos));
    }
  }
}

// Export singleton instance
export const venuePhotoService = new VenuePhotoService();
export default venuePhotoService;

// Export types for use in components
export type { VenuePhoto, PhotoUploadRequest }; 