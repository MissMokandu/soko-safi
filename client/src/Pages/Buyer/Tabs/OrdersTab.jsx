import { Link } from 'react-router-dom'
import { Star, ShoppingBag, MessageSquare } from 'lucide-react'
import { ListSkeleton } from '../../../Components/SkeletonLoader'

const OrdersTab = ({ orders, loading, authLoading, setReviewModal, safeSrc }) => {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">My Orders</h1>
        <p className="text-gray-600">Track your purchases and manage your order history.</p>
      </div>

      {(loading || authLoading) ? (
        <div className="space-y-6">
          <ListSkeleton />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-16 text-center rounded-2xl border-2 border-dashed border-gray-300">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-primary-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No orders yet</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">Start your shopping journey by exploring beautiful handmade crafts from talented artisans.</p>
          <Link
            to="/explore"
            className="bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold px-8 py-4 rounded-xl inline-flex items-center space-x-3 hover:from-primary-600 hover:to-primary-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <span>Explore Products</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start space-x-6">
                    <div className="relative">
                      <img
                        src={safeSrc(order.image)}
                        alt={order.title || order.product}
                        className="w-24 h-24 rounded-xl object-cover shadow-md"
                      />
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-xl mb-2">{order.title || order.product}</h3>
                      <p className="text-gray-600 mb-1">by {order.artisan_name || order.artisan}</p>
                      <p className="text-sm text-gray-500">Order #{order.id} • {order.created_at ? new Date(order.created_at).toLocaleDateString() : order.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary-600 mb-3">KSH {(order.total_amount || order.price).toLocaleString()}</p>
                    <span className={`px-4 py-2 text-sm font-semibold rounded-full border ${
                      (order.status || '').toLowerCase() === 'completed' || (order.status || '').toLowerCase() === 'delivered'
                        ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300'
                        : (order.status || '').toLowerCase() === 'in transit' || (order.status || '').toLowerCase() === 'processing'
                        ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300'
                        : 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300'
                    }`}>
                      {order.status || 'Processing'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-4 pt-6 border-t border-gray-100">
                  <Link to={`/product/${order.product_id || order.id.replace('#', '')}`} className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-200 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2">
                    <span>View Product</span>
                  </Link>
                  {(order.status || '').toLowerCase() === 'completed' || (order.status || '').toLowerCase() === 'delivered' ? (
                    <button
                      onClick={() => setReviewModal({ isOpen: true, product: order })}
                      className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold py-3 px-4 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
                    >
                      <Star className="w-4 h-4" />
                      <span>Write Review</span>
                    </button>
                  ) : null}
                  <Link to={`/messages/${order.artisan_id}`} className="flex-1 bg-blue-50 text-blue-600 font-semibold py-3 px-4 rounded-xl hover:bg-blue-100 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>Message Artisan</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default OrdersTab