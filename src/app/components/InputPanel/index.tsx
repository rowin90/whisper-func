'use client';

import { useState } from 'react';
import { Button, Segmented } from 'antd';
import { TextInput } from './TextInput';
import { VoiceInput } from './VoiceInput';
import { InputMode } from '@/types/chat';

interface InputPanelProps {
  onSubmit: (message: string) => void;
  disabled?: boolean;
}

export function InputPanel({ onSubmit, disabled }: InputPanelProps) {
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [textValue, setTextValue] = useState('');

  const handleSubmit = () => {
    if (textValue.trim() && !disabled) {
      onSubmit(textValue.trim());
      setTextValue('');
    }
  };

  const handleVoiceTranscript = (text: string) => {
    if (text.trim()) {
      onSubmit(text.trim());
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px',
        background: '#fff',
        borderTop: '1px solid #e8e8e8',
      }}
    >
      <Segmented
        value={inputMode}
        onChange={(value) => setInputMode(value as InputMode)}
        options={[
          { label: '文本输入', value: 'text' },
          { label: '语音输入', value: 'voice' },
        ]}
        disabled={disabled}
      />

      {inputMode === 'text' ? (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <TextInput
              value={textValue}
              onChange={setTextValue}
              onSubmit={handleSubmit}
              disabled={disabled}
            />
          </div>
          <Button
            type="primary"
            onClick={handleSubmit}
            disabled={disabled || !textValue.trim()}
          >
            发送
          </Button>
        </div>
      ) : (
        <VoiceInput onTranscript={handleVoiceTranscript} disabled={disabled} />
      )}
    </div>
  );
}
