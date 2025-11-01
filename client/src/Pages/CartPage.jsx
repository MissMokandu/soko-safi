import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart.jsx";
import { useAuth } from "../context/AuthContext";
import CartLayout from "./Cart/CartLayout";
import CartItemCard from "./Cart/CartItemCard";
import OrderSummary from "./Cart/OrderSummary";
import EmptyCart from "./Cart/EmptyCart";
import CartSkeleton from "./Cart/CartSkeleton";

const CartPage = ({ authLoading = false }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isBuyer, logout } = useAuth();
  const { cartItems, loading, updateQuantity, removeFromCart, loadCart } =
    useCart();
  const [updating, setUpdating] = useState({});

  // Reload cart when page mounts
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadCart();
    }
  }, [authLoading, isAuthenticated]);

  // Debug logging

  const handleUpdateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      setUpdating((prev) => ({ ...prev, [id]: true }));
      await updateQuantity(id, newQuantity);
    } catch (error) {
      alert("Failed to update quantity. Please try again.");
    } finally {
      setUpdating((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleRemoveItem = async (id) => {
    try {
      setUpdating((prev) => ({ ...prev, [id]: true }));
      await removeFromCart(id);
    } catch (error) {
      alert("Failed to remove item. Please try again.");
    } finally {
      setUpdating((prev) => ({ ...prev, [id]: false }));
    }
  };

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.price || item.price || 0;
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    const validPrice = isNaN(numPrice) ? 0 : numPrice;
    return sum + validPrice * item.quantity;
  }, 0);

  const shipping = 150.0; // KSH 150 shipping
  const tax = subtotal * 0.016; // 1.6% VAT
  const total = subtotal + shipping + tax;

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }
    navigate("/checkout");
  };

  // Show authentication required only when not loading
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-6">Please log in to view your cart.</p>
          <Link
            to="/login"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <CartLayout>
      {(loading || authLoading) ? (
        <CartSkeleton />
      ) : cartItems.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                updating={updating[item.id]}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
              />
            ))}
          </div>
          <div className="lg:col-span-1">
            <OrderSummary
              cartItems={cartItems}
              subtotal={subtotal}
              shipping={shipping}
              tax={tax}
              total={total}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      )}
    </CartLayout>
  );
};

export default CartPage;
