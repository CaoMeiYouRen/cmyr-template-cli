import fs from 'fs-extra'
import path from 'path'
import ora from 'ora'
import download from 'download-git-repo'
import axios from 'axios'
import { exec, ExecOptions } from 'child_process'
import { PACKAGE_MANAGER } from './env'
import { InitAnswers, IPackage, NodeIndexJson } from './interfaces'
import colors from 'colors'
import ejs from 'ejs'
import { unescape } from 'lodash'
import { fix } from '@lint-md/core'
import JSON5 from 'json5'

axios.defaults.timeout = 10 * 1000

if (!Promise.any) {
    import('promise.any').then((any) => {
        Promise.any = any.default
    })
}

const GITHUB_API_URL = 'https://api.github.com'
const GITEE_API_URL = 'https://gitee.com/api/v5'

const NODEJS_URLS = [
    'https://nodejs.org/zh-cn/download/',
    // 'http://nodejs.cn/download/',
]

const NODE_INDEX_URL = 'https://cdn.npmmirror.com/binaries/node/index.json'

const REMOTES = [
    'https://github.com',
    'https://hub.fastgit.xyz',
    'https://download.fastgit.org',
    'https://ghproxy.com/https://github.com',
    'https://gh.ddlc.top/https://github.com',
    'https://gh.flyinbug.top/gh/https://github.com',
    'https://gh.con.sh/https://github.com',
    'https://cors.isteed.cc/github.com',
    'https://ghps.cc/https://github.com',
    'https://download.nuaa.cf',
    'https://kgithub.com',
    'https://github.moeyy.xyz/https://github.com',
    'https://hub.njuu.cf',
]

// 常见依赖 map
export const COMMON_DEPENDENCIES = {
    devDependencies: {
        '@types/fs-extra': '^9.0.4',
        '@types/lodash': '^4.14.165',
        '@types/md5': '^2.3.1',
    },
    dependencies: {
        axios: '^1.0.0',
        'cmyr-error-collection': '^1.5.0',
        dayjs: '^1.9.6',
        'fs-extra': '^10.0.0',
        'isomorphic-unfetch': '^3.1.0',
        lodash: '^4.17.20',
        md5: '^2.3.0',
        'push-all-in-one': '^2.2.0',
    },
}

export const VUE_DEPENDENCIES = {
    devDependencies: {},
    dependencies: {
        'vite-plugin-fast-cdn-import': '^1.1.0',
        'element-ui': '^2.15.7',
        vuetify: '^2.6.3',
    },
}

type TokenType = 'GITHUB_TOKEN' | 'GITEE_TOKEN'

type GiteeRepo = {
    access_token: string
    name: string
    description: string
    private: boolean
}
/**
 * 创建 Gitee 项目
 *
 * @author CaoMeiYouRen
 * @date 2022-09-14
 * @param data
 */
async function createGiteeRepo(data: GiteeRepo) {
    try {
        const formData = new URLSearchParams()
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, String(value))
        })
        return await axios({
            url: '/user/repos',
            baseURL: GITEE_API_URL,
            method: 'POST',
            data: formData.toString(),
        })
    } catch (error) {
        console.error(error)
        return null
    }
}

type GithubRepo = {
    name: string
    description: string
    private: boolean
}

/**
 * 创建 Github 项目
 *
 * @author CaoMeiYouRen
 * @date 2022-09-15
 * @param data
 */
async function createGithubRepo(authToken: string, data: GithubRepo) {
    try {
        return await axios({
            url: '/user/repos',
            baseURL: GITHUB_API_URL,
            method: 'POST',
            headers: {
                Authorization: `Bearer ${authToken}`,
                Accept: 'application/vnd.github+json',
            },
            data,
        })
    } catch (error) {
        console.error(error)
        return null
    }
}

/**
 * 载入 token，优先寻找当前目录下的 .ctrc 文件，其次寻找 HOME 路径下的 .ctrc。
 * github 和 gitee 的 token 各自独立寻找，不为空即为找到
 * @author CaoMeiYouRen
 * @date 2022-09-14
 */
