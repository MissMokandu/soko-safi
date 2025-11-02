import { Link, useLocation } from "react-router-dom";
import {
  Diamond,
  LayoutDashboard,
  ShoppingBag,
  MessageSquare,
  Heart,
  Search,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  User,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const BuyerSidebar = ({ activeTab, setActiveTab }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isMessagesPage = location.pathname.startsWith("/messages-new");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleTabClick = (tab) => {
    if (setActiveTab) {
      setActiveTab(tab);
    }
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6 text-gray-600" />
        ) : (
          <Menu className="w-6 h-6 text-gray-600" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          isCollapsed ? "w-20" : "w-80"
        } h-full bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 shadow-lg transition-all duration-300 overflow-y-auto
        ${isMobileMenuOpen ? 'fixed inset-y-0 left-0 z-50 lg:relative' : 'hidden lg:block'}
        lg:relative lg:translate-x-0`}
      >
        <div className="p-6">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex w-full items-center justify-between mb-8 p-2 rounded-xl hover:bg-primary-50 transition-all duration-200 group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Diamond className="w-7 h-7 text-white" fill="currentColor" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                  Buyer Hub
                </h2>
                <p className="text-xs text-gray-500">
                  click to collapse sidebar
                </p>
              </div>
            )}
          </div>
          <div className="text-gray-600 group-hover:text-primary-600 transition-colors">
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </div>
        </button>

        {/* Mobile Header */}
        <div className="lg:hidden flex items-center space-x-3 mb-8 p-2">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
            <Diamond className="w-7 h-7 text-white" fill="currentColor" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Buyer Hub
            </h2>
          </div>
        </div>
        <nav className="space-y-3">
          {isMessagesPage ? (
            <>
              <Link
                to="/buyer-dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`w-full flex items-center ${isCollapsed ? "justify-center px-3" : "space-x-4 px-5"} py-4 rounded-xl transition-all duration-200 whitespace-nowrap group text-gray-700 hover:bg-white hover:shadow-md hover:transform hover:scale-[1.01]`}
              >
                <LayoutDashboard className="w-6 h-6 flex-shrink-0 text-primary-600 group-hover:text-primary-700" />
                {(!isCollapsed || isMobileMenuOpen) && (
                  <span className="font-semibold text-lg">Dashboard</span>
                )}
              </Link>
              <Link
                to="/buyer-dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`w-full flex items-center ${isCollapsed ? "justify-center px-3" : "space-x-4 px-5"} py-4 rounded-xl transition-all duration-200 whitespace-nowrap group text-gray-700 hover:bg-white hover:shadow-md hover:transform hover:scale-[1.01]`}
              >
                <ShoppingBag className="w-6 h-6 flex-shrink-0 text-primary-600 group-hover:text-primary-700" />
                {(!isCollapsed || isMobileMenuOpen) && (
                  <span className="font-semibold text-lg">My Orders</span>
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
              <Link
                to="/buyer-dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`w-full flex items-center ${isCollapsed ? "justify-center px-3" : "space-x-4 px-5"} py-4 rounded-xl transition-all duration-200 whitespace-nowrap group text-gray-700 hover:bg-white hover:shadow-md hover:transform hover:scale-[1.01]`}
              >
                <Heart className="w-6 h-6 flex-shrink-0 text-primary-600 group-hover:text-primary-700" />
                {(!isCollapsed || isMobileMenuOpen) && (
                  <span className="font-semibold text-lg">Favourites</span>
                )}
              </Link>
              <Link
                to="/buyer-dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`w-full flex items-center ${isCollapsed ? "justify-center px-3" : "space-x-4 px-5"} py-4 rounded-xl transition-all duration-200 whitespace-nowrap group text-gray-700 hover:bg-white hover:shadow-md hover:transform hover:scale-[1.01]`}
              >
                <Search className="w-6 h-6 flex-shrink-0 text-primary-600 group-hover:text-primary-700" />
                {(!isCollapsed || isMobileMenuOpen) && (
                  <span className="font-semibold text-lg">Explore</span>
                )}
              </Link>
            </>
          ) : (
            <>
              {/* Desktop Navigation */}
              <div className="hidden lg:block space-y-3">
                <button
                  onClick={() => {
                    handleTabClick("dashboard")
                    setIsMobileMenuOpen(false)
                  }}
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
                  onClick={() => {
                    handleTabClick("explore")
                    setIsMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center ${isCollapsed ? "justify-center px-3" : "space-x-4 px-5"} py-4 rounded-xl transition-all duration-200 whitespace-nowrap group ${
                    activeTab === "explore"
                      ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg transform scale-[1.02]"
                      : "text-gray-700 hover:bg-white hover:shadow-md hover:transform hover:scale-[1.01]"
                  }`}
                >
                  <Search
                    className={`w-6 h-6 flex-shrink-0 transition-colors ${
                      activeTab === "explore"
                        ? "text-white"
                        : "text-primary-600 group-hover:text-primary-700"
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="font-semibold text-lg">Explore</span>
                  )}
                </button>

                <button
                  onClick={() => {
                    handleTabClick("messages")
                    setIsMobileMenuOpen(false)
                  }}
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
              </div>

              {/* Mobile and Desktop Orders/Favourites */}
              <button
                onClick={() => {
                  handleTabClick("orders")
                  setIsMobileMenuOpen(false)
                }}
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
                {(!isCollapsed || isMobileMenuOpen) && (
                  <span className="font-semibold text-lg">My Orders</span>
                )}
              </button>

              <button
                onClick={() => {
                  handleTabClick("favourites")
                  setIsMobileMenuOpen(false)
                }}
                className={`w-full flex items-center ${isCollapsed ? "justify-center px-3" : "space-x-4 px-5"} py-4 rounded-xl transition-all duration-200 whitespace-nowrap group ${
                  activeTab === "favourites"
                    ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg transform scale-[1.02]"
                    : "text-gray-700 hover:bg-white hover:shadow-md hover:transform hover:scale-[1.01]"
                }`}
              >
                <Heart
                  className={`w-6 h-6 flex-shrink-0 transition-colors ${
                    activeTab === "favourites"
                      ? "text-white"
                      : "text-primary-600 group-hover:text-primary-700"
                  }`}
                />
                {(!isCollapsed || isMobileMenuOpen) && (
                  <span className="font-semibold text-lg">Favourites</span>
                )}
              </button>
            </>
          )}

          {/* Mobile Profile Section */}
          <div className="lg:hidden mt-8 pt-6 border-t border-gray-200">
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
                  <p className="text-sm font-medium text-gray-900">{user?.full_name || 'Buyer'}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => {
                handleTabClick("profile")
                setIsMobileMenuOpen(false)
              }}
              className={`w-full flex items-center space-x-4 px-5 py-4 rounded-xl transition-all duration-200 whitespace-nowrap group ${
                activeTab === "profile"
                  ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg transform scale-[1.02]"
                  : "text-gray-700 hover:bg-white hover:shadow-md hover:transform hover:scale-[1.01]"
              }`}
            >
              <User
                className={`w-6 h-6 flex-shrink-0 transition-colors ${
                  activeTab === "profile"
                    ? "text-white"
                    : "text-primary-600 group-hover:text-primary-700"
                }`}
              />
              <span className="font-semibold text-lg">Profile</span>
            </button>
            
            <button
              onClick={() => {
                logout()
                navigate('/')
                setIsMobileMenuOpen(false)
              }}
              className="w-full flex items-center space-x-4 px-5 py-4 rounded-xl transition-all duration-200 whitespace-nowrap group text-red-600 hover:bg-red-50 hover:shadow-md hover:transform hover:scale-[1.01] mt-2"
            >
              <LogOut className="w-6 h-6 flex-shrink-0" />
              <span className="font-semibold text-lg">Sign Out</span>
            </button>
          </div>
        </nav>
      </div>
    </aside>
    </>
  );
};

export default BuyerSidebar;
