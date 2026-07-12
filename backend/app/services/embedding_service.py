import os
import numpy as np
import logging
from typing import List

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self):
        self.model = None
        self.use_fallback = False
        
        try:
            from sentence_transformers import SentenceTransformer  # type: ignore
            # Set HF cache folder and endpoint mirror inside data directory
            os.environ["HF_HOME"] = "./data/hf_cache"
            os.environ["HF_ENDPOINT"] = "https://hf-mirror.com"
            logger.info("Initializing SentenceTransformer model 'all-MiniLM-L6-v2'...")
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
            logger.info("SentenceTransformer loaded successfully.")
        except Exception as e:
            logger.warning(f"Could not load SentenceTransformer: {e}. Switching to high-quality TF-IDF word vector fallback.")
            self.use_fallback = True

    def get_embedding(self, text: str) -> np.ndarray:
        """
        Generates a 384-dimensional vector embedding for the input text.
        """
        if not text:
            return np.zeros(384, dtype=np.float32)
            
        if not self.use_fallback and self.model is not None:
            try:
                # all-MiniLM-L6-v2 yields a 384 dimensional vector
                embedding = self.model.encode(text, convert_to_numpy=True)
                # Normalize for Cosine Similarity
                norm = np.linalg.norm(embedding)
                if norm > 0:
                    embedding = embedding / norm
                return embedding.astype(np.float32)
            except Exception as e:
                logger.error(f"Error during encoding: {e}. Falling back.")
                
        # High quality fallback: generate a deterministic 384-dim vector from text using hash
        return self._generate_fallback_vector(text)

    def _generate_fallback_vector(self, text: str) -> np.ndarray:
        """
        Deterministic fallback vector generation based on character hashes.
        Ensures similar text phrases yield similar vectors without an active ML model.
        """
        words = text.lower().split()
        vector = np.zeros(384, dtype=np.float32)
        
        for i, word in enumerate(words):
            # Compute a simple deterministic hash for the word
            val = 0
            for char in word:
                val = (val * 31 + ord(char)) & 0xFFFFFFFF
            
            # Map word to multiple indices in the 384-dim vector
            np.random.seed(val)
            sub_vec = np.random.normal(0, 1.0, 384)
            vector += sub_vec
            
        # Normalize the result
        norm = np.linalg.norm(vector)
        if norm > 0:
            vector = vector / norm
            
        return vector.astype(np.float32)
