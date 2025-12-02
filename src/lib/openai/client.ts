/**
 * OpenAI客户端封装
 */

import OpenAI from 'openai';
import { functionRegistry } from '../functionRegistry/registry';

if (!process.env.OPENAI_API_KEY) {
  console.warn('警告: OPENAI_API_KEY 环境变量未设置');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  baseURL: process.env.OPENAI_BASE_URL,
});

/**
 * 创建聊天消息
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'function' | 'tool';
  content?: string | null;
  name?: string;
  function_call?: {
    name: string;
    arguments: string;
  };
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
  tool_call_id?: string;
}

/**
 * System Prompt - 翻译指令
 */
const SYSTEM_PROMPT = `你是一个智能助手，可以帮助用户调用各种本地函数。

重要规则：
1. **语言翻译规则**：
   - 当用户使用中文输入时，你需要将中文关键词翻译成英文用于函数调用
   - 函数调用的参数必须使用英文（如函数名、参数值等）
   - 但最终回复给用户时，请使用中文

2. **翻译示例**：
   - 用户说："搜索氧气传感器" → 调用函数时使用 keyword: "Oxygen Sensor"
   - 用户说："帮我计算 123 + 456" → 调用函数时使用 expression: "123 + 456"
   - 用户说："读取 package.json 文件" → 调用函数时使用 filePath: "package.json"
   - 用户说："获取当前时间" → 调用函数时使用 get_current_time

3. **输出规则**：
   - 函数调用的参数使用英文
   - 最终回复给用户的内容使用中文
   - 如果用户使用英文输入，则保持英文不变

4. **函数调用**：
   - 仔细分析用户需求，判断是否需要调用函数
   - 调用函数时，确保参数值使用英文（如果是关键词、文件名等）
   - 函数执行后，用中文向用户解释结果`;

/**
 * 调用OpenAI API进行聊天
 */
export async function chatWithFunctions(messages: ChatMessage[]) {
  const functions = functionRegistry.getOpenAIFunctions();

  // 构建消息列表，确保第一条是system message
  const messagesWithSystem: ChatMessage[] = [
    {
      role: 'system',
      content: SYSTEM_PROMPT,
    },
    ...messages,
  ];

  // 转换消息格式，确保符合OpenAI API要求
  const formattedMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
    messagesWithSystem
      .map((msg) => {
        // 处理tool角色消息
        if (msg.role === 'tool') {
          return {
            role: 'tool',
            tool_call_id: msg.tool_call_id!,
            content: msg.content || '',
          } as OpenAI.Chat.Completions.ChatCompletionToolMessageParam;
        }

        // 处理assistant角色消息
        if (msg.role === 'assistant') {
          const assistantMsg: OpenAI.Chat.Completions.ChatCompletionAssistantMessageParam =
            {
              role: 'assistant',
              content: msg.content ?? '',
            };

          // 如果有tool_calls，添加tool_calls字段
          if (msg.tool_calls && msg.tool_calls.length > 0) {
            assistantMsg.tool_calls = msg.tool_calls.map((tc) => ({
              id: tc.id,
              type: 'function' as const,
              function: {
                name: tc.function.name,
                arguments: tc.function.arguments,
              },
            }));
          }

          // 如果有function_call（旧API兼容），添加function_call字段
          if (msg.function_call) {
            assistantMsg.function_call = {
              name: msg.function_call.name,
              arguments: msg.function_call.arguments,
            };
          }

          return assistantMsg;
        }

        // 处理system和user角色消息
        if (msg.role === 'system' || msg.role === 'user') {
          return {
            role: msg.role,
            content: msg.content ?? '',
            ...(msg.name && { name: msg.name }),
          } as OpenAI.Chat.Completions.ChatCompletionSystemMessageParam | OpenAI.Chat.Completions.ChatCompletionUserMessageParam;
        }

        // 处理function角色消息（旧API兼容）
        if (msg.role === 'function') {
          return {
            role: 'function',
            name: msg.name!,
            content: msg.content || '',
          } as OpenAI.Chat.Completions.ChatCompletionFunctionMessageParam;
        }

        // 默认情况
        return {
          role: msg.role,
          content: msg.content ?? '',
        } as OpenAI.Chat.Completions.ChatCompletionMessageParam;
      })
      .filter((msg) => {
        // 过滤掉无效的消息
        if (msg.role === 'tool') {
          const toolMsg = msg as OpenAI.Chat.Completions.ChatCompletionToolMessageParam;
          return !!toolMsg.tool_call_id && toolMsg.content !== undefined;
        }
        // 其他消息必须有content（不能为null）
        return (
          msg.content !== undefined &&
          msg.content !== null &&
          typeof msg.content === 'string'
        );
      });

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: formattedMessages,
    tools:
      functions.length > 0
        ? functions.map((func) => ({
            type: 'function' as const,
            function: {
              name: func.name,
              description: func.description,
              parameters: func.parameters as unknown as Record<string, unknown>,
            },
          }))
        : undefined,
    tool_choice: functions.length > 0 ? 'auto' : undefined,
    temperature: 0.7,
  });

  return response;
}
