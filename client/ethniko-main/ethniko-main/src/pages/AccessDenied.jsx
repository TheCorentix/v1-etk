import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AccessDenied() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOutAndRedirect = async () => {
    try {
      await logout();
      navigate('/profile');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="py-32 text-center max-w-lg mx-auto px-6 space-y-6">
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-[#B68D40]/10 flex items-center justify-center text-[#B68D40]">
          <ShieldAlert className="w-8 h-8" strokeWidth={1.5} />
        </div>
      </div>
      <h1 className="text-8xl font-serif font-light text-neutral-300">403</h1>
      <h2 className="text-2xl font-serif uppercase tracking-wider text-neutral-800 dark:text-white">Access Denied</h2>
      <p className="text-xs font-sans text-neutral-500 leading-relaxed uppercase tracking-widest">
        You do not have the required administrative permissions to enter the ETNIKO workspace console.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
        <Link to="/" className="btn-luxury-solid px-6 py-3 text-xs tracking-widest text-center">
          Return to Studio
        </Link>
        <button
          onClick={handleSignOutAndRedirect}
          className="border border-neutral-300 dark:border-neutral-700 hover:border-[#B68D40] dark:hover:border-[#B68D40] hover:text-[#B68D40] dark:hover:text-[#B68D40] px-6 py-3 text-xs uppercase tracking-widest transition-colors font-sans font-semibold focus:outline-none"
        >
          Sign in as Admin
        </button>
      </div>
    </div>
  );
}
