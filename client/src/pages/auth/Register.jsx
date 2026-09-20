import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Eye, EyeOff, AlertCircle } from 'lucide-react';
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
    <div 
      className="min-h-screen text-slate-200 bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden font-sans"
      style={{
        backgroundImage: 'radial-gradient(circle at 15% 50%, rgba(99, 102, 241, 0.15), transparent 40%), radial-gradient(circle at 85% 30%, rgba(139, 92, 246, 0.15), transparent 40%), radial-gradient(circle at 50% 80%, rgba(79, 70, 229, 0.1), transparent 50%)',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="max-w-5xl w-full grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        
        {/* LEFT: Branding / Visual */}
        <div className="hidden lg:flex flex-col justify-center space-y-8">
          <div className="bg-blue-600 p-4 rounded-2xl w-fit border border-blue-500 shadow-md">
            <ShieldAlert className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-extrabold text-slate-800 tracking-tight leading-tight">
            Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">SmartCivic</span>
          </h1>
          <p className="text-slate-600 text-lg leading-relaxed max-w-md">
            Create an account to report issues in your neighborhood, track their resolution progress, and help improve your city.
          </p>
          <div className="space-y-4 pt-4">
            <div className="flex items-center text-slate-700 font-medium bg-white p-3 rounded-xl border border-slate-200 w-fit shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-500 mr-3"></span>
              Fast Issue Resolution
            </div>
            <div className="flex items-center text-slate-700 font-medium bg-white p-3 rounded-xl border border-slate-200 w-fit shadow-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-500 mr-3"></span>
              Direct Department Routing
            </div>
          </div>
        </div>

        {/* RIGHT: Register Card */}
        <div className="w-full max-w-md mx-auto lg:max-w-none">
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="bg-blue-600 p-3 rounded-xl border border-blue-500 mb-4 shadow-sm">
              <ShieldAlert className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 text-center tracking-tight">SmartCivic Portal</h1>
          </div>

          <GlassCard className="p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                Create Account
              </h2>
              <p className="mt-2 text-slate-500">
                Sign up as a citizen to get started
              </p>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-6 flex items-start">
                <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
                <p className="ml-3 text-sm text-rose-700 font-medium">{error}</p>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">First Name</label>
                  <GlassInput
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Last Name</label>
                  <GlassInput
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
                <GlassInput
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <GlassInput
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <GlassInput
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-2">
                <GlassButton type="submit" loading={loading} className="w-full">
                  {loading ? 'Creating account...' : 'Create Account'}
                </GlassButton>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-200 text-center">
              <p className="text-slate-500 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
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
