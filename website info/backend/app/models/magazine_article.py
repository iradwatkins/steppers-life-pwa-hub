from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class ArticleStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"

class MagazineArticle(Base):
    """Magazine article model"""
    __tablename__ = "magazine_articles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    slug = Column(String(200), unique=True, nullable=False, index=True)
    magazine_category_id = Column(Integer, ForeignKey("magazine_categories.id"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(Enum(ArticleStatus), default=ArticleStatus.DRAFT, nullable=False)
    featured_image = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    category = relationship("MagazineCategory", backref="articles")
    author = relationship("User", backref="magazine_articles")
    content_blocks = relationship("ArticleContentBlock", back_populates="article", cascade="all, delete-orphan", order_by="ArticleContentBlock.order")

    def __repr__(self):
        return f"<MagazineArticle(id={self.id}, title='{self.title}', status='{self.status}')>" 