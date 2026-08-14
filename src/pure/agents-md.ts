import { ProjectInfo } from '@/types/interfaces'

/**
 * 将资产仓库 AGENTS.template.md 的 TODO 占位替换为项目信息
 * 无法确定的 TODO 保留，交由项目自行填写（L2 项目自由区）
 *
 * @param content 模板原文
 * @param projectInfo 项目信息
 * @returns 替换后的内容
 */
export function replaceAgentsTemplateTodos(content: string, projectInfo: ProjectInfo): string {
    let result = content

    const description = projectInfo.projectDescription || projectInfo.description || ''
    if (description) {
        result = result.replace('<!-- TODO: 一句话描述项目目的 -->', description)
    }

    const testFramework = projectInfo.isInitTest
    if (testFramework === 'vitest' || testFramework === 'jest') {
        result = result.replace('<!-- TODO: 指定最低覆盖率阈值，如 80% -->', '80%')
    }

    return result
}

/**
 * 构建 AGENTS.md 的 L1 项目注入节（追加在资产模板之后）
 * 包含项目概述、技术栈、常用命令与 AI 技能索引
 *
 * @param projectInfo 项目信息
 * @param l0Skills L0 精选技能列表
 * @param projectSummary AI 生成的项目简介（可选，创作性内容；缺省时使用 projectDescription）
 * @returns L1 节 markdown 内容
 */
export function buildAgentsMdL1Section(
    projectInfo: ProjectInfo,
    l0Skills: string[] = [],
    projectSummary?: { summary: string, features: string[] } | null,
): string {
    const {
        language,
        runtime,
        vueVersion,
    } = projectInfo.templateMeta || {}
    const packageManager = projectInfo.packageManager || 'npm'
    const devCommand = projectInfo.devCommand
    const testCommand = projectInfo.testCommand
    const buildCommand = projectInfo.buildCommand
    const lintCommand = projectInfo.lintCommand
    const startCommand = projectInfo.startCommand
    const commitCommand = projectInfo.commitCommand

    const techStackLines = [
        `- 主要语言: ${language || 'typescript'}`,
        `- 运行时: ${runtime || 'nodejs'}`,
    ]
    if (vueVersion === 2) {
        techStackLines.push('- 框架: Vue 2')
    } else if (vueVersion === 3) {
        techStackLines.push('- 框架: Vue 3')
    }
    techStackLines.push(`- 包管理器: ${packageManager}`)

    const commandLines: string[] = [
        `- 安装依赖: \`${packageManager} install\``,
    ]
    if (devCommand) {
        commandLines.push(`- 启动开发环境: \`${devCommand}\``)
    }
    if (testCommand) {
        commandLines.push(`- 运行测试: \`${testCommand}\``)
    }
    if (buildCommand) {
        commandLines.push(`- 构建项目: \`${buildCommand}\``)
    }
    if (lintCommand) {
        commandLines.push(`- 代码检查: \`${lintCommand}\``)
    }
    if (startCommand) {
        commandLines.push(`- 启动生产或本地预览: \`${startCommand}\``)
    }
    if (commitCommand) {
        commandLines.push(`- 生成提交: \`${commitCommand}\``)
    }

    const skillIndexLines = l0Skills.length > 0
        ? l0Skills.map((skill) => `- ${skill}`)
        : ['- 未植入技能（L0 精选清单为空）']

    const summary = projectSummary?.summary || projectInfo.projectDescription || projectInfo.description || ''
    const featureLines = projectSummary?.features?.length
        ? projectSummary.features.map((feature) => `- ${feature}`)
        : []

    const overviewLines = summary
        ? [summary, ...(featureLines.length > 0 ? ['', '主要特性：', ...featureLines] : [])]
        : ['（项目概述待补充）']

    return [
        '---',
        '',
        '## 项目信息（由 cmyr-template-cli 生成）',
        '',
        '> 本节内容由脚手架基于 ProjectInfo 参数注入，如需调整请直接修改。',
        '',
        '### 项目概述',
        ...overviewLines,
        '',
        '### 技术栈',
        ...techStackLines,
        '',
        '### 常用命令',
        ...commandLines,
        '',
        '### AI 技能索引',
        '',
        '> 技能与代理已快照植入 `.github/skills/`、`.github/agents/`，并被链接到各 AI 工具目录（.claude/.opencode/.agents 等）。',
        ...skillIndexLines,
        '',
        '### 植入来源',
        '',
        '> 快照来源与校验记录见 `.ai/manifest.json`；更新命令：`ct ai-update`。',
        '',
    ].join('\n')
}
