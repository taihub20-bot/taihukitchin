import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart3, 
  Package, 
  ShoppingBag, 
  Plus, 
  LogOut, 
  TrendingUp, 
  ArrowUp, 
  ArrowDown,
  Edit,
  Trash,
  CheckCircle2,
  Clock,
  ExternalLink,
  Search,
  Filter,
  Bell,
  X,
  Menu,
  Check,
  Ban,
  Loader2,
  Settings,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Order } from '../types';

import { dataService } from '../services/dataService';

export default function AdminDashboard({ handleLogout }: { handleLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'analytics' | 'settings'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [newOrderNotify, setNewOrderNotify] = useState<Order | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  
  // Password change state
  const [passwordForm, setPasswordForm] = useState({ old: '', new: '', confirm: '' });
  const [passChangeLoading, setPassChangeLoading] = useState(false);
  const [passChangeMsg, setPassChangeMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    price: 0,
    category: 'Main Course',
    inventory: 50,
    image: '',
    description: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevOrderCount = useRef(0);

  useEffect(() => {
    fetchData();
    
    // Real-time subscription for orders
    const orderSub = dataService.subscribeToOrders((newOrder) => {
      setOrders(prev => {
        // Find if it exists
        const index = prev.findIndex(o => o.id === newOrder.id);
        if (index !== -1) {
          // Update existing
          const updated = [...prev];
          updated[index] = newOrder;
          return updated;
        } else {
          // Add new
          if (newOrder.status === 'pending') {
            setNewOrderNotify(newOrder);
            try {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
              audio.play();
            } catch (e) {}
          }
          return [newOrder, ...prev];
        }
      });
    });

    // Real-time subscription for products
    const productSub = dataService.subscribeToProducts((updatedProduct) => {
      fetchData(); // Simpler to refetch for broad consistency
    });

    return () => {
      if (orderSub) orderSub.unsubscribe();
      if (productSub) productSub.unsubscribe();
    };
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = async () => {
     if (!newProduct.name || !newProduct.image || !newProduct.price) {
        alert("Please fill all required fields including image");
        return;
     }

     try {
       let savedProduct;
       if (editingProductId) {
         savedProduct = await dataService.updateProduct(editingProductId, newProduct);
         setProducts(products.map(p => p.id === editingProductId ? savedProduct : p));
         alert("Item updated successfully");
       } else {
         savedProduct = await dataService.addProduct({
            ...newProduct,
            rating: 4.5,
            reviews: []
         });
         setProducts([...products, savedProduct]);
         alert("Item added successfully");
       }
       
       await fetchData();
       setIsAddingProduct(false);
       setEditingProductId(null);
       setNewProduct({
          name: '',
          price: 0,
          category: 'Main Course',
          inventory: 50,
          image: '',
          description: ''
       });
     } catch (e) {
       console.error("Failed to save product", e);
       alert("Failed to save product: " + (e instanceof Error ? e.message : String(e)));
     }
  };

  const handleEditProduct = (product: Product) => {
    setNewProduct(product);
    setEditingProductId(product.id);
    setIsAddingProduct(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        // Optimistic update
        const previousProducts = products;
        setProducts(products.filter(p => p.id !== id));
        
        try {
          await dataService.deleteProduct(id);
          alert("Item deleted successfully");
          // Re-fetch to ensure we are in sync
          await fetchData();
        } catch (error) {
          // Revert if failed
          setProducts(previousProducts);
          throw error;
        }
      } catch (e) {
        console.error("Delete failed", e);
        alert("Failed to delete product: " + (e instanceof Error ? e.message : String(e)));
      }
    }
  };

  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [o, p] = await Promise.all([
        dataService.getOrders(),
        dataService.getProducts()
      ]);
      setOrders(o);
      setProducts(p);
      setError(null);
    } catch (e) {
      console.error("Fetch error", e);
      setError(e instanceof Error ? e.message : "Failed to connect to database");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string, notifyWhatsapp = false) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    try {
      // OPTIMISTIC UPDATE
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: status as any } : o));

      if (notifyWhatsapp) {
        let message = '';
        if (status === 'cooking') {
          message = `*Update from Tai Hub*%0A%0AHello ${order.customerName}, your order *${orderId}* has been *ACCEPTED* and is now being prepared! 🍳%0A%0AEstimated delivery: 30-40 mins.`;
        } else if (status === 'rejected') {
          message = `*Update from Tai Hub*%0A%0AHello ${order.customerName}, we are sorry but your order *${orderId}* has been *REJECTED* due to high demand or item unavailability. 😔`;
        } else if (status === 'delivering') {
          message = `*Update from Tai Hub*%0A%0AYour order *${orderId}* is *OUT FOR DELIVERY*! 🛵 Our rider is on the way.`;
        } else if (status === 'completed') {
          message = `*Update from Tai Hub*%0A%0AHello ${order.customerName}, your order *${orderId}* has been *DELIVERED*. Enjoy your meal! 🍱❤️`;
        }

        if (message) {
          window.open(`https://wa.me/${order.customerPhone}?text=${message}`, '_blank');
        }
      }

      await dataService.updateOrderStatus(orderId, status);
      
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };

  const handleAcceptOrder = (orderId: string) => {
    updateOrderStatus(orderId, 'cooking', true);
    setNewOrderNotify(null);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassChangeMsg(null);
    
    if (passwordForm.new !== passwordForm.confirm) {
      setPassChangeMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    
    if (passwordForm.new.length < 4) {
      setPassChangeMsg({ type: 'error', text: 'Password must be at least 4 characters' });
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      setPassChangeMsg({ type: 'error', text: 'Not logged in' });
      return;
    }

    setPassChangeLoading(true);
    try {
      await dataService.changePassword(user.id, passwordForm.old, passwordForm.new);
      setPassChangeMsg({ type: 'success', text: 'Password updated successfully!' });
      setPasswordForm({ old: '', new: '', confirm: '' });
    } catch (err: any) {
      setPassChangeMsg({ type: 'error', text: err.message || 'Failed to update password' });
    } finally {
      setPassChangeLoading(false);
    }
  };

  const handleRejectOrder = (orderId: string) => {
    updateOrderStatus(orderId, 'rejected', true);
    setNewOrderNotify(null);
  };

  const stats = [
    { label: "Revenue", value: `₹${orders.reduce((acc, o) => acc + (o.status !== 'rejected' ? o.total : 0), 0).toLocaleString('en-IN')}`, icon: TrendingUp, delta: "+12%", positive: true },
    { label: "Orders", value: orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString()).length, icon: ShoppingBag, delta: "+4", positive: true },
    { label: "Sold", value: orders.reduce((acc, o) => acc + (o.status !== 'rejected' ? o.items.reduce((a, i) => a + i.quantity, 0) : 0), 0), icon: Package, delta: "-2%", positive: false },
  ];

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-accent flex flex-col items-center justify-center p-8">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-6" />
        <h2 className="text-2xl font-serif font-bold text-white mb-2">Connecting to Supabase...</h2>
        <p className="text-white/40 uppercase tracking-widest text-[10px] font-bold">Establishing Real-time Connection</p>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="min-h-screen bg-accent flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/20">
          <Ban className="h-10 w-10 text-red-500" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-white mb-4">Supabase Connection Error</h2>
        <div className="max-w-md p-6 bg-white/5 rounded-3xl border border-white/10 mb-8 text-left">
          <p className="text-red-400 font-mono text-xs break-all mb-4">{error}</p>
          <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
            <h4 className="text-primary font-bold text-[10px] uppercase tracking-widest mb-2">Checklist:</h4>
            <ul className="text-white/60 text-[10px] space-y-1 list-disc pl-4">
              <li>Are VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY set?</li>
              <li>Have you created tables: products, orders, users?</li>
              <li>Is Real-time enabled on these tables?</li>
            </ul>
          </div>
        </div>
        <div className="space-y-4">
          <button 
            onClick={() => window.location.reload()}
            className="w-full px-12 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary/80 transition-all shadow-xl shadow-primary/20"
          >
            Retry Connection
          </button>
          <button 
            onClick={handleLogout}
            className="w-full px-12 py-4 bg-white/5 text-white rounded-2xl font-bold hover:bg-white/10 transition-all"
          >
            Switch Account
          </button>
        </div>
        {window.location.hostname.includes('netlify.app') && (
          <div className="mt-12 p-6 bg-blue-500/10 rounded-3xl border border-blue-500/20 text-left max-w-lg">
             <h4 className="text-blue-400 font-bold text-sm mb-2 uppercase tracking-widest">Netlify Hosting Tip</h4>
             <p className="text-white/60 text-xs leading-relaxed">
               If you are seeing this on Netlify, please ensure you have added your Supabase URL and Key to the <b>Site Settings and Environment Variables</b> section in your Netlify dashboard.
             </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col md:flex-row relative">
      {/* Mobile Header */}
      <div className="md:hidden bg-accent text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold italic">T</div>
          <span className="text-lg font-serif font-bold">Tai Hub Admin</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={`
        fixed md:relative inset-y-0 left-0 w-64 bg-accent text-white flex flex-col z-50 transition-transform duration-300 transform 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-8 flex-grow">
          <div className="hidden md:flex items-center space-x-2 mb-12">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold italic">T</div>
            <span className="text-xl font-serif font-bold">Tai Hub</span>
          </div>
          
          <nav className="space-y-2">
            <button 
              onClick={() => { setActiveTab('orders'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold tracking-widest uppercase transition-all ${activeTab === 'orders' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            >
              <ShoppingBag className="h-5 w-5" />
              <span>Orders</span>
            </button>
            <button 
              onClick={() => { setActiveTab('inventory'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold tracking-widest uppercase transition-all ${activeTab === 'inventory' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            >
              <Package className="h-5 w-5" />
              <span>Inventory</span>
            </button>
            <button 
              onClick={() => { setActiveTab('analytics'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold tracking-widest uppercase transition-all ${activeTab === 'analytics' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            >
              <BarChart3 className="h-5 w-5" />
              <span>Analytics</span>
            </button>
            <button 
              onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold tracking-widest uppercase transition-all ${activeTab === 'settings' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </button>
          </nav>
        </div>
        
        <div className="p-8 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 text-white/40 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-widest">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow p-4 md:p-8 overflow-y-auto w-full">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
          <div>
            <h1 className="text-xl md:text-2xl font-serif font-bold text-accent tracking-tighter capitalize">{activeTab}</h1>
            <p className="text-accent/40 text-[9px]">Hub Terminal</p>
          </div>
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
              <input type="text" placeholder="Search..." className="w-full md:w-56 pl-9 pr-3 py-2 bg-white rounded-xl border border-accent/10 focus:ring-2 focus:ring-primary/20 outline-none text-xs" />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-accent/20" />
            </div>
            <button className="p-2 bg-white rounded-xl border border-accent/10 hover:bg-accent/5 transition-colors"><Filter className="h-4 w-4 text-accent/40" /></button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="p-3 md:p-4 bg-white rounded-xl shadow-sm border border-accent/5">
              <div className="flex justify-between items-start mb-1 md:mb-2">
                <div className="p-1.5 bg-accent/5 rounded-lg">
                  <stat.icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className={`flex items-center space-x-0.5 text-[9px] font-bold ${stat.positive ? 'text-green-500' : 'text-red-500'}`}>
                  <span>{stat.delta}</span>
                  {stat.positive ? <ArrowUp className="h-2 w-2" /> : <ArrowDown className="h-2 w-2" />}
                </div>
              </div>
              <h3 className="text-accent/40 text-[9px] font-bold uppercase tracking-widest mb-0.5">{stat.label}</h3>
              <p className="text-lg md:text-xl font-mono font-bold text-accent">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Table/List Area */}
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-accent/5 p-3 md:p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'orders' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-serif font-bold text-accent">Active Orders</h2>
                  <div className="flex space-x-1">
                    <button className="px-2 py-1.5 bg-accent/5 text-accent text-[9px] font-bold uppercase tracking-widest rounded-lg">Newest</button>
                    <button className="px-2 py-1.5 text-accent/40 text-[9px] font-bold uppercase tracking-widest rounded-lg hover:bg-accent/5">Priority</button>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {['Today', 'Yesterday', 'Earlier'].map(timeGroup => {
                    const groupOrders = orders.filter(o => {
                      const date = new Date(o.createdAt);
                      const today = new Date();
                      const yesterday = new Date();
                      yesterday.setDate(today.getDate() - 1);

                      if (timeGroup === 'Today') return date.toDateString() === today.toDateString();
                      if (timeGroup === 'Yesterday') return date.toDateString() === yesterday.toDateString();
                      return date < yesterday && date.toDateString() !== yesterday.toDateString();
                    });

                    if (groupOrders.length === 0) return null;

                    return (
                      <div key={timeGroup} className="space-y-2">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent/20 px-2">{timeGroup}</h3>
                        <div className="space-y-2">
                          {groupOrders.map(order => (
                            <div key={order.id} className="p-2 md:p-3 rounded-xl border border-accent/5 hover:border-primary/20 transition-all group">
                              <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-2">
                                <div className="flex items-center space-x-2">
                                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center 
                                    ${order.status === 'completed' ? 'bg-green-500/10 text-green-600' : 
                                      order.status === 'rejected' ? 'bg-red-500/10 text-red-600' : 
                                      'bg-primary/10 text-primary'}`}>
                                    {order.status === 'completed' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="font-bold text-accent text-[10px] truncate">{order.id.slice(-8)}</h4>
                                    <p className="text-[8px] text-accent/30 truncate">{order.customerName}</p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between md:justify-end space-x-3">
                                  <div className="text-left md:text-right">
                                    <p className="text-sm font-mono font-bold text-accent">₹{order.total.toLocaleString('en-IN')}</p>
                                    <p className="text-[8px] text-accent/30 uppercase font-bold tracking-widest">{order.items.length} Items</p>
                                  </div>
                                  
                                  <div className="flex items-center space-x-1">
                                    {order.status === 'pending' && (
                                      <>
                                        <button 
                                          onClick={() => handleAcceptOrder(order.id)}
                                          className="p-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                                          title="Accept"
                                        >
                                          <Check className="h-3 w-3" />
                                        </button>
                                        <button 
                                          onClick={() => handleRejectOrder(order.id)}
                                          className="p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                                          title="Reject"
                                        >
                                          <Ban className="h-3 w-3" />
                                        </button>
                                      </>
                                    )}

                                    {order.status === 'cooking' && (
                                      <button 
                                        onClick={() => updateOrderStatus(order.id, 'delivering', true)}
                                        className="p-3 bg-primary text-white rounded-xl hover:bg-primary/80 transition-colors flex items-center space-x-1"
                                      >
                                        <ShoppingBag className="h-4 w-4" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Out for Delivery</span>
                                      </button>
                                    )}

                                    {order.status === 'delivering' && (
                                      <button 
                                        onClick={() => updateOrderStatus(order.id, 'completed', true)}
                                        className="p-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center space-x-1"
                                      >
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Mark Delivered</span>
                                      </button>
                                    )}

                                    {order.status === 'completed' && (
                                      <span className="px-4 py-2 bg-green-50 text-green-600 rounded-xl text-[10px] font-bold uppercase tracking-widest">Delivered</span>
                                    )}

                                    {order.status === 'rejected' && (
                                      <span className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-bold uppercase tracking-widest">Cancelled</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2 pt-4 border-t border-accent/5">
                                {order.items.map((item, i) => (
                                  <span key={i} className="px-3 py-1 bg-accent/5 rounded-lg text-[10px] font-bold text-accent/60 uppercase tracking-wider">
                                    {item.quantity}x {item.name}
                                  </span>
                                ))}
                                {order.location && (
                                  <a href={`https://maps.google.com/?q=${order.location.lat},${order.location.lng}`} target="_blank" rel="noreferrer" className="flex items-center space-x-1 px-3 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-bold uppercase tracking-wider ml-auto">
                                    <ExternalLink className="h-3 w-3" />
                                    <span>Location</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {orders.length === 0 && <p className="text-center py-10 text-accent/20 font-bold uppercase tracking-widest">No active orders</p>}
                </div>
              </motion.div>
            )}

            {/* Other tabs remain similar but responsive... */}
            {activeTab === 'inventory' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                  <h2 className="text-2xl font-serif font-bold text-accent">Product Inventory</h2>
                  <button 
                    onClick={() => setIsAddingProduct(true)}
                    className="w-full md:w-auto p-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-primary/20"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Add New Item</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {products.map(product => (
                    <div key={product.id} className="p-4 rounded-3xl border border-accent/10 flex items-center space-x-4 md:space-x-6 hover:bg-accent/5 transition-all">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                        <img src={product.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="font-bold text-accent truncate">{product.name}</h4>
                        <p className="text-[10px] md:text-xs text-accent/30">{product.category}</p>
                      </div>
                      <div className="text-right px-4 md:px-8">
                        <p className={`text-lg md:text-xl font-mono font-bold ${product.inventory < 10 ? 'text-red-500' : 'text-accent'}`}>{product.inventory}</p>
                        <p className="text-[8px] md:text-[10px] uppercase font-bold text-accent/30 whitespace-nowrap">In Stock</p>
                      </div>
                      <div className="flex space-x-1 md:space-x-2">
                        <button 
                          onClick={() => handleEditProduct(product)}
                          className="p-2 md:p-3 bg-accent/5 rounded-xl text-accent hover:bg-primary hover:text-white transition-all"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 md:p-3 bg-red-50 rounded-xl text-red-400 hover:bg-red-500 hover:text-white transition-all"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                <div className="flex justify-between items-center">
                   <h2 className="text-2xl font-serif font-bold text-accent">Sales Analytics</h2>
                   <div className="p-3 bg-accent/5 rounded-2xl flex items-center space-x-2 text-primary font-bold text-xs uppercase tracking-widest">
                      <Clock className="h-4 w-4" />
                      <span>Last 30 Days</span>
                   </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                   {/* Group orders by day and sum totals */}
                   {(() => {
                      const dailyData: { [key: string]: number } = {};
                      orders.filter(o => o.status !== 'rejected').forEach(order => {
                         const date = new Date(order.createdAt).toLocaleDateString();
                         dailyData[date] = (dailyData[date] || 0) + order.total;
                      });

                      return Object.entries(dailyData)
                        .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                        .map(([date, amount]) => (
                           <div key={date} className="p-6 bg-accent/5 rounded-3xl flex justify-between items-center group hover:bg-primary/5 transition-all">
                              <div>
                                 <p className="text-xs font-bold text-accent/30 uppercase tracking-widest mb-1">{new Date(date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                 <h4 className="text-lg font-bold text-accent">Total Sales</h4>
                              </div>
                              <div className="text-right">
                                 <p className="text-2xl font-mono font-bold text-primary">₹{amount.toLocaleString('en-IN')}</p>
                                 <div className="flex items-center text-[10px] font-bold text-green-500 uppercase tracking-widest">
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                    <span>Verified</span>
                                 </div>
                              </div>
                           </div>
                        ));
                   })()}
                </div>

                {orders.length === 0 && (
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-16 w-16 text-accent/10 mx-auto mb-4" />
                      <p className="text-accent/30 font-bold uppercase tracking-widest">No sales data available yet</p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-md mx-auto py-12">
                <div className="text-center mb-12">
                   <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lock className="h-10 w-10 text-primary" />
                   </div>
                   <h2 className="text-3xl font-serif font-bold text-accent tracking-tight">Security Settings</h2>
                   <p className="text-accent/40 text-[10px] uppercase font-bold tracking-widest mt-2">Manage your credentials</p>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-6">
                   {passChangeMsg && (
                      <div className={`p-4 rounded-xl text-xs font-bold flex items-center space-x-2 ${passChangeMsg.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                         {passChangeMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <X className="h-4 w-4" />}
                         <span>{passChangeMsg.text}</span>
                      </div>
                   )}

                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-accent/40 uppercase tracking-widest">Old Password</label>
                      <input 
                        type="password" 
                        required
                        className="w-full px-6 py-4 rounded-2xl bg-accent/5 border border-accent/10 focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
                        value={passwordForm.old}
                        onChange={e => setPasswordForm({...passwordForm, old: e.target.value})}
                      />
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-accent/40 uppercase tracking-widest">New Password</label>
                      <input 
                        type="password" 
                        required
                        className="w-full px-6 py-4 rounded-2xl bg-accent/5 border border-accent/10 focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
                        value={passwordForm.new}
                        onChange={e => setPasswordForm({...passwordForm, new: e.target.value})}
                      />
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-accent/40 uppercase tracking-widest">Confirm New Password</label>
                      <input 
                        type="password" 
                        required
                        className="w-full px-6 py-4 rounded-2xl bg-accent/5 border border-accent/10 focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
                        value={passwordForm.confirm}
                        onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})}
                      />
                   </div>

                   <button 
                      type="submit"
                      disabled={passChangeLoading}
                      className="w-full py-4 bg-accent text-white rounded-2xl font-bold hover:bg-primary transition-all shadow-xl shadow-accent/10 flex items-center justify-center space-x-2 disabled:opacity-50"
                   >
                      {passChangeLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <span>Update Password</span>}
                   </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* New Order Modal Notification */}
      <AnimatePresence>
        {newOrderNotify && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-accent/60 backdrop-blur-sm"
              onClick={() => setNewOrderNotify(null)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl p-8 overflow-hidden border-2 border-primary/20"
            >
              <div className="absolute top-0 right-0 p-2">
                <button onClick={() => setNewOrderNotify(null)} className="p-1 hover:bg-accent/5 rounded-full">
                  <X className="h-5 w-5 text-accent/20" />
                </button>
              </div>
              
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto relative">
                  <Bell className="h-10 w-10 text-primary animate-bounce" />
                  <span className="absolute top-0 right-0 h-6 w-6 bg-red-500 border-4 border-white rounded-full"></span>
                </div>
                
                <div>
                  <h3 className="text-2xl font-serif font-bold text-accent">New Order!</h3>
                  <p className="text-accent/40 text-sm">From {newOrderNotify.customerName}</p>
                </div>

                <div className="p-4 bg-accent/5 rounded-2xl text-left">
                  <p className="text-xs font-bold text-accent/30 uppercase tracking-widest mb-2">Order Items:</p>
                  <ul className="text-sm font-medium text-accent">
                    {newOrderNotify.items.map((item, i) => (
                      <li key={i}>{item.quantity}x {item.name}</li>
                    ))}
                  </ul>
                  <p className="mt-4 text-xl font-mono font-bold text-primary">₹{newOrderNotify.total.toLocaleString('en-IN')}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleAcceptOrder(newOrderNotify.id)}
                    className="py-4 bg-green-500 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
                  >
                    <Check className="h-5 w-5" />
                    <span>Accept</span>
                  </button>
                  <button 
                    onClick={() => handleRejectOrder(newOrderNotify.id)}
                    className="py-4 bg-red-500 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                  >
                    <Ban className="h-5 w-5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Product Modal */}
      <AnimatePresence>
        {isAddingProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-accent/60 backdrop-blur-sm"
              onClick={() => setIsAddingProduct(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-8 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-serif font-bold text-accent">
                  {editingProductId ? 'Edit Product' : 'Add New Item'}
                </h3>
                <button 
                  onClick={() => {
                    setIsAddingProduct(false);
                    setEditingProductId(null);
                    setNewProduct({
                      name: '',
                      price: 0,
                      category: 'Main Course',
                      inventory: 50,
                      image: '',
                      description: ''
                    });
                  }} 
                  className="p-2 hover:bg-accent/5 rounded-full"
                >
                  <X className="h-6 w-6 text-accent/40" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Image Upload */}
                <div className="space-y-2">
                   <label className="text-xs font-bold uppercase tracking-widest text-accent/40">Product Image</label>
                   <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-video rounded-3xl bg-accent/5 border-2 border-dashed border-accent/10 flex flex-col items-center justify-center cursor-pointer hover:bg-accent/10 transition-all overflow-hidden relative"
                   >
                    {newProduct.image ? (
                      <img src={newProduct.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Plus className="h-10 w-10 text-accent/20 mb-2" />
                        <p className="text-sm text-accent/40">Upload Food Photo</p>
                      </>
                    )}
                   </div>
                   <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                   />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-accent/40">Name</label>
                    <input 
                      type="text" 
                      placeholder="Dish Name"
                      className="w-full px-4 py-3 rounded-xl bg-accent/5 border border-accent/10 outline-none"
                      value={newProduct.name}
                      onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-accent/40">Price (₹)</label>
                    <input 
                      type="number" 
                      placeholder="500"
                      className="w-full px-4 py-3 rounded-xl bg-accent/5 border border-accent/10 outline-none"
                      value={newProduct.price || ''}
                      onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-accent/40">Category</label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl bg-accent/5 border border-accent/10 outline-none"
                      value={newProduct.category}
                      onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                    >
                      <option value="Main Course">Main Course</option>
                      <option value="Starters">Starters</option>
                      <option value="Beverages">Beverages</option>
                      <option value="Desserts">Desserts</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-accent/40">Inventory</label>
                    <input 
                      type="number" 
                      placeholder="50"
                      className="w-full px-4 py-3 rounded-xl bg-accent/5 border border-accent/10 outline-none"
                      value={newProduct.inventory || ''}
                      onChange={e => setNewProduct({...newProduct, inventory: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-accent/40">Description</label>
                  <textarea 
                    placeholder="Describe the dish..."
                    className="w-full px-4 py-3 rounded-xl bg-accent/5 border border-accent/10 outline-none h-24"
                    value={newProduct.description}
                    onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                  ></textarea>
                </div>

                <button 
                  onClick={handleSaveProduct}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                  {editingProductId ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

