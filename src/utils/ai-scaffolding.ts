import path from 'path'
import os from 'os'
import crypto, { randomUUID } from 'crypto'
import ora from 'ora'
import axios from 'axios'
import AdmZip from 'adm-zip'
import fs from 'fs-extra'
import { REMOTES, GITHUB_API_URL } from './constants'
import { AiL0Selection, AiScaffoldingManifest, AiSourceConfig, TemplateCliConfig } from '@/types/interfaces'

/**
 * 默认 AI 技能资产仓库
 */
export const DEFAULT_AI_SKILLS_REPOSITORY = 'CaoMeiYouRen/cmyr-skills-agents'

/**
 * AI 基建植入清单相对路径
 */
export const AI_MANIFEST_RELATIVE_PATH = '.ai/manifest.json'

/**
 * 已准备的 AI 技能源
 */
export interface PreparedAiSource {
    /**
     * 源根目录
     */
    sourceDir: string
    /**
     * 源配置
     */
    source: AiSourceConfig & {
        commit?: string | null
    }
    /**
     * 清理临时资源（github 源时清理临时目录）
     */
    cleanup: () => Promise<void>
}

/**
 * 校验结果
 */
export interface AiScaffoldingVerifyResult {
    valid: boolean
    /**
     * 不一致的文件（相对项目根路径）
     */
    mismatches: string[]
}

/**
 * 根据 CLI 配置构建 AI 技能源
 * 本地路径优先，其次远程仓库
 *
 * @param config CLI 全局配置
 * @returns AI 技能源配置
 */
export function getAiSourceConfig(config?: TemplateCliConfig): AiSourceConfig {
    const localPath = config?.AI_SKILLS_LOCAL_PATH?.trim()
    if (localPath) {
        return {
            type: 'local',
            localPath: path.resolve(localPath),
        }
    }
    return {
        type: 'github',
        repository: config?.AI_SKILLS_REPOSITORY?.trim() || DEFAULT_AI_SKILLS_REPOSITORY,
    }
}

/**
 * 获取 GitHub 仓库最新 commit sha（失败时返回 null，不阻塞流程）
 *
 * @param repository 仓库名（如 CaoMeiYouRen/cmyr-skills-agents）
 * @returns commit sha 或 null
 */
export async function getGitHubLatestCommit(repository: string): Promise<string | null> {
    try {
        const response = await axios.get(`${GITHUB_API_URL}/repos/${repository}/commits/master`, {
            headers: {
                Accept: 'application/vnd.github+json',
            },
            timeout: 15 * 1000,
        })
        return response.data?.sha || null
    } catch {
        return null
    }
}

/**
 * 准备 AI 技能源
 * local 源直接返回本地路径；github 源下载 zip 并解压到临时目录
 *
 * @param source 源配置
 * @returns 已准备的源
 */
export async function prepareAgentsSource(source: AiSourceConfig): Promise<PreparedAiSource> {
    if (source.type === 'local') {
        const localPath = source.localPath || ''
        if (!await fs.pathExists(localPath)) {
            throw new Error(`AI 技能资产本地路径不存在: ${localPath}`)
        }
        return {
            sourceDir: localPath,
            source: { ...source },
            cleanup: async () => undefined,
        }
    }

    const repository = source.repository || DEFAULT_AI_SKILLS_REPOSITORY
    const tempDir = path.join(os.tmpdir(), `cmyr-skills-agents-${randomUUID()}`)
    try {
        await downloadAgentsRepositoryZip(repository, tempDir)
        const commit = await getGitHubLatestCommit(repository)
        return {
            sourceDir: tempDir,
            source: { ...source, commit },
            cleanup: async () => {
                await fs.remove(tempDir)
            },
        }
    } catch (error) {
        await fs.remove(tempDir)
        throw error
    }
}

/**
 * 下载 AI 技能资产仓库 zip 并解压到目标目录
 * 多镜像并行探测，全部失败时抛出错误（不退出进程，保证 AI 基建作为可选功能失败可恢复）
 *
 * @param repository 仓库名
 * @param destination 解压目标目录
 */
