'use client';

import { Card } from 'antd';
import { FunctionCall } from '@/lib/functionRegistry/types';
import { CallStack } from './CallStack';

interface CallVisualizationProps {
  functionCalls: FunctionCall[];
}

export function CallVisualization({
  functionCalls,
}: CallVisualizationProps) {
  return (
    <Card
      title="方法调用详情"
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
