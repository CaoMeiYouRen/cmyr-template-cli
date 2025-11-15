import { merge, uniq } from 'lodash'
import { IPackage, InitAnswers, ProjectInfo, ProjectPrerequisite, TemplateCliConfig, TemplateMeta } from '@/types/interfaces'
import { kebabCase } from '@/utils/string'
import { cleanText } from '@/pure/common'

export interface BuildProjectInfoParams {
    answers: InitAnswers
    templateMeta?: TemplateMeta
    packageJson?: IPackage
    cliConfig: TemplateCliConfig
    nodeLtsVersion: string
    packageManager: string
    authorWebsite: string
    currentYear: number
}

export interface BuildPackageJsonPatchParams {
    packageInfo: ProjectInfo
    basePackageJson?: IPackage
}

interface RepositoryMeta {
    repositoryUrl: string
    gitUrl: string
    issuesUrl: string
    contributingUrl: string
    documentationUrl: string
    discussionsUrl: string
    pullRequestsUrl: string
    demoUrl: string
    homepage: string
    licenseUrl: string
}

export function buildProjectInfo(params: BuildProjectInfoParams): ProjectInfo {
    const {
        answers,
        templateMeta,
        packageJson,
        cliConfig,
        nodeLtsVersion,
        packageManager,
        authorWebsite,
        currentYear,
    } = params

    const {
        name,
        description,
        author,
        keywords = [],
        template,
        isOpenSource,
        isPublishToNpm,
        license = 'UNLICENSED',
        isPrivateScopePackage,
        scopeName,
        isInitDocker,
    } = answers

    const safeTemplateMeta = templateMeta ?? { name: template } as TemplateMeta
    const keywordsResult = deriveKeywords(safeTemplateMeta, keywords)
    const packageName = resolvePackageName(name, scopeName, isPrivateScopePackage)
    const minimumNodeVersion = Math.max(Number(nodeLtsVersion) - 4, 0)
    const engines = merge({}, packageJson?.engines, { node: `>=${minimumNodeVersion}` })
    const version = packageJson?.version || '0.1.0'
    const scripts = packageJson?.scripts || {}
    const installCommand = isPublishToNpm ? `${packageManager} install ${packageName}` : `${packageManager} install`
    const commandOrUndefined = (scriptName: string) => scripts[scriptName] ? `${packageManager} run ${scriptName}` : undefined

    const githubUsername = cliConfig?.GITHUB_USERNAME || author
    const giteeUsername = cliConfig?.GITEE_USERNAME || ''
    const weiboUsername = cliConfig?.WEIBO_USERNAME || ''
    const twitterUsername = cliConfig?.TWITTER_USERNAME || ''
    const afdianUsername = cliConfig?.AFDIAN_USERNAME || ''
    const patreonUsername = cliConfig?.PATREON_USERNAME || ''
    const npmUsername = cliConfig?.NPM_USERNAME || githubUsername
    const dockerUsername = cliConfig?.DOCKER_USERNAME || githubUsername?.toLowerCase()
    const dockerPassword = cliConfig?.DOCKER_PASSWORD || ''
    const contactEmail = cliConfig?.CONTACT_EMAIL || ''
    const npmToken = cliConfig?.NPM_TOKEN || ''

    const repositoryMeta = createRepositoryMeta(githubUsername, name)
    const mainFile = packageJson?.main

    return {
        ...answers,
        templateMeta: safeTemplateMeta,
        keywords: keywordsResult,
        currentYear,
        name,
        description,
        version,
        author,
        authorWebsite,
        homepage: repositoryMeta.homepage,
        demoUrl: repositoryMeta.demoUrl,
        gitUrl: repositoryMeta.gitUrl,
        repositoryUrl: repositoryMeta.repositoryUrl,
        issuesUrl: repositoryMeta.issuesUrl,
        contributingUrl: repositoryMeta.contributingUrl,
        githubUsername,
        authorName: author,
        authorGithubUsername: githubUsername,
        engines,
        license,
        licenseName: cleanText(license),
        licenseUrl: repositoryMeta.licenseUrl,
        documentationUrl: repositoryMeta.documentationUrl,
        isGithubRepos: Boolean(isOpenSource),
        installCommand,
        startCommand: commandOrUndefined('start'),
        usage: commandOrUndefined('start'),
        devCommand: commandOrUndefined('dev'),
        buildCommand: commandOrUndefined('build'),
        testCommand: commandOrUndefined('test'),
        lintCommand: commandOrUndefined('lint'),
        commitCommand: commandOrUndefined('commit'),
        isJSProject: ['nodejs', 'browser'].includes(safeTemplateMeta?.runtime),
        packageManager,
        isProjectOnNpm: Boolean(isPublishToNpm),
        isOpenSource,
        packageName,
        projectName: name,
        projectVersion: version,
        projectDocumentationUrl: repositoryMeta.documentationUrl,
        projectDescription: description,
        projectHomepage: repositoryMeta.homepage,
        projectDemoUrl: repositoryMeta.demoUrl,
        projectPrerequisites: buildProjectPrerequisites(engines),
        discussionsUrl: repositoryMeta.discussionsUrl,
        pullRequestsUrl: repositoryMeta.pullRequestsUrl,
        giteeUsername,
        afdianUsername,
        patreonUsername,
        weiboUsername,
        twitterUsername,
        npmUsername,
        dockerUsername,
        dockerPassword,
        mainFile,
        isInitDocker,
        contactEmail,
        npmToken,
    }
}

