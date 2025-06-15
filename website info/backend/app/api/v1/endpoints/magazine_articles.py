from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.core.database import get_db
from app.models import MagazineArticle, MagazineCategory, ArticleContentBlock, User
from app.schemas.magazine import (
    MagazineArticleCreate,
    MagazineArticleUpdate,
    MagazineArticleResponse,
    MagazineArticleListResponse,
    ArticleContentBlockCreate
)
from app.core.dependencies import get_current_admin_user
from app.utils.slug import generate_slug

router = APIRouter()

@router.get("/", response_model=MagazineArticleListResponse)
def get_articles(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    category_slug: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get published magazine articles (public endpoint)"""
    query = db.query(MagazineArticle).join(MagazineCategory)
    
    # Filter by published status for public endpoint
    query = query.filter(MagazineArticle.status == "published")
    
    # Filter by category if provided
    if category_slug:
        query = query.filter(MagazineCategory.slug == category_slug)
    
    # Calculate total and pagination
    total = query.count()
    total_pages = (total + limit - 1) // limit
    
    # Apply pagination and ordering
    articles = query.order_by(MagazineArticle.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
    
    return MagazineArticleListResponse(
        articles=articles,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )

@router.get("/admin", response_model=MagazineArticleListResponse)
def get_articles_admin(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    category_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """Get all magazine articles for admin (includes drafts)"""
    query = db.query(MagazineArticle)
    
    # Filter by category if provided
    if category_id:
        query = query.filter(MagazineArticle.magazine_category_id == category_id)
    
    # Filter by status if provided
    if status:
        query = query.filter(MagazineArticle.status == status)
    
    # Search in title if provided
    if search:
        query = query.filter(MagazineArticle.title.ilike(f"%{search}%"))
    
    # Calculate total and pagination
    total = query.count()
    total_pages = (total + limit - 1) // limit
    
    # Apply pagination and ordering
    articles = query.order_by(MagazineArticle.updated_at.desc()).offset((page - 1) * limit).limit(limit).all()
    
    return MagazineArticleListResponse(
        articles=articles,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )

@router.get("/{article_slug}", response_model=MagazineArticleResponse)
def get_article_by_slug(article_slug: str, db: Session = Depends(get_db)):
    """Get a published article by slug (public endpoint)"""
    article = db.query(MagazineArticle).filter(
        and_(
            MagazineArticle.slug == article_slug,
            MagazineArticle.status == "published"
        )
    ).first()
    
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found"
        )
    
    return article

@router.get("/admin/{article_id}", response_model=MagazineArticleResponse)
def get_article_by_id(
    article_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """Get an article by ID (admin only)"""
    article = db.query(MagazineArticle).filter(MagazineArticle.id == article_id).first()
    
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found"
        )
    
    return article

@router.post("/", response_model=MagazineArticleResponse, status_code=status.HTTP_201_CREATED)
def create_article(
    article_data: MagazineArticleCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """Create a new magazine article (admin only)"""
    # Verify category exists
    category = db.query(MagazineCategory).filter(MagazineCategory.id == article_data.magazine_category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category not found"
        )
    
    # Generate slug from title
    existing_slugs = [article.slug for article in db.query(MagazineArticle).all()]
    slug = generate_slug(article_data.title, existing_slugs)
    
    # Create new article
    db_article = MagazineArticle(
        title=article_data.title,
        slug=slug,
        magazine_category_id=article_data.magazine_category_id,
        author_id=current_user.id,
        status=article_data.status,
        featured_image=article_data.featured_image
    )
    
    db.add(db_article)
    db.flush()  # Get the article ID
    
    # Create content blocks
    for block_data in article_data.content_blocks:
        db_block = ArticleContentBlock(
            magazine_article_id=db_article.id,
            type=block_data.type,
            content=block_data.content,
            order=block_data.order
        )
        db.add(db_block)
    
    db.commit()
    db.refresh(db_article)
    
    return db_article

@router.put("/{article_id}", response_model=MagazineArticleResponse)
def update_article(
    article_id: int,
    article_data: MagazineArticleUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """Update a magazine article (admin only)"""
    article = db.query(MagazineArticle).filter(MagazineArticle.id == article_id).first()
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found"
        )
    
    # Update basic fields
    if article_data.title is not None:
        existing_slugs = [a.slug for a in db.query(MagazineArticle).filter(MagazineArticle.id != article_id).all()]
        article.title = article_data.title
        article.slug = generate_slug(article_data.title, existing_slugs)
    
    if article_data.magazine_category_id is not None:
        # Verify category exists
        category = db.query(MagazineCategory).filter(MagazineCategory.id == article_data.magazine_category_id).first()
        if not category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category not found"
            )
        article.magazine_category_id = article_data.magazine_category_id
    
    if article_data.status is not None:
        article.status = article_data.status
    
    if article_data.featured_image is not None:
        article.featured_image = article_data.featured_image
    
    # Update content blocks if provided
    if article_data.content_blocks is not None:
        # Delete existing blocks
        db.query(ArticleContentBlock).filter(ArticleContentBlock.magazine_article_id == article_id).delete()
        
        # Create new blocks
        for block_data in article_data.content_blocks:
            db_block = ArticleContentBlock(
                magazine_article_id=article_id,
                type=block_data.type,
                content=block_data.content,
                order=block_data.order
            )
            db.add(db_block)
    
    db.commit()
    db.refresh(article)
    
    return article

@router.delete("/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_article(
    article_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """Delete a magazine article (admin only)"""
    article = db.query(MagazineArticle).filter(MagazineArticle.id == article_id).first()
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found"
        )
    
    db.delete(article)
    db.commit()
    
    return None

@router.get("/category/{category_slug}", response_model=MagazineArticleListResponse)
def get_articles_by_category(
    category_slug: str,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get published articles by category slug (public endpoint)"""
    # Verify category exists
    category = db.query(MagazineCategory).filter(MagazineCategory.slug == category_slug).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    query = db.query(MagazineArticle).filter(
        and_(
            MagazineArticle.magazine_category_id == category.id,
            MagazineArticle.status == "published"
        )
    )
    
    # Calculate total and pagination
    total = query.count()
    total_pages = (total + limit - 1) // limit
    
    # Apply pagination and ordering
    articles = query.order_by(MagazineArticle.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
    
    return MagazineArticleListResponse(
        articles=articles,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    ) 