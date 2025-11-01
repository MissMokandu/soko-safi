import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useMessages } from '../hooks/useMessages'
import MessagesLayout from './Messages/MessagesLayout'
import ConversationList from '../Components/Messages/ConversationList'
import ChatArea from '../Components/Messages/ChatArea'

const MessagesPageRefactored = () => {
  const { id } = useParams()
  const { isAuthenticated } = useAuth()
  const [messageText, setMessageText] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const {
    conversations,
    messages,
    selectedConversation,
    setSelectedConversation,
    loading,
    sending,
    error,
    sendMessage
  } = useMessages(id, isAuthenticated)

  const currentConversation = conversations.find(c => c.id === selectedConversation)

  const handleFileSelect = (file, type) => {
    setSelectedFile(file)
    if (type === 'image' && file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const clearAttachment = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    try {
      await sendMessage(messageText, selectedFile, currentConversation)
      setMessageText('')
      clearAttachment()
    } catch (error) {
      alert('Failed to send message. Please try again.')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to view your messages.</p>
          <Link to="/login" className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <MessagesLayout>
      <ConversationList
        conversations={conversations}
        loading={loading}
        selectedConversation={selectedConversation}
        onSelectConversation={setSelectedConversation}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <ChatArea
        currentConversation={currentConversation}
        messages={messages}
        searchQuery={searchQuery}
        messageText={messageText}
        setMessageText={setMessageText}
        selectedFile={selectedFile}
        previewUrl={previewUrl}
        onFileSelect={handleFileSelect}
        onClearAttachment={clearAttachment}
        onSendMessage={handleSendMessage}
        sending={sending}
      />
    </MessagesLayout>
  )
}

export default MessagesPageRefactored