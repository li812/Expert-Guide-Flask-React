import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  TextInput,
  Button,
  Tag,
  Loading,
  Tooltip,
  InlineNotification,
} from "@carbon/react";
import {
  Send,
  Reset,
  Information,
  IbmWatsonxAssistant,
  AiGenerate,
  Close,
} from "@carbon/icons-react";
import { 
  WatsonxAi, 
} from '@carbon/pictograms-react';
import "./LLMChatBotSmallModal.css";
import { marked } from "marked";
import Prism from "prismjs";
import "prismjs/themes/prism.css"; // Import Prism CSS for styling

const LLMChatBotSmallModal = ({ open, setOpen, isFirstOpen }) => {
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleClose = () => {
    setOpen(false);
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isFirstOpen) {
      const greeting = getGreetingMessage();
      addMessage(greeting, "bot", "text", new Date().toLocaleTimeString());
    }
  }, [isFirstOpen]);

  const getGreetingMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning! How can I assist you today?";
    if (hour < 18) return "Good afternoon! How can I assist you today?";
    return "Good evening! How can I assist you today?";
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    setError(null);

    const timestamp = new Date().toLocaleTimeString();
    addMessage(input, "user", "text", timestamp);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5001/v1/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: input }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      addMessage(
        data.response,
        "bot",
        "markdown",
        new Date().toLocaleTimeString()
      );
    } catch (error) {
      setError(error.message);
      addMessage(
        `Error: ${error.message}`,
        "bot",
        "text",
        new Date().toLocaleTimeString()
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setupFormatControls();
  }, []);

  const formatContent = (content, format = "text") => {
    if (format === "markdown") {
      marked.setOptions({
        highlight: function (code, lang) {
          if (Prism.languages[lang]) {
            return Prism.highlight(code, Prism.languages[lang], lang);
          }
          return code;
        },
        breaks: true,
        gfm: true,
      });

      try {
        return marked(content);
      } catch (error) {
        console.error("Markdown parsing error:", error);
        return content;
      }
    } else {
      const div = document.createElement("div");
      div.textContent = content;
      return div.innerHTML;
    }
  };

  const addMessage = (content, sender, format = "text", timestamp) => {
    const newMessage = {
      text: content,
      sender: sender,
      format: format,
      timestamp: timestamp,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const setupFormatControls = () => {
    const formatSelect = document.getElementById("format");
    const prompt = document.getElementById("prompt");

    if (formatSelect && prompt) {
      formatSelect.addEventListener("change", () => {
        prompt.dataset.format = formatSelect.value;
        prompt.placeholder = `Type your ${formatSelect.value} here...`;
      });
    }
  };

  return (
    <Modal
      open={open}
      onRequestClose={handleClose}
      modalHeading={
        <div className="">
          <div className="chat-title">
          <AiGenerate size={24} />
            <span>Expert Guide Assistant</span>
          </div>
        </div>
      }
      size="sm"
      passiveModal
      className="llm-chat-modal floating-chat-modal"
      hasScrollingContent={false} // Ensure modal does not block background scrolling
    >
      <div className="chat-container">
        {error && (
          <InlineNotification
            kind="error"
            title="Error"
            subtitle={error}
            lowContrast
            hideCloseButton
          />
        )}

        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="empty-state">
              <WatsonxAi size={32} />
              <h4>Start a Conversation</h4>
              <p>Ask me anything!</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`message-group ${msg.sender}`}>
                <div className="message-bubble">
                  <div
                    className="message-content"
                    dangerouslySetInnerHTML={{
                      __html: formatContent(msg.text, msg.format),
                    }}
                  />
                  <div className="message-meta">
                    <span className="message-time">{msg.timestamp}</span>
                    {msg.sender === "bot" && (
                      <Tag type="blue" size="sm">
                        AI
                      </Tag>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="typing-indicator">I'm is thinking...</div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <div className="input-row">
            <TextInput
              id="chatInput"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) =>
                e.key === "Enter" && !e.shiftKey && handleSend()
              }
              disabled={loading}
              maxLength={1000}
            />
            <Button
              hasIconOnly
              renderIcon={Send}
              iconDescription="Send message"
              onClick={handleSend}
              disabled={!input.trim() || loading}
              kind="primary"
              size="md"
            />
          </div>
          <span className="char-count">{input.length}/1000</span>
        </div>
      </div>
    </Modal>
  );
};

export default LLMChatBotSmallModal;
