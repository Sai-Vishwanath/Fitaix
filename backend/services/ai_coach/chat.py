import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Initialize the Groq client
# This automatically looks for the GROQ_API_KEY variable in your .env file
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def generate_coach_response(user_message: str, user_profile: dict, current_recovery_score: int) -> str:
    """
    Generates a personalized AI coach response using Llama-3.1 via Groq.
    """
    
    # We dynamically build the system prompt using the exact toggles 
    # from the React ProfilePage we just generated.
    system_prompt = f"""You are FitAI Pro, an elite, highly intelligent fitness coach.
    
    CURRENT USER STATE:
    - Recovery Score: {current_recovery_score}%
    - Goals: {', '.join(user_profile.get('goals', ['General Fitness']))}
    
    AI PREFERENCES:
    - Adaptive Coaching (Adjust for recovery): {user_profile.get('adaptive_coaching', True)}
    - Aggressive Progression (Push volume): {user_profile.get('aggressive_progression', False)}
    
    RULES:
    1. Keep responses concise, premium, and highly motivating.
    2. If their recovery is below 60%, strictly advise active recovery or rest, regardless of their goals.
    3. If Aggressive Progression is True and recovery is above 85%, push them to increase their weights today.
    """

    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=0.7,
            max_tokens=512,
        )
        
        return completion.choices[0].message.content
        
    except Exception as e:
        print(f"Groq API Error: {e}")
        return "Coach is currently offline updating your training blocks. Check back in a moment."

# Quick local test block
if __name__ == "__main__":
    # Mock data matching our React UI state
    mock_profile = {
        "goals": ["Build Muscle", "Improve Strength"],
        "adaptive_coaching": True,
        "aggressive_progression": True
    }
    
    test_response = generate_coach_response(
        user_message="I'm feeling great today, what should I hit?",
        user_profile=mock_profile,
        current_recovery_score=89
    )
    print(f"FitAI Pro: {test_response}")