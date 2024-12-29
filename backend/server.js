const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { initMediasoup, router } = require("./mediasoupServer");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

(async () => {
  // Initialize MediaSoup
  await initMediasoup();

  // Handle WebSocket connections
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("create-transport", async (_, callback) => {
      const transport = await router.createWebRtcTransport({
        listenIps: [{ ip: "127.0.0.1", announcedIp: null }], // Replace with your server's public IP
        enableUdp: true,
        enableTcp: true,
        preferUdp: true,
      });

      console.log(`WebRTC Transport created for client: ${socket.id}`);
      callback({
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
      });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  // Start the server
  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
})();