async function loadToken(type: TokenType): Promise<string> {
    const paths = [process.cwd(), process.env.HOME].map((e) => path.join(e, '.ctrc'))
    if (!['GITHUB_TOKEN', 'GITEE_TOKEN'].includes(type)) {
        throw new Error(`无效的 token 类型：${type}`)
    }
    const CONFIG_KEY = type
    for await (const p of paths) {
        try {
            if (await fs.pathExists(p)) {
                const config = await fs.readJSON(p)
                if (config?.[CONFIG_KEY]) {
                    return config[CONFIG_KEY]
                }
            }
        } catch (error) {
            console.error(error)
        }
    }
    return ''
}

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
        const fastUrl = await getFastUrl(REMOTES.map((remote) => `${remote}/${repository}/archive/refs/heads/master.zip`))
        loading.succeed(`成功选择了镜像源 - ${fastUrl}`)
        return `direct:${fastUrl}`
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
        const ls = exec(cmd, options, (err, stdout: string, stderr: string) => {
            if (err) {
                return reject(err)
            }
            if (stderr) {
                return reject(stderr)
            }
            resolve(stdout)
        })
        ls.stdout.on('data', (data) => {
            console.log(data)
        })
        ls.stderr.on('data', (data) => {
            console.log(colors.red(data))
        })
    })
}

export async function initProject(answers: InitAnswers) {
    const { name, template } = answers
    const projectPath = path.join(process.cwd(), name)
    await downloadGitRepo(`CaoMeiYouRen/${template}`, projectPath)
    await init(projectPath, answers)
    return '- 下载项目模板成功！'
}

async function init(projectPath: string, answers: InitAnswers) {
    const { isOpenSource, gitRemoteUrl, isInitRemoteRepo, isInitReadme, isInitContributing, isInitHusky, isInitSemanticRelease, isInitDocker } = answers
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

        const newPkg = await initProjectJson(projectPath, answers)

        await initConfig(projectPath)
        await initCommitizen(projectPath)
        if (isInitDocker) {
            await initDocker(projectPath)
        }

        if (isOpenSource) { // 只有开源的时候才初始化 REAMD
            const info = await getProjectInfo(projectPath, answers)
            if (info) {
                if (isInitReadme) {
                    await initReadme(projectPath, info)
                }
                if (isInitContributing) {
                    await initContributing(projectPath, info)
                }
                await initLicense(projectPath, info)
            }
            await initGithubWorkflows(projectPath, answers)
        }
        if (isInitRemoteRepo && gitRemoteUrl) {
            await initRemoteGitRepo(projectPath, answers)
        }

        if (isInitSemanticRelease) {
            await initSemanticRelease(projectPath)
        }
        if (isInitHusky) {
            await initHusky(projectPath)
        }

        await initCommonDependencies(projectPath, answers)

        await initTsconfig(projectPath)

        await sortProjectJson(projectPath)

        await initDependabot(projectPath, answers)

        await initYarn(projectPath, answers)

        await asyncExec('git add .', {
            cwd: projectPath,
        })

        await installNpmPackages(projectPath)

        await asyncExec('git add .', {
            cwd: projectPath,
        })

        if (newPkg?.scripts?.lint) {
            await asyncExec(`${PACKAGE_MANAGER} run lint`, {
                cwd: projectPath,
            })
        }

        await asyncExec('git add .', {
            cwd: projectPath,
        })

        await asyncExec('git commit -m "chore: init" --no-gpg', {
            cwd: projectPath,
        })

    } catch (error) {
        console.error(error)
    }
}

export async function getGitUserName() {
    const username = (await asyncExec('git config user.name')) as string || ''
    return username.trim()
}

export async function sleep(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time))
}

