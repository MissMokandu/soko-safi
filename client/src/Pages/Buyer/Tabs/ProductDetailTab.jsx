import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, Plus, Minus, Heart, ShoppingBag, X } from 'lucide-react'
import LazyImage from '../../../Components/LazyImage'
import { api } from '../../../services/api'

const ProductDetailTab = ({ 
  selectedProduct, 
  productLoading, 
  authLoading, 
  quantity, 
  setQuantity,
  favoriteProducts,
  toggleFavorite,
  setActiveTab
}) => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  // Fetch reviews when product changes
  useEffect(() => {
    if (selectedProduct?.id) {
      fetchReviews()
    }
  }, [selectedProduct?.id])

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true)
      // Get all reviews and filter by product ID since backend doesn't have product-specific endpoint
      const allReviews = await api.reviews.getAll()
      const productReviews = Array.isArray(allReviews) ? allReviews.filter(review => review.product_id === selectedProduct.id) : []
      setReviews(productReviews)
    } catch (error) {
      setReviews([])
    } finally {
      setReviewsLoading(false)
    }
  }



  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!newReview.comment.trim()) {
      alert('Please write a comment')
      return
    }
    
    try {
      setSubmittingReview(true)
      await api.reviews.create({
        product_id: selectedProduct.id,
        rating: newReview.rating,
        comment: newReview.comment
      })
      setNewReview({ rating: 5, comment: '' })
      setShowReviewModal(false)
      fetchReviews() // Refresh reviews
      alert('Review submitted successfully!')
    } catch (error) {
      alert('Failed to submit review. Please try again.')
    } finally {
      setSubmittingReview(false)
    }
  }

  return (
    <>
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
        <button onClick={() => setActiveTab('explore')} className="hover:text-primary-600">Explore</button>
        <span>/</span>
        <span className="text-gray-900">{selectedProduct?.title || 'Product'}</span>
      </nav>

      {(productLoading || authLoading) ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm relative group">
              <div className="relative w-full h-[500px] bg-gray-200 animate-pulse"></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="w-full h-24 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-8 animate-pulse">
              <div className="w-3/4 h-8 bg-gray-200 rounded mb-4"></div>
              <div className="w-1/2 h-6 bg-gray-200 rounded mb-6"></div>
              <div className="w-1/3 h-10 bg-gray-200 rounded mb-6"></div>
              <div className="space-y-2 mb-6">
                <div className="w-full h-4 bg-gray-200 rounded"></div>
                <div className="w-5/6 h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="flex space-x-4">
                <div className="flex-1 h-12 bg-gray-200 rounded-xl"></div>
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      ) : selectedProduct ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="space-y-4">
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm relative group">
                <div className="relative w-full h-[500px] object-cover">
                  <LazyImage
                    src={selectedProduct.image_url || selectedProduct.image}
                    alt={selectedProduct.title}
                    className="w-full h-[500px] object-cover opacity-100 transition-opacity duration-300"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <button className="rounded-lg overflow-hidden border-2 transition-all duration-200 border-primary-600 ring-2 ring-primary-100">
                  <div className="relative w-full h-24 object-cover">
                    <LazyImage
                      src={selectedProduct.image_url || selectedProduct.image}
                      alt={`${selectedProduct.title} 1`}
                      className="w-full h-24 object-cover opacity-100 transition-opacity duration-300"
                    />
                  </div>
                </button>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm text-primary-600 font-medium bg-primary-50 px-3 py-1 rounded-full">
                        {selectedProduct.category || 'Handcraft'}
                      </span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-600">{selectedProduct.subcategory || 'Art'}</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{selectedProduct.title}</h1>
                    <div className="flex items-center mt-2 space-x-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < (selectedProduct.rating || 4) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                      <span className="text-gray-600">({reviews.length} reviews)</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleFavorite(selectedProduct.id)}
                    className={`p-3 rounded-full transition-colors ${
                      favoriteProducts.has(selectedProduct.id)
                        ? 'bg-red-100 text-red-500'
                        : 'bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-400'
                    }`}
                  >
                    <Heart className={`w-6 h-6 ${
                      favoriteProducts.has(selectedProduct.id) ? 'fill-current' : ''
                    }`} />
                  </button>
                </div>
                <div className="mb-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-4xl font-bold text-gray-900">KSh {selectedProduct.price?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-2 text-sm font-medium text-green-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>In Stock ({selectedProduct.stock || 10} left)</span>
                    </span>
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Quantity</label>
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 rounded-lg border-2 border-gray-200 flex items-center justify-center hover:border-primary-300 hover:bg-primary-50 transition-colors"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="text-xl font-semibold w-16 text-center">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-12 h-12 rounded-lg border-2 border-gray-200 flex items-center justify-center hover:border-primary-300 hover:bg-primary-50 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <button 
                    onClick={() => navigate(`/checkout?product=${selectedProduct.id}&quantity=${quantity}`)}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <span>Buy Now</span>
                    <span className="text-lg">•</span>
                    <span>KSh {(selectedProduct.price * quantity)?.toLocaleString()}</span>
                  </button>
                  <button 
                    onClick={async () => {
                      try {
                        await api.cart.add(selectedProduct.id, quantity)
                        alert('Product added to cart!')
                      } catch (error) {
                        alert('Failed to add to cart. Please try again.')
                      }
                    }}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-4 px-6 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h3 className="font-semibold text-lg mb-4">Meet the Artisan</h3>
                {selectedProduct?.artisan ? (
                  <button 
                    onClick={() => navigate(`/artisan/${selectedProduct.artisan.id}`)}
                    className="w-full flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <img
                      alt={selectedProduct.artisan.full_name || 'Artisan'}
                      className="w-16 h-16 rounded-full object-cover bg-gray-200"
                      src={selectedProduct.artisan.profile_image || "/images/placeholder.svg"}
                    />
                    <div className="flex-1 text-left">
                      <h4 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {selectedProduct.artisan.full_name || 'Artisan'}
                      </h4>
                      <p className="text-gray-600">Kenya</p>
                      <p className="text-sm text-primary-600 group-hover:text-primary-700 transition-colors">View Profile →</p>
                    </div>
                  </button>
                ) : (
                  <div className="flex items-center space-x-4 p-2">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No Image</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">Artisan</h4>
                      <p className="text-gray-600">Kenya</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mt-12">
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Description</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">{selectedProduct.description}</p>
              </div>
            </div>
          </div>
          <div className="mt-12">
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Customer Reviews ({reviews.length})</h2>
                <button 
                  onClick={() => setShowReviewModal(true)}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
                >
                  Write a Review
                </button>
              </div>
              <div className="space-y-6">
                {reviewsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center space-x-4 mb-2">
                          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                          <div className="flex-1">
                            <div className="w-32 h-4 bg-gray-200 rounded mb-1"></div>
                            <div className="w-20 h-3 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                        <div className="w-full h-16 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {(review.user_name || review.buyer_name || 'Anonymous').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900">{review.user_name || review.buyer_name || 'Anonymous'}</h4>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 mb-2">
                            {new Date(review.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Review Modal */}
          {showReviewModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Write a Review</h3>
                  <button 
                    onClick={() => setShowReviewModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleSubmitReview}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setNewReview(prev => ({ ...prev, rating: i + 1 }))}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star className={`w-6 h-6 ${i < newReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                    <textarea
                      value={newReview.comment}
                      onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                      placeholder="Share your experience with this product..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      rows={4}
                      required
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowReviewModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-600">Product not found</p>
        </div>
      )}
    </>
  )
}

export default ProductDetailTab