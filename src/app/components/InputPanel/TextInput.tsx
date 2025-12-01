'use client';

import { Input } from 'antd';

const { TextArea } = Input;
import { useState } from 'react';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function TextInput({
  value,
  onChange,
  onSubmit,
  disabled,
}: TextInputProps) {
  const [isComposing, setIsComposing] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSubmit();
      }
    }
  };

  return (
    <TextArea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      onCompositionStart={() => setIsComposing(true)}
      onCompositionEnd={() => setIsComposing(false)}
      placeholder="输入你的问题..."
      disabled={disabled}
      autoSize={{ minRows: 1, maxRows: 6 }}
      style={{ width: '100%' }}
    />
  );
}
