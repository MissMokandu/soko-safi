import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Diamond, User, Settings, LogOut, ChevronDown } from 'lucide-react'
import { api } from '../services/api'
import { uploadToCloudinary } from '../services/cloudinary'
import { useAuth } from '../context/AuthContext'
import ArtisanSidebar from '../Components/Layout/ArtisanSidebar'
import { handleAuthError } from '../utils/errorHandler'
import DashboardTab from './Artisan/Tabs/DashboardTab'
import ProductsTab from './Artisan/Tabs/ProductsTab'
import OrdersTab from './Artisan/Tabs/OrdersTab'
import MessagesTab from './Artisan/Tabs/MessagesTab'
import ProfileModal from './Artisan/Components/ProfileModal'

const ArtisanDashboard = ({ authLoading = false }) => {
  const { user, isAuthenticated, isArtisan, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showProfileSettings, setShowProfileSettings] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [profileData, setProfileData] = useState({
    full_name: '',
    description: '',
    location: '',
    phone: '',
    profile_picture_url: ''
  })
  const [profileLoading, setProfileLoading] = useState(false)

  const [showAddProduct, setShowAddProduct] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    subcategory: '',
    description: '',
    price: ''
  })

  const [myProducts, setMyProducts] = useState([])
  const [dashboardStats, setDashboardStats] = useState({
    total_products: 0,
    total_orders: 0,
    total_revenue: 0
  })
  const [artisanOrders, setArtisanOrders] = useState([])
  const [artisanMessages, setArtisanMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      console.log('Loading artisan dashboard for user:', user)
      loadDashboardData()
      loadProducts()
      loadProfileData()
    } else if (!authLoading) {
      console.log('User not authenticated, skipping dashboard load')
    }
  }, [authLoading, isAuthenticated, user])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showProfileDropdown])

  const loadDashboardData = async () => {
    try {
      setDashboardLoading(true)
      setError(null)
      
      // Check authentication first
      const session = await api.auth.getSession()
      if (!session.authenticated) {
        setError('Please log in to view your dashboard.')
        return
      }
      
      const dashboardData = await api.artisan.getDashboard()
      if (dashboardData && dashboardData.stats) {
        setDashboardStats(dashboardData.stats)
      } else {
        setDashboardStats({ total_products: 0, total_orders: 0, total_revenue: 0 })
      }
    } catch (error) {
      handleAuthError(error, 'loadDashboardData')
      setDashboardStats({ total_products: 0, total_orders: 0, total_revenue: 0 })
      if (error.message.includes('Authentication')) {
        setError('Please log in to view your dashboard.')
      }
    } finally {
      setDashboardLoading(false)
    }
  }

  const loadProducts = async () => {
    try {
      setLoading(true)
      const products = await api.artisan.getProducts(user?.id)
      setMyProducts(Array.isArray(products) ? products : [])
    } catch (error) {
      handleAuthError(error, 'loadProducts')
      setMyProducts([])
    } finally {
      setLoading(false)
    }
  }

  const loadOrders = async () => {
    try {
      setLoading(true)
      const orders = await api.artisan.getOrders()
      setArtisanOrders(orders)
    } catch (error) {
      handleAuthError(error, 'loadOrders')
      setError('Failed to load orders. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async () => {
    try {
      setLoading(true)
      const messages = await api.artisan.getMessages()
      setArtisanMessages(messages)
    } catch (error) {
      handleAuthError(error, 'loadMessages')
      setError('Failed to load messages. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadProfileData = async () => {
    try {
      const profile = await api.profile.get()
      setProfileData({
        full_name: profile.full_name || '',
        description: profile.description || '',
        location: profile.location || '',
        phone: profile.phone || '',
        profile_picture_url: profile.profile_picture_url || ''
      })
    } catch (error) {
      console.error('Failed to load profile data:', error)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    try {
      setProfileLoading(true)
      await api.profile.update({
        full_name: profileData.full_name,
        description: profileData.description,
        location: profileData.location,
        phone: profileData.phone
      })
      alert('Profile updated successfully!')
      setShowProfileSettings(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setProfileLoading(false)
    }
  }

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      try {
        setProfileLoading(true)
        const imageUrl = await uploadToCloudinary(file)
        setProfileData(prev => ({
          ...prev,
          profile_picture_url: imageUrl
        }))
        // Update profile with new picture URL
        await api.profile.update({
          profile_picture_url: imageUrl
        })
        alert('Profile picture updated successfully!')
      } catch (error) {
        console.error('Failed to upload profile picture:', error)
        alert('Failed to upload profile picture. Please try again.')
      } finally {
        setProfileLoading(false)
      }
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const [selectedFile, setSelectedFile] = useState(null)

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      title: product.title,
      category: product.category || '',
      subcategory: product.subcategory || '',
      description: product.description,
      price: product.price.toString()
    })
    setUploadedImage(product.image_url || product.image)
    setShowAddProduct(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      
      // Check authentication first
      const session = await api.auth.getSession()
      if (!session.authenticated) {
        alert('Please log in to manage products')
        return
      }
      
      let imageUrl = uploadedImage
      
      // Upload new image to Cloudinary if selected
      if (selectedFile) {
        try {
          imageUrl = await uploadToCloudinary(selectedFile)
        } catch (error) {
          console.error('Image upload failed:', error)
          alert('Image upload failed, but product will be saved without new image')
        }
      }
      
      // Create product data object
      const productData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        subcategory: formData.subcategory,
        stock: 10,
        currency: 'KSH'
      }

      // Add image URL if available
      if (imageUrl) {
        productData.image = imageUrl
      }

      if (editingProduct) {
        console.log('Updating product with data:', productData)
        await api.products.update(editingProduct.id, productData)
        alert('Product updated successfully!')
      } else {
        console.log('Creating product with data:', productData)
        await api.products.create(productData)
        alert('Product added successfully!')
      }
      
      await loadProducts() // Reload products
      
      setShowAddProduct(false)
      setEditingProduct(null)
      setFormData({ title: '', category: '', subcategory: '', description: '', price: '' })
      setUploadedImage(null)
      setSelectedFile(null)
      
    } catch (error) {
      console.error('Product operation failed:', error)
      if (error.message.includes('Authentication')) {
        alert('Please log in to manage products')
      } else {
        alert(`Failed to ${editingProduct ? 'update' : 'add'} product: ` + error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setLoading(true)
      await api.products.delete(productId)
      setMyProducts(prev => prev.filter(p => p.id !== productId))
      alert('Product deleted successfully!')
      setLoading(false)
    }
  }

  // Show role mismatch if user is not an artisan (only when not loading)
  if (!authLoading && user && !isArtisan) {
    window.location.href = '/buyer-dashboard'
    return null
  }

  if (!authLoading && !isAuthenticated) {
    const { redirectToLogin } = require('../utils/auth')
    redirectToLogin()
    return null
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl group-hover:scale-110 transition-transform duration-200">
                <Diamond className="w-6 h-6 text-white" fill="currentColor" />
              </div>
              <span className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">SokoDigital</span>
            </Link>

            <div className="flex items-center space-x-4">
              <div className="relative profile-dropdown">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center space-x-3 p-2 text-gray-600 hover:text-primary-600 rounded-xl hover:bg-primary-50 transition-all duration-200 hover:scale-105"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                    {profileData.profile_picture_url ? (
                      <img
                        src={profileData.profile_picture_url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <span className="font-semibold hidden sm:block">{(profileData.full_name || 'Artisan').replace(/[<>"'&]/g, '')}</span>
                  <ChevronDown className="w-4 h-4 hidden sm:block" />
                </button>
                
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <button
                      onClick={() => {
                        setShowProfileSettings(true)
                        setShowProfileDropdown(false)
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Profile Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        logout()
                        setShowProfileDropdown(false)
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        <ArtisanSidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab)
            setShowAddProduct(false)
            if (tab === 'orders') loadOrders()
            if (tab === 'messages') loadMessages()
          }}
          onAddProduct={() => {
            setActiveTab('products')
            setShowAddProduct(true)
          }}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardTab
                dashboardStats={dashboardStats}
                dashboardLoading={dashboardLoading}
                authLoading={authLoading}
                error={error}
                loadDashboardData={loadDashboardData}
              />
            )}

            {activeTab === 'products' && (
              <ProductsTab
                myProducts={myProducts}
                showAddProduct={showAddProduct}
                setShowAddProduct={setShowAddProduct}
                editingProduct={editingProduct}
                setEditingProduct={setEditingProduct}
                formData={formData}
                setFormData={setFormData}
                uploadedImage={uploadedImage}
                setUploadedImage={setUploadedImage}
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
                loading={loading}
                handleSubmit={handleSubmit}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                handleDrag={handleDrag}
                handleDrop={handleDrop}
                handleFileInput={handleFileInput}
                handleChange={handleChange}
                dragActive={dragActive}
              />
            )}

            {activeTab === 'orders' && (
              <OrdersTab
                artisanOrders={artisanOrders}
                loading={loading}
                authLoading={authLoading}
              />
            )}

            {activeTab === 'messages' && (
              <MessagesTab
                loading={loading}
                authLoading={authLoading}
              />
            )}
          </div>
        </main>
      </div>

      <ProfileModal
        showProfileSettings={showProfileSettings}
        setShowProfileSettings={setShowProfileSettings}
        profileData={profileData}
        setProfileData={setProfileData}
        profileLoading={profileLoading}
        handleProfileUpdate={handleProfileUpdate}
        handleProfilePictureUpload={handleProfilePictureUpload}
      />
    </div>
  )
}

export default ArtisanDashboard
