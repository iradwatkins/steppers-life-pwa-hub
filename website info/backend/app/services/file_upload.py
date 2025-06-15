"""
File upload service for handling image and file uploads.
"""

import os
import shutil
import uuid
from pathlib import Path
from typing import List, Optional, Tuple
from fastapi import UploadFile, HTTPException
from PIL import Image
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

class FileUploadService:
    """Service for handling file uploads with validation and storage."""
    
    ALLOWED_IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
    ALLOWED_DOCUMENT_EXTENSIONS = {'.pdf', '.txt', '.doc', '.docx'}
    
    MAX_IMAGE_SIZE = (2048, 2048)  # Max dimensions for images
    
    @staticmethod
    def create_upload_directories():
        """Create upload directories if they don't exist."""
        base_path = Path(settings.UPLOAD_PATH)
        directories = ['images', 'documents', 'temp']
        
        for directory in directories:
            dir_path = base_path / directory
            dir_path.mkdir(parents=True, exist_ok=True)
    
    @staticmethod
    def validate_file(file: UploadFile, file_type: str = 'image') -> bool:
        """
        Validate uploaded file.
        
        Args:
            file: FastAPI UploadFile object
            file_type: Type of file ('image' or 'document')
            
        Returns:
            True if valid, raises HTTPException if invalid
        """
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
        
        # Check file extension
        file_ext = Path(file.filename).suffix.lower()
        
        if file_type == 'image':
            if file_ext not in FileUploadService.ALLOWED_IMAGE_EXTENSIONS:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid image format. Allowed: {', '.join(FileUploadService.ALLOWED_IMAGE_EXTENSIONS)}"
                )
        elif file_type == 'document':
            if file_ext not in FileUploadService.ALLOWED_DOCUMENT_EXTENSIONS:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid document format. Allowed: {', '.join(FileUploadService.ALLOWED_DOCUMENT_EXTENSIONS)}"
                )
        
        # Check file size (FastAPI handles this but we can add custom limits)
        if hasattr(file, 'size') and file.size:
            max_size = settings.MAX_FILE_SIZE_MB * 1024 * 1024  # Convert to bytes
            if file.size > max_size:
                raise HTTPException(
                    status_code=400, 
                    detail=f"File too large. Maximum size: {settings.MAX_FILE_SIZE_MB}MB"
                )
        
        return True
    
    @staticmethod
    def generate_filename(original_filename: str) -> str:
        """
        Generate a unique filename while preserving the extension.
        
        Args:
            original_filename: Original filename
            
        Returns:
            Unique filename with timestamp and UUID
        """
        file_ext = Path(original_filename).suffix.lower()
        unique_id = str(uuid.uuid4())
        return f"{unique_id}{file_ext}"
    
    @staticmethod
    async def save_image(
        file: UploadFile, 
        resize: bool = True,
        thumbnail: bool = False
    ) -> Tuple[str, Optional[str]]:
        """
        Save an uploaded image file with optional resizing.
        
        Args:
            file: FastAPI UploadFile object
            resize: Whether to resize large images
            thumbnail: Whether to create a thumbnail
            
        Returns:
            Tuple of (filename, thumbnail_filename)
        """
        FileUploadService.validate_file(file, 'image')
        FileUploadService.create_upload_directories()
        
        # Generate unique filename
        filename = FileUploadService.generate_filename(file.filename)
        
        # Create file paths
        base_path = Path(settings.UPLOAD_PATH)
        image_path = base_path / 'images' / filename
        thumbnail_path = None
        thumbnail_filename = None
        
        try:
            # Save the uploaded file temporarily
            temp_path = base_path / 'temp' / filename
            with open(temp_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            # Process image with PIL
            with Image.open(temp_path) as img:
                # Convert to RGB if necessary
                if img.mode in ('RGBA', 'LA', 'P'):
                    rgb_img = Image.new('RGB', img.size, (255, 255, 255))
                    if img.mode == 'P':
                        img = img.convert('RGBA')
                    rgb_img.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
                    img = rgb_img
                
                # Resize if needed
                if resize and (img.width > FileUploadService.MAX_IMAGE_SIZE[0] or 
                              img.height > FileUploadService.MAX_IMAGE_SIZE[1]):
                    img.thumbnail(FileUploadService.MAX_IMAGE_SIZE, Image.Resampling.LANCZOS)
                
                # Save the processed image
                img.save(image_path, 'JPEG', quality=85, optimize=True)
                
                # Create thumbnail if requested
                if thumbnail:
                    thumbnail_filename = f"thumb_{filename}"
                    thumbnail_path = base_path / 'images' / thumbnail_filename
                    
                    thumb_img = img.copy()
                    thumb_img.thumbnail((300, 300), Image.Resampling.LANCZOS)
                    thumb_img.save(thumbnail_path, 'JPEG', quality=80, optimize=True)
            
            # Remove temporary file
            temp_path.unlink()
            
            logger.info(f"Image saved: {filename}")
            return filename, thumbnail_filename
            
        except Exception as e:
            # Clean up on error
            if temp_path.exists():
                temp_path.unlink()
            if image_path.exists():
                image_path.unlink()
            if thumbnail_path and thumbnail_path.exists():
                thumbnail_path.unlink()
                
            logger.error(f"Image save failed: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to save image")
    
    @staticmethod
    async def save_document(file: UploadFile) -> str:
        """
        Save an uploaded document file.
        
        Args:
            file: FastAPI UploadFile object
            
        Returns:
            Saved filename
        """
        FileUploadService.validate_file(file, 'document')
        FileUploadService.create_upload_directories()
        
        # Generate unique filename
        filename = FileUploadService.generate_filename(file.filename)
        
        # Create file path
        base_path = Path(settings.UPLOAD_PATH)
        file_path = base_path / 'documents' / filename
        
        try:
            # Save the uploaded file
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            logger.info(f"Document saved: {filename}")
            return filename
            
        except Exception as e:
            # Clean up on error
            if file_path.exists():
                file_path.unlink()
                
            logger.error(f"Document save failed: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to save document")
    
    @staticmethod
    def delete_file(filename: str, file_type: str = 'image') -> bool:
        """
        Delete a file from storage.
        
        Args:
            filename: Name of file to delete
            file_type: Type of file ('image' or 'document')
            
        Returns:
            True if deleted successfully
        """
        try:
            base_path = Path(settings.UPLOAD_PATH)
            
            if file_type == 'image':
                file_path = base_path / 'images' / filename
                # Also try to delete thumbnail
                thumb_filename = f"thumb_{filename}"
                thumb_path = base_path / 'images' / thumb_filename
                if thumb_path.exists():
                    thumb_path.unlink()
            else:
                file_path = base_path / 'documents' / filename
            
            if file_path.exists():
                file_path.unlink()
                logger.info(f"File deleted: {filename}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"File deletion failed: {str(e)}")
            return False
    
    @staticmethod
    def get_file_url(filename: str, file_type: str = 'image') -> str:
        """
        Get the URL for accessing a file.
        
        Args:
            filename: Name of the file
            file_type: Type of file ('image' or 'document')
            
        Returns:
            URL path for the file
        """
        return f"/uploads/{file_type}s/{filename}"
    
    @staticmethod
    def file_exists(filename: str, file_type: str = 'image') -> bool:
        """
        Check if a file exists in storage.
        
        Args:
            filename: Name of the file
            file_type: Type of file ('image' or 'document')
            
        Returns:
            True if file exists
        """
        base_path = Path(settings.UPLOAD_PATH)
        
        if file_type == 'image':
            file_path = base_path / 'images' / filename
        else:
            file_path = base_path / 'documents' / filename
        
        return file_path.exists() 