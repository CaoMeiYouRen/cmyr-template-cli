import path from 'path'
import ora from 'ora'
import fs from 'fs-extra'
import { ProjectInfo, TemplateCliConfig, AiScaffoldingLink, AiL0Selection } from '@/types/interfaces'
import { ejsRender } from '@/utils/ejs'
import { copyFilesFromTemplates } from '@/utils/files'
import { createDirSymlink, createFileSymlink, SymlinkMethod } from '@/utils/symlink'
import {
    copyL0Selection,
    getAiSourceConfig,
    prepareAgentsSource,
    readAgentsTemplate,
    readL0Selection,
    writeAiManifest,
    PreparedAiSource,
} from '@/utils/ai-scaffolding'
import { buildAgentsMdL1Section, replaceAgentsTemplateTodos } from '@/pure/agents-md'

/**
 * 跨 agent 目录链接映射（权威源：.github/skills、.github/agents）
 */
const AI_DIR_LINK_MAPPINGS = [
    { linkRelPath: '.claude/skills', targetRelPath: '.github/skills' },
    { linkRelPath: '.claude/agents', targetRelPath: '.github/agents' },
    { linkRelPath: '.opencode/skills', targetRelPath: '.github/skills' },
    { linkRelPath: '.opencode/agents', targetRelPath: '.github/agents' },
    { linkRelPath: '.agents/skills', targetRelPath: '.github/skills' },
    { linkRelPath: '.agents/agents', targetRelPath: '.github/agents' },
]

/**
 * 文件链接映射（权威源：AGENTS.md）
 */
const AI_FILE_LINK_MAPPINGS = [
    { linkRelPath: 'CLAUDE.md', targetRelPath: 'AGENTS.md' },
]

/**
 * 初始化 AI 开发配置文件
 * 根据 aiTools 选项决定生成哪些文件
 *
 * @author CaoMeiYouRen
 * @date 2026-04-01
 * @param projectPath 项目路径
 * @param projectInfo 项目信息
 * @param config CLI 全局配置（可选，用于读取 AI 技能资产源）
 */
