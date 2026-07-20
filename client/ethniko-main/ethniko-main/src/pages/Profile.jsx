import React, { useState, useEffect } from 'react';
import { ShoppingBag, MapPin, Scissors, Settings, ChevronRight, Trash2 } from 'lucide-react';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, login, register, logout, loading: authLoading } = useAuth();
  
  const [profileState, setProfileState] = useState(user);
  const profile = profileState || user;
  const [orders, setOrders] = useState([]);
  const [customizations, setCustomizations] = useState([]);
  const [activeTab, setActiveTab] = useState("orders");
  const [loading, setLoading] = useState(true);

  // Auth Forms State
  const [isSignUp, setIsSignUp] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Address Add Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", postalCode: "", country: "India"
  });

  // Settings Edit State
  const [settingsForm, setSettingsForm] = useState({ name: "", email: "", phone: "" });
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Active Order Detail Modal/State for tracking details
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Fetch initial profile & data when user logs in successfully
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) {
        setProfileState(null);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        setProfileState(user);
        setSettingsForm({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
        
        // Fetch real order lists and bespoke customized requests from Firestore
        const userOrd = await userService.getUserOrders();
        const userCust = await userService.getUserCustomizations();

        setOrders(userOrd);
        setCustomizations(userCust);
      } catch (err) {
        console.error('Error syncing profile records:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [user]);

  // Handle Authentication Forms
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthSubmitting(true);
    try {
      if (isSignUp) {
        await register(emailInput, passwordInput, nameInput, phoneInput);
      } else {
        await login(emailInput, passwordInput);
      }
    } catch (err) {
      console.error('Auth error:', err);
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.name || !newAddress.phone || !newAddress.addressLine1 || !newAddress.city || !newAddress.postalCode) return;

    try {
      const updatedAddresses = await userService.addAddress(newAddress);
      setProfileState(prev => ({ ...prev, addresses: updatedAddresses }));
      setShowAddressForm(false);
      setNewAddress({ name: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", postalCode: "", country: "India" });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const updatedAddresses = await userService.deleteAddress(addressId);
      setProfileState(prev => ({ ...prev, addresses: updatedAddresses }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    try {
      const updatedProf = await userService.updateUserProfile(settingsForm);
      setProfileState(prev => ({ ...prev, ...updatedProf }));
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // 1. Loading State
  if (authLoading || (loading && user)) {
    return (
      <div
        className="py-32 text-center bg-fixed bg-no-repeat bg-cover min-h-[60vh] flex items-center justify-center"
        style={{ background: "linear-gradient(180deg, #FBE7C6 0%, #F6EFE3 40%, #E9DCC4 100%)" }}
      >
        <span className="font-serif italic text-[#B68D40] animate-pulse">Syncing Boutique Records...</span>
      </div>
    );
  }

  // 2. Unauthenticated State: Render Luxury Form
  if (!user) {
    return (
      <div
        className="min-h-[80vh] flex items-center justify-center py-20 px-6 bg-fixed bg-no-repeat bg-cover"
        style={{ background: "linear-gradient(180deg, #FBE7C6 0%, #F6EFE3 40%, #E9DCC4 100%)" }}
      >
        <div className="w-full max-w-md bg-[#FBF6EC] border border-[#E6DCCF] p-8 space-y-6">
          <div className="text-center space-y-1">
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#B68D40] font-sans font-semibold">COUTURE CLIENT PORTAL</span>
            <h2 className="text-2xl font-serif font-light text-[#181818] uppercase tracking-wider">
              {isSignUp ? 'Create Account' : 'Client Sign In'}
            </h2>
            <p className="text-[10px] font-sans text-neutral-400 uppercase tracking-widest">
              {isSignUp ? 'Register to manage bespoke couture orders' : 'Access your customized couture records'}
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans">Full Name</label>
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full bg-transparent border border-neutral-300 px-3 py-2 text-xs font-sans text-[#181818] focus:outline-none focus:border-[#B68D40] uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="w-full bg-transparent border border-neutral-300 px-3 py-2 text-xs font-sans text-[#181818] focus:outline-none focus:border-[#B68D40]"
                  />
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans">Email Address</label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full bg-transparent border border-neutral-300 px-3 py-2 text-xs font-sans text-[#181818] focus:outline-none focus:border-[#B68D40]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans">Password</label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-transparent border border-neutral-300 px-3 py-2 text-xs font-sans text-[#181818] focus:outline-none focus:border-[#B68D40]"
              />
            </div>

            <button
              type="submit"
              disabled={authSubmitting}
              className="btn-luxury-solid w-full mt-2 py-3.5 uppercase tracking-widest text-[10px] font-sans font-bold"
            >
              {authSubmitting ? 'Syncing...' : (isSignUp ? 'Create Premium Account' : 'Authenticate Session')}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[10px] uppercase tracking-widest text-[#B68D40] hover:underline font-semibold font-sans focus:outline-none"
            >
              {isSignUp ? 'Already a client? Sign In' : 'New to ETNIKO? Register here'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const ORDER_STATUS_STEPS = ['New', 'Confirmed', 'Packed', 'Shipped', 'Delivered'];

  // 3. Authenticated State: Render Profile Panel
  return (
    <div
      className="min-h-screen text-[#181818] bg-fixed bg-no-repeat bg-cover"
      style={{ background: "linear-gradient(180deg, #FBE7C6 0%, #F6EFE3 40%, #E9DCC4 100%)" }}
    >
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
        {/* Profile Header card */}
        <div className="bg-[#FBF6EC] border border-[#E6DCCF] p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#B68D40] font-sans font-semibold">COUTURE CLIENT PORTAL</span>
            <h1 className="text-3xl font-serif font-light text-[#181818] uppercase tracking-wider">{profile.name}</h1>
            <p className="text-xs font-sans text-neutral-500 uppercase tracking-widest">
              Client ID: {profile.id || 'N/A'} • Role: {profile.role}
            </p>
          </div>
          <div className="text-left md:text-right text-[10px] font-sans tracking-widest text-neutral-400">
            <p>SUPPORT ASSISTANCE: STYLIST@ETNIKO.STUDIO</p>
            <p className="mt-1 font-semibold text-[#B68D40]">PREMIUM COUTURE SERVICE STATUS</p>
          </div>
        </div>

        {/* Main dashboard splits */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Left Side: Navigation Links Stack */}
          <aside className="w-full md:w-64 border border-[#E6DCCF] shrink-0">
            <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible divide-x md:divide-x-0 md:divide-y divide-[#E6DCCF] text-[10px] font-sans font-semibold tracking-widest uppercase text-neutral-500 bg-[#FBF6EC]">
              <button
                onClick={() => { setActiveTab("orders"); setSelectedOrder(null); }}
                className={`flex-grow md:flex-grow-0 p-4 text-left flex items-center justify-between gap-2.5 focus:outline-none ${
                  activeTab === 'orders' ? 'bg-[#F8F6F2] text-[#B68D40]' : 'hover:bg-neutral-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Orders History</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 hidden md:block" />
              </button>

              <button
                onClick={() => { setActiveTab("addresses"); setSelectedOrder(null); }}
                className={`flex-grow md:flex-grow-0 p-4 text-left flex items-center justify-between gap-2.5 focus:outline-none ${
                  activeTab === 'addresses' ? 'bg-[#F8F6F2] text-[#B68D40]' : 'hover:bg-neutral-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Saved Addresses</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 hidden md:block" />
              </button>

              <button
                onClick={() => { setActiveTab("customizations"); setSelectedOrder(null); }}
                className={`flex-grow md:flex-grow-0 p-4 text-left flex items-center justify-between gap-2.5 focus:outline-none ${
                  activeTab === 'customizations' ? 'bg-[#F8F6F2] text-[#B68D40]' : 'hover:bg-neutral-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Scissors className="w-4 h-4" />
                  <span>Styling Requests</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 hidden md:block" />
              </button>

              <button
                onClick={() => { setActiveTab("settings"); setSelectedOrder(null); }}
                className={`flex-grow md:flex-grow-0 p-4 text-left flex items-center justify-between gap-2.5 focus:outline-none ${
                  activeTab === 'settings' ? 'bg-[#F8F6F2] text-[#B68D40]' : 'hover:bg-neutral-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span>Profile Settings</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 hidden md:block" />
              </button>

              <button
                onClick={logout}
                className="w-full p-4 text-left flex items-center gap-2.5 hover:bg-neutral-100 text-red-600 transition-colors border-t border-[#E6DCCF] focus:outline-none"
              >
                <svg className="w-4 h-4 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Sign Out</span>
              </button>
            </div>
          </aside>

          {/* Right Side: Active tab details container panel */}
          <div className="flex-grow w-full border border-[#E6DCCF] p-8 min-h-[50vh] bg-[#FBF6EC]">
            {/* ORDERS HISTORY */}
            {activeTab === 'orders' && !selectedOrder && (
              <div className="space-y-6">
                <h3 className="font-serif text-lg tracking-wider border-b border-neutral-100 pb-3 uppercase">Order History</h3>
                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((ord) => (
                      <div
                        key={ord.id}
                        onClick={() => setSelectedOrder(ord)}
                        className="border border-[#E6DCCF] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-[#B68D40] transition-colors cursor-pointer bg-white"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs font-semibold text-[#B68D40] tracking-wider">{ord.id}</span>
                            <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 bg-[#F8F6F2] text-neutral-600 font-semibold border border-neutral-200">
                              {ord.orderStatus}
                            </span>
                          </div>
                          <p className="text-[10px] font-sans text-neutral-400">
                            Date: {new Date(ord.createdAt).toLocaleDateString()} • Items count: {ord.items.length}
                          </p>
                        </div>
                        <div className="text-left md:text-right space-y-1">
                          <span className="font-sans text-xs font-bold text-neutral-800 block">
                            ₹{ord.total.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[9px] font-sans tracking-widest text-[#B68D40] uppercase font-bold flex items-center gap-1">
                            <span>View Tracking Details</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400 italic">No purchase orders found.</p>
                )}
              </div>
            )}

            {/* ACTIVE ORDER DETAIL VIEW WITH TRACKING PIPELINE */}
            {activeTab === 'orders' && selectedOrder && (
              <div className="space-y-8">
                <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-[9px] font-sans font-bold uppercase tracking-widest text-neutral-400 hover:text-black focus:outline-none"
                  >
                    ← Back to Orders list
                  </button>
                  <span className="font-mono text-xs font-semibold text-[#B68D40] tracking-wider">
                    {selectedOrder.id}
                  </span>
                </div>

                {/* Status Tracking Step-by-Step progress */}
                <div className="space-y-4 bg-[#F8F6F2] p-6 border border-neutral-200">
                  <h4 className="text-[10px] font-sans font-bold tracking-widest uppercase text-[#B68D40] mb-4">
                    Milestone Order Tracking
                  </h4>

                  {/* Horizontal flow */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-2">
                    {ORDER_STATUS_STEPS.map((step, idx) => {
                      const statusIdx = ORDER_STATUS_STEPS.indexOf(selectedOrder.orderStatus);
                      const isDone = idx <= statusIdx;
                      const isCurrent = idx === statusIdx;

                      return (
                        <div key={step} className="flex md:flex-col items-center gap-3 md:gap-1.5 md:flex-1 text-left md:text-center relative">
                          {/* Dot */}
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center border text-[9px] font-bold ${
                              isDone
                                ? 'bg-[#B68D40] border-[#B68D40] text-white'
                                : 'bg-white border-neutral-300 text-neutral-400'
                            } ${isCurrent ? 'ring-2 ring-[#D9C7A3]' : ''}`}
                          >
                            {isDone ? '✓' : idx + 1}
                          </div>
                          {/* Label */}
                          <span className={`text-[9px] uppercase tracking-wider font-sans font-bold ${
                            isCurrent ? 'text-[#B68D40]' : 'text-neutral-500'
                          }`}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {selectedOrder.trackingNumber && (
                    <div className="pt-4 border-t border-neutral-200/50 mt-4 text-[10px] font-sans text-neutral-500 uppercase tracking-widest">
                      <span>Premium blueDart courier Airway bill: </span>
                      <span className="font-mono font-semibold text-neutral-800">{selectedOrder.trackingNumber}</span>
                    </div>
                  )}
                </div>

                {/* Items listing */}
                <div className="space-y-4">
                  <h4 className="text-[10px] tracking-widest text-[#B68D40] font-sans font-bold uppercase">
                    Purchased Garments
                  </h4>
                  <div className="divide-y divide-neutral-100 border-t border-b border-neutral-100 py-2">
                    {selectedOrder.items.map((item) => (
                      <div key={`${item.productId}-${item.size}`} className="flex gap-4 py-4 items-center justify-between">
                        <div className="flex gap-4 items-center">
                          <div className="w-12 aspect-[3/4] bg-neutral-100 border shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h5 className="font-serif text-[11px] uppercase tracking-wider leading-tight text-neutral-800">
                              {item.name}
                            </h5>
                            <span className="text-[9px] font-sans text-neutral-400 block mt-0.5 uppercase tracking-wider">
                              Size: {item.size} • Qty: {item.qty}
                            </span>
                          </div>
                        </div>
                        <span className="font-sans text-xs font-semibold text-neutral-800">
                          ₹{(item.price * item.qty).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery and totals summary split */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  <div className="space-y-3.5 text-xs text-neutral-600 font-sans leading-relaxed">
                    <h4 className="text-[10px] tracking-widest text-[#B68D40] font-sans font-bold uppercase">
                      Delivery Address
                    </h4>
                    <div className="p-4 border border-[#E6DCCF] space-y-1 bg-[#FBF6EC]">
                      <p className="font-bold text-neutral-800">{selectedOrder.shippingAddress.name}</p>
                      <p>{selectedOrder.shippingAddress.addressLine1}</p>
                      {selectedOrder.shippingAddress.addressLine2 && <p>{selectedOrder.shippingAddress.addressLine2}</p>}
                      <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.postalCode}</p>
                      <p>{selectedOrder.shippingAddress.country} • Phone: {selectedOrder.shippingAddress.phone}</p>
                    </div>
                  </div>

                  <div className="space-y-3 font-sans text-xs text-neutral-500 uppercase tracking-wider p-4 border border-[#E6DCCF] bg-[#FBF6EC]">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-medium text-neutral-800">₹{selectedOrder.subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-[#3E7C59]">
                        <span>Discount</span>
                        <span>-₹{selectedOrder.discount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className="text-[#3E7C59] font-bold">FREE</span>
                    </div>
                    <div className="border-t border-neutral-200/50 pt-2 flex justify-between items-end">
                      <span className="font-serif text-xs text-[#181818] tracking-wider">TOTAL PAID</span>
                      <span className="font-sans text-sm font-bold text-[#B68D40]">₹{selectedOrder.total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SAVED ADDRESSES */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                  <h3 className="font-serif text-lg tracking-wider uppercase">Saved Addresses</h3>
                  <button
                    onClick={() => setShowAddressForm(!showAddressForm)}
                    className="text-[9px] uppercase tracking-widest text-[#B68D40] hover:text-black font-sans font-bold focus:outline-none"
                  >
                    {showAddressForm ? "Cancel" : "+ Add New Address"}
                  </button>
                </div>

                {/* Add form */}
                {showAddressForm && (
                  <form onSubmit={handleAddAddress} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 border border-[#D9C7A3] bg-[#F8F6F2]">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans">Full Name</label>
                      <input
                        type="text"
                        required
                        value={newAddress.name}
                        onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                        className="w-full bg-white border border-neutral-300 px-3 py-2 text-xs font-sans text-[#181818] focus:outline-none focus:border-[#B68D40] uppercase"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans">Phone Number</label>
                      <input
                        type="text"
                        required
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        className="w-full bg-white border border-neutral-300 px-3 py-2 text-xs font-sans text-[#181818] focus:outline-none focus:border-[#B68D40] uppercase"
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans">Address Line 1</label>
                      <input
                        type="text"
                        required
                        value={newAddress.addressLine1}
                        onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                        className="w-full bg-white border border-neutral-300 px-3 py-2 text-xs font-sans text-[#181818] focus:outline-none focus:border-[#B68D40] uppercase"
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans">Address Line 2 (Optional)</label>
                      <input
                        type="text"
                        value={newAddress.addressLine2 || ''}
                        onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                        className="w-full bg-white border border-neutral-300 px-3 py-2 text-xs font-sans text-[#181818] focus:outline-none focus:border-[#B68D40] uppercase"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans">City</label>
                      <input
                        type="text"
                        required
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="w-full bg-white border border-neutral-300 px-3 py-2 text-xs font-sans text-[#181818] focus:outline-none focus:border-[#B68D40] uppercase"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans">State</label>
                      <input
                        type="text"
                        required
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        className="w-full bg-white border border-neutral-300 px-3 py-2 text-xs font-sans text-[#181818] focus:outline-none focus:border-[#B68D40] uppercase"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans">Postal Code</label>
                      <input
                        type="text"
                        required
                        value={newAddress.postalCode}
                        onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                        className="w-full bg-white border border-neutral-300 px-3 py-2 text-xs font-sans text-[#181818] focus:outline-none focus:border-[#B68D40] uppercase"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans">Country</label>
                      <input
                        type="text"
                        disabled
                        value={newAddress.country}
                        className="w-full bg-neutral-100 border border-neutral-300 px-3 py-2 text-xs font-sans text-neutral-400 focus:outline-none uppercase"
                      />
                    </div>
                    <div className="md:col-span-2 pt-2">
                      <button type="submit" className="btn-luxury-solid w-full">Save Address</button>
                    </div>
                  </form>
                )}

                {/* Address list */}
                <div className="grid grid-cols-1 gap-4">
                  {profile.addresses && profile.addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="border border-[#E6DCCF] p-6 flex justify-between items-start bg-white"
                    >
                      <div className="space-y-1.5 text-xs font-sans text-neutral-600">
                        <p className="font-bold text-neutral-800 uppercase">{addr.name}</p>
                        <p>{addr.addressLine1}</p>
                        {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                        <p>{addr.city}, {addr.state} - {addr.postalCode}</p>
                        <p>{addr.country} • Phone: {addr.phone}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="p-2 text-neutral-400 hover:text-[#B42318] focus:outline-none"
                        aria-label="Delete address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STYLING CUSTOMIZATIONS */}
            {activeTab === 'customizations' && (
              <div className="space-y-6">
                <h3 className="font-serif text-lg tracking-wider border-b border-neutral-100 pb-3 uppercase">Bespoke Custom Styling Requests</h3>
                {customizations.length > 0 ? (
                  <div className="space-y-6">
                    {customizations.map((cust) => (
                      <div
                        key={cust.id}
                        className="border border-[#E6DCCF] p-6 space-y-6 bg-white"
                      >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-neutral-200/50 pb-3 gap-3">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs font-semibold text-[#B68D40] tracking-wider">{cust.id}</span>
                            <span className="text-[8px] uppercase tracking-wider px-2 py-0.5 bg-[#B68D40] text-white font-semibold">
                              {cust.status}
                            </span>
                          </div>
                          <span className="text-[9px] font-sans text-neutral-400 uppercase tracking-widest">
                            Submitted: {new Date(cust.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Flex split for item preview and details */}
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                          {cust.images && cust.images.length > 0 && (
                            <div className="w-20 aspect-[3/4] bg-neutral-100 border shrink-0">
                              <img src={cust.images[0]} alt={cust.category} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="flex-grow space-y-3.5 text-xs font-sans text-neutral-600">
                            <div>
                              <span className="text-neutral-400 block uppercase text-[9px] tracking-wider">Garment details:</span>
                              <span className="font-semibold text-neutral-800 uppercase">{cust.category} - {cust.occasion}</span>
                            </div>

                            {/* Measurements breakdown */}
                            <div className="p-3.5 border border-[#E6DCCF] bg-[#FBF6EC] space-y-1">
                              <span className="text-neutral-400 text-[8px] uppercase tracking-wider block font-bold">Styling Dossier values</span>
                              <p className="font-mono text-xs text-neutral-800 whitespace-pre-wrap">{cust.notes || 'No measurement notes assigned yet.'}</p>
                            </div>

                            {cust.fabricPref && (
                              <div>
                                <span className="text-neutral-400 block uppercase text-[9px] tracking-wider">Fabric preference:</span>
                                <p className="italic text-neutral-500">{cust.fabricPref}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Stylist Notes updates panel */}
                        {cust.adminNotes && cust.adminNotes.length > 0 && (
                          <div className="pt-4 border-t border-neutral-200/50 space-y-3">
                            <h5 className="text-[9px] font-sans font-bold tracking-widest text-[#B68D40] uppercase">Stylist Logs</h5>
                            <div className="space-y-2 text-[10px] font-sans">
                              {cust.adminNotes.map((n, idx) => (
                                <div key={idx} className="bg-[#FBF6EC] p-3 border border-[#E6DCCF]">
                                  <div className="flex justify-between items-center mb-1 text-neutral-400">
                                    <span className="font-bold uppercase text-[8px] tracking-wider text-[#B68D40]">{n.author}</span>
                                    <span>{new Date(n.timestamp).toLocaleDateString()}</span>
                                  </div>
                                  <p className="text-neutral-600 font-medium">"{n.text}"</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400 italic">No custom design request folders registered.</p>
                )}
              </div>
            )}

            {/* PROFILE SETTINGS */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="font-serif text-lg tracking-wider border-b border-neutral-100 pb-3 uppercase">Account Settings</h3>

                <form onSubmit={handleUpdateSettings} className="space-y-4 max-w-lg">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans">Full Name</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.name}
                      onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                      className="w-full bg-transparent border border-neutral-300 px-3 py-2 text-xs font-sans text-[#181818] focus:outline-none focus:border-[#B68D40] uppercase"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans">Email Address</label>
                    <input
                      type="email"
                      disabled
                      value={settingsForm.email}
                      className="w-full bg-neutral-100 border border-neutral-300 px-3 py-2 text-xs font-sans text-neutral-400 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.phone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                      className="w-full bg-transparent border border-neutral-300 px-3 py-2 text-xs font-sans text-[#181818] focus:outline-none focus:border-[#B68D40] uppercase"
                    />
                  </div>

                  <div className="pt-2">
                    <button type="submit" className="btn-luxury-solid w-full">Update Account Records</button>
                  </div>

                  {settingsSuccess && (
                    <p className="text-[9px] uppercase tracking-widest text-[#3E7C59] animate-pulse font-medium text-center">
                      Boutique profile archives modified successfully.
                    </p>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}