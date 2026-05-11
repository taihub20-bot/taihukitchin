import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight, Github, Chrome } from 'lucide-react';
import { motion } from 'motion/react';
import { User } from '../types';

interface AdminLoginProps {
  setUser: (user: User) => void;
}

export default function AdminLogin({ setUser }: AdminLoginProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const user = await res.json();
        setUser(user);
        navigate('/admin');
      } else {
        const data = await res.json();
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-hero-gradient p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-6 sm:p-10 glass-card rounded-[2rem] sm:rounded-[3rem] shadow-2xl shadow-accent/5 backdrop-blur-2xl"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white font-bold text-xl italic shadow-xl shadow-primary/20 mx-auto mb-4">T</div>
          <h1 className="text-3xl font-serif font-bold text-accent mb-1">Back Office</h1>
          <p className="text-accent/40 text-[11px]">Manage your operations</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-500 text-[10px] font-bold uppercase tracking-widest rounded-xl border border-red-100 animate-pulse text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase tracking-widest text-accent/40 pl-2">Phone or Email</label>
            <div className="relative">
              <input 
                type="text" 
                required
                placeholder="Enter Mobile or Email"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-accent/5 border border-accent/10 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-accent/30" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase tracking-widest text-accent/40 pl-2">Password</label>
            <div className="relative">
              <input 
                type="password" 
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-accent/5 border border-accent/10 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-accent/30" />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-accent text-white rounded-xl font-bold text-base flex items-center justify-center space-x-2 shadow-lg shadow-accent/10 hover:bg-primary transition-all active:scale-95 disabled:opacity-50 group"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
              <>
                <span>Sign In</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
