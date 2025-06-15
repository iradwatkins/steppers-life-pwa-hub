from sqlalchemy import Column, Integer, String, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class BlockType(str, enum.Enum):
    HEADER = "header"
    SUBHEADER = "subheader"
    PARAGRAPH = "paragraph"
    IMAGE = "image"
    YOUTUBE_VIDEO = "youtube_video"
    EMBEDDED_VIDEO = "embedded_video"
    AD_PLACEMENT = "ad_placement"

class ArticleContentBlock(Base):
    """Content block model for flexible article structure"""
    __tablename__ = "article_content_blocks"

    id = Column(Integer, primary_key=True, index=True)
    magazine_article_id = Column(Integer, ForeignKey("magazine_articles.id"), nullable=False)
    type = Column(Enum(BlockType), nullable=False)
    content = Column(Text, nullable=True)  # JSON or text content depending on block type
    order = Column(Integer, nullable=False)  # For maintaining sequence of blocks

    # Relationship
    article = relationship("MagazineArticle", back_populates="content_blocks")

    def __repr__(self):
        return f"<ArticleContentBlock(id={self.id}, type='{self.type}', order={self.order})>" 