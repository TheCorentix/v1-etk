import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, RefreshCw, Key, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const { user, login, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Redirect to admin dashboard if already logged in as admin
  useEffect(() => {
    if (user) {
      if (user.role && user.role !== 'CUSTOMER') {
        navigate('/admin', { replace: true });
      } else {
        // If logged in as customer, redirect to access-denied
        navigate('/access-denied', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }
    setSubmitting(true);
    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role && loggedUser.role !== 'CUSTOMER') {
        toast.success(`Authorized as ${loggedUser.role}! Redirecting...`);
        navigate('/admin', { replace: true });
      } else {
        toast.error('Unauthorized role. Access denied.');
        await logout();
        navigate('/access-denied', { replace: true });
      }
    } catch (err) {
      console.error('Admin login error:', err);
      toast.error(err.message || 'Invalid administrator credentials.');
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#111111] text-white flex items-center justify-center px-6 py-12 relative overflow-hidden font-sans">
      {/* Decorative Brand Borders */}
      <div className="absolute inset-4 border border-[#99692b]/20 pointer-events-none rounded-sm" />
      <div className="absolute inset-6 border border-[#a37533]/10 pointer-events-none rounded-sm" />

      <div className="w-full max-w-md space-y-8 bg-[#181818]/85 p-8 border border-[#99692b]/30 rounded-lg shadow-2xl relative z-10 backdrop-blur-md">
        
        {/* Branding header */}
        <div className="text-center space-y-2">
          <span className="text-[9px] uppercase tracking-[0.3em] text-[#D4AF37] font-bold block">COUTURE WORKSPACE</span>
          <h2 className="font-serif text-3xl tracking-widest text-white uppercase">ETNIKO</h2>
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Administrative access authentication portal</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 pt-4 text-left">
          
          <div className="space-y-1.5">
            <label className="text-[9px] uppercase tracking-wider text-neutral-400 block font-semibold">Admin Email</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="etniko@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#202020] border border-neutral-850 px-3 py-2.5 pl-9 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#B68D40] transition-colors font-mono"
              />
              <Mail className="w-3.5 h-3.5 text-neutral-600 absolute left-3 top-3.5" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] uppercase tracking-wider text-neutral-400 block font-semibold">Secret Credentials</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="etniko"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#202020] border border-neutral-850 px-3 py-2.5 pl-9 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#B68D40] transition-colors"
              />
              <Key className="w-3.5 h-3.5 text-neutral-600 absolute left-3 top-3.5" />
            </div>
          </div>

          {/* Action button */}
          <button
            type="submit"
            disabled={submitting || authLoading}
            className="w-full bg-[#B68D40] hover:bg-[#D4AF37] text-neutral-900 font-bold py-3 text-[10px] tracking-widest uppercase transition-all duration-350 disabled:opacity-30 flex items-center justify-center gap-1.5 shadow-lg"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Verifying Identity...</span>
              </>
            ) : (
              <span>Verify and Access Portal</span>
            )}
          </button>
        </form>


      </div>
    </div>
  );
}
