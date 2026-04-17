import express from "express";
import cors from "cors";
import { createMcpServer } from "./mcp-server.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse";

const server = express();
server.use(express.json());
server.use(cors());

const transports: Record<string, SSEServerTransport> = {};

server.get('/mcp', async (req, res) => {
    try{
        const transport = new SSEServerTransport('/mcp-message', res);

        const sessionId = transport.sessionId;
        transports[sessionId] = transport;

        transport.onclose = () => {
            delete transports[sessionId];
        }

        const mcpServer = createMcpServer();
        await mcpServer.connect(transport);

        console.log('Session ID', sessionId);

    } catch (error) {
        console.error(error);
    }

});

server.post('/mcp-message', async (req, res)=> {
    const sessionId = req.query['sessionId'] as string | undefined;

    if(!sessionId){
        res.status(400).send('Missing sessionID pameter');
        return;
    }

    const transport = transports[sessionId];
    if(transport){
        res.status(400).send('Session not founf');
        return;
    }

    await transport.handlePostMessage(req, res, req.body);


});

server.listen(5000, () => {
    console.log('Server on port 5000');
});


