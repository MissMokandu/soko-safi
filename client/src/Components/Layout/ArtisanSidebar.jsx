import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Diamond, LayoutDashboard, Package, ShoppingBag, MessageSquare, Plus, ChevronLeft, ChevronRight, Menu, X, User, LogOut, BarChart3, Settings } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const ArtisanSidebar = ({ activeTab, onTabChange, onAddProduct, isCollapsed, onToggleCollapse }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const isMessagesPage = location.pathname === '/messages'

  const handleTabClick = (tab) => {
    if (tab === 'addProduct') {
      onAddProduct()
    } else {
      onTabChange(tab)
    }
  }

  return (
    <>
      {/* Mobile Top Hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <Diamond className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <h1 className="text-lg font-bold text-gray-900">Artisan Hub</h1>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="flex items-center justify-around py-2">
          <button
            onClick={() => onTabChange("dashboard")}
            className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
              activeTab === "dashboard" ? "text-primary-600" : "text-gray-600"
            }`}
          >
            <LayoutDashboard className="w-6 h-6" />
            <span className="text-xs mt-1">Dashboard</span>
          </button>
          
          <button
            onClick={() => onAddProduct()}
            className="flex flex-col items-center p-3 rounded-lg text-gray-600"
          >
            <Plus className="w-6 h-6" />
            <span className="text-xs mt-1">Add Product</span>
          </button>
          
          <button
            onClick={() => onTabChange("messages")}
            className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
              activeTab === "messages" ? "text-primary-600" : "text-gray-600"
            }`}
          >
            <MessageSquare className="w-6 h-6" />
            <span className="text-xs mt-1">Messages</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-y-0 right-0 w-80 bg-white shadow-xl z-50 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Diamond className="w-7 h-7 text-white" fill="currentColor" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Artisan Hub</h2>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            
            <nav className="space-y-3">
              <button
                onClick={() => {
                  onTabChange("products")
                  setIsMobileMenuOpen(false)
                }}
                className={`w-full flex items-center space-x-4 px-5 py-4 rounded-xl transition-all duration-200 ${
                  activeTab === "products"
                    ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Package className="w-6 h-6 flex-shrink-0" />
                <span className="font-semibold text-lg">My Products</span>
              </button>
              
              <button
                onClick={() => {
                  onTabChange("orders")
                  setIsMobileMenuOpen(false)
                }}
                className={`w-full flex items-center space-x-4 px-5 py-4 rounded-xl transition-all duration-200 ${
                  activeTab === "orders"
                    ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <ShoppingBag className="w-6 h-6 flex-shrink-0" />
                <span className="font-semibold text-lg">Orders</span>
              </button>
            </nav>
            
            {/* Profile Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="px-5 mb-4">
                <div className="flex items-center space-x-3">
                  {user?.profile_picture_url ? (
                    <img
                      src={user.profile_picture_url}
                      alt={user?.full_name || 'User'}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user?.full_name || 'Artisan'}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </div>
              </div>
              
              <Link
                to="/artisan-profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center space-x-4 px-5 py-4 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-50"
              >
                <User className="w-6 h-6 flex-shrink-0 text-primary-600" />
                <span className="font-semibold text-lg">My Profile</span>
              </Link>
              
              <button
                onClick={() => {
                  logout()
                  navigate('/')
                  setIsMobileMenuOpen(false)
                }}
                className="w-full flex items-center space-x-4 px-5 py-4 rounded-xl transition-all duration-200 text-red-600 hover:bg-red-50 mt-2"
              >
                <LogOut className="w-6 h-6 flex-shrink-0" />
                <span className="font-semibold text-lg">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:block ${isCollapsed ? 'w-20' : 'w-80'} h-full bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 shadow-lg transition-all duration-300`}>
      <div className="p-6">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} mb-8`}>
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
            <Diamond className="w-7 h-7 text-white" fill="currentColor" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-xl font-bold text-gray-900">Artisan Hub</h2>
              <p className="text-sm text-gray-500">Manage your craft</p>
            </div>
          )}
        </div>
        
        <button
          onClick={onToggleCollapse}
          className={`mb-6 p-2 rounded-lg hover:bg-gray-100 transition-colors ${isCollapsed ? 'mx-auto' : 'ml-auto'} flex`}
        >
          <div className="w-5 h-5 text-gray-600">
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </div>
        </button>

        <nav className="space-y-3">
          {isMessagesPage ? (
            <>
              <Link
                to="/artisan-dashboard"
                className={`w-full flex items-center ${isCollapsed ? "justify-center px-3" : "space-x-4 px-5"} py-4 rounded-xl transition-all duration-200 whitespace-nowrap group text-gray-700 hover:bg-white hover:shadow-md hover:transform hover:scale-[1.01]`}
              >
                <LayoutDashboard className="w-6 h-6 flex-shrink-0 text-primary-600 group-hover:text-primary-700" />
                {!isCollapsed && (
                  <span className="font-semibold text-lg">Dashboard</span>
                )}
              </Link>
              <Link
                to="/artisan-dashboard"
                className={`w-full flex items-center ${isCollapsed ? "justify-center px-3" : "space-x-4 px-5"} py-4 rounded-xl transition-all duration-200 whitespace-nowrap group text-gray-700 hover:bg-white hover:shadow-md hover:transform hover:scale-[1.01]`}
              >
                <Package className="w-6 h-6 flex-shrink-0 text-primary-600 group-hover:text-primary-700" />
                {!isCollapsed && (
                  <span className="font-semibold text-lg">My Products</span>
                )}
              </Link>
              <button
                onClick={() => handleTabClick('addProduct')}
                className={`w-full flex items-center ${isCollapsed ? "justify-center px-3" : "space-x-4 px-5"} py-4 rounded-xl transition-all duration-200 whitespace-nowrap group text-gray-700 hover:bg-white hover:shadow-md hover:transform hover:scale-[1.01]`}
              >
                <Plus className="w-6 h-6 flex-shrink-0 text-primary-600 group-hover:text-primary-700" />
                {!isCollapsed && (
                  <span className="font-semibold text-lg">Add Product</span>
                )}
              </button>
              <Link
                to="/artisan-dashboard"
                className={`w-full flex items-center ${isCollapsed ? "justify-center px-3" : "space-x-4 px-5"} py-4 rounded-xl transition-all duration-200 whitespace-nowrap group text-gray-700 hover:bg-white hover:shadow-md hover:transform hover:scale-[1.01]`}
              >
                <ShoppingBag className="w-6 h-6 flex-shrink-0 text-primary-600 group-hover:text-primary-700" />
                {!isCollapsed && (
                  <span className="font-semibold text-lg">Orders</span>
                )}
              </Link>
              <div
                className={`w-full flex items-center ${isCollapsed ? "justify-center px-3" : "space-x-4 px-5"} py-4 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg transform scale-[1.02]`}
              >
                <MessageSquare className="w-6 h-6 flex-shrink-0 text-white" />
                {!isCollapsed && (
                  <span className="font-semibold text-lg">Messages</span>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => handleTabClick('dashboard')}
                className={`w-full flex items-center ${isCollapsed ? "justify-center px-3" : "space-x-4 px-5"} py-4 rounded-xl transition-all duration-200 whitespace-nowrap group ${
                  activeTab === "dashboard"
                    ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg transform scale-[1.02]"
                    : "text-gray-700 hover:bg-white hover:shadow-md hover:transform hover:scale-[1.01]"
                }`}
              >
                <LayoutDashboard
                  className={`w-6 h-6 flex-shrink-0 transition-colors ${
                    activeTab === "dashboard"
                      ? "text-white"
                      : "text-primary-600 group-hover:text-primary-700"
                  }`}
                />
                {!isCollapsed && (
                  <span className="font-semibold text-lg">Dashboard</span>
                )}
              </button>

              <button
                onClick={() => handleTabClick('products')}
                className={`w-full flex items-center ${isCollapsed ? "justify-center px-3" : "space-x-4 px-5"} py-4 rounded-xl transition-all duration-200 whitespace-nowrap group ${
                  activeTab === "products"
                    ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg transform scale-[1.02]"
                    : "text-gray-700 hover:bg-white hover:shadow-md hover:transform hover:scale-[1.01]"
                }`}
              >
                <Package
                  className={`w-6 h-6 flex-shrink-0 transition-colors ${
                    activeTab === "products"
                      ? "text-white"
                      : "text-primary-600 group-hover:text-primary-700"
                  }`}
                />
                {!isCollapsed && (
                  <span className="font-semibold text-lg">My Products</span>
                )}
              </button>

              <button
                onClick={() => handleTabClick('addProduct')}
                className={`w-full flex items-center ${isCollapsed ? "justify-center px-3" : "space-x-4 px-5"} py-4 rounded-xl transition-all duration-200 whitespace-nowrap group text-gray-700 hover:bg-white hover:shadow-md hover:transform hover:scale-[1.01] border-2 border-dashed border-primary-300 hover:border-primary-400`}
              >
                <Plus
                  className="w-6 h-6 flex-shrink-0 text-primary-600 group-hover:text-primary-700"
                />
                {!isCollapsed && (
                  <span className="font-semibold text-lg">Add Product</span>
                )}
              </button>

              <button
                onClick={() => handleTabClick('orders')}
                className={`w-full flex items-center ${isCollapsed ? "justify-center px-3" : "space-x-4 px-5"} py-4 rounded-xl transition-all duration-200 whitespace-nowrap group ${
                  activeTab === "orders"
                    ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg transform scale-[1.02]"
                    : "text-gray-700 hover:bg-white hover:shadow-md hover:transform hover:scale-[1.01]"
                }`}
              >
                <ShoppingBag
                  className={`w-6 h-6 flex-shrink-0 transition-colors ${
                    activeTab === "orders"
                      ? "text-white"
                      : "text-primary-600 group-hover:text-primary-700"
                  }`}
                />
                {!isCollapsed && (
                  <span className="font-semibold text-lg">Orders</span>
                )}
              </button>

              <button
                onClick={() => handleTabClick('messages')}
                className={`w-full flex items-center ${isCollapsed ? "justify-center px-3" : "space-x-4 px-5"} py-4 rounded-xl transition-all duration-200 whitespace-nowrap group ${
                  activeTab === "messages"
                    ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg transform scale-[1.02]"
                    : "text-gray-700 hover:bg-white hover:shadow-md hover:transform hover:scale-[1.01]"
                }`}
              >
                <MessageSquare
                  className={`w-6 h-6 flex-shrink-0 transition-colors ${
                    activeTab === "messages"
                      ? "text-white"
                      : "text-primary-600 group-hover:text-primary-700"
                  }`}
                />
                {!isCollapsed && (
                  <span className="font-semibold text-lg">Messages</span>
                )}
              </button>
            </>
          )}
        </nav>
      </div>
    </aside>
    </>
  )
}

export default ArtisanSidebar