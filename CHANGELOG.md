# cmyr-template-cli

## [1.42.2](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.42.1...v1.42.2) (2025-12-10)


### 🐛 Bug 修复

* 移除 vitest 配置中的覆盖率设置 ([b90acb2](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/b90acb2))

## [1.42.1](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.42.0...v1.42.1) (2025-12-10)


### 🐛 Bug 修复

* 更新模板元数据，启用 Docker 支持并注释掉 webpack 模板配置 ([0ffdf09](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/0ffdf09))

# [1.42.0](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.41.8...v1.42.0) (2025-11-15)


### ✨ 新功能

* **core:** 重构核心模块结构 ([257668a](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/257668a))
* 重构 GitHub 和 Docker 初始化功能，包含工作流和依赖管理 ([0be3988](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/0be3988))


### 🐛 Bug 修复

* 更新获取 npm 包版本的逻辑，支持提取语义版本号 ([d756d0a](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/d756d0a))


### 📦 代码重构

* **utils:** 重构工具函数结构 ([73e6618](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/73e6618))
* 重构 git 相关功能和测试用例 ([49693d4](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/49693d4))
* 重构 README.md 和贡献指南初始化逻辑，提取公共模板渲染函数 ([ea15673](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/ea15673))

## [1.41.8](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.41.7...v1.41.8) (2025-10-30)


### 🐛 Bug 修复

* 移除不再需要的 NPM_TOKEN 配置，并更新相关逻辑 ([feb05bf](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/feb05bf))

## [1.41.7](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.41.6...v1.41.7) (2025-10-19)


### 🐛 Bug 修复

* 启用 npm 发布并更新工作流配置 ([ed20b27](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/ed20b27))
* 添加 pnpm 配置以覆盖 semantic-release 依赖版本 ([2372226](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/2372226))

## [1.41.6](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.41.5...v1.41.6) (2025-10-18)


### 🐛 Bug 修复

* 添加 homepage、repository 和 bugs 字段到 package.json ([531c752](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/531c752))

## [1.41.5](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.41.4...v1.41.5) (2025-09-28)


### 🐛 Bug 修复

* 修改 Dependabot 更新频率为每月，并调整 YAML 输出格式 ([b3a1a70](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/b3a1a70))
* 修改 husky 初始化脚本为 'husky' ([8482f0d](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/8482f0d))
* 修正 ESLint 配置类型为 'eslint-config-cmyr' ([b20fc9c](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/b20fc9c))
* 更新 initDependabot 函数，设置每月更新时间为 04:00，并调整时区为上海 ([4a01d59](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/4a01d59))
* 更新 initDependabot 函数的 YAML 配置，调整键值类型和双引号语法 ([17ce5c0](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/17ce5c0))

## [1.41.4](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.41.3...v1.41.4) (2025-09-21)


### 🐛 Bug 修复

* 更新工作流配置，优化并统一各个 YAML 文件的结构 ([602bb35](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/602bb35))

## [1.41.3](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.41.2...v1.41.3) (2025-08-27)


### 🐛 Bug 修复

* 修复 initEslint 函数中的 lint 脚本和开发依赖合并逻辑 ([85a2a26](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/85a2a26))
* 更新 initSemanticRelease 函数中的开发依赖，移除版本限制 ([832df5d](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/832df5d))
* 更新多个开发依赖的版本获取方式，改为动态获取最新版本 ([0ff756e](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/0ff756e))


### 📦 代码重构

* 精简 release 配置，移除不必要的插件 ([13f2502](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/13f2502))
* 精简 release 配置，移除多余的插件和逻辑 ([0f9f3e1](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/0f9f3e1))

## [1.41.2](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.41.1...v1.41.2) (2025-08-26)


### 🐛 Bug 修复

* 优化 dependabot 更新忽略逻辑，删除空依赖时清空 ignore ([9e5cc36](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/9e5cc36))

## [1.41.1](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.41.0...v1.41.1) (2025-08-26)


### 🐛 Bug 修复

* 在项目依赖生成中移除 commitlint 和 conventional-changelog-cli ([f5b71b4](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/f5b71b4))
* 更新 vitest 和 vite 的版本依赖 ([3be447b](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/3be447b))
* 移除对 semantic-release 的更新忽略 ([67c4828](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/67c4828))

# [1.41.0](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.40.0...v1.41.0) (2025-08-26)


### ✨ 新功能

* 优化 commitlint 配置逻辑 ([07c1be3](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/07c1be3))
* 更新 release 配置，添加新的 release.config.js 文件并升级相关依赖 ([fb89154](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/fb89154))
* 重构 ESLint 配置，移除不必要的依赖并添加新的配置文件 ([97857f2](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/97857f2))
* 重构初始化配置，优化 .editorconfig 和 commitlint 的支持 ([6a3ff6e](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/6a3ff6e))


### 🐛 Bug 修复

* 更新 commitizen 版本，重构 commitlint 配置，添加新的配置文件 ([1968e52](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/1968e52))
* 更新 REMOTES 常量，添加多个新的 GitHub 代理链接 ([f6dc540](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/f6dc540))
* 移除旧的 commitizen 配置，优化项目初始化逻辑 ([26b4e07](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/26b4e07))
* 统一引号风格，优化代码结构，修复导入顺序 ([10c533a](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/10c533a))


### 📦 代码重构

