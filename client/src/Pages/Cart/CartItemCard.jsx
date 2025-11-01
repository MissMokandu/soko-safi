import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, Loader } from 'lucide-react'
import ArtisanLink from '../../Components/ArtisanLink'

const CartItemCard = ({ item, updating, onUpdateQuantity, onRemoveItem }) => {
  const calculatePrice = () => {
    const price = item.product?.price || item.price || 0
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    const validPrice = isNaN(numPrice) ? 0 : numPrice
    return (validPrice * item.quantity).toFixed(2)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-start space-x-4">
        <Link to={`/product/${item.product_id || item.productId}`}>
          <img
            src={
              item.product?.image ||
              item.image ||
              "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop"
            }
            alt={item.product?.title || item.title}
            className="w-24 h-24 rounded-lg object-cover"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop"
            }}
          />
        </Link>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <Link
                to={`/product/${item.product_id || item.productId}`}
                className="text-lg font-bold text-gray-900 hover:text-primary"
              >
                {item.product?.title || item.title}
              </Link>
              <p className="text-sm text-gray-600">
                by <ArtisanLink 
                  artisanId={item.product?.artisan_id || item.artisan_id}
                  artisanName={item.product?.artisan_name || item.artisan}
                />
              </p>
            </div>

            <button
              onClick={() => onRemoveItem(item.id)}
              disabled={updating}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
            >
              {updating ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Trash2 className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                disabled={updating || item.quantity <= 1}
                className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
              >
                <Minus className="w-4 h-4" />
              </button>

              <span className="text-lg font-medium w-8 text-center">
                {item.quantity}
              </span>

              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                disabled={updating}
                className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xl font-bold text-gray-900">
              KSH {calculatePrice()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartItemCard