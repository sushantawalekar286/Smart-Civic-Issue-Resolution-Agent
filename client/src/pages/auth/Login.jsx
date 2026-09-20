import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import bgImage from '../../assets/background.jpg';
import GlassInput from '../../components/ui/GlassInput';

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
    <div className="min-h-screen bg-slate-950 font-sans flex flex-col justify-between">
      <div className="min-h-screen w-full flex flex-col lg:flex-row">
        
        {/* ==================================================
            LEFT SIDE (55%): Rural Background + Green Overlay
           ================================================== */}
        <div className="lg:w-[55%] relative min-h-[320px] lg:min-h-screen flex flex-col justify-between p-8 lg:p-16 overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${bgImage})` }}
          />
          {/* Dark Green/Slate Heavier Overlay with Backdrop Blur to hide burned-in image text */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-emerald-950/92 to-slate-950/96 backdrop-blur-md" />
          
          {/* Ambient Glow */}
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

          {/* Top Logo */}
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50 group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="font-black text-xl text-white tracking-tight block">Smart Civic</span>
                <span className="text-[11px] font-semibold text-emerald-300 tracking-wide block">AI-Powered Resolution</span>
              </div>
            </Link>
          </div>

          {/* Left Branding Content */}
          <div className="relative z-10 max-w-lg my-auto py-12">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 block mb-3">
              CIVIC ASSISTANCE PORTAL
            </span>
            <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15] mb-6">
              Your voice can improve your community.
            </h1>
            <p className="text-slate-300 text-base leading-relaxed mb-8">
              Report civic issues, track progress and stay informed with AI-powered civic assistance.
            </p>

            {/* Feature Checkmarks */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-3 text-slate-200 text-sm font-semibold">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>AI-assisted issue analysis</span>
              </div>
              <div className="flex items-center gap-3 text-slate-200 text-sm font-semibold">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Evidence and location support</span>
              </div>
              <div className="flex items-center gap-3 text-slate-200 text-sm font-semibold">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Transparent complaint tracking</span>
              </div>
            </div>
          </div>

          {/* Footer Copyright */}
          <div className="relative z-10 text-xs text-slate-400 font-medium">
            © 2026 Smart Civic Issue Resolution Agent.
          </div>
        </div>

        {/* ==================================================
            RIGHT SIDE (45%): Glass / White Auth Card
           ================================================== */}
        <div className="lg:w-[45%] bg-gradient-to-br from-slate-950 via-emerald-950/30 to-slate-950 border-l border-emerald-900/20 flex items-center justify-center p-6 lg:p-12 relative">
          <div className="w-full max-w-md">
            
            {/* Mobile Branding Header */}
            <div className="lg:hidden text-center mb-8">
              <Link to="/" className="inline-flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                  <Shield className="w-5 h-5" />
                </div>
                <span className="font-black text-xl text-white">Smart Civic</span>
              </Link>
            </div>

            {/* Auth Card */}
            <div className="bg-white/95 backdrop-blur-md p-8 lg:p-10 rounded-3xl border border-slate-200 shadow-2xl">
              <div className="mb-8">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Welcome back
                </h2>
                <p className="mt-1.5 text-sm text-slate-500 font-medium">
                  Sign in to continue to Smart Civic
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
                  <p className="text-xs sm:text-sm text-rose-700 font-semibold">{error}</p>
                </div>
              )}

              {/* Login Form */}
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Email Address
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
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
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
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-900/20 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-98 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-all duration-150"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Signing in...</span>
                      </span>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Bottom Registration Link */}
              <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-slate-600 text-xs sm:text-sm font-medium">
                  Don't have an account?{' '}
                  <Link to="/register" className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                    Create an account
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

