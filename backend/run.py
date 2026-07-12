import os
os.environ["USE_TF"] = "0"
os.environ["TRANSFORMERS_NO_TF"] = "1"
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
import uvicorn

if __name__ == "__main__":
    # Retrieve host and port from environment, defaulting to localhost:8000
    host = os.getenv("BACKEND_HOST", "127.0.0.1")
    port = int(os.getenv("BACKEND_PORT", 8000))
    
    print(f"Starting IssueMind backend server on http://{host}:{port}")
    print(f"Interactive Swagger Documentation available at http://{host}:{port}/docs")
    
    uvicorn.run(
        "app.api.main:app", 
        host=host, 
        port=port, 
        reload=True
    )
