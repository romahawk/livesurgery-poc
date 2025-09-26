import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, SendHorizontal } from "lucide-react";

/** Small trigger button (now in brand teal) */
export function LiveChatButton({ onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 py-1 rounded text-white shadow-sm
                  bg-[#15B8A6] hover:bg-[#12a291] focus-visible:outline-none
                  focus-visible:ring-2 focus-visible:ring-[#15B8A6] ${className}`}
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
          <MessageSquare className="h-5 w-5 text-[#15B8A6]" aria-hidden />
          <span>Live Chat</span>
        </h2>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15B8A6] rounded"
          aria-label="Close chat panel"
          title="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div ref={chatRef} className="overflow-y-auto h-[70%] space-y-2 pr-1">
        {messages.map((msg, idx) => {
          const mine = msg.sender === role;
          return (
            <div
              key={idx}
              className={[
                "p-2 rounded border",
                mine
                  ? "bg-[#CFF4EC] border-[#15B8A6]/30"
                  : "bg-slate-100 border-slate-200",
              ].join(" ")}
            >
              <strong className="block text-[11px] text-slate-600">{msg.sender}</strong>
              <span className="text-sm">{msg.text}</span>
            </div>
          );
        })}
      </div>

      {/* Input */}
      {role !== "viewer" && (
        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <input
            type="text"
            className="flex-1 border rounded px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15B8A6]"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-3 py-1 rounded text-white shadow-sm
                       bg-[#15B8A6] hover:bg-[#12a291] focus-visible:outline-none
                       focus-visible:ring-2 focus-visible:ring-[#15B8A6]"
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
