import React, { useState } from 'react';
import { ShoppingBag, Scissors, FileText, Phone, ArrowRight, ExternalLink, Clock, Plus } from 'lucide-react';
import { useEtnikoStore } from '../store/useEtnikoStore';
import { Order, CustomizationRequest } from '../types/schema';
import { jsPDF } from 'jspdf';

export const AdminOrders: React.FC = () => {
  const orders = useEtnikoStore(state => state.orders);
  const requests = useEtnikoStore(state => state.customizationRequests);
  const updateOrderStatus = useEtnikoStore(state => state.updateOrderStatus);
  const updateCustomizationStatus = useEtnikoStore(state => state.updateCustomizationStatus);
  const settings = useEtnikoStore(state => state.settings);

  const [activeTab, setActiveTab] = useState<'orders' | 'requests'>('orders');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<CustomizationRequest | null>(null);
  
  // Customization note text log
  const [newNote, setNewNote] = useState('');

  const orderStatuses: Order['orderStatus'][] = [
    'New',
    'Confirmed',
    'Packed',
    'Shipped',
    'Delivered',
    'Returned/Cancelled'
  ];

  const customizationStatuses: CustomizationRequest['status'][] = [
    'New',
    'In Discussion',
    'Confirmed',
    'In Production',
    'Ready',
    'Delivered'
  ];

  const handleUpdateOrderStatus = (orderId: string, status: Order['orderStatus']) => {
    updateOrderStatus(orderId, status);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, orderStatus: status } : null);
    }
  };

  const handleUpdateCustomStatus = (reqId: string, status: CustomizationRequest['status']) => {
    updateCustomizationStatus(reqId, status);
    if (selectedRequest && selectedRequest.id === reqId) {
      setSelectedRequest(prev => prev ? { ...prev, status } : null);
    }
  };

  const handleAddRequestNote = (e: React.FormEvent, reqId: string) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    updateCustomizationStatus(reqId, selectedRequest!.status, newNote);
    
    // Optimistic update for local UI log
    if (selectedRequest) {
      setSelectedRequest(prev => prev ? {
        ...prev,
        notes: [...prev.notes, { author: 'Admin', text: newNote, timestamp: new Date().toISOString() }]
      } : null);
    }
    setNewNote('');
  };

  const handleWhatsAppCustomer = (phoneNum: string, message: string) => {
    const cleanNum = phoneNum.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/91${cleanNum}?text=${encoded}`, '_blank');
  };

  const handlePrintInvoice = (order: Order) => {
    const doc = new jsPDF();
    // Header
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.text("ETNIKO DESIGNER STUDIO", 20, 25);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.text("K1 Primo, Plot No. 7/8/9, 4th Floor, near Kondapur signal,", 20, 32);
    doc.text("Hanuman Nagar, Hyderabad, Telangana 500084", 20, 36);
    doc.text("GSTIN: 36AAAAA0000A1Z0 | support@etniko.in", 20, 40);
    
    // Invoice info
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.text("TAX INVOICE", 140, 25);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Invoice No: ${order.id}`, 140, 32);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 140, 36);
    doc.text(`Status: ${order.orderStatus.toUpperCase()}`, 140, 40);
    
    doc.line(20, 45, 190, 45);
    
    // Bill to
    doc.setFont("Helvetica", "bold");
    doc.text("Bill To:", 20, 52);
    doc.setFont("Helvetica", "normal");
    doc.text(order.shippingAddress.name, 20, 57);
    doc.text(order.shippingAddress.phone, 20, 62);
    doc.text(`${order.shippingAddress.addressLine1}, ${order.shippingAddress.addressLine2 || ''}`, 20, 67);
    doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}`, 20, 72);
    
    // Table Header
    doc.setFillColor(31, 41, 55);
    doc.rect(20, 80, 170, 8, "F");
    doc.setTextColor(253, 251, 247);
    doc.setFont("Helvetica", "bold");
    doc.text("Item Details / SKU", 22, 85);
    doc.text("Size", 100, 85);
    doc.text("Qty", 120, 85);
    doc.text("Price", 140, 85);
    doc.text("Total", 165, 85);
    
    // Table Rows
    doc.setTextColor(31, 41, 55);
    doc.setFont("Helvetica", "normal");
    let currentY = 93;
    
    order.items.forEach((item) => {
      doc.text(`${item.name}`, 22, currentY);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`SKU: ${item.sku}`, 22, currentY + 4);
      doc.setFontSize(9);
      doc.setTextColor(31, 41, 55);
      
      doc.text(item.size, 100, currentY);
      doc.text(String(item.qty), 120, currentY);
      doc.text(`Rs. ${item.price.toLocaleString('en-IN')}`, 140, currentY);
      doc.text(`Rs. ${(item.price * item.qty).toLocaleString('en-IN')}`, 165, currentY);
      
      doc.line(20, currentY + 6, 190, currentY + 6);
      currentY += 12;
    });
    
    // Totals
    const rightAlignX = 140;
    doc.text("Subtotal:", rightAlignX, currentY);
    doc.text(`Rs. ${order.subtotal.toLocaleString('en-IN')}`, 165, currentY);
    
    doc.text("CGST (2.5%):", rightAlignX, currentY + 5);
    doc.text(`Rs. ${(Math.round(order.subtotal * 0.025)).toLocaleString('en-IN')}`, 165, currentY + 5);
    
    doc.text("SGST (2.5%):", rightAlignX, currentY + 10);
    doc.text(`Rs. ${(Math.round(order.subtotal * 0.025)).toLocaleString('en-IN')}`, 165, currentY + 10);
    
    doc.text("Shipping:", rightAlignX, currentY + 15);
    doc.text(`Rs. ${order.shipping.toLocaleString('en-IN')}`, 165, currentY + 15);
    
    doc.line(130, currentY + 18, 190, currentY + 18);
    
    doc.setFont("Helvetica", "bold");
    doc.text("Grand Total:", rightAlignX, currentY + 23);
    doc.text(`Rs. ${order.total.toLocaleString('en-IN')}`, 165, currentY + 23);
    
    doc.save(`etniko-admin-invoice-${order.id}.pdf`);
  };

  return (
    <div className="space-y-6">
      
      {/* Navigation Tabs */}
      <div className="flex border-b border-cream-200">
        <button
          onClick={() => {
            setActiveTab('orders');
            setSelectedRequest(null);
          }}
          className={`px-6 py-3 text-xs uppercase tracking-luxury font-sans font-semibold border-b-2 transition-all ${
            activeTab === 'orders' ? 'border-teal-800 text-teal-800' : 'border-transparent text-charcoal-400 hover:text-charcoal-700'
          }`}
        >
          Standard Orders ({orders.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('requests');
            setSelectedOrder(null);
          }}
          className={`px-6 py-3 text-xs uppercase tracking-luxury font-sans font-semibold border-b-2 transition-all ${
            activeTab === 'requests' ? 'border-teal-800 text-teal-800' : 'border-transparent text-charcoal-400 hover:text-charcoal-700'
          }`}
        >
          Customization Requests ({requests.length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Listing List */}
        <div className="lg:col-span-2 space-y-4">
          
          {activeTab === 'orders' ? (
            <div className="space-y-3">
              {orders.map(o => (
                <div
                  key={o.id}
                  onClick={() => setSelectedOrder(o)}
                  className={`p-4 border cursor-pointer transition-all shadow-sm ${
                    selectedOrder?.id === o.id ? 'border-teal-800 bg-teal-50/10' : 'border-cream-200 bg-white hover:border-cream-300'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="font-mono text-[10px] text-teal-800 font-semibold">{o.id}</div>
                      <h4 className="font-serif font-medium text-charcoal-900 mt-1">{o.customerName}</h4>
                      <p className="text-[10px] text-charcoal-400 font-sans mt-0.5">{o.items.length} items · Total: ₹{o.total.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="text-right space-y-1.5 shrink-0">
                      <span className={`inline-block px-2 py-0.5 text-[9px] uppercase tracking-wider font-sans font-medium ${
                        o.orderStatus === 'New' ? 'bg-terracotta-50 text-terracotta-700 border border-terracotta-200' : 'bg-cream-100 text-charcoal-600'
                      }`}>
                        {o.orderStatus}
                      </span>
                      <div className="text-[9px] text-charcoal-400 font-sans">{new Date(o.createdAt).toLocaleDateString('en-IN')}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map(r => (
                <div
                  key={r.id}
                  onClick={() => setSelectedRequest(r)}
                  className={`p-4 border cursor-pointer transition-all shadow-sm ${
                    selectedRequest?.id === r.id ? 'border-teal-800 bg-teal-50/10' : 'border-cream-200 bg-white hover:border-cream-300'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="font-mono text-[10px] text-teal-800 font-semibold">{r.id}</div>
                      <h4 className="font-serif font-medium text-charcoal-900 mt-1">{r.customerName}</h4>
                      <p className="text-[10px] text-charcoal-400 font-sans mt-0.5">Bespoke: {r.productName}</p>
                    </div>
                    <div className="text-right space-y-1.5 shrink-0">
                      <span className={`inline-block px-2 py-0.5 text-[9px] uppercase tracking-wider font-sans font-medium ${
                        r.status === 'New' ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'bg-cream-100 text-charcoal-600'
                      }`}>
                        {r.status}
                      </span>
                      <div className="text-[9px] text-charcoal-400 font-sans">{new Date(r.createdAt).toLocaleDateString('en-IN')}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Right Side: Detailed Details View */}
        <div className="lg:col-span-1">
          
          {/* STANDARD ORDER DETAILS */}
          {selectedOrder && (
            <div className="border border-cream-200 bg-white p-5 shadow-sm space-y-6 page-fade-in font-sans text-xs">
              
              {/* Header metadata */}
              <div className="border-b border-cream-100 pb-3 flex justify-between items-start">
                <div>
                  <h4 className="font-serif text-base text-charcoal-900 uppercase">Order Overview</h4>
                  <p className="font-mono text-[10px] text-charcoal-400">{selectedOrder.id}</p>
                </div>
                <button
                  onClick={() => handlePrintInvoice(selectedOrder)}
                  className="p-1.5 text-charcoal-500 hover:text-teal-800 hover:bg-cream-50"
                  title="Print Tax Invoice"
                >
                  <FileText className="w-4 h-4" />
                </button>
              </div>

              {/* Status Update Pipeline dropdown */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase text-charcoal-500 font-medium">Pipeline Status</label>
                <select
                  value={selectedOrder.orderStatus}
                  onChange={e => handleUpdateOrderStatus(selectedOrder.id, e.target.value as Order['orderStatus'])}
                  className="w-full px-3 py-2 border border-cream-200 bg-white"
                >
                  {orderStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {/* Customer Contact */}
              <div className="space-y-2 bg-cream-50 p-3 border border-cream-100">
                <div className="font-semibold text-charcoal-900">{selectedOrder.customerName}</div>
                <div className="text-charcoal-500">{selectedOrder.customerEmail} · {selectedOrder.customerPhone}</div>
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => handleWhatsAppCustomer(selectedOrder.customerPhone, `Hello ${selectedOrder.customerName}, this is Etniko Designer Studio regarding your order ${selectedOrder.id}. We are updating your status to ${selectedOrder.orderStatus}.`)}
                    className="flex-1 py-1.5 bg-emerald-600 text-white text-[10px] uppercase tracking-wider font-sans font-medium flex items-center justify-center gap-1"
                  >
                    <Phone className="w-3 h-3 fill-current" />
                    <span>WhatsApp Customer</span>
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <div className="text-[10px] uppercase tracking-widest text-teal-800 font-semibold border-b border-cream-100 pb-1">Items Summary</div>
                <div className="space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-center">
                      <img src={item.image} alt="" className="w-8 h-10 object-cover border border-cream-100 bg-cream-50" />
                      <div className="flex-1">
                        <div className="font-serif text-xs text-charcoal-900 font-medium line-clamp-1">{item.name}</div>
                        <div className="text-[9px] text-charcoal-400 uppercase">Size: {item.size} · Qty: {item.qty}</div>
                      </div>
                      <div className="font-serif">₹{(item.price * item.qty).toLocaleString('en-IN')}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Destination */}
              <div className="space-y-1 bg-cream-50/50 p-3 border border-cream-100 text-charcoal-600 leading-relaxed">
                <div className="text-[10px] uppercase tracking-wider text-charcoal-400 font-medium mb-1">Shipping Destination</div>
                <div>{selectedOrder.shippingAddress.addressLine1}</div>
                {selectedOrder.shippingAddress.addressLine2 && <div>{selectedOrder.shippingAddress.addressLine2}</div>}
                <div>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.postalCode}</div>
              </div>

              {/* Order total */}
              <div className="border-t border-cream-100 pt-3 flex justify-between font-serif text-sm font-semibold">
                <span>Grand Total</span>
                <span>₹{selectedOrder.total.toLocaleString('en-IN')}</span>
              </div>

            </div>
          )}

          {/* CUSTOMIZATION INQUIRY REQUEST DETAILS */}
          {selectedRequest && (
            <div className="border border-cream-200 bg-white p-5 shadow-sm space-y-5 page-fade-in font-sans text-xs flex flex-col justify-between max-h-[85vh] overflow-y-auto custom-scrollbar">
              
              <div className="space-y-4">
                {/* Header */}
                <div className="border-b border-cream-100 pb-3 flex justify-between items-start">
                  <div>
                    <h4 className="font-serif text-base text-charcoal-900 uppercase">Customization File</h4>
                    <p className="font-mono text-[10px] text-charcoal-400">{selectedRequest.id}</p>
                  </div>
                  {selectedRequest.referenceImageUrl && (
                    <a
                      href={selectedRequest.referenceImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-charcoal-400 hover:text-teal-800"
                      title="View Reference Image"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>

                {/* Status selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase text-charcoal-500 font-medium">Bespoke Status</label>
                  <select
                    value={selectedRequest.status}
                    onChange={e => handleUpdateCustomStatus(selectedRequest.id, e.target.value as CustomizationRequest['status'])}
                    className="w-full px-3 py-2 border border-cream-200 bg-white"
                  >
                    {customizationStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                {/* Client contacts */}
                <div className="bg-cream-50 p-3 border border-cream-100 space-y-2">
                  <div className="font-semibold text-charcoal-900">{selectedRequest.customerName}</div>
                  <div className="text-charcoal-500">{selectedRequest.phone}</div>
                  <button
                    onClick={() => handleWhatsAppCustomer(selectedRequest.phone, `Hello ${selectedRequest.customerName}, this is Etniko Designer Studio regarding your Customization Request ${selectedRequest.id} for the ${selectedRequest.productName}. Let us discuss the measurements!`)}
                    className="w-full py-1.5 bg-emerald-600 text-white text-[10px] uppercase tracking-wider font-sans font-medium flex items-center justify-center gap-1 mt-1"
                  >
                    <Phone className="w-3 h-3 fill-current" />
                    <span>WhatsApp Stylist discussion</span>
                  </button>
                </div>

                {/* Garment details */}
                <div className="flex gap-3 items-center border border-cream-100 p-2">
                  <img src={selectedRequest.productImage} alt="" className="w-8 h-10 object-cover bg-cream-50" />
                  <div>
                    <div className="font-serif font-medium line-clamp-1">{selectedRequest.productName}</div>
                    <div className="font-mono text-[9px] text-charcoal-400 uppercase">{selectedRequest.productSku}</div>
                  </div>
                </div>

                {/* Sizing Details */}
                <div className="space-y-2">
                  <div className="text-[10px] uppercase tracking-widest text-teal-800 font-semibold border-b border-cream-100 pb-1">Measurements Sheet</div>
                  <div className="grid grid-cols-2 gap-2 text-charcoal-600">
                    <div className="bg-cream-50 p-2 border border-cream-100">
                      <span className="text-[9px] text-charcoal-400 block">Bust</span>
                      <span className="font-semibold text-charcoal-800">{selectedRequest.measurements.bust || 'N/A'}</span>
                    </div>
                    <div className="bg-cream-50 p-2 border border-cream-100">
                      <span className="text-[9px] text-charcoal-400 block">Waist</span>
                      <span className="font-semibold text-charcoal-800">{selectedRequest.measurements.waist || 'N/A'}</span>
                    </div>
                    <div className="bg-cream-50 p-2 border border-cream-100">
                      <span className="text-[9px] text-charcoal-400 block">Hips</span>
                      <span className="font-semibold text-charcoal-800">{selectedRequest.measurements.hips || 'N/A'}</span>
                    </div>
                    <div className="bg-cream-50 p-2 border border-cream-100">
                      <span className="text-[9px] text-charcoal-400 block">Height</span>
                      <span className="font-semibold text-charcoal-800">{selectedRequest.measurements.height || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="bg-cream-50 p-2 border border-cream-100 text-charcoal-600">
                    <span className="text-[9px] text-charcoal-400 block">Shoulder Width</span>
                    <span className="font-semibold text-charcoal-800">{selectedRequest.measurements.shoulder || 'N/A'}</span>
                  </div>
                  {selectedRequest.measurements.custom && (
                    <div className="bg-cream-50 p-2 border border-cream-100 text-charcoal-600">
                      <span className="text-[9px] text-charcoal-400 block">Other measurements detail</span>
                      <p className="mt-0.5">{selectedRequest.measurements.custom}</p>
                    </div>
                  )}
                  {selectedRequest.specialRequests && (
                    <div className="bg-terracotta-50/50 p-2 border border-terracotta-100 text-charcoal-600">
                      <span className="text-[9px] text-terracotta-700 font-semibold block">Stylist Instructions</span>
                      <p className="mt-0.5 font-sans leading-relaxed">{selectedRequest.specialRequests}</p>
                    </div>
                  )}
                </div>

                {/* Notes History */}
                <div className="space-y-2">
                  <div className="text-[10px] uppercase tracking-widest text-teal-800 font-semibold border-b border-cream-100 pb-1">Discussion Log</div>
                  <div className="space-y-2 max-h-[140px] overflow-y-auto custom-scrollbar">
                    {selectedRequest.notes.map((note, idx) => (
                      <div key={idx} className="bg-cream-50 p-2 border border-cream-100 relative">
                        <div className="flex justify-between items-center text-[9px] text-charcoal-400 mb-1">
                          <span className="font-semibold text-teal-800">{note.author}</span>
                          <span>{new Date(note.timestamp).toLocaleDateString('en-IN')}</span>
                        </div>
                        <p className="text-charcoal-700 leading-relaxed font-sans">{note.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Add Note Form */}
              <form onSubmit={(e) => handleAddRequestNote(e, selectedRequest.id)} className="pt-4 border-t border-cream-100 flex gap-2 shrink-0">
                <input
                  type="text"
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  placeholder="Type styling log note..."
                  className="flex-1 px-3 py-1.5 border border-cream-200 bg-white"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-charcoal-900 text-cream-50 uppercase text-[9px] tracking-wider"
                >
                  Log
                </button>
              </form>

            </div>
          )}

          {/* Fallback empty view */}
          {!selectedOrder && !selectedRequest && (
            <div className="border border-dashed border-cream-300 p-12 text-center text-charcoal-400 font-sans text-xs">
              Select an order or customization request to inspect the details sheet, change pipeline status, or contact the customer.
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
