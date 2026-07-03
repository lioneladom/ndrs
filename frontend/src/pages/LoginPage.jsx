import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HandHelping, Lock, Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === 'admin' || user.role === 'super_admin') {
        navigate('/admin');
      } else {
        navigate('/app');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* Ghana Stripe */}
      <div className="h-2 w-full flex">
        <div className="flex-1 bg-[#d92b2b]" />
        <div className="flex-1 bg-[#f4b400]" />
        <div className="flex-1 bg-[#0f9d58]" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="self-start mb-6 flex items-center gap-2 text-[#64748b] hover:text-[#174ea6] font-semibold"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-[#e2e8f0]">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[#174ea6] flex items-center justify-center text-white">
              <HandHelping size={24} />
            </div>
            <h1 className="text-2xl font-black text-[#0f172a]">NDRS Ghana</h1>
          </div>

          <h2 className="text-3xl font-black text-[#0f172a] mb-2">Welcome back</h2>
          <p className="text-[#64748b] mb-8">Sign in to continue to your account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-[#334155] mb-2">Email address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] w-5 h-5" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] focus:border-[#174ea6] focus:ring-4 focus:ring-[#174ea6]/10 outline-none transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#334155] mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] w-5 h-5" />
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] focus:border-[#174ea6] focus:ring-4 focus:ring-[#174ea6]/10 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && <p className="text-[#d92b2b] font-semibold">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl font-bold text-white bg-[#174ea6] hover:bg-[#1e40af] hover:shadow-lg hover:shadow-[#174ea6]/30 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[#64748b]">
              Don't have an account?{' '}
              <Link to="/signup" className="font-bold text-[#174ea6] hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
