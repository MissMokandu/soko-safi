const ProductList = ({ products, loading, onEdit, onDelete }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
      {products.map((product) => (
        <div key={product.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="p-6">
            <div className="flex items-start space-x-4 mb-4">
              <div className="relative">
                <img
                  src={product.image_url || product.image}
                  alt={product.title}
                  className="w-24 h-24 rounded-xl object-cover shadow-md"
                />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{product.title}</h3>
                <p className="text-2xl font-bold text-primary-600 mb-3">KSH {product.price.toFixed(2)}</p>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-gradient-to-r from-green-100 to-green-200 text-green-800 text-sm font-semibold rounded-full border border-green-300">
                    {product.status}
                  </span>
                  <span className="text-sm text-gray-500">• In Stock</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
              <button 
                onClick={() => onEdit(product)}
                className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-200 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>Edit</span>
              </button>
              <button
                onClick={() => onDelete(product.id)}
                className="flex-1 bg-red-50 text-red-600 font-semibold py-3 px-4 rounded-xl hover:bg-red-100 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ProductList