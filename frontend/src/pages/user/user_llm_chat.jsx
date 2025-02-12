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
const STORAGE_KEY = 'career_guidance_chat';
const MAX_STORED_MESSAGES = 50;

const UserLLMChat = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem(STORAGE_KEY);
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify([welcomeMessage]));
    }
  }, [hasWelcomeMessage, messages.length]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED_MESSAGES)));
  }, [messages]);

  const handleError = (error) => {
    const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred';
    setError(errorMessage);
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        text: `Error: ${errorMessage}. Please try again.`,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
        isError: true
      }
    ]);
  };

  const addMessage = (newMessage) => {
    setMessages(prevMessages => {
      const updatedMessages = [...prevMessages, newMessage].slice(-MAX_MESSAGES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMessages));
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
    localStorage.removeItem(STORAGE_KEY);
  };

  const formatContent = (content) => {
    // Configure marked options
    marked.setOptions({
      highlight: function (code, lang) {
        if (Prism.languages[lang]) {
          return Prism.highlight(code, Prism.languages[lang], lang);
        }
        return code;
      },
      breaks: true,
      gfm: true
    });

    try {
      // Convert markdown to HTML and sanitize
      const sanitizedHtml = DOMPurify.sanitize(marked(content));
      return (
        <div 
          className="markdown-body"
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      );
    } catch (error) {
      console.error("Markdown parsing error:", error);
      return content.split('\n').map((str, index) => <p key={index}>{str}</p>);
    }
  };

  const renderLoadingState = () => (
    <div className="typing-indicator" style={{
      padding: '0.5rem',
      fontSize: '0.875rem',
      color: 'var(--cds-text-helper)',
      fontStyle: 'italic',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    }}>
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
                .markdown-body {
                  font-size: 14px;
                  line-height: 1.6;
                  background: none !important;
                  color: var(--cds-text-primary) !important;
                }

                .markdown-body pre {
                  padding: 1em;
                  border-radius: 4px;
                  overflow-x: auto;
                  background: var(--cds-background-selected) !important;
                  color: var(--cds-text-primary) !important;
                  border: 1px solid var(--cds-border-subtle);
                }

                .markdown-body code {
                  padding: 0.2em 0.4em;
                  border-radius: 3px;
                  font-size: 85%;
                  background: var(--cds-background-selected) !important;
                  color: var(--cds-text-primary) !important;
                }

                .markdown-body pre code {
                  padding: 0;
                  background: none !important;
                  color: var(--cds-text-primary) !important;
                  border: none;
                }

                /* Syntax highlighting colors optimized for both themes */
                .token.comment,
                .token.prolog,
                .token.doctype,
                .token.cdata {
                  color: var(--cds-text-helper) !important;
                }

                .token.function,
                .token.class-name {
                  color: var(--cds-support-02) !important;
                }

                .token.keyword,
                .token.boolean,
                .token.number {
                  color: var(--cds-support-03) !important;
                }

                .token.string,
                .token.char,
                .token.regex {
                  color: var(--cds-support-04) !important;
                }

                .token.operator,
                .token.entity,
                .token.url,
                .token.punctuation {
                  color: var(--cds-text-secondary) !important;
                }

                .markdown-body blockquote {
                  border-left: 4px solid var(--cds-border-strong);
                  margin: 0;
                  padding-left: 1em;
                  color: var(--cds-text-helper);
                }

                .markdown-body h1,
                .markdown-body h2,
                .markdown-body h3,
                .markdown-body h4,
                .markdown-body h5,
                .markdown-body h6 {
                  color: var(--cds-text-primary);
                  margin-top: 1.5rem;
                  margin-bottom: 1rem;
                }

                .markdown-body strong {
                  color: var(--cds-text-primary);
                }

                .markdown-body a {
                  color: var(--cds-link-primary);
                }

                .markdown-body ul,
                .markdown-body ol {
                  color: var(--cds-text-primary);
                  margin-left: 1.5rem;
                }

                .markdown-body li {
                  margin: 0.25rem 0;
                }

                .markdown-body table {
                  border-collapse: collapse;
                  width: 100%;
                  margin: 1em 0;
                }

                .markdown-body th,
                .markdown-body td {
                  border: 1px solid var(--cds-border-subtle);
                  padding: 0.5em;
                  text-align: left;
                  color: var(--cds-text-primary);
                }

                .markdown-body th {
                  background: var(--cds-background-selected);
                }
              `}
            </style>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              padding: '1rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <AiGenerate size={24} />
                <span style={{ fontSize: '1rem', fontWeight: '600' }}>Career Guidance AI</span>
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
            <div 
              className="messages-container" 
              role="log" 
              aria-live="polite"
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1rem',
                scrollBehavior: 'smooth',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                marginBottom: '0',
                height: 'calc(100% - 80px)' // Account for input container height
              }}
            >
              {messages.length === 0 ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '2rem',
                  textAlign: 'center',
                  color: 'var(--cds-text-helper)'
                }}>
                  <WatsonxAi size={32} />
                  <h4>Start a Conversation</h4>
                  <p>Ask me anything about career guidance!</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className={`message-group ${msg.sender}`} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    maxWidth: '85%',
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    marginBottom: '1rem'
                  }}>
                    <div className="message-bubble" style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '1rem',
                      background: msg.sender === 'bot' ? 'var(--cds-layer-selected)' : 'var(--cds-layer-selected-hover)',
                      borderTopRightRadius: msg.sender === 'user' ? 0 : '1rem',
                      borderTopLeftRadius: msg.sender === 'bot' ? 0 : '1rem',
                      boxShadow: '0 1px 2px rgba(255, 255, 255, 0)'
                    }}>
                      <div className="message-content">
                        {formatContent(msg.text)}
                      </div>
                      <div className="message-meta" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginTop: '0.5rem',
                        fontSize: '0.75rem',
                        color: 'var(--cds-text-helper)'
                      }}>
                        <span className="message-time">{msg.timestamp}</span>
                        {msg.sender === 'bot' && (
                          <Tag type="blue" size="sm">
                            AI
                          </Tag>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {loading && renderLoadingState()}
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