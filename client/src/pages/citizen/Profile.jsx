import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../../components/ui/GlassCard';
import GlassButton from '../../components/ui/GlassButton';
import { User, Mail, Shield, LogOut } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">My Profile</h1>
        <p className="mt-2 text-indigo-200">
          View your citizen account details.
        </p>
      </div>

      <GlassCard className="overflow-hidden">
        <div className="px-6 py-5 border-b border-white/10 flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-lg font-bold text-white">Account Information</h3>
            <p className="text-sm text-gray-400 mt-1">Personal details and account settings.</p>
          </div>
        </div>
        
        <div className="p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-400 flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-gray-500" /> Full name
              </dt>
              <dd className="text-base font-semibold text-white">{user.name}</dd>
            </div>
            
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-400 flex items-center gap-2 mb-1">
                <Mail className="w-4 h-4 text-gray-500" /> Email address
              </dt>
              <dd className="text-base font-semibold text-white">{user.email}</dd>
            </div>
            
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-400 flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-gray-500" /> Account Role
              </dt>
              <dd className="text-sm capitalize">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30 bg-emerald-500/20 text-emerald-300 tracking-wider">
                  {user.role}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </GlassCard>

      <div className="flex justify-end">
        <GlassButton
          onClick={handleLogout}
          className="flex items-center gap-2 border-rose-500/50 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 hover:border-rose-400"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </GlassButton>
      </div>
    </div>
  );
};

export default Profile;
