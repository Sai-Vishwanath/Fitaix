'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFitAIDispatch, useFitAIState } from '../../lib/FitAIContext';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useFitAIDispatch();
  const { hydrated } = useFitAIState() as any; // Safe fallback since we just need the hook to be called

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

 const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Client-Side Mock: Retrieve users
      const storedUsers = localStorage.getItem('fitai_mock_users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];

      // 2. Validate email and password
      const user = users.find((u: any) => u.email === email && u.password === password);
      
      if (!user) {
        throw new Error('Invalid email or password.');
      }

      // 3. Update global state immediately
      dispatch({ type: 'RESET_STATE' });
      dispatch({
        type: 'UPDATE_PROFILE',
        payload: {
          name: user.name || 'User',
          onboarded: user.onboarded || false
        }
      });

      // 4. Teleport them to the dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
      <div className="w-full max-w-md p-6 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-2">Welcome Back</h1>
        <p className="text-sm text-zinc-400 text-center mb-6">
          Log in to access your account
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-zinc-800 rounded-xl border border-zinc-700 text-white focus:outline-none focus:border-emerald-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-zinc-800 rounded-xl border border-zinc-700 text-white focus:outline-none focus:border-emerald-500 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-xl transition-all disabled:opacity-50 text-sm mt-2"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
}