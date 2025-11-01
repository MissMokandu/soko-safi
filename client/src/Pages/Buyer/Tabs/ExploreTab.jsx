import { Link } from 'react-router-dom'
import { Search, Grid, List, MapPin, Heart } from 'lucide-react'
import { CardSkeleton } from '../../../Components/SkeletonLoader'
import LazyImage from '../../../Components/LazyImage'

const ExploreTab = ({ 
  exploreProducts, 
  exploreCategories, 
  searchTerm, 
  setSearchTerm,
  selectedCategory, 
  setSelectedCategory,
  sortBy, 
  setSortBy,
  viewMode, 
  setViewMode,
  exploreLoading, 
  authLoading,
  favoriteProducts,
  toggleFavorite
}) => {
  const filteredProducts = exploreProducts.filter(product => {
    const matchesSearch = product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.artisan_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category?.toLowerCase() === selectedCategory
    return matchesSearch && matchesCategory
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return (a.price || 0) - (b.price || 0)
      case "price-high":
        return (b.price || 0) - (a.price || 0)
      case "rating":
        return (b.rating || 0) - (a.rating || 0)
      case "newest":
        return new Date(b.created_at || 0) - new Date(a.created_at || 0)
      default:
        return 0
    }
  })

  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Explore Products</h1>
        <p className="text-gray-600">Discover unique handcrafted pieces from talented artisans.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search for products, artisans, or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-lg"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {exploreCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>

            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${
                  viewMode === "grid"
                    ? "bg-primary-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${
                  viewMode === "list"
                    ? "bg-primary-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={`${
        viewMode === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "space-y-4"
      }`}>
        {sortedProducts.map((product) => (
          <Link
            key={product.id}
            to={`/buyer-dashboard?tab=product&id=${product.id}`}
            className={`group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden ${
              viewMode === "list" ? "flex" : ""
            }`}
          >
            <div className={`relative ${
              viewMode === "list" ? "w-48 flex-shrink-0" : "aspect-square"
            } overflow-hidden`}>
              <LazyImage
                src={product.image}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <button 
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  toggleFavorite(product.id)
                }}
                className={`absolute top-3 right-3 p-2 rounded-full transition-all ${
                  favoriteProducts.has(product.id)
                    ? 'bg-red-100/90 text-red-500 opacity-100'
                    : 'bg-white/80 text-gray-600 opacity-0 group-hover:opacity-100 hover:text-red-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${
                  favoriteProducts.has(product.id) ? 'fill-current' : ''
                }`} />
              </button>
            </div>

            <div className={`p-6 ${viewMode === "list" ? "flex-1" : ""}`}>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 mb-1">
                {product.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <MapPin className="w-3 h-3" />
                <span>{product.location || "Kenya"}</span>
                <span>•</span>
                <span>by {product.artisan_name || "Unknown"}</span>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {product.description}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">
                  KSh {product.price?.toLocaleString() || "N/A"}
                </span>
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                  product.in_stock
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}>
                  {product.in_stock ? "In Stock" : "Out of Stock"}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {(exploreLoading || authLoading) && (
        <div className={`${
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
        }`}>
          {[1, 2, 3, 4, 5, 6].map((i) => <CardSkeleton key={i} />)}
        </div>
      )}
      {!exploreLoading && exploreProducts.length === 0 && (
        <div className="text-center py-16 text-gray-600">
          <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No products found. Try adjusting your filters.</p>
        </div>
      )}
    </>
  )
}

export default ExploreTab