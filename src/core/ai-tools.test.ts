import path from 'path'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import fs from 'fs-extra'
import ora from 'ora'
import { initCopilotInstructions, initCursorRules, initWindsurfRules, initClaudeDirectory, initCursorDirectory } from '@/core/ai'

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

    it('should create .claude directory and copy settings.json', async () => {
        const projectPath = '/test/project'

        fsMock.pathExists.mockResolvedValue(false)
        fsMock.mkdirp.mockResolvedValue(undefined)
        copyFilesFromTemplatesMock.mockResolvedValue(true)

        await initClaudeDirectory(projectPath)

        expect(fsMock.mkdirp).toHaveBeenCalledWith(path.join(projectPath, '.claude'))
        expect(copyFilesFromTemplatesMock).toHaveBeenCalledWith(projectPath, ['.claude/settings.json'], true)
    })

    it('should skip when settings.json already exists', async () => {
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
