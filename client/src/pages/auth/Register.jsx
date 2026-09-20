import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import GlassInput from '../../components/ui/GlassInput';
import GlassButton from '../../components/ui/GlassButton';
import backgroundImage from '../../assets/background.png';

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
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      navigate('/citizen/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans bg-slate-950 py-12">
      {/* Background Image Layer */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700 scale-105"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      {/* Dark & Civic Green Gradient Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-950/90 via-emerald-950/80 to-slate-950/95 backdrop-blur-[2px]" />

      <div className="w-full max-w-md mx-auto relative z-10 my-auto">
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
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Smart Civic Portal</h1>
          <p className="text-slate-300 text-sm mt-1">Create an account to report and track civic issues</p>
        </div>

        {/* Register Glass Card */}
        <GlassCard className="p-8 backdrop-blur-xl bg-slate-900/80 border-emerald-500/30 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Create Account
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              Sign up as a citizen to get started
            </p>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 mb-6 flex items-start animate-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
              <p className="ml-3 text-sm text-rose-200 font-medium">{error}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">First Name</label>
                <GlassInput
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  className="bg-slate-950/60 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Last Name</label>
                <GlassInput
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  className="bg-slate-950/60 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Email address</label>
              <GlassInput
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="bg-slate-950/60 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Password</label>
              <div className="relative">
                <GlassInput
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="bg-slate-950/60 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Confirm Password</label>
              <GlassInput
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="bg-slate-950/60 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500"
              />
            </div>

            <div className="pt-2">
              <GlassButton 
                type="submit" 
                loading={loading} 
                className="w-full font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border-emerald-400/30 shadow-lg shadow-emerald-950/50 py-3"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </GlassButton>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-slate-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Register;
