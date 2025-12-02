/**
 * AI聊天API路由
 * 处理用户消息，调用OpenAI API，执行函数调用
 */

import { NextRequest, NextResponse } from 'next/server';
import { chatWithFunctions, ChatMessage } from '@/lib/openai/client';
import { mcpClient } from '@/lib/mcp/client';
import { FunctionCall } from '@/lib/functionRegistry/types';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    // 转换消息格式
    const chatMessages: ChatMessage[] = messages.map((msg: {
      role: string;
      content?: string;
      name?: string;
      function_call?: { name: string; arguments: string };
    }) => ({
      role: msg.role as ChatMessage['role'],
      content: msg.content,
      name: msg.name,
      function_call: msg.function_call,
    }));

    // 调用OpenAI API
    const response = await chatWithFunctions(chatMessages);

    const assistantMessage = response.choices[0]?.message;
    if (!assistantMessage) {
      return NextResponse.json(
        { error: 'No response from OpenAI' },
        { status: 500 }
      );
    }

    const result: {
      message: {
        role: string;
        content: string | null;
        function_call?: { name: string; arguments: string };
      };
      functionCalls?: FunctionCall[];
      finishReason: string;
    } = {
      message: {
        role: assistantMessage.role,
        content: assistantMessage.content,
        ...(assistantMessage.function_call && {
          function_call: assistantMessage.function_call,
        }),
      },
      finishReason: response.choices[0]?.finish_reason || 'stop',
    };

    // 如果有工具调用，执行函数
    const toolCalls = assistantMessage.tool_calls;
    if (toolCalls && toolCalls.length > 0) {
      const functionCalls: FunctionCall[] = [];

      // 执行所有工具调用
      for (const toolCall of toolCalls) {
        try {
          // 处理不同类型的tool call
          if (toolCall.type === 'function') {
            const functionName = toolCall.function.name;
            const functionArgs = JSON.parse(
              toolCall.function.arguments || '{}'
            );
            const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // 通过MCP客户端执行函数
            const callResult = await mcpClient.callTool(
              functionName,
              functionArgs,
              callId
            );

            functionCalls.push(callResult);

            // 将工具调用结果添加到消息中
            // 注意：使用tool_calls时，content可以为空字符串，但不能为null
            chatMessages.push({
              role: 'assistant',
              content: '',
              tool_calls: [
                {
                  id: toolCall.id,
                  type: 'function',
                  function: {
                    name: functionName,
                    arguments: toolCall.function.arguments,
                  },
                },
              ],
            } as ChatMessage);

            chatMessages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify(callResult.result || callResult.error),
            } as ChatMessage);
          }
        } catch (error) {
          const toolCallName =
            toolCall.type === 'function' ? toolCall.function.name : 'unknown';
          const toolCallArgs =
            toolCall.type === 'function'
              ? toolCall.function.arguments
              : '{}';
          const errorCall: FunctionCall = {
            id: `error_${Date.now()}`,
            name: toolCallName,
            arguments: JSON.parse(toolCallArgs || '{}'),
            timestamp: Date.now(),
            status: 'failed',
            error: error instanceof Error ? error.message : String(error),
          };
          functionCalls.push(errorCall);
        }
      }

      // 再次调用OpenAI获取最终回复
      if (functionCalls.length > 0) {
        try {
          const finalResponse = await chatWithFunctions(chatMessages);
          const finalMessage = finalResponse.choices[0]?.message;

          result.message = {
            role: finalMessage?.role || 'assistant',
            content: finalMessage?.content || '',
          };
          result.functionCalls = functionCalls;
          result.finishReason =
            finalResponse.choices[0]?.finish_reason || 'stop';
        } catch (error) {
          // 即使最终调用失败，也返回函数调用结果
          result.functionCalls = functionCalls;
          result.message = {
            role: 'assistant',
            content: `已执行 ${functionCalls.length} 个函数调用，但获取最终回复时出错: ${
              error instanceof Error ? error.message : String(error)
            }`,
          };
        }
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
