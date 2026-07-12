from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# Common Sub-Models
class DeveloperResponse(BaseModel):
    id: int
    login: str
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    html_url: Optional[str] = None
    contributions: int

    class Config:
        from_attributes = True

class LabelResponse(BaseModel):
    id: int
    name: str
    color: Optional[str] = None

    class Config:
        from_attributes = True

class IssueResponse(BaseModel):
    id: int
    github_id: int
    number: int
    title: str
    body: Optional[str] = None
    state: str
    created_at: datetime
    assignee: Optional[DeveloperResponse] = None
    labels: List[LabelResponse] = []

    class Config:
        from_attributes = True

class RepositoryResponse(BaseModel):
    id: int
    url: str
    owner: str
    name: str
    stars: int
    forks: int
    indexed_at: datetime
    status: str

    class Config:
        from_attributes = True

# API Request/Response Schemas
class AnalyzeRequest(BaseModel):
    repo_url: str = Field(..., description="Full GitHub Repository URL, e.g. https://github.com/facebook/react")

class AnalyzeResponse(BaseModel):
    status: str
    message: str
    repo_url: str

class PredictRequest(BaseModel):
    repo_id: int
    title: str = Field(..., min_length=3)
    description: Optional[str] = ""

class SimilarIssueDetail(BaseModel):
    number: int
    title: str
    similarity_score: float
    state: str
    html_url: Optional[str] = None
    developer: Optional[str] = None

class AlternativeDeveloperDetail(BaseModel):
    developer: DeveloperResponse
    score: float

class PredictResponse(BaseModel):
    recommended_developer: Optional[DeveloperResponse] = None
    confidence_score: float
    explanation: str
    similar_issues: List[SimilarIssueDetail] = []
    alternative_developers: List[AlternativeDeveloperDetail] = []

class StatsResponse(BaseModel):
    repository: str
    stars: int
    forks: int
    contributors_count: int
    issues_count: int
    embeddings_count: int
    status: str
