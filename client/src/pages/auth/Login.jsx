import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Eye, EyeOff, AlertCircle, User, Shield, Building2, KeyRound, Check, Sparkles, ChevronRight } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import GlassInput from '../../components/ui/GlassInput';
import GlassButton from '../../components/ui/GlassButton';

const QUICK_DEMO_ACCOUNTS = [
  {
    role: 'Citizen Account',
    email: 'citizen@civic.local',
    password: 'citizenpassword',
    icon: User,
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300',
    desc: 'Report civic issues & track progress'
  },
  {
    role: 'Road Dept Authority',
    email: 'road@civic.local',
    password: 'roadpassword',
    icon: Building2,
    color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-300',
    desc: 'Manage road & pothole complaints'
  },
  {
    role: 'Sanitation Authority',
    email: 'sanitation@civic.local',
    password: 'sanitationpassword',
    icon: Building2,
    color: 'from-cyan-500/20 to-sky-500/20 border-cyan-500/30 text-cyan-300',
    desc: 'Manage garbage & cleanliness'
  },
  {
    role: 'System Administrator',
    email: 'admin@civic.local',
    password: 'adminpassword',
    icon: Shield,
    color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30 text-purple-300',
    desc: 'System oversight & user management'
  }
];

const OTHER_AUTHORITIES = [
  { label: 'Water', email: 'water@civic.local', pass: 'waterpassword' },
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
  const [selectedRole, setSelectedRole] = useState(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSelectDemo = (demoEmail, demoPassword, roleName) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setSelectedRole(roleName);
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
      className="min-h-screen text-slate-100 bg-[#0f172a] flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden font-sans"
      style={{
        backgroundImage: 'radial-gradient(circle at 15% 50%, rgba(99, 102, 241, 0.15), transparent 45%), radial-gradient(circle at 85% 30%, rgba(139, 92, 246, 0.15), transparent 45%), radial-gradient(circle at 50% 80%, rgba(79, 70, 229, 0.1), transparent 50%)',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Background glow circle */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-6xl w-full grid lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        
        {/* LEFT COLUMN: Branding & Demo Quick-Fill */}
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
              Sign In to Your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-teal-300">
                Civic Resolution Hub
              </span>
            </h1>
            <p className="mt-3 text-slate-300 text-sm leading-relaxed max-w-lg">
              Empowering citizens and authorities with AI-driven issue analysis, instant routing, and automated resolution tracking.
            </p>
          </div>

          {/* DEMO CREDENTIALS BOX */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Demo Accounts (1-Click Auto-fill)</h3>
              </div>
              <span className="text-[11px] text-amber-400/90 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md font-mono">
                Click to load
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {QUICK_DEMO_ACCOUNTS.map((account) => {
                const IconComp = account.icon;
                const isSelected = selectedRole === account.role;
                return (
                  <button
                    key={account.role}
                    type="button"
                    onClick={() => handleSelectDemo(account.email, account.password, account.role)}
                    className={`text-left p-3 rounded-xl border transition-all duration-200 group flex flex-col justify-between ${
                      isSelected 
                        ? 'bg-indigo-600/30 border-indigo-500 shadow-md ring-1 ring-indigo-500/50' 
                        : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div className="flex items-center space-x-2 min-w-0">
                        <div className={`p-1.5 rounded-lg border bg-gradient-to-br ${account.color}`}>
                          <IconComp className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-semibold text-white truncate">{account.role}</span>
                      </div>
                      {isSelected ? (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-1" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-300 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono truncate">{account.email}</div>
                  </button>
                );
              })}
            </div>

            {/* Other authority quick chips */}
            <div className="pt-2 border-t border-slate-800 flex items-center gap-2 flex-wrap text-xs">
              <span className="text-slate-400 text-[11px]">More Authorities:</span>
              {OTHER_AUTHORITIES.map((auth) => (
                <button
                  key={auth.label}
                  type="button"
                  onClick={() => handleSelectDemo(auth.email, auth.pass, `${auth.label} Dept`)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-indigo-600/30 border border-slate-700 hover:border-indigo-500 text-[11px] text-slate-300 hover:text-white transition-all font-mono"
                >
                  {auth.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Glass Login Form */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto lg:max-w-none">
          <GlassCard className="p-8 bg-slate-900/90 border-slate-800 shadow-2xl backdrop-blur-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Welcome Back
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Enter your details or select a demo account to sign in.
              </p>
            </div>

            {selectedRole && (
              <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-3 mb-5 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-indigo-300">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Selected: <strong className="text-white">{selectedRole}</strong></span>
                </div>
                <button 
                  type="button" 
                  onClick={() => { setSelectedRole(null); setEmail(''); setPassword(''); }}
                  className="text-slate-400 hover:text-white text-[11px] underline"
                >
                  Clear
                </button>
              </div>
            )}

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 mb-6 flex items-start">
                <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
                <p className="ml-3 text-sm text-rose-300 font-medium">{error}</p>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Email Address
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
                    if (selectedRole) setSelectedRole(null);
                  }}
                  placeholder="you@example.com"
                  className="bg-slate-950/60 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
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
                      if (selectedRole) setSelectedRole(null);
                    }}
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

              <div className="pt-2">
                <GlassButton
                  type="submit"
                  loading={loading}
                  variant="primary"
                  className="w-full py-3 text-sm font-semibold tracking-wide"
                >
                  {loading ? 'Signing in...' : 'Sign In to Account'}
                </GlassButton>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-800 text-center">
              <p className="text-slate-400 text-sm">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
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
