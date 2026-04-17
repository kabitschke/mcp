import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
const server = new McpServer({
    name: "hello-node",
    version: "1.0.0"
});

//Registrar as tools

server.registerTool(
    "calculate_bml",
    {
      title: "Calculate BML",
      description: "Calculates the bml of the user receiving his height (in meters) and weight (in kilograms).",
      inputSchema: {
        weightKg: z.number().describe("The weight of the user in kilograms"),
        heightM: z.number().describe("The height of the user in meters")  
      }
    },
    async ({ weightKg, heightM }) => {
      const bml = weightKg / (heightM * heightM);
      return {
        content: [{ type: "text", text: bml.toString() }]
      };
    }
  );

const transport = new StdioServerTransport();
await server.connect(transport);