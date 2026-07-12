import os
os.environ["USE_TF"] = "0"
os.environ["TRANSFORMERS_NO_TF"] = "1"
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load env variables before any other imports
load_dotenv()

from app.database.connection import engine, Base
from app.api.routes import router

# Set up logging format
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("app.api.main")

def create_app() -> FastAPI:
    # Initialize DB tables (creates SQLite tables automatically on first run)
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database initialized.")

    app = FastAPI(
        title="IssueMind API",
        description="AI-Powered GitHub Repository Recommendation Engine API",
        version="1.0.0"
    )

    # CORS configuration to allow React Frontend to connect
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Adjust in production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register endpoints router
    app.include_router(router)

    @app.get("/")
    def read_root():
        return {
            "name": "IssueMind API Service",
            "status": "healthy",
            "docs_url": "/docs"
        }

    return app

app = create_app()
