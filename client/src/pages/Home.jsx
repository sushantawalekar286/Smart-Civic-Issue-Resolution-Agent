import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GlassButton from '../components/ui/GlassButton';
import GlassCard from '../components/ui/GlassCard';
import backgroundImage from '../assets/background.png';
import {
  ShieldAlert,
  Brain,
  Send,
  Activity,
  CheckCircle2,
  MapPin,
  Mic,
  Camera,
  Clock,
  AlertTriangle,
  Menu,
  X,
  ChevronRight,
  User,
  LogOut,
  Droplets,
  Zap,
  Trash2,
  Sparkles,
  Compass
} from 'lucide-react';

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleReportCTA = () => {
    if (user) {
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'authority') navigate('/authority/dashboard');
      else navigate('/citizen/report');
    } else {
      navigate('/login');
    }
  };

  const handleTrackCTA = () => {
    if (user) {
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'authority') navigate('/authority/dashboard');
      else navigate('/citizen/complaints');
    } else {
      navigate('/login');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen font-sans bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* HEADER / NAVBAR */}
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-sm bg-slate-950/70 border-b border-white/10 transition-all">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between" aria-label="Global Navigation">
          {/* Left: Branding */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-700 p-2.5 rounded-xl shadow-lg shadow-emerald-900/30 border border-emerald-400/30 group-hover:scale-105 transition-transform">
              <ShieldAlert className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg sm:text-xl text-white tracking-tight leading-tight group-hover:text-emerald-300 transition-colors">
                Smart Civic
              </span>
              <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">
                Issue Resolution
              </span>
            </div>
          </Link>

          {/* Center/Right Nav Links (Desktop) */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <Link to="/" className="text-emerald-400 font-semibold transition-colors">
              Home
            </Link>
            <button onClick={handleReportCTA} className="hover:text-white transition-colors text-left">
              Report Issue
            </button>
            <button onClick={handleTrackCTA} className="hover:text-white transition-colors text-left">
              My Complaints
            </button>
            <a href="#how-it-works" className="hover:text-white transition-colors">
              About
            </a>
          </div>

          {/* Right: Auth Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Link to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'authority' ? '/authority/dashboard' : '/citizen/dashboard'}>
                  <GlassButton variant="secondary" className="text-sm flex items-center gap-2 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10">
                    <User className="w-4 h-4" />
                    Dashboard
                  </GlassButton>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors border border-transparent hover:border-rose-500/20"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-3 py-2">
                  Login
                </Link>
                <Link to="/register">
                  <GlassButton variant="primary" className="text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border-emerald-400/30 shadow-md shadow-emerald-900/40">
                    Register
                  </GlassButton>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-950/95 border-b border-white/10 backdrop-blur-xl px-4 py-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
            <div className="flex flex-col gap-3 font-medium text-slate-300">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 font-semibold">
                Home
              </Link>
              <button onClick={() => { setMobileMenuOpen(false); handleReportCTA(); }} className="px-3 py-2 rounded-lg hover:bg-white/5 text-left">
                Report Issue
              </button>
              <button onClick={() => { setMobileMenuOpen(false); handleTrackCTA(); }} className="px-3 py-2 rounded-lg hover:bg-white/5 text-left">
                My Complaints
              </button>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-white/5">
                About
              </a>
            </div>
            <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
              {user ? (
                <>
                  <Link
                    to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'authority' ? '/authority/dashboard' : '/citizen/dashboard'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full"
                  >
                    <GlassButton variant="secondary" className="w-full text-center">Dashboard</GlassButton>
                  </Link>
                  <button onClick={() => { setMobileMenuOpen(false); handleLogout(); }} className="text-rose-400 hover:text-rose-300 text-sm font-semibold py-2">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <GlassButton variant="secondary" className="w-full text-center">Login</GlassButton>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <GlassButton variant="primary" className="w-full text-center bg-emerald-600">Register</GlassButton>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-36 min-h-[650px] flex items-center overflow-hidden">
        {/* Background Image Layer */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700 scale-105"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
        {/* Dark & Civic Green Gradient Overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-950/85 via-slate-900/80 to-slate-950/95 backdrop-blur-[2px]" />

        {/* Ambient Glow Effects */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/20 rounded-full blur-[140px] pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center">
          <div className="max-w-3xl mx-auto">
            {/* Small Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-semibold tracking-wider uppercase mb-8 shadow-inner animate-in fade-in duration-500">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>SMART CIVIC • AI-POWERED</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white mb-6 drop-shadow-md">
              Report. Track. <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">Resolve.</span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg md:text-xl text-slate-300/90 leading-relaxed mb-10 max-w-2xl mx-auto font-normal">
              Report civic issues with text, voice, photos and location. Our AI helps classify your complaint and route it to the right authority.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-16">
              <GlassButton
                onClick={handleReportCTA}
                variant="primary"
                className="w-full sm:w-auto px-8 py-4 text-base font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border-emerald-400/40 shadow-xl shadow-emerald-950/60 transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Report an Issue
              </GlassButton>
              <GlassButton
                onClick={handleTrackCTA}
                variant="secondary"
                className="w-full sm:w-auto px-8 py-4 text-base font-bold border-white/20 hover:bg-white/10 text-slate-200 transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <Activity className="w-5 h-5 text-emerald-400" />
                Track My Complaints
              </GlassButton>
            </div>

            {/* CIVIC ISSUE QUICK ACTIONS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto pt-4">
              {[
                { title: 'Roads', icon: '🛣️', desc: 'Potholes & Damage' },
                { title: 'Water', icon: '💧', desc: 'Leaks & Drainage' },
                { title: 'Electricity', icon: '⚡', desc: 'Streetlights & Power' },
                { title: 'Sanitation', icon: '🗑️', desc: 'Garbage & Cleanliness' }
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={handleReportCTA}
                  className="bg-slate-900/60 hover:bg-emerald-950/50 border border-white/10 hover:border-emerald-500/40 rounded-2xl p-4 text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 backdrop-blur-md group shadow-lg"
                >
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{item.icon}</div>
                  <h4 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">{item.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 md:py-28 bg-slate-900/90 relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              TRANSPARENT PROCESS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 tracking-tight">
              How It Works
            </h2>
            <p className="text-slate-400 mt-3 text-base sm:text-lg">
              Our AI-orchestrated workflow ensures your issue reaches resolution efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              {
                num: '01',
                title: 'Report',
                subtitle: 'Text, voice, photo and location.',
                desc: 'Submit your issue using rich media including voice transcripts, photos, and exact map pinning.',
                icon: <Send className="w-6 h-6 text-emerald-400" />
              },
              {
                num: '02',
                title: 'AI Analysis',
                subtitle: 'Issue, severity & department.',
                desc: 'Gemini AI automatically classifies the category, rates severity, and selects the responsible department.',
                icon: <Brain className="w-6 h-6 text-emerald-400" />
              },
              {
                num: '03',
                title: 'Authority Action',
                subtitle: 'Direct department routing.',
                desc: 'The complaint is assigned to officials who take action and update status in real-time.',
                icon: <ShieldAlert className="w-6 h-6 text-emerald-400" />
              },
              {
                num: '04',
                title: 'Track & Resolve',
                subtitle: 'Status and escalation.',
                desc: 'Monitor status progress from SUBMITTED to RESOLVED with automatic follow-up and SLA escalation.',
                icon: <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              }
            ].map((step, idx) => (
              <GlassCard key={idx} className="p-6 relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
                <div className="text-5xl font-black text-white/10 absolute top-4 right-4 group-hover:text-emerald-500/20 transition-colors">
                  {step.num}
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 w-fit mb-5 group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{step.title}</h3>
                <p className="text-xs font-semibold text-emerald-400 mb-3">{step.subtitle}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURE SECTION */}
      <section className="py-20 md:py-28 bg-slate-950 relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              CORE CAPABILITIES
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 tracking-tight">
              Implemented Platform Features
            </h2>
            <p className="text-slate-400 mt-3 text-base sm:text-lg">
              Built with modern AI technology and robust backend architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Voice Complaint Input',
                desc: 'Speak your issue directly in any language; automated speech recognition transcribes details seamlessly.',
                icon: <Mic className="w-6 h-6 text-emerald-400" />
              },
              {
                title: 'Photo Evidence Storage',
                desc: 'Upload images stored securely on Cloudinary CDN for instant visual validation by authorities.',
                icon: <Camera className="w-6 h-6 text-emerald-400" />
              },
              {
                title: 'AI Analysis & Routing',
                desc: 'Powered by Gemini AI to classify issue type, evaluate severity, and assign proper department code.',
                icon: <Brain className="w-6 h-6 text-emerald-400" />
              },
              {
                title: 'OpenStreetMap Location',
                desc: 'Interactive Leaflet map picker to pinpoint precise GPS latitude and longitude coordinates.',
                icon: <MapPin className="w-6 h-6 text-emerald-400" />
              },
              {
                title: 'Complaint Lifecycle Tracking',
                desc: 'Track status progression through SUBMITTED, ASSIGNED, IN_PROGRESS, and RESOLVED states.',
                icon: <Activity className="w-6 h-6 text-emerald-400" />
              },
              {
                title: 'Automatic Agent Follow-up',
                desc: 'Automated background tasks monitor stagnant complaints and issue reminders to assigned officers.',
                icon: <Clock className="w-6 h-6 text-emerald-400" />
              },
              {
                title: 'SLA Escalation Pipeline',
                desc: 'Unresolved issues breaching resolution thresholds automatically escalate to higher authority tiers.',
                icon: <AlertTriangle className="w-6 h-6 text-amber-400" />
              }
            ].map((feat, idx) => (
              <div
                key={idx}
                className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 backdrop-blur-md"
              >
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 w-fit mb-4">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CIVIC CTA */}
      <section className="py-20 relative overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-emerald-950/90 via-slate-950/90 to-slate-950/95 backdrop-blur-sm" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="bg-slate-900/80 border border-emerald-500/30 p-10 sm:p-14 rounded-3xl backdrop-blur-xl shadow-2xl">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
              Have an issue in your area?
            </h2>
            <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
              Help improve your community today. Report potholes, garbage, water leaks or streetlight outages in seconds.
            </p>
            <GlassButton
              onClick={handleReportCTA}
              variant="primary"
              className="px-10 py-4 text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border-emerald-400/40 shadow-xl shadow-emerald-950/80 transition-transform hover:scale-105 active:scale-95 inline-flex items-center gap-3"
            >
              Report Issue
              <ChevronRight className="w-5 h-5" />
            </GlassButton>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-white/10 py-10 text-slate-400 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-1.5 rounded-lg">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-base">Smart Civic Issue Resolution</span>
          </div>
          <p className="text-xs text-slate-500 text-center md:text-right">
            &copy; {new Date().getFullYear()} Smart Civic Issue Resolution Agent. Powered by AI.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
