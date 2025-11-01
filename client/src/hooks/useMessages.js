import { useState, useEffect, useRef } from 'react'
import { api } from '../services/api'
import { uploadToCloudinary } from '../services/cloudinary'

export const useMessages = (id, isAuthenticated) => {
  
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(id || null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const initializationRef = useRef(new Set())

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
      setMessages([])
    }
  }

  const initializeConversation = async (userId) => {
    try {
      setLoading(true)
      const response = await api.messages.initConversation(userId)
      const conversation = response.conversation
      
      setConversations(prev => {
        const exists = prev.find(c => c.id == userId)
        if (exists) {
          setSelectedConversation(userId)
          return prev
        }
        const updated = [conversation, ...prev]
        setSelectedConversation(userId)
        return updated
      })
    } catch (error) {
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
    if (id && isAuthenticated && !initializationRef.current.has(id)) {
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