* 更新 stylelint 配置，移除不必要的依赖并添加新的配置文件 ([cc74f18](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/cc74f18))

# [1.40.0](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.39.3...v1.40.0) (2025-08-18)


### ✨ 新功能

* 添加 Funding 初始化功能及模板配置 ([bb64c08](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/bb64c08))

## [1.39.3](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.39.2...v1.39.3) (2025-08-07)


### 🐛 Bug 修复

* 将 ignore 属性改为可选，并更新 YAML 字符串化配置 ([7879e7b](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/7879e7b))

## [1.39.2](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.39.1...v1.39.2) (2025-06-30)


### 🐛 Bug 修复

* 修正关键词输入过滤逻辑以去除多余空格 ([b417ee8](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/b417ee8))

## [1.39.1](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.39.0...v1.39.1) (2025-05-31)


### 🐛 Bug 修复

* 添加 GitHub 链接到 ISC 和 MIT 许可证的版权声明 ([8d3c45f](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/8d3c45f))

# [1.39.0](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.38.0...v1.39.0) (2025-05-31)


### ✨ 新功能

* 添加 tsdown-template 模板元数据 ([c2bf033](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/c2bf033))

# [1.38.0](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.37.3...v1.38.0) (2025-03-20)


### ✨ 新功能

* 添加 ISSUE_TEMPLATE 初始化功能，包括 Bug 报告、功能请求和问题模板 ([94fbaca](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/94fbaca))
* 添加 Pull Request 模板初始化功能 ([6dd4435](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/6dd4435))
* 添加 SECURITY.md 模板并在初始化过程中支持安全策略配置 ([af12e62](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/af12e62))

## [1.37.3](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.37.2...v1.37.3) (2025-03-19)


### 🐛 Bug 修复

* 更新 dependabot 配置，禁用特定依赖项的版本更新并添加 GitHub Actions 自动更新 ([534873b](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/534873b))

## [1.37.2](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.37.1...v1.37.2) (2025-03-19)


### 🐛 Bug 修复

* 添加 art-template 依赖项，版本要求不大于 >= 4.13.3 ([fe921e8](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/fe921e8))

## [1.37.1](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.37.0...v1.37.1) (2025-03-15)


### 🐛 Bug 修复

* 更新 nuxt-template 为 nuxt-latest-template，并将 Vue 版本更改为 3 ([8057500](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/8057500))

# [1.37.0](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.36.1...v1.37.0) (2025-02-22)


### ✨ 新功能

* 添加 tauri-template 模板到常量列表 ([c724e99](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/c724e99))

## [1.36.1](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.36.0...v1.36.1) (2025-01-21)


### 🐛 Bug 修复

* 在模板元数据中添加标签；优化获取模板元数据的函数返回类型；重构项目信息获取逻辑以包含关键词 ([98c99ff](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/98c99ff))

# [1.36.0](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.35.2...v1.36.0) (2025-01-18)


### ♻ 代码重构

* 将 API 相关功能提取到新文件 api.ts，优化代码结构 ([6ff6ff4](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/6ff6ff4))
* 将 TemplateCliConfig、GiteeRepo、GithubRepo 和 GithubTopics 类型移至 interfaces.ts，优化代码结构 ([0d9c3f3](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/0d9c3f3))
* 添加常量和依赖项管理，重构 utils 模块 ([da80520](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/da80520))
* 重构 utils 模块，拆分功能到新文件并优化依赖管理 ([b225fd9](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/b225fd9))
* 重构 utils 模块，拆分功能到新文件并优化导入 ([c54a9ed](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/c54a9ed))
* 重构文件结构，移动常量和接口定义到新的目录 ([43977fc](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/43977fc))


### ✨ 新功能

* 更新 README，添加 Docker 密码和 NPM 令牌配置；在接口中新增相关类型；重构 API 模块以支持创建和更新仓库密钥 ([6a2be63](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/6a2be63))

## [1.35.2](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.35.1...v1.35.2) (2025-01-14)


### 🐛 Bug 修复

* 删除不再使用的 release 和 commitlint 配置文件 ([173533a](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/173533a))

## [1.35.1](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.35.0...v1.35.1) (2025-01-10)


### 🐛 Bug 修复

* 更新 README 模板中的图像链接以使用新的 OSS 地址 ([4b541d0](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/4b541d0))

# [1.35.0](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.34.2...v1.35.0) (2025-01-08)


### ✨ 新功能

* 为模板元数据添加标签支持，更新 Docker 初始化逻辑以处理 hono 模板 ([5ebef21](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/5ebef21))


### 🐛 Bug 修复

* 添加模板元数据中的标签支持 ([55becd6](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/55becd6))

## [1.34.2](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.34.1...v1.34.2) (2025-01-07)


### 🐛 Bug 修复

* 修复 README 模板中添加项目先决条件的徽章支持 ([101e545](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/101e545))

## [1.34.1](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.34.0...v1.34.1) (2024-12-14)


### 🐛 Bug 修复

* 扩展支持的文件扩展名；更新贡献者公约文件 ([e6cec40](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/e6cec40))

# [1.34.0](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.33.3...v1.34.0) (2024-12-14)


### ✨ 新功能

* 添加贡献者公约初始化功能；更新配置说明和链接 ([ebc257c](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/ebc257c))

## [1.33.3](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.33.2...v1.33.3) (2024-12-13)


