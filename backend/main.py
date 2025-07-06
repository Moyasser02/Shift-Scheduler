from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # ✅ Add this
from backend.api.routes import router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Progressio Backend"}
