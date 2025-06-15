from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pathlib import Path
import logging

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.file_upload import FileUploadService
from app.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/image", status_code=status.HTTP_201_CREATED)
async def upload_image(
    file: UploadFile = File(...),
    create_thumbnail: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Upload an image file."""
    
    try:
        # Save the image
        filename, thumbnail_filename = await FileUploadService.save_image(
            file=file,
            resize=True,
            thumbnail=create_thumbnail
        )
        
        # Generate URLs
        image_url = FileUploadService.get_file_url(filename, 'image')
        thumbnail_url = None
        if thumbnail_filename:
            thumbnail_url = FileUploadService.get_file_url(thumbnail_filename, 'image')
        
        logger.info(f"Image uploaded by user {current_user.id}: {filename}")
        
        return {
            "filename": filename,
            "url": image_url,
            "thumbnail_filename": thumbnail_filename,
            "thumbnail_url": thumbnail_url,
            "message": "Image uploaded successfully"
        }
        
    except Exception as e:
        logger.error(f"Image upload failed for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Image upload failed"
        )

@router.post("/images", status_code=status.HTTP_201_CREATED)
async def upload_multiple_images(
    files: List[UploadFile] = File(...),
    create_thumbnails: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Upload multiple image files."""
    
    if len(files) > 10:  # Limit to 10 files at once
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 10 files allowed per upload"
        )
    
    uploaded_files = []
    failed_files = []
    
    for file in files:
        try:
            # Save each image
            filename, thumbnail_filename = await FileUploadService.save_image(
                file=file,
                resize=True,
                thumbnail=create_thumbnails
            )
            
            # Generate URLs
            image_url = FileUploadService.get_file_url(filename, 'image')
            thumbnail_url = None
            if thumbnail_filename:
                thumbnail_url = FileUploadService.get_file_url(thumbnail_filename, 'image')
            
            uploaded_files.append({
                "original_filename": file.filename,
                "filename": filename,
                "url": image_url,
                "thumbnail_filename": thumbnail_filename,
                "thumbnail_url": thumbnail_url
            })
            
        except Exception as e:
            logger.error(f"Failed to upload {file.filename}: {str(e)}")
            failed_files.append({
                "filename": file.filename,
                "error": str(e)
            })
    
    logger.info(f"Batch upload by user {current_user.id}: {len(uploaded_files)} successful, {len(failed_files)} failed")
    
    return {
        "uploaded_files": uploaded_files,
        "failed_files": failed_files,
        "total_uploaded": len(uploaded_files),
        "total_failed": len(failed_files)
    }

@router.post("/document", status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Upload a document file."""
    
    try:
        # Save the document
        filename = await FileUploadService.save_document(file)
        
        # Generate URL
        document_url = FileUploadService.get_file_url(filename, 'document')
        
        logger.info(f"Document uploaded by user {current_user.id}: {filename}")
        
        return {
            "filename": filename,
            "url": document_url,
            "original_filename": file.filename,
            "message": "Document uploaded successfully"
        }
        
    except Exception as e:
        logger.error(f"Document upload failed for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Document upload failed"
        )

@router.delete("/file/{filename}")
def delete_file(
    filename: str,
    file_type: str = "image",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Delete an uploaded file."""
    
    # Check if user has permission (admin/moderator or file owner)
    # Note: In a production system, you'd want to track file ownership
    if current_user.role.value not in ["admin", "moderator"]:
        # For now, allow users to delete files (you might want to add ownership tracking)
        pass
    
    try:
        # Check if file exists
        if not FileUploadService.file_exists(filename, file_type):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found"
            )
        
        # Delete the file
        success = FileUploadService.delete_file(filename, file_type)
        
        if success:
            logger.info(f"File deleted by user {current_user.id}: {filename}")
            return {"message": "File deleted successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete file"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"File deletion failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="File deletion failed"
        )

@router.get("/images/{filename}")
def get_image(filename: str):
    """Serve an uploaded image file."""
    
    base_path = Path(settings.UPLOAD_PATH)
    file_path = base_path / 'images' / filename
    
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    
    return FileResponse(
        path=file_path,
        media_type="image/jpeg",
        filename=filename
    )

@router.get("/documents/{filename}")
def get_document(filename: str):
    """Serve an uploaded document file."""
    
    base_path = Path(settings.UPLOAD_PATH)
    file_path = base_path / 'documents' / filename
    
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Determine media type based on extension
    file_ext = file_path.suffix.lower()
    media_type_map = {
        '.pdf': 'application/pdf',
        '.txt': 'text/plain',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    }
    
    media_type = media_type_map.get(file_ext, 'application/octet-stream')
    
    return FileResponse(
        path=file_path,
        media_type=media_type,
        filename=filename
    )

@router.get("/config")
def get_upload_config(
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get file upload configuration."""
    
    return {
        "max_file_size_mb": settings.MAX_FILE_SIZE_MB,
        "allowed_image_extensions": list(FileUploadService.ALLOWED_IMAGE_EXTENSIONS),
        "allowed_document_extensions": list(FileUploadService.ALLOWED_DOCUMENT_EXTENSIONS),
        "max_image_dimensions": FileUploadService.MAX_IMAGE_SIZE,
        "upload_path": "/uploads"
    } 