### 🐛 Bug 修复

* **utils:** 更新 initRemoteGitRepo 函数以支持 npm 发布 ([8430463](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/8430463))

## [1.33.2](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.33.1...v1.33.2) (2024-12-11)


### 🐛 Bug 修复

* 移除 `promise.any` 依赖 ([2954508](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/2954508))

## [1.33.1](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.33.0...v1.33.1) (2024-12-11)


### 🐛 Bug 修复

* 更新构建工具和依赖；移除缓存步骤以优化工作流 ([6d9f358](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/6d9f358))

# [1.33.0](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.32.3...v1.33.0) (2024-12-06)


### ✨ 新功能

* 添加 GitHub 仓库主题更新功能 ([240bfee](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/240bfee))

## [1.32.3](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.32.2...v1.32.3) (2024-11-30)


### 🐛 Bug 修复

* 添加 Docker 配置和 GitHub Actions 工作流；优化 Docker 文件和脚本 ([ad0e081](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/ad0e081))

## [1.32.2](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.32.1...v1.32.2) (2024-10-30)


### 🐛 Bug 修复

* 修改 默认 release 设置 ([27cf3e2](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/27cf3e2))

## [1.32.1](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.32.0...v1.32.1) (2024-10-29)


### 🐛 Bug 修复

* 修改 选项默认值 ([f1a4727](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/f1a4727))

# [1.32.0](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.31.4...v1.32.0) (2024-10-29)


### ✨ 新功能

* 在 Github Workflows 中添加 todo 配置 ([f798533](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/f798533))

## [1.31.4](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.31.3...v1.31.4) (2024-10-25)


### 🐛 Bug 修复

* 修改 release 超时时间 ([4bc763d](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/4bc763d))

## [1.31.3](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.31.2...v1.31.3) (2024-10-17)


### 🐛 Bug 修复

* 修复 部分情况下 dependabot 的 ignore 字段存在重复的问题 ([73bb60b](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/73bb60b))
* 修复 部分情况下，重命名 js 文件后缀名 失败的问题 ([f909cc4](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/f909cc4))

## [1.31.2](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.31.1...v1.31.2) (2024-10-06)


### 🐛 Bug 修复

* 修改 hono-template 配置；增加 NODE_DEPENDENCIES ([aadff03](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/aadff03))

## [1.31.1](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.31.0...v1.31.1) (2024-09-23)


### 🐛 Bug 修复

* 修复 license 名称错误 ([5662245](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/5662245))

# [1.31.0](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.30.7...v1.31.0) (2024-09-23)


### ✨ 新功能

* 新增 hono-template 项目模板 ([b870db7](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/b870db7))

## [1.30.7](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.30.6...v1.30.7) (2024-09-15)


### 🐛 Bug 修复

* 修复 爱发电域名问题 ([7fcae78](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/7fcae78))

## [1.30.6](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.30.5...v1.30.6) (2024-08-28)


### 🐛 Bug 修复

* 优化 常见依赖新增 p-queue ([bd5c3b0](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/bd5c3b0))

## [1.30.5](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.30.4...v1.30.5) (2024-08-19)


### 🐛 Bug 修复

* 修复 部分情况下 isInitDocker 未定义的 bug ([47425c2](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/47425c2))

## [1.30.4](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.30.3...v1.30.4) (2024-08-05)


### 🐛 Bug 修复

* 修复 minify-docker.js 脚本的错误 ([4f8fd4c](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/4f8fd4c))
* 增加部分默认依赖 ([d954284](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/d954284))

## [1.30.3](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.30.2...v1.30.3) (2024-07-24)


### 🐛 Bug 修复

* 修复 husky 配置错误 ([75febdd](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/75febdd))

## [1.30.2](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.30.1...v1.30.2) (2024-07-19)


### 🐛 Bug 修复

* 新增 zx 依赖 ([3a3153d](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/3a3153d))
* 移除部分过时的项目模板 ([037d525](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/037d525))

## [1.30.1](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.30.0...v1.30.1) (2024-07-16)


### 🐛 Bug 修复

* 增加 docker hub 相关配置和徽章 ([b90fa8a](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/b90fa8a))

# [1.30.0](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.29.2...v1.30.0) (2024-07-07)


### ✨ 新功能

* 新增 判断 js 文件的模块类型，解决 cjs 和 esm 的兼容问题 ([e1a3e73](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/e1a3e73))


### 🐛 Bug 修复

* 修复 footer-max-line-length 问题 ([af750a0](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/af750a0))

## [1.29.2](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.29.1...v1.29.2) (2024-07-06)


### 🐛 Bug 修复

* 修改 docker 的 WORKDIR 为 /app ([68cd323](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/68cd323))

## [1.29.1](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.29.0...v1.29.1) (2024-07-06)


### 🐛 Bug 修复

* 修复 dockerfile 中存在多余的 && 的问题 ([0d13934](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/0d13934))

# [1.29.0](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.28.10...v1.29.0) (2024-06-24)


### ✨ 新功能

* 新增 JS 模块规范选择；优化对 esm 规范项目的支持 ([b95ce4c](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/b95ce4c))

## [1.28.10](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.28.9...v1.28.10) (2024-06-23)


### 🐛 Bug 修复

* 更正 大小写不匹配问题 ([e102dc5](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/e102dc5))

