import type { Metadata } from 'next';
import { RecoveryPage } from '../../components/recovery/RecoveryPage';

export const metadata: Metadata = {
  title:       'FitAI · Recovery & Health',
  description: 'Track your recovery score, sleep, heart rate, hydration, and body status.',
};

export default function Page() {
  return <RecoveryPage />;
}
