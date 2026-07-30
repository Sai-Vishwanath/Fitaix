'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFitAIDispatch, useFitAIState } from '../../lib/FitAIContext';

export default function SignUpPage() {
  const router = useRouter();
  const dispatch = useFitAIDispatch();
  const { hydrated } = useFitAIState() as any; // Safe fallback since we just need the hook to be called
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Client-Side Mock: Retrieve existing users
      const storedUsers = localStorage.getItem('fitai_mock_users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];

      // 2. Check if user exists
      if (users.find((u: any) => u.email === email)) {
        throw new Error('An account with this email already exists.');
      }

      // 3. Create and save new user
      const newUser = { name, email, password, onboarded: false };
      users.push(newUser);
      localStorage.setItem('fitai_mock_users', JSON.stringify(users));

      // 4. Update global state immediately (logging them in)
      dispatch({ type: 'RESET_STATE' }); // Clear any previous user's data
      dispatch({
        type: 'UPDATE_PROFILE',
        payload: {
          name,
          onboarded: false
        }
      });

      // 5. Route to dashboard (will pop onboarding modal)
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
        <h1 className="text-2xl font-bold text-center mb-2">Create Account</h1>
        <p className="text-sm text-zinc-400 text-center mb-6">
          Join FitxAI today
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-4 py-3 bg-zinc-800 rounded-xl border border-zinc-700 text-white focus:outline-none focus:border-emerald-500 text-sm"
            />
          </div>

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
              minLength={8}
              className="w-full px-4 py-3 bg-zinc-800 rounded-xl border border-zinc-700 text-white focus:outline-none focus:border-emerald-500 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-xl transition-all disabled:opacity-50 text-sm mt-2"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        {/* Helper link back to Login */}
        <div className="mt-6 text-center text-sm text-zinc-400">
          Already have an account?{' '}
          <button 
            onClick={() => router.push('/login')} 
            className="text-emerald-400 hover:underline"
          >
            Log in here
          </button>
        </div>
      </div>
    </div>
  );
}