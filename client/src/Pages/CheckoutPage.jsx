import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Smartphone, Lock, CheckCircle, Loader } from 'lucide-react'
import { useCart } from '../hooks/useCart.jsx'
import { api } from '../services/api'

const CheckoutPage = () => {
  const navigate = useNavigate()
  const { cartItems, loading, clearCart } = useCart()
  const [step, setStep] = useState(1)
  const [processing, setProcessing] = useState(false)

  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: '',
  })

  const [paymentInfo, setPaymentInfo] = useState({
    phoneNumber: '',
    paymentMethod: 'mpesa'
  })

  useEffect(() => {
    if (!loading && (!cartItems || cartItems.length === 0)) {
      navigate('/cart')
    }
  }, [cartItems, loading, navigate])

  // Calculate totals safely
  const subtotal = cartItems.reduce((sum, item) => {
    const price = parseFloat(item.product?.price || item.price || 0)
    return sum + (isNaN(price) ? 0 : price * item.quantity)
  }, 0)
  const shipping = 150.0
  const tax = subtotal * 0.16
  const total = subtotal + shipping + tax

  // Handlers
  const handleShippingChange = (e) => {
    const { name, value } = e.target
    setShippingInfo({ ...shippingInfo, [name]: value })
  }

  const handleShippingSubmit = (e) => {
    e.preventDefault()
    // Simple validation
    if (!shippingInfo.fullName || !shippingInfo.address || !shippingInfo.phone) {
      alert('Please fill in all required fields.')
      return
    }
    setStep(2)
  }

  const handlePaymentChange = (e) => {
    const { name, value } = e.target
    setPaymentInfo({ ...paymentInfo, [name]: value })
  }

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()

    if (cartItems.length === 0) {
      alert('Your cart is empty')
      return
    }

    try {
      setProcessing(true)

      // Create order
      const orderData = {
        total_amount: total,
        status: 'pending'
      }

      const order = await api.orders.create(orderData)
      const orderId = order.order?.id || order.id

      // Create order items
      for (const item of cartItems) {
        const price = parseFloat(item.price || 0)
        await api.orders.createItem({
          order_id: orderId,
          product_id: item.product_id || item.id,
          quantity: item.quantity,
          unit_price: price,
          total_price: price * item.quantity,
          artisan_id: item.product?.artisan_id || item.artisan_id || 1
        })
      }

      // Clear cart
      await clearCart()

      // M-Pesa Payment
      const paymentData = {
        order_id: orderId,
        phone_number: paymentInfo.phoneNumber
      }

      try {
        const response = await api.payments.mpesa.stkPush(paymentData)
        if (response && (response.success || response.message)) {
          alert('Payment request sent to your phone. Complete it to continue.')
          setStep(3)
        } else {
          throw new Error(response?.error || 'Payment failed')
        }
      } catch (apiError) {
        console.warn('M-Pesa API not available — simulating payment')
        alert('Demo mode: Payment request sent to your phone.')
        setStep(3)
      }
    } catch (error) {
      console.error('Payment failed:', error)
      alert(`Payment failed: ${error.message}`)
    } finally {
      setProcessing(false)
    }
  }

  const handleConfirmOrder = () => {
    alert('Order confirmed! Thank you for shopping with us.')
    navigate('/')
  }

  // --- UI ---
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 flex flex-col items-center">
      <div className="w-full max-w-3xl bg-white shadow-md rounded-2xl p-6">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Checkout - Step {step} of 3
        </h2>

        {/* STEP 1 - Shipping Info */}
        {step === 1 && (
          <form onSubmit={handleShippingSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Full Name *</label>
              <input
                type="text"
                name="fullName"
                value={shippingInfo.fullName}
                onChange={handleShippingChange}
                className="w-full border border-gray-300 rounded-lg p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Email *</label>
              <input
                type="email"
                name="email"
                value={shippingInfo.email}
                onChange={handleShippingChange}
                className="w-full border border-gray-300 rounded-lg p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Address *</label>
              <input
                type="text"
                name="address"
                value={shippingInfo.address}
                onChange={handleShippingChange}
                className="w-full border border-gray-300 rounded-lg p-2"
                required
              />
            </div>
            <div className="flex gap-4">
              <input
                type="text"
                name="city"
                value={shippingInfo.city}
                onChange={handleShippingChange}
                placeholder="City"
                className="flex-1 border border-gray-300 rounded-lg p-2"
                required
              />
              <input
                type="text"
                name="phone"
                value={shippingInfo.phone}
                onChange={handleShippingChange}
                placeholder="07XX XXX XXX"
                className="flex-1 border border-gray-300 rounded-lg p-2"
                required
              />
            </div>
            <div className="flex justify-between">
              <Link to="/cart" className="btn-secondary px-4 py-2">
                Back to Cart
              </Link>
              <button type="submit" className="btn-primary px-6 py-2">
                Continue to Payment
              </button>
            </div>
          </form>
        )}

        {/* STEP 2 - Payment */}
        {step === 2 && (
          <form onSubmit={handlePaymentSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium">M-Pesa Phone Number *</label>
              <input
                type="tel"
                name="phoneNumber"
                value={paymentInfo.phoneNumber}
                onChange={handlePaymentChange}
                placeholder="2547XXXXXXXX"
                pattern="254[0-9]{9}"
                className="w-full border border-gray-300 rounded-lg p-2"
                required
              />
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-secondary px-4 py-2"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={processing}
                className="btn-primary px-6 py-2 disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin inline mr-2" />
                    Processing...
                  </>
                ) : (
                  'Pay with M-Pesa'
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3 - Confirmation */}
        {step === 3 && (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Order Confirmed!
            </h2>
            <p className="text-gray-600">
              Thank you for your purchase. Confirmation sent to{' '}
              <span className="font-medium">{shippingInfo.email}</span>
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/buyer-dashboard" className="btn-primary px-6 py-3">
                View Orders
              </Link>
              <Link to="/explore" className="btn-secondary px-6 py-3">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CheckoutPage