async function initRemoteGitRepo(projectPath: string, answers: InitAnswers) {
    const loading = ora('正在初始化远程 Git 仓库……').start()
    try {
        const { name, description, gitRemoteUrl, isOpenSource } = answers

        await asyncExec(`git remote add origin ${gitRemoteUrl}`, {
            cwd: projectPath,
        })

        // 判断 remote 类型
        let type = ''
        if (/github\.com/.test(gitRemoteUrl)) {
            type = 'github'
        } else if (/gitee\.com/.test(gitRemoteUrl)) {
            type = 'gitee'
        }

        switch (type) {
            case 'github': {
                const authToken = await loadToken('GITHUB_TOKEN')
                if (!authToken) {
                    console.error(colors.red(`未找到 ${type} token ！跳过初始化！`))
                    break
                }
                const resp = await createGithubRepo(authToken, {
                    name,
                    description,
                    private: !isOpenSource,
                })
                if (resp?.status >= 200) {
                    loading.succeed('远程 Git 仓库初始化成功！')
                    console.info(colors.green(`远程 Git 仓库地址 ${resp.data?.html_url}`))
                } else {
                    loading.fail('远程 Git 仓库初始化失败！')
                }
                return
            }
            case 'gitee': {
                const access_token = await loadToken('GITEE_TOKEN')
                if (!access_token) {
                    console.error(colors.red(`未找到 ${type} token ！跳过初始化！`))
                    break
                }
                const resp = await createGiteeRepo({
                    access_token,
                    name,
                    description,
                    private: true,
                })
                if (resp?.status >= 200) {
                    loading.succeed('远程 Git 仓库初始化成功！')
                    console.info(colors.green(`远程 Git 仓库地址 ${resp.data?.html_url}`))
                } else {
                    loading.fail('远程 Git 仓库初始化失败！')
                }
                return
            }
            default: {
                break
            }
        }
        loading.stop()
        console.info(colors.green(`请在远程 Git 仓库初始化 ${gitRemoteUrl}`))
    } catch (error) {
        loading.fail('远程 Git 仓库初始化失败！')
        console.error(error)
    }
}

async function installNpmPackages(projectPath: string) {
    const loading = ora('正在安装依赖……').start()
    try {
        const files = ['.npmrc']
        await copyFilesFromTemplates(projectPath, files)
        await asyncExec(`${PACKAGE_MANAGER} i`, {
            cwd: projectPath,
        })
        loading.succeed('依赖安装成功！')
    } catch (error) {
        console.error(error)
        loading.fail('依赖安装失败！')
        // process.exit(1)
    }
}

async function initCommonDependencies(projectPath: string, answers: InitAnswers) {
    const loading = ora('正在初始化 常见依赖……').start()
    try {
        const { commonDependencies = [] } = answers
        const pkg: IPackage = await getProjectJson(projectPath)
        const dependencies: Record<string, string> = Object.fromEntries(
            await Promise.all(
                commonDependencies.map(async (name) => [
                    name,
                    `^${await getNpmPackageVersion(name)}`,
                ]),
            ),
        )
        const devDependencies: Record<string, string> = Object.fromEntries(
            await Promise.all(
                commonDependencies
                    .map((name) => `@types/${name}`)
                    .filter((name) => COMMON_DEPENDENCIES?.devDependencies?.[name] || VUE_DEPENDENCIES?.devDependencies?.[name])
                    .map(async (name) => [
                        name,
                        `^${await getNpmPackageVersion(name)}`,
                    ]),
            ),
        )
        const newPkg: IPackage = {
            dependencies: {
                ...dependencies,
                ...pkg?.dependencies,
            },
            devDependencies: {
                ...devDependencies,
                ...pkg?.devDependencies,
            },
        }
        await saveProjectJson(projectPath, newPkg)
        loading.succeed('常见依赖初始化成功！')
    } catch (error) {
        console.error(error)
        loading.fail('常见依赖安装失败！')
    }
}

async function initDependabot(projectPath: string, answers: InitAnswers) {
    try {
        const { isOpenSource, isRemoveDependabot } = answers
        const files = ['.github/dependabot.yml', '.github/mergify.yml']
        if (!isOpenSource || isRemoveDependabot) { // 闭源 或者 直接指定移除
            await removeFiles(projectPath, files) // 如果存在 dependabot.yml/mergify.yml
        }
    } catch (error) {
        console.error(error)
    }
}

async function initYarn(projectPath: string, answers: InitAnswers) {
    try {
        const { isRemoveYarn } = answers
        const files = ['yarn.lock']// 如果存在 yarn.lock
        if (isRemoveYarn) {
            await removeFiles(projectPath, files)
        }
    } catch (error) {
        console.error(error)
    }
}

