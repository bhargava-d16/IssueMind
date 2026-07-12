import os
import re
import httpx
from typing import Dict, List, Any, Tuple
import logging

logger = logging.getLogger(__name__)

class GitHubService:
    def __init__(self):
        self.token = os.getenv("GITHUB_TOKEN", "").strip()
        self.headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "IssueMind-App"
        }
        if self.token:
            self.headers["Authorization"] = f"token {self.token}"

    def parse_repo_url(self, url: str) -> Tuple[str, str]:
        """
        Parses GitHub URL and returns (owner, repo_name).
        Example: https://github.com/facebook/react -> ('facebook', 'react')
        """
        cleaned_url = url.strip().rstrip("/")
        pattern = r"https?://github\.com/([^/]+)/([^/]+)"
        match = re.match(pattern, cleaned_url)
        if not match:
            raise ValueError("Invalid GitHub URL format. Use http://github.com/owner/repo")
        owner = match.group(1)
        repo_name = match.group(2)
        if repo_name.endswith(".git"):
            repo_name = repo_name[:-4]
        return owner, repo_name

    async def fetch_repo_details(self, owner: str, repo: str) -> Dict[str, Any]:
        """
        Fetches basic repository stats (stars, forks, etc.)
        """
        url = f"https://api.github.com/repos/{owner}/{repo}"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers, timeout=15.0)
            if response.status_code != 200:
                response.raise_for_status()
            return response.json()

    async def fetch_contributors(self, owner: str, repo: str) -> List[Dict[str, Any]]:
        """
        Fetches repository contributors
        """
        url = f"https://api.github.com/repos/{owner}/{repo}/contributors?per_page=30"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers, timeout=15.0)
            if response.status_code != 200:
                if response.status_code == 204:
                    return []
                response.raise_for_status()
            return response.json()

    async def fetch_issues_and_prs(self, owner: str, repo: str, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Fetches combined list of open/closed issues and PRs (up to limit)
        """
        url = f"https://api.github.com/repos/{owner}/{repo}/issues?state=all&per_page={limit}&sort=created&direction=desc"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers, timeout=20.0)
            if response.status_code != 200:
                response.raise_for_status()
            
            issues = response.json()
            if not isinstance(issues, list):
                raise ValueError("Expected list from GitHub API for issues")
            return issues

    async def fetch_commit_authors(self, owner: str, repo: str) -> List[Dict[str, Any]]:
        """
        Fetches recent commits to identify active authors
        """
        url = f"https://api.github.com/repos/{owner}/{repo}/commits?per_page=30"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers, timeout=15.0)
            if response.status_code != 200:
                return []
            commits = response.json()
            authors = []
            if isinstance(commits, list):
                for commit in commits:
                    author_data = commit.get("author")
                    commit_detail = commit.get("commit", {})
                    if author_data:
                        authors.append({
                            "login": author_data.get("login"),
                            "name": commit_detail.get("author", {}).get("name", author_data.get("login")),
                            "avatar_url": author_data.get("avatar_url"),
                            "html_url": author_data.get("html_url")
                        })
            return authors

