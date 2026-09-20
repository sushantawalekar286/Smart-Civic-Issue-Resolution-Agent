import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import bgImage from '../assets/background.jpg';
import {
  Shield,
  Brain,
  Send,
  Activity,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Mic,
  Camera,
  MapPin,
  Menu,
  X,
  Building2,
  FileCheck,
  Compass,
  BellRing,
  Layers,
  Award
} from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
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
      else navigate('/citizen/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
      {/* ==================================================
          1. HERO SECTION & TOP NAVBAR
         ================================================== */}
      <section className="relative min-h-screen flex flex-col justify-between overflow-hidden">
        {/* Background Image with Dark Emerald/Slate Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-emerald-950/85 to-slate-950" />
        
        {/* Subtle glowing ambient light */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-500/10 rounded-full blur-[90px] pointer-events-none" />

        {/* Top Navbar */}
        <header className="relative z-50">
          <nav className="max-w-7xl mx-auto flex items-center justify-between p-6 lg:px-8" aria-label="Global">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-emerald-900/40 group-hover:scale-105 transition-transform">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-black text-xl text-white tracking-tight leading-none flex items-center gap-1">
                    Smart Civic
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-300/90 tracking-wide block mt-0.5">
                    AI-Powered Civic Issue Resolution
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#home" className="text-sm font-semibold text-slate-200 hover:text-emerald-400 transition-colors">
                Home
              </a>
              <a href="#how-it-works" className="text-sm font-semibold text-slate-300 hover:text-emerald-400 transition-colors">
                How It Works
              </a>
              <a href="#features" className="text-sm font-semibold text-slate-300 hover:text-emerald-400 transition-colors">
                Features
              </a>
              <a href="#trust" className="text-sm font-semibold text-slate-300 hover:text-emerald-400 transition-colors">
                About
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <button
                  onClick={handleTrackCTA}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-900/30 transition-all hover:scale-[1.02] flex items-center gap-2"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-xl text-sm font-bold text-slate-200 hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-900/30 transition-all hover:scale-[1.02]"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex md:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-200 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </nav>

          {/* Mobile Navigation Drawer */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-slate-900/95 backdrop-blur-xl border-b border-white/10 px-6 py-6 space-y-4">
              <a
                href="#home"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-semibold text-slate-200 hover:text-emerald-400"
              >
                Home
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-semibold text-slate-300 hover:text-emerald-400"
              >
                How It Works
              </a>
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-semibold text-slate-300 hover:text-emerald-400"
              >
                Features
              </a>
              <a
                href="#trust"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-semibold text-slate-300 hover:text-emerald-400"
              >
                About
              </a>
              <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                {user ? (
                  <button
                    onClick={() => { setMobileMenuOpen(false); handleTrackCTA(); }}
                    className="w-full text-center py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-md"
                  >
                    Go to Dashboard &rarr;
                  </button>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center py-2.5 bg-white/10 text-white font-bold rounded-xl border border-white/10"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center py-2.5 bg-emerald-600 text-white font-bold rounded-xl shadow-md"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </header>

        {/* Hero Content Area */}
        <div id="home" className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-12 pb-24 flex-1 flex flex-col justify-center">
          <div className="max-w-3xl">
            {/* Hero Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-6 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>SMART CIVIC • AI-POWERED</span>
            </div>

            {/* Main Hero Title */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1] mb-6">
              Report. Track. <br />
              <span className="text-emerald-400">Resolve.</span>
            </h1>

            {/* Supporting Paragraph */}
            <p className="text-lg sm:text-xl text-slate-200/90 leading-relaxed font-normal max-w-2xl mb-10">
              Report civic issues using text, voice, photos and location. Our AI analyzes your complaint and helps route it to the right authority.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-16">
              <button
                onClick={handleReportCTA}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-xl shadow-emerald-950/50 transition-all hover:-translate-y-0.5"
              >
                <span>Report an Issue</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={handleTrackCTA}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-base backdrop-blur-md border border-white/20 shadow-lg transition-all hover:-translate-y-0.5"
              >
                <span>Track My Complaints</span>
                <ArrowRight className="w-5 h-5 text-emerald-400" />
              </button>
            </div>

            {/* 4 Feature Highlights Grid under Hero */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
              <div className="p-3.5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/10 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">AI Analysis</h4>
                  <p className="text-[11px] text-slate-300">Smart classification</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/10 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Voice Input</h4>
                  <p className="text-[11px] text-slate-300">Report via speech</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/10 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Photo Evidence</h4>
                  <p className="text-[11px] text-slate-300">Upload real photos</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/10 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Location Pin</h4>
                  <p className="text-[11px] text-slate-300">GPS location</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          2. HOW IT WORKS SECTION
         ================================================== */}
      <section id="how-it-works" className="py-24 bg-slate-950 relative border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 block mb-2">
              Simple Step-by-Step Flow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              How Smart Civic Works
            </h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base">
              From instant voice/photo intake to automated department assignment and completion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connecting line on desktop */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500/20 via-emerald-500/50 to-emerald-500/20 -translate-y-6 z-0" />

            {/* Step 01 */}
            <div className="relative z-10 bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-all hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-black text-lg flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                01
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Report</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Describe the civic issue using text, voice, photos or location.
              </p>
            </div>

            {/* Step 02 */}
            <div className="relative z-10 bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-all hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-black text-lg flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                02
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AI Analyzes</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                AI identifies the issue, evidence, severity and responsible department.
              </p>
            </div>

            {/* Step 03 */}
            <div className="relative z-10 bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-all hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-black text-lg flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                03
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Track</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Follow your complaint and view every status update in real-time.
              </p>
            </div>

            {/* Step 04 */}
            <div className="relative z-10 bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-all hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-black text-lg flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                04
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Resolve</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Authorities process the issue and the system monitors follow-up.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          3. FEATURES SECTION
         ================================================== */}
      <section id="features" className="py-24 bg-slate-900 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 block mb-2">
              Comprehensive Civic Tech Stack
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Everything you need to raise and track civic issues
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'AI-Powered Classification',
                desc: 'Automatically understand and normalize the reported problem.',
                icon: <Brain className="w-5 h-5 text-emerald-400" />
              },
              {
                title: 'Evidence Analysis',
                desc: 'Analyze uploaded images and supporting information accurately.',
                icon: <Camera className="w-5 h-5 text-emerald-400" />
              },
              {
                title: 'Smart Department Mapping',
                desc: 'Route complaints to the appropriate department instantly.',
                icon: <Building2 className="w-5 h-5 text-emerald-400" />
              },
              {
                title: 'Severity Assessment',
                desc: 'Estimate issue priority based on available context and evidence.',
                icon: <Layers className="w-5 h-5 text-emerald-400" />
              },
              {
                title: 'Complaint Tracking',
                desc: 'Follow the complete complaint lifecycle step-by-step.',
                icon: <FileCheck className="w-5 h-5 text-emerald-400" />
              },
              {
                title: 'Automatic Follow-Up',
                desc: 'Monitor unresolved complaints and trigger follow-up/escalation rules.',
                icon: <BellRing className="w-5 h-5 text-emerald-400" />
              },
              {
                title: 'Voice Reporting',
                desc: 'Allow citizens to describe problems using natural voice input.',
                icon: <Mic className="w-5 h-5 text-emerald-400" />
              },
              {
                title: 'Location-Based Reporting',
                desc: 'Pin and provide the exact geographic location on interactive maps.',
                icon: <MapPin className="w-5 h-5 text-emerald-400" />
              }
            ].map((feat, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 transition-all hover:-translate-y-1 shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                  {feat.icon}
                </div>
                <h3 className="text-base font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================
          4. TRUST / PRODUCT SECTION
         ================================================== */}
      <section id="trust" className="py-20 bg-slate-950 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Built for faster civic issue resolution
            </h2>
            <p className="mt-2 text-slate-400 text-sm">
              Designed to ensure clarity, accountability, and seamless coordination between citizens and municipal authorities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center mb-5">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AI-assisted decisions</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Structured analysis helps organize and prioritize civic reports efficiently.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center mb-5">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Evidence-based reporting</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Photos and location information provide essential real-world context for field teams.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center mb-5">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Transparent tracking</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Citizens can follow complaint progress with complete end-to-end visibility.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          5. FINAL CTA SECTION
         ================================================== */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border border-emerald-500/30 p-10 sm:p-16 text-center shadow-2xl overflow-hidden">
            {/* Ambient Background Light */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/20 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
                Have a civic issue?
              </h2>
              <p className="text-slate-300 text-base sm:text-lg mb-8 leading-relaxed">
                Report it once. Track it transparently. Let Smart Civic help move it toward resolution.
              </p>
              <button
                onClick={handleReportCTA}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg shadow-xl shadow-emerald-950/60 transition-all hover:scale-105"
              >
                <span>Report an Issue</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-8 bg-slate-950 border-t border-slate-900 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6">
          <p>© 2026 Smart Civic Issue Resolution Agent. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;

