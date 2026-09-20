import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import GlassInput from '../../components/ui/GlassInput';
import GlassButton from '../../components/ui/GlassButton';
import backgroundImage from '../../assets/background.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const user = await login({ email, password });
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'authority') navigate('/authority/dashboard');
      else navigate('/citizen/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans bg-slate-950">
      {/* Background Image Layer */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700 scale-105"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      {/* Dark & Civic Green Gradient Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-950/90 via-emerald-950/80 to-slate-950/95 backdrop-blur-[2px]" />

      <div className="w-full max-w-md mx-auto relative z-10 my-8">
        {/* Top Back link */}
        <Link 
          to="/" 
          className="inline-flex items-center text-sm font-semibold text-emerald-300 hover:text-emerald-200 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Home
        </Link>

        {/* Branding Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-700 p-3.5 rounded-2xl w-fit mx-auto mb-4 border border-emerald-400/30 shadow-xl shadow-emerald-950/50">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Smart Civic Resolution</h1>
          <p className="text-slate-300 text-sm mt-1">Sign in to track and report civic issues</p>
        </div>

        {/* Login Glass Card */}
        <GlassCard className="p-8 backdrop-blur-xl bg-slate-900/80 border-emerald-500/30 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Welcome back
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              Sign in to your account
            </p>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 mb-6 flex items-start animate-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
              <p className="ml-3 text-sm text-rose-200 font-medium">{error}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-1.5">
                Email address
              </label>
              <GlassInput
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-slate-950/60 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-1.5">
                Password
              </label>
              <div className="relative">
                <GlassInput
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-slate-950/60 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-slate-400 hover:text-slate-200 focus:outline-none transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <GlassButton
                type="submit"
                loading={loading}
                className="w-full font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border-emerald-400/30 shadow-lg shadow-emerald-950/50 py-3"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </GlassButton>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-slate-400 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                Create Citizen Account
              </Link>
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Login;
