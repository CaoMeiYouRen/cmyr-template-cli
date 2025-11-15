import path from 'path'
import ejs from 'ejs'
import ora from 'ora'
import fs from 'fs-extra'
import { unescape } from 'lodash'
import { ProjectInfo } from '@/types/interfaces'
import { lintMd } from '@/utils/string'
import { removeFiles, copyFilesFromTemplates } from '@/utils/files'
import { ejsRender } from '@/utils/ejs'

interface MarkdownTemplateInitOptions {
    projectPath: string
    projectInfos: ProjectInfo
    templateRelativePath: string
    destinationRelativePath?: string
    loadingText: string
    successText: string
    failText: string
}

async function renderMarkdownTemplate({
    projectPath,
    projectInfos,
    templateRelativePath,
    destinationRelativePath,
    loadingText,
    successText,
    failText,
}: MarkdownTemplateInitOptions) {
    const loading = ora(loadingText).start()
    try {
        const templatePath = path.join(__dirname, '../templates/', templateRelativePath)
        const template = (await fs.readFile(templatePath, 'utf8')).toString()
        const targetRelativePath = destinationRelativePath || templateRelativePath
        const targetPath = path.join(projectPath, targetRelativePath)
        const renderedContent = await ejs.render(
            template,
            projectInfos,
            {
                debug: false,
                async: true,
            },
        )
        await removeFiles(projectPath, [targetRelativePath])
        await fs.mkdirp(path.dirname(targetPath))
        await fs.writeFile(targetPath, lintMd(unescape(renderedContent)))
        loading.succeed(successText)
    } catch (error) {
        loading.fail(failText)
        console.error(error)
    }
}

export async function initReadme(projectPath: string, projectInfos: ProjectInfo) {
    await renderMarkdownTemplate({
        projectPath,
        projectInfos,
        templateRelativePath: 'README.md',
        loadingText: '正在初始化 README.md ……',
        successText: 'README.md 初始化成功！',
        failText: 'README.md 初始化失败！',
    })
}

export async function initContributing(projectPath: string, projectInfos: ProjectInfo) {
    await renderMarkdownTemplate({
        projectPath,
        projectInfos,
        templateRelativePath: 'CONTRIBUTING.md',
        loadingText: '正在初始化 贡献指南 ……',
        successText: '贡献指南 初始化成功！',
        failText: '贡献指南 初始化失败！',
    })
}

export async function initCodeOfConduct(projectPath: string, projectInfos: ProjectInfo) {
    await renderMarkdownTemplate({
        projectPath,
        projectInfos,
        templateRelativePath: 'CODE_OF_CONDUCT.md',
        loadingText: '正在初始化 贡献者公约 ……',
        successText: '贡献者公约 初始化成功！',
        failText: '贡献者公约 初始化失败！',
    })
}

export async function initSecurity(projectPath: string, projectInfos: ProjectInfo) {
    await renderMarkdownTemplate({
        projectPath,
        projectInfos,
        templateRelativePath: 'SECURITY.md',
        loadingText: '正在初始化 SECURITY.md ……',
        successText: 'SECURITY.md 初始化成功！',
        failText: 'SECURITY.md 初始化失败！',
    })
}

export async function initPullRequestTemplate(projectPath: string, projectInfos: ProjectInfo) {
    await renderMarkdownTemplate({
        projectPath,
        projectInfos,
        templateRelativePath: '.github/PULL_REQUEST_TEMPLATE.md',
        destinationRelativePath: '.github/PULL_REQUEST_TEMPLATE.md',
        loadingText: '正在初始化 PULL_REQUEST_TEMPLATE ……',
        successText: 'PULL_REQUEST_TEMPLATE 初始化成功！',
        failText: 'PULL_REQUEST_TEMPLATE 初始化失败！',
    })
}

export async function initLicense(projectPath: string, projectInfos: ProjectInfo) {
    const loading = ora('正在初始化 LICENSE ……').start()
    try {
        const { license } = projectInfos
        const templatePath = path.join(__dirname, '../templates/licenses/', license)
        if (!await fs.pathExists(templatePath)) {
            loading.fail('无效的 LICENSE Name')
            return
        }
        const template = (await fs.readFile(templatePath, 'utf8')).toString()
        const newPath = path.join(projectPath, 'LICENSE')

        const content = await ejs.render(
            template,
            projectInfos,
            {
                debug: false,
                async: true,
            },
        )

        await removeFiles(projectPath, ['LICENSE'])

        await fs.writeFile(newPath, unescape(content))

        loading.succeed('LICENSE 初始化成功！')
    } catch (error) {
        loading.fail('LICENSE 初始化失败！')
        console.error(error)
    }
}

export async function initIssueTemplate(projectPath: string) {
    const loading = ora('正在初始化 ISSUE_TEMPLATE ……').start()
    try {
        const files = ['.github/ISSUE_TEMPLATE/bug_report.yml', '.github/ISSUE_TEMPLATE/feature_request.yml', '.github/ISSUE_TEMPLATE/question.yml']
        const newPath = path.join(projectPath, '.github/ISSUE_TEMPLATE/')
        if (!await fs.pathExists(newPath)) {
            await fs.mkdirp(newPath)
        }
        await copyFilesFromTemplates(projectPath, files, false)
        loading.succeed('ISSUE_TEMPLATE 初始化成功！')
    } catch (error) {
        loading.fail('ISSUE_TEMPLATE 初始化失败！')
        console.error(error)
    }
}

export async function initFunding(projectPath: string, projectInfos: ProjectInfo) {
    const loading = ora('正在初始化 Funding 配置 ……').start()
    try {
        const { isEnableSupport } = projectInfos
        if (!isEnableSupport) {
            loading.succeed('未启用 Funding 支持，跳过 Funding 初始化')
            return
        }
        const templatePath = path.join(__dirname, '../templates/.github/FUNDING.yml')
        const newPath = path.join(projectPath, '.github/FUNDING.yml')
        await ejsRender(templatePath, { afdianUsername: projectInfos.afdianUsername }, newPath)
        loading.succeed('Funding 初始化成功！')
    } catch (error) {
        loading.fail('Funding 初始化失败！')
    }
}
