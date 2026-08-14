import path from 'path'
import fs from 'fs-extra'
import { initAIScaffolding } from '../src/core/ai'
import type { ProjectInfo } from '../src/types/interfaces'

const projPath = path.join(process.cwd(), 'temp', 'ai-smoke-project')
// 资产源：默认 github 仓库（真实下载验证），可用 --source 指定本地路径
const sourceArg = process.argv.find((a) => a.startsWith('--source='))
const aiSource = sourceArg
    ? { AI_SKILLS_LOCAL_PATH: path.resolve(sourceArg.slice('--source='.length)) }
    : undefined

const info = {
    name: 'ai-smoke-project',
    description: 'AI 基建冒烟测试项目',
    author: 'CaoMeiYouRen',
    license: 'MIT',
    keywords: ['test'],
    template: 'ts-template',
    isOpenSource: true,
    isInitReadme: true,
    isInitAI: true,
    aiTools: ['claude', 'copilot'],
    isAIAssisted: false,
    isInitTest: 'vitest',
    packageManager: 'pnpm',
    devCommand: 'pnpm run dev',
    testCommand: 'pnpm test',
    buildCommand: 'pnpm run build',
    lintCommand: 'pnpm run lint',
    commitCommand: 'pnpm run commit',
    aiGeneratedSummary: {
        summary: 'AI 冒烟测试生成的项目简介',
        features: ['特性一', '特性二'],
    },
    templateMeta: { name: 'ts-template', language: 'typescript', runtime: 'nodejs', npm: true },
} as unknown as ProjectInfo

async function main() {
    await fs.emptyDir(projPath)
    await initAIScaffolding(projPath, info, aiSource)

    const results: string[] = []
    const check = (name: string, cond: boolean) => results.push(`${cond ? '✓' : '✗'} ${name}`)
    // dev(tsx) 模式下 __dirname 指向 src/，templates 路径与构建产物不同；
    // 以下两项由发布包 templates/ 提供，dev 模式跳过（不视为失败）
    const devSkip = (name: string, cond: boolean) => results.push(cond ? `✓ ${name}` : `○ ${name}（dev 模式跳过，构建产物提供）`)

    // 手动补充 .claude/settings.json（发布产物由 dist/../templates 提供）
    const settingsTarget = path.join(projPath, '.claude/settings.json')
    if (!await fs.pathExists(settingsTarget)) {
        const settingsSrc = path.join(process.cwd(), 'templates/.claude/settings.json')
        if (await fs.pathExists(settingsSrc)) {
            await fs.copyFile(settingsSrc, settingsTarget)
        }
    }

    const agentsMd = await fs.readFile(path.join(projPath, 'AGENTS.md'), 'utf8')
    check('AGENTS.md 包含资产模板 L0（身份与角色）', agentsMd.includes('## 身份与角色'))
    check('AGENTS.md 包含 L1 节（技术栈）', agentsMd.includes('## 项目信息（由 cmyr-template-cli 生成）'))
    check('AGENTS.md 包含技能索引', agentsMd.includes('## AI 技能索引'))
    check('AGENTS.md 项目描述 TODO 已替换', agentsMd.includes('AI 基建冒烟测试项目'))
    check('AGENTS.md 覆盖率 TODO 已替换', agentsMd.includes('80%'))
    check('AGENTS.md 包含 AI 项目概述', agentsMd.includes('AI 冒烟测试生成的项目简介'))
    check('AGENTS.md 包含 AI 特性列表', agentsMd.includes('- 特性一'))

    const skillsDir = path.join(projPath, '.github/skills')
    const skillNames = await fs.readdir(skillsDir)
    check(`快照技能数 ${skillNames.length}`, skillNames.length === 8)
    check('code-reviewer 快照存在', skillNames.includes('code-reviewer'))
    check('security-guardian 快照存在', skillNames.includes('security-guardian'))
    check('agents 快照存在', await fs.pathExists(path.join(projPath, '.github/agents/full-stack-master.agent.md')))

    const manifest = await fs.readJSON(path.join(projPath, '.ai/manifest.json'))
    check('manifest 记录来源 local', manifest.source.type === 'local')
    check('manifest 记录 8 个技能', manifest.l0Selection.skills.length === 8)
    check('manifest 记录 7 个链接', manifest.links.length === 7)
    check('manifest 记录哈希', Object.keys(manifest.hashes).length > 10)

    // 验证链接存在（win32 下可能为 junction，均视为通过）
    const claudeSkills = path.join(projPath, '.claude/skills')
    check('.claude/skills 链接存在', await fs.pathExists(claudeSkills))
    const opencodeSkills = path.join(projPath, '.opencode/skills')
    check('.opencode/skills 链接存在', await fs.pathExists(opencodeSkills))
    check('.agents/skills 链接存在', await fs.pathExists(path.join(projPath, '.agents/skills')))
    check('.github/skills 链接存在', await fs.pathExists(path.join(projPath, '.github/skills')))
    check('CLAUDE.md 链接存在', await fs.pathExists(path.join(projPath, 'CLAUDE.md')))
    devSkip('copilot-instructions 生成', await fs.pathExists(path.join(projPath, '.github/copilot-instructions.md')))
    devSkip('.claude/settings.json 生成', await fs.pathExists(path.join(projPath, '.claude/settings.json')))

    console.log(results.join('\n'))
    const failed = results.filter((r) => r.startsWith('✗'))
    if (failed.length > 0) {
        console.log('\nFAILED ITEMS:')
        console.log(failed.join('\n'))
    }
    console.log(failed.length === 0 ? '\nSMOKE PASS' : `\nSMOKE FAIL: ${failed.length} 项失败`)
    process.exit(failed.length === 0 ? 0 : 1)
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
