<h1 align="center">cmyr-template-cli </h1>
<p>
  <a href="https://www.npmjs.com/package/cmyr-template-cli" target="_blank">
    <img alt="Version" src="https://img.shields.io/npm/v/cmyr-template-cli.svg">
  </a>
  <a href="https://www.npmjs.com/package/cmyr-template-cli" target="_blank">
    <img alt="npm downloads" src="https://img.shields.io/npm/dt/cmyr-template-cli?label=npm%20downloads&color=yellow">
  </a>
  <a href="https://app.codecov.io/gh/CaoMeiYouRen/cmyr-template-cli" target="_blank">
     <img alt="Codecov" src="https://img.shields.io/codecov/c/github/CaoMeiYouRen/cmyr-template-cli">
  </a>
  <a href="https://github.com/CaoMeiYouRen/cmyr-template-cli/actions?query=workflow%3ARelease" target="_blank">
    <img alt="GitHub Workflow Status" src="https://img.shields.io/github/actions/workflow/status/CaoMeiYouRen/cmyr-template-cli/release.yml?branch=master">
  </a>
  <img src="https://img.shields.io/node/v/cmyr-template-cli.svg" />
  <a href="https://github.com/CaoMeiYouRen/cmyr-template-cli#readme" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/CaoMeiYouRen/cmyr-template-cli/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
  <a href="https://github.com/CaoMeiYouRen/cmyr-template-cli/blob/master/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
</p>

> 草梅友仁自制的项目模板创建器

### 🏠 [主页](https://github.com/CaoMeiYouRen/cmyr-template-cli#readme)

[https://github.com/CaoMeiYouRen/cmyr-template-cli#readme](https://github.com/CaoMeiYouRen/cmyr-template-cli#readme)

### ✨ [Demo](https://github.com/CaoMeiYouRen/cmyr-template-cli#readme)

[https://github.com/CaoMeiYouRen/cmyr-template-cli#readme](https://github.com/CaoMeiYouRen/cmyr-template-cli#readme)

## 依赖要求

-   node >=18

## 安装

```sh
npm i -g cmyr-template-cli

# 或者 yarn global cmyr-template-cli
# 或者 pnpm i -g cmyr-template-cli
```

## 使用

```sh
ct
# 或
ct create
```

## AI 功能

### AI 脚手架初始化

在项目初始化时，可以选择生成 AI 开发配置文件，为 AI 辅助编程提供项目上下文。

生成的文件包括：

| 工具 | 配置文件 | 说明 |
|------|---------|------|
| Claude Code / Codex / Gemini CLI / OpenCode | `AGENTS.md` + `.claude/` | 默认启用，单一信息源 |
| GitHub Copilot | `.github/copilot-instructions.md` | 默认启用，引用 AGENTS.md |
| Cursor | `.cursorrules` | 可选 |
| Windsurf | `.windsurfrules` | 可选 |

- `AGENTS.md` - AI Agent 配置的单一信息源，包含项目结构、技术栈、开发规范等信息
- `.claude/` - Claude Code 的设置、技能和代理目录
- `.github/copilot-instructions.md` - GitHub Copilot 指令文件，引用 AGENTS.md
- `.cursorrules` - Cursor 编辑器配置（可选）
- `.windsurfrules` - Windsurf 编辑器配置（可选）

### AI 引导模式

支持 AI 引导的项目创建模式。在初始化时，您可以用自然语言描述您的项目需求，AI 将自动：

- 生成合适的项目名称
- 编写项目描述
- 提取关键词
- 推荐最适合的项目模板

## 配置

在当前目录下或 `HOME` 路径下创建 `.ctrc` 文件即可，格式为 `json`

```json
{
    "GITHUB_TOKEN": "",
    "GITEE_TOKEN": "",
    "GITHUB_USERNAME": "",
    "GITEE_USERNAME": "",
    "AFDIAN_USERNAME": "",
    "PATREON_USERNAME": "",
    "WEIBO_USERNAME": "",
    "TWITTER_USERNAME": "",
    "NPM_USERNAME": "",
    "DOCKER_USERNAME": "",
    "DOCKER_PASSWORD": "",
    "CONTACT_EMAIL": "",
    "NPM_TOKEN": "",
    "AI_API_BASE": "https://api.openai.com/v1",
    "AI_API_KEY": "",
    "AI_MODEL": "gpt-4o-mini"
}
```

GITHUB_TOKEN：可空，默认值为空。请参考： [创建用于命令行的个人访问令牌](https://help.github.com/cn/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line)

GITEE_TOKEN：可空，默认值为空。请参考：[私人令牌](https://gitee.com/profile/personal_access_tokens)

GITHUB_USERNAME：GitHub 用户名，可空，默认会使用 `git config user.name` 的用户名

GITEE_USERNAME：码云用户名，可空，默认值为空

AFDIAN_USERNAME：爱发电用户名，可空，默认值为空

PATREON_USERNAME：Patreon 用户名，可空，默认值为空

WEIBO_USERNAME：微博用户名，可空，默认值为空

TWITTER_USERNAME：Twitter 用户名，可空，默认值为空

NPM_USERNAME：Npm 用户名，可空，默认会使用 `GITHUB_USERNAME` 的用户名

DOCKER_USERNAME：Docker Hub 用户名，可空，默认会使用**小写的** `GITHUB_USERNAME` 的用户名

DOCKER_PASSWORD：Docker Hub 密码，可空，默认值为空。如果填写，会自动初始化对应的仓库 action secret

CONTACT_EMAIL：联系邮箱，可空，默认值为空

NPM_TOKEN：Npm 令牌，可空，默认值为空。如果填写，会自动初始化对应的仓库 action secret

AI_API_BASE：AI API 基础地址，兼容 OpenAI Chat Completions 格式。可空，默认值为 `https://api.openai.com/v1`。支持 Ollama 本地模型（`http://localhost:11434/v1`）

AI_API_KEY：AI API 密钥。可空，默认值为空。仅在启用 AI 引导模式时需要

AI_MODEL：AI 模型名称。可空，默认值为 `gpt-4o-mini`

**如果不使用自动初始化远程仓库功能，可以跳过该配置**

## 开发

```sh
npm run dev
```

## 编译

```sh
npm run build
```

## Lint

```sh
npm run lint
```

## Commit

```sh
npm run commit
```

## 作者

👤 **CaoMeiYouRen**

-   Website: [https://blog.cmyr.ltd/](https://blog.cmyr.ltd/)
-   GitHub: [@CaoMeiYouRen](https://github.com/CaoMeiYouRen)

## 🤝 贡献

欢迎 贡献、提问或提出新功能！<br />如有问题请查看 [issues page](https://github.com/CaoMeiYouRen/cmyr-template-cli/issues). <br/>贡献或提出新功能可以查看[contributing guide](https://github.com/CaoMeiYouRen/cmyr-template-cli/blob/master/CONTRIBUTING.md).

## 💰 支持

如果觉得这个项目有用的话请给一颗 ⭐️，非常感谢

## 📝 License

Copyright © 2021 [CaoMeiYouRen](https://github.com/CaoMeiYouRen).<br />
This project is [MIT](https://github.com/CaoMeiYouRen/cmyr-template-cli/blob/master/LICENSE) licensed.

---

_This README was generated with ❤️ by [cmyr-template-cli](https://github.com/CaoMeiYouRen/cmyr-template-cli)_
