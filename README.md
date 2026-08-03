# FitAI 🚀 

FitAI is a highly responsive, AI-native fitness tracking ecosystem built to deliver personalized recovery coaching, real-time analytics, and dynamic workout logging. 

Powered by **Meta Llama-3.1** and the **Groq API**, FitAI analyzes your sleep patterns and daily muscle fatigue to generate highly specific, structured recovery regimens.

## ✨ Key Features

*   **Live AI Coach (Llama-3.1 Integration):** Utilizes strict prompt engineering and client-side parsing to generate 4 precise, actionable recovery steps (e.g., "Deep Tissue Massage | 15 min") based on real-time sleep data and workout history.
*   **Dynamic Full-Body SVG Muscle Map:** A zero-dependency, custom-built interactive body map. Log a workout (e.g., "squats" or "lateral raises"), and the application instantly parses the exercise and visually highlights the corresponding fatigued muscle groups (Shoulders, Abs, Core, Calves, Glutes, etc.) in real-time.
*   **Reactive Global State Management:** A fully robust, custom React Context architecture ensures workouts, calories, and active minutes sync instantly across all dashboard tabs without hydration errors or page reloads.
*   **Client-Side Authentication & Onboarding:** Secure, mock-persistent local storage handles user registration, session management, and onboarding state across browser refreshes.

## 🛠️ Tech Stack

*   **Frontend:** React, Next.js, Tailwind CSS
*   **AI Integration:** Meta Llama-3.1-8b-instant via Groq Cloud API
*   **Development Tools:** Antigravity (Prompt-driven code generation)
*   **Data & State:** React Context API, LocalStorage Data Persistence

## 🚀 Getting Started

### Prerequisites
Ensure you have Node.js and npm installed on your local machine.

### Installation

1. Clone the repository:
   ```bash
   git clone [https://github.com/Sai-Vishwanath/Fitaix.git](https://github.com/Sai-Vishwanath/Fitaix.git)
