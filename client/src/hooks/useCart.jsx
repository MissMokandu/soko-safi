import { useState, useEffect, createContext, useContext } from 'react'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('User authenticated, loading cart for:', user)
      loadCart()
    } else {
      console.log('User not authenticated, clearing cart')
      setCartItems([])
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    if (Array.isArray(cartItems)) {
      setCartCount(cartItems.reduce((sum, item) => sum + item.quantity, 0))
    } else {
      setCartCount(0)
    }
  }, [cartItems])

  const loadCart = async () => {
    try {
      console.log('[FRONTEND_CART_LOAD] Starting cart load...')
      setLoading(true)
      const cart = await api.cart.get()
      console.log('[FRONTEND_CART_LOAD] Raw response from backend:', cart)
      console.log('[FRONTEND_CART_LOAD] Response type:', typeof cart, 'Is array:', Array.isArray(cart))
      
      // Handle different response formats from backend
      if (Array.isArray(cart)) {
        console.log(`[FRONTEND_CART_LOAD] Setting ${cart.length} cart items from array response`)
        setCartItems(cart)
      } else if (cart && Array.isArray(cart.items)) {
        console.log(`[FRONTEND_CART_LOAD] Setting ${cart.items.length} cart items from cart.items`)
        setCartItems(cart.items)
      } else if (cart && Array.isArray(cart.cart_items)) {
        console.log(`[FRONTEND_CART_LOAD] Setting ${cart.cart_items.length} cart items from cart.cart_items`)
        setCartItems(cart.cart_items)
      } else if (cart && cart.data && Array.isArray(cart.data)) {
        console.log(`[FRONTEND_CART_LOAD] Setting ${cart.data.length} cart items from cart.data`)
        setCartItems(cart.data)
      } else {
        console.log('[FRONTEND_CART_LOAD] Cart format not recognized, setting empty. Response:', cart)
        setCartItems([])
      }
    } catch (error) {
      console.error('[FRONTEND_CART_LOAD] Failed to load cart:', error)
      if (error.message.includes('Please log in')) {
        console.log('[FRONTEND_CART_LOAD] User not authenticated, cart will be empty')
      }
      setCartItems([])
    } finally {
      setLoading(false)
      console.log('[FRONTEND_CART_LOAD] Cart load completed')
    }
  }

  const addToCart = async (productId, quantity = 1) => {
    try {
      console.log('[FRONTEND_CART_ADD] Starting add to cart:', { productId, quantity })
      const result = await api.cart.add(productId, quantity)
      console.log('[FRONTEND_CART_ADD] Backend response:', result)
      console.log('[FRONTEND_CART_ADD] Reloading cart from server...')
      await loadCart() // Reload the cart from the server
      console.log('[FRONTEND_CART_ADD] Cart reload completed')
      return true
    } catch (error) {
      console.error('[FRONTEND_CART_ADD] Failed to add to cart:', error)
      if (error.message.includes('Internal Server Error')) {
        throw new Error('Please log in to add items to your cart')
      }
      throw error
    }
  }

  const updateQuantity = async (itemId, quantity) => {
    await api.cart.update(itemId, quantity)
    // Optimistically update UI
    setCartItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    ))
    return true
  }

  const removeFromCart = async (itemId) => {
    await api.cart.remove(itemId)
    // Optimistically update UI
    setCartItems(prev => prev.filter(item => item.id !== itemId))
    return true
  }

  const clearCart = async () => {
    await api.cart.clear()
    setCartItems([])
    return true
  }

  const getCartTotal = () => {
    if (!Array.isArray(cartItems)) return 0
    return cartItems.reduce((sum, item) => {
      const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price
      return sum + (price * item.quantity)
    }, 0)
  }

  const value = {
    cartItems,
    loading,
    cartCount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    loadCart,
    getCartTotal
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}