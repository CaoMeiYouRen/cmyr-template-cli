import fs from 'fs-extra'
import path from 'path'
import ora from 'ora'
import download from 'download-git-repo'
import axios from 'axios'
import { exec, ExecOptions } from 'child_process'
import { PACKAGE_MANAGER } from './env'
import any from 'promise.any'
import { InitAnswers, IPackage } from './interfaces'
import colors from 'colors'
import ejs from 'ejs'
import { unescape } from 'lodash'
import { fix } from '@lint-md/core'

if (!Promise.any) {
    Promise.any = any
}

const GITHUB_API_URL = 'https://api.github.com'

const REMOTES = [
    'https://github.com',
    'https://hub.fastgit.org',
    'https://gitclone.com',
    'https://github.com.cnpmjs.org',
]

/**
 * 下载 git 库。repository例子如下：
GitHub - github:owner/name or simply owner/name
GitLab - gitlab:owner/name
Bitbucket - bitbucket:owner/name
 * @author CaoMeiYouRen
 * @date 2020-12-05
 * @export
 * @param {string} repository 源
 * @param {string} destination 要下载的路径
 * @param {*} [options]
 * @returns 成功返回 true
 */
export async function downloadGitRepo(repository: string, destination: string, options: any = {}) {
    const fastRepo = await getFastGitRepo(repository)
    const loading = ora(`正在下载模板 - ${repository}`)
    loading.start()
    return new Promise((resolve) => {
        download(fastRepo, destination, options, (err: any) => {
            if (err) {
                loading.fail('下载模板失败！')
                process.exit(1) // 下载模板失败直接退出
            }
            loading.succeed(`成功下载模板 - ${repository}`)
            resolve(true)
        })
    })
}

/**
 * 从 github 和镜像中选择最快的源
 * @param repository 源 owner/name, 例如 CaoMeiYouRen/rollup-template
 */
export async function getFastGitRepo(repository: string) {
    const loading = ora(`正在选择镜像源 - ${repository}`)
    loading.start()
    try {
        const fast = await Promise.any(REMOTES.map((remote) => {
            // const url = `${remote}/${repository}/.git`
            const url = `${remote}/${repository}/archive/refs/heads/master.zip`
            return axios({
                url,
                method: 'HEAD',
                timeout: 15 * 1000,
            })
        }))
        loading.succeed(`成功选择了镜像源 - ${fast.config.url}`)
        return `direct:${fast.config.url}`
    } catch (error) {
        console.error(error)
        loading.fail('选择镜像源失败！')
        process.exit(1) // 选择镜像源失败直接退出
    }
}

/**
 * 执行命令行
 *
 * @author CaoMeiYouRen
 * @date 2020-12-05
 * @export
 * @param {string} cmd
 * @returns
 */
export async function asyncExec(cmd: string, options?: ExecOptions) {
    return new Promise((resolve, reject) => {
        exec(cmd, options, (err, stdout: string, stderr: string) => {
            if (err) {
                return reject(err)
            }
            if (stderr) {
                return reject(stderr)
            }
            resolve(stdout)
        })
    })
}

export async function init(projectPath: string, answers: InitAnswers) {
    const { isOpenSource, isRemoveDependabot, gitRemoteUrl } = answers

    try {
        await asyncExec('git --version', {
            cwd: projectPath,
        })
        await asyncExec(`${PACKAGE_MANAGER} -v`, {
            cwd: projectPath,
        })
        await asyncExec('git init', {
            cwd: projectPath,
        })
        if (gitRemoteUrl) {
            await asyncExec(`git remote add origin ${gitRemoteUrl}`, {
                cwd: projectPath,
            })
            console.info(colors.green(`请在远程 Git 仓库初始化 ${gitRemoteUrl}`))
        }

        const dependabotPath = path.join(projectPath, '.github/dependabot.yml')
        const mergifyPath = path.join(projectPath, '.github/mergify.yml')
        if (!isOpenSource || isRemoveDependabot) { // 闭源 或者 直接指定移除
            if (await fs.pathExists(dependabotPath)) { // 如果存在 dependabot.yml
                await fs.remove(dependabotPath)
            }
            if (await fs.pathExists(mergifyPath)) { // 如果存在 mergify.yml
                await fs.remove(mergifyPath)
            }
        }

        await initProjectJson(projectPath, answers)

        if (isOpenSource) { // 只有开源的时候才初始化 REAMD
            await initReadme(projectPath, answers)
        }

        await asyncExec('git add .', {
            cwd: projectPath,
        })
        await asyncExec('git commit -m "chore: init"', {
            cwd: projectPath,
        })

        const loading = ora('正在安装依赖……').start()
        try {
            await asyncExec(`${PACKAGE_MANAGER} i`, {
                cwd: projectPath,
            })
            loading.succeed('依赖安装成功！')
        } catch (error) {
            loading.fail('依赖安装失败！')
        }

        await asyncExec('git add .', {
            cwd: projectPath,
        })

    } catch (error) {
        console.error(error)
    }
}

export async function getGitUserName() {
    const username = (await asyncExec('git config user.name')) as string
    return username.trim()
}

export async function sleep(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time))
}

/**
 * 初始化 package.json
 * @param projectPath
 * @param answers
 */
