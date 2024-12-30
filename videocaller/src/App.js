import './App.css';
import React, { useEffect, useState, useRef } from "react";
import webSocketService from "./utils/WebSocketService";
import Chat from "./components/Chat";
import { useDispatch } from 'react-redux';
import { addMessage } from '../slices/chatSlice'; // Adjust path if necessary

function App() {
  const [messages, setMessages] = useState([]);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      console.log("Available devices:", devices);
    });

    const connectWebSocket = async () => {
      try {
        await webSocketService.connect("ws://localhost:8080/ws"); // Replace with your backend WebSocket URL
        console.log("Connected to WebSocket");

        webSocketService.onMessage((data) => {
          console.log("Message received:", data);
          setMessages((prevMessages) => [...prevMessages, data]);

          // Handle different message types for WebRTC signaling
          if (data.type === "chat") {
            dispatch(addMessage(data.message)); // Add chat message to Redux store
          }
          else if (data.type === "offer") {
            handleOffer(data.offer);
          } else if (data.type === "answer") {
            handleAnswer(data.answer);
          } else if (data.type === "candidate") {
            handleCandidate(data.candidate);
          }
        });
      } catch (error) {
        console.error("Failed to connect to WebSocket", error);
      }
    };

    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing user media:", error);
      }
    };

    const setupPeerConnection = () => {
     peerConnection.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }], // Use a public STUN server for now
    });
    
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        webSocketService.sendMessage({
          type: "candidate",
          candidate: event.candidate,
        });
      }
    };

    peerConnection.current.ontrack = (event) => {
      const stream = new MediaStream();
      stream.addTrack(event.track);
      setRemoteStream(stream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    };
    
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, localStream);
      });
    }
  };

  const handleOffer = async (offer) => {
    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);
    webSocketService.sendMessage({ type: "answer", answer });
  };

  const handleAnswer = async (answer) => {
    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
  };

  const handleCandidate = (candidate) => {
    peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
  };

    connectWebSocket();
    getMedia();
    setupPeerConnection();

    return () => {
      webSocketService.close();
      if (peerConnection.current) {
        peerConnection.current.close();
      }
    };

  }, [localStream]);

  return (
    <div className="App">
      <h1>WebSocket caller</h1>
      <div>
      <video ref={localVideoRef} autoPlay playsInline muted></video>
      <video ref={remoteVideoRef} autoPlay playsInline></video>  
      </div>    
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{JSON.stringify(msg)}</li>
        ))}
      </ul>
      <Chat />
    </div>
  );
}

export default App;