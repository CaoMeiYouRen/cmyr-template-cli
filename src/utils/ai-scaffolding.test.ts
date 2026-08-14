import os from 'os'
import path from 'path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import fs from 'fs-extra'
import axios from 'axios'
import AdmZip from 'adm-zip'
import {
    AI_MANIFEST_RELATIVE_PATH,
    DEFAULT_AI_SKILLS_REPOSITORY,
    computeFileHash,
    copyL0Selection,
    getAiSourceConfig,
    getGitHubLatestCommit,
    prepareAgentsSource,
    readAgentsTemplate,
    readAiManifest,
    readL0Selection,
    updateAiScaffolding,
    verifyAiScaffolding,
    writeAiManifest,
} from '@/utils/ai-scaffolding'
import type { AiScaffoldingManifest } from '@/types/interfaces'

vi.mock('@/utils/constants', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/utils/constants')>()
    return {
        ...actual,
        REMOTES: ['https://github.com'],
    }
})

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-scaffolding-test-'))

const createTempProject = () => fs.mkdtempSync(path.join(tempRoot, 'project-'))

const createMockManifest = (overrides: Partial<AiScaffoldingManifest> = {}): AiScaffoldingManifest => ({
    version: 1,
    generatedAt: '2026-08-15T00:00:00.000Z',
    source: { type: 'github', repository: DEFAULT_AI_SKILLS_REPOSITORY, commit: 'abc123' },
    l0Selection: {
        files: ['global/AGENTS.template.md'],
        skills: ['code-reviewer'],
        agents: ['full-stack-master'],
    },
    links: [
        { linkRelPath: '.claude/skills', targetRelPath: '.github/skills', method: 'symlink' },
    ],
    hashes: {},
    ...overrides,
})

afterEach(async () => {
    await fs.emptyDir(tempRoot)
})

describe('getAiSourceConfig', () => {
    it('should use github repository by default', () => {
        const source = getAiSourceConfig()
        expect(source).toEqual({ type: 'github', repository: DEFAULT_AI_SKILLS_REPOSITORY })
    })

    it('should prefer local path when configured', () => {
        const source = getAiSourceConfig({
            AI_SKILLS_LOCAL_PATH: './assets',
        } as any)
        expect(source.type).toBe('local')
        expect(source.localPath).toBe(path.resolve('./assets'))
    })

    it('should use custom repository when configured', () => {
        const source = getAiSourceConfig({ AI_SKILLS_REPOSITORY: 'user/repo' } as any)
        expect(source).toEqual({ type: 'github', repository: 'user/repo' })
    })
})

describe('getGitHubLatestCommit', () => {
    it('should return commit sha on success', async () => {
        vi.spyOn(axios, 'get').mockResolvedValueOnce({ data: { sha: 'sha-123' } } as any)
        expect(await getGitHubLatestCommit('repo')).toBe('sha-123')
    })

    it('should return null on failure', async () => {
        vi.spyOn(axios, 'get').mockRejectedValueOnce(new Error('network'))
        expect(await getGitHubLatestCommit('repo')).toBeNull()
    })
})

describe('prepareAgentsSource', () => {
    it('should throw when local path does not exist', async () => {
        await expect(prepareAgentsSource({ type: 'local', localPath: '/nonexistent' }))
            .rejects.toThrow('本地路径不存在')
    })

    it('should return local source directly', async () => {
        const localDir = path.join(tempRoot, 'local-assets')
        await fs.ensureDir(localDir)
        const prepared = await prepareAgentsSource({ type: 'local', localPath: localDir })
        expect(prepared.sourceDir).toBe(localDir)
        await prepared.cleanup()
        expect(await fs.pathExists(localDir)).toBe(true) // local 不清理
    })

    it('should download and extract github source to temp dir', async () => {
        const zip = new AdmZip()
        zip.addFile('cmyr-skills-agents-master/README.md', Buffer.from('readme content'))
        zip.addFile('cmyr-skills-agents-master/global/AGENTS.template.md', Buffer.from('# Template'))
        const zipBuffer = zip.toBuffer()

        const axiosGetSpy = vi.spyOn(axios, 'get')
            .mockResolvedValueOnce({ data: zipBuffer } as any) // 下载 zip
            .mockResolvedValueOnce({ data: { sha: 'sha-abc' } } as any) // 获取 commit

        const prepared = await prepareAgentsSource({ type: 'github', repository: 'owner/repo' })

        expect(prepared.sourceDir).toContain(os.tmpdir())
        expect(prepared.source.commit).toBe('sha-abc')
        expect(await fs.pathExists(path.join(prepared.sourceDir, 'README.md'))).toBe(true)
        expect(await fs.pathExists(path.join(prepared.sourceDir, 'global/AGENTS.template.md'))).toBe(true)
        await prepared.cleanup()
        expect(await fs.pathExists(prepared.sourceDir)).toBe(false)
        axiosGetSpy.mockRestore()
    })
})

