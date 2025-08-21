"use client";
import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [message, setMessage] = useState("");
  const [contextText, setContextText] = useState("");
  const [file, setFile] = useState(null);

  // Send context (text or file) to /api/indexing
  const handleContextSubmit = async () => {
    const formData = new FormData();
    if (contextText.trim()) {
      formData.append("text", contextText);
    }
    if (file) {
      formData.append("file", file);
    }

    try {
      const res = await fetch("/api/indexing", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to index context");
      alert("Context submitted successfully!");
    } catch (error) {
      alert("Error submitting context: " + error.message);
    }
  };

  // Handle chatting with /api/chat
  const handleChat = async () => {
    if (!message.trim()) return;

    setLoading(true);

    // Add user message
    const userMessage = { role: "user", content: message };
    setConversation((prev) => [...prev, userMessage]);
    setMessage("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // <-- fixed typo here
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

    setLoading(false);
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
    
  );
}
