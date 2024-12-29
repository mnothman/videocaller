// signaling.go
package controllers

import (
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"log"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func SignalingHandler(c *gin.Context) {
	// Upgrade HTTP connection to WebSocket
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("WebSocket upgrade error:", err)
		return
	}
	defer conn.Close()

	for {
		// Handle WebRTC signaling messages
		messageType, message, err := conn.ReadMessage()
		if err != nil {
			log.Println("WebSocket read error:", err)
			break
		}

		log.Printf("Received message: %s\n", message)

		// Echo back the message (for testing purposes)
		err = conn.WriteMessage(messageType, message)
		if err != nil {
			log.Println("WebSocket write error:", err)
			break
		}
	}
}