describe('readL0Selection', () => {
    it('should read l0Selection from manifest.json', async () => {
        const sourceDir = path.join(tempRoot, 'assets')
        await fs.ensureDir(sourceDir)
        await fs.writeJSON(path.join(sourceDir, 'manifest.json'), {
            l0Selection: {
                files: ['global/AGENTS.template.md'],
                skills: ['code-reviewer'],
                agents: ['full-stack-master'],
            },
        })

        const l0 = await readL0Selection(sourceDir)
        expect(l0.skills).toEqual(['code-reviewer'])
        expect(l0.agents).toEqual(['full-stack-master'])
    })

    it('should throw when l0Selection is invalid', async () => {
        const sourceDir = path.join(tempRoot, 'assets-bad')
        await fs.ensureDir(sourceDir)
        await fs.writeJSON(path.join(sourceDir, 'manifest.json'), { l0Selection: {} })

        await expect(readL0Selection(sourceDir)).rejects.toThrow('缺少有效的 l0Selection')
    })
})

describe('readAgentsTemplate', () => {
    it('should return template content', async () => {
        const sourceDir = path.join(tempRoot, 'assets-2')
        await fs.ensureDir(path.join(sourceDir, 'global'))
        await fs.writeFile(path.join(sourceDir, 'global/AGENTS.template.md'), '# Template')

        expect(await readAgentsTemplate(sourceDir)).toBe('# Template')
    })

    it('should return null when template missing', async () => {
        const sourceDir = path.join(tempRoot, 'assets-3')
        await fs.ensureDir(sourceDir)
        expect(await readAgentsTemplate(sourceDir)).toBeNull()
    })
})

describe('computeFileHash', () => {
    it('should compute deterministic sha256', async () => {
        const filePath = path.join(tempRoot, 'hash.txt')
        await fs.writeFile(filePath, 'hello')
        const hash1 = await computeFileHash(filePath)
        const hash2 = await computeFileHash(filePath)
        expect(hash1).toBe(hash2)
        expect(hash1).toHaveLength(64)
    })
})

describe('copyL0Selection', () => {
    it('should copy skills and agents with hashes', async () => {
        const sourceDir = path.join(tempRoot, 'assets-4')
        const projectPath = path.join(tempRoot, 'project-4')
        await fs.ensureDir(path.join(sourceDir, 'skills', 'code-reviewer'))
        await fs.writeFile(path.join(sourceDir, 'skills', 'code-reviewer', 'SKILL.md'), 'skill content')
        await fs.writeFile(path.join(sourceDir, 'skills', 'code-reviewer', 'ref.md'), 'ref content')
        await fs.ensureDir(path.join(sourceDir, 'agents'))
        await fs.writeFile(path.join(sourceDir, 'agents', 'full-stack-master.agent.md'), 'agent content')

        const hashes = await copyL0Selection(sourceDir, projectPath, {
            files: [],
            skills: ['code-reviewer'],
            agents: ['full-stack-master'],
        })

        expect(await fs.pathExists(path.join(projectPath, '.github/skills/code-reviewer/SKILL.md'))).toBe(true)
        expect(await fs.pathExists(path.join(projectPath, '.github/agents/full-stack-master.agent.md'))).toBe(true)
        expect(Object.keys(hashes).sort()).toEqual([
            '.github/agents/full-stack-master.agent.md',
            '.github/skills/code-reviewer/SKILL.md',
            '.github/skills/code-reviewer/ref.md',
        ].sort())
    })

    it('should warn and skip missing skills', async () => {
        const sourceDir = path.join(tempRoot, 'assets-5')
        const projectPath = path.join(tempRoot, 'project-5')
        await fs.ensureDir(sourceDir)
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { /* noop */ })

        const hashes = await copyL0Selection(sourceDir, projectPath, {
            files: [],
            skills: ['missing-skill'],
            agents: [],
        })

        expect(warnSpy).toHaveBeenCalled()
        expect(hashes).toEqual({})
        warnSpy.mockRestore()
    })
})

describe('writeAiManifest / readAiManifest', () => {
    it('should round-trip manifest', async () => {
        const projectPath = createTempProject()
        const manifest = createMockManifest()

        await writeAiManifest(projectPath, manifest)
        const read = await readAiManifest(projectPath)

        expect(read).toEqual(manifest)
        expect(await fs.pathExists(path.join(projectPath, AI_MANIFEST_RELATIVE_PATH))).toBe(true)
    })

    it('should return null when manifest missing', async () => {
        const projectPath = createTempProject()
        expect(await readAiManifest(projectPath)).toBeNull()
    })
})

