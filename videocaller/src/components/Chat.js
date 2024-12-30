import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addMessage } from '../slices/chatSlice';
import webSocketService from '../utils/WebSocketService';

const Chat = () => {
  const [message, setMessage] = useState('');
  const messages = useSelector((state) => state.chat.messages);
  const dispatch = useDispatch();

  const sendMessage = () => {
    if (message.trim() === '') return;

    const chatMessage = { user: 'Me', text: message };
    webSocketService.sendMessage({ type: 'chat', message: chatMessage }); // Send via WebSocket
    dispatch(addMessage(chatMessage)); // Add to Redux store
    setMessage(''); // Clear input field
  };

  return (
    <div>
      <h2>Chat</h2>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>
            {msg.user}: {msg.text}
          </li>
        ))}
      </ul>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message"
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;
