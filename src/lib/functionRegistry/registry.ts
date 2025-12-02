/**
 * 函数注册表
 * 集中管理所有可调用的本地方法
 */

import { FunctionDefinition, FunctionCall, JSONSchema } from './types';
import { fileOperations } from './functions/fileOperations';
import { calculator } from './functions/calculator';
import { apiCalls } from './functions/apiCalls';
import { dataProcessing } from './functions/dataProcessing';
import { productSearch } from './functions/productSearch';

class FunctionRegistry {
  private functions: Map<string, FunctionDefinition> = new Map();

  constructor() {
    // 注册所有函数
    this.registerFunctions(fileOperations);
    this.registerFunctions(calculator);
    this.registerFunctions(apiCalls);
    this.registerFunctions(dataProcessing);
    this.registerFunctions(productSearch);
  }

  /**
   * 注册函数列表
   */
  private registerFunctions(functions: FunctionDefinition[]) {
    functions.forEach((func) => {
      this.functions.set(func.name, func);
    });
  }

  /**
   * 获取所有函数的OpenAI格式定义
   */
  getOpenAIFunctions(): Array<{
    name: string;
    description: string;
    parameters: JSONSchema;
  }> {
    return Array.from(this.functions.values()).map((func) => ({
      name: func.name,
      description: func.description,
      parameters: func.parameters,
    }));
  }

  /**
   * 执行函数调用
   */
  async executeFunction(
    name: string,
    args: Record<string, unknown>,
    callId: string
  ): Promise<FunctionCall> {
    const func = this.functions.get(name);
    if (!func) {
      throw new Error(`Function ${name} not found`);
    }

    const call: FunctionCall = {
      id: callId,
      name,
      arguments: args,
      timestamp: Date.now(),
      status: 'executing',
    };

    try {
      const startTime = Date.now();
      const result = await func.handler(args);
      const executionTime = Date.now() - startTime;

      call.status = 'completed';
      call.result = result;
      call.executionTime = executionTime;
    } catch (error) {
      call.status = 'failed';
      call.error =
        error instanceof Error ? error.message : String(error);
      call.executionTime = Date.now() - call.timestamp;
    }

    return call;
  }

  /**
   * 获取函数定义
   */
  getFunction(name: string): FunctionDefinition | undefined {
    return this.functions.get(name);
  }

  /**
   * 获取所有函数名称
   */
  getAllFunctionNames(): string[] {
    return Array.from(this.functions.keys());
  }
}

// 导出单例
export const functionRegistry = new FunctionRegistry();
