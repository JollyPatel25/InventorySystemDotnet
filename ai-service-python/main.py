from fastapi import FastAPI

app = FastAPI()

@app.get("/health")
def health():
    print("Health check endpoint called")
    return {"status": "AI service running"}
