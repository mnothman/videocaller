package main

import (
	"encoding/json" // Import the json package
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func main() {
	// Set up Gin router
	r := gin.Default()

	// API endpoint to get RTP Capabilities (from MediaSoup)
	r.GET("/rtpCapabilities", func(c *gin.Context) {
		rtpCapabilities, err := fetchRtpCapabilities()
		if err != nil {
			log.Println("Error fetching RTP capabilities:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch RTP capabilities"})
			return
		}
		c.JSON(http.StatusOK, rtpCapabilities)
	})

	// WebSocket endpoint for signaling
	r.GET("/ws", func(c *gin.Context) {
		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			log.Println("Failed to upgrade WebSocket:", err)
			return
		}
		defer conn.Close()

		handleWebSocket(conn)
	})

	// Start the server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Server running on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}

// Fetch RTP Capabilities from MediaSoup Node.js server
func fetchRtpCapabilities() (map[string]interface{}, error) {
	resp, err := http.Get("http://localhost:3000/rtpCapabilities") // Node.js MediaSoup server endpoint
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var rtpCapabilities map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&rtpCapabilities); err != nil {
		return nil, err
	}

	return rtpCapabilities, nil
}

func handleWebSocket(conn *websocket.Conn) {
	for {
		// Read messages from client
		_, msg, err := conn.ReadMessage()
		if err != nil {
			log.Println("Error reading WebSocket message:", err)
			break
		}

		// Parse the received message
		var message map[string]interface{}
		if err := json.Unmarshal(msg, &message); err != nil {
			log.Println("Error unmarshalling WebSocket message:", err)
			continue
		}

		log.Printf("Received WebSocket message: %v", message)

		// Handle signaling messages
		switch message["type"] {
		case "offer":
			log.Println("Handling SDP offer...")
			// Forward to MediaSoup server or process locally
		case "answer":
			log.Println("Handling SDP answer...")
		case "candidate":
			log.Println("Handling ICE candidate...")
		default:
			log.Println("Unknown message type")
		}

		// Testing delete later
		if err := conn.WriteMessage(websocket.TextMessage, msg); err != nil {
			log.Println("Error writing WebSocket message:", err)
			break
		}
	}
}

