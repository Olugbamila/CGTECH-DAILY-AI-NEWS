import { Server } from "@modelcontextprotocol/sdk";

const server = new Server({
  name: "hello-world-server",
  version: "1.0.0",
});

server.tool("sayHello", {
  description: "Returns a greeting message",
  inputSchema: {
    type: "object",
    properties: {
      name: { type: "string" }
    },
    required: ["name"]
  },
  handler: async ({ name }) => {
    return { message: `Hello, ${name}! Welcome to MCP.` };
  }
});

server.start();