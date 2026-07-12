import os
import numpy as np
import logging
from typing import List, Tuple, Dict, Any

logger = logging.getLogger(__name__)

# Try importing FAISS, fall back to pure NumPy if unavailable
FAISS_AVAILABLE = False
try:
    import faiss  # type: ignore
    FAISS_AVAILABLE = True
    logger.info("FAISS library imported successfully.")
except ImportError:
    logger.warning("FAISS is not installed. Using numpy-based vector similarity search fallback.")

class FAISSService:
    def __init__(self, index_dir: str = "./data/faiss_indexes"):
        self.index_dir = index_dir
        if not os.path.exists(index_dir):
            os.makedirs(index_dir)
        
        # In-memory indices dictionary keyed by repo_id
        # Value structure: { 'index': faiss_index_or_numpy_array, 'ids': list_of_issue_ids }
        self.indices: Dict[int, Dict[str, Any]] = {}

    def get_index_path(self, repo_id: int) -> str:
        return os.path.join(self.index_dir, f"repo_{repo_id}.index")

    def build_index(self, repo_id: int, embeddings: List[np.ndarray], issue_ids: List[int]) -> bool:
        """
        Builds a vector index for a repository using FAISS or NumPy fallback.
        """
        if not embeddings or not issue_ids:
            logger.warning(f"No embeddings or issue IDs provided for repo {repo_id}")
            return False

        embeddings_arr = np.array(embeddings).astype(np.float32)
        dim = embeddings_arr.shape[1]

        if FAISS_AVAILABLE:
            try:
                # Flat Inner Product index for Cosine Similarity (since vectors are normalized)
                index = faiss.IndexFlatIP(dim)
                index.add(embeddings_arr)
                self.indices[repo_id] = {
                    "index": index,
                    "ids": issue_ids,
                    "fallback": False
                }
                # Save index file
                faiss.write_index(index, self.get_index_path(repo_id))
                # Save IDs file (required because FAISS Flat indices don't store custom label mappings natively)
                np.save(self.get_index_path(repo_id) + ".ids.npy", np.array(issue_ids))
                logger.info(f"FAISS index built and saved for repo {repo_id} ({len(issue_ids)} items)")
                return True
            except Exception as e:
                logger.error(f"Failed to build FAISS index: {e}. Switching to NumPy fallback.")

        # NumPy Fallback
        self.indices[repo_id] = {
            "index": embeddings_arr,
            "ids": issue_ids,
            "fallback": True
        }
        # Save raw embeddings and IDs
        np.save(self.get_index_path(repo_id) + ".npy", embeddings_arr)
        np.save(self.get_index_path(repo_id) + ".ids.npy", np.array(issue_ids))
        logger.info(f"NumPy fallback index built and saved for repo {repo_id} ({len(issue_ids)} items)")
        return True

    def load_index(self, repo_id: int) -> bool:
        """
        Loads repository vector index into memory if it exists.
        """
        if repo_id in self.indices:
            return True

        faiss_path = self.get_index_path(repo_id)
        ids_path = faiss_path + ".ids.npy"

        if not os.path.exists(ids_path):
            return False

        try:
            issue_ids = np.load(ids_path).tolist()
            
            # Try loading FAISS index first
            if FAISS_AVAILABLE and os.path.exists(faiss_path):
                index = faiss.read_index(faiss_path)
                self.indices[repo_id] = {
                    "index": index,
                    "ids": issue_ids,
                    "fallback": False
                }
                return True
        except Exception as e:
            logger.warning(f"Failed to load FAISS index for repo {repo_id}: {e}. Trying NumPy fallback loader.")

        # Try loading NumPy index file
        numpy_path = faiss_path + ".npy"
        if os.path.exists(numpy_path):
            try:
                embeddings_arr = np.load(numpy_path)
                self.indices[repo_id] = {
                    "index": embeddings_arr,
                    "ids": issue_ids,
                    "fallback": True
                }
                return True
            except Exception as e:
                logger.error(f"Failed to load NumPy embeddings for repo {repo_id}: {e}")
        
        return False

    def search_similarity(self, repo_id: int, query_vector: np.ndarray, k: int = 5) -> List[Tuple[int, float]]:
        """
        Searches index for top K similar issues. Returns list of (issue_id, similarity_score).
        """
        # Ensure index is loaded
        if not self.load_index(repo_id):
            logger.warning(f"Index not found for repo {repo_id}")
            return []

        index_data = self.indices[repo_id]
        issue_ids = index_data["ids"]
        query_vector = query_vector.astype(np.float32).reshape(1, -1)

        # Cap K to size of index
        k = min(k, len(issue_ids))
        if k <= 0:
            return []

        if not index_data["fallback"]:
            # FAISS search
            index = index_data["index"]
            scores, indices = index.search(query_vector, k)
            results = []
            for score, idx in zip(scores[0], indices[0]):
                if idx >= 0 and idx < len(issue_ids):
                    # Cosine similarity is in [-1, 1], map to [0, 1] percentage
                    sim_percentage = float((score + 1.0) / 2.0) if score <= 1.0 else 1.0
                    results.append((issue_ids[idx], sim_percentage))
            return results
        else:
            # NumPy search (dot product on normalized vectors)
            embeddings = index_data["index"]
            # Cosine similarity
            scores = np.dot(embeddings, query_vector.T).flatten()
            top_k_indices = np.argsort(scores)[::-1][:k]
            
            results = []
            for idx in top_k_indices:
                score = scores[idx]
                sim_percentage = float((score + 1.0) / 2.0) if score <= 1.0 else 1.0
                results.append((issue_ids[idx], sim_percentage))
            return results
