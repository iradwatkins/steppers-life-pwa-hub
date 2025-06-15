from typing import List, Optional, Union
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

# Enums
class ArticleStatusSchema(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"

class BlockTypeSchema(str, Enum):
    HEADER = "header"
    SUBHEADER = "subheader"
    PARAGRAPH = "paragraph"
    IMAGE = "image"
    YOUTUBE_VIDEO = "youtube_video"
    EMBEDDED_VIDEO = "embedded_video"
    AD_PLACEMENT = "ad_placement"

# Category Schemas
class MagazineCategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)

class MagazineCategoryCreate(MagazineCategoryBase):
    pass

class MagazineCategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)

class MagazineCategoryResponse(MagazineCategoryBase):
    id: int
    slug: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Content Block Schemas
class ArticleContentBlockBase(BaseModel):
    type: BlockTypeSchema
    content: Optional[str] = None
    order: int

class ArticleContentBlockCreate(ArticleContentBlockBase):
    pass

class ArticleContentBlockUpdate(BaseModel):
    type: Optional[BlockTypeSchema] = None
    content: Optional[str] = None
    order: Optional[int] = None

class ArticleContentBlockResponse(ArticleContentBlockBase):
    id: int

    class Config:
        from_attributes = True

# Article Schemas
class MagazineArticleBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    magazine_category_id: int
    status: ArticleStatusSchema = ArticleStatusSchema.DRAFT
    featured_image: Optional[str] = None

class MagazineArticleCreate(MagazineArticleBase):
    content_blocks: List[ArticleContentBlockCreate] = []

class MagazineArticleUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    magazine_category_id: Optional[int] = None
    status: Optional[ArticleStatusSchema] = None
    featured_image: Optional[str] = None
    content_blocks: Optional[List[ArticleContentBlockCreate]] = None

class MagazineArticleResponse(MagazineArticleBase):
    id: int
    slug: str
    author_id: int
    created_at: datetime
    updated_at: datetime
    content_blocks: List[ArticleContentBlockResponse] = []
    category: Optional[MagazineCategoryResponse] = None

    class Config:
        from_attributes = True

# List response schema
class MagazineArticleListResponse(BaseModel):
    articles: List[MagazineArticleResponse]
    total: int
    page: int
    limit: int
    total_pages: int 