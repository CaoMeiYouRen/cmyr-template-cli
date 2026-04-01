# cmyr-template-cli AI 功能引入设计方案

> 版本：v1.1 | 日期：2026-03-31

## 一、项目概述

### 1.1 目标

为 cmyr-template-cli 引入 AI 辅助功能，使项目初始化脚手架默认集成 AI 开发配置文件，并提供可选的 AI 引导模式，用户可通过自然语言描述需求来自动生成项目名称、介绍、关键词等信息。

### 1.2 设计原则

- **渐进式增强**：AI 功能为可选模块，不影响现有无 AI 环境的用户体验
- **工具链无关**：生成的 AI 配置文件覆盖主流 AI 编码工具（Claude Code、GitHub Copilot、Codex、Gemini CLI、OpenCode、Cursor、Windsurf）
- **模板驱动**：AI 脚手架文件使用 EJS 模板渲染，与现有文档生成机制一致
- **零硬依赖**：AI 引导功能通过可选的外部 API 调用实现，不引入新的必需运行时依赖

---

## 二、功能设计

### 2.1 AI 脚手架初始化（功能 A）

#### 2.1.1 功能描述

在项目初始化流程中，默认为所有 Node.js/Browser 类型项目生成 AI 辅助开发的配置文件和目录结构。

#### 2.1.2 生成的文件清单

**核心原则**：以 `AGENTS.md` 为单一信息源（Single Source of Truth），其他工具配置文件引用它，避免内容重复。

```
project-root/
├── AGENTS.md                          # AI 代理主配置（单一信息源，所有 AI 工具共用）
├── .claude/                           # Claude Code 扩展目录
│   ├── settings.json                  # Claude Code 设置和钩子
│   ├── skills/                        # 按需加载的技能文件（空目录）
│   └── agents/                        # 自定义代理配置（空目录）
├── .github/
│   └── copilot-instructions.md        # GitHub Copilot 指令（引用 AGENTS.md）
├── .cursorrules                       # Cursor 配置（可选）
├── .windsurfrules                     # Windsurf 配置（可选）
└── .cursor/                           # Cursor 路径特定规则（可选）
    └── rules/                         # （空目录）
```

**各工具读取方式**：

| 工具 | 读取文件 | 说明 |
|------|---------|------|
| Claude Code | `AGENTS.md` + `.claude/` | 原生支持 AGENTS.md |
| Codex | `AGENTS.md` | 原生支持 AGENTS.md |
| Gemini CLI | `AGENTS.md` | 原生支持 AGENTS.md |
| OpenCode | `AGENTS.md` | 原生支持 AGENTS.md |
| GitHub Copilot | `.github/copilot-instructions.md` | 引用 AGENTS.md |
| Cursor | `.cursorrules` | 独立配置（可选） |
| Windsurf | `.windsurfrules` | 独立配置（可选） |

#### 2.1.3 各文件内容模板

**AGENTS.md** — AI 代理主配置（单一信息源，基于项目技术栈动态生成）：

```markdown
# AGENTS.md

## 项目概述
<%= projectDescription %>

## 技术栈
- 主要语言: <%= language %>
- 运行时: <%= runtime %>
<% if (vueVersion === 3) { %>- 框架: Vue 3<% } %>
<% if (vueVersion === 2) { %>- 框架: Vue 2<% } %>
- 包管理器: <%= packageManager %>

## 项目结构
\`\`\`
src/           # 源代码
<% if (isInitTest !== 'none') { %>tests/         # 测试文件<% } %>
\`\`\`

## 开发命令
- 安装依赖: `<%= packageManager %> install`
<% if (devCommand) { %>- 启动开发服务器: `<%= devCommand %>`<% } %>
<% if (testCommand) { %>- 运行测试: `<%= testCommand %>`<% } %>
<% if (buildCommand) { %>- 构建项目: `<%= buildCommand %>`<% } %>
<% if (lintCommand) { %>- 代码检查: `<%= lintCommand %>`<% } %>

## 编码约定
- 使用 TypeScript 严格模式
- 遵循 ESLint 配置规则
- 提交信息遵循 Conventional Commits 规范

## 测试要求
<% if (isInitTest === 'vitest') { %>
- 测试框架: Vitest
- 覆盖率要求: >= 80%
<% } else if (isInitTest === 'jest') { %>
- 测试框架: Jest
- 覆盖率要求: >= 80%
<% } else { %>
- 未配置测试框架
<% } %>

## 避免事项
- 不要使用 var 声明变量，使用 const/let
- 不要跳过 TypeScript 类型检查
- 不要直接修改 generated/ 目录下的文件
```

