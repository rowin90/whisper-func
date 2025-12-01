/**
 * 文件操作函数
 */

import { FunctionDefinition } from '../types';
import { promises as fs } from 'fs';
import path from 'path';

// 安全限制：只允许访问项目目录下的文件
const ALLOWED_BASE_DIR = process.cwd();

function validatePath(filePath: string): string {
  const resolvedPath = path.resolve(ALLOWED_BASE_DIR, filePath);
  if (!resolvedPath.startsWith(ALLOWED_BASE_DIR)) {
    throw new Error('Access denied: Path outside allowed directory');
  }
  return resolvedPath;
}

export const fileOperations: FunctionDefinition[] = [
  {
    name: 'read_file',
    description: '读取文件内容。可以读取文本文件、JSON文件等。',
    parameters: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: '要读取的文件路径（相对于项目根目录）',
        },
        encoding: {
          type: 'string',
          description: '文件编码，默认为utf-8',
          enum: ['utf-8', 'ascii', 'base64'],
          default: 'utf-8',
        },
      },
      required: ['filePath'],
    },
    handler: async (args: { filePath: string; encoding?: string }) => {
      const safePath = validatePath(args.filePath);
      const encoding = args.encoding || 'utf-8';
      const content = await fs.readFile(safePath, encoding as BufferEncoding);
      return {
        success: true,
        content,
        filePath: args.filePath,
        size: content.length,
      };
    },
  },
  {
    name: 'write_file',
    description: '写入文件内容。可以创建新文件或覆盖现有文件。',
    parameters: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: '要写入的文件路径（相对于项目根目录）',
        },
        content: {
          type: 'string',
          description: '要写入的文件内容',
        },
        encoding: {
          type: 'string',
          description: '文件编码，默认为utf-8',
          enum: ['utf-8', 'ascii', 'base64'],
          default: 'utf-8',
        },
      },
      required: ['filePath', 'content'],
    },
    handler: async (args: {
      filePath: string;
      content: string;
      encoding?: string;
    }) => {
      const safePath = validatePath(args.filePath);
      const encoding = args.encoding || 'utf-8';
      await fs.mkdir(path.dirname(safePath), { recursive: true });
      await fs.writeFile(safePath, args.content, encoding as BufferEncoding);
      return {
        success: true,
        filePath: args.filePath,
        message: 'File written successfully',
      };
    },
  },
  {
    name: 'list_files',
    description: '列出目录中的文件和子目录。',
    parameters: {
      type: 'object',
      properties: {
        dirPath: {
          type: 'string',
          description: '要列出的目录路径（相对于项目根目录），默认为当前目录',
          default: '.',
        },
        recursive: {
          type: 'boolean',
          description: '是否递归列出子目录，默认为false',
          default: false,
        },
      },
      required: [],
    },
    handler: async (args: {
      dirPath?: string;
      recursive?: boolean;
    }) => {
      const dirPath = args.dirPath || '.';
      const safePath = validatePath(dirPath);
      const items: Array<{
        name: string;
        type: 'file' | 'directory';
        size?: number;
      }> = [];

      async function listDir(currentPath: string, isRecursive: boolean) {
        const entries = await fs.readdir(currentPath, {
          withFileTypes: true,
        });

        for (const entry of entries) {
          const fullPath = path.join(currentPath, entry.name);
          const relativePath = path.relative(safePath, fullPath);

          if (entry.isDirectory()) {
            items.push({
              name: relativePath || entry.name,
              type: 'directory',
            });
            if (isRecursive) {
              await listDir(fullPath, isRecursive);
            }
          } else {
            const stats = await fs.stat(fullPath);
            items.push({
              name: relativePath || entry.name,
              type: 'file',
              size: stats.size,
            });
          }
        }
      }

      await listDir(safePath, args.recursive || false);

      return {
        success: true,
        dirPath: args.dirPath || '.',
        items,
        count: items.length,
      };
    },
  },
];
