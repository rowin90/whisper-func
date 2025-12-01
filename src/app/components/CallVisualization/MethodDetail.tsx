'use client';

import { Card, Collapse } from 'antd';
import { FunctionCall } from '@/lib/functionRegistry/types';

interface MethodDetailProps {
  call: FunctionCall;
}

export function MethodDetail({ call }: MethodDetailProps) {
  const getStatusColor = (status: FunctionCall['status']) => {
    switch (status) {
      case 'completed':
        return '#52c41a';
      case 'failed':
        return '#ff4d4f';
      case 'executing':
        return '#1890ff';
      default:
        return '#d9d9d9';
    }
  };

  const getStatusText = (status: FunctionCall['status']) => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'failed':
        return '失败';
      case 'executing':
        return '执行中';
      default:
        return '等待中';
    }
  };

  const formatJSON = (obj: any) => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  };

  return (
    <Card
      size="small"
      style={{
        marginBottom: '8px',
        borderLeft: `3px solid ${getStatusColor(call.status)}`,
      }}
    >
      <div style={{ marginBottom: '12px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}
        >
          <strong style={{ fontSize: '16px' }}>{call.name}</strong>
          <span
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              background: getStatusColor(call.status),
              color: '#fff',
              fontSize: '12px',
            }}
          >
            {getStatusText(call.status)}
          </span>
        </div>
        {call.executionTime !== undefined && (
          <div style={{ fontSize: '12px', color: '#666' }}>
            执行时间: {call.executionTime}ms
          </div>
        )}
      </div>

      <Collapse
        items={[
          {
            key: 'params',
            label: '参数',
            children: (
              <pre
                style={{
                  background: '#f5f5f5',
                  padding: '12px',
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: '12px',
                }}
              >
                {formatJSON(call.arguments)}
              </pre>
            ),
          },
          call.result !== undefined && {
            key: 'result',
            label: '返回值',
            children: (
              <pre
                style={{
                  background: '#f6ffed',
                  padding: '12px',
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: '12px',
                }}
              >
                {formatJSON(call.result)}
              </pre>
            ),
          },
          call.error && {
            key: 'error',
            label: '错误信息',
            children: (
              <div
                style={{
                  background: '#fff2f0',
                  padding: '12px',
                  borderRadius: '4px',
                  color: '#ff4d4f',
                  fontSize: '12px',
                }}
              >
                {call.error}
              </div>
            ),
          },
        ].filter(Boolean) as any}
      />
    </Card>
  );
}
