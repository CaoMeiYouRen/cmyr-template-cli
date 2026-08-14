import { describe, expect, it } from 'vitest'
import { buildAgentsMdL1Section, replaceAgentsTemplateTodos } from '@/pure/agents-md'
import type { ProjectInfo } from '@/types/interfaces'

const createMockProjectInfo = (overrides: Partial<ProjectInfo> = {}): ProjectInfo => ({
    name: 'test-project',
    description: 'Test description',
    author: 'test-author',
    license: 'MIT',
    keywords: ['test'],
    template: 'ts-template',
    jsModuleType: 'esm',
    isOpenSource: true,
    isInitRemoteRepo: true,
    gitRemoteUrl: '',
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
    aiTools: ['claude'],
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
    projectDescription: 'Test description',
    projectHomepage: '',
    projectDemoUrl: '',
    projectPrerequisites: [],
    discussionsUrl: '',
    pullRequestsUrl: '',
    templateMeta: {
        name: 'ts-template',
        language: 'typescript',
        runtime: 'nodejs',
        npm: true,
    },
    ...overrides,
})

describe('replaceAgentsTemplateTodos', () => {
    it('should replace project description TODO', () => {
        const content = '<!-- TODO: 一句话描述项目目的 -->'
        const result = replaceAgentsTemplateTodos(content, createMockProjectInfo({
            projectDescription: '我的酷项目',
        }))
        expect(result).toContain('我的酷项目')
        expect(result).not.toContain('TODO: 一句话描述项目目的')
    })

    it('should replace coverage TODO for vitest project', () => {
        const content = '覆盖率阈值 <!-- TODO: 指定最低覆盖率阈值，如 80% -->'
        const result = replaceAgentsTemplateTodos(content, createMockProjectInfo({ isInitTest: 'vitest' }))
        expect(result).toContain('覆盖率阈值 80%')
    })

    it('should replace coverage TODO for jest project', () => {
        const content = '覆盖率阈值 <!-- TODO: 指定最低覆盖率阈值，如 80% -->'
        const result = replaceAgentsTemplateTodos(content, createMockProjectInfo({ isInitTest: 'jest' }))
        expect(result).toContain('覆盖率阈值 80%')
    })

    it('should keep coverage TODO when no test framework', () => {
        const todo = '<!-- TODO: 指定最低覆盖率阈值，如 80% -->'
        const content = `覆盖率阈值 ${todo}`
        const result = replaceAgentsTemplateTodos(content, createMockProjectInfo({ isInitTest: 'none' }))
        expect(result).toContain(todo)
    })

    it('should keep other TODOs untouched', () => {
        const branchTodo = '<!-- TODO: 指定分支策略，如 Git Flow / GitHub Flow / Trunk Based -->'
        const result = replaceAgentsTemplateTodos(branchTodo, createMockProjectInfo())
        expect(result).toContain(branchTodo)
    })

    it('should not replace description when empty', () => {
        const todo = '<!-- TODO: 一句话描述项目目的 -->'
        const result = replaceAgentsTemplateTodos(todo, createMockProjectInfo({
            projectDescription: '',
            description: '',
        }))
        expect(result).toContain(todo)
    })
})

describe('buildAgentsMdL1Section', () => {
    it('should include tech stack and package manager', () => {
        const section = buildAgentsMdL1Section(createMockProjectInfo())
        expect(section).toContain('- 主要语言: typescript')
        expect(section).toContain('- 运行时: nodejs')
        expect(section).toContain('- 包管理器: npm')
    })

    it('should include Vue 3 framework line', () => {
        const info = createMockProjectInfo()
        info.templateMeta = { ...info.templateMeta, language: 'vue', vueVersion: 3 }
        const section = buildAgentsMdL1Section(info)
        expect(section).toContain('- 框架: Vue 3')
    })

    it('should include Vue 2 framework line', () => {
        const info = createMockProjectInfo()
        info.templateMeta = { ...info.templateMeta, language: 'vue', vueVersion: 2 }
        const section = buildAgentsMdL1Section(info)
        expect(section).toContain('- 框架: Vue 2')
    })

    it('should include available commands only', () => {
        const section = buildAgentsMdL1Section(createMockProjectInfo({
            devCommand: 'npm run dev',
            testCommand: 'npm test',
            buildCommand: 'npm run build',
            lintCommand: 'npm run lint',
            startCommand: 'npm start',
            commitCommand: 'npm run commit',
        }))
        expect(section).toContain('`npm run dev`')
        expect(section).toContain('`npm test`')
        expect(section).toContain('`npm run build`')
        expect(section).toContain('`npm run lint`')
        expect(section).toContain('`npm start`')
        expect(section).toContain('`npm run commit`')
    })

    it('should not include commands when absent', () => {
        const section = buildAgentsMdL1Section(createMockProjectInfo())
        expect(section).not.toContain('启动开发环境')
        expect(section).not.toContain('运行测试')
    })

    it('should include skill index', () => {
        const section = buildAgentsMdL1Section(createMockProjectInfo(), ['code-reviewer', 'security-guardian'])
        expect(section).toContain('- code-reviewer')
        expect(section).toContain('- security-guardian')
        expect(section).toContain('.github/skills/')
        expect(section).toContain('.ai/manifest.json')
    })

    it('should handle empty skill list', () => {
        const section = buildAgentsMdL1Section(createMockProjectInfo(), [])
        expect(section).toContain('未植入技能')
    })

    it('should handle missing templateMeta', () => {
        const info = createMockProjectInfo()
        info.templateMeta = undefined as any
        const section = buildAgentsMdL1Section(info)
        expect(section).toContain('- 主要语言: typescript')
        expect(section).toContain('- 运行时: nodejs')
    })
})
