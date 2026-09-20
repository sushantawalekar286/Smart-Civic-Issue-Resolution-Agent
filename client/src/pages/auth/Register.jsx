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
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      await register({
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        password: formData.password,
        role: 'citizen' // Hardcoded for public registration
      });
      navigate('/citizen/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-5xl w-full grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        
        {/* LEFT: Branding / Visual */}
        <div className="hidden lg:flex flex-col justify-center space-y-8">
          <div className="bg-indigo-500/20 p-4 rounded-2xl w-fit border border-indigo-500/30 backdrop-blur-md">
            <ShieldAlert className="w-12 h-12 text-indigo-400" />
          </div>
          <h1 className="text-5xl font-extrabold text-white tracking-tight leading-tight">
            Join the Smart Civic Platform
          </h1>
          <p className="text-indigo-200 text-lg leading-relaxed max-w-md">
            Create a citizen account to report issues, track their progress, and improve your local community.
          </p>
          <div className="space-y-4 pt-4">
            <div className="flex items-center text-indigo-100 font-medium bg-white/5 p-3 rounded-xl border border-white/10 w-fit backdrop-blur-sm">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500 text-white text-xs mr-3">1</span>
              Create an Account
            </div>
            <div className="flex items-center text-indigo-100 font-medium bg-white/5 p-3 rounded-xl border border-white/10 w-fit backdrop-blur-sm">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500 text-white text-xs mr-3">2</span>
              Submit Issue Reports with Evidence
            </div>
            <div className="flex items-center text-indigo-100 font-medium bg-white/5 p-3 rounded-xl border border-white/10 w-fit backdrop-blur-sm">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500 text-white text-xs mr-3">3</span>
              Track AI-assigned Department Responses
            </div>
          </div>
        </div>

        {/* RIGHT: Register Card */}
        <div className="w-full max-w-md mx-auto lg:max-w-none">
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="bg-indigo-500/20 p-3 rounded-xl border border-indigo-500/30 mb-4">
              <ShieldAlert className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold text-white text-center tracking-tight">Citizen Registration</h1>
          </div>

          <GlassCard className="p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Create an account
              </h2>
              <p className="mt-2 text-indigo-200/70">
                Join to report issues in your neighborhood
              </p>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 mb-6 flex items-start">
                <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
                <p className="ml-3 text-sm text-rose-200 font-medium">{error}</p>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1.5">
                    First Name
                  </label>
                  <GlassInput
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1.5">
                    Last Name
                  </label>
                  <GlassInput
                    id="lastName"
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
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Email address
                </label>
                <GlassInput
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <GlassInput
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-white focus:outline-none transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <GlassInput
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-white focus:outline-none transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <GlassButton
                  type="submit"
                  loading={loading}
                  className="w-full"
                >
                  {loading ? 'Creating account...' : 'Register as Citizen'}
                </GlassButton>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-gray-400 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                  Log in instead
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
