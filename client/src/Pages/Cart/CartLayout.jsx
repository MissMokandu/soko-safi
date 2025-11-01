import DashboardNavbar from '../../Components/Layout/DashboardNavbar'
import BuyerSidebar from '../../Components/Layout/BuyerSidebar'

const CartLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <DashboardNavbar />
      <div className="flex flex-col lg:flex-row">
        <BuyerSidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default CartLayout