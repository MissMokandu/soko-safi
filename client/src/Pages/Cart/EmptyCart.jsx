import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'

const EmptyCart = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
      <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
      <p className="text-gray-600 mb-6">
        Add some beautiful handcrafted items to get started!
      </p>
      <Link
        to="/buyer-dashboard?tab=explore"
        className="btn-primary inline-block px-6 py-3"
      >
        Explore Products
      </Link>
    </div>
  )
}

export default EmptyCart