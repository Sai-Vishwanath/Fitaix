import type { Metadata } from 'next';
import { ProfilePage } from '../../components/profile/ProfilePage';

export const metadata: Metadata = {
  title:       'FitAI · Profile & Settings',
  description: 'Manage your fitness profile, goals, equipment, AI preferences, devices, and account settings.',
};

export default function Page() {
  return <ProfilePage />;
}
