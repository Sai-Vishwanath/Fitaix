import type { Metadata } from 'next';
import { WorkoutPage } from '../../components/workout/WorkoutPage';

export const metadata: Metadata = {
  title:       'FitAI · Workout',
  description: 'Generate an AI-powered workout or create a custom session. Track sets, reps, and calories burned.',
};

export default function Page() {
  return <WorkoutPage />;
}