## [1.28.9](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.28.8...v1.28.9) (2024-06-23)


### 🐛 Bug 修复

* 修复 Version 徽章错误 ([71bdac3](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/71bdac3))

## [1.28.8](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.28.7...v1.28.8) (2024-06-23)


### 🐛 Bug 修复

* 更新 Dockerfile 构建脚本 ([a532037](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/a532037))

## [1.28.7](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.28.6...v1.28.7) (2024-06-20)


### 🐛 Bug 修复

* 更新 部分情况下的 Version 徽章 ([6a6c5d9](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/6a6c5d9))

## [1.28.6](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.28.5...v1.28.6) (2024-06-12)


### 🐛 Bug 修复

* 修复 GITHUB_TOKEN 问题 ([f40ab56](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/f40ab56))

## [1.28.5](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.28.4...v1.28.5) (2024-06-08)


### 🐛 Bug 修复

* 修复 GitHub Action 的权限问题 ([562eb3f](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/562eb3f))

## [1.28.4](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.28.3...v1.28.4) (2024-06-08)


### 🐛 Bug 修复

* 优化：release 时不允许并发 ([5f4876d](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/5f4876d))

## [1.28.3](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.28.2...v1.28.3) (2024-06-08)


### 🐛 Bug 修复

* 优化 GitHub Action 的权限问题 ([ca4e0b9](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/ca4e0b9))

## [1.28.2](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.28.1...v1.28.2) (2024-06-04)


### 🐛 Bug 修复

* 修复 semantic-release 的版本问题 ([9d3655d](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/9d3655d))

## [1.28.1](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.28.0...v1.28.1) (2024-06-02)


### 🐛 Bug 修复

* 更新 github action 版本 ([f3140ad](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/f3140ad))

# [1.28.0](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.27.5...v1.28.0) (2024-04-28)


### ✨ 新功能

* 新增 jest 配置选项 ([30800a5](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/30800a5))

## [1.27.5](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.27.4...v1.27.5) (2024-04-27)


### 🐛 Bug 修复

* 优化 commitlint 配置 ([87ab16b](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/87ab16b))

## [1.27.4](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.27.3...v1.27.4) (2024-04-06)


### 🐛 Bug 修复

* 修复 @commitlint/cli 版本问题；修改 依赖安装时的 --frozen-lockfile ([96257ab](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/96257ab))

## [1.27.3](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.27.2...v1.27.3) (2024-04-06)


### 🐛 Bug 修复

* 修改 @commitlint/config-conventional 的位置 ([40b640e](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/40b640e))

## [1.27.2](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.27.1...v1.27.2) (2024-04-06)


### 🐛 Bug 修复

* 修复 @commitlint/config-conventional 的版本问题 ([3d28bbc](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/3d28bbc))

## [1.27.1](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.27.0...v1.27.1) (2024-04-04)


### 🐛 Bug 修复

* 修复 commitlint 版本更新导致的问题 ([36d07dd](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/36d07dd))

# [1.27.0](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.26.1...v1.27.0) (2024-03-31)


### ✨ 新功能

* 新增 tsup-template ([cb9a01e](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/cb9a01e))

## [1.26.1](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.26.0...v1.26.1) (2024-01-06)


### 🐛 Bug 修复

* 优化 pnpm 在 GitHub Action 的 cache ([a5c426e](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/a5c426e))
* 项目简介 增加 lintMd ([f8fd75e](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/f8fd75e))

# [1.26.0](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.25.4...v1.26.0) (2024-01-05)


### ✨ 新功能

* 修改 vite 相关模板；弃用部分 vite 模板 ([a929fc2](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/a929fc2))

## [1.25.4](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.25.3...v1.25.4) (2023-12-26)


### 🐛 Bug 修复

* 迁移 maven 到 gradle；优化 java 的 docker 构建；优化 nodejs 的 docker 构建 ([8633113](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/8633113))

## [1.25.3](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.25.2...v1.25.3) (2023-12-23)


### 🐛 Bug 修复

* 修复 闭源项目未初始化 项目信息的 bug ([9ca82d8](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/9ca82d8))

## [1.25.2](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.25.1...v1.25.2) (2023-12-21)


### 🐛 Bug 修复

* 优化 maven 的镜像源 ([6029b4d](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/6029b4d))

## [1.25.1](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.25.0...v1.25.1) (2023-12-18)


### 🐛 Bug 修复

* 优化 nodejs 的 dockerfile 配置 ([8611340](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/8611340))
* 优化 npmUsername 的设置；更新文档 ([87ce5f7](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/87ce5f7))

# [1.25.0](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.24.2...v1.25.0) (2023-12-09)


### ✨ 新功能

* 优化 初始化逻辑；增加 npm 私域包发布选项 ([320e753](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/320e753))


### 🐛 Bug 修复

* 优化 minify-docker.js ([7030fe2](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/7030fe2))
* 优化 minify-docker.js；优化 saveProjectJson ([9347dbd](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/9347dbd))

## [1.24.2](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.24.1...v1.24.2) (2023-12-09)


### 🐛 Bug 修复

* 修复 minify-docker 解析路径别名的问题 ([7ca6d9c](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/7ca6d9c))
* 修复 python dockerfile ([1de9d1a](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/1de9d1a))

## [1.24.1](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.24.0...v1.24.1) (2023-12-09)


### 🐛 Bug 修复

