import { Check, CheckCheck, Paperclip, Download } from 'lucide-react'

const MessageBubble = ({ message }) => {
  // Get the message text from any available property
  const messageText = message.text || message.message_text || message.message || 'No text found'
  
  console.log('Rendering message text:', messageText)
  
  return (
    <div className={`flex mb-4 ${message.sender === 'buyer' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-md ${message.sender === 'buyer' ? 'order-2' : 'order-1'}`}>
        <div
          className={`rounded-2xl px-4 py-3 min-h-[40px] flex items-center ${
            message.sender === 'buyer'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-900'
          }`}
        >
          <span className="break-words">{messageText}</span>
        </div>
        <div className={`flex items-center space-x-1 mt-1 ${message.sender === 'buyer' ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs text-gray-500">{message.time}</span>
          {message.sender === 'buyer' && (
            <div className="text-xs text-gray-500">
              {message.status === 'read' || message.is_read ? (
                <CheckCheck className="w-3 h-3 text-blue-500" />
              ) : message.status === 'delivered' ? (
                <CheckCheck className="w-3 h-3" />
              ) : (
                <Check className="w-3 h-3" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MessageBubble