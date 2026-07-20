import React, { useState } from 'react';
import { Users, ShoppingBag, MapPin, ArrowRight } from 'lucide-react';
import { useEtnikoStore } from '../store/useEtnikoStore';
import { Customer } from '../types/schema';

export const AdminCustomers: React.FC = () => {
  const customers = useEtnikoStore(state => state.customers);
  const orders = useEtnikoStore(state => state.orders);
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Compute LTV and order metrics per customer
  const customerMetrics = React.useMemo(() => {
    return customers.map(cust => {
      const customerOrders = orders.filter(o => o.customerPhone === cust.phone || o.customerEmail === cust.email);
      const totalSpend = customerOrders.reduce((sum, o) => sum + o.total, 0);
      return {
        ...cust,
        ordersCount: customerOrders.length,
        totalSpend
      };
    });
  }, [customers, orders]);

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="border-b border-cream-200 pb-4">
        <h3 className="font-serif text-xl text-charcoal-900">Customers Directory</h3>
        <p className="text-xs text-charcoal-500 font-sans mt-0.5">View customer histories, lifetime spends, and saved shipping profiles.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Customers Directory List */}
        <div className="lg:col-span-2 overflow-x-auto border border-cream-200 bg-white">
          <table className="w-full text-left font-sans text-xs">
            <thead className="bg-cream-100 border-b border-cream-200 text-[10px] uppercase tracking-widest text-charcoal-500">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Contact Info</th>
                <th className="p-4">Orders Count</th>
                <th className="p-4">Lifetime Spend</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200 text-charcoal-800">
              {customerMetrics.map(c => (
                <tr 
                  key={c.id} 
                  onClick={() => setSelectedCustomer(c)}
                  className={`cursor-pointer hover:bg-cream-50/50 transition-all ${
                    selectedCustomer?.id === c.id ? 'bg-teal-50/10' : ''
                  }`}
                >
                  <td className="p-4 font-serif font-medium text-charcoal-900 text-sm">{c.name}</td>
                  <td className="p-4">
                    <div>{c.email}</div>
                    <div className="text-charcoal-400 mt-0.5">{c.phone}</div>
                  </td>
                  <td className="p-4 font-semibold">{c.ordersCount} orders</td>
                  <td className="p-4 font-serif">₹{c.totalSpend.toLocaleString('en-IN')}</td>
                  <td className="p-4 text-right">
                    <button className="text-teal-800 hover:text-teal-900 p-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider ml-auto">
                      <span>History</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Side: Customer detail profile card */}
        <div className="lg:col-span-1">
          {selectedCustomer ? (
            <div className="border border-cream-200 bg-white p-5 shadow-sm space-y-6 page-fade-in font-sans text-xs">
              
              {/* Header profile details */}
              <div className="border-b border-cream-100 pb-3">
                <span className="text-[9px] uppercase tracking-widest text-teal-800 font-semibold font-sans">Customer Profile</span>
                <h4 className="font-serif text-lg text-charcoal-900 mt-1 uppercase">{selectedCustomer.name}</h4>
                <p className="text-charcoal-400 mt-0.5">Joined: {new Date(selectedCustomer.createdAt).toLocaleDateString('en-IN')}</p>
              </div>

              {/* Total spend block */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-cream-50 p-3 border border-cream-100">
                  <span className="text-[9px] text-charcoal-400 block uppercase">Total Purchases</span>
                  <span className="font-serif text-lg font-bold text-charcoal-900">
                    {orders.filter(o => o.customerPhone === selectedCustomer.phone).length} Orders
                  </span>
                </div>
                <div className="bg-cream-50 p-3 border border-cream-100">
                  <span className="text-[9px] text-charcoal-400 block uppercase">LTV Spend Volume</span>
                  <span className="font-serif text-lg font-bold text-teal-800">
                    ₹{orders
                      .filter(o => o.customerPhone === selectedCustomer.phone)
                      .reduce((sum, o) => sum + o.total, 0)
                      .toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Addresses List */}
              <div className="space-y-3">
                <div className="text-[10px] uppercase tracking-widest text-teal-800 font-semibold border-b border-cream-100 pb-1">Saved Addresses</div>
                <div className="space-y-3">
                  {selectedCustomer.addresses.map((addr, idx) => (
                    <div key={idx} className="flex gap-2.5 items-start text-charcoal-600 leading-relaxed bg-cream-50/50 p-3 border border-cream-100">
                      <MapPin className="w-4 h-4 text-teal-800 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-charcoal-800">{addr.name}</div>
                        <div>{addr.addressLine1}</div>
                        {addr.addressLine2 && <div>{addr.addressLine2}</div>}
                        <div>{addr.city}, {addr.state} - {addr.postalCode}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Orders History List */}
              <div className="space-y-3">
                <div className="text-[10px] uppercase tracking-widest text-teal-800 font-semibold border-b border-cream-100 pb-1">Order History</div>
                <div className="space-y-2 max-h-[180px] overflow-y-auto custom-scrollbar">
                  {orders
                    .filter(o => o.customerPhone === selectedCustomer.phone)
                    .map(o => (
                      <div key={o.id} className="flex justify-between items-center bg-cream-50/50 p-2.5 border border-cream-100">
                        <div>
                          <div className="font-mono text-[9px] text-teal-800 font-semibold">{o.id}</div>
                          <div className="text-charcoal-400 text-[9px] mt-0.5">{new Date(o.createdAt).toLocaleDateString('en-IN')}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-serif">₹{o.total.toLocaleString('en-IN')}</div>
                          <span className="text-[9px] text-charcoal-500 font-semibold uppercase">{o.orderStatus}</span>
                        </div>
                      </div>
                    ))}
                  {orders.filter(o => o.customerPhone === selectedCustomer.phone).length === 0 && (
                    <div className="text-center text-charcoal-400 py-4 font-sans font-normal">
                      No order records found.
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="border border-dashed border-cream-300 p-12 text-center text-charcoal-400 font-sans text-xs">
              Select a customer from the directory to inspect their full purchase history sheet and saved address books.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
