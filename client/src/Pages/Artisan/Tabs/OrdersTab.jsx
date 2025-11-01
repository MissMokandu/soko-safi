import { ShoppingBag, Package, User } from 'lucide-react'

const OrdersTab = ({ artisanOrders, loading, authLoading }) => {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Orders</h1>
        <p className="text-gray-600">Manage your customer orders and track their progress.</p>
      </div>
      
      {(loading || authLoading) ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 animate-pulse">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                <div className="flex-1 ml-4">
                  <div className="w-48 h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="w-32 h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="text-right">
                  <div className="w-20 h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="w-16 h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="w-24 h-4 bg-gray-200 rounded mb-1"></div>
                    <div className="w-32 h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-28 h-3 bg-gray-200 rounded mb-1"></div>
                  <div className="w-28 h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : artisanOrders.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-16 text-center rounded-2xl border-2 border-dashed border-gray-300">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-primary-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No orders yet</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">When customers purchase your products, their orders will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {artisanOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Order #{order.id}</h3>
                    <p className="text-gray-600">{order.items.length} item{order.items.length !== 1 ? 's' : ''} • {order.user_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-4 py-2 text-sm font-semibold rounded-full border ${
                    order.status === 'completed'
                      ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300'
                      : order.status === 'pending'
                      ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300'
                      : 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <p className="text-2xl font-bold text-gray-900 mt-2">KSH {order.total_amount.toLocaleString()}</p>
                </div>
              </div>
              <div className="space-y-3 mb-6">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Package className="w-4 h-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{item.product_title}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity} × KSH {item.unit_price.toLocaleString()}</p>
                      </div>
                    </div>
                    <p className="font-bold text-gray-900">KSH {item.total_price.toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{order.user_name}</p>
                    <p className="text-sm text-gray-500">{order.user_email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Ordered: {new Date(order.created_at).toLocaleDateString()}</p>
                  {order.updated_at && (
                    <p className="text-sm text-gray-500">Updated: {new Date(order.updated_at).toLocaleDateString()}</p>
                  )}
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