import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Eye, EyeOff, AlertCircle, User, Shield, Building2, KeyRound, Check, ArrowRight } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import GlassInput from '../../components/ui/GlassInput';
import GlassButton from '../../components/ui/GlassButton';

const DEMO_CREDENTIALS = [
  {
    role: 'Citizen',
    email: 'citizen@civic.local',
    password: 'citizenpassword',
    icon: User,
    badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    description: 'Report civic issues & track updates'
  },
  {
    role: 'Authority (Road Dept)',
    email: 'road@civic.local',
    password: 'roadpassword',
    icon: Building2,
    badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    description: 'Manage & update assigned complaints'
  },
  {
    role: 'Authority (Sanitation)',
    email: 'sanitation@civic.local',
    password: 'sanitationpassword',
    icon: Building2,
    badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    description: 'Handle waste & cleaning reports'
  },
  {
    role: 'System Admin',
    email: 'admin@civic.local',
    password: 'adminpassword',
    icon: Shield,
    badgeColor: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    description: 'Full system oversight & management'
  }
];

const ALL_AUTHORITIES = [
  { label: 'Road Dept', email: 'road@civic.local', pass: 'roadpassword' },
  { label: 'Sanitation', email: 'sanitation@civic.local', pass: 'sanitationpassword' },
  { label: 'Water Dept', email: 'water@civic.local', pass: 'waterpassword' },
  { label: 'Electrical', email: 'electrical@civic.local', pass: 'electricalpassword' },
  { label: 'Drainage', email: 'drainage@civic.local', pass: 'drainagepassword' },
  { label: 'Infrastructure', email: 'infra@civic.local', pass: 'infrapassword' }
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCred, setSelectedCred] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleFillCredentials = (credEmail, credPassword, label) => {
    setEmail(credEmail);
    setPassword(credPassword);
    setSelectedCred(label);
    setError('');
  };

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
    <div 
      className="min-h-screen text-slate-200 bg-[#0f172a] flex items-center justify-center p-4 lg:p-8 relative overflow-hidden font-sans"
      style={{
        backgroundImage: 'radial-gradient(circle at 15% 50%, rgba(99, 102, 241, 0.15), transparent 40%), radial-gradient(circle at 85% 30%, rgba(139, 92, 246, 0.15), transparent 40%), radial-gradient(circle at 50% 80%, rgba(79, 70, 229, 0.1), transparent 50%)',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="max-w-6xl w-full grid lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT / BRANDING & DEMO CREDENTIALS BOX */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-3 rounded-2xl shadow-lg border border-blue-400/30">
              <ShieldAlert className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">SmartCivic Portal</h1>
              <p className="text-xs text-slate-500 font-medium">Civic Issue Resolution Platform</p>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight leading-tight">
              Resolve Civic Issues <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Smarter</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 leading-relaxed">
              Report issues with AI assist, track real-time resolution status, and build better communities together.
            </p>
          </div>

          {/* DEMO CREDENTIALS BOX */}
          <GlassCard className="p-5 border-blue-500/20 bg-slate-900/60 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-700/50 pb-3">
              <div className="flex items-center space-x-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-semibold text-slate-200">Demo Login Credentials</h3>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 font-mono">Click to Auto-fill</span>
            </div>

            <div className="space-y-2.5">
              {DEMO_CREDENTIALS.map((cred) => {
                const IconComponent = cred.icon;
                const isSelected = selectedCred === cred.role;
                return (
                  <button
                    key={cred.role}
                    type="button"
                    onClick={() => handleFillCredentials(cred.email, cred.password, cred.role)}
                    className={`w-full text-left p-3 rounded-xl border transition-all duration-200 flex items-center justify-between group ${
                      isSelected 
                        ? 'bg-blue-600/20 border-blue-500/60 shadow-md ring-1 ring-blue-500/40' 
                        : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className={`p-2 rounded-lg border ${cred.badgeColor}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-200">{cred.role}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono truncate">{cred.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0 ml-2">
                      <span className="text-[10px] text-slate-400 font-mono bg-slate-900/80 px-2 py-1 rounded border border-slate-700">{cred.password}</span>
                      {isSelected ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Additional Authorities dropdown/chips */}
            <div className="mt-4 pt-3 border-t border-slate-700/50">
              <p className="text-[11px] font-medium text-slate-400 mb-2">More Department Authority Accounts:</p>
              <div className="flex flex-wrap gap-1.5">
                {ALL_AUTHORITIES.map((auth) => (
                  <button
                    key={auth.label}
                    type="button"
                    onClick={() => handleFillCredentials(auth.email, auth.pass, `Auth: ${auth.label}`)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-blue-600/20 border border-slate-700 hover:border-blue-500/50 text-slate-300 hover:text-white transition-colors"
                  >
                    {auth.label}
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* RIGHT: Login Card */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto lg:max-w-none">
          <GlassCard className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
                Welcome back
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Sign in to access your dashboard
              </p>
            </div>

            {selectedCred && (
              <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl p-3 mb-5 flex items-center justify-between">
                <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                  Loaded credential for: <strong>{selectedCred}</strong>
                </span>
                <button 
                  type="button" 
                  onClick={() => setSelectedCred(null)}
                  className="text-[11px] text-blue-500 hover:text-blue-700 underline"
                >
                  Clear
                </button>
              </div>
            )}

            {error && (
              <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl p-4 mb-6 flex items-start">
                <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
                <p className="ml-3 text-sm text-rose-700 dark:text-rose-300 font-medium">{error}</p>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Email address
                </label>
                <GlassInput
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (selectedCred) setSelectedCred(null);
                  }}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
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
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (selectedCred) setSelectedCred(null);
                    }}
                    placeholder="••••••••"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      className="text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
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
                  className="w-full"
                >
                  {loading ? 'Signing in...' : 'Login to Account'}
                </GlassButton>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors">
                  Create Citizen Account
                </Link>
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Login;

