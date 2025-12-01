'use client';

import { Card, Button } from 'antd';
import { FunctionCall } from '@/lib/functionRegistry/types';
import { CallStack } from './CallStack';

interface CallVisualizationProps {
  functionCalls: FunctionCall[];
  onClose?: () => void;
  showCloseButton?: boolean;
}

export function CallVisualization({
  functionCalls,
  onClose,
  showCloseButton = false,
}: CallVisualizationProps) {
  return (
    <Card
      title={
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>方法调用详情</span>
          {showCloseButton && onClose && (
            <Button
              type="text"
              size="small"
              onClick={onClose}
              style={{
                marginLeft: '8px',
              }}
            >
              关闭
            </Button>
          )}
        </div>
      }
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      bodyStyle={{
        flex: 1,
        overflow: 'auto',
      }}
    >
      <CallStack calls={functionCalls} />
    </Card>
  );
}
