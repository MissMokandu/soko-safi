import { useNavigate } from 'react-router-dom'
import DashboardNavbar from '../../Components/Layout/DashboardNavbar'
import BuyerSidebar from '../../Components/Layout/BuyerSidebar'
import MobileBottomNav from '../../Components/Layout/MobileBottomNav'

const CartLayout = ({ children }) => {
  const navigate = useNavigate()
  
  const handleTabChange = (tab) => {
    navigate(`/buyer-dashboard?tab=${tab}`)
  }
  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <DashboardNavbar />
      <div className="flex flex-1 overflow-hidden relative">
        <BuyerSidebar activeTab="cart" setActiveTab={handleTabChange} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8 animate-fade-in">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
            {children}
          </div>
        </main>
      </div>
      <MobileBottomNav activeTab="cart" setActiveTab={handleTabChange} />
    </div>
  )
}

export default CartLayout