import logging
from sqlalchemy.orm import Session
from app.database.connection import SessionLocal
from app.models.models import Repository, Issue, Developer, Label, EmbeddingMetadata
from app.services.github_service import GitHubService
from app.services.embedding_service import EmbeddingService
from app.services.faiss_service import FAISSService
from app.services.cache_service import CacheService
import datetime
import numpy as np

logger = logging.getLogger(__name__)

def index_repository_task(
    repo_url: str, 
    github_service: GitHubService, 
    embedding_service: EmbeddingService, 
    faiss_service: FAISSService, 
    cache_service: CacheService
):
    """
    Synchronous background worker function to pull data from GitHub,
    populate SQLite db, generate embeddings, and build the FAISS index.
    """
    logger.info(f"Starting background indexing for: {repo_url}")
    db: Session = SessionLocal()
    loop = None
    
    try:
        # Step 1: Update status to INDEXING
        cache_service.set_status(db, repo_url, "INDEXING")
        
        # Parse owner and repo name
        owner, repo_name = github_service.parse_repo_url(repo_url)
        
        # Step 2: Fetch metadata
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        repo_data = loop.run_until_complete(github_service.fetch_repo_details(owner, repo_name))

        # Create or update repository record
        repo = db.query(Repository).filter(Repository.url == repo_url).first()
        if not repo:
            repo = Repository(
                url=repo_url,
                owner=owner,
                name=repo_name,
                stars=repo_data.get("stargazers_count", 0),
                forks=repo_data.get("forks_count", 0),
                status="INDEXING"
            )
            db.add(repo)
            db.commit()
            db.refresh(repo)
        else:
            repo.stars = repo_data.get("stargazers_count", 0)
            repo.forks = repo_data.get("forks_count", 0)
            repo.status = "INDEXING"
            db.commit()

        # Step 3: Fetch contributors
        contributors = loop.run_until_complete(github_service.fetch_contributors(owner, repo_name))

        # Save developers & link to repository
        db_devs = []
        for c in contributors:
            login = c.get("login")
            if not login:
                continue
            
            dev = db.query(Developer).filter(Developer.login == login).first()
            if not dev:
                dev = Developer(
                    login=login,
                    name=c.get("name", login),
                    avatar_url=c.get("avatar_url"),
                    html_url=c.get("html_url"),
                    contributions=c.get("contributions", 0)
                )
                db.add(dev)
                db.commit()
                db.refresh(dev)
            else:
                dev.contributions = max(dev.contributions, c.get("contributions", 0))
                db.commit()
            
            # Link to repo if not already linked
            if dev not in repo.developers:
                repo.developers.append(dev)
                db.commit()
            db_devs.append(dev)

        # Step 4: Fetch Issues and PRs
        issues_list = loop.run_until_complete(github_service.fetch_issues_and_prs(owner, repo_name))

        # Filter out pull requests if we want only issues, or include both
        # Let's save all, but mark state and assignee
        db_issues = []
        embeddings = []
        issue_ids = []

        for item in issues_list:
            github_id = item.get("id")
            if not github_id:
                continue

            # Skip PRs if user only wants issues, but user requested both. We store them!
            title = item.get("title", "")
            body = item.get("body", "")
            number = item.get("number")
            state = item.get("state", "open")
            created_at_str = item.get("created_at")
            
            created_at = datetime.datetime.utcnow()
            if created_at_str:
                try:
                    # Parse standard GitHub ISO format
                    created_at = datetime.datetime.strptime(created_at_str, "%Y-%m-%dT%H:%M:%SZ")
                except ValueError:
                    pass

            # Handle Assignee (Developer)
            assignee_data = item.get("assignee")
            if not assignee_data and "pull_request" in item:
                # Fall back to Pull Request author as the resolver
                assignee_data = item.get("user")
            
            assignee_db = None
            if assignee_data:
                assignee_login = assignee_data.get("login")
                assignee_db = db.query(Developer).filter(Developer.login == assignee_login).first()
                if not assignee_db:
                    assignee_db = Developer(
                        login=assignee_login,
                        name=assignee_data.get("name", assignee_login),
                        avatar_url=assignee_data.get("avatar_url"),
                        html_url=assignee_data.get("html_url"),
                        contributions=1
                    )
                    db.add(assignee_db)
                    db.commit()
                    db.refresh(assignee_db)
                
                # Make sure assignee developer is linked to repo
                if assignee_db not in repo.developers:
                    repo.developers.append(assignee_db)
                    db.commit()

            # Handle Labels
            label_objs = []
            for l in item.get("labels", []):
                l_name = l.get("name")
                if not l_name:
                    continue
                # Find or create label
                label = db.query(Label).filter(Label.repo_id == repo.id, Label.name == l_name).first()
                if not label:
                    label = Label(
                        repo_id=repo.id,
                        name=l_name,
                        color=l.get("color", "808080")
                    )
                    db.add(label)
                    db.commit()
                    db.refresh(label)
                label_objs.append(label)

            # Insert or update Issue
            issue = db.query(Issue).filter(Issue.github_id == github_id).first()
            if not issue:
                issue = Issue(
                    repo_id=repo.id,
                    github_id=github_id,
                    number=number,
                    title=title,
                    body=body,
                    state=state,
                    assignee_id=assignee_db.id if assignee_db else None,
                    created_at=created_at
                )
                db.add(issue)
                db.commit()
                db.refresh(issue)
            else:
                issue.title = title
                issue.body = body
                issue.state = state
                issue.assignee_id = assignee_db.id if assignee_db else None
                db.commit()

            # Connect labels
            for label in label_objs:
                if label not in issue.labels:
                    issue.labels.append(label)
            db.commit()

            # Step 5: Embed issue title + body
            combined_text = f"{title} {body or ''}".strip()
            embedding = embedding_service.get_embedding(combined_text)
            
            embeddings.append(embedding)
            issue_ids.append(issue.id)
            db_issues.append(issue)

        # Step 6: Build FAISS Vector Index
        if embeddings and issue_ids:
            faiss_service.build_index(repo.id, embeddings, issue_ids)
            
            # Store embedding metadata linking issue to its index offsets
            # Clear old metadata if any
            db.query(EmbeddingMetadata).filter(EmbeddingMetadata.issue_id.in_(issue_ids)).delete(synchronize_session=False)
            db.commit()

            for offset_id, issue_id in enumerate(issue_ids):
                meta = EmbeddingMetadata(
                    issue_id=issue_id,
                    faiss_index_id=offset_id
                )
                db.add(meta)
            db.commit()

        # Step 7: Completed Indexing
        repo.status = "INDEXED"
        db.commit()
        cache_service.set_status(db, repo_url, "INDEXED")
        logger.info(f"Background indexing completed successfully for: {repo_url}")
        
    except Exception as e:
        logger.exception(f"Error during repository indexing: {e}")
        # Mark as failed in DB and cache
        try:
            repo = db.query(Repository).filter(Repository.url == repo_url).first()
            if repo:
                repo.status = "FAILED"
                db.commit()
            cache_service.set_status(db, repo_url, "FAILED")
        except Exception as db_err:
            logger.error(f"Failed to set status to FAILED: {db_err}")
    finally:
        if loop:
            try:
                loop.close()
            except Exception:
                pass
        db.close()

