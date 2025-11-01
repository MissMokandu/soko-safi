import { Upload, Plus } from 'lucide-react'

const ProductForm = ({
  editingProduct,
  formData,
  uploadedImage,
  loading,
  handleSubmit,
  handleDrag,
  handleDrop,
  handleFileInput,
  handleChange,
  dragActive,
  onCancel
}) => {
  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </h1>
        <button onClick={onCancel} className="btn-secondary px-4 py-2">
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-8">
        <div>
          <label className="block text-lg font-semibold text-gray-900 mb-4">
            Product Image
          </label>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-300 cursor-pointer ${
              dragActive
                ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-primary-100 scale-105'
                : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            }`}
          >
            {uploadedImage ? (
              <div className="space-y-6">
                <div className="relative inline-block">
                  <img src={uploadedImage} alt="Preview" className="w-40 h-40 object-cover rounded-2xl shadow-lg mx-auto" />
                  <button
                    type="button"
                    onClick={() => setUploadedImage(null)}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                  >
                    ×
                  </button>
                </div>
                <p className="text-sm text-gray-600 font-medium">Click to change image</p>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Upload className="w-8 h-8 text-primary-600" />
                </div>
                <div className="mb-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-primary-600 hover:text-primary-700 font-semibold text-lg">
                      Click to upload
                    </span>
                    <span className="text-gray-600 font-medium"> or drag and drop</span>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileInput}
                    accept=".png,.jpg,.jpeg,.gif"
                  />
                </div>
                <p className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg inline-block">
                  PNG, JPG or GIF (MAX. 800x400px)
                </p>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-3">
              Product Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Handcrafted Wooden Bowl"
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 placeholder-gray-400"
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-semibold text-gray-900 mb-3">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 bg-white"
              required
            >
              <option value="">Select category</option>
              <option value="ceramics">🎨 Ceramics</option>
              <option value="textiles">🧵 Textiles</option>
              <option value="woodwork">🪵 Woodwork</option>
              <option value="jewelry">💍 Jewelry</option>
              <option value="painting">🎭 Painting</option>
            </select>
          </div>

          <div>
            <label htmlFor="subcategory" className="block text-sm font-semibold text-gray-900 mb-3">
              Subcategory
            </label>
            <select
              id="subcategory"
              name="subcategory"
              value={formData.subcategory}
              onChange={handleChange}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 bg-white"
              required
            >
              <option value="">Select subcategory</option>
              <option value="functional">🔧 Functional</option>
              <option value="decorative">🎨 Decorative</option>
              <option value="wearable">👔 Wearable</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-3">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your masterpiece in detail..."
            rows={6}
            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 resize-none"
            required
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-semibold text-gray-900 mb-3">
            Price (KSH)
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
              <span className="text-gray-500 font-medium">KSH</span>
              <div className="w-px h-6 bg-gray-300"></div>
            </div>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full pl-20 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 text-lg font-semibold"
              required
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-4 text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold px-8 py-4 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{editingProduct ? 'Updating...' : 'Creating...'}</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span>{editingProduct ? 'Update Product' : 'Submit Product'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </>
  )
}

export default ProductForm