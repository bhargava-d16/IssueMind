from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
from app.models.models import RepositoryCache, Repository
import logging

logger = logging.getLogger(__name__)

class CacheService:
    def check_cache(self, db: Session, repo_url: str) -> str:
        """
        Checks cache status for the repo URL.
        Returns: 'INDEXED', 'INDEXING', 'PENDING', 'FAILED', or 'NOT_FOUND'
        """
        cleaned_url = repo_url.strip().rstrip("/")
        
        # Check cache record
        cache_entry = db.query(RepositoryCache).filter(RepositoryCache.repo_url == cleaned_url).first()
        if not cache_entry:
            return "NOT_FOUND"
            
        return cache_entry.status

    def set_status(self, db: Session, repo_url: str, status: str):
        """
        Updates or inserts the cache status for a repo URL.
        """
        cleaned_url = repo_url.strip().rstrip("/")
        cache_entry = db.query(RepositoryCache).filter(RepositoryCache.repo_url == cleaned_url).first()
        
        if not cache_entry:
            cache_entry = RepositoryCache(repo_url=cleaned_url, status=status, last_updated=datetime.utcnow())
            db.add(cache_entry)
        else:
            cache_entry.status = status
            cache_entry.last_updated = datetime.utcnow()
            
        db.commit()
        logger.info(f"Cache status for {cleaned_url} set to {status}")

    def get_repo_by_url(self, db: Session, repo_url: str) -> Optional[Repository]:
        """
        Gets Repository metadata from database if it exists.
        """
        cleaned_url = repo_url.strip().rstrip("/")
        return db.query(Repository).filter(Repository.url == cleaned_url).first()
