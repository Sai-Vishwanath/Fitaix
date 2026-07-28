'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Connects directly to Sparky's Better Auth sign-up endpoint
      const res = await fetch(`${API_URL}/api/auth/sign-up/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
        credentials: 'include', // Ensures the automatic login cookie is saved
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to create account.');
      }

      const successData = await res.json(); 
      localStorage.setItem('userName', successData.name);

      // Success! Better Auth usually auto-logs the user in after sign up.
      // Teleport them straight to their new profile page!
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
          Join SparkyFitness today
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