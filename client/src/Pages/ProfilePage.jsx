import { useState, useEffect } from 'react'
import { Edit3, Save, X, Camera, User, CheckCircle } from 'lucide-react'
import DashboardNavbar from '../Components/Layout/DashboardNavbar'
import BuyerSidebar from '../Components/Layout/BuyerSidebar'
import ArtisanSidebar from '../Components/Layout/ArtisanSidebar'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'

const ProfilePage = ({ authLoading = false }) => {
  const { user, updateUser, isArtisan } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    description: '',
    profile_picture_url: ''
  })

  useEffect(() => {
    if (!authLoading) {
      loadProfile()
    }
  }, [authLoading])

  const loadProfile = async () => {
    try {
      const profileData = await api.profile.get()
      setProfile({
        full_name: profileData.full_name || user?.full_name || '',
        email: user?.email || '',
        phone: profileData.phone || '',
        location: profileData.location || '',
        description: profileData.description || '',
        profile_picture_url: profileData.profile_picture_url || ''
      })
    } catch (error) {
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const updatedProfile = await api.profile.update({
        full_name: profile.full_name,
        phone: profile.phone,
        location: profile.location,
        description: profile.description,
        profile_picture_url: profile.profile_picture_url
      })
      updateUser(updatedProfile)
      setIsEditing(false)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setLoading(true)
      const { uploadToCloudinary } = await import('../services/cloudinary')
      const imageUrl = await uploadToCloudinary(file)
      setProfile(prev => ({ ...prev, profile_picture_url: imageUrl }))
    } catch (error) {
      alert('Failed to upload image. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <DashboardNavbar />
      <div className="flex flex-col lg:flex-row">
        {isArtisan ? (
          <ArtisanSidebar activeTab="profile" setActiveTab={(tab) => {
            if (tab !== 'profile') {
              window.location.href = '/artisan-dashboard?tab=' + tab
            }
          }} />
        ) : (
          <BuyerSidebar activeTab="profile" setActiveTab={(tab) => {
            if (tab !== 'profile') {
              window.location.href = '/buyer-dashboard?tab=' + tab
            }
          }} />
        )}
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in">
          <div className="max-w-4xl mx-auto">
          {showSuccess && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">Profile updated successfully!</span>
            </div>
          )}
          {(loading || authLoading) ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 animate-pulse">
              <div className="flex items-center justify-between mb-8">
                <div className="w-24 h-8 bg-gray-200 rounded"></div>
                <div className="w-32 h-10 bg-gray-200 rounded"></div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 text-center">
                  <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto"></div>
                </div>
                <div className="lg:col-span-2 space-y-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i}>
                      <div className="w-20 h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="w-full h-6 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center space-x-2 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Saving...' : 'Save'}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Picture */}
              <div className="lg:col-span-1">
                <div className="text-center">
                  <div className="relative inline-block">
                    {profile.profile_picture_url ? (
                      <img
                        src={profile.profile_picture_url}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover mx-auto shadow-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                        <User className="w-16 h-16 text-white" />
                      </div>
                    )}
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <Camera className="w-4 h-4 text-gray-600" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Information */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.full_name}
                      onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 text-lg">{profile.full_name || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <p className="text-gray-900 text-lg">{profile.email}</p>
                  <p className="text-sm text-gray-500">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 text-lg">{profile.phone || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 text-lg">{profile.location || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      value={profile.description}
                      onChange={(e) => setProfile(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className="text-gray-900 text-lg">{profile.description || 'No bio provided'}</p>
                  )}
                </div>
              </div>
            </div>
            </div>
          )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default ProfilePage