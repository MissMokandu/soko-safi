import { Link } from 'react-router-dom'

const OrderSummary = ({ cartItems, subtotal, shipping, tax, total, onCheckout }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between text-gray-700">
          <span>Subtotal ({cartItems.length} items)</span>
          <span className="font-medium">KSH {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-gray-700">
          <span>Shipping</span>
          <span className="font-medium">KSH {shipping.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-gray-700">
          <span>Tax (1.6%)</span>
          <span className="font-medium">KSH {tax.toFixed(2)}</span>
        </div>
        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-gray-900">KSH {total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <button
        onClick={onCheckout}
        className="w-full btn-primary py-3 text-lg mb-4"
      >
        Proceed to Checkout
      </button>

      <Link
        to="/buyer-dashboard?tab=explore"
        className="block text-center text-primary hover:text-primary-hover font-medium"
      >
        Continue Shopping
      </Link>
    </div>
  )
}

export default OrderSummary