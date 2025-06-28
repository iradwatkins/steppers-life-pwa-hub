
import React from 'react';
import ImageUploadTest from '@/components/common/ImageUploadTest';

const ImageUploadTestPage: React.FC = () => {
  return (
    <div className="min-h-screen py-8 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Image Upload Testing</h1>
          <p className="text-muted-foreground">
            Test and verify image upload functionality
          </p>
        </div>
        
        <ImageUploadTest />
      </div>
    </div>
  );
};

export default ImageUploadTestPage;