async function initTsconfig(projectPath: string) {
    try {
        const tsconfigPath = path.join(projectPath, 'tsconfig.json')

        if (await fs.pathExists(tsconfigPath)) { // 如果存在 tsconfig.json
            const tsconfigStr = await fs.readFile(tsconfigPath, 'utf8')
            const tsconfig = JSON5.parse(tsconfigStr)
            if (tsconfig?.compilerOptions?.importHelpers) {
                const pkg: IPackage = await getProjectJson(projectPath)
                const pkgData: IPackage = {
                    dependencies: {
                        tslib: `^${await getNpmPackageVersion('tslib')}`,
                        ...pkg.dependencies,
                    },
                }
                const newPkg = Object.assign({}, pkg, pkgData)
                await saveProjectJson(projectPath, newPkg)
            }
        }
    } catch (error) {
        console.error(error)
    }
}

/**
 * 初始化 package.json
 * @param projectPath
 * @param answers
 */
async function initProjectJson(projectPath: string, answers: InitAnswers) {
    const loading = ora('正在初始化 package.json ……').start()
    try {

        const { name, author, description, keywords = [], isOpenSource, isPublishToNpm = false } = answers

        const repositoryUrl = `https://github.com/${author}/${name}`
        const homepage = `${repositoryUrl}#readme`
        const issuesUrl = `${repositoryUrl}/issues`
        const gitUrl = `git+${repositoryUrl}.git`
        const nodeVersion = await getLtsNodeVersion() || '18'
        const node = Number(nodeVersion) - 4 // lts 减 4 为最旧支持的版本

        const pkg: IPackage = await getProjectJson(projectPath)
        const pkgData: IPackage = {
            name,
            author,
            description,
            keywords,
            private: !isPublishToNpm,
            license: 'UNLICENSED',
            engines: {
                ...pkg?.engines || {},
                node: `>=${node}`,
            },
            devDependencies: {
                ...pkg?.devDependencies,
                'eslint-config-cmyr': `^${await getNpmPackageVersion('eslint-config-cmyr')}`,
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
                changelog: {
                    language: 'zh',
                },
            }
        }
        if (isPublishToNpm) {
            extData.publishConfig = {
                access: 'public',
            }
        }
        const newPkg = Object.assign({}, pkg, pkgData, extData)
        await saveProjectJson(projectPath, newPkg)

        loading.succeed('package.json 初始化成功！')
        return newPkg
    } catch (error) {
        console.error(error)
        loading.fail('package.json 初始化失败！')
    }
}

const cleanText = (text: string) => text.replace(/-/g, '--').replace(/_/g, '__')

async function getProjectInfo(projectPath: string, answers: InitAnswers) {
    const loading = ora('正在获取项目信息 ……').start()
    try {
        const { name, author, description, isOpenSource, isPublishToNpm } = answers
        const packageManager = 'npm'

        const pkg: IPackage = await getProjectJson(projectPath)
        const engines = pkg?.engines || {}
        const license = pkg?.license
        const version = pkg?.version
        const installCommand = isPublishToNpm ? `${packageManager} install ${name}` : `${packageManager} install`
        const startCommand = pkg?.scripts?.start && `${packageManager} run start`
        const devCommand = pkg?.scripts?.dev && `${packageManager} run dev`
        const buildCommand = pkg?.scripts?.build && `${packageManager} run build`
        const testCommand = pkg?.scripts?.test && `${packageManager} run test`
        const lintCommand = pkg?.scripts?.lint && `${packageManager} run lint`
        const commitCommand = pkg?.scripts?.commit && `${packageManager} run commit`

        const repositoryUrl = `https://github.com/${author}/${name}`
        const issuesUrl = `${repositoryUrl}/issues`
        const contributingUrl = `${repositoryUrl}/blob/master/CONTRIBUTING.md`
        const documentationUrl = `${repositoryUrl}#readme`
        const demoUrl = `${repositoryUrl}#readme`
        const homepage = documentationUrl
        const githubUsername = author
        const authorWebsite = await getAuthorWebsiteFromGithubAPI(githubUsername)
        const licenseUrl = `${repositoryUrl}/blob/master/LICENSE`
        const discussionsUrl = `${repositoryUrl}/discussions`
        const pullRequestsUrl = `${repositoryUrl}/pulls`

        const projectInfos = {
            ...answers,
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
            license,
            licenseName: cleanText(license),
            licenseUrl,
            documentationUrl,
            isGithubRepos: true,
            installCommand,
            startCommand,
            usage: startCommand,
            devCommand,
            buildCommand,
            testCommand,
            lintCommand,
            commitCommand,
            isJSProject: true,
            packageManager,
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
            discussionsUrl,
            pullRequestsUrl,
        }
        loading.succeed('项目信息 初始化成功！')
        return projectInfos

    } catch (error) {
        loading.fail('项目信息 初始化失败！')
        console.error(error)
        return null
    }
}

