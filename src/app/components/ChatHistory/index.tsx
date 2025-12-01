'use client';

import { Card, Avatar } from 'antd';
import { ChatMessage } from '@/types/chat';
import { FunctionCall } from '@/lib/functionRegistry/types';

interface ChatHistoryProps {
  messages: ChatMessage[];
  onMessageClick?: (message: ChatMessage) => void;
}

export function ChatHistory({
  messages,
  onMessageClick,
}: ChatHistoryProps) {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (messages.length === 0) {
    return (
      <div
        style={{
          padding: '48px',
          textAlign: 'center',
          color: '#999',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
        <div>开始对话吧！你可以使用文本或语音输入。</div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '16px',
        height: '100%',
        overflow: 'auto',
      }}
    >
      {messages.map((message) => (
        <div
          key={message.id}
          style={{
            display: 'flex',
            flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
            gap: '12px',
            cursor: message.functionCalls ? 'pointer' : 'default',
          }}
          onClick={() => onMessageClick?.(message)}
        >
          <Avatar
            style={{
              background: message.role === 'user' ? '#1890ff' : '#52c41a',
              flexShrink: 0,
            }}
          >
            {message.role === 'user' ? '你' : 'AI'}
          </Avatar>
          <div
            style={{
              flex: 1,
              maxWidth: '70%',
            }}
          >
            <Card
              size="small"
              style={{
                background:
                  message.role === 'user' ? '#e6f7ff' : '#f6ffed',
                border:
                  message.functionCalls
                    ? '2px solid #1890ff'
                    : '1px solid #d9d9d9',
              }}
            >
              <div style={{ whiteSpace: 'pre-wrap', marginBottom: '8px' }}>
                {message.content}
              </div>
              {message.functionCalls && message.functionCalls.length > 0 && (
                <div
                  style={{
                    marginTop: '8px',
                    padding: '8px',
                    background: '#fff',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#1890ff',
                  }}
                >
                  🔧 调用了 {message.functionCalls.length} 个方法
                </div>
              )}
              <div
                style={{
                  marginTop: '8px',
                  fontSize: '12px',
                  color: '#999',
                }}
              >
                {formatTime(message.timestamp)}
              </div>
            </Card>
          </div>
        </div>
      ))}
    </div>
  );
}
