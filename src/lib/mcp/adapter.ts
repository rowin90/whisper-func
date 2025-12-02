/**
 * MCP适配器
 * 将函数注册表适配为MCP工具格式
 */

import { functionRegistry } from '../functionRegistry/registry';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

/**
 * 将函数注册表转换为MCP工具列表
 */
export function registryToMCPTools(): Tool[] {
  const functions = functionRegistry.getOpenAIFunctions();

  return functions.map((fn) => ({
    name: fn.name,
    description: fn.description,
    inputSchema: {
      type: 'object',
      properties: fn.parameters.properties || {},
      required: fn.parameters.required || [],
      ...(fn.parameters.description && {
        description: fn.parameters.description,
      }),
    },
  }));
}

/**
 * 获取所有MCP工具名称
 */
export function getMCPToolNames(): string[] {
  return functionRegistry.getAllFunctionNames();
}

/**
 * 检查工具是否存在
 */
export function hasMCPTool(name: string): boolean {
  return functionRegistry.getFunction(name) !== undefined;
}