export function buildPackageJsonPatch(params: BuildPackageJsonPatchParams): IPackage {
    const { packageInfo, basePackageJson } = params
    const {
        packageName,
        author,
        description,
        keywords,
        isPublishToNpm,
        isOpenSource,
        license,
        homepage,
        gitUrl,
        issuesUrl,
        engines,
        jsModuleType,
    } = packageInfo

    const pkgData: IPackage = {
        name: packageName,
        author,
        description,
        keywords,
        private: !isPublishToNpm,
        license: 'UNLICENSED',
        engines,
    }

    const openSourceData: IPackage = {}
    if (isOpenSource) {
        Object.assign(openSourceData, {
            license,
            homepage,
            repository: {
                type: 'git',
                url: gitUrl,
            },
            bugs: {
                url: issuesUrl,
            },
        })
    }

    const publishConfig: IPackage = {}
    if (isPublishToNpm) {
        Object.assign(publishConfig, {
            publishConfig: {
                access: 'public',
            },
        })
    }

    let moduleType: 'module' | 'commonjs' | undefined
    if (jsModuleType === 'esm') {
        moduleType = 'module'
    } else if (jsModuleType === 'cjs') {
        moduleType = 'commonjs'
    }
    const moduleConfig = moduleType ? { type: moduleType } : {}

    const merged = merge({}, basePackageJson, pkgData, openSourceData, publishConfig, moduleConfig)
    merged.keywords = uniq(packageInfo.keywords)
    return merged
}

function deriveKeywords(templateMeta: TemplateMeta, baseKeywords: string[]): string[] {
    const keywords = [...baseKeywords]
    if (templateMeta?.docker) {
        keywords.push('docker')
    }
    if (templateMeta?.language) {
        keywords.push(templateMeta.language)
    }
    if (templateMeta?.vueVersion === 3) {
        keywords.push('vue3')
    }
    if (templateMeta?.tags?.length) {
        keywords.push(...templateMeta.tags)
    }
    return uniq(keywords.map((keyword) => kebabCase(keyword)))
}

function resolvePackageName(projectName: string, scopeName: string, isPrivateScopePackage: boolean) {
    if (isPrivateScopePackage && scopeName) {
        return `@${scopeName}/${projectName}`
    }
    return projectName
}

function createRepositoryMeta(owner: string, projectName: string): RepositoryMeta {
    const repositoryUrl = `https://github.com/${owner}/${projectName}`
    const gitUrl = `git+${repositoryUrl}.git`
    const issuesUrl = `${repositoryUrl}/issues`
    const contributingUrl = `${repositoryUrl}/blob/master/CONTRIBUTING.md`
    const documentationUrl = `${repositoryUrl}#readme`
    const demoUrl = documentationUrl
    const homepage = documentationUrl
    const licenseUrl = `${repositoryUrl}/blob/master/LICENSE`
    const discussionsUrl = `${repositoryUrl}/discussions`
    const pullRequestsUrl = `${repositoryUrl}/pulls`
    return {
        repositoryUrl,
        gitUrl,
        issuesUrl,
        contributingUrl,
        documentationUrl,
        discussionsUrl,
        pullRequestsUrl,
        demoUrl,
        homepage,
        licenseUrl,
    }
}

function buildProjectPrerequisites(engines: Record<string, string>): ProjectPrerequisite[] {
    return Object.keys(engines || {}).map((key) => ({
        name: key,
        value: engines[key],
    }))
}
