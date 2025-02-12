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
import { Send, User, Chat, Portfolio } from '@carbon/icons-react';
import './UserLLMChat.css';

const UserLLMChat = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setError(null);
    setLoading(true);

    const timestamp = new Date().toLocaleTimeString();
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: input, sender: 'user', timestamp },
    ]);

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
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: data.response, sender: 'bot', timestamp: new Date().toLocaleTimeString() },
      ]);
    } catch (error) {
      setError(error.message);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: `Error: ${error.message}`, sender: 'bot', timestamp: new Date().toLocaleTimeString() },
      ]);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  const formatContent = (content) => {
    return content.split('\n').map((str, index) => <p key={index}>{str}</p>);
  };

  return (
    <div className="bx--grid bx--grid--full-width chat-page">
      <Header aria-label="Career Guidance Chatbot Header" className="chat-header">
        <HeaderName prefix={<Portfolio size={32} />}>
          Career Guidance AI
        </HeaderName>
      </Header>

      <Content className="chat-content" style={{ padding: '1rem' }}>
        <Grid fullWidth className="chat-container">
          <Column lg={16} md={8} sm={4}>
            <Tile className="chat-tile">
              <div className="messages-container">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`message ${msg.sender}`}>
                    <div className="message-content">
                      {formatContent(msg.text)}
                    </div>
                    <div className="message-meta">
                      <span className="message-time">{msg.timestamp}</span>
                      {msg.sender === 'bot' && (
                        <Tag type="blue" size="sm">
                          AI
                        </Tag>
                      )}
                    </div>
                  </div>
                ))}
                {loading && <Loading description="Loading..." small />}
                <div ref={messagesEndRef} />
              </div>
              <div className="input-container">
                <TextInput
                  id="chatInput"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  disabled={loading}
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
    </div>
  );
};

export default UserLLMChat;