export async function downloadAgentsRepositoryZip(repository: string, destination: string): Promise<void> {
    const loading = ora('正在下载 AI 技能资产仓库……').start()
    try {
        const candidates = REMOTES.map((remote) => `${remote}/${repository}/archive/refs/heads/master.zip`)
        const response = await Promise.any(
            candidates.map((url) => axios.get(url, {
                responseType: 'arraybuffer',
                timeout: 30 * 1000,
            })),
        )
        const zip = new AdmZip(Buffer.from(response.data))
        const entries = zip.getEntries()
        const topDir = entries[0]?.entryName.split('/')[0]
        if (!topDir) {
            throw new Error('无效的 zip 文件')
        }
        await fs.ensureDir(destination)
        for (const entry of entries) {
            if (entry.entryName.startsWith(`${topDir}/`)) {
                const relativePath = entry.entryName.slice(topDir.length + 1)
                if (!relativePath) {
                    continue
                }
                const targetPath = path.join(destination, relativePath)
                // 路径遍历防护：解析后的路径必须严格位于目标目录内
                const resolvedTarget = path.resolve(targetPath)
                const resolvedDestination = path.resolve(destination)
                const relative = path.relative(resolvedDestination, resolvedTarget)
                if (relative.startsWith('..') || path.isAbsolute(relative)) {
                    throw new Error(`路径遍历攻击检测: ${relativePath}`)
                }
                if (entry.isDirectory) {
                    await fs.ensureDir(targetPath)
                } else {
                    await fs.ensureDir(path.dirname(targetPath))
                    await fs.writeFile(targetPath, entry.getData())
                }
            }
        }
        loading.succeed('AI 技能资产仓库下载成功！')
    } catch (error) {
        loading.fail('AI 技能资产仓库下载失败！')
        throw error
    }
}

/**
 * 读取资产仓库 L0 精选清单（manifest.json 的 l0Selection）
 *
 * @param sourceDir 源根目录
 * @returns L0 精选清单
 */
export async function readL0Selection(sourceDir: string): Promise<AiL0Selection> {
    const manifestPath = path.join(sourceDir, 'manifest.json')
    const manifest = await fs.readJSON(manifestPath)
    const l0 = manifest?.l0Selection
    if (!l0 || !Array.isArray(l0.skills) || !Array.isArray(l0.agents)) {
        throw new Error('AI 技能资产仓库 manifest.json 缺少有效的 l0Selection')
    }
    return {
        files: Array.isArray(l0.files) ? l0.files : [],
        skills: l0.skills,
        agents: l0.agents,
    }
}

/**
 * 读取资产仓库全局 AGENTS 模板（global/AGENTS.template.md）
 *
 * @param sourceDir 源根目录
 * @returns 模板内容，不存在时返回 null
 */
export async function readAgentsTemplate(sourceDir: string): Promise<string | null> {
    const templatePath = path.join(sourceDir, 'global/AGENTS.template.md')
    if (!await fs.pathExists(templatePath)) {
        return null
    }
    return (await fs.readFile(templatePath, 'utf8')).toString()
}

/**
 * 计算文件 sha256 哈希
 *
 * @param filePath 文件路径
 * @returns sha256 哈希
 */
export async function computeFileHash(filePath: string): Promise<string> {
    const content = await fs.readFile(filePath)
    return crypto.createHash('sha256').update(content).digest('hex')
}

/**
 * 复制 L0 精选技能/代理到目标项目 .github/skills、.github/agents
 * 复制过程中计算全部文件的 sha256 哈希
 *
 * @param sourceDir 源根目录
 * @param projectPath 目标项目路径
 * @param l0 L0 精选清单
 * @returns 相对项目根路径 -> sha256 哈希映射
 */
export async function copyL0Selection(sourceDir: string, projectPath: string, l0: AiL0Selection): Promise<Record<string, string>> {
    const hashes: Record<string, string> = {}
    const githubSkillsDir = path.join(projectPath, '.github/skills')
    const githubAgentsDir = path.join(projectPath, '.github/agents')

    await fs.ensureDir(githubSkillsDir)
    await fs.ensureDir(githubAgentsDir)

    // 复制精选技能目录
    for (const skillName of l0.skills) {
        const sourceSkillDir = path.join(sourceDir, 'skills', skillName)
        if (!await fs.pathExists(sourceSkillDir)) {
            console.warn(`警告: 技能 ${skillName} 在资产仓库中不存在，已跳过`)
            continue
        }
        const targetSkillDir = path.join(githubSkillsDir, skillName)
        await fs.copy(sourceSkillDir, targetSkillDir)
        await collectHashes(targetSkillDir, path.join('.github/skills', skillName), hashes)
    }

    // 复制精选代理文件
    for (const agentName of l0.agents) {
        const sourceAgentFile = path.join(sourceDir, 'agents', `${agentName}.agent.md`)
        if (!await fs.pathExists(sourceAgentFile)) {
            console.warn(`警告: 代理 ${agentName} 在资产仓库中不存在，已跳过`)
            continue
        }
        const targetAgentFile = path.join(githubAgentsDir, `${agentName}.agent.md`)
        await fs.copyFile(sourceAgentFile, targetAgentFile)
        const relativePath = `.github/agents/${agentName}.agent.md`
        hashes[relativePath] = await computeFileHash(targetAgentFile)
    }

    return hashes
}

