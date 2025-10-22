import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Diamond, CreditCard, Lock, CheckCircle } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const CheckoutPage = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: Shipping, 2: Payment, 3: Confirmation
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  })
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    paymentMethod: 'card' // card or paypal
  })

  // Mock cart data
  const cartItems = [
    {
      id: 1,
      title: 'Ceramic Vase',
      price: 45.00,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=100&h=100&fit=crop'
    },
    {
      id: 2,
      title: 'Wood Carving',
      price: 120.00,
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1551522435-a13afa10f103?w=100&h=100&fit=crop'
    }
  ]

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = 10.00
  const tax = subtotal * 0.1
  const total = subtotal + shipping + tax

  const handleShippingSubmit = (e) => {
    e.preventDefault()
    setStep(2)
  }

  const handlePaymentSubmit = (e) => {
    e.preventDefault()
    // Process payment
    console.log('Processing payment...', { shippingInfo, paymentInfo })
    setStep(3)
  }

  const handleShippingChange = (e) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value
    })
  }

  const handlePaymentChange = (e) => {
    setPaymentInfo({
      ...paymentInfo,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Progress Steps */}
          <div className="mb-8 md:mb-12">
            <div className="flex items-center justify-center space-x-2 md:space-x-4">
              <div className={`flex items-center ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm md:text-base ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                  1
                </div>
                <span className="ml-1 md:ml-2 font-medium text-xs md:text-base hidden sm:inline">Shipping</span>
              </div>
              <div className={`w-8 md:w-16 h-1 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm md:text-base ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                  2
                </div>
                <span className="ml-1 md:ml-2 font-medium text-xs md:text-base hidden sm:inline">Payment</span>
              </div>
              <div className={`w-8 md:w-16 h-1 ${step >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center ${step >= 3 ? 'text-primary' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm md:text-base ${step >= 3 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                  3
                </div>
                <span className="ml-1 md:ml-2 font-medium text-xs md:text-base hidden sm:inline">Confirm</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Step 1: Shipping Information */}
              {step === 1 && (
                <div className="bg-white rounded-xl shadow-sm p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Information</h2>
                  <form onSubmit={handleShippingSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          id="fullName"
                          name="fullName"
                          value={shippingInfo.fullName}
                          onChange={handleShippingChange}
                          className="input-field"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={shippingInfo.email}
                          onChange={handleShippingChange}
                          className="input-field"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={shippingInfo.phone}
                        onChange={handleShippingChange}
                        className="input-field"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={shippingInfo.address}
                        onChange={handleShippingChange}
                        className="input-field"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={shippingInfo.city}
                          onChange={handleShippingChange}
                          className="input-field"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                          State/Province *
                        </label>
                        <input
                          type="text"
                          id="state"
                          name="state"
                          value={shippingInfo.state}
                          onChange={handleShippingChange}
                          className="input-field"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                          ZIP/Postal Code *
                        </label>
                        <input
                          type="text"
                          id="zipCode"
                          name="zipCode"
                          value={shippingInfo.zipCode}
                          onChange={handleShippingChange}
                          className="input-field"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                          Country *
                        </label>
                        <input
                          type="text"
                          id="country"
                          name="country"
                          value={shippingInfo.country}
                          onChange={handleShippingChange}
                          className="input-field"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-between pt-6">
                      <Link to="/cart" className="btn-secondary px-6 py-3">
                        Back to Cart
                      </Link>
                      <button type="submit" className="btn-primary px-6 py-3">
                        Continue to Payment
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Step 2: Payment Information */}
              {step === 2 && (
                <div className="bg-white rounded-xl shadow-sm p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Information</h2>
                  
                  {/* Payment Method Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setPaymentInfo({ ...paymentInfo, paymentMethod: 'card' })}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          paymentInfo.paymentMethod === 'card'
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <CreditCard className="w-6 h-6 mx-auto mb-2" />
                        <p className="font-medium">Credit Card</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentInfo({ ...paymentInfo, paymentMethod: 'paypal' })}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          paymentInfo.paymentMethod === 'paypal'
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-6 h-6 mx-auto mb-2 font-bold text-blue-600">PP</div>
                        <p className="font-medium">PayPal</p>
                      </button>
                    </div>
                  </div>

                  {paymentInfo.paymentMethod === 'card' && (
                    <form onSubmit={handlePaymentSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
                          Card Number *
                        </label>
                        <input
                          type="text"
                          id="cardNumber"
                          name="cardNumber"
                          value={paymentInfo.cardNumber}
                          onChange={handlePaymentChange}
                          placeholder="1234 5678 9012 3456"
                          className="input-field"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-2">
                          Cardholder Name *
                        </label>
                        <input
                          type="text"
                          id="cardName"
                          name="cardName"
                          value={paymentInfo.cardName}
                          onChange={handlePaymentChange}
                          placeholder="John Doe"
                          className="input-field"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
                            Expiry Date *
                          </label>
                          <input
                            type="text"
                            id="expiryDate"
                            name="expiryDate"
                            value={paymentInfo.expiryDate}
                            onChange={handlePaymentChange}
                            placeholder="MM/YY"
                            className="input-field"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-2">
                            CVV *
                          </label>
                          <input
                            type="text"
                            id="cvv"
                            name="cvv"
                            value={paymentInfo.cvv}
                            onChange={handlePaymentChange}
                            placeholder="123"
                            className="input-field"
                            maxLength="4"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg mt-6">
                        <Lock className="w-5 h-5 text-gray-600" />
                        <p className="text-sm text-gray-600">
                          Your payment information is secure and encrypted
                        </p>
                      </div>

                      <div className="flex justify-between pt-6">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="btn-secondary px-6 py-3"
                        >
                          Back
                        </button>
                        <button type="submit" className="btn-primary px-6 py-3">
                          Place Order
                        </button>
                      </div>
                    </form>
                  )}

                  {paymentInfo.paymentMethod === 'paypal' && (
                    <div className="space-y-4">
                      <div className="p-6 bg-blue-50 rounded-lg text-center">
                        <p className="text-gray-700 mb-4">You will be redirected to PayPal to complete your purchase.</p>
                        <button
                          onClick={handlePaymentSubmit}
                          className="btn-primary px-8 py-3"
                        >
                          Continue with PayPal
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="w-full btn-secondary py-3"
                      >
                        Back
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Order Confirmation */}
              {step === 3 && (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h2>
                  <p className="text-gray-600 mb-2">Thank you for your purchase.</p>
                  <p className="text-gray-600 mb-8">
                    Order confirmation has been sent to <span className="font-medium">{shippingInfo.email}</span>
                  </p>
                  
                  <div className="bg-gray-50 rounded-lg p-6 mb-8">
                    <p className="text-sm text-gray-600 mb-2">Order Number</p>
                    <p className="text-2xl font-bold text-gray-900">#ORD-{Date.now().toString().slice(-6)}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/buyer-dashboard" className="btn-primary px-6 py-3">
                      View Order Details
                    </Link>
                    <Link to="/explore" className="btn-secondary px-6 py-3">
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
                
                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Shipping</span>
                    <span className="font-medium">${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Tax</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-gray-900">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default CheckoutPage
