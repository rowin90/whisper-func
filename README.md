# 语音交互AI方法调用演示应用

这是一个演示应用，展示如何通过语音或文本交互控制AI来调用本地方法。

## 功能特性

- ✅ **双模式输入**: 支持文本输入和语音输入（使用Web Speech API）
- ✅ **AI对话**: 集成OpenAI API，支持Function Calling
- ✅ **本地方法调用**: 通过函数注册表管理可调用的本地方法
- ✅ **可视化展示**: 清晰展示方法调用过程，包括调用栈、参数和返回值
- ✅ **响应式设计**: 支持桌面和移动设备
- ✅ **错误处理**: 完善的错误处理和加载状态

## 技术栈

- **框架**: Next.js 16 (App Router)
- **UI库**: Ant Design + Ant Design X
- **语音识别**: Web Speech API (浏览器原生)
- **AI模型**: OpenAI API (GPT-4/GPT-3.5)
- **类型**: TypeScript

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

创建 `.env.local` 文件：

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.shellgpt.top/v1
```

**注意**: `OPENAI_BASE_URL` 默认为 `https://api.shellgpt.top/v1`，如果需要使用官方OpenAI API，可以设置为 `https://api.openai.com/v1` 或不设置此变量。

### 3. 运行开发服务器

```bash
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 可用的本地方法

应用内置了以下类型的示例方法：

### 1. 文件操作 (`fileOperations.ts`)
- `read_file`: 读取文件内容
- `write_file`: 写入文件内容
- `list_files`: 列出目录文件

### 2. 计算功能 (`calculator.ts`)
- `calculate`: 执行数学计算
- `convert_unit`: 单位转换（长度、重量、温度等）

### 3. API调用 (`apiCalls.ts`)
- `get_current_time`: 获取当前时间
- `get_weather`: 获取天气信息（模拟）
- `fetch_url`: 获取URL内容

### 4. 数据处理 (`dataProcessing.ts`)
- `parse_json`: 解析JSON字符串
- `stringify_json`: 将对象转换为JSON字符串
- `format_data`: 格式化数据（数字、日期、文本等）
- `filter_array`: 过滤数组

## 使用示例

### 文本输入示例

- "帮我计算 123 + 456"
- "把100公里转换成米"
- "读取 package.json 文件"
- "获取当前时间"
- "格式化数字 1234.56 为货币格式"

### 语音输入

1. 切换到"语音输入"模式
2. 点击麦克风按钮开始录音
3. 说话后，系统会自动转写并发送

**注意**: Web Speech API需要HTTPS或localhost环境才能工作。

## 项目结构

```
src/
├── app/
│   ├── api/
│   │   └── chat/route.ts          # AI聊天API路由
│   ├── components/
│   │   ├── InputPanel/            # 输入面板组件
│   │   ├── CallVisualization/    # 方法调用可视化
│   │   └── ChatHistory/           # 对话历史
│   ├── page.tsx                   # 主页面
│   └── layout.tsx                 # 布局
├── lib/
│   ├── functionRegistry/          # 函数注册表
│   │   ├── registry.ts            # 注册表核心
│   │   ├── types.ts               # 类型定义
│   │   └── functions/              # 函数实现
│   └── openai/
│       └── client.ts              # OpenAI客户端
└── types/
    └── chat.ts                    # 聊天类型
```

## 扩展方法

要添加新的本地方法：

1. 在 `src/lib/functionRegistry/functions/` 目录下创建新文件或编辑现有文件
2. 定义函数，符合 `FunctionDefinition` 接口
3. 在 `src/lib/functionRegistry/registry.ts` 中注册函数

示例：

```typescript
export const myFunctions: FunctionDefinition[] = [
  {
    name: 'my_function',
    description: '函数描述',
    parameters: {
      type: 'object',
      properties: {
        param1: {
          type: 'string',
          description: '参数描述',
        },
      },
      required: ['param1'],
    },
    handler: async (args: { param1: string }) => {
      // 实现逻辑
      return { result: 'success' };
    },
  },
];
```

## 注意事项

- Web Speech API需要HTTPS或localhost环境
- OpenAI API需要有效的API Key
- 文件操作有安全限制，仅允许访问项目目录下的文件
- 某些函数使用了简化的实现，生产环境应使用更安全的方案

## 许可证

MIT
