"use client";
import { useState } from "react";
import Navbar from "./components/navbar";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [message, setMessage] = useState("");
  const [contextText, setContextText] = useState("");
  const [file, setFile] = useState(null);

  // Send context (text or file) to /api/indexing
  const handleContextSubmit = async () => {
    if (!contextText.trim() && !file) {
      alert("Please provide text or upload a file");
      return;
    }

    const formData = new FormData();
    if (contextText.trim()) {
      formData.append("text", contextText);
    }
    if (file) {
      formData.append("file", file);
    }

    try {
      setLoading(true);
      const res = await fetch("/api/indexing", {
        method: "POST",
        body: formData,
      });

      let data;
      try {
        data = await res.json();
      } catch (parseError) {
        const text = await res.text();
        throw new Error(
          `Server returned non-JSON: ${text.substring(0, 200)}...`
        );
      }

      if (!res.ok) throw new Error(data.error || "Failed to index context");

      alert(`Context submitted successfully! ${data.message}`);
      setContextText("");
      setFile(null);
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error("Full error:", error);
      alert("Error submitting context: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle chatting with /api/chat
  const handleChat = async () => {
    if (!message.trim()) return;

    setChatLoading(true);

    // Add user message
    const userMessage = { role: "user", content: message };
    setConversation((prev) => [...prev, userMessage]);
    setMessage("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      // Add AI response
      const aiMessage = { role: "assistant", content: data.response };
      setConversation((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        role: "assistant",
        content: "Error: " + error.message,
      };
      setConversation((prev) => [...prev, errorMessage]);
    }

    setChatLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleChat();
    }
  };

  const clearConversation = () => {
    setConversation([]);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="grid grid-cols-2 h-[calc(100vh-64px)]">
        {/* Left Side - Context Input */}
        <div className="border-r border-gray-800 p-6 flex flex-col">
          <h2 className="text-xl font-bold mb-4">Context Input</h2>

          <textarea
            value={contextText}
            onChange={(e) => setContextText(e.target.value)}
            placeholder="Paste your text context here..."
            className="flex-1 bg-gray-900 border border-gray-700 rounded p-3 text-white resize-none focus:outline-none focus:border-gray-500"
          />

          <div className="mt-4 mb-4">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="block w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gray-700 file:text-white hover:file:bg-gray-600"
            />
            {file && (
              <div className="mt-2 text-sm text-gray-400">
                Selected: {file.name}
              </div>
            )}
          </div>

          <button
            onClick={handleContextSubmit}
            disabled={(!contextText.trim() && !file) || loading}
            className="bg-white text-black px-6 py-3 rounded font-medium hover:bg-gray-200 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Submit Context"}
          </button>
        </div>

        {/* Right Side - Chat Interface */}
        <div className="p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Chat</h2>
            <button
              onClick={clearConversation}
              className="text-gray-400 hover:text-white text-sm"
            >
              Clear
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 bg-gray-900 border border-gray-700 rounded p-4 overflow-y-auto mb-4">
            {conversation.length === 0 ? (
              <div className="text-gray-500 text-center">
                Start a conversation...
              </div>
            ) : (
              conversation.map((msg, idx) => (
                <div
                  key={idx}
                  className={`mb-4 p-3 rounded ${
                    msg.role === "user"
                      ? "bg-gray-800 ml-8"
                      : "bg-gray-700 mr-8"
                  }`}
                >
                  <div className="text-xs text-gray-400 mb-1 capitalize">
                    {msg.role}
                  </div>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              ))
            )}
            {chatLoading && (
              <div className="bg-gray-700 mr-8 p-3 rounded">
                <div className="text-xs text-gray-400 mb-1">Assistant</div>
                <div>Thinking...</div>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="flex gap-2">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 bg-gray-900 border border-gray-700 rounded p-3 text-white resize-none h-12 focus:outline-none focus:border-gray-500"
            />
            <button
              onClick={handleChat}
              disabled={chatLoading || !message.trim()}
              className="bg-white text-black px-6 py-3 rounded font-medium hover:bg-gray-200 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {chatLoading ? "..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