* 优化 maven 的依赖下载 ([faa4b1a](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/faa4b1a))
* 修复 GOPROXY 设置错误导致的构建失败 ([8d28177](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/8d28177))

# [1.24.0](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.23.0...v1.24.0) (2023-12-08)


### ✨ 新功能

* 优化 java 项目的 docker 构建 ([65cc425](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/65cc425))


### 🐛 Bug 修复

* golang docker 增加 镜像源; 分离下载和构建阶段 ([fbc2f23](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/fbc2f23))
* golang 的 docker 镜像改为分阶段构建 ([502c03e](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/502c03e))
* 优化 golang dockerfile ([5fc7fd3](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/5fc7fd3))
* 优化 License 指向；增加 License 的选择 ([ef9cd39](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/ef9cd39))
* 优化 License 的指向 ([0ad7bed](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/0ad7bed))
* 修复 java docker 配置 ([4ebc91e](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/4ebc91e))
* 修复 minify-docker.js 路径问题 ([04a0c7c](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/04a0c7c))

# [1.23.0](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.22.9...v1.23.0) (2023-12-07)


### ✨ 新功能

* 优化 nodejs 在 docker 打包时的体积 ([f97eb67](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/f97eb67))


### 🐛 Bug 修复

* 修复 tsconfig skipLibCheck 选项的问题 ([b12ae7a](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/b12ae7a))

## [1.22.9](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.22.8...v1.22.9) (2023-11-30)


### 🐛 Bug 修复

* 修复 semantic-release 版本问题；修复 dependabot 会自动升级问题 ([aa61717](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/aa61717))

## [1.22.8](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.22.7...v1.22.8) (2023-11-09)


### 🐛 Bug 修复

* 更新 docker 模板 ([2db21bd](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/2db21bd))

## [1.22.7](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.22.6...v1.22.7) (2023-10-27)


### 🐛 Bug 修复

* 修复 python 的 docker 配置错误 ([7f98f1b](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/7f98f1b))

## [1.22.6](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.22.5...v1.22.6) (2023-10-17)


### 🐛 Bug 修复

* 优化 执行命令行逻辑 ([591601c](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/591601c))

## [1.22.5](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.22.4...v1.22.5) (2023-10-16)


### 🐛 Bug 修复

* 优化 eslint 初始化逻辑；增加 eslint-plugin-import 初始化逻辑 ([a4d8abf](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/a4d8abf))

## [1.22.4](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.22.3...v1.22.4) (2023-10-15)


### 🐛 Bug 修复

* 新增 spring-boot-v3-template 项目模板 ([7bdd1bd](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/7bdd1bd))

## [1.22.3](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.22.2...v1.22.3) (2023-10-14)


### 🐛 Bug 修复

* 增加 react-vite-template 项目模板 ([ba40cf4](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/ba40cf4))

## [1.22.2](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.22.1...v1.22.2) (2023-10-10)


### 🐛 Bug 修复

* 修复 docker 初始化的问题 ([b438e8a](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/b438e8a))

## [1.22.1](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.22.0...v1.22.1) (2023-10-07)


### 🐛 Bug 修复

* 优化 docker 配置 ([caf1a6c](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/caf1a6c))

# [1.22.0](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.21.2...v1.22.0) (2023-10-05)


### ✨ 新功能

* 优化项目元信息；新增 java、python、golang 项目模板支持 ([ba600ee](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/ba600ee))

## [1.21.2](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.21.1...v1.21.2) (2023-09-22)


### 🐛 Bug 修复

* 优化 Node 端常见依赖 ([b7c8fcc](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/b7c8fcc))

## [1.21.1](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.21.0...v1.21.1) (2023-09-22)


### 🐛 Bug 修复

* 优化常见依赖选项 ([ceb47e1](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/ceb47e1))

# [1.21.0](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.20.1...v1.21.0) (2023-09-22)


### ✨ 新功能

* 优化常见依赖选项 ([01b21d8](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/01b21d8))


### 🐛 Bug 修复

* 回退 semantic-release 版本 ([58ac720](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/58ac720))

## [1.20.1](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.20.0...v1.20.1) (2023-09-19)


### 🐛 Bug 修复

* license 中增加 ISC ([5829aad](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/5829aad))
* 修复 lint-md 问题；修复 conventional-changelog-cmyr-config 版本问题 ([715052b](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/715052b))
* 回退 semantic-release 版本 ([a829822](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/a829822))

# [1.20.0](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.19.7...v1.20.0) (2023-09-17)


### ✨ 新功能

* 新增 GitHub/Gitee/Twitter/Patreon/微博/爱发电 等的自定义用户名；优化 README 页面 ([8ce7810](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/8ce7810))


### 🐛 Bug 修复

* 修复 HOME 路径的 bug ([fef444e](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/fef444e))
* 更新 文档；优化部分逻辑 ([f0b47fe](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/f0b47fe))

## [1.19.7](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.19.6...v1.19.7) (2023-08-30)


### 🐛 Bug 修复

* 修复 commitlint 在 type 为 module 时的错误 ([5635b68](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/5635b68))
* 增加 commitlint 旧配置的删除 ([69980fc](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/69980fc))

## [1.19.6](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.19.5...v1.19.6) (2023-07-07)


### 🐛 Bug 修复

* 更新 conventional-changelog-cmyr-config 版本错误 ([ef3294b](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/ef3294b))

