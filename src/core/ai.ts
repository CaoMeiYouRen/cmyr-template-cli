import path from 'path'
import ora from 'ora'
import fs from 'fs-extra'
import { ProjectInfo } from '@/types/interfaces'
import { ejsRender } from '@/utils/ejs'
import { copyFilesFromTemplates } from '@/utils/files'

/**
 * 初始化 AI 开发配置文件
 * 根据 aiTools 选项决定生成哪些文件
 *
 * @author CaoMeiYouRen
 * @date 2026-04-01
 * @param projectPath 项目路径
 * @param projectInfo 项目信息
 */
export async function initAIScaffolding(
    projectPath: string,
    projectInfo: ProjectInfo,
): Promise<void> {
    const loading = ora('正在初始化 AI 开发配置……').start()
    try {
        const aiTools = projectInfo.aiTools ?? ['claude', 'copilot']

        // Claude Code / Codex / Gemini CLI / OpenCode 使用 AGENTS.md
        if (aiTools.includes('claude')) {
            await initAgentsMd(projectPath, projectInfo)
            await initClaudeDirectory(projectPath)
        }

        // GitHub Copilot
        if (aiTools.includes('copilot')) {
            await initCopilotInstructions(projectPath)
        }

        // Cursor
        if (aiTools.includes('cursor')) {
            await initCursorRules(projectPath)
            await initCursorDirectory(projectPath)
        }

        // Windsurf
        if (aiTools.includes('windsurf')) {
            await initWindsurfRules(projectPath)
        }

        loading.succeed('AI 开发配置初始化成功！')
    } catch (error) {
        loading.fail('AI 开发配置初始化失败！')
        console.error(error)
    }
}

/**
 * 初始化 AGENTS.md（单一信息源）
 * 基于 EJS 模板 + ProjectInfo 渲染
 * 所有支持 AGENTS.md 的工具（Claude Code、Codex、Gemini CLI、OpenCode）共用此文件
 *
 * @author CaoMeiYouRen
 * @date 2026-04-01
 * @param projectPath 项目路径
 * @param projectInfo 项目信息
 */
export async function initAgentsMd(
    projectPath: string,
    projectInfo: ProjectInfo,
): Promise<void> {
    const loading = ora('正在生成 AGENTS.md……').start()
    try {
        const outputPath = path.join(projectPath, 'AGENTS.md')

        // 如果文件已存在，跳过
        if (await fs.pathExists(outputPath)) {
            loading.stopAndPersist({
                text: 'AGENTS.md 已存在，跳过生成',
                symbol: '⊙',
            })
            return
        }

        const templatePath = path.join(__dirname, '../templates/AGENTS.md.ejs')

        // 准备模板数据
        const templateData = {
            projectDescription: projectInfo.projectDescription || projectInfo.description || '',
            language: projectInfo.templateMeta?.language || 'typescript',
            runtime: projectInfo.templateMeta?.runtime || 'nodejs',
            vueVersion: projectInfo.templateMeta?.vueVersion || 0,
            packageManager: projectInfo.packageManager || 'npm',
            isInitTest: projectInfo.isInitTest || 'none',
            devCommand: projectInfo.devCommand,
            testCommand: projectInfo.testCommand,
            buildCommand: projectInfo.buildCommand,
            lintCommand: projectInfo.lintCommand,
        }

        await ejsRender(templatePath, templateData, outputPath)
        loading.succeed('AGENTS.md 生成成功！')
    } catch (error) {
        loading.fail('AGENTS.md 生成失败！')
        throw error
    }
}

/**
 * 初始化 GitHub Copilot 配置
 * 内容为引用 AGENTS.md 的简短指令，避免内容重复
 *
 * @author CaoMeiYouRen
 * @date 2026-04-01
 * @param projectPath 项目路径
 */
export async function initCopilotInstructions(
    projectPath: string,
): Promise<void> {
    const loading = ora('正在生成 .github/copilot-instructions.md……').start()
    try {
        const outputPath = path.join(projectPath, '.github/copilot-instructions.md')

        // 如果文件已存在，跳过
        if (await fs.pathExists(outputPath)) {
            loading.stopAndPersist({
                text: '.github/copilot-instructions.md 已存在，跳过生成',
                symbol: '⊙',
            })
            return
        }

        // 确保 .github 目录存在
        const githubDir = path.join(projectPath, '.github')
        if (!await fs.pathExists(githubDir)) {
            await fs.mkdirp(githubDir)
        }

        const templatePath = path.join(__dirname, '../templates/.github/copilot-instructions.md.ejs')

        // Copilot 指令是静态内容，不需要动态数据
        await ejsRender(templatePath, {}, outputPath)
        loading.succeed('.github/copilot-instructions.md 生成成功！')
    } catch (error) {
        loading.fail('.github/copilot-instructions.md 生成失败！')
        throw error
    }
}

