from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import MagazineCategory
from app.schemas.magazine import (
    MagazineCategoryCreate,
    MagazineCategoryUpdate,
    MagazineCategoryResponse
)
from app.core.dependencies import get_current_admin_user
from app.utils.slug import generate_slug

router = APIRouter()

@router.get("/", response_model=List[MagazineCategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    """Get all magazine categories"""
    categories = db.query(MagazineCategory).order_by(MagazineCategory.name).all()
    return categories

@router.get("/{category_id}", response_model=MagazineCategoryResponse)
def get_category(category_id: int, db: Session = Depends(get_db)):
    """Get a specific magazine category by ID"""
    category = db.query(MagazineCategory).filter(MagazineCategory.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    return category

@router.post("/", response_model=MagazineCategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    category_data: MagazineCategoryCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """Create a new magazine category (admin only)"""
    # Generate slug from name
    slug = generate_slug(category_data.name)
    
    # Check if name or slug already exists
    existing_name = db.query(MagazineCategory).filter(MagazineCategory.name == category_data.name).first()
    if existing_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this name already exists"
        )
    
    existing_slug = db.query(MagazineCategory).filter(MagazineCategory.slug == slug).first()
    if existing_slug:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this slug already exists"
        )
    
    # Create new category
    db_category = MagazineCategory(
        name=category_data.name,
        slug=slug
    )
    
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    
    return db_category

@router.put("/{category_id}", response_model=MagazineCategoryResponse)
def update_category(
    category_id: int,
    category_data: MagazineCategoryUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """Update a magazine category (admin only)"""
    category = db.query(MagazineCategory).filter(MagazineCategory.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Update fields if provided
    if category_data.name is not None:
        # Check if new name already exists (excluding current category)
        existing_name = db.query(MagazineCategory).filter(
            MagazineCategory.name == category_data.name,
            MagazineCategory.id != category_id
        ).first()
        if existing_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category with this name already exists"
            )
        
        # Update name and regenerate slug
        category.name = category_data.name
        category.slug = generate_slug(category_data.name)
    
    db.commit()
    db.refresh(category)
    
    return category

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """Delete a magazine category (admin only)"""
    category = db.query(MagazineCategory).filter(MagazineCategory.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Check if category has articles
    if category.articles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete category that contains articles"
        )
    
    db.delete(category)
    db.commit()
    
    return None 