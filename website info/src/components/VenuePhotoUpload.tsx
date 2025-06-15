import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  X, 
  Camera, 
  Image as ImageIcon, 
  Save, 
  Trash2,
  Eye,
  EyeOff,
  Star
} from 'lucide-react';
import venuePhotoService, { type VenuePhoto } from '@/services/venuePhotoService';

interface VenuePhotoUploadProps {
  venueId: string;
  existingPhotos: VenuePhoto[];
  onPhotosUpdated: (photos: VenuePhoto[]) => void;
  canEdit: boolean;
}

const VenuePhotoUpload: React.FC<VenuePhotoUploadProps> = ({
  venueId,
  existingPhotos,
  onPhotosUpdated,
  canEdit
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<VenuePhoto[]>(existingPhotos);
  const [uploading, setUploading] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter(file => {
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported image format. Use PNG, JPG, or WEBP.`,
          variant: "destructive"
        });
        return false;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 5MB. Please compress the image.`,
          variant: "destructive"
        });
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);

    try {
      const uploadPromises = validFiles.map(async (file) => {
        const uploadRequest = {
          file,
          title: file.name.replace(/\.[^/.]+$/, ""),
          description: '',
          isMainPhoto: photos.length === 0, // First photo is main by default
          isPublic: true,
          venueId
        };

        return await venuePhotoService.uploadPhoto(uploadRequest);
      });

      const newPhotos = await Promise.all(uploadPromises);
      const updatedPhotos = [...photos, ...newPhotos];
      
      setPhotos(updatedPhotos);
      onPhotosUpdated(updatedPhotos);

      toast({
        title: "Photos uploaded",
        description: `${newPhotos.length} photo(s) uploaded successfully and saved to database.`
      });

    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload photos. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const updatePhoto = async (photoId: string, updates: Partial<VenuePhoto>) => {
    try {
      const updatedPhoto = await venuePhotoService.updatePhoto(photoId, updates);
      
      const updatedPhotos = photos.map(photo => 
        photo.id === photoId ? updatedPhoto : photo
      );
      
      setPhotos(updatedPhotos);
      onPhotosUpdated(updatedPhotos);

      toast({
        title: "Photo updated",
        description: "Photo details have been saved to database."
      });
    } catch (error) {
      console.error('Update failed:', error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update photo. Please try again.",
        variant: "destructive"
      });
    }
  };

  const deletePhoto = async (photoId: string) => {
    try {
      await venuePhotoService.deletePhoto(photoId);
      
      const updatedPhotos = photos.filter(photo => photo.id !== photoId);
      
      // If we're deleting the main photo, make the first remaining photo main
      if (updatedPhotos.length > 0) {
        const deletedPhoto = photos.find(p => p.id === photoId);
        if (deletedPhoto?.isMainPhoto) {
          await venuePhotoService.updatePhoto(updatedPhotos[0].id, { isMainPhoto: true });
          updatedPhotos[0].isMainPhoto = true;
        }
      }
      
      setPhotos(updatedPhotos);
      onPhotosUpdated(updatedPhotos);

      toast({
        title: "Photo deleted",
        description: "Photo has been removed from the database."
      });
    } catch (error) {
      console.error('Delete failed:', error);
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete photo. Please try again.",
        variant: "destructive"
      });
    }
  };

  const setMainPhoto = async (photoId: string) => {
    try {
      const updatedPhotos = await venuePhotoService.setMainPhoto(venueId, photoId);
      setPhotos(updatedPhotos);
      onPhotosUpdated(updatedPhotos);

      toast({
        title: "Main photo updated",
        description: "Main photo has been set and saved to database."
      });
    } catch (error) {
      console.error('Set main photo failed:', error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to set main photo. Please try again.",
        variant: "destructive"
      });
    }
  };

  const toggleVisibility = async (photoId: string, currentVisibility: boolean) => {
    await updatePhoto(photoId, { isPublic: !currentVisibility });
  };

  if (!canEdit) {
    return null; // Don't show upload interface if user can't edit
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Manage Venue Photos
          <Badge variant="outline" className="ml-auto">
            {photos.length} photos
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Section */}
        <div className="border-2 border-dashed border-border-default rounded-lg p-6 text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-text-secondary mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">
            Upload Venue Photos
          </h3>
          <p className="text-text-secondary mb-4">
            Add high-quality photos to showcase your venue. Photos are automatically saved to the database.
          </p>
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="mb-2"
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading to Database...' : 'Choose Photos'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={handleFileSelect}
            multiple
            className="hidden"
          />
          <p className="text-xs text-text-secondary">
            PNG, JPG, WEBP formats • Max 5MB each • Multiple selection supported
          </p>
        </div>

        {/* Photo Gallery Management */}
        {photos.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-text-primary">
                Current Photos ({photos.length})
              </h4>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Main Photo</span>
                <div className="w-3 h-3 bg-green-100 border border-green-600 rounded-full ml-3"></div>
                <span>Public</span>
                <div className="w-3 h-3 bg-gray-100 border border-gray-600 rounded-full ml-3"></div>
                <span>Private</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <Card key={photo.id} className="overflow-hidden">
                  <div className="relative">
                    <img 
                      src={photo.url} 
                      alt={photo.title}
                      className="w-full h-48 object-cover"
                    />
                    
                    {/* Photo badges */}
                    <div className="absolute top-2 left-2 flex gap-1">
                      {photo.isMainPhoto && (
                        <Badge className="bg-yellow-500 text-white">
                          <Star className="w-3 h-3 mr-1" />
                          Main
                        </Badge>
                      )}
                      <Badge 
                        variant={photo.isPublic ? "default" : "secondary"}
                        className={photo.isPublic ? "bg-green-100 text-green-800" : ""}
                      >
                        {photo.isPublic ? (
                          <>
                            <Eye className="w-3 h-3 mr-1" />
                            Public
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 mr-1" />
                            Private
                          </>
                        )}
                      </Badge>
                    </div>

                    {/* Action buttons */}
                    <div className="absolute top-2 right-2 flex gap-1">
                      {!photo.isMainPhoto && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 bg-white/90 hover:bg-white"
                          onClick={() => setMainPhoto(photo.id)}
                          title="Set as main photo"
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 bg-white/90 hover:bg-white"
                        onClick={() => toggleVisibility(photo.id, photo.isPublic)}
                        title={photo.isPublic ? "Make private" : "Make public"}
                      >
                        {photo.isPublic ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 bg-white/90 hover:bg-white text-red-600"
                        onClick={() => deletePhoto(photo.id)}
                        title="Delete photo from database"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-3">
                    {editingPhoto === photo.id ? (
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor={`title-${photo.id}`}>Title</Label>
                          <Input
                            id={`title-${photo.id}`}
                            value={photo.title}
                            onChange={(e) => updatePhoto(photo.id, { title: e.target.value })}
                            placeholder="Photo title"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`description-${photo.id}`}>Description</Label>
                          <Textarea
                            id={`description-${photo.id}`}
                            value={photo.description}
                            onChange={(e) => updatePhoto(photo.id, { description: e.target.value })}
                            placeholder="Photo description"
                            rows={2}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => setEditingPhoto(null)}
                          >
                            <Save className="w-3 h-3 mr-1" />
                            Done
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h5 className="font-medium text-sm mb-1">{photo.title}</h5>
                        {photo.description && (
                          <p className="text-xs text-text-secondary mb-2 line-clamp-2">
                            {photo.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-xs text-text-secondary">
                          <span>by {photo.uploadedBy}</span>
                          <div className="flex items-center gap-2">
                            <span>{new Date(photo.uploadedAt).toLocaleDateString()}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingPhoto(photo.id)}
                              className="h-6 px-2"
                            >
                              Edit
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Upload Guidelines */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h5 className="font-medium text-blue-900 mb-2">Photo Guidelines & Database Storage</h5>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use high-resolution images (at least 1200x800 pixels)</li>
            <li>• Show different angles and areas of your venue</li>
            <li>• Include setup photos for different event types</li>
            <li>• Photos are automatically saved to the database</li>
            <li>• First photo becomes the main venue image</li>
            <li>• Private photos are only visible to venue managers</li>
          </ul>
        </div>

        {/* Database Status */}
        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-800">
              Database Connected - All changes are automatically saved
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VenuePhotoUpload; 