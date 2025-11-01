import { Link } from 'react-router-dom'
import { ShoppingBag, Heart, MessageSquare } from 'lucide-react'
import { StatsSkeleton } from '../../Components/SkeletonLoader'

const DashboardOverview = ({ dashboardStats, dashboardLoading, authLoading, error, loadDashboardData }) => {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here's your shopping activity at a glance.</p>
      </div>

      {(dashboardLoading || authLoading) ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12">
          <StatsSkeleton />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 mb-12">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 font-bold">!</span>
            </div>
            <div>
              <h3 className="text-red-800 font-semibold">Error Loading Dashboard</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
          <button
            onClick={loadDashboardData}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500 rounded-xl">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-blue-600">Total Orders</p>
                <p className="text-3xl font-bold text-blue-900">{dashboardStats.total_orders}</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-blue-700">
              <span className="font-medium">+5%</span>
              <span className="ml-1">from last month</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500 rounded-xl">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-green-600">Favourites</p>
                <p className="text-3xl font-bold text-green-900">{dashboardStats.total_collections}</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-green-700">
              <span className="font-medium">+12%</span>
              <span className="ml-1">from last month</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500 rounded-xl">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-purple-600">Messages</p>
                <p className="text-3xl font-bold text-purple-900">{dashboardStats.total_messages}</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-purple-700">
              <span className="font-medium">+8%</span>
              <span className="ml-1">from last month</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl border border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-500 rounded-xl">
                <span className="text-white font-bold text-lg">KSH</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-orange-600">Total Spent</p>
                <p className="text-3xl font-bold text-orange-900">{dashboardStats.total_spent.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-orange-700">
              <span className="font-medium">+15%</span>
              <span className="ml-1">from last month</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default DashboardOverview