## [1.19.5](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.19.4...v1.19.5) (2023-06-19)


### 🐛 Bug 修复

* 优化 爱发电图片 ([b9afb16](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/b9afb16))


* Merge branch 'master' of github.com:CaoMeiYouRen/cmyr-template-cli ([a18a67e](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/a18a67e))
* Merge pull request #60 from CaoMeiYouRen/dependabot/npm_and_yarn/commander-11.0.0 ([4fc2020](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/4fc2020)), closes [#60](https://github.com/CaoMeiYouRen/cmyr-template-cli/issues/60)

## [1.19.4](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.19.3...v1.19.4) (2023-06-15)


### 🐛 Bug 修复

* 修复 tsconfig watch 选项的问题；修复 贡献指南 排版 ([fc6a6b0](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/fc6a6b0))


* Merge pull request #59 from CaoMeiYouRen/dependabot/npm_and_yarn/conventional-changelog-cli-3.0.0 ([6c0fb33](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/6c0fb33)), closes [#59](https://github.com/CaoMeiYouRen/cmyr-template-cli/issues/59)

## [1.19.3](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.19.2...v1.19.3) (2023-06-14)


### 🐛 Bug 修复

* 优化：test.yml 支持手动执行 ([7f35259](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/7f35259))
* 优化：新增 patreon 赞助渠道 ([3fc7f7e](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/3fc7f7e))
* 修复 tsconfig.json 问题 ([9597147](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/9597147))
* 升级 eslint 相关版本 ([6e78d9b](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/6e78d9b))

## [1.19.2](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.19.1...v1.19.2) (2023-05-20)


### 🐛 Bug 修复

* 优化 kebabCase 的实现 ([5a9d785](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/5a9d785))

## [1.19.1](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.19.0...v1.19.1) (2023-05-20)


### 🐛 Bug 修复

* 修复 README.md 模板错误 ([bdf2b26](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/bdf2b26))

# [1.19.0](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.18.1...v1.19.0) (2023-05-18)


### ✨ 新功能

* 新增 Star History 支持；优化 README.md 模板的 emoji ([5206dcd](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/5206dcd))

## [1.18.1](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.18.0...v1.18.1) (2023-05-18)


### 🐛 Bug 修复

* 切换模板的包管理器为 pnpm ([46c55fe](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/46c55fe))

# [1.18.0](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.17.6...v1.18.0) (2023-05-17)


### ✨ 新功能

* 新增 electron-vite 模板 ([0449879](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/0449879))

## [1.17.6](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.17.5...v1.17.6) (2023-04-19)


### 🐛 Bug 修复

* 优化 GitHub Actions 的配置 ([7f4cd09](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/7f4cd09))

## [1.17.5](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.17.4...v1.17.5) (2023-04-10)


### 🐛 Bug 修复

* 更新 贡献指南 模板 ([cf154ac](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/cf154ac))

## [1.17.4](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.17.3...v1.17.4) (2023-04-05)


### 🐛 Bug 修复

* 设置 persist-credentials: false ([083496d](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/083496d))

## [1.17.3](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.17.2...v1.17.3) (2023-04-05)


### 🐛 Bug 修复

* 修复 版本号的读取错误 ([e9f69d1](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/e9f69d1))

## [1.17.2](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.17.1...v1.17.2) (2023-03-24)


### 🐛 Bug 修复

* 优化 eslint 新增 cjs、mjs 支持 ([a979302](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/a979302))
* 修复 eslint-config-cmyr 版本造成的 bug ([9a2c08c](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/9a2c08c))

## [1.17.1](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.17.0...v1.17.1) (2023-03-15)


### 🐛 Bug 修复

* 优化 移除了不必要的依赖 ([ca52bb9](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/ca52bb9))

# [1.17.0](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.16.0...v1.17.0) (2023-01-09)


### ✨ 新功能

* 新增 初始化 eslint 相关配置 ([0d138e9](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/0d138e9))

# [1.16.0](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.15.3...v1.16.0) (2023-01-09)


### ✨ 新功能

* 新增 初始化 stylelint 相关配置 ([652c46d](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/652c46d))

## [1.15.3](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.15.2...v1.15.3) (2022-12-18)


### 🐛 Bug 修复

* 修复 GitHub 徽章问题 ([688b154](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/688b154))

## [1.15.2](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.15.1...v1.15.2) (2022-11-25)


### 🐛 Bug 修复

* 移除 nodejs 版本更新缓慢的 nodejs.cn，不再作为镜像源 ([f9c3398](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/f9c3398))

## [1.15.1](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.15.0...v1.15.1) (2022-11-25)


### 🐛 Bug 修复

* 新增 关键词 选项；优化 husky 版本号；优化 项目注释 ([3ef1ceb](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/3ef1ceb))

# [1.15.0](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.14.4...v1.15.0) (2022-11-21)


### ✨ 新功能

* 新增 常见依赖的初始化；修复 tsconfig 初始化顺序 ([df9cbd4](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/df9cbd4))

## [1.14.4](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.14.3...v1.14.4) (2022-11-20)


### 🐛 Bug 修复

* 修复 GitHub 仓库初始化时的可见性错误 ([77d0299](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/77d0299))

## [1.14.3](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.14.2...v1.14.3) (2022-11-18)


### 🐛 Bug 修复

