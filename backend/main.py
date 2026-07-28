from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import bcrypt
from fastapi.middleware.cors import CORSMiddleware

# Import the coach engine we just built
from services.ai_coach.chat import generate_coach_response

app = FastAPI(title="FitAI Pro API")

# Allow React frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",         # Allows local testing
        "https://fitaix.vercel.app"      # MUST BE YOUR EXACT VERCEL URL (No / at the end)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. Database Setup ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./fitaix.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- 2. Password Hashing ---

# --- 3. User Database Model ---
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

# Create the database tables
Base.metadata.create_all(bind=engine)

# --- 4. Pydantic Schemas (Data Validation) ---
class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str


# Dependency to get the DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- 5. The Sign-Up Endpoint ---
@app.post("/api/auth/sign-up/email")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if a user with this email already exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash the password directly with bcrypt (The Fix!)
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), salt).decode('utf-8')
    
    new_user = User(name=user.name, email=user.email, hashed_password=hashed_password)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"message": "Account created successfully", "user_id": new_user.id,"name": new_user.name}


@app.post("/api/auth/sign-in/email")
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    # 1. Find the user by email
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    # 2. Check if the password matches the hashed password in the database
    is_valid_password = bcrypt.checkpw(
        user.password.encode('utf-8'), 
        db_user.hashed_password.encode('utf-8')
    )
    
    if not is_valid_password:
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    # 3. Success! Send back the name so the frontend can remember who logged in
    return {
        "message": "Login successful", 
        "user_id": db_user.id,
        "name": db_user.name
    }

# Define the expected incoming data structure
class CoachRequest(BaseModel):
    message: str
    user_profile: dict
    recovery_score: int

@app.post("/api/coach/chat")
async def chat_with_coach(request: CoachRequest):
    try:
        response = generate_coach_response(
            user_message=request.message,
            user_profile=request.user_profile,
            current_recovery_score=request.recovery_score
        )
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.get("/")
async def health_check():
    return {"status": "FitAI Pro Engine Online"}