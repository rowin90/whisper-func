'use client';

import { Timeline } from 'antd';
import { FunctionCall } from '@/lib/functionRegistry/types';
import { MethodDetail } from './MethodDetail';

interface CallStackProps {
  calls: FunctionCall[];
}

export function CallStack({ calls }: CallStackProps) {
  if (calls.length === 0) {
    return (
      <div
        style={{
          padding: '24px',
          textAlign: 'center',
          color: '#999',
        }}
      >
        暂无方法调用
      </div>
    );
  }

  const getStatusColor = (status: FunctionCall['status']) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'failed':
        return 'red';
      case 'executing':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });
  };

  return (
    <Timeline
      items={calls.map((call, index) => ({
        color: getStatusColor(call.status),
        children: (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}
            >
              <span style={{ fontWeight: 'bold' }}>
                #{index + 1} {call.name}
              </span>
              <span style={{ fontSize: '12px', color: '#999' }}>
                {formatTime(call.timestamp)}
              </span>
            </div>
            <MethodDetail call={call} />
          </div>
        ),
      }))}
    />
  );
}