**.github/copilot-instructions.md** — GitHub Copilot 配置（引用 AGENTS.md，避免重复）：

```markdown
# Copilot Instructions

请阅读项目根目录的 `AGENTS.md` 文件，其中包含本项目的完整编码规范、开发命令和注意事项。请严格遵循 AGENTS.md 中的所有约定。
```

**.claude/settings.json** — Claude Code 钩子配置：

```json
{
  "permissions": {
    "allow": [],
    "deny": []
  }
}
```

> 注：初始版本使用最简配置，用户可根据需要自行添加钩子和权限规则。

#### 2.1.4 行为规则

| 条件 | 行为 |
|------|------|
| 默认 | 生成 AGENTS.md + Copilot 引用配置 |
| `isInitAI = false` | 跳过全部 AI 脚手架初始化 |
| 非 Node.js/Browser 项目 | 跳过 AI 脚手架初始化（AI 配置仅适用于 Node.js/Browser 项目） |
| 文件已存在 | 跳过该文件，不覆盖用户已有配置 |

#### 2.1.5 与现有流程的集成点

在 `src/utils/utils.ts` 的 `init()` 函数中，AI 脚手架初始化应在 `initEditorconfig()` 之后、`initEslint()` 之前执行：

```typescript
// 现有代码
await initEditorconfig(projectPath)

// 新增：AI 脚手架初始化
if (isInitAI) {
    await initAIScaffolding(projectPath, info)
}

await initCommitlint(projectPath)
// ...
```

---

### 2.2 AI 引导功能（功能 B）

#### 2.2.1 功能描述

提供可选的 AI 引导模式。用户可以通过自然语言描述项目功能，由 AI 自动生成项目名称、描述、关键词等初始配置。用户可从 AI 生成的多个候选方案中选择或修改。

#### 2.2.2 交互流程

```
┌─────────────────────────────────────────────────┐
│  ? 是否启用 AI 引导模式？ (Y/n)                    │
├───────────────────┬─────────────────────────────┤
│    选择 Y         │      选择 n                  │
│                   │                             │
│  ┌─────────────┐  │   走现有问答流程              │
│  │ 请描述您的   │  │   (无变化)                   │
│  │ 项目功能    │  │                             │
│  └──────┬──────┘  │                             │
│         ▼         │                             │
│  ┌─────────────┐  │                             │
│  │ AI 生成中…  │  │                             │
│  │ (spinner)   │  │                             │
│  └──────┬──────┘  │                             │
│         ▼         │                             │
│  ┌─────────────────────────────────────┐        │
│  │ AI 为您生成了以下方案：              │        │
│  │                                     │        │
│  │ 推荐项目名称:                       │        │
│  │   1. my-awesome-tool                │        │
│  │   2. cool-project                   │        │
│  │   3. smart-app                      │        │
│  │                                     │        │
│  │ 项目描述:                           │        │
│  │   A tool that makes ...             │        │
│  │                                     │        │
│  │ 关键词: tool, automation, cli        │        │
│  │                                     │        │
│  │ 推荐模板: ts-template               │        │
│  └─────────────────────────────────────┘        │
│         ▼                                         │
│  ? 请选择项目名称 (输入序号或自定义)               │
│  ? 请确认/修改项目描述                             │
│  ? 请确认/修改关键词                               │
│  ? 请确认/修改项目模板                             │
│         ▼                                         │
│  走后续问答流程（跳过已 AI 生成的字段）             │
└─────────────────────────────────────────────────┘
```

#### 2.2.3 AI 调用方式

AI 引导功能通过用户配置的 AI API 端点实现，当前版本仅支持 OpenAI Chat Completions 兼容格式：

