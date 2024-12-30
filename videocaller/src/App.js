import logo from './logo.svg';
import './App.css';
import React, { useEffect, useState } from "react";
import webSocketService from "./utils/WebSocketService";


function App() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        await webSocketService.connect("ws://localhost:8080/ws"); // Replace with your backend WebSocket URL
        console.log("Connected to WebSocket");

        webSocketService.onMessage((data) => {
          console.log("Message received:", data);
          setMessages((prevMessages) => [...prevMessages, data]);
        });

        // Example delete later
        webSocketService.sendMessage({ type: "greeting", message: "Hello, server!" });
      } catch (error) {
        console.error("Failed to connect to WebSocket", error);
      }
    };

    connectWebSocket();

    return () => {
      webSocketService.close();
    };
  }, []);

  return (
    <div className="App">
      <h1>WebSocket Messages</h1>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{JSON.stringify(msg)}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;