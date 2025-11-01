import { useRef } from 'react'
import { Send, Paperclip, Image as ImageIcon, Loader } from 'lucide-react'

const MessageInput = ({ 
  messageText, 
  setMessageText, 
  selectedFile, 
  previewUrl, 
  onFileSelect, 
  onClearAttachment, 
  onSendMessage, 
  sending 
}) => {
  const fileInputRef = useRef(null)
  const imageInputRef = useRef(null)

  return (
    <div className="p-4 border-t border-gray-200">
      {/* File Preview */}
      {(selectedFile || previewUrl) && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Attachment:</span>
            <button
              onClick={onClearAttachment}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Remove
            </button>
          </div>
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="max-w-32 h-auto rounded" />
          ) : (
            <div className="flex items-center space-x-2">
              <Paperclip className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{selectedFile?.name}</span>
            </div>
          )}
        </div>
      )}
      
      <form onSubmit={onSendMessage} className="flex items-end space-x-3">
        <div className="flex space-x-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => onFileSelect(e.target.files[0], 'file')}
          />
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onFileSelect(e.target.files[0], 'image')}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Attach image"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1">
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder={selectedFile ? "Add a caption (optional)..." : "Type your message..."}
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
          disabled={(!messageText.trim() && !selectedFile) || sending}
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