* 新增 GitHub 下载镜像源；优化删除文件 log ([9ef6dbd](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/9ef6dbd))

## [1.14.2](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.14.1...v1.14.2) (2022-11-10)


### 🐛 Bug 修复

* 优化 Node.js lts 版本号 的获取 ([7c258a6](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/7c258a6))

## [1.14.1](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.14.0...v1.14.1) (2022-10-07)


### 🐛 Bug 修复

* 优化 token 加载 ([0865bfa](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/0865bfa))

# [1.14.0](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.13.4...v1.14.0) (2022-09-14)


### ✨ 新功能

* 新增 Gitee 自动创建远程仓库功能 ([b363adb](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/b363adb))
* 新增 Github 自动创建远程仓库功能；更新文档；更新依赖 ([41419ba](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/41419ba))

## [1.13.4](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.13.3...v1.13.4) (2022-09-04)


### 🐛 Bug 修复

* 修复 .npmrc 缺失 ([714ea04](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/714ea04))

## [1.13.3](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.13.2...v1.13.3) (2022-09-02)


### 🐛 Bug 修复

* 修复 Dockerfile 缺失 .npmrc ([5f8f1ff](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/5f8f1ff))

## [1.13.2](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.13.1...v1.13.2) (2022-09-02)


### 🐛 Bug 修复

* 修复 pnpm 安装依赖失败的问题 ([388d7a0](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/388d7a0))

## [1.13.1](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.13.0...v1.13.1) (2022-08-17)


### 🐛 Bug 修复

* 优化 控制台输出 ([3741a54](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/3741a54))

# [1.13.0](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.12.5...v1.13.0) (2022-08-03)


### ✨ 新功能

* 新增 vite3-template ([406e4eb](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/406e4eb))

## [1.12.5](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.12.4...v1.12.5) (2022-06-25)


### 🐛 Bug 修复

* 更新 依赖版本 ([39a4dde](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/39a4dde))

## [1.12.4](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.12.3...v1.12.4) (2022-06-25)


### 🐛 Bug 修复

* 修改 依赖安装失败时不结束进程 ([e62d381](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/e62d381))

## [1.12.3](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.12.2...v1.12.3) (2022-06-18)


### 🐛 Bug 修复

* 优化 项目初始化时的文件复制和删除逻辑 ([06b74c8](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/06b74c8))

## [1.12.2](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.12.1...v1.12.2) (2022-05-28)


### 🐛 Bug 修复

* 优化 获取 Node.js lts 版本 ([d6215de](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/d6215de))

## [1.12.1](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.12.0...v1.12.1) (2022-05-28)


### 🐛 Bug 修复

* 新增 提示 Node.js lts 版本 ([c3a703d](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/c3a703d))

# [1.12.0](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.11.0...v1.12.0) (2022-05-27)


### ✨ 新功能

* 优化 Node.js lts 版本，从多个网址选择最快的 ([6a18e6c](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/6a18e6c))

# [1.11.0](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.10.3...v1.11.0) (2022-03-29)


### ✨ 新功能

* 新增 支持 uni-vite2-template ([21f48f0](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/21f48f0))

## [1.10.3](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.10.2...v1.10.3) (2022-03-29)


### 🐛 Bug 修复

* 修复 tsconfig 设置 importHelpers 为 true 时的 tslib 缺失 ([67c7c01](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/67c7c01))

## [1.10.2](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.10.1...v1.10.2) (2022-03-05)


### 🐛 Bug 修复

* 优化 docker-compose.yml 环境变量 ([251724e](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/251724e))

## [1.10.1](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.10.0...v1.10.1) (2022-03-05)


### 🐛 Bug 修复

* dockerfile 移除 mongodb-tools ([9b8641f](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/9b8641f))

# [1.10.0](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.9.2...v1.10.0) (2022-03-04)


### ✨ 新功能

* 新增 是否初始化 Docker 配置 ([8d95c6f](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/8d95c6f))

## [1.9.2](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.9.1...v1.9.2) (2022-02-15)


### 🐛 Bug 修复

* 修改镜像源 ([6f2e918](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/6f2e918))

## [1.9.1](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.9.0...v1.9.1) (2022-01-29)


### 🐛 Bug 修复

* 优化 贡献指南 ([d949981](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/d949981))

# [1.9.0](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.8.2...v1.9.0) (2022-01-12)


### ✨ 新功能

* 重构开源协议部分；优化项目名称为 kebab-case ([7136dc9](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/7136dc9))

## [1.8.2](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.8.1...v1.8.2) (2021-12-22)


### 🐛 Bug 修复

* 优化 发布到 npm 的配置；优化项目模板；优化 README；新增 贡献指南 ([ae8704d](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/ae8704d))

## [1.8.1](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.8.0...v1.8.1) (2021-12-21)


### 🐛 Bug 修复

* 更新 conventional-changelog-cmyr-config；修复 模板 ([a8992c1](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/a8992c1))

# [1.8.0](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.7.6...v1.8.0) (2021-12-21)


### ✨ 新功能

* 新增 是否移除 yarn 选项；优化 dependabot 部分生成 ([0a972d6](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/0a972d6))


### 🎫 其他更新

* 更新 .github\workflows ([e261d31](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/e261d31))
* 更新 conventional-changelog-cmyr-config 版本 ([27ea0d6](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/27ea0d6))


### 📝 文档

