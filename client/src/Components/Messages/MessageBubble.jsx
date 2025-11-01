import { Check, CheckCheck, Paperclip, Download } from 'lucide-react'

const MessageBubble = ({ message }) => {
  return (
    <div className={`flex ${message.sender === 'buyer' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-md ${message.sender === 'buyer' ? 'order-2' : 'order-1'}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            message.sender === 'buyer'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          {message.message_type === 'image' && message.attachment_url ? (
            <div className="space-y-2">
              <img 
                src={message.attachment_url} 
                alt={message.attachment_name || 'Image'}
                className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90"
                onClick={() => window.open(message.attachment_url, '_blank')}
              />
              {(message.text || message.message_text) && (message.text || message.message_text) !== 'Sent image' && (
                <p>{message.text || message.message_text}</p>
              )}
            </div>
          ) : message.message_type === 'file' && message.attachment_url ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 p-2 bg-black/10 rounded-lg">
                <Paperclip className="w-4 h-4" />
                <span className="text-sm truncate">{message.attachment_name}</span>
                <a 
                  href={message.attachment_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-auto"
                >
                  <Download className="w-4 h-4 hover:scale-110 transition-transform" />
                </a>
              </div>
              {(message.text || message.message_text) && (message.text || message.message_text) !== 'Sent file' && (
                <p>{message.text || message.message_text}</p>
              )}
            </div>
          ) : (
            <p>{message.text || message.message_text}</p>
          )}
        </div>
        <div className={`flex items-center space-x-1 mt-1 ${message.sender === 'buyer' ? 'justify-end' : 'justify-start'}`}>
          <p className="text-xs text-gray-500">{message.time}</p>
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