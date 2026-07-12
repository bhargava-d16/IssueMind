# IssueMind - AI-Powered GitHub Repository Intelligence Platform

IssueMind is a full-stack repository intelligence platform that analyzes GitHub repositories and automatically recommends the most suitable developer for newly reported issues. The engine uses a local sentence transformer model (`all-MiniLM-L6-v2`) to generate text embeddings and a FAISS vector index to run semantic search and assignee prediction.

## Key Features

1. **Repository Indexing**: Parses GitHub repositories to extract issues, pull requests, developers, labels, and contribution counts.
2. **Assignee Recommendation**: Analyzes the title and description of a new issue, retrieves similar resolved tickets, and scores developers using a quadratic matching algorithm.
3. **Semantic Issue Search**: Supports natural language query searches over indexed issues using vector distance measurements instead of literal keyword filters.
4. **Interactive Dashboard**: Visualizes repository metrics, issue state distribution, and developer contribution graphs using Recharts.
5. **Developer Expertise Profiles**: Automatically calculates developer expertise scores using logarithmic difficulty scales based on historical labels and closed issues.
6. **Robust Offline Support**: Falls back to offline mock datasets and custom local embedding hashing if GitHub APIs or PyTorch models fail to load.

## Architecture

```
                 [ React Frontend (Vite) ]
                            │
                      (HTTP / JSON)
                            │
                            ▼
                  [ FastAPI Web Server ]
                            │
         ┌──────────────────┴──────────────────┐
         ▼                                     ▼
[ SQLite DB (SQLAlchemy) ]          [ AI Engine (FAISS + MiniLM) ]
  ├── repositories                    ├── all-MiniLM-L6-v2 (Embedder)
  ├── issues                          └── Vector Indices (repo_*.index)
  ├── developers
  ├── labels
  └── predictions
```

## Folder Structure

```
IssueMind/
├── backend/
│   ├── app/
│   │   ├── api/            # API endpoints and routers
│   │   ├── database/       # SQLite database connection setup
│   │   ├── models/         # SQLAlchemy database models
│   │   ├── schemas/        # Pydantic schemas for request validation
│   │   ├── services/       # NLP embedding, FAISS indexing, and GitHub services
│   │   └── workers/        # Asynchronous background indexing tasks
│   ├── requirements.txt    # Python backend dependencies
│   └── run.py              # Backend launcher script
└── frontend/
    ├── src/
    │   ├── components/     # Modular React components
    │   ├── App.jsx         # Main React Dashboard and state coordinator
    │   └── main.jsx        # Frontend entry point
    └── package.json        # NPM dependencies and scripts
```

## Installation and Running

### Prerequisites
- Python 3.10+
- Node.js 18+

### Running the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. (Optional) Create a `.env` file to configure a GitHub token:
   ```env
   GITHUB_TOKEN=your_token_here
   ```

4. Launch the server:
   ```bash
   python run.py
   ```
   *The server will start on `http://127.0.0.1:8000`. Swagger API docs are available at `http://127.0.0.1:8000/docs`.*

### Running the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the development server:
   ```bash
   npm run dev
   ```
   *Open `http://localhost:5173` in your browser.*
