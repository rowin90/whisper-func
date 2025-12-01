/**
 * 聊天相关类型定义
 */

import type { FunctionCall } from '../lib/functionRegistry/types';

export type InputMode = 'text' | 'voice';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  functionCalls?: FunctionCall[];
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  inputMode: InputMode;
  currentFunctionCalls: FunctionCall[];
}
