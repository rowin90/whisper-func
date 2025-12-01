/**
 * API调用函数
 */

import { FunctionDefinition } from '../types';

export const apiCalls: FunctionDefinition[] = [
  {
    name: 'get_current_time',
    description: '获取当前时间。可以获取本地时间或UTC时间，支持不同的时区。',
    parameters: {
      type: 'object',
      properties: {
        timezone: {
          type: 'string',
          description: '时区，例如 "Asia/Shanghai", "America/New_York", "UTC"。默认为本地时区',
          default: 'local',
        },
        format: {
          type: 'string',
          description: '时间格式，例如 "ISO", "locale", "timestamp"。默认为ISO格式',
          enum: ['ISO', 'locale', 'timestamp'],
          default: 'ISO',
        },
      },
      required: [],
    },
    handler: async (args: {
      timezone?: string;
      format?: string;
    }) => {
      const now = new Date();
      const format = args.format || 'ISO';
      const timezone = args.timezone || 'local';

      let result: string | number;
      let timeString: string;

      if (format === 'timestamp') {
        result = now.getTime();
        timeString = now.toISOString();
      } else if (format === 'locale') {
        result = now.toLocaleString('zh-CN', {
          timeZone: timezone === 'local' ? undefined : timezone,
        });
        timeString = result as string;
      } else {
        result = now.toISOString();
        timeString = result as string;
      }

      return {
        success: true,
        time: result,
        timeString,
        timezone: timezone === 'local' ? Intl.DateTimeFormat().resolvedOptions().timeZone : timezone,
        timestamp: now.getTime(),
      };
    },
  },
  {
    name: 'get_weather',
    description: '获取天气信息。这是一个模拟的天气API，返回示例天气数据。',
    parameters: {
      type: 'object',
      properties: {
        city: {
          type: 'string',
          description: '城市名称，例如 "北京", "上海", "New York"',
        },
        units: {
          type: 'string',
          description: '温度单位',
          enum: ['celsius', 'fahrenheit'],
          default: 'celsius',
        },
      },
      required: ['city'],
    },
    handler: async (args: { city: string; units?: string }) => {
      // 模拟天气数据（实际应用中应该调用真实的天气API）
      const weatherData: Record<
        string,
        { temp: number; condition: string; humidity: number }
      > = {
        北京: { temp: 15, condition: '晴天', humidity: 45 },
        上海: { temp: 18, condition: '多云', humidity: 60 },
        'New York': { temp: 10, condition: '小雨', humidity: 70 },
      };

      const cityData = weatherData[args.city] || {
        temp: Math.floor(Math.random() * 30) + 5,
        condition: ['晴天', '多云', '小雨', '阴天'][Math.floor(Math.random() * 4)],
        humidity: Math.floor(Math.random() * 40) + 40,
      };

      let temperature = cityData.temp;
      if (args.units === 'fahrenheit') {
        temperature = (temperature * 9) / 5 + 32;
      }

      return {
        success: true,
        city: args.city,
        temperature: Math.round(temperature * 10) / 10,
        unit: args.units || 'celsius',
        condition: cityData.condition,
        humidity: cityData.humidity,
        note: '这是模拟数据，实际应用中应调用真实天气API',
      };
    },
  },
  {
    name: 'fetch_url',
    description: '获取URL的内容。可以获取网页内容或API响应。',
    parameters: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: '要获取的URL地址',
        },
        method: {
          type: 'string',
          description: 'HTTP方法',
          enum: ['GET', 'POST', 'PUT', 'DELETE'],
          default: 'GET',
        },
        headers: {
          type: 'object',
          description: 'HTTP请求头',
        },
        body: {
          type: 'string',
          description: '请求体（用于POST/PUT请求）',
        },
      },
      required: ['url'],
    },
    handler: async (args: {
      url: string;
      method?: string;
      headers?: Record<string, string>;
      body?: string;
    }) => {
      try {
        const response = await fetch(args.url, {
          method: args.method || 'GET',
          headers: args.headers || {
            'Content-Type': 'application/json',
          },
          body: args.body,
        });

        const contentType = response.headers.get('content-type');
        let data: unknown;

        if (contentType?.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        return {
          success: response.ok,
          status: response.status,
          statusText: response.statusText,
          url: args.url,
          data,
          headers: Object.fromEntries(response.headers.entries()),
        };
      } catch (error) {
        throw new Error(
          `请求失败: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    },
  },
];
