// util to handle websocket connection for frontend to backend communication
class WebSocketService {
    constructor() {
      this.socket = null;
    }
  
    connect(url) {
      return new Promise((resolve, reject) => {
        this.socket = new WebSocket(url);
  
        this.socket.onopen = () => {
          console.log("WebSocket connected");
          resolve();
        };
  
        this.socket.onerror = (error) => {
          console.error("WebSocket error", error);
          reject(error);
        };
  
        this.socket.onclose = () => {
          console.log("WebSocket disconnected");
        };
      });
    }
  
    sendMessage(message) {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify(message));
      } else {
        console.error("WebSocket is not open");
      }
    }
  
    onMessage(callback) {
      if (this.socket) {
        this.socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          callback(data);
        };
      }
    }
  
    close() {
      if (this.socket) {
        this.socket.close();
      }
    }
  }
  
  const webSocketService = new WebSocketService();
  export default webSocketService;
  