describe('verifyAiScaffolding', () => {
    it('should return valid when hashes match', async () => {
        const projectPath = createTempProject()
        await fs.ensureDir(path.join(projectPath, '.github/skills/code-reviewer'))
        const skillFile = path.join(projectPath, '.github/skills/code-reviewer/SKILL.md')
        await fs.writeFile(skillFile, 'content')
        const hash = await computeFileHash(skillFile)

        await writeAiManifest(projectPath, createMockManifest({
            hashes: { '.github/skills/code-reviewer/SKILL.md': hash },
        }))

        const result = await verifyAiScaffolding(projectPath)
        expect(result.valid).toBe(true)
        expect(result.mismatches).toEqual([])
    })

    it('should detect modified and missing files', async () => {
        const projectPath = createTempProject()
        await fs.ensureDir(path.join(projectPath, '.github/skills/code-reviewer'))
        const skillFile = path.join(projectPath, '.github/skills/code-reviewer/SKILL.md')
        await fs.writeFile(skillFile, 'modified content')

        await writeAiManifest(projectPath, createMockManifest({
            hashes: {
                '.github/skills/code-reviewer/SKILL.md': 'tampered',
                '.github/skills/code-reviewer/missing.md': 'whatever',
            },
        }))

        const result = await verifyAiScaffolding(projectPath)
        expect(result.valid).toBe(false)
        expect(result.mismatches).toContain('.github/skills/code-reviewer/SKILL.md')
        expect(result.mismatches).toContain('.github/skills/code-reviewer/missing.md')
    })

    it('should return invalid when manifest missing', async () => {
        const projectPath = createTempProject()
        const result = await verifyAiScaffolding(projectPath)
        expect(result.valid).toBe(false)
    })
})

describe('updateAiScaffolding', () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    it('should warn and skip when manifest missing', async () => {
        const projectPath = createTempProject()
        const failSpy = vi.spyOn(console, 'error').mockImplementation(() => { /* noop */ })

        await updateAiScaffolding(projectPath)

        expect(failSpy).not.toHaveBeenCalled()
    })

    it('should update snapshot and write new manifest', async () => {
        const projectPath = createTempProject()
        const oldManifest = createMockManifest({
            l0Selection: {
                files: [],
                skills: ['old-skill', 'removed-skill'],
                agents: [],
            },
        })
        await writeAiManifest(projectPath, oldManifest)
        await fs.ensureDir(path.join(projectPath, '.github/skills/old-skill'))
        await fs.writeFile(path.join(projectPath, '.github/skills/old-skill/SKILL.md'), 'old')
        await fs.ensureDir(path.join(projectPath, '.github/skills/removed-skill'))
        await fs.writeFile(path.join(projectPath, '.github/skills/removed-skill/SKILL.md'), 'removed')

        const sourceDir = path.join(tempRoot, 'assets-update')
        await fs.ensureDir(path.join(sourceDir, 'skills', 'new-skill'))
        await fs.writeFile(path.join(sourceDir, 'skills', 'new-skill', 'SKILL.md'), 'new')
        await fs.ensureDir(path.join(sourceDir, 'agents'))
        await fs.ensureDir(path.join(sourceDir, 'global'))
        await fs.writeFile(path.join(sourceDir, 'manifest.json'), JSON.stringify({
            l0Selection: {
                files: ['global/AGENTS.template.md'],
                skills: ['old-skill', 'new-skill'],
                agents: [],
            },
        }))

        vi.spyOn(axios, 'get').mockRejectedValue(new Error('should not call network'))

        await updateAiScaffolding(projectPath, {
            AI_SKILLS_LOCAL_PATH: sourceDir,
        } as any)

        // 已移除的技能被清理
        expect(await fs.pathExists(path.join(projectPath, '.github/skills/removed-skill'))).toBe(false)
        // 保留的技能更新
        expect(await fs.pathExists(path.join(projectPath, '.github/skills/old-skill/SKILL.md'))).toBe(true)
        // 新技能已复制
        expect(await fs.pathExists(path.join(projectPath, '.github/skills/new-skill/SKILL.md'))).toBe(true)

        const newManifest = await readAiManifest(projectPath)
        expect(newManifest?.l0Selection.skills).toEqual(['old-skill', 'new-skill'])
        expect(newManifest?.hashes['.github/skills/new-skill/SKILL.md']).toHaveLength(64)
    })
})