export async function initProjectJson(projectPath: string, answers: InitAnswers) {
    const loading = ora('正在初始化 package.json ……').start()
    try {

        const { name, author, description, isOpenSource, isPublishToNpm = false } = answers

        const repositoryUrl = `https://github.com/${author}/${name}`
        const homepage = `${repositoryUrl}#readme`
        const issuesUrl = `${repositoryUrl}/issues`
        const gitUrl = `git+${repositoryUrl}.git`

        const pkgPath = path.join(projectPath, 'package.json')
        const pkg: IPackage = await fs.readJSON(pkgPath)
        const pkgData: IPackage = {
            name,
            author,
            description,
            private: !isPublishToNpm,
            license: 'UNLICENSED',
            engines: {
                node: '>=12',
            },
        }
        let extData: IPackage = {}
        if (isOpenSource) {
            extData = {
                license: 'MIT',
                homepage,
                repository: {
                    type: 'git',
                    url: gitUrl,
                },
                bugs: {
                    url: issuesUrl,
                },
            }
        }
        const newPkg = Object.assign({}, pkg, pkgData, extData)
        await fs.writeFile(pkgPath, JSON.stringify(newPkg, null, 2))

        loading.succeed('package.json 初始化成功！')
    } catch (error) {
        console.error(error)
        loading.fail('package.json 初始化失败！')
    }
}

const cleanText = (text: string) => text.replace(/-/g, '--').replace(/_/g, '__')

/**
 * 初始化 README.md
 * @param projectPath
 * @param answers
 */
export async function initReadme(projectPath: string, answers: InitAnswers) {
    const loading = ora('正在初始化 README.md ……').start()
    try {
        const { name, author, description, isOpenSource, isPublishToNpm } = answers
        const packageManager = 'npm'
        const templatePath = path.join(__dirname, '../templates/README.md')
        const template = (await fs.readFile(templatePath, 'utf8')).toString()
        const newReadmePath = path.join(projectPath, 'README.md')

        const pkgPath = path.join(projectPath, 'package.json')
        const pkg: IPackage = await fs.readJSON(pkgPath)
        const engines = pkg?.engines || {}
        const license = pkg?.license
        const version = pkg?.version
        const installCommand = `${packageManager} install ${name}`
        const startCommand = pkg?.scripts?.start && `${packageManager} run start`
        const buildCommand = pkg?.scripts?.build && `${packageManager} run build`
        const testCommand = pkg?.scripts?.test && `${packageManager} run test`
        const lintCommand = pkg?.scripts?.lint && `${packageManager} run lint`

        const repositoryUrl = `https://github.com/${author}/${name}`
        const issuesUrl = `${repositoryUrl}/issues`
        const contributingUrl = `${repositoryUrl}/blob/master/CONTRIBUTING.md`
        const documentationUrl = `${repositoryUrl}#readme`
        const demoUrl = `${repositoryUrl}#readme`
        const homepage = documentationUrl
        const githubUsername = author
        const authorWebsite = isOpenSource ? await getAuthorWebsiteFromGithubAPI(githubUsername) : ''
        const licenseUrl = `${repositoryUrl}/blob/master/LICENSE`

        const projectInfos = {
            filename: templatePath,
            currentYear: new Date().getFullYear(),
            name,
            description,
            version,
            author,
            authorWebsite,
            homepage,
            demoUrl,
            repositoryUrl,
            issuesUrl,
            contributingUrl,
            githubUsername,
            authorName: author,
            authorGithubUsername: githubUsername,
            engines,
            licenseName: cleanText(license),
            licenseUrl,
            documentationUrl,
            isGithubRepos: true,
            installCommand,
            startCommand,
            usage: startCommand,
            buildCommand,
            testCommand,
            lintCommand,
            isJSProject: true,
            packageManager: 'npm',
            isProjectOnNpm: isPublishToNpm,
            isOpenSource,
            projectName: name,
            projectVersion: version,
            projectDocumentationUrl: documentationUrl,
            projectDescription: description,
            projectHomepage: homepage,
            projectDemoUrl: demoUrl,
            projectPrerequisites: Object.keys(engines).map((key) => ({
                name: key,
                value: engines[key],
            })),
        }

        const readmeContent = await ejs.render(
            template,
            projectInfos,
            {
                debug: false,
                async: true,
            },
        )

        if (await fs.pathExists(newReadmePath)) {
            await fs.remove(newReadmePath)
        }
        await fs.writeFile(newReadmePath, lintMd(unescape(readmeContent)))

        loading.succeed('README.md 初始化成功！')
    } catch (error) {
        loading.fail('README.md 初始化失败！')
        console.error(error)
    }
}

/**
 * 根据 github name 获取作者网站
 */
async function getAuthorWebsiteFromGithubAPI(githubUsername: string): Promise<string> {
    try {
        const userData = (await axios.get(`${GITHUB_API_URL}/users/${githubUsername}`)).data
        const authorWebsite = userData?.blog
        return authorWebsite || ''
    } catch (error) {
        console.error(error)
        return ''
    }
}

/**
 * 修复 markdown 格式
 * @param markdown
 * @returns
 */
function lintMd(markdown: string) {
    const rules = {
        'no-empty-code': 0,
        'no-trailing-punctuation': 0,
        'no-long-code': 0,
        'no-empty-code-lang': 0,
        'no-empty-inlinecode': 0,
    } as const
    const fixed = fix(markdown, rules)
    return fixed
}

