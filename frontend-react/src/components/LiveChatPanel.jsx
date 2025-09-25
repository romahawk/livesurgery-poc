import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, SendHorizontal } from "lucide-react";

/** Small trigger button with icon (use in your toolbar/top-right) */
export function LiveChatButton({ onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded ${className}`}
      aria-label="Open live chat"
      title="Live Chat"
    >
      <MessageSquare className="h-4 w-4" aria-hidden />
      Live Chat
    </button>
  );
}

export default function LiveChatPanel({ role, messages, onSendMessage, onClose }) {
  const [input, setInput] = useState("");
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput("");
  };

  return (
    <div className="fixed top-0 right-0 w-80 h-full bg-white shadow-lg p-4 border-l z-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold inline-flex items-center gap-2">
          <MessageSquare className="h-5 w-5" aria-hidden />
          <span>Live Chat</span>
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-red-500"
          aria-label="Close chat panel"
          title="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div ref={chatRef} className="overflow-y-auto h-[70%] space-y-2 pr-1">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded ${
              msg.sender === role ? "bg-blue-100 self-end" : "bg-gray-100"
            }`}
          >
            <strong className="block text-xs text-gray-600">{msg.sender}</strong>
            <span className="text-sm">{msg.text}</span>
          </div>
        ))}
      </div>

      {/* Input */}
      {role !== "viewer" && (
        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <input
            type="text"
            className="flex-1 border rounded px-2 py-1"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
            aria-label="Send message"
          >
            <SendHorizontal className="h-4 w-4" />
            Send
          </button>
        </form>
      )}
    </div>
  );
}