/**
 * 初始化 .cursorrules（可选）
 *
 * @author CaoMeiYouRen
 * @date 2026-04-01
 * @param projectPath 项目路径
 */
export async function initCursorRules(
    projectPath: string,
): Promise<void> {
    const loading = ora('正在生成 .cursorrules……').start()
    try {
        const outputPath = path.join(projectPath, '.cursorrules')

        // 如果文件已存在，跳过
        if (await fs.pathExists(outputPath)) {
            loading.stopAndPersist({
                text: '.cursorrules 已存在，跳过生成',
                symbol: '⊙',
            })
            return
        }

        const templatePath = path.join(__dirname, '../templates/.cursorrules.ejs')

        // Cursor rules 是静态内容，不需要动态数据
        await ejsRender(templatePath, {}, outputPath)
        loading.succeed('.cursorrules 生成成功！')
    } catch (error) {
        loading.fail('.cursorrules 生成失败！')
        throw error
    }
}

/**
 * 初始化 .windsurfrules（可选）
 *
 * @author CaoMeiYouRen
 * @date 2026-04-01
 * @param projectPath 项目路径
 */
export async function initWindsurfRules(
    projectPath: string,
): Promise<void> {
    const loading = ora('正在生成 .windsurfrules……').start()
    try {
        const outputPath = path.join(projectPath, '.windsurfrules')

        // 如果文件已存在，跳过
        if (await fs.pathExists(outputPath)) {
            loading.stopAndPersist({
                text: '.windsurfrules 已存在，跳过生成',
                symbol: '⊙',
            })
            return
        }

        const templatePath = path.join(__dirname, '../templates/.windsurfrules.ejs')

        // Windsurf rules 是静态内容，不需要动态数据
        await ejsRender(templatePath, {}, outputPath)
        loading.succeed('.windsurfrules 生成成功！')
    } catch (error) {
        loading.fail('.windsurfrules 生成失败！')
        throw error
    }
}

/**
 * 初始化 .claude/ 目录结构
 *
 * @author CaoMeiYouRen
 * @date 2026-04-01
 * @param projectPath 项目路径
 */
export async function initClaudeDirectory(projectPath: string): Promise<void> {
    const loading = ora('正在初始化 .claude/ 目录……').start()
    try {
        const claudeDir = path.join(projectPath, '.claude')

        // 如果目录已存在，跳过
        if (await fs.pathExists(claudeDir)) {
            loading.stopAndPersist({
                text: '.claude/ 目录已存在，跳过初始化',
                symbol: '⊙',
            })
            return
        }

        // 创建目录结构
        await fs.mkdirp(path.join(claudeDir, 'skills'))
        await fs.mkdirp(path.join(claudeDir, 'agents'))

        // 复制 settings.json
        const files = ['.claude/settings.json']
        await copyFilesFromTemplates(projectPath, files, true)

        loading.succeed('.claude/ 目录初始化成功！')
    } catch (error) {
        loading.fail('.claude/ 目录初始化失败！')
        throw error
    }
}

/**
 * 初始化 .cursor/ 目录结构（可选）
 *
 * @author CaoMeiYouRen
 * @date 2026-04-01
 * @param projectPath 项目路径
 */
export async function initCursorDirectory(projectPath: string): Promise<void> {
    const loading = ora('正在初始化 .cursor/ 目录……').start()
    try {
        const cursorDir = path.join(projectPath, '.cursor', 'rules')

        // 如果目录已存在，跳过
        if (await fs.pathExists(cursorDir)) {
            loading.stopAndPersist({
                text: '.cursor/ 目录已存在，跳过初始化',
                symbol: '⊙',
            })
            return
        }

        // 创建空目录
        await fs.mkdirp(cursorDir)

        loading.succeed('.cursor/ 目录初始化成功！')
    } catch (error) {
        loading.fail('.cursor/ 目录初始化失败！')
        throw error
    }
}