* 修改 CONTRIBUTING.md 模板 ([473a4d1](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/473a4d1))

## [1.7.6](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.7.5...v1.7.6) (2021-12-18)


### 🐛 Bug 修复

* 增加 commitizen 初始化提示 ([19f24b0](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/19f24b0))

## [1.7.5](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.7.4...v1.7.5) (2021-12-18)


### 🐛 Bug 修复

* 优化 初始化 Commitizen 相关配置；添加 cz-conventional-changelog-cmyr ([08e8c78](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/08e8c78))

## [1.7.4](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.7.3...v1.7.4) (2021-12-18)


### 🐛 Bug 修复

* 优化 package.json 改动 ([3d7327a](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/3d7327a))

## [1.7.3](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.7.2...v1.7.3) (2021-12-18)


### 🐛 Bug 修复

* 新增 是否启用爱发电 选项 ([19a1121](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/19a1121))

## [1.7.2](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.7.1...v1.7.2) (2021-12-17)


### 🐛 Bug 修复

* 修复 husky install ([7b392be](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/7b392be))

## [1.7.1](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.7.0...v1.7.1) (2021-12-17)


### 🐛 Bug 修复

* 新增 是否初始化 semantic-release 选项 ([4cd5f44](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/4cd5f44))

# [1.7.0](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.6.0...v1.7.0) (2021-12-17)


### ✨ 新功能

* 新增 Github Workflows、.editorconfig、commitlint.config.js 等配置的初始化 ([41f4905](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/41f4905))
* 新增 License 初始化 ([cb1ad29](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/cb1ad29))
* 新增 是否初始化 husky 选项；优化 commitlint、cz-conventional-changelog、husky、lint-staged 等的配置和依赖 ([e769a02](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/e769a02))


### 🐛 Bug 修复

* 修复 贡献指南 文本错误 ([1677849](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/1677849))

# [1.6.0](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.5.2...v1.6.0) (2021-12-16)


### ✨ 新功能

* 优化 ct create 为 ct，默认执行 ct create ([d769e5e](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/d769e5e))
* 新增 贡献指南 初始化 ([8f0e304](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/8f0e304))


### 🐛 Bug 修复

* 新增 自动获取 NodeJS lts 版本 ([6246ffc](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/6246ffc))

## [1.5.2](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.5.1...v1.5.2) (2021-12-15)


### 🐛 Bug 修复

* 修改 lodash 为 dependencies；优化 promise.any 载入；修复 模板 bug ([9afd529](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/9afd529))

## [1.5.1](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.5.0...v1.5.1) (2021-12-15)


### 🐛 Bug 修复

* 新增 开发 指令 ([301a5aa](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/301a5aa))

# [1.5.0](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.4.1...v1.5.0) (2021-12-15)


### ✨ 新功能

* 新增 README 文件的创建，增加了更多选项 ([83d438e](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/83d438e))


### 🐛 Bug 修复

* 修复 templates 未发布 ([c2184bf](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/c2184bf))

## [1.4.1](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.4.0...v1.4.1) (2021-12-14)


### 🐛 Bug 修复

* 新增 项目简介 ([faef295](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/faef295))

# [1.4.0](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.3.1...v1.4.0) (2021-12-14)


### ✨ 新功能

* 新增 开源选项 ([4a7bf48](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/4a7bf48))

## [1.3.1](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.3.0...v1.3.1) (2021-12-13)


### 🐛 Bug 修复

* 新增 请选择项目模板 的默认值 ([36f6f7e](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/36f6f7e))

# [1.3.0](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.2.0...v1.3.0) (2021-12-13)


### ✨ 新功能

* 新增 github 镜像加速 ([2b0824f](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/2b0824f))

# [1.2.0](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.1.1...v1.2.0) (2021-12-03)


### ✨ 新功能

* 更换包管理器为 pnpm ([e72b389](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/e72b389))

## [1.1.1](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.1.0...v1.1.1) (2021-12-03)


### 🐛 Bug 修复

* 回退 ora 版本到 5.x ([7b84720](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/7b84720))
* 回退 plop 版本 ([56f6d11](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/56f6d11))

# [1.1.0](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.0.2...v1.1.0) (2021-12-03)


### ✨ 新功能

* 新增 git config user.name 作为 作者名称 默认值 ([6507073](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/6507073))

## [1.0.2](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.0.1...v1.0.2) (2021-11-11)


### 🐛 Bug 修复

* 回退 ora 版本 ([e0e320b](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/e0e320b))

## [1.0.1](https://github.com/CaoMeiYouRen/cmyr-template-cli/compare/v1.0.0...v1.0.1) (2021-11-11)


### 🐛 Bug 修复

* 修复 缺失 #!/usr/bin/env node ([52bb81c](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/52bb81c))

# 1.0.0 (2021-09-20)


### ✨ 新功能

* add vite2-vue2 ([f1a57d1](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/f1a57d1))
* 完成工具设计 ([82436b4](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/82436b4))
* 新增 git init ，package.json 写入 name/author ([6d0de77](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/6d0de77))
* 新增模板 ([f521eeb](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/f521eeb))


### 🐛 Bug 修复

* 优化逻辑 ([c3fea62](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/c3fea62))
* 使用 rollup 改造 ([8820f52](https://github.com/CaoMeiYouRen/cmyr-template-cli/commit/8820f52))
