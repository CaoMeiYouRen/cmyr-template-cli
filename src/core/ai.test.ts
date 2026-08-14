import path from 'path'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import fs from 'fs-extra'
import ora from 'ora'
import { initAIScaffolding, initAgentsMd, initAgentLinkDirs } from '@/core/ai'
import type { ProjectInfo } from '@/types/interfaces'

type FsMock = {
    pathExists: ReturnType<typeof vi.fn>
    mkdirp: ReturnType<typeof vi.fn>
    readFile: ReturnType<typeof vi.fn>
    writeFile: ReturnType<typeof vi.fn>
    appendFile: ReturnType<typeof vi.fn>
}

vi.mock('fs-extra', () => ({
    default: {
        pathExists: vi.fn(),
        mkdirp: vi.fn(),
        readFile: vi.fn(),
        writeFile: vi.fn(),
        appendFile: vi.fn(),
    },
}))

vi.mock('ora', () => ({
    default: vi.fn(() => ({
        start: vi.fn().mockReturnThis(),
        succeed: vi.fn().mockReturnThis(),
        fail: vi.fn().mockReturnThis(),
        stopAndPersist: vi.fn().mockReturnThis(),
    })),
}))

vi.mock('@/utils/ejs', () => ({
    ejsRender: vi.fn(),
}))

vi.mock('@/utils/files', () => ({
    copyFilesFromTemplates: vi.fn(),
}))

vi.mock('@/utils/symlink', () => ({
    createDirSymlink: vi.fn(),
    createFileSymlink: vi.fn(),
}))

vi.mock('@/utils/ai-scaffolding', () => ({
    getAiSourceConfig: vi.fn(() => ({ type: 'local', localPath: '/assets' })),
    prepareAgentsSource: vi.fn(async () => ({
        sourceDir: '/assets',
        source: { type: 'local', localPath: '/assets' },
        cleanup: vi.fn(),
    })),
    readL0Selection: vi.fn(async () => ({
        files: ['global/AGENTS.template.md'],
        skills: ['code-reviewer'],
        agents: ['full-stack-master'],
    })),
    readAgentsTemplate: vi.fn(async () => '# AGENTS.md 模板\n\n<!-- TODO: 一句话描述项目目的 -->'),
    copyL0Selection: vi.fn(async () => ({
        '.github/skills/code-reviewer/SKILL.md': 'hash1',
    })),
    writeAiManifest: vi.fn(),
}))

vi.mock('@/pure/agents-md', () => ({
    replaceAgentsTemplateTodos: vi.fn((content) => content),
    buildAgentsMdL1Section: vi.fn(() => '## L1 Section'),
}))

import { ejsRender } from '@/utils/ejs'
import { copyFilesFromTemplates } from '@/utils/files'
import { createDirSymlink, createFileSymlink } from '@/utils/symlink'
import { prepareAgentsSource, readAgentsTemplate, writeAiManifest } from '@/utils/ai-scaffolding'

const fsMock = fs as unknown as FsMock
const oraMock = vi.mocked(ora)
const ejsRenderMock = vi.mocked(ejsRender)
const copyFilesFromTemplatesMock = vi.mocked(copyFilesFromTemplates)
const createDirSymlinkMock = vi.mocked(createDirSymlink)
const createFileSymlinkMock = vi.mocked(createFileSymlink)
const prepareAgentsSourceMock = vi.mocked(prepareAgentsSource)
const readAgentsTemplateMock = vi.mocked(readAgentsTemplate)
const writeAiManifestMock = vi.mocked(writeAiManifest)

const createOraSpinner = () => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
    stopAndPersist: vi.fn().mockReturnThis(),
})

const createMockProjectInfo = (overrides: Partial<ProjectInfo> = {}): ProjectInfo => ({
    name: 'test-project',
    description: 'Test project description',
    author: 'test-author',
    license: 'MIT',
    keywords: ['test'],
    template: 'ts-template',
    jsModuleType: 'esm',
    isOpenSource: true,
    isInitRemoteRepo: true,
    gitRemoteUrl: 'git@github.com:test/test-project.git',
    isPublishToNpm: true,
    isRemoveDependabot: false,
    isInitReadme: true,
    isInitContributing: true,
    isInitHusky: true,
    isInitSemanticRelease: true,
    isInitTest: 'vitest',
    isEnableStarHistory: true,
    isRemoveYarn: false,
    isInitDocker: true,
    commonDependencies: [],
    isPrivateScopePackage: false,
    scopeName: '',
    isInitAI: true,
    aiTools: ['claude', 'copilot'],
    isAIAssisted: false,
    currentYear: 2025,
    version: '0.0.1',
    authorWebsite: '',
    homepage: '',
    demoUrl: '',
    gitUrl: '',
    repositoryUrl: '',
    issuesUrl: '',
    contributingUrl: '',
    githubUsername: 'testuser',
    authorName: 'Test Author',
    authorGithubUsername: 'testuser',
    engines: {},
    licenseName: 'MIT',
    licenseUrl: '',
    documentationUrl: '',
    isGithubRepos: true,
    installCommand: 'npm install',
    isJSProject: true,
    packageManager: 'npm',
    isProjectOnNpm: true,
    packageName: 'test-project',
    projectName: 'test-project',
    projectVersion: '0.0.1',
    projectDocumentationUrl: '',
    projectDescription: 'Test project description',
    projectHomepage: '',
    projectDemoUrl: '',
    projectPrerequisites: [],
    discussionsUrl: '',
    pullRequestsUrl: '',
    templateMeta: {
        name: 'ts-template',
        language: 'typescript',
        runtime: 'nodejs',
        docker: true,
        npm: true,
    },
    ...overrides,
})

