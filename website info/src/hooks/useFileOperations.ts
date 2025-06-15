import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export interface StoredFile {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type?: string;
  uploaded_by?: string;
  uploaded_at: string;
  storage_path: string;
}

export const useFileOperations = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Function to determine correct MIME type based on file extension
  const getMimeType = (fileName: string): string => {
    const extension = fileName.toLowerCase().split('.').pop();
    
    const mimeTypes: { [key: string]: string } = {
      'md': 'text/markdown',
      'txt': 'text/plain',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg'
    };
    
    return mimeTypes[extension || ''] || 'application/octet-stream';
  };

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw new Error("Authentication error: " + userError.message);
      }
      
      if (!user) {
        toast.error("Authentication required", {
          description: "Please sign in to upload files",
          duration: 3000,
        });
        return;
      }

      console.log('Uploading files as user:', user.email);
      const uploadedFiles: StoredFile[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = file.name;
        const storagePath = `${user.id}/${Date.now()}-${fileName}`;
        const correctMimeType = getMimeType(fileName);

        console.log(`Uploading file ${i + 1}/${files.length}: ${fileName} (MIME: ${correctMimeType})`);

        // Create a new File object with the correct MIME type
        const correctedFile = new File([file], fileName, {
          type: correctMimeType,
          lastModified: file.lastModified
        });

        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('docs')
          .upload(storagePath, correctedFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          toast.error(`Failed to upload ${fileName}`, {
            description: uploadError.message,
            duration: 3000,
          });
          continue;
        }

        console.log('File uploaded to storage:', uploadData.path);

        // Store file metadata in database
        const { data: dbData, error: dbError } = await supabase
          .from('uploaded_files')
          .insert({
            file_name: fileName,
            file_path: `docs/${fileName}`,
            file_size: file.size,
            mime_type: correctMimeType,
            uploaded_by: user.id,
            storage_path: storagePath
          })
          .select()
          .single();

        if (dbError) {
          console.error('Database insert error:', dbError);
          // Try to clean up the uploaded file
          await supabase.storage
            .from('docs')
            .remove([storagePath]);
          
          toast.error(`Failed to save metadata for ${fileName}`, {
            description: dbError.message,
            duration: 3000,
          });
          continue;
        }

        console.log('File metadata saved:', dbData);
        uploadedFiles.push(dbData);
        setUploadProgress(((i + 1) / files.length) * 100);
      }

      if (uploadedFiles.length > 0) {
        toast.success("Files uploaded successfully!", {
          description: `${uploadedFiles.length} file(s) uploaded to Supabase Storage`,
          duration: 3000,
        });
      }

      return uploadedFiles;
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error("Upload failed", {
        description: error.message || "Please try again",
        duration: 3000,
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteFile = async (file: StoredFile) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Authentication required to delete files");
        return false;
      }

      console.log('Deleting file:', file.file_name);

      // Delete from storage first
      const { error: storageError } = await supabase.storage
        .from('docs')
        .remove([file.storage_path]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
        throw storageError;
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('uploaded_files')
        .delete()
        .eq('id', file.id);

      if (dbError) {
        console.error('Database delete error:', dbError);
        throw dbError;
      }

      toast.success("File deleted successfully", {
        description: `${file.file_name} has been removed`,
        duration: 3000,
      });

      return true;
    } catch (error: any) {
      console.error('Delete failed:', error);
      toast.error("Failed to delete file", {
        description: error.message || "Please try again",
        duration: 3000,
      });
      return false;
    }
  };

  const getFileUrl = (storagePath: string) => {
    const { data } = supabase.storage
      .from('docs')
      .getPublicUrl(storagePath);
    
    return data.publicUrl;
  };

  return {
    uploadFiles,
    deleteFile,
    getFileUrl,
    isUploading,
    uploadProgress
  };
};
