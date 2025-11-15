import { describe, expect, it } from 'vitest'
import { buildPackageJsonPatch, buildProjectInfo } from './project-info'
import { IPackage, InitAnswers, TemplateCliConfig, TemplateMeta } from '@/types/interfaces'

const baseAnswers: InitAnswers = {
    name: 'sample-app',
    description: 'demo project',
    author: 'cmyr',
    license: 'MIT',
    keywords: ['demo'],
    template: 'ts-template',
    jsModuleType: 'esm',
    isOpenSource: true,
    isInitRemoteRepo: true,
    gitRemoteUrl: 'git@github.com:cmyr/sample-app.git',
    isPublishToNpm: true,
    isRemoveDependabot: false,
    isInitReadme: true,
    isInitContributing: true,
    isInitHusky: true,
    isInitSemanticRelease: true,
    isInitTest: 'vitest',
    isEnableSupport: true,
    isEnableStarHistory: true,
    isRemoveYarn: false,
    isInitDocker: true,
    commonDependencies: [],
    isPrivateScopePackage: false,
    scopeName: '',
}

const templateMeta: TemplateMeta = {
    name: 'ts-template',
    language: 'typescript',
    runtime: 'nodejs',
    docker: true,
    npm: true,
}

const cliConfig: TemplateCliConfig = {
    GITHUB_TOKEN: '',
    GITEE_TOKEN: '',
    GITHUB_USERNAME: 'cmyr-dev',
    GITEE_USERNAME: 'cmyr-dev',
    AFDIAN_USERNAME: '',
    PATREON_USERNAME: '',
    WEIBO_USERNAME: '',
    TWITTER_USERNAME: '',
    NPM_USERNAME: 'cmyr-dev',
    DOCKER_USERNAME: '',
    DOCKER_PASSWORD: '',
    CONTACT_EMAIL: '',
    NPM_TOKEN: '',
}

const packageJson: IPackage = {
    scripts: {
        start: 'node dist/index.js',
        build: 'tsup',
    },
    engines: {},
    version: '0.0.1',
    main: 'dist/index.js',
}

describe('buildProjectInfo', () => {
    it('creates a deterministic project info payload', () => {
        const info = buildProjectInfo({
            answers: baseAnswers,
            templateMeta,
            packageJson,
            cliConfig,
            nodeLtsVersion: '20',
            packageManager: 'npm',
            authorWebsite: 'https://blog.cmyr.dev',
            currentYear: 2025,
        })

        expect(info.packageName).toBe('sample-app')
        expect(info.githubUsername).toBe('cmyr-dev')
        expect(info.installCommand).toBe('npm install sample-app')
        expect(info.keywords).toEqual(expect.arrayContaining(['demo', 'docker', 'typescript']))
        expect(info.projectPrerequisites).toEqual([{ name: 'node', value: '>=16' }])
        expect(info.projectDocumentationUrl).toContain('https://github.com/cmyr-dev/sample-app')
    })

    it('handles closed-source scoped packages without template meta', () => {
        const answers: InitAnswers = {
            ...baseAnswers,
            license: 'MIT-LICENSE_v2',
            isOpenSource: false,
            isPublishToNpm: false,
            isPrivateScopePackage: true,
            scopeName: 'acme',
            keywords: ['FooBar', 'foobar'],
        }
        const emptyCliConfig: TemplateCliConfig = {
            GITHUB_TOKEN: '',
            GITEE_TOKEN: '',
            GITHUB_USERNAME: '',
            GITEE_USERNAME: '',
            AFDIAN_USERNAME: '',
            PATREON_USERNAME: '',
            WEIBO_USERNAME: '',
            TWITTER_USERNAME: '',
            NPM_USERNAME: '',
            DOCKER_USERNAME: '',
            DOCKER_PASSWORD: '',
            CONTACT_EMAIL: '',
            NPM_TOKEN: '',
        }

        const info = buildProjectInfo({
            answers,
            templateMeta: undefined,
            packageJson: undefined,
            cliConfig: emptyCliConfig,
            nodeLtsVersion: '18',
            packageManager: 'npm',
            authorWebsite: '',
            currentYear: 2025,
        })

        expect(info.packageName).toBe('@acme/sample-app')
        expect(info.installCommand).toBe('npm install')
        expect(info.isGithubRepos).toBe(false)
        expect(info.templateMeta.name).toBe(answers.template)
        expect(info.projectPrerequisites).toEqual([{ name: 'node', value: '>=14' }])
        expect(info.startCommand).toBeUndefined()
        expect(info.licenseName).toBe('MIT--LICENSE__v2')
        expect(info.dockerUsername).toBe(answers.author.toLowerCase())
    })
})

describe('buildPackageJsonPatch', () => {
    it('produces a merged package.json payload without side effects', () => {
        const info = buildProjectInfo({
            answers: baseAnswers,
            templateMeta,
            packageJson,
            cliConfig,
            nodeLtsVersion: '20',
            packageManager: 'npm',
            authorWebsite: 'https://blog.cmyr.dev',
            currentYear: 2025,
        })

        const patch = buildPackageJsonPatch({
            packageInfo: info,
            basePackageJson: packageJson,
        })

        expect(patch.name).toBe('sample-app')
        expect(patch.private).toBe(false)
        expect(patch.repository?.url).toBe(info.gitUrl)
        expect(patch.publishConfig?.access).toBe('public')
        expect(patch.type).toBe('module')
        expect(patch.keywords).toEqual(info.keywords)
    })

    it('handles private cjs packages and deduplicates keywords', () => {
        const answers: InitAnswers = {
            ...baseAnswers,
            keywords: ['foo', 'Foo'],
            isOpenSource: false,
            isPublishToNpm: false,
            jsModuleType: 'cjs',
            isPrivateScopePackage: true,
            scopeName: 'team',
        }

        const info = buildProjectInfo({
            answers,
            templateMeta,
            packageJson,
            cliConfig,
            nodeLtsVersion: '20',
            packageManager: 'npm',
            authorWebsite: '',
            currentYear: 2025,
        })

        const legacyPackageJson: IPackage = {
            type: 'module',
            scripts: { lint: 'eslint .' },
        }

        const patch = buildPackageJsonPatch({
            packageInfo: info,
            basePackageJson: legacyPackageJson,
        })

        expect(patch.private).toBe(true)
        expect(patch.repository).toBeUndefined()
        expect(patch.publishConfig).toBeUndefined()
        expect(patch.type).toBe('commonjs')
        // keywords should include 'foo' once (deduplicated) and may include other template-derived keywords
        expect(patch.keywords).toEqual(expect.arrayContaining(['foo']))
        const fooCount = patch.keywords.filter((k) => k.toLowerCase() === 'foo').length
        expect(fooCount).toBe(1)
    })
})