/**
 * 递归收集目录下全部文件的哈希
 *
 * @param dir 目录路径
 * @param dirRelativePath 目录相对项目根的路径（posix 风格）
 * @param hashes 收集目标
 */
async function collectHashes(dir: string, dirRelativePath: string, hashes: Record<string, string>): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        const relativePath = path.join(dirRelativePath, entry.name).split(path.sep).join('/')
        if (entry.isDirectory()) {
            await collectHashes(fullPath, relativePath, hashes)
        } else if (entry.isFile()) {
            hashes[relativePath] = await computeFileHash(fullPath)
        }
    }
}

/**
 * 写入 AI 基建植入清单（.ai/manifest.json）
 *
 * @param projectPath 目标项目路径
 * @param manifest 植入清单
 */
export async function writeAiManifest(projectPath: string, manifest: AiScaffoldingManifest): Promise<void> {
    const manifestPath = path.join(projectPath, AI_MANIFEST_RELATIVE_PATH)
    await fs.ensureDir(path.dirname(manifestPath))
    await fs.writeJSON(manifestPath, manifest, { spaces: 4 })
}

/**
 * 读取目标项目 AI 基建植入清单
 *
 * @param projectPath 目标项目路径
 * @returns 植入清单，不存在时返回 null
 */
export async function readAiManifest(projectPath: string): Promise<AiScaffoldingManifest | null> {
    const manifestPath = path.join(projectPath, AI_MANIFEST_RELATIVE_PATH)
    if (!await fs.pathExists(manifestPath)) {
        return null
    }
    try {
        return await fs.readJSON(manifestPath)
    } catch {
        return null
    }
}

/**
 * 校验目标项目 AI 基建快照完整性（对比 manifest 记录的哈希）
 *
 * @param projectPath 目标项目路径
 * @returns 校验结果
 */
export async function verifyAiScaffolding(projectPath: string): Promise<AiScaffoldingVerifyResult> {
    const manifest = await readAiManifest(projectPath)
    if (!manifest) {
        return {
            valid: false,
            mismatches: [AI_MANIFEST_RELATIVE_PATH],
        }
    }
    const mismatches: string[] = []
    for (const [relativePath, expectedHash] of Object.entries(manifest.hashes || {})) {
        const filePath = path.join(projectPath, relativePath)
        if (!await fs.pathExists(filePath)) {
            mismatches.push(relativePath)
            continue
        }
        const actualHash = await computeFileHash(filePath)
        if (actualHash !== expectedHash) {
            mismatches.push(relativePath)
        }
    }
    return {
        valid: mismatches.length === 0,
        mismatches,
    }
}

/**
 * 更新目标项目 AI 基建快照
 * 重新获取资产源 → 清理已移除的精选项 → 复制覆盖 → 写入新清单
 *
 * @param projectPath 目标项目路径
 * @param config CLI 全局配置
 */
export async function updateAiScaffolding(projectPath: string, config?: TemplateCliConfig): Promise<void> {
    const loading = ora('正在更新 AI 基建快照……').start()
    const oldManifest = await readAiManifest(projectPath)
    if (!oldManifest) {
        loading.fail('未找到 .ai/manifest.json，请先通过脚手架初始化 AI 基建')
        return
    }
    try {
        const source = getAiSourceConfig(config)
        const prepared = await prepareAgentsSource(source)
        try {
            const l0 = await readL0Selection(prepared.sourceDir)

            // 清理已不在 L0 精选清单中的旧快照
            const oldSkills = oldManifest.l0Selection?.skills || []
            const oldAgents = oldManifest.l0Selection?.agents || []
            for (const skillName of oldSkills) {
                if (!l0.skills.includes(skillName)) {
                    await fs.remove(path.join(projectPath, '.github/skills', skillName))
                }
            }
            for (const agentName of oldAgents) {
                if (!l0.agents.includes(agentName)) {
                    await fs.remove(path.join(projectPath, '.github/agents', `${agentName}.agent.md`))
                }
            }

            const hashes = await copyL0Selection(prepared.sourceDir, projectPath, l0)
            await writeAiManifest(projectPath, {
                version: 1,
                generatedAt: new Date().toISOString(),
                source: prepared.source,
                l0Selection: l0,
                links: oldManifest.links || [],
                hashes,
            })
            loading.succeed('AI 基建快照更新成功！')
        } finally {
            await prepared.cleanup()
        }
    } catch (error) {
        loading.fail('AI 基建快照更新失败！')
        throw error
    }
}
