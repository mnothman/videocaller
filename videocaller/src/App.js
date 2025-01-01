import './App.css';
import React, { useEffect, useState, useRef } from "react";
import webSocketService from "./utils/WebSocketService";
import Chat from "./components/Chat";
import { useDispatch } from 'react-redux';
import { addMessage } from './slices/chatSlice';

function App() {
  const [messages, setMessages] = useState([]);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const peerConnections = useRef({});

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      console.log("Available devices:", devices);
    });

    const connectWebSocket = async () => {
      try {
        await webSocketService.connect("ws://localhost:8080/ws"); 
        console.log("Connected to WebSocket");

        webSocketService.onMessage((data) => {
          const { type, offer, answer, candidate, sender } = data;
        
          if (type === "offer") {
            handleOffer(offer, sender);
          } else if (type === "answer") {
            handleAnswer(answer, sender);
          } else if (type === "candidate") {
            handleCandidate(candidate, sender);
          }
        });
      } catch (error) {
        console.error("Error connecting to WebSocket:", error);
      }
    }
        

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

    const setupPeerConnection = (userId) => {
     const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }], // Use public STUN server for now
    });
    
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        webSocketService.sendMessage({
          type: "candidate",
          candidate: event.candidate,
          target: userId,
        });
      }
    };

    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setRemoteStream(remoteStream); 
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    };
    
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        pc.current.addTrack(track, localStream);
      });
    }
  
    peerConnections.current[userId] = pc; 
    return pc;
  };

  const handleOffer = async (offer, sender) => {
    const pc = setupPeerConnection(sender);
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    webSocketService.sendMessage({ type: "answer", answer, target: sender });
  };
  
  const handleAnswer = async (answer, sender) => {
    const pc = peerConnections.current[sender];
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    }
  };

  const handleCandidate = (candidate, sender) => {
    const pc = peerConnections.current[sender];
    if (pc) {
      pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

    connectWebSocket();
    getMedia();
    setupPeerConnection();

    return () => {
      webSocketService.close();
      Object.values(peerConnections.current).forEach((pc) => pc.close());
      peerConnections.current = {}; // Reset all connections
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