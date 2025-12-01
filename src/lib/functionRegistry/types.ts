/**
 * 函数定义类型
 * 符合OpenAI Function Calling格式
 */

export interface JSONSchema {
  type: string;
  properties?: Record<string, JSONSchema>;
  required?: string[];
  description?: string;
  items?: JSONSchema;
  enum?: unknown[];
  default?: unknown;
}

export interface FunctionDefinition {
  name: string;
  description: string;
  parameters: JSONSchema;
  handler: (args: any) => Promise<any>;
}

export interface FunctionCall {
  id: string;
  name: string;
  arguments: any;
  timestamp: number;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  result?: any;
  error?: string;
  executionTime?: number;
}

export interface FunctionCallTree {
  call: FunctionCall;
  children?: FunctionCallTree[];
}
