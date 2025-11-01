import { useState, useEffect, useRef } from 'react'
import { api } from '../services/api'
import { uploadToCloudinary } from '../services/cloudinary'

export const useMessages = (id, isAuthenticated) => {
  console.log('[USE_MESSAGES] Hook called with:', { id, isAuthenticated })
  
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(id || null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const initializationRef = useRef(new Set())
  
  console.log('[USE_MESSAGES] State:', { 
    conversationsCount: conversations.length, 
    messagesCount: messages.length, 
    selectedConversation, 
    loading, 
    sending, 
    error 
  })

  const loadConversations = async () => {
    try {
      if (!id) setLoading(true)
      const data = await api.messages.getConversations()
      
      setConversations(prev => {
        // If we have an ID (initializing specific conversation), preserve existing conversations
        if (id && prev.length > 0) {
          // Merge new conversations with existing ones, avoiding duplicates
          const existingIds = new Set(prev.map(c => c.id))
          const newConversations = Array.isArray(data) ? data.filter(c => !existingIds.has(c.id)) : []
          return [...prev, ...newConversations]
        }
        return Array.isArray(data) ? data : []
      })
      
      if (!id && data && data.length > 0 && !selectedConversation) {
        setSelectedConversation(data[0].id)
      }
    } catch (error) {
      console.error('Failed to load conversations:', error)
      setError('Failed to load conversations')
    } finally {
      if (!id) setLoading(false)
    }
  }

  const loadMessages = async (conversationId) => {
    try {
      const data = await api.messages.getMessages(conversationId)
      setMessages(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load messages:', error)
      setMessages([])
    }
  }

  const initializeConversation = async (userId) => {
    try {
      console.log('[USE_MESSAGES] Initializing conversation for userId:', userId)
      setLoading(true)
      const response = await api.messages.initConversation(userId)
      const conversation = response.conversation
      
      console.log('[USE_MESSAGES] Conversation initialized:', conversation)
      
      setConversations(prev => {
        const exists = prev.find(c => c.id == userId)
        console.log('[USE_MESSAGES] Existing conversation found:', exists)
        if (exists) {
          setSelectedConversation(userId)
          return prev
        }
        const updated = [conversation, ...prev]
        setSelectedConversation(userId)
        console.log('[USE_MESSAGES] Updated conversations:', updated)
        return updated
      })
    } catch (error) {
      console.error('[USE_MESSAGES] Failed to initialize conversation:', error)
      setError('Failed to start conversation')
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (messageText, selectedFile, currentConversation) => {
    if ((!messageText.trim() && !selectedFile) || !currentConversation) return

    try {
      setSending(true)
      const receiverId = currentConversation.artisan?.id || currentConversation.user_id
      
      let attachmentUrl = null
      if (selectedFile) {
        attachmentUrl = await uploadToCloudinary(selectedFile)
      }
      
      const messageData = {
        receiver_id: receiverId,
        message: messageText.trim() || `Sent ${selectedFile?.type.startsWith('image/') ? 'image' : 'file'}`,
        message_type: selectedFile ? (selectedFile.type.startsWith('image/') ? 'image' : 'file') : 'text',
        attachment_url: attachmentUrl,
        attachment_name: selectedFile?.name
      }
      
      const result = await api.messages.send(receiverId, messageData)
      
      const newMessage = {
        id: result.message_data?.id || Date.now(),
        sender: 'buyer',
        text: messageData.message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        message_type: messageData.message_type,
        attachment_url: attachmentUrl,
        attachment_name: selectedFile?.name,
        status: 'sent'
      }
      
      setMessages(prev => [...prev, newMessage])
      
      setConversations(prev => {
        return prev.map(conv => {
          if (conv.id === selectedConversation) {
            return {
              ...conv,
              lastMessage: messageData.message,
              lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          }
          return conv
        })
      })
      
      setTimeout(() => {
        loadMessages(selectedConversation)
        loadConversations()
      }, 500)
      
      return true
    } catch (error) {
      console.error('Failed to send message:', error)
      throw error
    } finally {
      setSending(false)
    }
  }

  useEffect(() => {
    if (!id) {
      loadConversations()
    }
  }, [id])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation)
    }
  }, [selectedConversation])

  useEffect(() => {
    console.log('[USE_MESSAGES] useEffect triggered:', { id, isAuthenticated })
    if (id && isAuthenticated && !initializationRef.current.has(id)) {
      console.log('[USE_MESSAGES] Calling initializeConversation')
      initializationRef.current.add(id)
      initializeConversation(id)
    }
  }, [id, isAuthenticated])

  return {
    conversations,
    messages,
    selectedConversation,
    setSelectedConversation,
    loading,
    sending,
    error,
    sendMessage,
    loadConversations,
    loadMessages
  }
}