import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Eye, EyeOff, AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import GlassInput from '../../components/ui/GlassInput';
import GlassButton from '../../components/ui/GlassButton';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    try {
      const name = `${formData.firstName} ${formData.lastName}`.trim();
      await register({
        name,
        email: formData.email,
        password: formData.password
      });
      navigate('/citizen/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen text-slate-100 bg-[#0f172a] flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden font-sans"
      style={{
        backgroundImage: 'radial-gradient(circle at 15% 50%, rgba(99, 102, 241, 0.15), transparent 45%), radial-gradient(circle at 85% 30%, rgba(139, 92, 246, 0.15), transparent 45%), radial-gradient(circle at 50% 80%, rgba(79, 70, 229, 0.1), transparent 50%)',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Background glow circle */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-6xl w-full grid lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        
        {/* LEFT COLUMN: Branding & Perks */}
        <div className="lg:col-span-6 space-y-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-indigo-600 to-blue-600 p-2.5 rounded-xl shadow-lg border border-indigo-400/30">
              <ShieldAlert className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-white tracking-tight">CivicAI Portal</span>
              <p className="text-xs text-indigo-300/80 font-medium">Smart Civic Resolution Agent</p>
            </div>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-teal-300">SmartCivic</span> Today
            </h1>
            <p className="mt-3 text-slate-300 text-sm leading-relaxed max-w-lg">
              Create your citizen account to report civic issues in seconds, upload photos, specify exact location, and let AI route your complaint directly to responsible authorities.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-3 text-sm text-slate-200 bg-slate-900/60 p-3 rounded-xl border border-slate-800 w-fit">
              <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span>AI-assisted Issue Detection & Categorization</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-slate-200 bg-slate-900/60 p-3 rounded-xl border border-slate-800 w-fit">
              <div className="p-1 rounded-full bg-cyan-500/20 text-cyan-400">
                <Zap className="w-4 h-4" />
              </div>
              <span>Real-time Status Tracking & Resolution Alerts</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Glass Register Form */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto lg:max-w-none">
          <GlassCard className="p-8 bg-slate-900/90 border-slate-800 shadow-2xl backdrop-blur-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Create Citizen Account
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Fill in your details below to get started
              </p>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 mb-6 flex items-start">
                <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
                <p className="ml-3 text-sm text-rose-300 font-medium">{error}</p>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">First Name</label>
                  <GlassInput
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    className="bg-slate-950/60 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Last Name</label>
                  <GlassInput
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    className="bg-slate-950/60 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Email address</label>
                <GlassInput
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="bg-slate-950/60 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Password</label>
                <div className="relative">
                  <GlassInput
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="bg-slate-950/60 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white focus:outline-none transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Confirm Password</label>
                <div className="relative">
                  <GlassInput
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="bg-slate-950/60 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <GlassButton type="submit" loading={loading} variant="primary" className="w-full py-3 text-sm font-semibold tracking-wide">
                  {loading ? 'Creating account...' : 'Create Citizen Account'}
                </GlassButton>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-800 text-center">
              <p className="text-slate-400 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
};

export default Register;
