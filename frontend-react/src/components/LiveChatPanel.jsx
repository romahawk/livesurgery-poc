import { useState, useRef, useEffect } from "react";

export default function LiveChatPanel({ role, messages, onSendMessage, onClose }) {
  const [input, setInput] = useState("");
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput("");
  };

  return (
    <div className="fixed top-0 right-0 w-80 h-full bg-white shadow-lg p-4 border-l z-50">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">💬 Live Chat</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-red-500 text-xl">&times;</button>
      </div>

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
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
          >
            Send
          </button>
        </form>
      )}
    </div>
  );
}
