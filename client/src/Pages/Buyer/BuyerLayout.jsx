import { useSearchParams } from 'react-router-dom'
import DashboardNavbar from '../../Components/Layout/DashboardNavbar'
import BuyerSidebar from '../../Components/Layout/BuyerSidebar'

const BuyerLayout = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <DashboardNavbar />
      <div className="flex flex-col lg:flex-row">
        <BuyerSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default BuyerLayout