/**
 * 初始化 README.md
 * @param projectPath
 * @param projectInfos
 */
async function initReadme(projectPath: string, projectInfos: any) {
    const loading = ora('正在初始化 README.md ……').start()
    try {

        const templatePath = path.join(__dirname, '../templates/README.md')
        const template = (await fs.readFile(templatePath, 'utf8')).toString()
        const newReadmePath = path.join(projectPath, 'README.md')

        const readmeContent = await ejs.render(
            template,
            projectInfos,
            {
                debug: false,
                async: true,
            },
        )

        await removeFiles(projectPath, ['README.md'])
        await fs.writeFile(newReadmePath, lintMd(unescape(readmeContent)))

        loading.succeed('README.md 初始化成功！')
    } catch (error) {
        loading.fail('README.md 初始化失败！')
        console.error(error)
    }
}

/**
 * 初始化 贡献指南(CONTRIBUTING.md)
 * @param projectPath
 * @param projectInfos
 */
async function initContributing(projectPath: string, projectInfos: any) {
    const loading = ora('正在初始化 贡献指南 ……').start()
    try {

        const templatePath = path.join(__dirname, '../templates/CONTRIBUTING.md')
        const template = (await fs.readFile(templatePath, 'utf8')).toString()
        const newContributingPath = path.join(projectPath, 'CONTRIBUTING.md')

        const content = await ejs.render(
            template,
            projectInfos,
            {
                debug: false,
                async: true,
            },
        )

        await removeFiles(projectPath, ['CONTRIBUTING.md'])

        await fs.writeFile(newContributingPath, lintMd(unescape(content)))

        loading.succeed('贡献指南 初始化成功！')
    } catch (error) {
        loading.fail('贡献指南 初始化失败！')
        console.error(error)
    }
}

/**
 * 初始化 LICENSE
 * @param projectPath
 * @param projectInfos
 */
