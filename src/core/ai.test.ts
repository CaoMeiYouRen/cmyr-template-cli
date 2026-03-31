import path from 'path'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import fs from 'fs-extra'
import ora from 'ora'
import { initAIScaffolding, initAgentsMd, initCopilotInstructions, initCursorRules, initWindsurfRules, initClaudeDirectory, initCursorDirectory } from '@/core/ai'
import type { ProjectInfo } from '@/types/interfaces'

type FsMock = {
    pathExists: ReturnType<typeof vi.fn>
    mkdirp: ReturnType<typeof vi.fn>
    readFile: ReturnType<typeof vi.fn>
    writeFile: ReturnType<typeof vi.fn>
}

vi.mock('fs-extra', () => ({
    default: {
        pathExists: vi.fn(),
        mkdirp: vi.fn(),
        readFile: vi.fn(),
        writeFile: vi.fn(),
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

import { ejsRender } from '@/utils/ejs'
import { copyFilesFromTemplates } from '@/utils/files'

const fsMock = fs as unknown as FsMock
const oraMock = vi.mocked(ora)
const ejsRenderMock = vi.mocked(ejsRender)
const copyFilesFromTemplatesMock = vi.mocked(copyFilesFromTemplates)

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
    })

    it('should initialize Claude and Copilot when aiTools includes both', async () => {
        const projectPath = '/test/project'
        const projectInfo = createMockProjectInfo({ aiTools: ['claude', 'copilot'] })

        fsMock.pathExists.mockResolvedValue(false)
        ejsRenderMock.mockResolvedValue(undefined)
        copyFilesFromTemplatesMock.mockResolvedValue(true)

        await initAIScaffolding(projectPath, projectInfo)

        expect(ejsRenderMock).toHaveBeenCalled()
        expect(copyFilesFromTemplatesMock).toHaveBeenCalled()
    })

    it('should initialize only Claude when aiTools is claude only', async () => {
        const projectPath = '/test/project'
        const projectInfo = createMockProjectInfo({ aiTools: ['claude'] })

        fsMock.pathExists.mockResolvedValue(false)
        ejsRenderMock.mockResolvedValue(undefined)
        copyFilesFromTemplatesMock.mockResolvedValue(true)

        await initAIScaffolding(projectPath, projectInfo)

        // Should init AGENTS.md and .claude directory
        expect(ejsRenderMock).toHaveBeenCalled()
        expect(copyFilesFromTemplatesMock).toHaveBeenCalled()
    })

    it('should initialize Cursor when aiTools includes cursor', async () => {
        const projectPath = '/test/project'
        const projectInfo = createMockProjectInfo({ aiTools: ['cursor'] })

        fsMock.pathExists.mockResolvedValue(false)
        ejsRenderMock.mockResolvedValue(undefined)
        fsMock.mkdirp.mockResolvedValue(undefined)

        await initAIScaffolding(projectPath, projectInfo)

        expect(ejsRenderMock).toHaveBeenCalled()
        expect(fsMock.mkdirp).toHaveBeenCalled()
    })

    it('should initialize Windsurf when aiTools includes windsurf', async () => {
        const projectPath = '/test/project'
        const projectInfo = createMockProjectInfo({ aiTools: ['windsurf'] })

        fsMock.pathExists.mockResolvedValue(false)
        ejsRenderMock.mockResolvedValue(undefined)

        await initAIScaffolding(projectPath, projectInfo)

        expect(ejsRenderMock).toHaveBeenCalled()
    })

    it('should use default aiTools when not specified', async () => {
        const projectPath = '/test/project'
        const projectInfo = createMockProjectInfo()
        // Remove aiTools to test default behavior
        delete (projectInfo as any).aiTools

        fsMock.pathExists.mockResolvedValue(false)
        ejsRenderMock.mockResolvedValue(undefined)
        copyFilesFromTemplatesMock.mockResolvedValue(true)

        await initAIScaffolding(projectPath, projectInfo)

        // Should still initialize with default ['claude', 'copilot']
        expect(ejsRenderMock).toHaveBeenCalled()
    })

    it('should handle errors and log to console', async () => {
        const projectPath = '/test/project'
        const projectInfo = createMockProjectInfo()
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { /* noop */ })

        ejsRenderMock.mockRejectedValue(new Error('Test error'))

        await initAIScaffolding(projectPath, projectInfo)

        expect(consoleErrorSpy).toHaveBeenCalled()
        consoleErrorSpy.mockRestore()
    })
})

