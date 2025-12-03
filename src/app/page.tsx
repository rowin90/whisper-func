'use client';

import { useState, useCallback, useEffect } from 'react';
import { Layout, Spin, message, Drawer, Button } from 'antd';
import { InputPanel } from './components/InputPanel';
import { ChatHistory } from './components/ChatHistory';
import { CallVisualization } from './components/CallVisualization';
import type { ChatMessage } from '@/types/chat';
import type { FunctionCall } from '@/lib/functionRegistry/types';

const { Header, Content, Sider } = Layout;

const STORAGE_KEY = 'whisper-func-chat-messages';

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(
    null
  );
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 从 localStorage 加载聊天记录
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem(STORAGE_KEY);
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch (error) {
      console.error('加载聊天记录失败:', error);
    }
  }, []);

  // 保存聊天记录到 localStorage
  useEffect(() => {
    try {
      if (messages.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } else {
        // 如果消息为空，清除存储
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error('保存聊天记录失败:', error);
      // 如果存储空间不足，尝试清理旧数据
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        message.warning('存储空间不足，请清空部分聊天记录');
      }
    }
  }, [messages]);

  // 检测移动设备
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSubmit = useCallback(
    async (userInput: string) => {
      if (!userInput.trim() || isLoading) return;

      // 添加用户消息
      const userMessage: ChatMessage = {
        id: `msg_${Date.now()}_user`,
        role: 'user',
        content: userInput,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        // 准备消息历史
        const chatMessages = [
          ...messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          {
            role: 'user' as const,
            content: userInput,
          },
        ];

        // 调用API（添加超时处理）
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000 * 2); // 60秒超时

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: chatMessages,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '请求失败');
        }

        const data = await response.json();

        // 添加AI回复
        const assistantMessage: ChatMessage = {
          id: `msg_${Date.now()}_assistant`,
          role: 'assistant',
          content: data.message.content || '',
          timestamp: Date.now(),
          functionCalls: data.functionCalls || [],
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // 如果有函数调用，显示提示
        if (data.functionCalls && data.functionCalls.length > 0) {
          message.success(
            `成功调用了 ${data.functionCalls.length} 个方法`
          );
        }
      } catch (error) {
        console.error('Chat error:', error);

        let errorMessage = '发送消息失败，请稍后重试';
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            errorMessage = '请求超时，请稍后重试';
          } else if (error.message.includes('Failed to fetch')) {
            errorMessage = '网络连接失败，请检查网络设置';
          } else {
            errorMessage = error.message;
          }
        }

        message.error(errorMessage);

        // 添加错误消息
        const errorMsg: ChatMessage = {
          id: `msg_${Date.now()}_error`,
          role: 'assistant',
          content: `抱歉，发生了错误: ${errorMessage}`,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading]
  );

  const handleMessageClick = useCallback(
    (message: ChatMessage) => {
      if (message.functionCalls && message.functionCalls.length > 0) {
        setSelectedMessage(message);
        if (isMobile) {
          setDrawerVisible(true);
        }
      }
    },
    [isMobile]
  );

  const handleCloseVisualization = useCallback(() => {
    setSelectedMessage(null);
    setDrawerVisible(false);
  }, []);

  const displayFunctionCalls: FunctionCall[] =
    selectedMessage?.functionCalls || [];

  const visualizationContent = (
    <CallVisualization
      functionCalls={displayFunctionCalls}
      onClose={handleCloseVisualization}
      showCloseButton={true}
    />
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          background: '#fff',
          borderBottom: '1px solid #e8e8e8',
          padding: isMobile ? '0 12px' : '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: isMobile ? '16px' : '20px',
            fontWeight: 'bold',
          }}
        >
          语音交互AI方法调用演示
        </h1>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {messages.length > 0 && (
            <Button
              type="text"
              size="small"
              onClick={() => {
                if (confirm('确定要清空聊天记录吗？')) {
                  setMessages([]);
                  setSelectedMessage(null);
                  message.success('聊天记录已清空');
                }
              }}
            >
              清空记录
            </Button>
          )}
          {isMobile && displayFunctionCalls.length > 0 && (
            <Button
              type="primary"
              onClick={() => setDrawerVisible(true)}
              size="small"
            >
              查看调用详情
            </Button>
          )}
        </div>
      </Header>
      <Layout>
        <Content
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 64px)',
          }}
        >
          <div
            style={{
              flex: 1,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {isLoading && (
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: isMobile ? '12px' : '16px',
                  zIndex: 10,
                  background: 'rgba(255, 255, 255, 0.9)',
                  padding: '8px',
                  borderRadius: '4px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
              >
                <Spin size="small" tip="处理中..." />
              </div>
            )}
            <ChatHistory
              messages={messages}
              onMessageClick={handleMessageClick}
            />
          </div>
          <InputPanel onSubmit={handleSubmit} disabled={isLoading} />
        </Content>
        {!isMobile && displayFunctionCalls.length > 0 && (
          <Sider
            width={400}
            style={{
              background: '#fff',
              borderLeft: '1px solid #e8e8e8',
              overflow: 'auto',
            }}
          >
            {visualizationContent}
          </Sider>
        )}
      </Layout>
      {isMobile && (
        <Drawer
          title="方法调用详情"
          placement="right"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          width="90%"
          styles={{
            body: { padding: '16px' },
          }}
        >
          {visualizationContent}
        </Drawer>
      )}
    </Layout>
  );
}
