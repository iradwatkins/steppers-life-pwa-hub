import re
import unicodedata
from typing import Optional

def generate_slug(title: str, existing_slugs: Optional[list] = None) -> str:
    """
    Generate a URL-friendly slug from a title.
    
    Args:
        title: The title to convert to a slug
        existing_slugs: Optional list of existing slugs to avoid duplicates
        
    Returns:
        A URL-friendly slug
    """
    # Convert to lowercase
    slug = title.lower()
    
    # Remove accents
    slug = unicodedata.normalize('NFKD', slug).encode('ASCII', 'ignore').decode('ASCII')
    
    # Replace spaces and special characters with hyphens
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    
    # Remove leading/trailing hyphens
    slug = slug.strip('-')
    
    # Remove duplicate hyphens
    slug = re.sub(r'-+', '-', slug)
    
    # If slug exists, append a number
    if existing_slugs and slug in existing_slugs:
        counter = 1
        while f"{slug}-{counter}" in existing_slugs:
            counter += 1
        slug = f"{slug}-{counter}"
    
    return slug 