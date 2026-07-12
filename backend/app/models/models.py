from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
import datetime
from app.database.connection import Base

# Association Table for Repository and Developer (m2m relationship)
repo_developer = Table(
    'repo_developer',
    Base.metadata,
    Column('repo_id', Integer, ForeignKey('repositories.id', ondelete='CASCADE'), primary_key=True),
    Column('developer_id', Integer, ForeignKey('developers.id', ondelete='CASCADE'), primary_key=True)
)

# Association Table for Issue and Label (m2m relationship)
issue_label = Table(
    'issue_label',
    Base.metadata,
    Column('issue_id', Integer, ForeignKey('issues.id', ondelete='CASCADE'), primary_key=True),
    Column('label_id', Integer, ForeignKey('labels.id', ondelete='CASCADE'), primary_key=True)
)

class Repository(Base):
    __tablename__ = "repositories"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, unique=True, index=True, nullable=False)
    owner = Column(String, nullable=False)
    name = Column(String, nullable=False)
    stars = Column(Integer, default=0)
    forks = Column(Integer, default=0)
    indexed_at = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String, default="PENDING") # PENDING, INDEXING, INDEXED, FAILED

    # Relationships
    issues = relationship("Issue", back_populates="repository", cascade="all, delete-orphan")
    labels = relationship("Label", back_populates="repository", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="repository", cascade="all, delete-orphan")
    developers = relationship("Developer", secondary=repo_developer, back_populates="repositories")


class Developer(Base):
    __tablename__ = "developers"

    id = Column(Integer, primary_key=True, index=True)
    login = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    html_url = Column(String, nullable=True)
    contributions = Column(Integer, default=0)

    # Relationships
    issues = relationship("Issue", back_populates="assignee")
    predictions = relationship("Prediction", back_populates="recommended_developer")
    repositories = relationship("Repository", secondary=repo_developer, back_populates="developers")


class Issue(Base):
    __tablename__ = "issues"

    id = Column(Integer, primary_key=True, index=True)
    repo_id = Column(Integer, ForeignKey("repositories.id", ondelete="CASCADE"), nullable=False)
    github_id = Column(Integer, unique=True, index=True, nullable=False)
    number = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    body = Column(Text, nullable=True)
    state = Column(String, nullable=False) # open or closed
    assignee_id = Column(Integer, ForeignKey("developers.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, nullable=False)

    # Relationships
    repository = relationship("Repository", back_populates="issues")
    assignee = relationship("Developer", back_populates="issues")
    labels = relationship("Label", secondary=issue_label, back_populates="issues")
    embedding_metadata = relationship("EmbeddingMetadata", back_populates="issue", uselist=False, cascade="all, delete-orphan")


class Label(Base):
    __tablename__ = "labels"

    id = Column(Integer, primary_key=True, index=True)
    repo_id = Column(Integer, ForeignKey("repositories.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, index=True, nullable=False)
    color = Column(String, nullable=True)

    # Relationships
    repository = relationship("Repository", back_populates="labels")
    issues = relationship("Issue", secondary=issue_label, back_populates="labels")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    repo_id = Column(Integer, ForeignKey("repositories.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    recommended_developer_id = Column(Integer, ForeignKey("developers.id", ondelete="SET NULL"), nullable=True)
    confidence = Column(Float, nullable=False)
    explanation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    repository = relationship("Repository", back_populates="predictions")
    recommended_developer = relationship("Developer", back_populates="predictions")


class RepositoryCache(Base):
    __tablename__ = "repository_cache"

    id = Column(Integer, primary_key=True, index=True)
    repo_url = Column(String, unique=True, index=True, nullable=False)
    status = Column(String, default="PENDING") # INDEXED, INDEXING, PENDING, FAILED
    last_updated = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class EmbeddingMetadata(Base):
    __tablename__ = "embedding_metadata"

    id = Column(Integer, primary_key=True, index=True)
    issue_id = Column(Integer, ForeignKey("issues.id", ondelete="CASCADE"), nullable=False, unique=True)
    faiss_index_id = Column(Integer, nullable=False) # The row offset in the FAISS index

    # Relationships
    issue = relationship("Issue", back_populates="embedding_metadata")
