import { Link, useNavigate } from 'react-router-dom'
import { Diamond, User, ShoppingCart, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useState, useEffect } from 'react'

const DashboardNavbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [profilePicture, setProfilePicture] = useState(null)

  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const { api } = await import('../../services/api')
        const profile = await api.profile.get()
        setProfilePicture(profile.profile_picture_url)
      } catch (error) {
        console.error('Failed to fetch profile picture:', error)
      }
    }
    
    if (user) {
      fetchProfilePicture()
    }
  }, [user])

  return (
    <nav className="bg-white shadow-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
              <Diamond className="w-6 h-6 text-white" fill="currentColor" />
            </div>
            <span className="text-xl font-bold text-gray-900">SokoDigital</span>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/cart" className="p-3 text-gray-600 hover:text-primary-600 rounded-xl hover:bg-primary-50 transition-all duration-200 hover:scale-110">
              <ShoppingCart className="w-5 h-5" />
            </Link>

            <div className="relative group">
              <button className="flex items-center space-x-2 p-1.5 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors">
                {profilePicture || user?.profile_picture_url ? (
                  <img
                    src={profilePicture || user.profile_picture_url}
                    alt={user?.full_name || 'User'}
                    className="w-9 h-9 rounded-full object-cover shadow-sm"
                  />
                ) : (
                  <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-sm">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.full_name || user?.name || 'Buyer'}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      logout()
                      navigate('/')
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default DashboardNavbar