from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import math

from app.database.connection import get_db
from app.models.models import Repository, Issue, Developer, Label, Prediction, RepositoryCache
from app.schemas.schemas import (
    AnalyzeRequest, AnalyzeResponse, PredictRequest, PredictResponse, 
    StatsResponse, RepositoryResponse, DeveloperResponse, IssueResponse
)
from app.services.github_service import GitHubService
from app.services.embedding_service import EmbeddingService
from app.services.faiss_service import FAISSService
from app.services.ranking_service import RankingService
from app.services.prediction_service import PredictionService
from app.services.cache_service import CacheService
from app.workers.tasks import index_repository_task

router = APIRouter(prefix="/api")

# Instantiate Services
github_service = GitHubService()
embedding_service = EmbeddingService()
faiss_service = FAISSService()
ranking_service = RankingService()
prediction_service = PredictionService(embedding_service, faiss_service, ranking_service)
cache_service = CacheService()


@router.post("/analyze", response_model=AnalyzeResponse)
def analyze_repository(
    request: AnalyzeRequest, 
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db)
):
    """
    Triggers repository data extraction, SQLAlchemy storage, embedding generation,
    and FAISS indexing in the background.
    """
    repo_url = request.repo_url.strip().rstrip("/")
    
    try:
        owner, repo_name = github_service.parse_repo_url(repo_url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Check Cache Status
    status = cache_service.check_cache(db, repo_url)
    
    if status == "INDEXING":
        return AnalyzeResponse(
            status="indexing",
            message="Repository is already in the process of being indexed.",
            repo_url=repo_url
        )
    
    if status == "INDEXED":
        return AnalyzeResponse(
            status="indexed",
            message="Repository is already indexed. Loaded from local cache.",
            repo_url=repo_url
        )

    # Trigger background task
    cache_service.set_status(db, repo_url, "PENDING")
    background_tasks.add_task(
        index_repository_task,
        repo_url,
        github_service,
        embedding_service,
        faiss_service,
        cache_service
    )

    return AnalyzeResponse(
        status="indexing",
        message="Repository analysis and embedding index construction started in background.",
        repo_url=repo_url
    )


@router.post("/predict", response_model=PredictResponse)
def predict_developer(
    request: PredictRequest, 
    db: Session = Depends(get_db)
):
    """
    Predicts the best developer for a new issue and finds similar issues.
    """
    try:
        prediction_result = prediction_service.predict_developer(
            db=db,
            repo_id=request.repo_id,
            title=request.title,
            description=request.description
        )

        # Log prediction to SQL database
        rec_dev = prediction_result.get("recommended_developer")
        log_entry = Prediction(
            repo_id=request.repo_id,
            title=request.title,
            description=request.description,
            recommended_developer_id=rec_dev.get("id") if rec_dev else None,
            confidence=prediction_result.get("confidence_score", 0.0),
            explanation=prediction_result.get("explanation", "")
        )
        db.add(log_entry)
        db.commit()

        return prediction_result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@router.get("/repositories", response_model=List[RepositoryResponse])
def get_repositories(db: Session = Depends(get_db)):
    """
    List all indexed repositories.
    """
    return db.query(Repository).all()


@router.get("/stats", response_model=StatsResponse)
def get_repository_stats(
    repo_id: int = Query(..., description="Database ID of the repository"), 
    db: Session = Depends(get_db)
):
    """
    Retrieve repository intelligence and statistics for visualization.
    """
    repo = db.query(Repository).filter(Repository.id == repo_id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    contributors_count = len(repo.developers)
    issues_count = db.query(Issue).filter(Issue.repo_id == repo_id).count()
    
    # Load index to count embeddings
    embeddings_count = 0
    if faiss_service.load_index(repo_id):
        idx_data = faiss_service.indices[repo_id]
        embeddings_count = len(idx_data["ids"])

    return StatsResponse(
        repository=f"{repo.owner}/{repo.name}",
        stars=repo.stars,
        forks=repo.forks,
        contributors_count=contributors_count,
        issues_count=issues_count,
        embeddings_count=embeddings_count,
        status=repo.status
    )


@router.get("/issues", response_model=List[IssueResponse])
def get_issues(
    repo_id: int = Query(..., description="Database ID of the repository"),
    q: Optional[str] = Query(None, description="Semantic query to search issues"),
    db: Session = Depends(get_db)
):
    """
    Retrieves issues. If 'q' parameter is specified, executes a semantic FAISS search.
    Otherwise, returns general list.
    """
    repo = db.query(Repository).filter(Repository.id == repo_id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    if not q:
        # Standard retrieve
        return db.query(Issue).filter(Issue.repo_id == repo_id).limit(100).all()

    # Semantic Search
    query_vector = embedding_service.get_embedding(q)
    similar_results = faiss_service.search_similarity(repo_id, query_vector, k=15)

    if not similar_results:
        return []

    # Map FAISS scores and sort
    issue_id_map = {issue_id: score for issue_id, score in similar_results}
    issues = db.query(Issue).filter(Issue.id.in_(issue_id_map.keys())).all()
    
    # Sort issues according to the scores returned by FAISS
    issues_sorted = sorted(issues, key=lambda x: issue_id_map.get(x.id, 0.0), reverse=True)
    return issues_sorted


@router.get("/developers", response_model=List[DeveloperResponse])
def get_developers(
    repo_id: int = Query(..., description="Database ID of the repository"),
    db: Session = Depends(get_db)
):
    """
    Retrieves contributors for a repository.
    """
    repo = db.query(Repository).filter(Repository.id == repo_id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    return repo.developers


@router.get("/developers/{developer_login}")
def get_developer_profile(
    developer_login: str,
    repo_id: int = Query(..., description="Database ID of the repository"),
    db: Session = Depends(get_db)
):
    """
    Retrieves comprehensive intelligence profile for a developer in the context of a repo.
    """
    dev = db.query(Developer).filter(Developer.login == developer_login).first()
    if not dev:
        raise HTTPException(status_code=404, detail="Developer profile not found")

    # Find issues solved (assigned and closed) by this developer
    resolved_issues = db.query(Issue).filter(
        Issue.repo_id == repo_id,
        Issue.assignee_id == dev.id,
        Issue.state == "closed"
    ).all()

    # Calculate expertise areas (Top labels resolved)
    label_counts = {}
    for issue in resolved_issues:
        for lbl in issue.labels:
            label_counts[lbl.name] = label_counts.get(lbl.name, 0) + 1
    
    sorted_labels = sorted(label_counts.items(), key=lambda x: x[1], reverse=True)
    top_labels = [{"name": name, "count": count} for name, count in sorted_labels[:5]]

    # AI Generated Expertise Score: Logarithmic scale based on solved issues and label diversity
    # Score ranges between 10 and 100
    base_score = 10
    solved_count = len(resolved_issues)
    if solved_count > 0:
        base_score += min(int(math.log(solved_count + 1, 2) * 20), 70)
        base_score += min(len(label_counts) * 4, 20)
    base_score = min(base_score, 100)

    # Activity history
    recent_activity = [
        {
            "id": issue.id,
            "number": issue.number,
            "title": issue.title,
            "state": issue.state,
            "closed_at": issue.created_at.strftime("%Y-%m-%d") # fallback
        }
        for issue in resolved_issues[:5]
    ]

    return {
        "login": dev.login,
        "name": dev.name or dev.login,
        "avatar_url": dev.avatar_url,
        "html_url": dev.html_url,
        "contributions": dev.contributions,
        "issues_solved_count": len(resolved_issues),
        "top_labels": top_labels,
        "expertise_score": base_score,
        "recent_activity": recent_activity
    }
