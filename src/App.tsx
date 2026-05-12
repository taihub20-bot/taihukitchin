import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useNavigate 
} from 'react-router-dom';
import { dataService } from './services/dataService';
import { 
  ShoppingBag, 
  Search, 
  Menu as MenuIcon, 
  X, 
  User, 
  ShoppingCart,
  LayoutDashboard,
  MessageSquare,
  Home as HomeIcon,
  UtensilsCrossed,
  UserCircle,
  LogOut,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import './i18n';

// Types
import { Product, CartItem, Order, User as UserType } from './types';

// Components
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import OrderTracking from './components/OrderTracking';
import CustomerLoginModal from './components/CustomerLoginModal';
import Profile from './components/Profile';
import kitchenImage from './assets/images/regenerated_image_1778525602064.jpg';

export default function App() {
  const { t, i18n } = useTranslation();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<UserType | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [customerInfo, setCustomerInfo] = useState<{name: string, phone: string, email: string} | null>(() => {
    const saved = localStorage.getItem('customerInfo');
    return saved ? JSON.parse(saved) : null;
  });

  const [isCustomerLoginOpen, setIsCustomerLoginOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const handleCustomerLogout = () => {
    localStorage.removeItem('customerInfo');
    localStorage.removeItem('customerLoggedIn');
    setCustomerInfo(null);
  };

  useEffect(() => {
    if (customerInfo) {
      localStorage.setItem('customerInfo', JSON.stringify(customerInfo));
      localStorage.setItem('customerLoggedIn', 'true');
    }
  }, [customerInfo]);

  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('customerInfo');
      if (saved) {
        setCustomerInfo(JSON.parse(saved));
      } else {
        setCustomerInfo(null);
      }
      
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        setUser(null);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col font-sans bg-[#fafafa]">
        {/* Navigation - Top (Simplified for Mobile) */}
        <nav className="sticky top-0 z-50 glass-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-20 items-center">
              <div className="flex items-center">
                <Link to="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg italic shadow-lg shadow-primary/20">T</div>
                  <span className="text-xl font-serif font-bold tracking-tight text-accent hidden sm:block">Tai <span className="text-primary italic">Hub</span></span>
                </Link>
              </div>

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center space-x-8">
                <Link to="/" className="text-accent/70 hover:text-primary transition-colors font-medium">{t('nav.home')}</Link>
                <Link to="/menu" className="text-accent/70 hover:text-primary transition-colors font-medium">Menu</Link>
                {customerInfo && user?.role !== 'admin' && (
                  <Link to="/track" className="text-accent/70 hover:text-primary transition-colors font-medium">Track</Link>
                )}
              </div>

              {/* Search at top for all (requested only search at top for mobile) */}
              <div className="relative flex-grow mx-4 md:max-w-xs">
                <input
                  type="text"
                  placeholder={t('search.placeholder')}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-accent/5 border border-accent/10 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-3 h-5 w-5 text-accent/40" />
              </div>

              <div className="flex items-center space-x-4">
                {/* Desktop Specific Icons */}
                <div className="hidden md:flex items-center space-x-4">
                  <Link to="/cart" className="relative p-1.5 rounded-full hover:bg-accent/5 transition-colors">
                    <ShoppingCart className="h-5 w-5 text-accent/70" />
                    {cart.length > 0 && (
                      <span className="absolute top-0 right-0 h-4 w-4 bg-primary text-white text-[9px] flex items-center justify-center rounded-full border-2 border-white">
                        {cart.reduce((acc, item) => acc + item.quantity, 0)}
                      </span>
                    )}
                  </Link>

                  {user?.role === 'admin' ? (
                    <div className="flex items-center space-x-2">
                      <Link to="/admin" className="p-1.5 rounded-full bg-accent/10 text-accent hover:bg-accent/15 transition-colors flex items-center space-x-2">
                        <LayoutDashboard className="h-4 w-4" />
                        <span className="text-[10px] font-bold hidden lg:block">Admin Panel</span>
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="p-1.5 rounded-full hover:bg-red-50 text-red-500 transition-colors"
                        title="Logout Admin"
                      >
                        <LogOut className="h-4 w-4" />
                      </button>
                    </div>
                  ) : customerInfo ? (
                    <Link to="/profile" className="p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center space-x-2">
                       <User className="h-5 w-5" />
                       <span className="text-[10px] font-bold hidden lg:block">{customerInfo.name.split(' ')[0]}</span>
                    </Link>
                  ) : (
                    <div className="flex items-center space-x-2">
                       <button 
                         onClick={() => setIsCustomerLoginOpen(true)}
                         className="p-1.5 rounded-full hover:bg-accent/5 transition-colors group flex items-center space-x-1"
                         title="Customer Login"
                       >
                         <User className="h-5 w-5 text-accent/70 group-hover:text-primary" />
                         <span className="text-[10px] uppercase font-bold text-accent/20 group-hover:text-primary transition-colors">Login</span>
                       </button>
                       <div className="h-4 w-[1px] bg-accent/10" />
                       <Link to="/admin/login" className="text-[10px] uppercase font-bold text-accent/20 hover:text-primary transition-colors">Admin</Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Bottom Navigation for Mobile */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-accent/10 px-2 py-1.5 flex justify-between items-center rounded-t-2xl">
           <Link to="/" className="flex flex-col items-center space-y-0.5 group flex-1">
              <HomeIcon className="h-4.5 w-4.5 text-accent/40 group-hover:text-primary transition-colors" />
              <span className="text-[8px] font-bold uppercase tracking-widest text-accent/30 group-hover:text-primary">Home</span>
           </Link>
           <Link to="/menu" className="flex flex-col items-center space-y-0.5 group flex-1">
              <UtensilsCrossed className="h-4.5 w-4.5 text-accent/40 group-hover:text-primary transition-colors" />
              <span className="text-[8px] font-bold uppercase tracking-widest text-accent/30 group-hover:text-primary">Menu</span>
           </Link>
           <Link to="/cart" className="relative flex flex-col items-center space-y-0.5 group flex-1">
              <ShoppingBag className="h-4.5 w-4.5 text-accent/40 group-hover:text-primary transition-colors" />
              <span className="text-[8px] font-bold uppercase tracking-widest text-accent/30 group-hover:text-primary">Cart</span>
              {cart.length > 0 && (
                <span className="absolute -top-1 right-2 h-3 w-3 bg-primary text-white text-[6px] flex items-center justify-center rounded-full border border-white">
                   {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
           </Link>
           {customerInfo && user?.role !== 'admin' && (
             <Link to="/track" className="flex flex-col items-center space-y-0.5 group flex-1">
                <ShoppingCart className="h-4.5 w-4.5 text-accent/40 group-hover:text-primary transition-colors" />
                <span className="text-[8px] font-bold uppercase tracking-widest text-accent/30 group-hover:text-primary">Track</span>
             </Link>
           )}
           <Link to={user?.role === 'admin' ? "/admin" : "/profile"} className="flex flex-col items-center space-y-0.5 group flex-1">
              <UserCircle className="h-4.5 w-4.5 text-accent/40 group-hover:text-primary transition-colors" />
              <span className="text-[8px] font-bold uppercase tracking-widest text-accent/30 group-hover:text-primary">Account</span>
           </Link>
        </div>

        <main className="flex-grow pb-24 md:pb-0">
          <Routes>
            <Route path="/" element={<HomeOverview />} />
            <Route path="/menu" element={<MenuSection addToCart={addToCart} searchQuery={searchQuery} cart={cart} />} />
            <Route path="/product/:id" element={<ProductDetail addToCart={addToCart} cart={cart} />} />
            <Route path="/cart" element={<Cart items={cart} updateQuantity={updateQuantity} removeFromCart={removeFromCart} />} />
            <Route path="/checkout" element={<Checkout items={cart} clearCart={() => setCart([])} />} />
            <Route path="/track" element={<OrderTracking />} />
            <Route path="/profile" element={<Profile customerInfo={customerInfo} onLogout={handleCustomerLogout} onLogin={() => setIsCustomerLoginOpen(true)} isAdmin={user?.role === 'admin'} />} />
            <Route path="/admin/login" element={<AdminLogin setUser={setUser} />} />
            <Route path="/admin/*" element={user?.role === 'admin' ? <AdminDashboard handleLogout={handleLogout} /> : <AdminLogin setUser={setUser} />} />
          </Routes>
        </main>

        {/* Install Banner */}
        <AnimatePresence>
          {showInstallBanner && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-24 left-4 right-4 z-[60] md:bottom-8 md:right-8 md:left-auto md:w-80"
            >
              <div className="bg-accent text-white p-6 rounded-[2rem] shadow-2xl border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2">
                  <button onClick={() => setShowInstallBanner(false)} className="p-1 hover:bg-white/10 rounded-full">
                    <X className="h-4 w-4 text-white/50" />
                  </button>
                </div>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl italic shadow-lg">T</div>
                  <div>
                    <h4 className="font-serif font-bold text-lg">Install Tai Hub</h4>
                    <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Get the best experience</p>
                  </div>
                </div>
                <button 
                  onClick={handleInstallClick}
                  className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/80 transition-all flex items-center justify-center space-x-2"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Add to Home Screen</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <CustomerLoginModal 
          isOpen={isCustomerLoginOpen}
          onClose={() => setIsCustomerLoginOpen(false)}
          onLogin={(info) => setCustomerInfo(info)}
        />
      </div>
    </Router>
  );
}

function HomeOverview() {
  return (
    <div className="space-y-20">
      <Hero />
      
      {/* About Tai Hub Kitchen */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4 md:space-y-6"
           >
              <div>
                <p className="text-primary font-bold text-[9px] uppercase tracking-[0.3em] mb-1">Authentic Taste</p>
                <h2 className="text-3xl md:text-5xl font-serif font-bold text-accent leading-[0.9] tracking-tighter italic">Tai <span className="text-primary">Hub</span> Kitchen</h2>
              </div>
              <p className="text-accent/60 text-sm md:text-base leading-relaxed max-w-xl">
                 Founded on the principles of authenticity and innovation, our kitchen is a sanctuary where traditional flavors meet modern techniques.
              </p>
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                 <div className="space-y-1">
                    <p className="text-xl md:text-2xl font-mono font-bold text-accent">100%</p>
                    <p className="text-[8px] text-accent/30 uppercase font-bold tracking-widest">Fresh Ingredients</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-xl md:text-2xl font-mono font-bold text-accent">24/7</p>
                    <p className="text-[8px] text-accent/30 uppercase font-bold tracking-widest">Customer Love</p>
                 </div>
              </div>
              <Link 
                to="/menu"
                className="inline-flex items-center space-x-3 px-8 py-3.5 bg-accent text-white rounded-xl font-bold shadow-xl shadow-accent/10 hover:bg-primary transition-all group text-sm"
              >
                <span>Discover Menu</span>
                <MenuIcon className="h-4 w-4 group-hover:rotate-90 transition-transform" />
              </Link>
           </motion.div>

           <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
           >
              <div className="aspect-square bg-accent/5 rounded-[4rem] overflow-hidden rotate-3 scale-95 relative z-0"></div>
              <div className="absolute inset-0 aspect-square rounded-[4rem] overflow-hidden -rotate-3 hover:rotate-0 transition-transform duration-700 z-10 shadow-2xl">
                 <img 
                  src={kitchenImage} 
                  alt="Kitchen" 
                  className="w-full h-full object-cover"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-accent/80 via-transparent to-transparent"></div>
                 <div className="absolute bottom-8 left-8">
                    <p className="text-white text-2xl font-serif italic">Where quality meets taste</p>
                 </div>
              </div>
           </motion.div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="bg-accent py-32 rounded-[4rem] mx-4 sm:mx-8">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 space-y-2">
               <h2 className="text-3xl md:text-5xl font-serif font-bold text-white tracking-tighter italic">Signature Specials</h2>
               <p className="text-white/40 uppercase tracking-widest text-[10px] font-bold">Handpicked for you</p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
               {[
                 {title: "Home Delivery", desc: "Fast & Hot", icon: LayoutDashboard},
                 {title: "Dine-in", desc: "Premium Experience", icon: User},
                 {title: "Bulk Order", desc: "Events & Parties", icon: ShoppingBag},
                 {title: "Takeaway", desc: "Easy Pickup", icon: MenuIcon}
               ].map((item, i) => (
                 <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/10 transition-all cursor-default">
                    <item.icon className="h-5 w-5 text-primary mb-4" />
                    <h4 className="text-lg font-bold text-white mb-1">{item.title}</h4>
                    <p className="text-white/40 text-xs">{item.desc}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>
    </div>
  );
}

function MenuSection({ addToCart, searchQuery, cart }: { addToCart: (p: Product) => void, searchQuery: string, cart: CartItem[] }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    setLoading(true);
    dataService.getProducts()
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch products", err);
        setError(err.message || "Failed to load products");
        setLoading(false);
      });

    // Real-time subscription for customer menu
    const sub = dataService.subscribeToProducts(() => {
      dataService.getProducts().then(setProducts).catch(console.error);
    });

    return () => {
      if (sub) sub.unsubscribe();
    };
  }, []);

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h2 className="text-5xl font-serif font-bold text-accent tracking-tighter mb-2 italic">Tai <span className="text-primary">Menu</span></h2>
          <p className="text-accent/40 font-medium">Fresh food, prepared daily. Choose your favorite.</p>
        </div>
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 w-full md:w-auto">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'bg-accent/5 text-accent/40 hover:bg-accent/10'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 bg-accent/5 rounded-[4rem]">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <p className="text-accent/30 font-bold uppercase tracking-widest">Loading Tai Menu...</p>
          </div>
        ) : error ? (
          <div className="text-center py-40 bg-red-50 rounded-[4rem] border-2 border-red-100 p-8">
            <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-700 mb-2">Could Not Load Menu</h3>
            <p className="text-red-500/70 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all"
            >
              Retry Connection
            </button>
          </div>
        ) : (
            <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredProducts.map(product => {
              const cartItem = cart.find(item => item.id === product.id);
              return (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  addToCart={addToCart} 
                  quantity={cartItem?.quantity || 0}
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
      
      {filteredProducts.length === 0 && (
        <div className="text-center py-40 bg-accent/5 rounded-[4rem]">
          <ShoppingBag className="h-16 w-16 text-accent/10 mx-auto mb-4" />
          <p className="text-accent/30 font-bold uppercase tracking-widest">No dishes found in this category</p>
        </div>
      )}
    </div>
  );
}

// Keeping a simplified Home old version logic if needed, but we are using HomeOverview and MenuSection separately now.
function Home({ addToCart, searchQuery }: { addToCart: (p: Product) => void, searchQuery: string }) {
  // This is no longer used directly as we have separate routes for "/" and "/menu"
  return null;
}
