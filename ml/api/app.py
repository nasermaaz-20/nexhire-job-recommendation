import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import router as api_router


load_dotenv()

app = FastAPI(title="Job Recommendation ML API")

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_methods=["*"],
  allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/health")
async def health():
  return {"status": "ok"}


if __name__ == "__main__":
  import uvicorn

  port = int(os.getenv("ML_API_PORT", "8000"))
  uvicorn.run("api.app:app", host="0.0.0.0", port=port, reload=True)

