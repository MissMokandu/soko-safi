import { Plus, Package } from 'lucide-react'
import ProductForm from '../Components/ProductForm'
import ProductList from '../Components/ProductList'

const ProductsTab = ({ 
  myProducts, 
  showAddProduct, 
  setShowAddProduct, 
  editingProduct,
  setEditingProduct,
  formData,
  setFormData,
  uploadedImage,
  setUploadedImage,
  selectedFile,
  setSelectedFile,
  loading,
  handleSubmit,
  handleEdit,
  handleDelete,
  handleDrag,
  handleDrop,
  handleFileInput,
  handleChange,
  dragActive
}) => {
  if (showAddProduct) {
    return (
      <ProductForm
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
        handleDrag={handleDrag}
        handleDrop={handleDrop}
        handleFileInput={handleFileInput}
        handleChange={handleChange}
        dragActive={dragActive}
        onCancel={() => {
          setShowAddProduct(false)
          setEditingProduct(null)
          setFormData({ title: '', category: '', subcategory: '', description: '', price: '' })
          setUploadedImage(null)
          setSelectedFile(null)
        }}
      />
    )
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          My Products ({myProducts.length})
        </h1>
        <button
          onClick={() => setShowAddProduct(true)}
          className="btn-primary px-6 py-3 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Product</span>
        </button>
      </div>

      {myProducts.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-16 text-center rounded-2xl border-2 border-dashed border-gray-300">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-primary-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No products yet</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">Start your artisan journey by adding your first beautiful creation to showcase your craftsmanship.</p>
          <button
            onClick={() => setShowAddProduct(true)}
            className="bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold px-8 py-4 rounded-xl inline-flex items-center space-x-3 hover:from-primary-600 hover:to-primary-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-6 h-6" />
            <span>Add Your First Product</span>
          </button>
        </div>
      ) : (
        <ProductList
          products={myProducts}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </>
  )
}

export default ProductsTab