# AGENTS.md

本项目是草梅友仁自制的项目模板创建器 (cmyr-template-cli)，基于 TypeScript + Node.js 构建。

## 项目架构

### 目录结构

- `src/core/` — 核心业务逻辑层：各类初始化函数（tooling, testing, docker, docs, ai 等）
- `src/pure/` — 纯函数层：无副作用的工具函数（字符串处理、AI prompt 构建、CI 配置生成）
- `src/utils/` — 工具层：带有 I/O 副效应的操作（文件操作、API 调用、EJS 渲染、配置加载）
- `src/config/` — 环境配置
- `src/types/` — TypeScript 类型定义
- `templates/` — EJS 模板文件（AGENTS.md, copilot-instructions, .cursorrules, .windsurfrules, .claude/ 等）

### 主流程

`plopfile.ts` → `utils.ts:init()` → 依次调用 `core/*:init*()` 函数

## 技术栈

- **语言**: TypeScript (CommonJS)
- **运行时**: Node.js >= 18
- **包管理器**: pnpm
- **构建工具**: tsup (CJS 输出)
- **测试框架**: vitest
- **代码规范**: eslint-config-cmyr
- **主要依赖**: plop, inquirer, ejs, fs-extra, ora, axios, lodash

## 开发命令

```bash
pnpm run dev          # 开发模式（watch）
pnpm run build        # 生产构建
pnpm run test         # 运行测试
pnpm run lint         # ESLint 检查并自动修复
pnpm run typecheck    # TypeScript 类型检查
pnpm run coverage     # 测试覆盖率
```

运行单个测试：`npx vitest run src/core/ai.test.ts`

## 多代理编排能力

在执行复杂任务时，**优先使用 sub-agent 和 agent team 等多代理编排能力**：

- **Agent Teams**: 创建团队（TeamCreate），分配任务（TaskCreate/TaskUpdate），并行执行独立任务，通过 SendMessage 协调
- **Sub-agents**: 使用 Agent 工具启动专用子代理（Explore、Plan、general-purpose），并行探索和实现
- **并行执行**: 独立的任务应尽可能并行处理，最大化效率

典型编排模式：
1. 需求分析阶段：使用 Explore sub-agent 理解代码库
2. 实现阶段：创建 Team，分配开发者、测试员、审查员角色并行工作
3. 验证阶段：测试员写测试，审查员做 code review，开发者修复问题

## 代码规范

- 提交信息遵循 Conventional Commits（feat/fix/docs/refactor/test/build/ci/chore）
- 每个文件最大 500 行
- 注释和日志使用中文
- Init 函数遵循 ora spinner 模式：`ora().start()` → try/catch → `succeed()/fail()`
- 测试使用 vitest（globals 模式），Mock 使用 `vi.mock()` + `vi.mocked()`

## 注意事项

- `npm run typecheck` 中来自 node_modules 的类型错误是已知的预存在问题，不需要修复
- 路径别名 `@/` 映射到 `src/`
- EJS 模板数据来自 `ProjectInfo` 接口
- 新增 init 函数时参考 `src/core/tooling.ts` 的模式
