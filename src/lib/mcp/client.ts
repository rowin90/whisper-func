/**
 * MCP客户端
 * 在Next.js应用中使用MCP服务器
 */

import { functionRegistry } from '../functionRegistry/registry';
import type { FunctionCall } from '../functionRegistry/types';

/**
 * MCP客户端（内联实现）
 * 由于MCP服务器通常作为独立进程运行，这里提供一个内联客户端
 * 直接调用函数注册表，但保持MCP接口兼容
 */
export class MCPClient {
  /**
   * 列出所有可用工具
   */
  async listTools() {
    const functions = functionRegistry.getOpenAIFunctions();
    return functions.map((fn) => ({
      name: fn.name,
      description: fn.description,
      inputSchema: {
        type: 'object',
        properties: fn.parameters.properties || {},
        required: fn.parameters.required || [],
      },
    }));
  }

  /**
   * 调用工具
   */
  async callTool(
    name: string,
    args: Record<string, unknown>,
    callId?: string
  ): Promise<FunctionCall> {
    const id = callId || `mcp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    // 内联的 mcp 调用形式
    return await functionRegistry.executeFunction(name, args, id);
  }

  /**
   * 检查工具是否存在
   */
  hasTool(name: string): boolean {
    return functionRegistry.getFunction(name) !== undefined;
  }
}

// 导出单例
export const mcpClient = new MCPClient();
