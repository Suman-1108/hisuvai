import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Tag, Check, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    subtotal,
    discountAmount,
    shippingFee,
    grandTotal,
    itemsCount,
    freeShippingProgress,
    amountNeededForFreeShipping,
    clearCart
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [checkoutStep, setCheckoutStep] = useState(null); // 'form', 'success'
  const [shippingDetails, setShippingDetails] = useState({
    name: 'Ramesh Sundaram',
    phone: '+91 98450 12345',
    address: '42, Temple View Avenue, Gandhi Nagar',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600020'
  });

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponInput) {
      applyCoupon(couponInput);
      setCouponInput('');
    }
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    setCheckoutStep('success');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => {
          setIsCartOpen(false);
          setCheckoutStep(null);
        }}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF7EE] shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 border-b border-forest/10 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-forest" />
              <h2 className="font-serif text-lg font-bold text-forest-900">
                Your Nutrition Pantry ({itemsCount})
              </h2>
            </div>
            <button
              onClick={() => {
                setIsCartOpen(false);
                setCheckoutStep(null);
              }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            
            {/* Free Shipping Meter */}
            <div className="bg-white p-3.5 rounded-2xl border border-cream-300 shadow-xs">
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                {amountNeededForFreeShipping === 0 ? (
                  <span className="text-emerald-700 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-gold" />
                    Congratulations! You unlocked Free Shipping
                  </span>
                ) : (
                  <span className="text-gray-700">
                    Add <strong className="text-forest">₹{amountNeededForFreeShipping}</strong> more for Free Shipping
                  </span>
                )}
                <span className="text-forest font-bold">{freeShippingProgress}%</span>
              </div>
              <div className="w-full bg-cream-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-forest h-full transition-all duration-500 rounded-full"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>

            {/* If Cart is Empty */}
            {cart.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 bg-cream-200 rounded-full flex items-center justify-center mx-auto mb-3 text-forest">
                  <ShoppingBag className="w-8 h-8 opacity-60" />
                </div>
                <h3 className="font-serif text-lg font-bold text-gray-800">Your cart is empty</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                  Discover our traditional stone-ground mixes crafted with sprouted grains.
                </p>
                <Link
                  to="/products"
                  onClick={() => setIsCartOpen(false)}
                  className="mt-5 inline-block bg-forest hover:bg-forest-800 text-cream px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                >
                  Explore Products
                </Link>
              </div>
            ) : (
              /* Item List */
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={`${item.id}-${item.size}`}
                    className="bg-white p-3.5 rounded-2xl border border-cream-300 shadow-xs flex gap-3.5 items-center"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover bg-cream-100 shrink-0 border border-cream-200"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif font-bold text-sm text-gray-900 truncate">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-gray-500">{item.size}</p>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                          <button
                            onClick={() => updateQuantity(item.id, item.size, -1)}
                            className="p-1 hover:bg-gray-200 transition-colors"
                            title="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5 text-gray-600" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-gray-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.size, 1)}
                            className="p-1 hover:bg-gray-200 transition-colors"
                            title="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5 text-gray-600" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-sm text-forest-900">
                            ₹{item.price * item.quantity}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id, item.size)}
                      className="text-gray-400 hover:text-red-500 p-1.5 transition-colors"
                      title="Remove from cart"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Coupon Code Section */}
            {cart.length > 0 && (
              <div className="bg-white p-3.5 rounded-2xl border border-cream-300 shadow-xs space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-forest-900">
                  <Tag className="w-3.5 h-3.5 text-gold" />
                  <span>Promotional Coupon Code</span>
                </div>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-forest-50 border border-forest/20 p-2.5 rounded-xl text-xs">
                    <div className="flex items-center gap-2">
                      <span className="bg-forest text-gold font-bold px-2 py-0.5 rounded font-mono text-[11px]">
                        {appliedCoupon}
                      </span>
                      <span className="text-forest-800 font-medium">Applied (-₹{discountAmount})</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-gray-400 hover:text-red-500 text-xs font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Try HISUVAI25 or FESTIVE15"
                      className="flex-1 bg-cream-100 text-gray-800 text-xs px-3 py-2 rounded-xl border border-gray-300 uppercase focus:outline-none focus:border-forest"
                    />
                    <button
                      type="submit"
                      className="bg-forest hover:bg-forest-800 text-cream text-xs font-bold px-4 py-2 rounded-xl transition-colors shrink-0"
                    >
                      Apply
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Footer Bill & Checkout */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-forest/10 bg-white space-y-3">
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">₹{subtotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount Savings</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Delivery</span>
                  <span>{shippingFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${shippingFee}`}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-100">
                  <span>Grand Total</span>
                  <span className="text-base text-forest-900 font-serif">₹{grandTotal}</span>
                </div>
              </div>

              <button
                onClick={() => setCheckoutStep('form')}
                className="w-full bg-forest hover:bg-forest-800 text-cream py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 text-gold" />
              </button>

              <p className="text-[10px] text-center text-gray-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Frontend Prototype — Zero real payment taken
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Mock Checkout Modal */}
      {checkoutStep === 'form' && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7EE] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-cream-300 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-cream-300">
              <h3 className="font-serif text-xl font-bold text-forest-900">
                Complete Your Delivery Details
              </h3>
              <button
                onClick={() => setCheckoutStep(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePlaceOrder} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={shippingDetails.name}
                  onChange={(e) => setShippingDetails({ ...shippingDetails, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={shippingDetails.phone}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">PIN Code</label>
                  <input
                    type="text"
                    required
                    value={shippingDetails.pincode}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, pincode: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Delivery Address</label>
                <textarea
                  rows="2"
                  required
                  value={shippingDetails.address}
                  onChange={(e) => setShippingDetails({ ...shippingDetails, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={shippingDetails.city}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, city: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={shippingDetails.state}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, state: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 bg-white"
                  />
                </div>
              </div>

              <div className="bg-forest-50 p-3 rounded-xl border border-forest/20 mt-3 text-forest-900">
                <div className="flex justify-between font-bold">
                  <span>Payable Amount (Cash on Delivery / UPI):</span>
                  <span className="font-serif text-sm">₹{grandTotal}</span>
                </div>
                <p className="text-[10px] text-forest-700 mt-1">
                  Includes Free Shipping & 100% Traditional Quality Guarantee.
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-forest hover:bg-forest-800 text-cream py-3 rounded-xl font-bold uppercase text-xs tracking-wider mt-4 shadow-sm"
              >
                Confirm Mock Order (₹{grandTotal})
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {checkoutStep === 'success' && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center shadow-2xl border border-cream-300">
            <div className="w-16 h-16 rounded-full bg-forest text-gold flex items-center justify-center mx-auto mb-4 shadow-md">
              <Check className="w-8 h-8" />
            </div>

            <h3 className="font-serif text-2xl font-bold text-forest-900">
              Order Placed Successfully!
            </h3>

            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              Order ID: <strong className="font-mono text-forest">#HIS-{Math.floor(100000 + Math.random() * 900000)}</strong>
              <br />
              Thank you, {shippingDetails.name}! Your freshly roasted and stone-ground nutrition bundle will be dispatched to {shippingDetails.city} within 24 hours.
            </p>

            <div className="bg-cream-100 p-4 rounded-2xl border border-cream-300 my-5 text-left text-xs space-y-1">
              <p className="font-bold text-forest-900">Prototype Demo Notice:</p>
              <p className="text-gray-600">
                This is a frontend demonstration for HISUVAI. No real payment was collected and no actual transaction occurred.
              </p>
            </div>

            <button
              onClick={() => {
                clearCart();
                setCheckoutStep(null);
                setIsCartOpen(false);
              }}
              className="w-full bg-forest hover:bg-forest-800 text-cream py-3 rounded-xl font-bold uppercase text-xs tracking-wider shadow-sm"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
