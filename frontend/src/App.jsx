import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  ClipboardList, 
  Settings, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Banknote, 
  Smartphone,
  ChevronRight,
  Search,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  FileText,
  Code2,
  Database,
  Terminal,
  Zap
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [activeTab, setActiveTab] = useState('pos');
  const [menu, setMenu] = useState({ items: [] });
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [orderType, setOrderType] = useState('Dine-in');
  const [stats, setStats] = useState({ daily_sales: [], top_items: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [isOrdering, setIsOrdering] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [selectedCode, setSelectedCode] = useState(null);

  const codeSnippets = {
    frontend: `// React.js Component & Hooks
function App() {
  const [activeTab, setActiveTab] = useState('pos');
  const [cart, setCart] = useState([]);
  
  useEffect(() => {
    fetchMenu();
  }, []);

  return (
    <div className="flex h-screen bg-[#0f172a]">
      {/* Dynamic Content */}
    </div>
  );
}`,
    backend: `# Python (FastAPI) REST API
@app.post("/order")
def create_order(order: OrderRequest):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Process order and generate PDF
    total = sum(i.total for i in order.items)
    return {"status": "success", "id": order_id}`,
    database: `-- SQL Database Queries
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item TEXT,
  price REAL,
  quantity INTEGER,
  total REAL,
  date TEXT
);

SELECT item, SUM(quantity) FROM orders 
GROUP BY item ORDER BY total_qty DESC;`,
    github: `# CI/CD Workflow (.github/workflows/main.yml)
name: CI/CD Pipeline
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm install && npm run build`,
    animations: `// Framer Motion Animations
<motion.div 
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  whileHover={{ scale: 1.05 }}
  transition={{ duration: 0.3 }}
  className="bg-slate-800 p-4"
>
  {/* Animated Content */}
</motion.div>`
  };

  useEffect(() => {
    fetchMenu();
    fetchStats();
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await axios.get(`${API_BASE}/menu`);
      setMenu(res.data);
    } catch (err) {
      console.error("Failed to fetch menu", err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/stats`);
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  const addToCart = (item) => {
    const existing = cart.find(i => i.name === item.name);
    if (existing) {
      setCart(cart.map(i => i.name === item.name ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.price * (1 + i.gst) } : i));
    } else {
      setCart([...cart, { ...item, quantity: 1, total: item.price * (1 + item.gst) }]);
    }
  };

  const updateQuantity = (name, delta) => {
    setCart(cart.map(i => {
      if (i.name === name) {
        const newQty = Math.max(0, i.quantity + delta);
        return { ...i, quantity: newQty, total: newQty * i.price * (1 + i.gst) };
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const submitOrder = async () => {
    if (cart.length === 0) return;
    setIsOrdering(true);
    try {
      const payload = {
        items: cart.map(i => ({ name: i.name, quantity: i.quantity, price: i.price, total: i.total })),
        payment_method: paymentMethod,
        order_type: orderType
      };
      const res = await axios.post(`${API_BASE}/order`, payload);
      setLastOrder(res.data);
      setCart([]);
      fetchStats();
      setTimeout(() => setLastOrder(null), 5000);
    } catch (err) {
      alert("Failed to submit order");
    } finally {
      setIsOrdering(false);
    }
  };

  const filteredMenu = menu.items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-100 font-sans">
      {/* Sidebar */}
      <div className="w-20 lg:w-64 bg-[#1e293b] border-r border-slate-800 flex flex-col p-4">
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="bg-emerald-500 p-2 rounded-xl">
            <LayoutDashboard className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-bold hidden lg:block tracking-tight">DineFlow<span className="text-emerald-500">.</span></h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          <SidebarItem 
            icon={<ShoppingCart size={20} />} 
            label="POS Terminal" 
            active={activeTab === 'pos'} 
            onClick={() => setActiveTab('pos')} 
          />
          <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <SidebarItem 
            icon={<Terminal size={20} />} 
            label="Source Code" 
            onClick={() => window.open('https://github.com', '_blank')} 
          />
          <SidebarItem 
            icon={<ClipboardList size={20} />} 
            label="Menu Manager" 
            active={activeTab === 'menu'} 
            onClick={() => setActiveTab('menu')} 
          />
          <SidebarItem 
            icon={<Settings size={20} />} 
            label="Settings" 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
          />
          <SidebarItem 
            icon={<FileText size={20} />} 
            label="Project Report" 
            active={activeTab === 'report'} 
            onClick={() => setActiveTab('report')} 
          />
        </nav>

        <div className="mt-auto bg-slate-800/50 rounded-2xl p-4 hidden lg:block">
          <p className="text-xs text-slate-400 mb-1">Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Server Online</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'pos' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Menu Section */}
            <div className="flex-1 p-6 overflow-y-auto">
              <header className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-bold">New Order</h2>
                  <p className="text-slate-400">Select items from the menu below</p>
                </div>
                <div className="relative w-64 lg:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search dishes or categories..." 
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </header>

              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredMenu.map((item, idx) => (
                  <motion.div 
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => addToCart(item)}
                    className="bg-[#1e293b] p-4 rounded-2xl border border-slate-800 cursor-pointer hover:border-emerald-500/50 transition-colors group"
                  >
                    <div className="w-full h-32 bg-slate-700/50 rounded-xl mb-4 flex items-center justify-center text-slate-500 group-hover:text-emerald-500 transition-colors">
                      <Plus size={32} />
                    </div>
                    <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">{item.category}</span>
                    <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">${item.price.toFixed(2)}</span>
                      <div className="bg-emerald-500/10 text-emerald-500 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus size={16} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Cart Section */}
            <div className="w-96 bg-[#1e293b] border-l border-slate-800 flex flex-col p-6 shadow-2xl relative">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <ShoppingCart size={20} className="text-emerald-500" /> Current Cart
              </h2>
              
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                <AnimatePresence>
                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                      <ShoppingCart size={48} className="mb-4 opacity-20" />
                      <p>Your cart is empty</p>
                    </div>
                  ) : (
                    cart.map((item, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        key={idx} 
                        className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{item.name}</h4>
                          <span className="font-bold text-emerald-500">${item.total.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => updateQuantity(item.name, -1)} className="p-1 hover:text-red-400 transition-colors"><Minus size={16} /></button>
                          <span className="bg-slate-700 px-2.5 py-0.5 rounded-lg text-sm font-bold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.name, 1)} className="p-1 hover:text-emerald-400 transition-colors"><Plus size={16} /></button>
                          <button onClick={() => updateQuantity(item.name, -999)} className="ml-auto p-1 text-slate-500 hover:text-red-500"><Trash2 size={16} /></button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-700 space-y-4">
                <div className="flex gap-2">
                  <OrderTypeBtn icon={<CheckCircle2 size={16} />} label="Dine-in" active={orderType === 'Dine-in'} onClick={() => setOrderType('Dine-in')} />
                  <OrderTypeBtn icon={<ChevronRight size={16} />} label="Takeaway" active={orderType === 'Takeaway'} onClick={() => setOrderType('Takeaway')} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span>${(calculateTotal() / 1.05).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-sm">
                    <span>Tax (GST 5%)</span>
                    <span>${(calculateTotal() * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold pt-2">
                    <span>Total</span>
                    <span className="text-emerald-500">${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <PaymentBtn icon={<Banknote size={18} />} active={paymentMethod === 'Cash'} onClick={() => setPaymentMethod('Cash')} />
                  <PaymentBtn icon={<CreditCard size={18} />} active={paymentMethod === 'Card'} onClick={() => setPaymentMethod('Card')} />
                  <PaymentBtn icon={<Smartphone size={18} />} active={paymentMethod === 'UPI'} onClick={() => setPaymentMethod('UPI')} />
                </div>

                <button 
                  onClick={submitOrder}
                  disabled={cart.length === 0 || isOrdering}
                  className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all ${
                    isOrdering || cart.length === 0 
                      ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20 active:scale-95'
                  }`}
                >
                  {isOrdering ? 'Processing...' : 'Complete Order'}
                </button>
              </div>

              {/* Order Success Toast */}
              <AnimatePresence>
                {lastOrder && (
                  <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute bottom-4 left-4 right-4 bg-emerald-500 p-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50"
                  >
                    <div className="bg-white/20 p-2 rounded-full"><CheckCircle2 size={24} className="text-white" /></div>
                    <div>
                      <p className="font-bold text-white">Order Success!</p>
                      <p className="text-sm text-emerald-100">Bill #{lastOrder.order_id} generated.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="p-8 overflow-y-auto flex-1 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard icon={<TrendingUp />} title="Daily Revenue" value={`$${stats.daily_sales[0]?.amount || 0}`} trend="+12.5%" />
              <StatCard icon={<ShoppingCart />} title="Total Orders" value={stats.daily_sales.length} trend="+5" />
              <StatCard icon={<DollarSign />} title="Avg Ticket" value="$24.50" trend="-2%" />
            </div>

            <div className="bg-[#1e293b] p-6 rounded-3xl border border-slate-800">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Zap size={20} className="text-emerald-500" /> Technology Stack
                </h3>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Built with Modern Tools</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <TechBadge name="React.js" icon={<Zap size={14} />} color="text-blue-400" />
                <TechBadge name="FastAPI" icon={<Code2 size={14} />} color="text-emerald-400" />
                <TechBadge name="SQLite/MySQL" icon={<Database size={14} />} color="text-indigo-400" />
                <TechBadge name="Tailwind" icon={<TrendingUp size={14} />} color="text-cyan-400" />
                <TechBadge name="Framer" icon={<Zap size={14} />} color="text-pink-400" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-[#1e293b] p-6 rounded-3xl border border-slate-800">
                <h3 className="text-xl font-bold mb-6">Sales Trends</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.daily_sales}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="date" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }} />
                      <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-[#1e293b] p-6 rounded-3xl border border-slate-800">
                <h3 className="text-xl font-bold mb-6">Popular Items</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.top_items}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }} />
                      <Bar dataKey="quantity" fill="#6366f1" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="p-8 overflow-y-auto flex-1">
            <header className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold">Menu Manager</h2>
                <p className="text-slate-400">Add or edit dishes in your restaurant</p>
              </div>
              <button 
                onClick={() => {
                  const name = prompt("Item Name:");
                  const price = parseFloat(prompt("Price:"));
                  const category = prompt("Category (Main/Side/Drink):");
                  if (name && !isNaN(price)) {
                    const newItems = [...menu.items, { name, price, category, gst: 0.05 }];
                    const newMenu = { items: newItems };
                    setMenu(newMenu);
                    axios.post(`${API_BASE}/menu`, newMenu);
                  }
                }}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg"
              >
                <Plus size={20} /> Add New Item
              </button>
            </header>

            <div className="bg-[#1e293b] rounded-3xl border border-slate-800 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-800 text-slate-400 text-sm uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Item Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">GST</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {menu.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-semibold">{item.name}</td>
                      <td className="px-6 py-4 text-slate-400">{item.category}</td>
                      <td className="px-6 py-4">${item.price.toFixed(2)}</td>
                      <td className="px-6 py-4">{item.gst * 100}%</td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => {
                            const newItems = menu.items.filter((_, i) => i !== idx);
                            const newMenu = { items: newItems };
                            setMenu(newMenu);
                            axios.post(`${API_BASE}/menu`, newMenu);
                          }}
                          className="text-slate-500 hover:text-red-500 p-2 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-8 overflow-y-auto flex-1">
            <h2 className="text-3xl font-bold mb-8">Settings</h2>
            <div className="max-w-2xl space-y-6">
              <div className="bg-[#1e293b] p-6 rounded-3xl border border-slate-800">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <CreditCard size={20} className="text-indigo-500" /> Restaurant Profile
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Restaurant Name</label>
                    <input type="text" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2" defaultValue="DineFlow Bistro" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Currency Symbol</label>
                    <input type="text" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2" defaultValue="$" />
                  </div>
                </div>
              </div>

              <div className="bg-[#1e293b] p-6 rounded-3xl border border-slate-800">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Settings size={20} className="text-amber-500" /> System Preferences
                </h3>
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl">
                  <div>
                    <p className="font-semibold">Automatic PDF Receipt</p>
                    <p className="text-sm text-slate-400">Save a copy of every bill as PDF</p>
                  </div>
                  <div className="w-12 h-6 bg-emerald-500 rounded-full relative">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'report' && (
          <div className="p-8 overflow-y-auto flex-1 max-w-5xl mx-auto w-full">
            <header className="mb-12">
              <h2 className="text-4xl font-black mb-2 tracking-tight">Project <span className="text-emerald-500">Report</span></h2>
              <p className="text-slate-400 text-lg">Documentation of technologies and methodologies implemented.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-3 text-emerald-400">
                  <Code2 size={24} /> Tools & Software Learned
                </h3>
                
                <div className="space-y-4">
                  <ReportItem 
                    title="Frontend Development" 
                    items={["React.js", "Tailwind CSS", "HTML5", "JavaScript"]} 
                    icon={<Zap className="text-amber-400" />}
                    onClick={() => setSelectedCode(codeSnippets.frontend)}
                  />
                  <ReportItem 
                    title="Backend & API" 
                    items={["Python (Flask/FastAPI)", "REST APIs"]} 
                    icon={<Code2 className="text-blue-400" />}
                    onClick={() => setSelectedCode(codeSnippets.backend)}
                  />
                  <ReportItem 
                    title="Database Management" 
                    items={["SQLite", "MongoDB / MySQL databases"]} 
                    icon={<Database className="text-purple-400" />}
                    onClick={() => setSelectedCode(codeSnippets.database)}
                  />
                  <ReportItem 
                    title="DevOps & Version Control" 
                    items={["GitHub version control", "CI integration"]} 
                    icon={<Terminal className="text-slate-400" />}
                    onClick={() => setSelectedCode(codeSnippets.github)}
                  />
                  <ReportItem 
                    title="Animations" 
                    items={["Framer Motion (animations)"]} 
                    icon={<TrendingUp className="text-pink-400" />}
                    onClick={() => setSelectedCode(codeSnippets.animations)}
                  />
                </div>
              </section>

              <div className="space-y-6">
                <div className="bg-[#1e293b] p-8 rounded-3xl border border-slate-800 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/20 transition-colors" />
                  <h3 className="text-2xl font-bold mb-6">Learning Outcomes</h3>
                  <p className="text-slate-300 leading-relaxed mb-6">
                    During the development of <span className="text-emerald-500 font-bold">DineFlow</span>, I have mastered the integration of modern web technologies to create a seamless, high-performance restaurant billing system.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm text-slate-400">
                      <CheckCircle2 size={18} className="text-emerald-500" />
                      <span>Real-time state management with React Hooks</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-400">
                      <CheckCircle2 size={18} className="text-emerald-500" />
                      <span>Responsive UI design with Tailwind CSS</span>
                    </div>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {selectedCode ? (
                    <motion.div 
                      key="code"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-[#0f172a] p-6 rounded-3xl border border-slate-800 shadow-2xl relative"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-bold text-slate-500 uppercase">Implementation Code</span>
                        <button onClick={() => setSelectedCode(null)} className="text-slate-500 hover:text-white transition-colors">Close</button>
                      </div>
                      <pre className="text-sm font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                        <code>{selectedCode}</code>
                      </pre>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-64 border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-600 gap-3"
                    >
                      <Code2 size={48} className="opacity-20" />
                      <p className="font-medium">Click a tool to view its code implementation</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Helper Components
const SidebarItem = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${
      active 
        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
    }`}
  >
    <span className={active ? 'scale-110 transition-transform' : 'group-hover:scale-110 transition-transform'}>{icon}</span>
    <span className="font-semibold hidden lg:block">{label}</span>
  </button>
);

const OrderTypeBtn = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold border transition-all ${
      active 
        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' 
        : 'border-slate-700 text-slate-400 hover:border-slate-600'
    }`}
  >
    {icon} {label}
  </button>
);

const PaymentBtn = ({ icon, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center justify-center p-3 rounded-xl border transition-all ${
      active 
        ? 'bg-indigo-500/10 border-indigo-500 text-indigo-500 shadow-inner' 
        : 'border-slate-700 text-slate-400 hover:border-slate-600'
    }`}
  >
    {icon}
  </button>
);

const StatCard = ({ icon, title, value, trend }) => (
  <div className="bg-[#1e293b] p-6 rounded-3xl border border-slate-800 flex items-center gap-5">
    <div className="bg-slate-800 p-4 rounded-2xl text-emerald-500 shadow-inner">{icon}</div>
    <div>
      <p className="text-slate-400 text-sm font-medium">{title}</p>
      <div className="flex items-center gap-3">
        <h4 className="text-2xl font-bold">{value}</h4>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
          {trend}
        </span>
      </div>
    </div>
  </div>
);

const TechBadge = ({ name, icon, color }) => (
  <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-xl flex items-center gap-2 hover:border-slate-700 transition-colors cursor-default">
    <div className={color}>{icon}</div>
    <span className="text-sm font-semibold text-slate-300">{name}</span>
  </div>
);

const ReportItem = ({ title, items, icon, onClick }) => (
  <motion.div 
    whileHover={{ x: 10 }}
    onClick={onClick}
    className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50 hover:border-emerald-500/30 transition-all cursor-pointer group"
  >
    <div className="flex items-center gap-4 mb-3">
      <div className="p-2 bg-slate-900 rounded-lg">{icon}</div>
      <h4 className="font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">{title}</h4>
    </div>
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <span key={i} className="text-xs font-medium px-2.5 py-1 bg-slate-900/50 text-slate-400 rounded-full border border-slate-700">
          {item}
        </span>
      ))}
    </div>
  </motion.div>
);

export default App;
