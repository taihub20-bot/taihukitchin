import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageCircle, 
  CreditCard, 
  MapPin, 
  CheckCircle2, 
  ArrowLeft,
  Loader2,
  Clock,
  Phone,
  User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem } from '../types';

interface CheckoutProps {
  items: CartItem[];
  clearCart: () => void;
}

import { dataService } from '../services/dataService';

export default function Checkout({ items, clearCart }: CheckoutProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('customerInfo');
    return saved ? JSON.parse(saved) : { name: '', phone: '', address: '', email: '' };
  });
  const [isCustomerLoggedIn, setIsCustomerLoggedIn] = useState(() => {
    return localStorage.getItem('customerLoggedIn') === 'true';
  });
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);

  React.useEffect(() => {
    const handleStorage = () => {
      setIsCustomerLoggedIn(localStorage.getItem('customerLoggedIn') === 'true');
      const saved = localStorage.getItem('customerInfo');
      if (saved) setFormData(JSON.parse(saved));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const delivery = subtotal > 500 ? 0 : 40;
  const total = subtotal + delivery;

  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      }, (error) => {
        console.error("Error getting location:", error);
        alert("Could not get location. Please allow location access.");
      });
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleCustomerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && (formData.phone || formData.email)) {
      localStorage.setItem('customerInfo', JSON.stringify(formData));
      localStorage.setItem('customerLoggedIn', 'true');
      setIsCustomerLoggedIn(true);
    } else {
      alert("Please provide your name and at least a Phone number or Email.");
    }
  };

  const handlePlaceOrder = async (useStripe: boolean = false) => {
    if (!formData.name || !formData.phone) {
      alert("Please enter name and phone number");
      return;
    }

    setLoading(true);
    
    const orderDetails = {
      items,
      total,
      customerName: formData.name,
      customerPhone: formData.phone,
      location: location ? { ...location, address: formData.address } : null,
      status: 'pending',
      paymentStatus: useStripe ? 'paid' : 'pending',
      customerEmail: formData.email
    };

    try {
      const order = await dataService.createOrder(orderDetails as any);

      alert("Order placed successfully!");

      if (!useStripe) {
        // Send to WhatsApp
        const itemText = items.map(i => `${i.quantity}x ${i.name}`).join('%0A');
        const locationLink = location ? `https://www.google.com/maps?q=${location.lat},${location.lng}` : 'Not provided';
        const waText = `*New Order from Tai Hub*%0A%0A*Order ID:* ${order.id}%0A*Customer:* ${formData.name}%0A*Phone:* ${formData.phone}%0A*Location Link:* ${locationLink}%0A%0A*Items:*%0A${itemText}%0A%0A*Total:* ₹${total.toLocaleString('en-IN')}`;
        
        // Open WhatsApp
        window.open(`https://wa.me/6901543900?text=${waText}`, '_blank');
      }

      setLoading(false);
      setSuccess(true);
      clearCart();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-green-500/20"
        >
          <CheckCircle2 className="h-12 w-12 text-white" />
        </motion.div>
        <h2 className="text-4xl font-serif font-bold text-accent mb-4">Order Received!</h2>
        <p className="text-accent/50 mb-8 max-w-sm text-center">Your order has been placed successfully and sent to our kitchen. Check your WhatsApp for updates!</p>
        <button 
          onClick={() => navigate('/')}
          className="px-10 py-4 bg-accent text-white rounded-2xl font-bold hover:bg-primary transition-all shadow-xl shadow-accent/20"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex flex-col lg:flex-row gap-16">
        {/* Forms */}
        <div className="flex-grow space-y-12">
          <div className="flex items-center space-x-6">
            <button onClick={() => navigate(-1)} className="p-3 bg-accent/5 rounded-2xl hover:bg-accent/10 transition-colors"><ArrowLeft className="h-6 w-6 text-accent" /></button>
            <h1 className="text-5xl font-serif font-bold text-accent tracking-tighter">Checkout</h1>
          </div>

          {!isCustomerLoggedIn ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-10 glass-card rounded-[3rem] border-2 border-primary/20"
            >
              <h2 className="text-3xl font-serif font-bold text-accent mb-6">Customer Detials</h2>
              <p className="text-accent/60 mb-8">Personal details add krnei k baad apka login auto ho jayega track krnei k liyei.</p>
              <form onSubmit={handleCustomerLogin} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-accent/40">Full Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Enter Full Name"
                      className="w-full px-4 py-4 rounded-2xl bg-accent/5 border border-accent/10 focus:ring-2 focus:ring-primary/20 outline-none"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-accent/40">Phone Number</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="Enter Mobile Number"
                      className="w-full px-4 py-4 rounded-2xl bg-accent/5 border border-accent/10 focus:ring-2 focus:ring-primary/20 outline-none"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-accent/40">Email Address (Optional)</label>
                  <input 
                    type="email" 
                    placeholder="Your Email Address"
                    className="w-full px-4 py-4 rounded-2xl bg-accent/5 border border-accent/10 focus:ring-2 focus:ring-primary/20 outline-none"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-5 bg-accent text-white rounded-2xl font-bold text-lg hover:bg-primary transition-all shadow-xl shadow-accent/10"
                >
                  Continue to Ordering
                </button>
              </form>
            </motion.div>
          ) : (
            <div className="space-y-8">
              <section className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">1</div>
                    <h3 className="text-2xl font-serif font-bold text-accent">Personal Details</h3>
                  </div>
                  <button 
                    onClick={() => setIsCustomerLoggedIn(false)}
                    className="text-xs font-bold text-primary uppercase tracking-widest hover:underline"
                  >
                    Edit Info
                  </button>
                </div>
                <div className="p-6 bg-accent/5 rounded-3xl border border-accent/10 space-y-2">
                  <p className="font-bold text-accent">{formData.name}</p>
                  <p className="text-accent/60 text-sm">{formData.phone} • {formData.email}</p>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">2</div>
                  <h3 className="text-2xl font-serif font-bold text-accent">Delivery Location</h3>
                </div>
                <div className="space-y-6">
                  <button 
                    onClick={handleGetLocation}
                    className={`w-full py-4 rounded-2xl border-2 transition-all flex items-center justify-center space-x-3 font-bold ${location ? 'bg-green-500/10 border-green-500 text-green-600' : 'bg-primary/5 border-dashed border-primary/20 text-primary hover:bg-primary/10'}`}
                  >
                    <MapPin className="h-5 w-5" />
                    <span>{location ? "Location Shared Successfully" : "Share Live Location (via WhatsApp)"}</span>
                  </button>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-accent/40">Delivery Address (Optional)</label>
                    <textarea 
                      placeholder="Apartment, Street, Landmark..."
                      className="w-full p-4 rounded-2xl bg-accent/5 border border-accent/10 focus:ring-2 focus:ring-primary/20 outline-none h-32"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:w-[400px]">
          <div className="p-8 glass-card rounded-[2.5rem] shadow-2xl shadow-accent/5 sticky top-32">
            <h2 className="text-3xl font-serif font-bold text-accent mb-8">Summary</h2>
            <div className="space-y-4 mb-8">
              {items.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <span className="text-accent/60">{item.quantity}x {item.name}</span>
                  <span className="font-mono font-bold text-accent">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div className="pt-4 border-t border-accent/10 flex justify-between items-center">
                <span className="text-lg font-bold text-accent">Total</span>
                <span className="text-2xl font-mono font-bold text-primary">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="space-y-4">
              {!location && (
                <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest text-center mb-2">
                  Please share location to enable WhatsApp order
                </p>
              )}
              <button 
                onClick={() => handlePlaceOrder(false)}
                disabled={loading || !isCustomerLoggedIn || !location}
                className="w-full py-5 bg-green-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center space-x-3 hover:shadow-xl shadow-green-500/20 transition-all group active:scale-95 disabled:opacity-50 disabled:grayscale"
              >
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                  <>
                    <MessageCircle className="h-6 w-6" />
                    <span>Order via WhatsApp</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-8 flex items-center space-x-3 p-4 bg-primary/5 rounded-2xl text-primary">
              <Clock className="h-5 w-5" />
              <div className="text-xs font-bold leading-tight uppercase tracking-widest">
                Estimated Delivery<br/>
                <span className="text-[10px] opacity-60">25-35 Minutes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
