import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Star, MapPin, MessageSquare, Award, Package, Camera, Edit } from "lucide-react";
import BuyerLayout from "./Buyer/BuyerLayout";
import { api } from '../services/api';
import { uploadToCloudinary } from '../services/cloudinary';
import { useAuth } from '../context/AuthContext';

const ArtisanProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("products");
  const [sidebarTab, setSidebarTab] = useState("explore");
  const [artisan, setArtisan] = useState(null);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editData, setEditData] = useState({
    bio: '',
    location: '',
    avatar: ''
  });

  const isOwner = user && user.id === id;

  const handleSidebarClick = (tab) => {
    setSidebarTab(tab);
    navigate('/buyer-dashboard');
  };

  useEffect(() => {
    fetchArtisanData();
  }, [id]);

  const fetchArtisanData = async () => {
    try {
      setLoading(true);
      const [artisanData, productsData, statsData, reviewsData] = await Promise.all([
        api.artisan.getProfile(id),
        api.artisan.getProducts(id),
        api.artisan.getStats(id),
        api.artisan.getReviews(id)
      ]);
      setArtisan(artisanData);
      setProducts(productsData);
      setStats(statsData);
      setReviews(reviewsData);
      setEditData({
        bio: artisanData.description || '',
        location: artisanData.location || '',
        avatar: artisanData.profile_picture_url || ''
      });
    } catch (error) {
      console.error('Failed to fetch artisan data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (file && isOwner) {
      try {
        setUploading(true);
        const imageUrl = await uploadToCloudinary(file);
        setEditData(prev => ({ ...prev, avatar: imageUrl }));
        // Auto-save avatar
        await api.profile.update({ profile_picture_url: imageUrl });
        setArtisan(prev => ({ ...prev, profile_picture_url: imageUrl }));
      } catch (error) {
        console.error('Failed to upload avatar:', error);
        alert('Failed to upload image. Please try again.');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSaveProfile = async () => {
    try {
      await api.profile.update({
        description: editData.bio,
        location: editData.location
      });
      setArtisan(prev => ({
        ...prev,
        description: editData.bio,
        location: editData.location
      }));
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading artisan profile...</p>
        </div>
      </div>
    );
  }

  if (!artisan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Artisan Not Found</h2>
          <p className="text-gray-600 mb-6">The artisan profile you're looking for doesn't exist.</p>
          <Link to="/explore" className="btn-primary">
            Browse Artisans
          </Link>
        </div>
      </div>
    );
  }



  return (
    <BuyerLayout activeTab={sidebarTab} setActiveTab={handleSidebarClick}>
      <div className="max-w-7xl mx-auto">
            {/* Cover Image */}
            <div
              className="h-48 bg-cover bg-center relative rounded-2xl mb-6"
              style={{ backgroundImage: `url(${artisan.banner_image_url || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200&h=400&fit=crop'})` }}
            >
              <div className="absolute inset-0 bg-black/30 rounded-2xl"></div>
            </div>

            {/* Profile Header */}
            <div className="relative -mt-12 mb-8">
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                <div className="relative">
                  <img
                    src={artisan.profile_picture_url || editData.avatar || '/images/placeholder-avatar.jpg'}
                    alt={artisan.full_name}
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                  {isOwner && (
                    <label className="absolute bottom-2 right-2 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary-600 transition-colors shadow-lg">
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        disabled={uploading}
                      />
                    </label>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {artisan.full_name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{artisan.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Award className="w-4 h-4" />
                      <span>Member since {new Date(artisan.created_at).getFullYear()}</span>
                    </div>
                  </div>
                  {stats && (
                    <div className="flex items-center space-x-6 mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < Math.floor(stats.avg_rating)
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-medium">{stats.avg_rating}</span>
                        <span className="text-gray-600">
                          ({stats.review_count} reviews)
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Package className="w-5 h-5 text-gray-600" />
                        <span className="font-medium">{stats.total_sales}</span>
                        <span className="text-gray-600">sales</span>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      Artisan
                    </span>
                  </div>
                </div>
                <div className="flex space-x-3">
                  {isOwner ? (
                    <button
                      onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                      className="btn-primary px-6 py-3 flex items-center space-x-2"
                    >
                      <Edit className="w-5 h-5" />
                      <span>{isEditing ? 'Save Changes' : 'Edit Profile'}</span>
                    </button>
                  ) : (
                    <Link
                      to={`/messages-new/${artisan.id}`}
                      className="btn-primary px-6 py-3 flex items-center space-x-2"
                    >
                      <MessageSquare className="w-5 h-5" />
                      <span>Contact Artisan</span>
                    </Link>
                  )}
                  {isEditing && (
                    <button
                      onClick={() => setIsEditing(false)}
                      className="btn-secondary px-6 py-3"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    value={editData.bio}
                    onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Tell people about yourself and your craft..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={editData.location}
                    onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., Nairobi, Kenya"
                  />
                </div>
              </div>
            ) : (
              <p className="text-gray-700 leading-relaxed">{artisan.description || 'No description available.'}</p>
            )}
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
            <div className="border-b border-gray-200">
              <div className="flex space-x-8 px-8">
                <button
                  onClick={() => setActiveTab("products")}
                  className={`py-4 border-b-2 font-medium transition-colors ${
                    activeTab === "products"
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Products ({products.length})
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`py-4 border-b-2 font-medium transition-colors ${
                    activeTab === "reviews"
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Reviews ({stats?.review_count || 0})
                </button>
              </div>
            </div>

            <div className="p-8">
              {/* Products Tab */}
              {activeTab === "products" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      className="group"
                    >
                      <div className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="aspect-square overflow-hidden">
                          <img
                            src={product.image_url || product.image}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-gray-900 mb-2">
                            {product.title}
                          </h3>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-gray-900">
                              KSH {typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                            </span>
                            <span className={`text-sm font-medium ${
                              product.stock > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {product.stock > 0 ? `${product.stock} left` : 'Out of Stock'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === "reviews" && (
                <div>
                  {reviews.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Star className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
                      <p className="text-gray-600">This artisan hasn't received any reviews yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-semibold text-gray-900">{review.user_name}</span>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-sm text-gray-600">for {review.product_title}</p>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {review.title && (
                            <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                          )}
                          <p className="text-gray-700">{review.body}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
      </div>
    </BuyerLayout>
  );
};

export default ArtisanProfilePage;