describe('initAIScaffolding', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // Setup ora mock
        oraMock.mockReturnValue(createOraSpinner() as any)
        fsMock.pathExists.mockResolvedValue(false)
        ejsRenderMock.mockResolvedValue(undefined)
        copyFilesFromTemplatesMock.mockResolvedValue(true)
        createDirSymlinkMock.mockResolvedValue({
            linkPath: '/test/.claude/skills',
            targetPath: '/test/.github/skills',
            method: 'symlink',
            status: 'created',
        })
        createFileSymlinkMock.mockResolvedValue({
            linkPath: '/test/CLAUDE.md',
            targetPath: '/test/AGENTS.md',
            method: 'symlink',
            status: 'created',
        })
    })

    it('should initialize Claude and Copilot when aiTools includes both', async () => {
        const projectPath = '/test/project'
        const projectInfo = createMockProjectInfo({ aiTools: ['claude', 'copilot'] })

        await initAIScaffolding(projectPath, projectInfo)

        expect(prepareAgentsSourceMock).toHaveBeenCalled()
        expect(writeAiManifestMock).toHaveBeenCalled()
        expect(copyFilesFromTemplatesMock).toHaveBeenCalled()
    })

    it('should initialize only Claude when aiTools is claude only', async () => {
        const projectPath = '/test/project'
        const projectInfo = createMockProjectInfo({ aiTools: ['claude'] })

        await initAIScaffolding(projectPath, projectInfo)

        expect(prepareAgentsSourceMock).toHaveBeenCalled()
        expect(writeAiManifestMock).toHaveBeenCalled()
        expect(copyFilesFromTemplatesMock).toHaveBeenCalled()
    })

    it('should initialize Cursor when aiTools includes cursor', async () => {
        const projectPath = '/test/project'
        const projectInfo = createMockProjectInfo({ aiTools: ['cursor'] })

        await initAIScaffolding(projectPath, projectInfo)

        expect(ejsRenderMock).toHaveBeenCalled()
        expect(fsMock.mkdirp).toHaveBeenCalled()
        expect(prepareAgentsSourceMock).not.toHaveBeenCalled()
    })

    it('should initialize Windsurf when aiTools includes windsurf', async () => {
        const projectPath = '/test/project'
        const projectInfo = createMockProjectInfo({ aiTools: ['windsurf'] })

        await initAIScaffolding(projectPath, projectInfo)

        expect(ejsRenderMock).toHaveBeenCalled()
        expect(prepareAgentsSourceMock).not.toHaveBeenCalled()
    })

    it('should use default aiTools when not specified', async () => {
        const projectPath = '/test/project'
        const projectInfo = createMockProjectInfo()
        // Remove aiTools to test default behavior
        delete (projectInfo as any).aiTools

        await initAIScaffolding(projectPath, projectInfo)

        expect(prepareAgentsSourceMock).toHaveBeenCalled()
    })

    it('should handle errors and log to console', async () => {
        const projectPath = '/test/project'
        const projectInfo = createMockProjectInfo()
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { /* noop */ })

        prepareAgentsSourceMock.mockRejectedValueOnce(new Error('Test error'))

        await initAIScaffolding(projectPath, projectInfo)

        expect(consoleErrorSpy).toHaveBeenCalled()
        consoleErrorSpy.mockRestore()
    })

    it('should cleanup prepared source after initialization', async () => {
        const projectPath = '/test/project'
        const projectInfo = createMockProjectInfo({ aiTools: ['claude'] })
        const cleanupMock = vi.fn()
        prepareAgentsSourceMock.mockResolvedValueOnce({
            sourceDir: '/assets',
            source: { type: 'github', repository: 'repo', commit: 'abc' },
            cleanup: cleanupMock,
        })

        await initAIScaffolding(projectPath, projectInfo)

        expect(cleanupMock).toHaveBeenCalled()
    })
})

