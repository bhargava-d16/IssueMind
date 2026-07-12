from sqlalchemy.orm import Session
from app.models.models import Repository, Issue, Developer, Label
from app.services.embedding_service import EmbeddingService
from app.services.faiss_service import FAISSService
from app.services.ranking_service import RankingService
from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)

class PredictionService:
    def __init__(
        self, 
        embedding_service: EmbeddingService, 
        faiss_service: FAISSService, 
        ranking_service: RankingService
    ):
        self.embedding_service = embedding_service
        self.faiss_service = faiss_service
        self.ranking_service = ranking_service

    def clean_text(self, title: str, description: str) -> str:
        """
        Cleans and joins title and description for embedding generation.
        """
        cleaned_title = title.strip()
        cleaned_desc = description.strip() if description else ""
        return f"{cleaned_title} {cleaned_desc}".strip()

    def predict_developer(
        self, 
        db: Session, 
        repo_id: int, 
        title: str, 
        description: str
    ) -> Dict[str, Any]:
        """
        Predicts best developer for a new issue and finds similar issues.
        """
        # Validate repo exists
        repo = db.query(Repository).filter(Repository.id == repo_id).first()
        if not repo:
            raise ValueError(f"Repository with ID {repo_id} not found.")

        # Clean text & get embedding
        combined_text = self.clean_text(title, description)
        query_vector = self.embedding_service.get_embedding(combined_text)

        # FAISS lookup for similar issues (K=5)
        similar_results = self.faiss_service.search_similarity(repo_id, query_vector, k=5)

        similar_issues_details = []
        for issue_id, sim_score in similar_results:
            # Query db for issue metadata
            issue = db.query(Issue).filter(Issue.id == issue_id).first()
            if issue:
                dev_login = issue.assignee.login if issue.assignee else None
                similar_issues_details.append({
                    "number": issue.number,
                    "title": issue.title,
                    "similarity_score": sim_score,
                    "state": issue.state,
                    "html_url": f"{repo.url}/issues/{issue.number}",
                    "developer": dev_login
                })

        # Load all contributors for this repository
        repo_devs = [
            {
                "id": dev.id,
                "login": dev.login,
                "name": dev.name,
                "avatar_url": dev.avatar_url,
                "html_url": dev.html_url,
                "contributions": dev.contributions
            }
            for dev in repo.developers
        ]

        # Rank developers using similarity outcomes
        rec_dev, confidence, explanation, alternatives = self.ranking_service.rank_developers(
            similar_issues_data=similar_issues_details,
            developers_list=repo_devs
        )

        return {
            "recommended_developer": rec_dev,
            "confidence_score": confidence,
            "explanation": explanation,
            "similar_issues": similar_issues_details,
            "alternative_developers": alternatives
        }