export async function initAIScaffolding(
    projectPath: string,
    projectInfo: ProjectInfo,
    config?: TemplateCliConfig,
): Promise<void> {
    const loading = ora('正在初始化 AI 开发配置……').start()
    try {
        const aiTools = projectInfo.aiTools ?? ['claude', 'copilot']

        // Claude Code / Codex / Gemini CLI / OpenCode 使用 AGENTS.md
        if (aiTools.includes('claude')) {
            await initAgentsMdScaffolding(projectPath, projectInfo, config)
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
 * 初始化 AGENTS.md 生态（AGENTS.md + L0 快照 + 跨 agent 链接 + 植入清单）
 * 单一信息源，供 Claude Code / Codex / Gemini CLI / OpenCode 共用
 *
 * @param projectPath 项目路径
 * @param projectInfo 项目信息
 * @param config CLI 全局配置
 */
async function initAgentsMdScaffolding(
    projectPath: string,
    projectInfo: ProjectInfo,
    config?: TemplateCliConfig,
): Promise<void> {
    let prepared: PreparedAiSource | null = null
    try {
        prepared = await prepareAgentsSource(getAiSourceConfig(config))
        const l0 = await readL0Selection(prepared.sourceDir)

        await initAgentsMd(projectPath, projectInfo, prepared.sourceDir, l0)
        const hashes = await initSkillsSnapshot(projectPath, prepared.sourceDir, l0)
        const links = await initAgentLinkDirs(projectPath, projectInfo)

        await writeAiManifest(projectPath, {
            version: 1,
            generatedAt: new Date().toISOString(),
            source: prepared.source,
            l0Selection: l0,
            links,
            hashes,
        })
    } finally {
        if (prepared) {
            await prepared.cleanup()
        }
    }
}

/**
 * 生成 AGENTS.md
 * L0 骨架直接消费资产仓库 global/AGENTS.template.md（静态保真，零压缩），
 * 仅替换可由 ProjectInfo 确定的 TODO，并追加 L1 项目注入节
 *
 * @author CaoMeiYouRen
 * @date 2026-04-01
 * @param projectPath 项目路径
 * @param projectInfo 项目信息
 * @param sourceDir 资产源根目录
 * @param l0 L0 精选清单
 */
export async function initAgentsMd(
    projectPath: string,
    projectInfo: ProjectInfo,
    sourceDir?: string,
    l0?: AiL0Selection,
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

        if (!sourceDir) {
            throw new Error('未提供 AI 技能资产源，无法生成 AGENTS.md')
        }

        const templateContent = await readAgentsTemplate(sourceDir)
        if (!templateContent) {
            throw new Error('资产仓库缺少 global/AGENTS.template.md，无法生成 AGENTS.md')
        }

        const l0Content = replaceAgentsTemplateTodos(templateContent, projectInfo)
        const l1Section = buildAgentsMdL1Section(projectInfo, l0?.skills || [], projectInfo.aiGeneratedSummary)

        await fs.writeFile(outputPath, `${l0Content.trimEnd()}\n\n${l1Section}`)
        loading.succeed('AGENTS.md 生成成功！')
    } catch (error) {
        loading.fail('AGENTS.md 生成失败！')
        throw error
    }
}

/**
 * 快照植入 L0 精选技能/代理到 .github/skills、.github/agents（权威源）
 *
 * @param projectPath 项目路径
 * @param sourceDir 资产源根目录
 * @param l0 L0 精选清单
 * @returns 快照文件哈希映射（相对项目根路径 -> sha256）
 */
export async function initSkillsSnapshot(
    projectPath: string,
    sourceDir: string,
    l0: AiL0Selection,
): Promise<Record<string, string>> {
    const loading = ora('正在快照植入 AI 技能与代理……').start()
    try {
        const hashes = await copyL0Selection(sourceDir, projectPath, l0)
        loading.succeed('AI 技能与代理快照植入成功！')
        return hashes
    } catch (error) {
        loading.fail('AI 技能与代理快照植入失败！')
        throw error
    }
}

/**
 * 创建跨 agent 目录/文件链接（权威源 .github/skills、.github/agents、AGENTS.md）
 * 优先 symlink（git 以 120000 跟踪链接本身），Windows 无权限时降级 junction/copy
 * 注意：junction 降级时 git 会跟随遍历链接内容（与权威源重复跟踪），
 * 这是为保证克隆后链接目录仍然存在而接受的取舍；实际链接方式记录在 .ai/manifest.json
 *
 * @param projectPath 项目路径
 * @param projectInfo 项目信息
 * @returns 链接记录（含实际使用方式，供写入植入清单）
 */
export async function initAgentLinkDirs(
    projectPath: string,
    projectInfo: ProjectInfo,
): Promise<AiScaffoldingLink[]> {
    const loading = ora('正在创建跨 agent 链接……').start()
    try {
        const links: AiScaffoldingLink[] = []

        for (const mapping of AI_DIR_LINK_MAPPINGS) {
            const linkPath = path.join(projectPath, mapping.linkRelPath)
            const targetPath = path.join(projectPath, mapping.targetRelPath)
            const result = await createDirSymlink(linkPath, targetPath)
            links.push({
                linkRelPath: mapping.linkRelPath,
                targetRelPath: mapping.targetRelPath,
                method: result.method as SymlinkMethod,
            })
        }

        // CLAUDE.md 链接到 AGENTS.md（仅 claude 工具选中时）
        const isClaude = projectInfo.aiTools?.includes('claude')
        if (isClaude) {
            for (const mapping of AI_FILE_LINK_MAPPINGS) {
                const linkPath = path.join(projectPath, mapping.linkRelPath)
                const targetPath = path.join(projectPath, mapping.targetRelPath)
                const result = await createFileSymlink(linkPath, targetPath)
                links.push({
                    linkRelPath: mapping.linkRelPath,
                    targetRelPath: mapping.targetRelPath,
                    method: result.method as SymlinkMethod,
                })
            }
        }

        loading.succeed('跨 agent 链接创建成功！')
        return links
    } catch (error) {
        loading.fail('跨 agent 链接创建失败！')
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
 * 初始化 .claude/ 目录结构（settings.json）
 * skills/agents 目录由跨 agent 链接提供，此处仅确保 settings.json
 *
 * @author CaoMeiYouRen
 * @date 2026-04-01
 * @param projectPath 项目路径
 */
export async function initClaudeDirectory(projectPath: string): Promise<void> {
    const loading = ora('正在初始化 .claude/ 目录……').start()
    try {
        const settingsPath = path.join(projectPath, '.claude/settings.json')

        // 如果 settings.json 已存在，跳过
        if (await fs.pathExists(settingsPath)) {
            loading.stopAndPersist({
                text: '.claude/settings.json 已存在，跳过初始化',
                symbol: '⊙',
            })
            return
        }

        // 创建目录结构
        await fs.mkdirp(path.join(projectPath, '.claude'))

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
