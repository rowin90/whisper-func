/**
 * 数据处理函数
 */

import { FunctionDefinition } from '../types';

export const dataProcessing: FunctionDefinition[] = [
  {
    name: 'parse_json',
    description: '解析JSON字符串为对象。可以验证JSON格式并返回解析后的数据。',
    parameters: {
      type: 'object',
      properties: {
        jsonString: {
          type: 'string',
          description: '要解析的JSON字符串',
        },
      },
      required: ['jsonString'],
    },
    handler: async (args: { jsonString: string }) => {
      try {
        const parsed = JSON.parse(args.jsonString);
        return {
          success: true,
          data: parsed,
          type: Array.isArray(parsed) ? 'array' : typeof parsed,
          keys: typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
            ? Object.keys(parsed)
            : undefined,
          length: Array.isArray(parsed) ? parsed.length : undefined,
        };
      } catch (error) {
        throw new Error(
          `JSON解析失败: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    },
  },
  {
    name: 'stringify_json',
    description: '将对象转换为JSON字符串。可以格式化输出，支持缩进。',
    parameters: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          description: '要转换为JSON的对象',
        },
        pretty: {
          type: 'boolean',
          description: '是否格式化输出（添加缩进），默认为true',
          default: true,
        },
      },
      required: ['data'],
    },
    handler: async (args: { data: any; pretty?: boolean }) => {
      try {
        const jsonString = args.pretty !== false
          ? JSON.stringify(args.data, null, 2)
          : JSON.stringify(args.data);

        return {
          success: true,
          jsonString,
          length: jsonString.length,
        };
      } catch (error) {
        throw new Error(
          `JSON序列化失败: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    },
  },
  {
    name: 'format_data',
    description: '格式化数据。可以格式化数字、日期、文本等。',
    parameters: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          description: '要格式化的数据',
        },
        format: {
          type: 'string',
          description: '格式化类型',
          enum: ['number', 'currency', 'date', 'datetime', 'uppercase', 'lowercase', 'capitalize'],
        },
        locale: {
          type: 'string',
          description: '区域设置，例如 "zh-CN", "en-US"。默认为 "zh-CN"',
          default: 'zh-CN',
        },
        options: {
          type: 'object',
          description: '格式化选项（根据format类型不同而不同）',
        },
      },
      required: ['data', 'format'],
    },
    handler: async (args: {
      data: any;
      format: string;
      locale?: string;
      options?: Record<string, any>;
    }) => {
      const locale = args.locale || 'zh-CN';
      let formatted: string;

      try {
        switch (args.format) {
          case 'number':
            formatted = new Intl.NumberFormat(locale, args.options).format(
              Number(args.data)
            );
            break;

          case 'currency':
            formatted = new Intl.NumberFormat(locale, {
              style: 'currency',
              currency: args.options?.currency || 'CNY',
              ...args.options,
            }).format(Number(args.data));
            break;

          case 'date':
            formatted = new Intl.DateTimeFormat(locale, {
              dateStyle: 'medium',
              ...args.options,
            }).format(new Date(args.data));
            break;

          case 'datetime':
            formatted = new Intl.DateTimeFormat(locale, {
              dateStyle: 'medium',
              timeStyle: 'short',
              ...args.options,
            }).format(new Date(args.data));
            break;

          case 'uppercase':
            formatted = String(args.data).toUpperCase();
            break;

          case 'lowercase':
            formatted = String(args.data).toLowerCase();
            break;

          case 'capitalize':
            formatted =
              String(args.data).charAt(0).toUpperCase() +
              String(args.data).slice(1).toLowerCase();
            break;

          default:
            throw new Error(`不支持的格式化类型: ${args.format}`);
        }

        return {
          success: true,
          original: args.data,
          formatted,
          format: args.format,
          locale,
        };
      } catch (error) {
        throw new Error(
          `格式化失败: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    },
  },
  {
    name: 'filter_array',
    description: '过滤数组。可以根据条件过滤数组元素。',
    parameters: {
      type: 'object',
      properties: {
        array: {
          type: 'array',
          description: '要过滤的数组',
          items: {
            type: 'object',
          },
        },
        condition: {
          type: 'string',
          description: '过滤条件，例如 "value > 10", "value.includes(\'test\')"',
        },
      },
      required: ['array', 'condition'],
    },
    handler: async (args: { array: any[]; condition: string }) => {
      try {
        // 简单的过滤实现（生产环境应使用更安全的方式）
        const filtered = args.array.filter((item, index) => {
          try {
            // 创建安全的评估环境
            const value = item;
            // 注意：这里使用eval是不安全的，仅用于演示
            // 实际应用中应该使用更安全的表达式解析器
            return Function(`"use strict"; const value = arguments[0]; return ${args.condition}`)(item);
          } catch {
            return false;
          }
        });

        return {
          success: true,
          originalLength: args.array.length,
          filteredLength: filtered.length,
          filtered,
          condition: args.condition,
        };
      } catch (error) {
        throw new Error(
          `过滤失败: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    },
  },
];
