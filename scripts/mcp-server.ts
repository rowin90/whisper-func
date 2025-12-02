#!/usr/bin/env node
/**
 * MCP服务器独立运行脚本
 * 可以作为独立进程运行，通过stdio与MCP客户端通信
 */

import { MCPServer } from '../src/lib/mcp/server';

async function main() {
  const server = new MCPServer();

  try {
    await server.start();
  } catch (error) {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  }

  // 处理进程退出
  process.on('SIGINT', async () => {
    await server.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await server.stop();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
