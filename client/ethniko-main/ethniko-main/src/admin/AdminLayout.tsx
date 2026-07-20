import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Layers, 
  TrendingUp, 
  Users, 
  PackageCheck, 
  Settings, 
  ShieldCheck, 
  LogOut,
  SlidersHorizontal,
  Scissors
} from 'lucide-react';
import { useEtnikoStore } from '../store/useEtnikoStore';

// Panel components (lazy rendering)
import { AdminProducts } from './AdminProducts';
import { AdminOrders } from './AdminOrders';
import { AdminCustomers } from './AdminCustomers';
import { AdminInventory } from './AdminInventory';
import { AdminSettings } from './AdminSettings';

export const AdminLayout: React.FC = () => {
  const [activePanel, setActivePanel] = useState<'products' | 'orders' | 'customers' | 'inventory' | 'settings'>('products');
  const setAdminMode = useEtnikoStore(state => state.setAdminMode);
  
  const products = useEtnikoStore(state => state.products);
  const orders = useEtnikoStore(state => state.orders);
  const requests = useEtnikoStore(state => state.customizationRequests);

  // Overview metrics
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingRequests = requests.filter(r => r.status === 'New' || r.status === 'In Discussion').length;
  const pendingOrders = orders.filter(o => o.orderStatus === 'New' || o.orderStatus === 'Confirmed').length;

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-charcoal-900 text-cream-100 flex flex-col shrink-0">
        
        {/* Title */}
        <div className="p-6 border-b border-charcoal-800 flex justify-between items-center">
          <div className="flex flex-col">
            <span className="font-serif text-lg tracking-widest text-cream-50 uppercase">ETNIKO ADMIN</span>
            <span className="text-[8px] tracking-widest text-charcoal-400 uppercase mt-0.5">Boutique Management</span>
          </div>
          <ShieldCheck className="w-5 h-5 text-teal-500" />
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-6 space-y-2.5 font-sans text-xs">
          
          <button
            onClick={() => setActivePanel('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-none transition-colors ${
              activePanel === 'products' ? 'bg-teal-800 text-cream-50' : 'text-charcoal-400 hover:bg-charcoal-800 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Product Catalog</span>
          </button>

          <button
            onClick={() => setActivePanel('orders')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-none transition-colors ${
              activePanel === 'orders' ? 'bg-teal-800 text-cream-50' : 'text-charcoal-400 hover:bg-charcoal-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-4 h-4" />
              <span>Orders & Requests</span>
            </div>
            {(pendingOrders + pendingRequests) > 0 && (
              <span className="bg-terracotta-700 text-cream-50 text-[9px] px-2 py-0.5 rounded-full font-bold">
                {pendingOrders + pendingRequests}
              </span>
            )}
          </button>

          <button
            onClick={() => setActivePanel('customers')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-none transition-colors ${
              activePanel === 'customers' ? 'bg-teal-800 text-cream-50' : 'text-charcoal-400 hover:bg-charcoal-800 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Customers Database</span>
          </button>

          <button
            onClick={() => setActivePanel('inventory')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-none transition-colors ${
              activePanel === 'inventory' ? 'bg-teal-800 text-cream-50' : 'text-charcoal-400 hover:bg-charcoal-800 hover:text-white'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            <span>Inventory Logs</span>
          </button>

          <button
            onClick={() => setActivePanel('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-none transition-colors ${
              activePanel === 'settings' ? 'bg-teal-800 text-cream-50' : 'text-charcoal-400 hover:bg-charcoal-800 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Hero & Banners Settings</span>
          </button>

        </nav>

        {/* Exit admin */}
        <div className="p-4 border-t border-charcoal-800">
          <button
            onClick={() => setAdminMode(false)}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-charcoal-700 text-xs hover:bg-charcoal-800 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Return to Boutique</span>
          </button>
        </div>

      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
        
        {/* Top metrics dashboard bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-cream-200 p-5 shadow-sm">
            <span className="text-[10px] text-charcoal-400 uppercase tracking-widest font-sans font-medium">LTV Sales Revenue</span>
            <h3 className="font-serif text-2xl text-charcoal-900 mt-1">₹{totalRevenue.toLocaleString('en-IN')}</h3>
          </div>
          <div className="bg-white border border-cream-200 p-5 shadow-sm">
            <span className="text-[10px] text-charcoal-400 uppercase tracking-widest font-sans font-medium">Bespoke Inquiries</span>
            <h3 className="font-serif text-2xl text-teal-800 mt-1">{pendingRequests} Pending</h3>
          </div>
          <div className="bg-white border border-cream-200 p-5 shadow-sm">
            <span className="text-[10px] text-charcoal-400 uppercase tracking-widest font-sans font-medium">New Orders</span>
            <h3 className="font-serif text-2xl text-terracotta-700 mt-1">{pendingOrders} Open</h3>
          </div>
          <div className="bg-white border border-cream-200 p-5 shadow-sm">
            <span className="text-[10px] text-charcoal-400 uppercase tracking-widest font-sans font-medium">Catalog SKUs</span>
            <h3 className="font-serif text-2xl text-charcoal-900 mt-1">{products.length} Active</h3>
          </div>
        </div>

        {/* Dynamic Sub-Panels */}
        <div className="bg-white border border-cream-200 p-6 shadow-sm">
          {activePanel === 'products' && <AdminProducts />}
          {activePanel === 'orders' && <AdminOrders />}
          {activePanel === 'customers' && <AdminCustomers />}
          {activePanel === 'inventory' && <AdminInventory />}
          {activePanel === 'settings' && <AdminSettings />}
        </div>

      </main>

    </div>
  );
};