async function initLicense(projectPath: string, projectInfos: any) {
    const loading = ora('正在初始化 LICENSE ……').start()
    try {
        let templatePath = ''
        if (projectInfos.licenseName === 'MIT') {
            templatePath = path.join(__dirname, '../templates/licenses/MIT')
        }
        if (!templatePath) {
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

/**
 * 初始化 .editorconfig、commitlint.config.js 等配置
 * @param projectPath
 */
async function initConfig(projectPath: string) {
    try {
        const files = ['.editorconfig', 'commitlint.config.js']
        await copyFilesFromTemplates(projectPath, files)
    } catch (error) {
        console.error(error)
    }
}

/**
 * 初始化 Github Workflows
 * @param projectPath
 * @param answers
 */
async function initGithubWorkflows(projectPath: string, answers: InitAnswers) {
    const loading = ora('正在初始化 Github Workflows ……').start()
    try {
        const { isInitSemanticRelease } = answers
        const files = ['.github/workflows/test.yml']
        const dir = path.join(projectPath, '.github/workflows')
        if (!await fs.pathExists(dir)) {
            await fs.mkdirp(dir)
        }
        const releaseYml = '.github/workflows/release.yml'
        if (isInitSemanticRelease) { // 如果初始化 semantic-release 则说明需要自动 release
            files.push(releaseYml)
        } else { // 否则就移除 release.yml
            await removeFiles(projectPath, [releaseYml])
        }

        await removeFiles(projectPath, ['.github/workflows/auto-merge.yml', '.github/release.yml'])

        await copyFilesFromTemplates(projectPath, files)

        loading.succeed('Github Workflows 初始化成功！')
    } catch (error) {
        loading.fail('Github Workflows 初始化失败！')
        console.error(error)
    }
}

async function initSemanticRelease(projectPath: string) {
    const loading = ora('正在初始化 semantic-release ……').start()
    try {
        const files = ['.releaserc.js']
        await copyFilesFromTemplates(projectPath, files)

        const pkg: IPackage = await getProjectJson(projectPath)

        const devDependencies = {
            '@semantic-release/changelog': '^6.0.1',
            '@semantic-release/git': '^10.0.1',
            'semantic-release': '^18.0.1',
        }

        const pkgData: IPackage = {
            scripts: {
                release: 'semantic-release',
                ...pkg?.scripts,
            },
            devDependencies: {
                ...devDependencies,
                ...pkg?.devDependencies,
                'conventional-changelog-cmyr-config': `^${await getNpmPackageVersion('conventional-changelog-cmyr-config')}`,
            },
        }

        await saveProjectJson(projectPath, pkgData)

        loading.succeed('semantic-release 初始化成功！')
    } catch (error) {
        loading.fail('semantic-release 初始化失败！')
        console.error(error)
    }
}

/**
     * 初始化 husky
     * @param projectPath
     * @param projectInfos
     */
async function initHusky(projectPath: string) {
    const loading = ora('正在初始化 husky ……').start()
    try {
        const files = ['.husky/commit-msg', '.husky/pre-commit']
        const dir = path.join(projectPath, '.husky')
        if (!await fs.pathExists(dir)) {
            await fs.mkdirp(dir)
        }
        await copyFilesFromTemplates(projectPath, files)

        const extnames = ['js', 'ts']
        const pkg: IPackage = await getProjectJson(projectPath)
        if (pkg?.dependencies?.vue) {
            extnames.push('vue')
        }
        if (pkg?.dependencies?.react) {
            extnames.push('jsx', 'tsx')
        }
        const keyname = `*.{${extnames.join(',')}}`
        const devDependencies = {
            '@commitlint/cli': '^15.0.0',
            '@commitlint/config-conventional': '^15.0.0',
            husky: '^8.0.1',
            'lint-staged': '^12.1.2',
        }
        const pkgData: IPackage = {
            scripts: {
                ...pkg?.scripts,
                prepare: 'husky install',
            },
            devDependencies: {
                ...devDependencies,
                ...pkg?.devDependencies,
            },
            husky: undefined,
            'lint-staged': {
                [keyname]: [
                    'npm run lint',
                    'git add',
                ],
            },
        }

        await saveProjectJson(projectPath, pkgData)

        loading.succeed('husky 初始化成功！')
    } catch (error) {
        loading.fail('husky 初始化失败！')
        console.error(error)
    }
}
/**
 * 初始化 Commitizen 相关配置
 * @param projectPath
 */
async function initCommitizen(projectPath: string) {
    const loading = ora('正在初始化 commitizen ……').start()
    try {
        const pkg: IPackage = await getProjectJson(projectPath)
        const devDependencies = {
            commitizen: '^4.2.3',
            'cz-conventional-changelog-cmyr': `^${await getNpmPackageVersion('cz-conventional-changelog-cmyr')}`,
        }
        const pkgData: IPackage = {
            scripts: {
                ...pkg?.scripts,
                commit: 'cz',
            },
            devDependencies: {
                ...devDependencies,
                ...pkg?.devDependencies,
            },
            config: {
                ...pkg?.config,
                commitizen: {
                    path: './node_modules/cz-conventional-changelog-cmyr',
                },
            },
        }
        await saveProjectJson(projectPath, pkgData)
        loading.succeed('commitizen 初始化成功！')
    } catch (error) {
        console.error(error)
        loading.fail('commitizen 初始化失败！')
    }
}

async function initDocker(projectPath: string) {
    const loading = ora('正在初始化 Docker ……').start()
    try {
        const files = ['.dockerignore', 'docker-compose.yml', 'Dockerfile']
        await copyFilesFromTemplates(projectPath, files)
        loading.succeed('Docker 初始化成功！')
    } catch (error) {
        loading.fail('Docker 初始化失败！')
    }
}

async function sortProjectJson(projectPath: string) {
    try {
        const pkg: IPackage = await getProjectJson(projectPath)
        const pkgData: IPackage = {
            dependencies: sortKey(pkg?.dependencies || {}),
            devDependencies: sortKey(pkg?.devDependencies || {}),
        }
        await saveProjectJson(projectPath, pkgData)
    } catch (error) {
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

async function getLtsNodeVersionByIndexJson() {
    const resp = await axios.get<NodeIndexJson>(NODE_INDEX_URL)
    return resp.data?.find((e) => e.lts)?.version?.replace('v', '')
}

async function getLtsNodeVersionByHtml(url: string) {
    const html = (await axios.get(url)).data as string
    return html.match(/<strong>(.*)<\/strong>/)?.[1]?.trim()
}

/**
 * 获取 Node.js lts 版本号。取第一位，例如 '16.13.1' 取 '16'
 */
async function getLtsNodeVersion(): Promise<string> {
    const loading = ora('正在获取 Node.js lts 版本号')
    loading.start()
    try {
        const fastUrl = await getFastUrl([...NODEJS_URLS, NODE_INDEX_URL])
        loading.succeed(`成功选择了 Node.js 网址 - ${fastUrl}`)
        let version = ''
        if (fastUrl === NODE_INDEX_URL) {
            version = await getLtsNodeVersionByIndexJson()
        } else {
            version = await getLtsNodeVersionByHtml(fastUrl)
        }
        console.log(`获取 Node.js lts 版本号成功，版本号为 ${version}`)
        return version?.split('.')?.[0] // 取第一位  例如 '16.13.1' 取 '16'
    } catch (error) {
        console.error(error)
        loading.fail('获取 Node.js lts 版本号失败')
        return ''
    }
}

/**
 * 获取响应速度最快的 URL
 *
 * @author CaoMeiYouRen
 * @date 2022-11-10
 * @param urls
 */
async function getFastUrl(urls: string[]) {
    const fast = await Promise.any(urls.map((url) => axios({
        url,
        method: 'HEAD',
        timeout: 15 * 1000,
        headers: {
            'Accept-Encoding': '',
        },
    })))
    return fast?.config?.url
}

async function getNpmPackageVersion(name: string) {
    const version = (await asyncExec(`${PACKAGE_MANAGER} view ${name} version`)) as string || ''
    return version.trim()
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

function sortKey<T extends Record<string, unknown>>(obj: T) {
    const keys = Object.keys(obj).sort((a, b) => a.localeCompare(b))
    const obj2: Record<string, unknown> = {}
    keys.forEach((e) => {
        obj2[e] = obj[e]
    })
    return obj2 as T
}

async function getProjectJson(projectPath: string) {
    const pkgPath = path.join(projectPath, 'package.json')
    const pkg: IPackage = await fs.readJSON(pkgPath)
    return pkg
}

async function saveProjectJson(projectPath: string, pkgData: IPackage) {
    const pkgPath = path.join(projectPath, 'package.json')
    const pkg: IPackage = await getProjectJson(projectPath)
    const newPkg = Object.assign({}, pkg, pkgData)
    await fs.writeFile(pkgPath, JSON.stringify(newPkg, null, 2))
}

/**
 * 从 templates 复制文件到 项目根目录，如果文件已存在会先删除后更新
 *
 * @author CaoMeiYouRen
 * @date 2022-06-18
 * @param projectPath
 * @param files
 */
async function copyFilesFromTemplates(projectPath: string, files: string[]) {
    const loading = ora(`正在复制文件 ${files.join()} ……`).start()
    try {
        for await (const file of files) {
            const templatePath = path.join(__dirname, '../templates/', file)
            const newPath = path.join(projectPath, file)
            if (await fs.pathExists(newPath)) {
                await fs.remove(newPath)
            }
            await fs.copyFile(templatePath, newPath)
        }
        loading.succeed(`文件 ${files.join()} 复制成功！`)
        return true
    } catch (error) {
        loading.fail(`文件 ${files.join()} 复制失败！`)
        throw error
    }
}

/**
 * 删除根目录下的指定文件
 *
 * @author CaoMeiYouRen
 * @date 2022-06-18
 * @param projectPath
 * @param files
 */
async function removeFiles(projectPath: string, files: string[]) {
    const loading = ora(`正在删除文件 ${files.join()} ……`).start()
    try {
        for await (const file of files) {
            const newPath = path.join(projectPath, file)
            if (await fs.pathExists(newPath)) {
                await fs.remove(newPath)
            } else {
                console.log(`文件 ${file} 不存在，已跳过删除`)
            }
        }
        loading.succeed(`文件 ${files.join()} 删除成功！`)
        return true
    } catch (error) {
        loading.fail(`文件 ${files.join()} 删除失败！`)
        throw error
    }
}