| 提供商 | API 格式 | 端点 |
|--------|---------|------|
| OpenAI 兼容（默认） | Chat Completions | `${AI_API_BASE}/chat/completions` |
| Ollama 本地 | Chat Completions | `http://localhost:11434/v1/chat/completions` |

> **注意**：当前版本仅支持 OpenAI Chat Completions 兼容格式（包括 OpenAI、Ollama 本地等）。Anthropic Messages API 支持将在后续版本中添加。

配置存储在 `.ctrc` 文件中：

```json5
{
  // 现有配置...
  "AI_API_BASE": "https://api.openai.com/v1",
  "AI_API_KEY": "sk-xxx",
  "AI_MODEL": "gpt-4o-mini"
}
```

#### 2.2.4 Prompt 设计

```markdown
你是一个项目初始化助手。根据用户描述的项目功能，生成以下信息：

1. **项目名称**：生成 3 个候选名称，使用 kebab-case 格式，简短且有意义
2. **项目描述**：一段简洁的中文描述（50-100字）
3. **关键词**：3-5 个相关关键词
4. **推荐模板**：从以下模板中选择最合适的一个
   - vite-latest-template (Vue 3 + Vite 前端项目)
   - react-vite-template (React + Vite 前端项目)
   - ts-template (TypeScript Node.js 项目)
   - nest-template (NestJS 后端项目)
   - hono-template (Hono 全栈项目)
   - nuxt-latest-template (Nuxt SSR 项目)
   - express-template (Express 后端项目)
   - 其他可用模板...

用户描述：{userInput}

请以 JSON 格式返回：
{
  "names": ["name-1", "name-2", "name-3"],
  "description": "项目描述",
  "keywords": ["keyword1", "keyword2"],
  "template": "template-name"
}
```

#### 2.2.5 降级策略

| 场景 | 处理方式 |
|------|---------|
| AI API 不可用/超时 | 提示用户，回退到标准问答流程 |
| API Key 未配置 | 提示用户配置 `.ctrc` 中的 AI 相关字段，回退到标准流程 |
| AI 返回格式异常 | 尝试 JSON 解析，失败则回退到标准流程 |
| 用户选择跳过 | 直接进入标准问答流程 |

---

### 2.3 配置选项设计（功能 C）

#### 2.3.1 交互式问答新增项

在 `src/plopfile.ts` 的 questions 数组中添加以下问题：

> **问题顺序说明**：`isAIAssisted` 必须在最前面询问，因为 AI 引导模式需要影响后续 `name`/`description`/`keywords`/`template` 问题的默认值。`isInitAI`/`aiTools` 依赖 `template` 的运行时类型，因此放在 `template` 之后。

```typescript
// ===== AI 引导模式（必须最先询问，以便 AI 建议影响后续问题的默认值） =====
{
    type: 'confirm',
    name: 'isAIAssisted',
    message: '是否启用 AI 引导模式？（通过 AI 帮助生成项目信息）',
    default: false,
},
{
    type: 'input',
    name: 'aiUserInput',
    message: '请描述您的项目功能：',
    default: '',
    when(answers: InitAnswers) {
        return answers.isAIAssisted
    },
},
// 隐藏的 AI 调用触发器（不显示给用户，仅用于异步调用 AI API）
// 此处通过 when 返回 false 来隐藏问题，但在 when 中异步调用 AI API
// AI 建议通过闭包变量传递给后续问题的 default/message 函数

// ===== 项目基本信息（AI 引导模式下使用 AI 建议作为默认值） =====
// name, description, author, keywords, template...

// ===== JS 模块和依赖 =====
// jsModuleType, commonDependencies...

// ===== AI 配置相关（依赖 template 的运行时类型） =====
{
    type: 'confirm',
    name: 'isInitAI',
    message: '是否初始化 AI 开发配置？',
    default: true,
    when(answers: InitAnswers) {
        const templateMeta = getTemplateMeta(answers.template)
        return ['nodejs', 'browser'].includes(templateMeta?.runtime)
    },
},
{
    type: 'checkbox',
    name: 'aiTools',
    message: '请选择要初始化的 AI 工具配置',
    choices: [
        { name: 'Claude Code / Codex / Gemini CLI / OpenCode (AGENTS.md + .claude/)', value: 'claude', checked: true },
        { name: 'GitHub Copilot (.github/copilot-instructions.md → AGENTS.md)', value: 'copilot', checked: true },
        { name: 'Cursor (.cursorrules)', value: 'cursor', checked: false },
        { name: 'Windsurf (.windsurfrules)', value: 'windsurf', checked: false },
    ],
    when(answers: InitAnswers) {
        return answers.isInitAI
    },
},
```

