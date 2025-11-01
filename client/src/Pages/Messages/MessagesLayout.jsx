import DashboardNavbar from '../../Components/Layout/DashboardNavbar'
import BuyerSidebar from '../../Components/Layout/BuyerSidebar'

const MessagesLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <DashboardNavbar />
      <div className="flex flex-col lg:flex-row">
        <BuyerSidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden h-[600px] md:h-[calc(100vh-200px)]">
              <div className="flex h-full flex-col md:flex-row">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default MessagesLayout