describe('initAgentsMd', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        oraMock.mockReturnValue(createOraSpinner() as any)
        fsMock.pathExists.mockResolvedValue(false)
    })

    it('should write AGENTS.md from asset template with L1 section', async () => {
        const projectPath = '/test/project'
        const projectInfo = createMockProjectInfo({
            projectDescription: 'My awesome project',
            devCommand: 'npm run dev',
            testCommand: 'npm test',
            buildCommand: 'npm run build',
            lintCommand: 'npm run lint',
        })

        fsMock.readFile.mockResolvedValue('# AGENTS.md 模板\n\n<!-- TODO: 一句话描述项目目的 -->')

        await initAgentsMd(projectPath, projectInfo, '/assets', {
            files: ['global/AGENTS.template.md'],
            skills: ['code-reviewer'],
            agents: ['full-stack-master'],
        })

        expect(fsMock.writeFile).toHaveBeenCalledWith(
            path.join(projectPath, 'AGENTS.md'),
            expect.stringContaining('# AGENTS.md 模板'),
        )
        expect(fsMock.writeFile).toHaveBeenCalledWith(
            expect.any(String),
            expect.stringContaining('## L1 Section'),
        )
    })

    it('should skip when AGENTS.md already exists', async () => {
        const projectPath = '/test/project'
        const projectInfo = createMockProjectInfo()

        fsMock.pathExists.mockResolvedValue(true)

        await initAgentsMd(projectPath, projectInfo, '/assets', {
            files: [],
            skills: [],
            agents: [],
        })

        expect(fsMock.writeFile).not.toHaveBeenCalled()
    })

    it('should throw when sourceDir is missing', async () => {
        const projectPath = '/test/project'
        const projectInfo = createMockProjectInfo()

        await expect(initAgentsMd(projectPath, projectInfo)).rejects.toThrow('未提供 AI 技能资产源')
    })

    it('should throw when template is missing in asset repository', async () => {
        const projectPath = '/test/project'
        const projectInfo = createMockProjectInfo()

        readAgentsTemplateMock.mockResolvedValueOnce(null)

        await expect(initAgentsMd(projectPath, projectInfo, '/assets', {
            files: [],
            skills: [],
            agents: [],
        })).rejects.toThrow('缺少 global/AGENTS.template.md')
    })

    it('should handle errors gracefully', async () => {
        const projectPath = '/test/project'
        const projectInfo = createMockProjectInfo()
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { /* noop */ })

        fsMock.writeFile.mockRejectedValue(new Error('Write failed'))

        await expect(initAgentsMd(projectPath, projectInfo, '/assets', {
            files: [],
            skills: [],
            agents: [],
        })).rejects.toThrow('Write failed')

        consoleErrorSpy.mockRestore()
    })
})

describe('initAgentLinkDirs', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        oraMock.mockReturnValue(createOraSpinner() as any)
    })

    it('should create dir links and CLAUDE.md link for claude tool', async () => {
        const projectPath = '/test/project'
        const projectInfo = createMockProjectInfo({ aiTools: ['claude'] })

        createDirSymlinkMock.mockResolvedValue({
            linkPath: '',
            targetPath: '',
            method: 'symlink',
            status: 'created',
        })
        createFileSymlinkMock.mockResolvedValue({
            linkPath: '',
            targetPath: '',
            method: 'symlink',
            status: 'created',
        })

        const links = await initAgentLinkDirs(projectPath, projectInfo)

        // 6 个目录链接 + 1 个 CLAUDE.md 文件链接
        expect(createDirSymlinkMock).toHaveBeenCalledTimes(6)
        expect(createFileSymlinkMock).toHaveBeenCalledTimes(1)
        expect(links).toHaveLength(7)
        expect(links.some((l) => l.linkRelPath === 'CLAUDE.md')).toBe(true)
    })

    it('should not create CLAUDE.md link when claude not selected', async () => {
        const projectPath = '/test/project'
        const projectInfo = createMockProjectInfo({ aiTools: ['copilot'] })

        createDirSymlinkMock.mockResolvedValue({
            linkPath: '',
            targetPath: '',
            method: 'symlink',
            status: 'created',
        })

        const links = await initAgentLinkDirs(projectPath, projectInfo)

        expect(createDirSymlinkMock).toHaveBeenCalledTimes(6)
        expect(createFileSymlinkMock).not.toHaveBeenCalled()
        expect(links).toHaveLength(6)
    })

    it('should record junction method when degraded', async () => {
        const projectPath = '/test/project'
        const projectInfo = createMockProjectInfo({ aiTools: ['claude'] })

        createDirSymlinkMock.mockResolvedValue({
            linkPath: '',
            targetPath: '',
            method: 'junction',
            status: 'created',
        })
        createFileSymlinkMock.mockResolvedValue({
            linkPath: '',
            targetPath: '',
            method: 'copy',
            status: 'created',
        })

        const links = await initAgentLinkDirs(projectPath, projectInfo)

        expect(fsMock.appendFile).not.toHaveBeenCalled()
        expect(links.filter((l) => l.method === 'junction')).toHaveLength(6)
        expect(links.some((l) => l.linkRelPath === 'CLAUDE.md' && l.method === 'copy')).toBe(true)
    })
})

