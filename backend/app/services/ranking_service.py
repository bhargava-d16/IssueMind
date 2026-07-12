import math
from typing import List, Dict, Any, Tuple, Optional
import logging

logger = logging.getLogger(__name__)

class RankingService:
    def rank_developers(
        self, 
        similar_issues_data: List[Dict[str, Any]], 
        developers_list: List[Dict[str, Any]]
    ) -> Tuple[Optional[Dict[str, Any]], float, str, List[Dict[str, Any]]]:
        """
        Ranks developers based on the issues they resolved.
        Returns:
            - recommended_developer: Dict or None
            - confidence_score: float (0.0 to 1.0)
            - explanation: str
            - alternative_developers: List[Dict]
        """
        if not similar_issues_data:
            return None, 0.0, "No similar issues found in the repository index to base a recommendation on.", []

        # Create developer lookup maps
        dev_map = {dev["login"]: dev for dev in developers_list}
        
        # Calculate scores for each developer based on assigned issues
        # Score = Sum of (similarity_score ^ 2) for issues solved by the developer
        dev_scores = {}
        dev_match_details = {}  # Store matches to build explanation

        for issue in similar_issues_data:
            dev_login = issue.get("developer")
            if not dev_login:
                continue

            sim_score = issue.get("similarity_score", 0.0)
            # Quadratic weight gives higher importance to highly similar issues
            weight = sim_score ** 2

            dev_scores[dev_login] = dev_scores.get(dev_login, 0.0) + weight
            if dev_login not in dev_match_details:
                dev_match_details[dev_login] = []
            dev_match_details[dev_login].append(issue)

        if not dev_scores:
            # Fallback: Recommend top active contributors based on repository contributions
            top_contributors = sorted(developers_list, key=lambda x: x.get("contributions", 0), reverse=True)
            if top_contributors:
                best_dev = top_contributors[0]
                alt_devs = [
                    {
                        "developer": dev,
                        "score": round(float(dev.get("contributions", 0) / max(best_dev.get("contributions", 1), 1)), 2)
                    }
                    for dev in top_contributors[1:4]
                ]
                explanation = f"No direct historical assignees were found on similar issues. Recommending top active contributor '{best_dev['login']}' ({best_dev.get('contributions', 0)} commits) based on repository code expertise."
                return best_dev, 0.55, explanation, alt_devs
            return None, 0.0, "None of the similar issues found had a developer assigned, and no repository contributors were found.", []

        # Sort developers by their scores
        sorted_devs = sorted(dev_scores.items(), key=lambda x: x[1], reverse=True)
        top_dev_login, top_score = sorted_devs[0]
        recommended_dev = dev_map.get(top_dev_login)

        # Confidence score calculation
        # It should reflect:
        # 1. How close the top match is (similarity score of the best issue)
        # 2. How many similar issues this developer has solved (frequency)
        top_dev_matches = dev_match_details[top_dev_login]
        best_sim_score = max([m["similarity_score"] for m in top_dev_matches])
        frequency_factor = 1.0 - (1.0 / (1.0 + len(top_dev_matches)))
        
        # Confidence score bounds [0.0, 1.0]
        confidence = float(best_sim_score * (0.5 + 0.5 * frequency_factor))
        confidence = min(max(confidence, 0.0), 1.0)

        # Explanation generation using metadata only (No LLM hallucinations)
        best_match_issue = top_dev_matches[0]
        explanation = (
            f"{recommended_dev.get('name') or top_dev_login} is recommended with a confidence score of {int(confidence * 100)}%. "
            f"They solved {len(top_dev_matches)} similar issue(s) in this repository. "
            f"Their closest match is Issue #{best_match_issue['number']} ('{best_match_issue['title']}') "
            f"with a similarity match of {int(best_match_issue['similarity_score'] * 100)}%."
        )

        # Alternative developers
        alternatives = []
        for dev_login, score in sorted_devs[1:]:
            alt_dev = dev_map.get(dev_login)
            if alt_dev:
                # Relative score normalized to recommended dev
                rel_score = float(score / top_score) if top_score > 0 else 0.0
                alternatives.append({
                    "developer": alt_dev,
                    "score": round(rel_score, 2)
                })

        return recommended_dev, round(confidence, 2), explanation, alternatives
