import React, { useState, useEffect, useRef } from 'react';
import {
  Grid,
  Column,
  TextInput,
  Button,
  Tile,
  InlineNotification,
  Loading,
  Tag,
  Header,
  HeaderName,
  Content,
} from '@carbon/react';
import { Send, Portfolio, Microphone, MicrophoneOff, AiGenerate, Close } from '@carbon/icons-react';
import { WatsonxAi } from '@carbon/pictograms-react';
import { marked } from "marked";
import DOMPurify from "dompurify";
import "github-markdown-css/github-markdown.css";
import Prism from "prismjs";
import "prismjs/themes/prism.css";

const MAX_MESSAGE_LENGTH = 1000;
const MAX_MESSAGES = 50;
const MAX_STORED_MESSAGES = 50;

// Add login_id to STORAGE_KEY
const getUserSpecificStorageKey = (loginId) => `career_guidance_chat_${loginId}`;

const UserLLMChat = () => {
  // Get login_id from session/context
  const [loginId, setLoginId] = useState(null);
  
  useEffect(() => {
    // Fetch login_id when component mounts
    const fetchLoginId = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/check-session', {
          credentials: 'include'
        });
        const data = await response.json();
        if (data.login_id) {
          setLoginId(data.login_id);
        }
      } catch (error) {
        console.error('Error fetching login ID:', error);
      }
    };
    fetchLoginId();
  }, []);

  // Use user-specific storage key
  const storageKey = loginId ? getUserSpecificStorageKey(loginId) : null;
  
  // Initialize messages with user-specific storage
  const [messages, setMessages] = useState(() => {
    if (!storageKey) return [];
    const savedMessages = localStorage.getItem(storageKey);
    return savedMessages ? JSON.parse(savedMessages) : [];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasWelcomeMessage, setHasWelcomeMessage] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported] = useState('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!hasWelcomeMessage && messages.length === 0) {
      const hour = new Date().getHours();
      let greeting = "Good evening";
      if (hour < 12) greeting = "Good morning";
      else if (hour < 18) greeting = "Good afternoon";

      const welcomeMessage = {
        text: `${greeting}! I'm your Career Guidance AI assistant. How can I help you today?`,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages([welcomeMessage]);
      setHasWelcomeMessage(true);
      localStorage.setItem(storageKey, JSON.stringify([welcomeMessage]));
    }
  }, [hasWelcomeMessage, messages.length, storageKey]);

  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(messages.slice(-MAX_STORED_MESSAGES)));
    }
  }, [messages, storageKey]);

  const handleError = (error) => {
    const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred';
    setError(errorMessage);
    addMessage({
      text: `Error: ${errorMessage}`,
      sender: "bot",
      format: "text",
      timestamp: new Date().toLocaleTimeString(),
      isError: true
    });
  };

  const addMessage = (newMessage) => {
    setMessages(prevMessages => {
      const updatedMessages = [...prevMessages, newMessage].slice(-MAX_MESSAGES);
      localStorage.setItem(storageKey, JSON.stringify(updatedMessages));
      return updatedMessages;
    });
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    setError(null);
    setLoading(true);

    const timestamp = new Date().toLocaleTimeString();
    addMessage({ text: input, sender: 'user', timestamp });

    try {
      const response = await fetch('http://localhost:5001/v1/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: input }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      addMessage({ text: data.response, sender: 'bot', timestamp: new Date().toLocaleTimeString() });
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setHasWelcomeMessage(false);
    localStorage.removeItem(storageKey);
  };

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
        return DOMPurify.sanitize(marked(content));
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

  const LoadingIndicator = () => (
    <div className="typing-indicator">
      <AiGenerate size={16} />
      <span>AI is thinking...</span>
    </div>
  );

  const startListening = () => {
    if (!speechSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const Message = ({ message }) => {
    return (
      <div className={`message-group ${message.sender}`}>
        <div className="message-bubble">
          <div
            className="message-content"
            dangerouslySetInnerHTML={{
              __html: formatContent(message.text, message.format),
            }}
          />
          <div className="message-meta">
            <span className="message-time">{message.timestamp}</span>
            {message.sender === 'bot' && (
              <Tag type="blue" size="sm">
                AI
              </Tag>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Content className="chat-content" style={{ padding: '1rem' }}>
      <Grid fullWidth className="chat-container">
        <Column lg={16} md={8} sm={4}>
          <Tile className="chat-tile" style={{
            position: 'fixed',
            top: '100px', // Account for header and padding
            left: '57%',
            transform: 'translateX(-50%)',
            width: '95%',
            maxWidth: '1200px',
            height: 'calc(100vh - 180px)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            backgroundColor: 'var(--cds-layer)',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
            zIndex: 100
            }}>
            <style>
              {`
              .message-content.markdown-body {
                font-size: 14px;
                line-height: 1.6;
                color: var(--cds-text-primary);
              }

              .message-content.markdown-body pre {
                margin: 1em 0;
                padding: 1em;
                overflow-x: auto;
                background: var(--cds-background-selected) !important;
                border-radius: 4px;
              }

              .message-content.markdown-body code {
                font-family: 'IBM Plex Mono', monospace;
                font-size: 85%;
              }

              .message-content.markdown-body p {
                margin: 0.5em 0;
              }

              .message-content.markdown-body ul,
              .message-content.markdown-body ol {
                margin: 0.5em 0;
                padding-left: 1.5em;
              }

              .empty-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 1rem;
                padding: 2rem;
                text-align: center;
                color: var(--cds-text-helper);
              }

              .message-group {
                display: flex;
                flex-direction: column;
                max-width: 85%;
              }

              .message-group.user {
                align-self: flex-end;
              }

              .message-group.bot {
                align-self: flex-start;
              }

              .message-bubble {
                padding: 0.75rem 1rem;
                border-radius: 1rem;
                background: var(--cds-layer-hover);
                box-shadow: 0 1px 2px rgba(0,0,0,0.1);
              }

              .message-meta {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin-top: 0.5rem;
                font-size: 0.75rem;
                color: var(--cds-text-helper);
              }

              .typing-indicator {
                padding: 0.5rem;
                font-size: 0.875rem;
                color: var(--cds-text-helper);
                font-style: italic;
                display: flex;
                align-items: center;
                gap: 0.5rem;
              }

              .empty-state h4 {
                margin: 0;
                color: var(--cds-text-primary);
              }

              .empty-state p {
                margin: 0;
                color: var(--cds-text-helper);
              }

              .llm-chat-modal {
                --chat-max-height: calc(100vh - 180px);
              }

              .chat-container {
                display: flex;
                flex-direction: column;
                height: 100%;
                overflow: hidden;
              }

              .message-group.bot .message-bubble {
                background: var(--cds-layer-selected);
                border-top-left-radius: 0;
              }

              .message-group.user .message-bubble {
                background: var(--cds-layer-selected-hover);
                border-top-right-radius: 0;
              }

              .input-row {
                display: flex;
                gap: 0.5rem;
                align-items: flex-start;
              }
              `}
            </style>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              padding: '1rem',
              borderBottom: '1px solid var(--cds-border-subtle)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <WatsonxAi size={32} />  
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}>
                  <span style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: 'var(--cds-text-primary)'
                  }}>
                    Career Guidance AI
                  </span>
                  <span style={{
                    fontSize: '0.875rem',
                    color: 'var(--cds-text-helper)'
                  }}>
                    Powered by Google Gemma
                  </span>
                </div>
              </div>
              <Button
                kind="ghost"
                size="sm"
                onClick={handleClearChat}
                disabled={messages.length === 0}
                renderIcon={Close}
              >
                Clear Chat
              </Button>
            </div>
            <div className="messages-container">
              {messages.length === 0 ? (
                <div className="empty-state">
                  <WatsonxAi size={32} />
                  <h4>Start a Conversation</h4>
                  <p>Ask me anything!</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <Message key={idx} message={msg} />
                ))
              )}
              {loading && (
                <LoadingIndicator />
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="input-container" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1rem',
              position: 'relative',
              borderTop: '1px solid var(--cds-border-subtle)',

              width: '100%',
              minHeight: '80px'
            }}>
              <div style={{
                display: 'flex',
                flexGrow: 1,
                position: 'relative'
              }}>
                <TextInput
                  id="chatInput"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  disabled={loading}
                  maxLength={MAX_MESSAGE_LENGTH}
                  aria-label="Chat message input"
                  role="textbox"
                  aria-multiline="false"
                  style={{ width: '100%' }}
                />
                <span style={{
                  position: 'absolute',
                  bottom: '0.25rem',
                  right: '0.5rem',
                  fontSize: '0.75rem',
                  color: 'var(--cds-text-helper)'
                }}>
                  {input.length}/{MAX_MESSAGE_LENGTH}
                </span>
              </div>
              {speechSupported && (
                <Button
                  hasIconOnly
                  renderIcon={isListening ? MicrophoneOff : Microphone}
                  iconDescription={isListening ? "Stop listening" : "Start voice input"}
                  onClick={startListening}
                  disabled={loading}
                  kind={isListening ? "danger" : "secondary"}
                  size="md"
                  aria-label={isListening ? "Stop voice input" : "Start voice input"}
                  style={{
                    flexShrink: 0,
                    height: '40px',
                    width: '40px',
                    minHeight: '40px'
                  }}
                />
              )}
              <Button
                hasIconOnly
                renderIcon={Send}
                iconDescription="Send message"
                onClick={handleSend}
                disabled={!input.trim() || loading}
                kind="primary"
                size="md"
                aria-label="Send message"
                style={{
                  flexShrink: 0,
                  height: '40px',
                  width: '40px',
                  minHeight: '40px'
                }}
              />
            </div>
            {error && (
              <InlineNotification
                kind="error"
                title="Error"
                subtitle={error}
                onCloseButtonClick={() => setError(null)}
              />
            )}
          </Tile>
        </Column>
      </Grid>
    </Content>
  );
};

export default UserLLMChat;


