from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base, Session
import datetime

# --- Database Setup ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./mytune.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    display_name = Column(String)
    bio = Column(String)
    is_pro = Column(Boolean, default=False)
    followers_count = Column(Integer, default=0)
    following_count = Column(Integer, default=0)

class Track(Base):
    __tablename__ = "tracks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    artist_id = Column(Integer)
    audio_url = Column(String)
    duration = Column(Integer) # In seconds, enforced <= 60
    tags = Column(String) # Comma separated
    upload_date = Column(DateTime, default=datetime.datetime.utcnow)

Base.metadata.create_all(bind=engine)

# --- FastAPI App ---
app = FastAPI(title="MyTune API")

# Allow CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Welcome to MyTune API"}

@app.get("/feed")
def get_feed(db: Session = Depends(get_db)):
    # Mock recommendation logic
    return [
        {
            "id": 1,
            "title": "Midnight City Flows",
            "artist": "The Neon Synthetics",
            "tags": ["ELECTRONIC POP", "CHILL"],
        },
        {
            "id": 2,
            "title": "Velocity Drive",
            "artist": "KROME",
            "tags": ["SYNTHWAVE", "UPBEAT"],
        }
    ]

@app.get("/profile/{username}")
def get_profile(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        # Mock user if not found for testing
        return {
            "username": username,
            "display_name": "ALEX MERCER",
            "bio": "Electronic & Synthesizer Enthusiast",
            "is_pro": True,
            "followers_count": 12400,
            "following_count": 482
        }
    return user

@app.post("/upload")
def upload_track(title: str, duration: int, db: Session = Depends(get_db)):
    if duration > 60:
        raise HTTPException(status_code=400, detail="Audio duration exceeds 60 seconds limit.")
    
    # In a real app, handle file upload here.
    return {"message": "Track uploaded successfully", "title": title, "duration": duration}