#### 2.3.2 InitAnswers 类型扩展

在 `src/types/interfaces.ts` 中新增字段：

```typescript
export interface InitAnswers {
    // ... 现有字段 ...

    /**
     * 是否初始化 AI 开发配置
     */
    isInitAI: boolean
    /**
     * 要初始化的 AI 工具列表
     */
    aiTools: ('claude' | 'copilot' | 'cursor' | 'windsurf' | 'codex' | 'gemini-cli' | 'opencode')[]
    /**
     * 是否启用 AI 引导模式
     */
    isAIAssisted: boolean
    /**
     * AI 引导的用户输入（项目功能描述）
     */
    aiUserInput?: string
    /**
     * AI 生成的候选名称列表
     */
    aiGeneratedNames?: string[]
    /**
     * AI 生成的项目描述
     */
    aiGeneratedDescription?: string
    /**
     * AI 生成的关键词
     */
    aiGeneratedKeywords?: string[]
    /**
     * AI 推荐的模板
     */
    aiRecommendedTemplate?: string
}
```

#### 2.3.3 TemplateCliConfig 类型扩展

在 `.ctrc` 配置中新增 AI 相关字段：

```typescript
export type TemplateCliConfig = {
    // ... 现有字段 ...

    /**
     * AI API 基础地址，兼容 OpenAI Chat Completions 格式
     */
    AI_API_BASE?: string
    /**
     * AI API 密钥
     */
    AI_API_KEY?: string
    /**
     * AI 模型名称
     */
    AI_MODEL?: string
}
```

#### 2.3.4 .ctrc 配置文件示例

```json5
{
  // 现有配置
  "GITHUB_TOKEN": "",
  "GITHUB_USERNAME": "",
  // ...

  // AI 相关配置（可选）
  "AI_API_BASE": "https://api.openai.com/v1",
  "AI_API_KEY": "",
  "AI_MODEL": "gpt-4o-mini"
}
```

---

## 三、技术实现方案

### 3.1 新增文件列表

| 文件路径 | 用途 |
|---------|------|
| `src/core/ai.ts` | AI 脚手架初始化核心逻辑 |
| `src/utils/ai-api.ts` | AI API 调用封装 |
| `src/pure/ai.ts` | AI 相关纯函数（prompt 构建、响应解析） |
| `templates/AGENTS.md.ejs` | AGENTS.md EJS 模板（单一信息源） |
| `templates/.github/copilot-instructions.md.ejs` | Copilot 配置模板（引用 AGENTS.md） |
| `templates/.cursorrules.ejs` | Cursor 配置模板（可选） |
| `templates/.windsurfrules.ejs` | Windsurf 配置模板（可选） |
| `templates/.claude/settings.json` | Claude settings 静态文件 |
| `src/core/ai.test.ts` | AI 模块测试 |
| `src/pure/ai.test.ts` | AI 纯函数测试 |
| `src/utils/ai-api.test.ts` | AI API 测试 |

### 3.2 修改文件列表

| 文件路径 | 修改内容 |
|---------|---------|
| `src/types/interfaces.ts` | 新增 AI 相关类型定义（`isInitAI`、`aiTools`、`isAIAssisted` 等） |
| `src/plopfile.ts` | 新增 AI 相关交互问题（是否初始化 AI、选择 AI 工具、是否 AI 引导） |
| `src/utils/utils.ts` | 在 `init()` 函数中集成 AI 脚手架初始化调用 |
| `src/core/project-info.ts` | `buildProjectInfo` 中新增 AI 相关字段的处理 |
| `src/utils/config.ts` | 支持读取 `.ctrc` 中的 AI 相关配置 |

