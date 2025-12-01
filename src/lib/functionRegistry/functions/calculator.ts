/**
 * 计算功能函数
 */

import { FunctionDefinition } from '../types';

export const calculator: FunctionDefinition[] = [
  {
    name: 'calculate',
    description: '执行数学计算。支持基本运算（加减乘除）、幂运算、三角函数等。',
    parameters: {
      type: 'object',
      properties: {
        expression: {
          type: 'string',
          description: '要计算的数学表达式，例如: "2 + 3 * 4", "sqrt(16)", "sin(30)"',
        },
      },
      required: ['expression'],
    },
    handler: async (args: { expression: string }) => {
      try {
        // 安全的数学表达式计算
        // 注意：在生产环境中应该使用更安全的表达式解析器
        const sanitized = args.expression
          .replace(/[^0-9+\-*/().\s,sqrt|sin|cos|tan|log|ln|pi|e]/gi, '')
          .replace(/sqrt/gi, 'Math.sqrt')
          .replace(/sin/gi, 'Math.sin')
          .replace(/cos/gi, 'Math.cos')
          .replace(/tan/gi, 'Math.tan')
          .replace(/log/gi, 'Math.log10')
          .replace(/ln/gi, 'Math.log')
          .replace(/pi/gi, 'Math.PI')
          .replace(/e/gi, 'Math.E');

        // 使用Function构造器进行安全计算
        const result = Function(`"use strict"; return ${sanitized}`)();

        return {
          success: true,
          expression: args.expression,
          result,
          type: typeof result,
        };
      } catch (error) {
        throw new Error(
          `计算失败: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    },
  },
  {
    name: 'convert_unit',
    description: '单位转换。支持长度、重量、温度等常见单位转换。',
    parameters: {
      type: 'object',
      properties: {
        value: {
          type: 'number',
          description: '要转换的数值',
        },
        fromUnit: {
          type: 'string',
          description: '源单位',
          enum: [
            'meter',
            'kilometer',
            'centimeter',
            'inch',
            'foot',
            'mile',
            'kilogram',
            'gram',
            'pound',
            'ounce',
            'celsius',
            'fahrenheit',
            'kelvin',
          ],
        },
        toUnit: {
          type: 'string',
          description: '目标单位',
          enum: [
            'meter',
            'kilometer',
            'centimeter',
            'inch',
            'foot',
            'mile',
            'kilogram',
            'gram',
            'pound',
            'ounce',
            'celsius',
            'fahrenheit',
            'kelvin',
          ],
        },
      },
      required: ['value', 'fromUnit', 'toUnit'],
    },
    handler: async (args: {
      value: number;
      fromUnit: string;
      toUnit: string;
    }) => {
      // 转换表（以米/千克/摄氏度为基础单位）
      const conversions: Record<string, number> = {
        // 长度
        meter: 1,
        kilometer: 1000,
        centimeter: 0.01,
        inch: 0.0254,
        foot: 0.3048,
        mile: 1609.34,
        // 重量
        kilogram: 1,
        gram: 0.001,
        pound: 0.453592,
        ounce: 0.0283495,
      };

      // 温度转换
      if (
        ['celsius', 'fahrenheit', 'kelvin'].includes(args.fromUnit) &&
        ['celsius', 'fahrenheit', 'kelvin'].includes(args.toUnit)
      ) {
        let celsius = args.value;
        if (args.fromUnit === 'fahrenheit') {
          celsius = (args.value - 32) * (5 / 9);
        } else if (args.fromUnit === 'kelvin') {
          celsius = args.value - 273.15;
        }

        let result = celsius;
        if (args.toUnit === 'fahrenheit') {
          result = celsius * (9 / 5) + 32;
        } else if (args.toUnit === 'kelvin') {
          result = celsius + 273.15;
        }

        return {
          success: true,
          value: args.value,
          fromUnit: args.fromUnit,
          toUnit: args.toUnit,
          result: Math.round(result * 100) / 100,
        };
      }

      // 其他单位转换
      if (
        !conversions[args.fromUnit] ||
        !conversions[args.toUnit]
      ) {
        throw new Error(`不支持的单位转换: ${args.fromUnit} -> ${args.toUnit}`);
      }

      // 检查单位类型是否匹配
      const lengthUnits = ['meter', 'kilometer', 'centimeter', 'inch', 'foot', 'mile'];
      const weightUnits = ['kilogram', 'gram', 'pound', 'ounce'];

      const fromIsLength = lengthUnits.includes(args.fromUnit);
      const toIsLength = lengthUnits.includes(args.toUnit);
      const fromIsWeight = weightUnits.includes(args.fromUnit);
      const toIsWeight = weightUnits.includes(args.toUnit);

      if ((fromIsLength && !toIsLength) || (!fromIsLength && toIsLength)) {
        throw new Error('单位类型不匹配：长度和重量不能互相转换');
      }
      if ((fromIsWeight && !toIsWeight) || (!fromIsWeight && toIsWeight)) {
        throw new Error('单位类型不匹配：长度和重量不能互相转换');
      }

      const baseValue = args.value * conversions[args.fromUnit];
      const result = baseValue / conversions[args.toUnit];

      return {
        success: true,
        value: args.value,
        fromUnit: args.fromUnit,
        toUnit: args.toUnit,
        result: Math.round(result * 1000000) / 1000000,
      };
    },
  },
];
