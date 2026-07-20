import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, Gift, Tag, Check, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function CartDrawer({ isOpen, onClose }) {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    coupon,
    couponError,
    applyCouponCode,
    removeCoupon,
    giftWrap,
    setGiftWrap,
    cartSubtotal,
    cartDiscount,
    giftWrapFee,
    cartTotal
  } = useCart();

  const { user } = useAuth();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplying(true);
    await applyCouponCode(couponInput);
    setIsApplying(false);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    if (!user) {
      toast.error("Please sign in or register to complete your checkout.");
      onClose();
      navigate('/profile');
      return;
    }

    if (!user.addresses || user.addresses.length === 0) {
      toast.error("Please add a shipping address in your profile before checking out.");
      onClose();
      navigate('/profile');
      return;
    }

    setIsCheckingOut(true);
    const primaryAddress = user.addresses[0];

    const orderData = {
      items: cart.map(item => ({
        productId: item.id,
        name: item.name,
        sku: item.slug.toUpperCase(),
        size: item.size,
        qty: item.qty,
        price: item.discountPrice || item.price,
        image: item.image
      })),
      shippingAddress: {
        name: primaryAddress.name,
        phone: primaryAddress.phone,
        addressLine1: primaryAddress.addressLine1,
        addressLine2: primaryAddress.addressLine2 || '',
        city: primaryAddress.city,
        state: primaryAddress.state,
        postalCode: primaryAddress.postalCode,
        country: primaryAddress.country || 'India'
      }
    };

    try {
      // 1. Initialize Order in Express Backend
      const checkoutResponse = await userService.createOrder(orderData);
      
      if (!checkoutResponse || !checkoutResponse.success) {
        throw new Error(checkoutResponse?.message || "Failed to initialize order.");
      }

      const { order, paymentSession } = checkoutResponse.data;

      // 2. Determine Payment Route: Sandbox Bypass vs Live Razorpay
      if (paymentSession.key.startsWith('order_sandbox_')) {
        toast.loading("Simulating payment checkout sandbox bypass...", { id: "checkout_toast" });
        
        // Directly trigger backend signature verification for simulation
        const verifyData = {
          razorpayOrderId: paymentSession.id,
          razorpayPaymentId: 'sandbox_payment_id',
          razorpaySignature: 'sandbox_signature'
        };

        const verifyResponse = await userService.verifyPayment(verifyData);
        
        if (verifyResponse && verifyResponse.success) {
          toast.success("Sandbox order checkout completed successfully!", { id: "checkout_toast" });
          setOrderNumber(order.id);
          setCheckoutSuccess(true);
          clearCart();
        } else {
          throw new Error("Sandbox payment verification failed.");
        }
      } else {
        // Run Live Razorpay Checkout
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          throw new Error("Failed to load Razorpay payment SDK.");
        }

        const options = {
          key: paymentSession.key,
          amount: paymentSession.amount,
          currency: paymentSession.currency,
          name: "ETNIKO",
          description: "Designer Couture Purchase",
          order_id: paymentSession.id,
          handler: async function (response) {
            toast.loading("Verifying transaction credentials...", { id: "checkout_toast" });
            try {
              const verifyData = {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              };

              const verifyResponse = await userService.verifyPayment(verifyData);
              if (verifyResponse && verifyResponse.success) {
                toast.success("Order checkouts registered successfully!", { id: "checkout_toast" });
                setOrderNumber(order.id);
                setCheckoutSuccess(true);
                clearCart();
              } else {
                toast.error("Signature verification failed.", { id: "checkout_toast" });
              }
            } catch (err) {
              console.error(err);
              toast.error("Payment verification failed.", { id: "checkout_toast" });
            }
          },
          prefill: {
            name: user.name || '',
            email: user.email || '',
            contact: user.phone || '',
          },
          theme: {
            color: "#B68D40",
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Checkout failed. Please try again.", { id: "checkout_toast" });
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Cart Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md bg-white dark:bg-[#181818] h-full flex flex-col shadow-2xl border-l border-[#ECECEC] z-10"
          >
            {/* Header */}
            <div className="p-6 border-b border-[#ECECEC] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-[#B68D40]" />
                <span className="font-serif text-lg tracking-wider text-text-custom dark:text-primary">YOUR SHOPPING BAG</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-[#181818] dark:text-[#F8F6F2] hover:text-[#B68D40] focus:outline-none"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {checkoutSuccess ? (
              /* Success Order Screen */
              <div className="flex-grow flex flex-col items-center justify-center p-8 text-center space-y-6">
                <div className="w-16 h-16 bg-[#3E7C59]/10 rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-[#3E7C59]" />
                </div>
                <h3 className="font-serif text-2xl text-[#181818] dark:text-[#F8F6F2] tracking-wider">ORDER CONFIRMED</h3>
                <p className="text-xs text-neutral-500 uppercase tracking-widest leading-relaxed">
                  Thank you for shopping with ETNIKO. Your order has been registered under reference:
                </p>
                <span className="font-mono text-sm font-semibold text-[#B68D40] tracking-widest bg-[#F8F6F2] dark:bg-neutral-800 px-4 py-2 border border-[#D9C7A3]">
                  {orderNumber}
                </span>
                <p className="text-xs text-neutral-400">
                  Our boutique manager will contact you on WhatsApp to finalize sizing verification and tracking details.
                </p>
                <button
                  onClick={() => {
                    setCheckoutSuccess(false);
                    onClose();
                  }}
                  className="btn-luxury-solid w-full"
                >
                  Continue Browsing
                </button>
              </div>
            ) : cart.length === 0 ? (
              /* Empty Cart State */
              <div className="flex-grow flex flex-col items-center justify-center p-8 text-center space-y-6">
                <div className="w-12 h-12 border border-neutral-300 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-neutral-400" />
                </div>
                <h3 className="font-serif text-lg tracking-wider text-text-custom dark:text-primary">YOUR BAG IS EMPTY</h3>
                <p className="text-xs text-neutral-500 uppercase tracking-widest max-w-xs leading-relaxed">
                  Explore our designer pre-drapes, handlooms, and custom bridal edits.
                </p>
                <button
                  onClick={onClose}
                  className="btn-luxury mt-4"
                >
                  Explore Collections
                </button>
              </div>
            ) : (
              /* Cart Contents */
              <>
                {/* Scrollable Items list */}
                <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
                  {cart.map((item) => (
                    <div key={`${item.id}-${item.size}`} className="flex gap-4 pb-6 border-b border-[#ECECEC] items-start">
                      {/* Image */}
                      <div className="w-20 aspect-[3/4] bg-neutral-100 shrink-0 border border-[#ECECEC]">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Item Details */}
                      <div className="flex-grow space-y-1">
                        <span className="text-[9px] uppercase tracking-widest text-[#B68D40] font-sans font-medium">
                          {item.designer}
                        </span>
                        <h4 className="font-serif text-xs text-[#181818] dark:text-[#F8F6F2] uppercase tracking-wider leading-tight">
                          {item.name}
                        </h4>
                        <p className="text-[10px] text-neutral-500 font-sans">
                          Size: <span className="font-medium text-[#181818] dark:text-[#F8F6F2]">{item.size}</span>
                        </p>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3 pt-2">
                          <div className="flex items-center border border-[#ECECEC] bg-[#F8F6F2] dark:bg-neutral-800">
                            <button
                              onClick={() => updateQuantity(item.id, item.size, item.qty - 1)}
                              className="px-2 py-1 text-xs hover:text-[#B68D40] focus:outline-none"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-sans font-medium text-[#181818] dark:text-[#F8F6F2]">{item.qty}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.size, item.qty + 1)}
                              className="px-2 py-1 text-xs hover:text-[#B68D40] focus:outline-none"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => removeFromCart(item.id, item.size)}
                            className="p-1.5 text-neutral-400 hover:text-[#B42318] transition-colors focus:outline-none"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Prices */}
                      <div className="text-right shrink-0">
                        <span className="font-sans text-xs font-medium text-[#181818] dark:text-[#F8F6F2] block">
                          ₹{(item.discountPrice || item.price).toLocaleString('en-IN')}
                        </span>
                        {item.discountPrice && (
                          <span className="font-sans text-[10px] text-neutral-400 line-through block mt-0.5">
                            ₹{item.price.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Luxury Extras - Gift Wrapping */}
                  <div className="bg-[#F8F6F2] dark:bg-neutral-800 p-4 border border-[#D9C7A3] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Gift className="w-5 h-5 text-[#B68D40]" />
                      <div>
                        <h5 className="text-[11px] font-sans font-semibold tracking-wider text-[#181818] dark:text-[#F8F6F2] uppercase">
                          Heritage Muslin Wrap (+₹250)
                        </h5>
                        <p className="text-[9px] font-sans text-neutral-500">
                          Handcrafted muslin wrap box with dried flowers and custom notes.
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={giftWrap}
                      onChange={(e) => setGiftWrap(e.target.checked)}
                      className="accent-[#B68D40] w-4 h-4 cursor-pointer"
                    />
                  </div>

                  {/* Coupon Form */}
                  <form onSubmit={handleApplyCoupon} className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="COUPON CODE (e.g. ETNIKO10)"
                        disabled={!!coupon}
                        className="flex-grow bg-transparent border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-xs font-sans tracking-widest text-[#181818] dark:text-[#F8F6F2] placeholder-neutral-400 focus:outline-none focus:border-[#B68D40] disabled:bg-neutral-100 disabled:dark:bg-neutral-900"
                      />
                      {coupon ? (
                        <button
                          type="button"
                          onClick={removeCoupon}
                          className="px-4 py-2 border border-[#B42318] text-[#B42318] hover:bg-[#B42318] hover:text-white text-[10px] uppercase tracking-widest transition-colors font-sans"
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={isApplying}
                          className="px-4 py-2 border border-[#181818] dark:border-neutral-700 text-[#181818] dark:text-white hover:bg-[#181818] dark:hover:bg-white dark:hover:text-[#181818] hover:text-white text-[10px] uppercase tracking-widest transition-colors font-sans disabled:opacity-50"
                        >
                          Apply
                        </button>
                      )}
                    </div>
                    {couponError && (
                      <p className="text-[9px] uppercase tracking-widest text-[#B42318]">{couponError}</p>
                    )}
                    {coupon && (
                      <p className="text-[9px] uppercase tracking-widest text-[#3E7C59] flex items-center gap-1 font-medium">
                        <Tag className="w-3 h-3" />
                        <span>Code Applied: {coupon.code} ({coupon.description})</span>
                      </p>
                    )}
                  </form>
                </div>

                {/* Footer Totals */}
                <div className="p-6 border-t border-[#ECECEC] bg-white dark:bg-[#181818] space-y-4">
                  <div className="space-y-1.5 text-xs text-neutral-500 font-sans uppercase tracking-wider">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-medium text-[#181818] dark:text-[#F8F6F2]">
                        ₹{cartSubtotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                    {cartDiscount > 0 && (
                      <div className="flex justify-between text-[#3E7C59]">
                        <span>Discount</span>
                        <span>-₹{cartDiscount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {giftWrap && (
                      <div className="flex justify-between">
                        <span>Gift Wrap Fee</span>
                        <span className="font-medium text-[#181818] dark:text-[#F8F6F2]">
                          ₹{giftWrapFee.toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-[10px] text-[#3E7C59] font-semibold">
                      <span>Shipping</span>
                      <span>FREE COMPLEMENTARY</span>
                    </div>
                  </div>

                  <div className="border-t border-neutral-100 pt-3 flex justify-between items-end">
                    <span className="font-serif text-sm tracking-wider text-[#181818] dark:text-[#F8F6F2]">TOTAL ESTIMATED</span>
                    <span className="font-sans text-lg font-bold text-[#B68D40]">
                      ₹{cartTotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="btn-luxury-solid w-full flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isCheckingOut ? (
                      <span className="animate-pulse">PROCESSING COUTURE PACKAGING...</span>
                    ) : (
                      <>
                        <span>PROCEED TO COUTURE CHECKOUT</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