### 3.3 核心模块设计

#### 3.3.1 `src/core/ai.ts` — AI 脚手架初始化

```typescript
/**
 * 初始化 AI 开发配置文件
 * 根据 aiTools 选项决定生成哪些文件
 */
export async function initAIScaffolding(
    projectPath: string,
    projectInfo: ProjectInfo
): Promise<void>

/**
 * 初始化 AGENTS.md（单一信息源）
 * 基于 EJS 模板 + ProjectInfo 渲染
 * 所有支持 AGENTS.md 的工具（Claude Code、Codex、Gemini CLI、OpenCode）共用此文件
 */
export async function initAgentsMd(
    projectPath: string,
    projectInfo: ProjectInfo
): Promise<void>

/**
 * 初始化 GitHub Copilot 配置
 * 内容为引用 AGENTS.md 的简短指令，避免内容重复
 */
export async function initCopilotInstructions(
    projectPath: string,
    projectInfo: ProjectInfo
): Promise<void>

/**
 * 初始化 .cursorrules（可选）
 */
export async function initCursorRules(
    projectPath: string,
    projectInfo: ProjectInfo
): Promise<void>

/**
 * 初始化 .windsurfrules（可选）
 */
export async function initWindsurfRules(
    projectPath: string,
    projectInfo: ProjectInfo
): Promise<void>

/**
 * 初始化 .claude/ 目录结构
 */
export async function initClaudeDirectory(
    projectPath: string
): Promise<void>

/**
 * 初始化 .cursor/ 目录结构（可选）
 */
export async function initCursorDirectory(
    projectPath: string
): Promise<void>
```

#### 3.3.2 `src/utils/ai-api.ts` — AI API 封装

```typescript
interface AICompletionRequest {
    prompt: string
    apiKey?: string
    apiBase?: string
    model?: string
    temperature?: number
}

interface AIProjectSuggestion {
    names: string[]
    description: string
    keywords: string[]
    template: string
}

/**
 * 调用 AI API 获取项目建议
 */
export async function getAIProjectSuggestion(
    userInput: string,
    config: TemplateCliConfig
): Promise<AIProjectSuggestion>

/**
 * 通用 AI Chat Completions 调用
 */
export async function chatCompletion(
    request: AICompletionRequest
): Promise<string>
```

#### 3.3.3 `src/pure/ai.ts` — AI 纯函数

```typescript
/**
 * 构建 AI 引导 prompt
 */
export function buildProjectSuggestionPrompt(
    userInput: string,
    availableTemplates: TemplateMeta[]
): string

/**
 * 解析 AI 返回的 JSON 响应
 * 容错处理：支持 markdown code block 包裹的 JSON
 */
export function parseAIResponse(
    response: string
): AIProjectSuggestion | null

/**
 * 根据 AI 工具列表确定要生成的文件
 */
export function getAIFilesToGenerate(
    aiTools: ('claude' | 'copilot' | 'cursor' | 'windsurf' | 'codex' | 'gemini-cli' | 'opencode')[]
): string[]
```

### 3.4 依赖说明

| 依赖 | 用途 | 类型 |
|------|------|------|
| `axios`（已有） | AI API HTTP 调用 | 生产依赖 |
| 无新增依赖 | — | — |

> AI API 调用直接使用已有的 `axios` 库，遵循 OpenAI Chat Completions 兼容格式，无需引入额外的 AI SDK。

---

## 四、影响范围分析

### 4.1 对现有功能的影响

| 影响项 | 影响程度 | 说明 |
|--------|---------|------|
| 问答流程 | 低 | 新增 2-3 个可选问题，使用 `when` 条件控制 |
| 初始化流程 | 低 | 在现有流程中增加一个步骤 |
| 类型定义 | 低 | 扩展接口，新增字段均为可选 |
| 模板文件 | 无 | 新增独立模板文件，不影响现有模板 |
| 构建配置 | 无 | 无需修改 tsup、tsconfig 等 |
| 测试 | 低 | 新增独立测试文件 |

### 4.2 向后兼容性

