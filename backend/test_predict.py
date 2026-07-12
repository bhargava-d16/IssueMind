import os
os.environ["USE_TF"] = "0"
os.environ["TRANSFORMERS_NO_TF"] = "1"
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

from app.database.connection import SessionLocal
from app.services.embedding_service import EmbeddingService
from app.services.faiss_service import FAISSService
from app.services.ranking_service import RankingService
from app.services.prediction_service import PredictionService

db = SessionLocal()
emb = EmbeddingService()
faiss = FAISSService()
rank = RankingService()
pred = PredictionService(emb, faiss, rank)

try:
    res = pred.predict_developer(db, 3, "Option prompt is not showing default value", "When using prompt=True on an option, it does not display the default parameter value.")
    print("SUCCESS:", res["recommended_developer"]["login"] if res["recommended_developer"] else "None")
    print("EXPLANATION:", res["explanation"])
except Exception as e:
    import traceback
    traceback.print_exc()
finally:
    db.close()
