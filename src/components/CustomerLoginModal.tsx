import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Phone, Mail } from 'lucide-react';

interface CustomerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (info: { name: string, phone: string, email: string }) => void;
}

export default function CustomerLoginModal({ isOpen, onClose, onLogin }: CustomerLoginModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && (formData.phone || formData.email)) {
      onLogin(formData);
      onClose();
    } else {
      alert("Please provide your name and at least a Phone number or Email.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-accent/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-serif font-bold text-accent">Welcome</h2>
                  <p className="text-accent/40 text-sm">Please log in to continue</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-accent/5 rounded-full transition-colors">
                  <X className="h-6 w-6 text-accent/20" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-accent/40 pl-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-4 h-5 w-5 text-accent/20" />
                    <input 
                      type="text" 
                      required
                      placeholder="Enter Full Name"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-accent/5 border border-accent/10 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-accent/40 pl-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-4 h-5 w-5 text-accent/20" />
                    <input 
                      type="tel" 
                      required
                      placeholder="Enter Mobile Number"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-accent/5 border border-accent/10 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-accent/40 pl-2">Email Address (Optional)</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-4 h-5 w-5 text-accent/20" />
                    <input 
                      type="email" 
                      placeholder="Your Email Address"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-accent/5 border border-accent/10 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-5 bg-accent text-white rounded-2xl font-bold text-lg hover:bg-primary transition-all shadow-xl shadow-accent/10 active:scale-95"
                >
                  Confirm Login
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
