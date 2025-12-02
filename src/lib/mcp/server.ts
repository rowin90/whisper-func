/**
 * MCP服务器
 * 实现Model Context Protocol服务器
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { functionRegistry } from '../functionRegistry/registry';

export class MCPServer {
  private server: McpServer;

  constructor() {
    this.server = new McpServer(
      {
        name: 'whisper-func-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.registerTools();
  }

  /**
   * 注册所有工具
   */
  private registerTools() {
    const functions = functionRegistry.getOpenAIFunctions();

    // 为每个函数注册工具
    functions.forEach((fn) => {
      this.server.registerTool(
        fn.name,
        {
          description: fn.description,
          // 使用类型断言，因为我们的JSONSchema格式与MCP兼容
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          inputSchema: fn.parameters as any,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async (args: any, extra: any) => {
          try {
            // 执行函数
            const callId =
              extra?.request?.id ||
              `mcp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const result = await functionRegistry.executeFunction(
              fn.name,
              args as Record<string, unknown>,
              callId
            );

            // 返回结果
            if (result.status === 'completed') {
              return {
                content: [
                  {
                    type: 'text' as const,
                    text: JSON.stringify({
                      success: true,
                      result: result.result,
                      executionTime: result.executionTime,
                    }),
                  },
                ],
              } as CallToolResult;
            } else {
              return {
                content: [
                  {
                    type: 'text' as const,
                    text: JSON.stringify({
                      success: false,
                      error: result.error,
                      executionTime: result.executionTime,
                    }),
                  },
                ],
                isError: true,
              } as CallToolResult;
            }
          } catch (error) {
            return {
              content: [
                {
                  type: 'text' as const,
                  text: JSON.stringify({
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                  }),
                },
              ],
              isError: true,
            } as CallToolResult;
          }
        }
      );
    });
  }

  /**
   * 启动MCP服务器
   */
  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('MCP Server started on stdio');
  }

  /**
   * 停止MCP服务器
   */
  async stop() {
    await this.server.close();
  }
}
