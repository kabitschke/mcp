import express from "express";
import cors from "cors";
import { createMcpServer } from "./mcp-server.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse";

const app = express();

app.use(express.json());
app.use(cors());

const transports = new Map<string, SSEServerTransport>();

// Endpoint para iniciar conexão SSE
app.get("/mcp", async (req, res) => {
  try {
    const transport = new SSEServerTransport("/mcp-message", res);

    const sessionId = transport.sessionId;
    transports.set(sessionId, transport);

    transport.onclose = () => {
      transports.delete(sessionId);
    };

    const mcpServer = createMcpServer();
    await mcpServer.connect(transport);

    console.log("Session ID:", sessionId);
  } catch (error) {
    console.error("Error on /mcp:", error);
    res.status(500).end();
  }
});

// Endpoint para receber mensagens
app.post("/mcp-message", async (req, res) => {
  try {
    const sessionId = req.query.sessionId as string | undefined;

    if (!sessionId) {
      return res.status(400).send("Missing sessionId parameter");
    }

    const transport = transports.get(sessionId);

    if (!transport) {
      return res.status(404).send("Session not found");
    }

    await transport.handlePostMessage(req, res, req.body);
  } catch (error) {
    console.error("Error on /mcp-message:", error);
    res.status(500).end();
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});