import { useState, useEffect } from 'react'
import { Users, Package, ShoppingBag, FolderOpen, TrendingUp, UserCheck, UserX, Eye, Trash2, CheckCircle, XCircle, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import { api } from '../services/api'

const AdminDashboard = () => {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  useEffect(() => {
    fetchDashboardData()
    fetchUsers()
    fetchProducts()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const data = await api.admin.getDashboard()
      setDashboardData(data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const data = await api.admin.getUsers()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const data = await api.admin.getProducts()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserStatus = async (userId, updates) => {
    try {
      await api.admin.updateUser(userId, updates)
      fetchUsers() // Refresh users list
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  const updateProductStatus = async (productId, status) => {
    try {
      await api.admin.updateProduct(productId, { status })
      fetchProducts() // Refresh products list
    } catch (error) {
      console.error('Error updating product:', error)
    }
  }

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await api.admin.deleteUser(userId)
        fetchUsers() // Refresh users list
      } catch (error) {
        console.error('Error deleting user:', error)
      }
    }
  }

  const deleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        await api.admin.deleteProduct(productId)
        fetchProducts() // Refresh products list
      } catch (error) {
        console.error('Error deleting product:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your Soko Safi platform</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'users', label: 'Users' },
              { id: 'products', label: 'Products' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && dashboardData && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={Users}
                title="Total Users"
                value={dashboardData.platform_stats.total_users}
                subtitle={`${dashboardData.recent_activity.new_users_30d} new this month`}
                color="blue"
              />
              <StatCard
                icon={Package}
                title="Total Products"
                value={dashboardData.platform_stats.total_products}
                subtitle={`${dashboardData.recent_activity.new_products_30d} new this month`}
                color="green"
              />
              <StatCard
                icon={ShoppingBag}
                title="Total Orders"
                value={dashboardData.platform_stats.total_orders}
                subtitle={`${dashboardData.recent_activity.new_orders_30d} new this month`}
                color="purple"
              />
              <StatCard
                icon={FolderOpen}
                title="Categories"
                value={dashboardData.platform_stats.total_categories}
                color="orange"
              />
            </div>

            {/* User Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard
                icon={Users}
                title="Artisans"
                value={dashboardData.platform_stats.total_artisans}
                color="indigo"
              />
              <StatCard
                icon={Users}
                title="Buyers"
                value={dashboardData.platform_stats.total_buyers}
                color="pink"
              />
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">User Management</h2>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Verified:</strong> Users who have confirmed their email/identity. 
                <strong>Unverified:</strong> New users who haven't completed verification yet.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.profile_picture_url ? (
                            <img
                              src={user.profile_picture_url}
                              alt={user.full_name}
                              className="w-10 h-10 rounded-full object-cover mr-3"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                              <User className="w-5 h-5 text-gray-600" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'admin' ? 'bg-red-100 text-red-800' :
                          user.role === 'artisan' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.is_verified ? 'Verified' : 'Unverified'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center justify-start space-x-3">
                          <div className="flex items-center space-x-1">
                            {!user.is_verified ? (
                              <button
                                onClick={() => updateUserStatus(user.id, { is_verified: true })}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition-colors"
                                title="Verify User"
                              >
                                <UserCheck className="w-3 h-3 mr-1" />
                                Verify
                              </button>
                            ) : (
                              <button
                                onClick={() => updateUserStatus(user.id, { is_verified: false })}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-md hover:bg-yellow-200 transition-colors"
                                title="Unverify User"
                              >
                                <UserX className="w-3 h-3 mr-1" />
                                Unverify
                              </button>
                            )}
                          </div>
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Product Management</h2>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Active:</strong> Products visible to buyers. 
                <strong>Pending:</strong> Awaiting admin approval. 
                <strong>Inactive:</strong> Hidden from marketplace.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{product.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        KES {product.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.status === 'active' ? 'bg-green-100 text-green-800' :
                          product.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.stock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center justify-start space-x-3">
                          <div className="flex items-center">
                            {product.status === 'pending' && (
                              <button
                                onClick={() => updateProductStatus(product.id, 'active')}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition-colors"
                                title="Approve Product"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Approve
                              </button>
                            )}
                            {product.status === 'active' && (
                              <button
                                onClick={() => updateProductStatus(product.id, 'inactive')}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-md hover:bg-yellow-200 transition-colors"
                                title="Deactivate Product"
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Deactivate
                              </button>
                            )}
                            {product.status === 'inactive' && (
                              <button
                                onClick={() => updateProductStatus(product.id, 'active')}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition-colors"
                                title="Activate Product"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Activate
                              </button>
                            )}
                          </div>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard