const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export const uploadToCloudinary = async (file) => {
  try {
    // Upload to Cloudinary in all environments

    if (!CLOUDINARY_CLOUD_NAME) {
      throw new Error('Cloudinary cloud name not configured')
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET || 'ml_default')

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Upload failed' }))
      throw new Error(`Upload failed: ${errorData.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    return data.secure_url
  } catch (error) {
    // Fallback to placeholder in production if upload fails
    return '/images/placeholder.jpg'
  }
}