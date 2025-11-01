import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'

const ChatArea = ({ 
  currentConversation,
  messages,
  searchQuery,
  messageText,
  setMessageText,
  onSendMessage,
  sending,
  showBackButton = false,
  onBackClick
}) => {
  const filteredMessages = searchQuery ? 
    messages.filter(msg => 
      msg.text.toLowerCase().includes(searchQuery.toLowerCase())
    ) : messages

  if (!currentConversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <p>Select a conversation to start messaging</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          {showBackButton && (
            <button
              onClick={onBackClick}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <img 
            src={currentConversation.artisan.avatar} 
            alt={currentConversation.artisan.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <Link 
              to={`/artisan/${currentConversation.artisan.id}`}
              className="font-bold text-gray-900 hover:text-primary"
            >
              {currentConversation.artisan.name}
            </Link>
            <p className="text-sm text-gray-600">
              {currentConversation.artisan.online ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {searchQuery && (
          <div className="text-center py-2">
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {filteredMessages.length} message(s) found
            </span>
          </div>
        )}
        {filteredMessages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>

      <MessageInput
        messageText={messageText}
        setMessageText={setMessageText}
        onSendMessage={onSendMessage}
        sending={sending}
      />
    </div>
  )
}

export default ChatArea