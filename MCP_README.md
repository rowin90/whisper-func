# MCP服务器使用说明

## 概述

项目已改造为支持 Model Context Protocol (MCP) 架构。现在函数调用通过MCP客户端进行，可以轻松切换为独立的MCP服务器。

## 架构说明

### 当前实现（内联模式）

- **MCP客户端** (`src/lib/mcp/client.ts`): 内联实现，直接调用函数注册表
- **函数注册表** (`src/lib/functionRegistry/registry.ts`): 保持不变，管理所有函数
- **API路由** (`src/app/api/chat/route.ts`): 使用MCP客户端调用函数

### 独立MCP服务器模式

- **MCP服务器** (`src/lib/mcp/server.ts`): 实现MCP协议的独立服务器
- **运行脚本** (`scripts/mcp-server.ts`): 独立运行MCP服务器的脚本
- **配置文件** (`mcp-config.json`): MCP服务器配置

## 使用方式

### 方式1: 内联模式（当前默认）

当前实现使用内联MCP客户端，直接调用函数注册表。无需额外配置，直接运行：

```bash
pnpm dev
```

### 方式2: 独立MCP服务器

1. **启动MCP服务器**:
```bash
pnpm run mcp:server
```

2. **配置MCP客户端**:
在支持MCP的AI客户端（如Claude Desktop）中配置 `mcp-config.json`:

```json
{
  "mcpServers": {
    "whisper-func": {
      "command": "pnpm",
      "args": ["run", "mcp:server"],
      "env": {
        "OPENAI_API_KEY": "your-key-here"
      }
    }
  }
}
```

## 文件结构

```
src/lib/mcp/
├── adapter.ts      # 将注册表适配为MCP工具格式
├── client.ts       # MCP客户端（内联实现）
└── server.ts       # MCP服务器实现

scripts/
└── mcp-server.ts   # 独立运行脚本

mcp-config.json      # MCP服务器配置示例
```

## 改造对比

| 方面 | 改造前 | 改造后 |
|------|--------|--------|
| 调用方式 | `functionRegistry.executeFunction()` | `mcpClient.callTool()` |
| 架构 | 直接函数调用 | MCP协议抽象层 |
| 扩展性 | 需要修改代码 | 支持独立MCP服务器 |
| 标准化 | 自定义格式 | 符合MCP标准 |

## 优势

1. **标准化**: 符合MCP协议标准，可以与其他MCP工具集成
2. **可扩展**: 可以轻松切换为独立MCP服务器
3. **兼容性**: 保持向后兼容，现有功能不受影响
4. **灵活性**: 支持内联模式和独立服务器模式

## 未来扩展

- 支持HTTP传输（不仅仅是stdio）
- 支持SSE（Server-Sent Events）
- 支持资源（Resources）和提示（Prompts）
- 支持多个MCP服务器实例
