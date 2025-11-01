import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { CardSkeleton } from '../../../Components/SkeletonLoader'

const CollectionsTab = ({ collections, loading, authLoading, safeSrc }) => {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Favorite Products</h1>
        <p className="text-gray-600">Your saved favorite handcrafted items from talented artisans.</p>
      </div>

      {(loading || authLoading) ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
        </div>
      ) : collections.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-16 text-center rounded-2xl border-2 border-dashed border-gray-300">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-primary-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No favorites yet</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">Start adding products to your favorites by clicking the heart icon on products you love.</p>
          <Link
            to="/buyer-dashboard?tab=explore"
            className="bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold px-8 py-4 rounded-xl inline-flex items-center space-x-3 hover:from-primary-600 hover:to-primary-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <span>Explore Products</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {collections.map((favorite) => (
            <Link
              key={favorite.id}
              to={`/buyer-dashboard?tab=product&id=${favorite.product_id || favorite.id}`}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="aspect-square overflow-hidden relative">
                <img
                  src={safeSrc(favorite.product?.image || favorite.image, 400, 400)}
                  alt={favorite.product?.title || favorite.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 p-2 bg-white/80 rounded-full">
                  <Heart className="w-4 h-4 text-red-500 fill-current" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 mb-1">
                  {favorite.product?.title || favorite.title}
                </h3>
                <p className="text-sm text-gray-500 mb-2">by {favorite.product?.artisan_name || favorite.artisan_name || 'Unknown'}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-gray-900">
                    KSh {(favorite.product?.price || favorite.price || 0).toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500">
                    Added {favorite.created_at ? new Date(favorite.created_at).toLocaleDateString() : 'Recently'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}

export default CollectionsTab