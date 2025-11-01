import { useState, useEffect } from 'react'
import { MessageSquare, User, ArrowLeft } from 'lucide-react'
import { ListSkeleton, MessagingSkeleton } from '../../../Components/SkeletonLoader'
import { useMessages } from '../../../hooks/useMessages'
import ChatArea from '../../../Components/Messages/ChatArea'
import { formatMessageTime } from '../../../utils/dateUtils'

const MessagesTab = ({ messages, loading, authLoading, initialArtisanId }) => {
  console.log('[MESSAGES_TAB] Rendered with props:', { 
    initialArtisanId, 
    messagesCount: messages?.length, 
    loading, 
    authLoading 
  })
  
  const [selectedConversationId, setSelectedConversationId] = useState(null)
  const [messageText, setMessageText] = useState('')
  
  console.log('[MESSAGES_TAB] State:', { selectedConversationId, initialArtisanId })
  
  const {
    conversations,
    messages: chatMessages,
    selectedConversation,
    setSelectedConversation,
    sending,
    sendMessage
  } = useMessages(initialArtisanId, !!initialArtisanId)
  
  // Set initial conversation when initialArtisanId is provided
  useEffect(() => {
    if (initialArtisanId && !selectedConversationId) {
      setSelectedConversationId(initialArtisanId)
    }
  }, [initialArtisanId, selectedConversationId])
  
  console.log('[MESSAGES_TAB] useMessages result:', {
    conversationsCount: conversations?.length,
    chatMessagesCount: chatMessages?.length,
    selectedConversation,
    sending
  })
  
  const currentConversation = conversations.find(c => c.id === (selectedConversation || initialArtisanId))
  
  const handleConversationClick = (conversationId) => {
    setSelectedConversationId(conversationId)
    setSelectedConversation(conversationId)
  }
  
  // Use initialArtisanId or selectedConversationId for display logic
  const activeConversationId = selectedConversation || initialArtisanId || selectedConversationId
  
  console.log('[MESSAGES_TAB] Active conversation ID:', activeConversationId)
  console.log('[MESSAGES_TAB] Current conversation:', currentConversation)

  const handleSendMessage = async (e) => {
    e.preventDefault()
    try {
      await sendMessage(messageText, null, currentConversation)
      setMessageText('')
    } catch (error) {
      alert('Failed to send message. Please try again.')
    }
  }
  
  if (loading || authLoading) {
    return <MessagingSkeleton />
  }
  
  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 h-[calc(100vh-4rem)] flex bg-white">
      {/* Mobile: Show only chat when conversation selected */}
      {activeConversationId ? (
        <>
          {/* Mobile Chat View */}
          <div className="flex-1 flex flex-col lg:hidden">
            <ChatArea
              currentConversation={currentConversation}
              messages={chatMessages}
              searchQuery={''}
              messageText={messageText}
              setMessageText={setMessageText}
              onSendMessage={handleSendMessage}
              sending={sending}
              showBackButton={true}
              onBackClick={() => {
                setSelectedConversationId(null)
                setSelectedConversation(null)
                // Navigate back to messages list
                window.history.pushState({}, '', '/buyer-dashboard?tab=messages')
              }}
            />
          </div>
          
          {/* Desktop: Show both conversations and chat */}
          <div className="hidden lg:flex w-full">
            {/* Conversations List */}
            <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h1 className="text-xl font-bold text-gray-900">Messages</h1>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {(loading || authLoading) ? (
                  <div className="p-4">
                    <ListSkeleton />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
                    <p className="text-sm text-gray-600">Start a conversation with an artisan</p>
                  </div>
                ) : (
                  <div>
                    {messages.map((message, index) => {
                      console.log('[BUYER_MESSAGES] Message data:', message)
                      return (
                      <button
                        key={message.id}
                        onClick={() => handleConversationClick(message.artisan?.id || message.id)}
                        className={`w-full flex items-center p-4 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 ${
                          activeConversationId === (message.artisan?.id || message.id) ? 'bg-blue-50 border-blue-200' : ''
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
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {message.sender_name || message.artisan?.name || 'Artisan'}
                            </h3>
                            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                              {formatMessageTime(message.lastMessageTime || message.timestamp || message.created_at)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-600 truncate">
                              {message.lastMessage || message.message || 'No messages yet'}
                            </p>
                            {message.unread > 0 && (
                              <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 ml-2 flex-shrink-0">
                                {message.unread}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    )})}
                  </div>
                )}
              </div>
            </div>
            
            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              <ChatArea
                currentConversation={currentConversation}
                messages={chatMessages}
                searchQuery={''}
                messageText={messageText}
                setMessageText={setMessageText}
                onSendMessage={handleSendMessage}
                sending={sending}
              />
            </div>
          </div>
        </>
      ) : (
        /* Conversations List Only (Mobile & Desktop when no chat selected) */
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Messages</h1>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {(loading || authLoading) ? (
              <div className="p-4">
                <ListSkeleton />
              </div>
            ) : messages.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
                <p className="text-sm text-gray-600">Start a conversation with an artisan</p>
              </div>
            ) : (
              <div>
                {messages.map((message, index) => (
                  <button
                    key={message.id}
                    onClick={() => handleConversationClick(message.artisan?.id || message.id)}
                    className="w-full flex items-center p-4 hover:bg-gray-50 transition-colors text-left border-b border-gray-100"
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
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {message.sender_name || message.artisan?.name || 'Artisan'}
                        </h3>
                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                          {formatMessageTime(message.lastMessageTime || message.timestamp || message.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-600 truncate">
                          {message.lastMessage || message.message || 'No messages yet'}
                        </p>
                        {message.unread > 0 && (
                          <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 ml-2 flex-shrink-0">
                            {message.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default MessagesTab