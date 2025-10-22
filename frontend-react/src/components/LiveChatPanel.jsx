import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, SendHorizontal } from "lucide-react";

/** Small trigger button (brand teal, works in both themes) */
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
    <div className="fixed top-0 right-0 w-80 h-full theme-panel p-4 border-l border-default z-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold inline-flex items-center gap-2 text-default">
          <MessageSquare className="h-5 w-5 text-[var(--ls-teal,#15B8A6)]" aria-hidden />
          <span>Live Chat</span>
        </h2>
        <button
          onClick={onClose}
          className="text-subtle hover:opacity-90 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ls-teal,#15B8A6)]"
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
                mine ? "border-[var(--ls-teal,#15B8A6)]/30" : "border-default",
              ].join(" ")}
              style={{
                background: mine ? "var(--elev)" : "var(--panel)",
              }}
            >
              <strong className="block text-[11px] text-subtle">{msg.sender}</strong>
              <span className="text-sm text-default">{msg.text}</span>
            </div>
          );
        })}
      </div>

      {/* Input */}
      {role !== "viewer" && (
        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <input
            type="text"
            className="searchbar flex-1 rounded px-2 py-1"
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
