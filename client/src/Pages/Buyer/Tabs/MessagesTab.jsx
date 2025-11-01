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
        <div className="space-y-6">
          {messages.map((message) => (
            <div key={message.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-xl font-bold text-gray-900">{message.sender_name || message.artisan}</h3>
                      {message.is_read === false && (
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-gray-600">{message.sender_email || 'Artisan'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {message.timestamp ? new Date(message.timestamp).toLocaleDateString() : message.time}
                  </span>
                </div>
              </div>
              <p className={`p-4 rounded-xl border-l-4 ${
                message.is_read === false
                  ? 'text-gray-700 bg-blue-50 border-blue-500'
                  : 'text-gray-700 bg-gray-50 border-gray-300'
              }`}>
                {message.message || message.lastMessage}
              </p>
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <div className="flex space-x-3">
                  <Link
                    to={`/messages/${message.sender_id}`}
                    className="bg-blue-50 text-blue-600 font-semibold px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Reply
                  </Link>
                  {message.is_read === false && (
                    <button className="bg-gray-50 text-gray-600 font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                      Mark as Read
                    </button>
                  )}
                </div>
                <span className={`text-sm ${message.is_read === false ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                  {message.is_read === false ? 'New message' : 'Read'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default MessagesTab