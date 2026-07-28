// fitaix/frontend/app/services/api.ts

export const askFitAICoach = async (userMessage: string) => {
  try {
    const response = await fetch("http://127.0.0.1:8000/api/coach/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: userMessage,
        // In a fully finished app, these would pull from your React state/context
        user_profile: {
          goals: ["Build Muscle", "Improve Strength"],
          adaptive_coaching: true,
          aggressive_progression: true
        },
        recovery_score: 89
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.response; 

  } catch (error) {
    console.error("Error communicating with AI Coach:", error);
    return "Looks like the server is catching its breath. Try again in a second.";
  }
};