describe('initAgentsMd', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        oraMock.mockReturnValue(createOraSpinner() as any)
    })

    it('should render AGENTS.md with project info', async () => {
        const projectPath = '/test/project'
        const projectInfo = createMockProjectInfo({
            projectDescription: 'My awesome project',
            devCommand: 'npm run dev',
            testCommand: 'npm test',
            buildCommand: 'npm run build',
            lintCommand: 'npm run lint',
        })

        fsMock.pathExists.mockResolvedValue(false)
        ejsRenderMock.mockResolvedValue(undefined)

        await initAgentsMd(projectPath, projectInfo)

        expect(ejsRenderMock).toHaveBeenCalledWith(
            path.join(__dirname, '../templates/AGENTS.md.ejs'),
            expect.objectContaining({
                projectDescription: 'My awesome project',
                language: 'typescript',
                runtime: 'nodejs',
                packageManager: 'npm',
                isInitTest: 'vitest',
                devCommand: 'npm run dev',
                testCommand: 'npm test',
                buildCommand: 'npm run build',
                lintCommand: 'npm run lint',
            }),
            path.join(projectPath, 'AGENTS.md'),
        )
    })

    it('should skip when AGENTS.md already exists', async () => {
        const projectPath = '/test/project'
        const projectInfo = createMockProjectInfo()

        fsMock.pathExists.mockResolvedValue(true)

        await initAgentsMd(projectPath, projectInfo)

        expect(ejsRenderMock).not.toHaveBeenCalled()
    })

    it('should use default values when templateMeta is missing', async () => {
        const projectPath = '/test/project'
        const projectInfo = createMockProjectInfo()
        projectInfo.templateMeta = undefined as any

        fsMock.pathExists.mockResolvedValue(false)
        ejsRenderMock.mockResolvedValue(undefined)

        await initAgentsMd(projectPath, projectInfo)

        expect(ejsRenderMock).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                language: 'typescript',
                runtime: 'nodejs',
            }),
            expect.any(String),
        )
    })

    it('should handle errors gracefully', async () => {
        const projectPath = '/test/project'
        const projectInfo = createMockProjectInfo()
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { /* noop */ })

        fsMock.pathExists.mockResolvedValue(false)
        ejsRenderMock.mockRejectedValue(new Error('Render failed'))

        await initAgentsMd(projectPath, projectInfo)

        expect(consoleErrorSpy).toHaveBeenCalled()
        consoleErrorSpy.mockRestore()
    })
})

describe('initCopilotInstructions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        oraMock.mockReturnValue(createOraSpinner() as any)
    })

    it('should create .github directory and render copilot-instructions.md', async () => {
        const projectPath = '/test/project'

        fsMock.pathExists.mockResolvedValue(false)
        fsMock.mkdirp.mockResolvedValue(undefined)
        ejsRenderMock.mockResolvedValue(undefined)

        await initCopilotInstructions(projectPath)

        expect(fsMock.mkdirp).toHaveBeenCalledWith(path.join(projectPath, '.github'))
        expect(ejsRenderMock).toHaveBeenCalledWith(
            path.join(__dirname, '../templates/.github/copilot-instructions.md.ejs'),
            {},
            path.join(projectPath, '.github/copilot-instructions.md'),
        )
    })

    it('should skip when .github directory already exists', async () => {
        const projectPath = '/test/project'

        fsMock.pathExists.mockResolvedValue(true)
        fsMock.mkdirp.mockResolvedValue(undefined)

        await initCopilotInstructions(projectPath)

        expect(fsMock.mkdirp).not.toHaveBeenCalled()
        expect(ejsRenderMock).not.toHaveBeenCalled()
    })

    it('should skip when copilot-instructions.md already exists', async () => {
        const projectPath = '/test/project'

        // The implementation checks for copilot-instructions.md file first
        fsMock.pathExists.mockResolvedValueOnce(true)

        await initCopilotInstructions(projectPath)

        expect(ejsRenderMock).not.toHaveBeenCalled()
    })
})

