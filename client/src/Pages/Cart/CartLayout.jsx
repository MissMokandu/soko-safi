import BuyerLayout from '../Buyer/BuyerLayout'
import { useNavigate } from 'react-router-dom'

const CartLayout = ({ children }) => {
  const navigate = useNavigate()
  
  const handleTabChange = (tab) => {
    navigate(`/buyer-dashboard?tab=${tab}`)
  }
  
  return (
    <BuyerLayout activeTab="orders" setActiveTab={handleTabChange}>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
      {children}
    </BuyerLayout>
  )
}

export default CartLayout