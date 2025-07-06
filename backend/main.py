from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # ✅ Add this
from backend.api.routes import router

app = FastAPI()

# ✅ Add CORS middleware to accept frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can use ["http://localhost:3000"] for stricter security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Progressio Backend"}
