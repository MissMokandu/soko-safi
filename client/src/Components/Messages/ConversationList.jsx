import { Link } from 'react-router-dom'
import { Loader, User } from 'lucide-react'

const ConversationList = ({ 
  conversations, 
  loading, 
  selectedConversation, 
  onSelectConversation, 
  searchQuery, 
  onSearchChange 
}) => {
  const filteredConversations = conversations.filter(conv => 
    conv.artisan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col max-h-48 md:max-h-none">
      <div className="p-4 border-b border-gray-200 space-y-3">
        <h2 className="text-xl font-bold text-gray-900">Messages</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto hidden md:block">
        {loading ? (
          <div className="p-4 text-center">
            <Loader className="w-6 h-6 text-primary mx-auto mb-2 animate-spin" />
            <p className="text-sm text-gray-600">Loading conversations...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-gray-600">No conversations yet</p>
            <Link to="/explore" className="text-primary hover:text-primary-700 text-sm">
              Browse products to start chatting with artisans
            </Link>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className={`w-full p-3 md:p-4 flex items-start space-x-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                selectedConversation === conversation.id ? 'bg-primary/5' : ''
              }`}
            >
              <div className="relative">
                {conversation.artisan.profile_picture_url ? (
                  <img 
                    src={conversation.artisan.profile_picture_url} 
                    alt={conversation.artisan.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                )}
                {conversation.artisan.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-bold text-gray-900">{conversation.artisan.name}</p>
                  {conversation.unread > 0 && (
                    <span className="w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                      {conversation.unread}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                <p className="text-xs text-gray-500 mt-1">{conversation.lastMessageTime}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

export default ConversationList