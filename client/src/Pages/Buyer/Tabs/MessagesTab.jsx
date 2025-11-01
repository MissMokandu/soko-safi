import { Link } from 'react-router-dom'
import { MessageSquare, User } from 'lucide-react'
import { ListSkeleton } from '../../../Components/SkeletonLoader'

const MessagesTab = ({ messages, loading, authLoading }) => {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Messages</h1>
        <p className="text-gray-600">Communicate with artisans about your orders and inquiries.</p>
      </div>

      {(loading || authLoading) ? (
        <div className="space-y-6">
          <ListSkeleton />
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-16 text-center rounded-2xl border-2 border-dashed border-gray-300">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-10 h-10 text-primary-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No messages yet</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">When you contact artisans or they respond to your inquiries, messages will appear here.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {messages.map((message, index) => (
            <Link
              key={message.id}
              to={`/messages-new/${message.artisan?.id || message.id}`}
              className={`flex items-center p-4 hover:bg-gray-50 transition-colors ${
                index !== messages.length - 1 ? 'border-b border-gray-200' : ''
              }`}
            >
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 mr-3">
                <img 
                  src={message.artisan?.avatar || '/images/placeholder-avatar.jpg'} 
                  alt={message.artisan?.name || 'Artisan'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-base font-semibold text-gray-900 truncate">
                    {message.sender_name || message.artisan?.name || 'Artisan'}
                  </h3>
                  <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                    {message.lastMessageTime || (message.timestamp ? new Date(message.timestamp).toLocaleDateString() : '')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 truncate">
                    {message.lastMessage || message.message || 'No messages yet'}
                  </p>
                  {message.unread > 0 && (
                    <span className="bg-primary text-white text-xs rounded-full px-2 py-1 ml-2 flex-shrink-0">
                      {message.unread}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}

export default MessagesTab