describe('initCursorRules', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        oraMock.mockReturnValue(createOraSpinner() as any)
    })

    it('should render .cursorrules file', async () => {
        const projectPath = '/test/project'

        fsMock.pathExists.mockResolvedValue(false)
        ejsRenderMock.mockResolvedValue(undefined)

        await initCursorRules(projectPath)

        expect(ejsRenderMock).toHaveBeenCalledWith(
            path.join(__dirname, '../templates/.cursorrules.ejs'),
            {},
            path.join(projectPath, '.cursorrules'),
        )
    })

    it('should skip when .cursorrules already exists', async () => {
        const projectPath = '/test/project'

        fsMock.pathExists.mockResolvedValue(true)

        await initCursorRules(projectPath)

        expect(ejsRenderMock).not.toHaveBeenCalled()
    })
})

describe('initWindsurfRules', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        oraMock.mockReturnValue(createOraSpinner() as any)
    })

    it('should render .windsurfrules file', async () => {
        const projectPath = '/test/project'

        fsMock.pathExists.mockResolvedValue(false)
        ejsRenderMock.mockResolvedValue(undefined)

        await initWindsurfRules(projectPath)

        expect(ejsRenderMock).toHaveBeenCalledWith(
            path.join(__dirname, '../templates/.windsurfrules.ejs'),
            {},
            path.join(projectPath, '.windsurfrules'),
        )
    })

    it('should skip when .windsurfrules already exists', async () => {
        const projectPath = '/test/project'

        fsMock.pathExists.mockResolvedValue(true)

        await initWindsurfRules(projectPath)

        expect(ejsRenderMock).not.toHaveBeenCalled()
    })
})

describe('initClaudeDirectory', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        oraMock.mockReturnValue(createOraSpinner() as any)
    })

    it('should create .claude directory structure with skills and agents subdirs', async () => {
        const projectPath = '/test/project'

        fsMock.pathExists.mockResolvedValue(false)
        fsMock.mkdirp.mockResolvedValue(undefined)
        copyFilesFromTemplatesMock.mockResolvedValue(true)

        await initClaudeDirectory(projectPath)

        expect(fsMock.mkdirp).toHaveBeenCalledWith(path.join(projectPath, '.claude', 'skills'))
        expect(fsMock.mkdirp).toHaveBeenCalledWith(path.join(projectPath, '.claude', 'agents'))
        expect(copyFilesFromTemplatesMock).toHaveBeenCalledWith(projectPath, ['.claude/settings.json'], true)
    })

    it('should skip when .claude directory already exists', async () => {
        const projectPath = '/test/project'

        fsMock.pathExists.mockResolvedValue(true)

        await initClaudeDirectory(projectPath)

        expect(fsMock.mkdirp).not.toHaveBeenCalled()
        expect(copyFilesFromTemplatesMock).not.toHaveBeenCalled()
    })
})

describe('initCursorDirectory', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        oraMock.mockReturnValue(createOraSpinner() as any)
    })

    it('should create .cursor/rules directory', async () => {
        const projectPath = '/test/project'

        fsMock.pathExists.mockResolvedValue(false)
        fsMock.mkdirp.mockResolvedValue(undefined)

        await initCursorDirectory(projectPath)

        expect(fsMock.mkdirp).toHaveBeenCalledWith(path.join(projectPath, '.cursor', 'rules'))
    })

    it('should skip when .cursor/rules directory already exists', async () => {
        const projectPath = '/test/project'

        fsMock.pathExists.mockResolvedValue(true)

        await initCursorDirectory(projectPath)

        expect(fsMock.mkdirp).not.toHaveBeenCalled()
    })
})