- **完全向后兼容**：所有 AI 功能默认可选，`.ctrc` 中 AI 相关字段均为可选
- **无 AI 环境用户**：选择不启用 AI 时，行为与现有版本完全一致
- **已有项目升级**：不影响已创建的项目

---

## 五、其他考虑事项

### 5.1 安全性

| 问题 | 措施 |
|------|------|
| API Key 泄露 | `.ctrc` 文件已包含在 `.gitignore` 中，AI API Key 仅存储在本地 |
| Prompt 注入 | 对用户输入进行基本的转义和长度限制（最大 500 字符） |
| 网络安全 | AI API 调用强制使用 HTTPS（本地 Ollama 除外） |
| 生成的文件内容 | AI 生成的配置文件仅包含静态模板内容，不包含敏感信息 |

### 5.2 性能

| 问题 | 措施 |
|------|------|
| AI API 延迟 | 设置 30 秒超时，提供 spinner 反馈 |
| 文件生成数量 | AI 脚手架文件均为小型文本文件，生成耗时 < 100ms |
| 网络不可用 | AI 引导功能优雅降级到标准流程，AI 脚手架文件为纯本地生成 |

### 5.3 可扩展性

- **新 AI 工具支持**：通过在 `aiTools` 选项中新增选项 + 新增对应模板文件即可
- **自定义模板**：用户可修改生成的 AI 配置文件，不会被后续操作覆盖（仅初始化时生成）
- **Prompt 优化**：Prompt 构建逻辑独立在 `src/pure/ai.ts` 中，便于迭代优化
- **多模型支持**：通过 `.ctrc` 配置支持任意 OpenAI 兼容 API，包括本地模型

### 5.4 测试策略

| 测试类型 | 覆盖范围 |
|---------|---------|
| 单元测试 | `src/pure/ai.ts`（prompt 构建、响应解析） |
| 单元测试 | `src/utils/ai-api.ts`（API 调用，mock axios） |
| 集成测试 | `src/core/ai.ts`（文件生成，使用临时目录） |
| 手动测试 | 完整 CLI 流程，包括 AI 引导和标准流程 |

### 5.5 文档更新

- 更新 `README.md`：新增 AI 功能说明
- 更新 `.ctrc` 示例：新增 AI 相关配置字段说明
- 新增 `templates/` 目录说明：列出所有 AI 模板文件

---

## 六、实施计划

### 阶段一：AI 脚手架初始化（功能 A）

1. 新增 `src/types/interfaces.ts` 中的 AI 相关类型
2. 创建 `templates/AGENTS.md.ejs` 等模板文件
3. 创建 `src/core/ai.ts` 实现文件生成逻辑
4. 在 `src/plopfile.ts` 中添加 AI 相关问题
5. 在 `src/utils/utils.ts` 的 `init()` 中集成调用
6. 编写单元测试和集成测试

### 阶段二：配置选项完善（功能 C）

1. 扩展 `TemplateCliConfig` 类型
2. 更新 `src/utils/config.ts` 支持 AI 配置读取
3. 完善 plopfile 中的条件显示逻辑
4. 编写配置相关测试

### 阶段三：AI 引导功能（功能 B）

1. 创建 `src/pure/ai.ts` 实现 prompt 构建和响应解析
2. 创建 `src/utils/ai-api.ts` 实现 API 调用封装
3. 在 `src/plopfile.ts` 中集成 AI 引导交互流程
4. 实现降级策略和错误处理
5. 编写 API mock 测试

---

## 七、总结

本设计方案为 cmyr-template-cli 引入了两个核心 AI 功能：

1. **AI 脚手架初始化** — 以 `AGENTS.md` 为单一信息源，默认为项目生成 AI 编码工具的配置文件（Claude Code/Codex/Gemini CLI/OpenCode + GitHub Copilot），其他工具（Cursor/Windsurf）可选启用。Copilot 配置通过引用 AGENTS.md 避免内容重复
2. **AI 引导模式** — 可选的智能引导，通过自然语言描述生成项目元信息

设计遵循渐进式增强原则，所有 AI 功能均为可选，不影响现有用户体验。技术实现复用现有架构模式（EJS 模板渲染、ora 进度提示、`.ctrc` 配置文件），无新增硬依赖，维护成本低。
