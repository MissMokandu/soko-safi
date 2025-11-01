import { LayoutDashboard, Search, MessageSquare } from 'lucide-react'

const MobileBottomNav = ({ activeTab, setActiveTab }) => {
  const handleTabClick = (tab) => {
    if (setActiveTab) {
      setActiveTab(tab)
    }
  }

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
      <div className="flex items-center justify-around py-2">
        <button
          onClick={() => handleTabClick('dashboard')}
          className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
            activeTab === 'dashboard'
              ? 'text-primary-600 bg-primary-50'
              : 'text-gray-600 hover:text-primary-600'
          }`}
        >
          <LayoutDashboard className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">Dashboard</span>
        </button>

        <button
          onClick={() => handleTabClick('explore')}
          className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
            activeTab === 'explore'
              ? 'text-primary-600 bg-primary-50'
              : 'text-gray-600 hover:text-primary-600'
          }`}
        >
          <Search className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">Explore</span>
        </button>

        <button
          onClick={() => handleTabClick('messages')}
          className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
            activeTab === 'messages'
              ? 'text-primary-600 bg-primary-50'
              : 'text-gray-600 hover:text-primary-600'
          }`}
        >
          <MessageSquare className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">Messages</span>
        </button>
      </div>
    </div>
  )
}

export default MobileBottomNav