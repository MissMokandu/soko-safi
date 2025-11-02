import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Heart, ShoppingCart, Star, MapPin, ArrowLeft, MessageSquare, Share2 } from 'lucide-react'
import Navbar from '../Components/Layout/Navbar'
import Footer from '../Components/Layout/Footer'
import LazyImage from '../Components/LazyImage'
import LoadingSpinner from '../Components/LoadingSpinner'
import { api } from '../services/api'
import { isUserAuthenticated } from '../utils/navigation'

const ProductPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const productData = await api.products.getById(id)
        setProduct(productData)
        
        // Fetch related products
        const allProducts = await api.products.getAll()
        const related = allProducts
          .filter(p => p.id !== parseInt(id) && p.category === productData.category)
          .slice(0, 4)
        setRelatedProducts(related)
      } catch (error) {
        setError('Product not found')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProduct()
    }
  }, [id])

  const handleAddToCart = () => {
    if (!isUserAuthenticated()) {
      // Redirect to login
      navigate('/login')
      return
    }
    // Add to cart logic for authenticated users
  }

  const handleAddToFavorites = () => {
    if (!isUserAuthenticated()) {
      // Redirect to login
      navigate('/login')
      return
    }
    // Add to favorites logic for authenticated users
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 pt-20 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading product..." />
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 pt-20 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
            <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
            <Link to="/explore" className="btn-primary">
              Browse Products
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <Link
            to="/explore"
            className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Explore</span>
          </Link>

          {/* Product Details */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
              {/* Product Image */}
              <div className="aspect-square overflow-hidden rounded-xl">
                <LazyImage
                  src={product.image_url || product.image}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
                  <div className="flex items-center space-x-2 text-gray-600 mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>by {product.artisan_name || 'Unknown Artisan'}</span>
                  </div>
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-sm text-gray-500 ml-2">(4.9) • 127 reviews</span>
                  </div>
                </div>

                <div className="text-4xl font-bold text-primary-600">
                  KSh {product.price?.toLocaleString()}
                </div>

                <p className="text-gray-700 leading-relaxed">{product.description}</p>

                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700">Quantity:</label>
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-2 hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-3 py-2 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 bg-primary-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span>{isUserAuthenticated() ? 'Add to Cart' : 'Login to Buy Product'}</span>
                    </button>
                    <button
                      onClick={handleAddToFavorites}
                      className="p-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <Heart className="w-6 h-6 text-gray-600" />
                    </button>
                    <button className="p-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                      <Share2 className="w-6 h-6 text-gray-600" />
                    </button>
                  </div>

                  <div className="flex space-x-4 pt-4 border-t border-gray-200">
                    <button className="flex-1 bg-blue-50 text-blue-600 font-semibold py-3 px-6 rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2">
                      <MessageSquare className="w-5 h-5" />
                      <span>Message Artisan</span>
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Product Details</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Category:</span>
                      <span>{product.category || 'Handcraft'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Stock:</span>
                      <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                        {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Currency:</span>
                      <span>{product.currency || 'KSH'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <Link
                    key={relatedProduct.id}
                    to={`/product/${relatedProduct.id}`}
                    className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                  >
                    <div className="aspect-square overflow-hidden">
                      <LazyImage
                        src={relatedProduct.image_url || relatedProduct.image}
                        alt={relatedProduct.title}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1">{relatedProduct.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">by {relatedProduct.artisan_name}</p>
                      <div className="text-lg font-bold text-primary-600">
                        KSh {relatedProduct.price?.toLocaleString()}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default ProductPage