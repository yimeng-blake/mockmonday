'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function SignupPage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch {
      setError('Authentication service is not configured');
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-[28px] font-bold text-[#323338] mb-2">Create your account</h2>
      <p className="text-[15px] text-[#676879] mb-8">
        Get started with MockMonday for free
      </p>

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="block text-[13px] font-medium text-[#323338] mb-1.5">
            Full name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Alice Chen"
            required
            className="w-full px-4 py-2.5 text-[14px] border border-[#D0D4E4] rounded-lg outline-none focus:border-[#6161FF] focus:ring-1 focus:ring-[#6161FF] transition-colors"
          />
        </div>

        <div>
          <label className="block text-[13px] font-medium text-[#323338] mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            required
            className="w-full px-4 py-2.5 text-[14px] border border-[#D0D4E4] rounded-lg outline-none focus:border-[#6161FF] focus:ring-1 focus:ring-[#6161FF] transition-colors"
          />
        </div>

        <div>
          <label className="block text-[13px] font-medium text-[#323338] mb-1.5">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
            minLength={6}
            className="w-full px-4 py-2.5 text-[14px] border border-[#D0D4E4] rounded-lg outline-none focus:border-[#6161FF] focus:ring-1 focus:ring-[#6161FF] transition-colors"
          />
        </div>

        {error && (
          <div className="bg-[#FFF0F0] border border-[#E2445C] text-[#E2445C] text-[13px] px-4 py-2.5 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#6161FF] hover:bg-[#5050E6] disabled:opacity-60 text-white text-[15px] font-medium rounded-lg transition-colors"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-[14px] text-[#676879]">
        Already have an account?{' '}
        <Link href="/login" className="text-[#6161FF] hover:underline font-medium">
          Log in
        </Link>
      </p>
    </div>
  );
}
