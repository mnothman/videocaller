const express = require("express");
const mediasoup = require("mediasoup");
const config = require("./config");

let worker;
let router;

const app = express();
const PORT = 3000; 

async function createWorker() {
  worker = await mediasoup.createWorker();
  console.log(`MediaSoup worker created (PID: ${worker.pid})`);

  worker.on("died", () => {
    console.error("MediaSoup worker has died!");
    process.exit(1); 
  });

  return worker;
}

async function createRouter() {
  router = await worker.createRouter({
    mediaCodecs: config.mediaCodecs,
  });
  console.log("Router created");
  return router;
}

async function initMediasoup() {
  await createWorker();
  await createRouter();
}

// HTTP Route: Fetch RTP Capabilities
app.get("/rtpCapabilities", (req, res) => {
  if (!router) {
    return res.status(500).json({ error: "Router not ready" });
  }
  res.json(router.rtpCapabilities);
});

// Start the Express HTTP server
(async () => {
  await initMediasoup();

  app.listen(PORT, () => {
    console.log(`MediaSoup server running on port ${PORT}`);
  });
})();
