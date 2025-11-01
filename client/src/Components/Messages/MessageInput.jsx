import { Send, Loader } from 'lucide-react'

const MessageInput = ({ 
  messageText, 
  setMessageText, 
  onSendMessage, 
  sending 
}) => {
  return (
    <div className="p-4 border-t border-gray-200">
      <form onSubmit={onSendMessage} className="flex items-end space-x-3">
        <div className="flex-1">
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your message..."
            rows="3"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                onSendMessage(e)
              }
            }}
          />
        </div>
        <button
          type="submit"
          disabled={!messageText.trim() || sending}
          className="btn-primary p-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>
      <p className="text-xs text-gray-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
    </div>
  )
}

export default MessageInput