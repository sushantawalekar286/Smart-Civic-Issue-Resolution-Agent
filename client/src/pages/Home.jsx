import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GlassButton from '../components/ui/GlassButton';
import GlassCard from '../components/ui/GlassCard';
import { Shield, Brain, Send, Activity, CheckCircle2 } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCTA = () => {
    if (user) {
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'authority') navigate('/authority/dashboard');
      else navigate('/citizen/report');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen text-slate-200">
      {/* Navigation */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <Link to="/" className="-m-1.5 p-1.5 flex items-center gap-2">
              <span className="sr-only">Smart Civic Issue Resolution Agent</span>
              <div className="bg-indigo-500/20 p-2 rounded-xl backdrop-blur-md border border-white/10">
                <Shield className="h-6 w-6 text-indigo-400" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">CivicAI</span>
            </Link>
          </div>
          <div className="flex flex-1 justify-end items-center gap-4">
            {user ? (
              <GlassButton onClick={handleCTA} variant="primary" className="text-sm">
                Go to Dashboard &rarr;
              </GlassButton>
            ) : (
              <>
                <Link to="/login" className="text-sm font-semibold text-gray-300 hover:text-white transition-colors">
                  Log in
                </Link>
                <Link to="/register">
                  <GlassButton variant="primary" className="text-sm">Register</GlassButton>
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          {/* Orbital gradients handled by global CSS, but add some specific highlights here */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] -z-10"></div>
          
          <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-8">
                <Brain className="w-4 h-4" />
                <span>AI-Powered Civic Issue Resolution</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-white mb-8 drop-shadow-sm">
                Smart Civic <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Resolution Agent</span>
              </h1>
              <p className="mt-6 text-lg lg:text-xl leading-relaxed text-indigo-200/80 max-w-2xl mx-auto">
                Report civic problems, let the AI analyze the issue, identify the responsible department, and track the complaint automatically.
              </p>
              <div className="mt-10 flex items-center justify-center gap-4">
                <GlassButton onClick={handleCTA} variant="primary" className="px-8 py-3 text-lg">
                  Report a Civic Issue
                </GlassButton>
                <Link to="/login">
                  <GlassButton variant="secondary" className="px-8 py-3 text-lg">
                    Log in
                  </GlassButton>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Section */}
        <div className="py-24 sm:py-32 relative">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-base font-semibold leading-7 text-indigo-400 uppercase tracking-widest">How It Works</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                A faster path to resolution
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-400">
                Our platform uses AI to understand your issue, assign it the right severity, and route it to the exact department responsible for fixing it.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {[
                { title: '1. Report', icon: <Send />, desc: 'Provide details, photos, and location of the civic issue.' },
                { title: '2. AI Analysis', icon: <Brain />, desc: 'AI determines the issue type, severity, and routing.' },
                { title: '3. Submit', icon: <CheckCircle2 />, desc: 'Review the AI assessment and submit formally.' },
                { title: '4. Track', icon: <Activity />, desc: 'Watch real-time status updates in your dashboard.' },
                { title: '5. Resolve', icon: <Shield />, desc: 'Authorities fix the issue and close the complaint.' }
              ].map((step, idx) => (
                <GlassCard key={idx} className="p-6 text-center hover:-translate-y-2 transition-transform duration-300">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 mb-6">
                    {step.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
