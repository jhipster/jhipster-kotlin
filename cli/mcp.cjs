#!/usr/bin/env node

(async () => {
    const { startMcpServer } = await import('./mcp-server.js');
    await startMcpServer();
})();
