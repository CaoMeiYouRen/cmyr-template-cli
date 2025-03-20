import fs from 'fs-extra'
import path from 'path'
import ora from 'ora'
import download from 'download-git-repo'
import { exec, ExecOptions } from 'child_process'
import { PACKAGE_MANAGER } from '../config/env'
import { InitAnswers, IPackage, TemplateCliConfig, UnwrapPromise } from '@/types/interfaces'
import colors from '@colors/colors'
import ejs from 'ejs'
import { unescape, cloneDeep, mergeWith, merge, uniqBy, uniq } from 'lodash'
import JSON5 from 'json5'
import os from 'os'
import yaml from 'yaml'
import acorn from 'acorn'
import walk from 'acorn-walk'
import { REMOTES, NODE_INDEX_URL, NODEJS_URLS } from './constants'
import { COMMON_DEPENDENCIES, NODE_DEPENDENCIES } from './dependencies'
import { getTemplateMeta } from './template'
import { kebabCase, lintMd } from './string'
import { ejsRender } from './ejs'
import { copyFilesFromTemplates, removeFiles } from './files'
import { createGithubRepo, replaceGithubRepositoryTopics, createGiteeRepo, getAuthorWebsiteFromGithubAPI, getLtsNodeVersionByHtml, getLtsNodeVersionByIndexJson, getFastUrl, createOrUpdateARepositorySecret } from './api'

// 获取返回值类型并去除Promise的包裹
type ProjectInfo = UnwrapPromise<ReturnType<typeof getProjectInfo>>

/**
 * 载入配置，优先寻找当前目录下的 .ctrc 文件，其次寻找 HOME 路径下的 .ctrc。
 * github 和 gitee 的 token 各自独立寻找，不为空即为找到
 *
 * @author CaoMeiYouRen
 * @date 2023-09-17
 */
export async function loadTemplateCliConfig(): Promise<TemplateCliConfig> {
    const paths = [process.cwd(), os.homedir()].map((e) => path.join(e, '.ctrc'))
    const [local, home]: TemplateCliConfig[] = (await Promise.all(paths.map(async (p) => {
        try {
            if (await fs.pathExists(p)) {
                return fs.readJSON(p)
            }
            return null
        } catch (error) {
            console.error(error)
            return null
        }
    }))).filter(Boolean)
    return mergeWith(home, local, (objValue, srcValue) => {
        if (typeof objValue === 'string' && srcValue === '') {
            return objValue
        }
        if (typeof srcValue !== 'undefined' && srcValue !== null) {
            return srcValue
        }
        return objValue
    })
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
    return Promise.any([
        new Promise((resolve) => {
            download(fastRepo, destination, options, (err: any) => {
                if (err) {
                    loading.fail('下载模板失败！')
                    process.exit(1) // 下载模板失败直接退出
                }
                loading.succeed(`成功下载模板 - ${repository}`)
                resolve(true)
            })
        }),
        new Promise((_resolve, reject) => setTimeout(reject, 60 * 1000)),
    ])
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
                return resolve(stderr)
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
    const { template, isOpenSource, isInitReadme, isInitContributing, isInitHusky, isInitSemanticRelease, isInitDocker, isInitTest } = answers
    try {
        const templateMeta = getTemplateMeta(template)
        await asyncExec('git --version', {
            cwd: projectPath,
        })
        await asyncExec('git init', {
            cwd: projectPath,
        })

        if (['nodejs', 'browser'].includes(templateMeta?.runtime)) { // nodejs 项目
            await asyncExec('node -v', {
                cwd: projectPath,
            })
            await asyncExec(`${PACKAGE_MANAGER} -v`, {
                cwd: projectPath,
            })

            const info = await getProjectInfo(projectPath, answers)
            if (info) {
                await initProjectJson(projectPath, info)
            }
            if (isOpenSource) { // 只有开源的时候才初始化 REAMD
                if (info) {
                    if (isInitReadme) {
                        await initReadme(projectPath, info)
                    }
                    if (isInitContributing) {
                        await initContributing(projectPath, info)
                        await initCodeOfConduct(projectPath, info)
                        await initSecurity(projectPath, info)
                        await initPullRequestTemplate(projectPath, info)
                        await initIssueTemplate(projectPath, info)
                    }
                    await initLicense(projectPath, info)
                }
                await initGithubWorkflows(projectPath, answers)
            }
            await initConfig(projectPath)
            await initCommitizen(projectPath)
            if (isInitSemanticRelease) {
                await initSemanticRelease(projectPath)
            }
            if (isInitHusky) {
                await initHusky(projectPath)
            }

            await initCommonDependencies(projectPath, answers)

            await initTsconfig(projectPath, answers)

            await initEslint(projectPath, answers)

            await initStylelint(projectPath)

            if (isInitTest) {
                await initTest(projectPath, answers)
            }

            await sortProjectJson(projectPath)

            await initYarn(projectPath, answers)

            await jsFileExtRename(projectPath)

            await asyncExec('git add .', {
                cwd: projectPath,
            })

            await installNpmPackages(projectPath)

            await asyncExec('git add .', {
                cwd: projectPath,
            })

            const pkg = await getProjectJson(projectPath)
            if (pkg?.scripts?.lint) {
                await asyncExec(`${PACKAGE_MANAGER} run lint`, {
                    cwd: projectPath,
                })
            }
        } else if (templateMeta?.runtime === 'java') {
            await asyncExec('java -version', {
                cwd: projectPath,
            })
            await asyncExec('gradle -v', {
                cwd: projectPath,
            })
            await asyncExec('git add .', {
                cwd: projectPath,
            })
            try {
                await asyncExec('gradle dependencies --no-daemon', {
                    cwd: projectPath,
                })
            } catch (error) {
                console.error(error)
            }
        } else if (templateMeta?.runtime === 'python') {
            await asyncExec('python -V', {
                cwd: projectPath,
            })
            await asyncExec('pip -V', {
                cwd: projectPath,
            })
            await asyncExec('git add .', {
                cwd: projectPath,
            })

            try {
                await asyncExec('pip install -r requirements.txt', {
                    cwd: projectPath,
                })
            } catch (error) {
                if (!(typeof error === 'string' && error.includes('[notice]'))) {
                    throw error
                }
            }
        } else if (templateMeta?.runtime === 'golang') {
            await asyncExec('go version', {
                cwd: projectPath,
            })
            await asyncExec('git add .', {
                cwd: projectPath,
            })
            try {
                await asyncExec('go get', {
                    cwd: projectPath,
                })
            } catch (error) {
                console.error(error)
            }
        }

        await initRemoteGitRepo(projectPath, answers)

        if (isInitDocker) {
            await initDocker(projectPath, answers)
        }

        await initDependabot(projectPath, answers)

        await asyncExec('git add .', {
            cwd: projectPath,
        })

        await asyncExec('git commit -m "chore: init" --no-gpg', {
            cwd: projectPath,
        })

    } catch (error) {
        console.error(colors.red(error))
    }
}

export async function sleep(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time))
}

async function initRemoteGitRepo(projectPath: string, answers: InitAnswers) {
    const loading = ora('正在初始化远程 Git 仓库……').start()
    try {
        const { name, description, gitRemoteUrl, isOpenSource, isInitRemoteRepo, keywords, template, isPublishToNpm } = answers
        const templateMeta = getTemplateMeta(template)

        if (!gitRemoteUrl) {
            loading.fail('未找到远程 Git 仓库地址，请自行初始化！')
            return
        }

        await asyncExec(`git remote add origin ${gitRemoteUrl}`, {
            cwd: projectPath,
        })

        if (!isInitRemoteRepo) {
            loading.stop()
            console.info(colors.green(`请自行在远程 Git 仓库初始化 ${gitRemoteUrl}`))
            return
        }

        // 判断 remote 类型
        let type = ''
        if (/github\.com/.test(gitRemoteUrl)) {
            type = 'github'
        } else if (/gitee\.com/.test(gitRemoteUrl)) {
            type = 'gitee'
        }

        const config = await loadTemplateCliConfig()

        switch (type) {
            case 'github': {
                const authToken = config?.GITHUB_TOKEN
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
                    const owner = resp.data?.owner?.login
                    const repo = resp.data?.name
                    if (owner && repo) {
                        console.info(colors.green('正在初始化仓库 topics ！'))
                        if (isPublishToNpm) {
                            keywords.push('npm-package')
                        }
                        if (templateMeta.docker) {
                            keywords.push('docker')
                        }
                        if (templateMeta?.runtime) {
                            keywords.push(templateMeta?.runtime)
                        }
                        if (templateMeta?.language) {
                            keywords.push(templateMeta?.language)
                        }
                        await replaceGithubRepositoryTopics(authToken, {
                            owner,
                            repo,
                            topics: uniq(keywords).map((e) => kebabCase(e)),
                        })
                        console.info(colors.green('仓库 topics 初始化成功！'))

                        console.info(colors.green('正在初始化仓库 action secret ！'))
                        const { DOCKER_USERNAME, DOCKER_PASSWORD, NPM_TOKEN } = config
                        if (isPublishToNpm && NPM_TOKEN) {
                            await createOrUpdateARepositorySecret(authToken, {
                                owner,
                                repo,
                                secret_name: 'NPM_TOKEN',
                                secret_value: NPM_TOKEN,
                            })
                        }
                        if (templateMeta.docker && DOCKER_USERNAME && DOCKER_PASSWORD) {
                            await createOrUpdateARepositorySecret(authToken, {
                                owner,
                                repo,
                                secret_name: 'DOCKER_USERNAME',
                                secret_value: DOCKER_USERNAME,
                            })
                            await createOrUpdateARepositorySecret(authToken, {
                                owner,
                                repo,
                                secret_name: 'DOCKER_PASSWORD',
                                secret_value: DOCKER_PASSWORD,
                            })
                        }
                        console.info(colors.green('仓库 action secret 初始化成功！'))
                        return
                    }
                    loading.fail('远程 Git 仓库初始化失败！')
                    return
                }
                return
            }
            case 'gitee': {
                const access_token = config?.GITEE_TOKEN
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
                loading.stop()
                console.info(colors.green(`请在远程 Git 仓库初始化 ${gitRemoteUrl}`))

            }
        }
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
                    .filter((name) => COMMON_DEPENDENCIES?.devDependencies?.[name] || NODE_DEPENDENCIES?.devDependencies?.[name])
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

interface Schedule {
    interval: string
    time: string
    timezone: string
}
interface Ignore {
    'dependency-name': string
    versions?: string[]
}
interface Update {
    'package-ecosystem': string
    directory: string
    'open-pull-requests-limit': number
    schedule: Schedule
    ignore: Ignore[]
}
interface Dependabot {
    version: number
    updates: Update[]
}

async function initDependabot(projectPath: string, answers: InitAnswers) {
    try {
        const { isOpenSource, isRemoveDependabot } = answers
        const files = ['.github/dependabot.yml', '.github/mergify.yml']
        if (!isOpenSource || isRemoveDependabot) { // 闭源 或者 直接指定移除
            await removeFiles(projectPath, files) // 如果存在 dependabot.yml/mergify.yml
        } else {
            const pkg: IPackage = await getProjectJson(projectPath)
            const dependabotPath = path.join(projectPath, '.github/dependabot.yml')
            if (await fs.pathExists(dependabotPath)) { // 如果存在 dependabot
                const dependabot: Dependabot = yaml.parse(await fs.readFile(dependabotPath, 'utf-8'))
                if (dependabot?.updates?.[0]['package-ecosystem'] === 'npm') { // 如果为 npm
                    const dependencies = []
                    if (pkg?.devDependencies?.['semantic-release']) { // 如果有 semantic-release 依赖
                        // 解决 semantic-release 高版本出错问题，禁用 semantic-release 版本更新
                        dependencies.push({
                            'dependency-name': 'semantic-release',
                            versions: ['>= 21.0.1'],
                        })
                    }
                    if (pkg?.devDependencies?.['@commitlint/cli']) { // 如果有 @commitlint/cli 依赖
                        // 解决 @commitlint/cli 高版本出错问题，禁用 @commitlint/cli 版本更新
                        dependencies.push({
                            'dependency-name': '@commitlint/cli',
                            versions: ['>= 19.0.0'],
                        })
                    }
                    if (pkg?.devDependencies?.['@commitlint/config-conventional']) { // 如果有 @commitlint/config-conventional 依赖
                        // 解决 @commitlint/config-conventional 高版本出错问题，禁用 @commitlint/config-conventional 版本更新
                        dependencies.push({
                            'dependency-name': '@commitlint/config-conventional',
                            versions: ['>= 19.0.0'],
                        })
                    }
                    if (pkg?.dependencies?.['art-template']) { // 如果有 art-template 依赖
                        // 高版本涉嫌危险代码，参考 https://github.com/yoimiya-kokomi/Miao-Yunzai/pull/515
                        dependencies.push({
                            'dependency-name': 'art-template',
                            versions: ['>= 4.13.3'],
                        })
                    }
                    dependabot.updates[0].ignore = uniqBy([
                        ...dependabot?.updates?.[0].ignore || [],
                        ...dependencies,
                    ], (e) => e['dependency-name'])
                }
                if (dependabot?.updates?.every((e) => e['package-ecosystem'] !== 'github-actions')) { // 如果不存在 github-actions
                    // 增加 github-actions 版本自动更新
                    dependabot.updates.push({
                        'package-ecosystem': 'github-actions',
                        directory: '/',
                        'open-pull-requests-limit': 20,
                        schedule: {
                            interval: 'weekly',
                            time: '04:00',
                            timezone: 'Asia/Shanghai',
                        },
                        ignore: [],
                    })
                }
                fs.writeFile(dependabotPath, yaml.stringify(dependabot))
            }

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

async function initTsconfig(projectPath: string, answers: InitAnswers) {
    try {
        const tsconfigPath = path.join(projectPath, 'tsconfig.json')
        const { jsModuleType } = answers
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

            if (tsconfig?.compilerOptions) {
                const newTsconfig = cloneDeep(tsconfig)
                let hasChanges = false
                // 修复 tsconfig watch 选项的问题。 5.0 后不允许在配置里 watch
                if (typeof newTsconfig.compilerOptions.watch === 'boolean') {
                    newTsconfig.compilerOptions.watch = undefined
                    hasChanges = true
                }
                // 修复 tsconfig skipLibCheck 选项的问题。 目前偶尔会出现依赖里类型校验出错，故暂时跳过依赖的类型校验
                if (typeof newTsconfig.compilerOptions.skipLibCheck !== 'boolean') {
                    newTsconfig.compilerOptions.skipLibCheck = true
                    hasChanges = true
                }
                // 修复 tsconfig sourceMap 选项的问题。缺少 sourceMap 的话会看不见原始的堆栈
                // if (newTsconfig.compilerOptions.sourceMap === false) {
                //     newTsconfig.compilerOptions.sourceMap = true
                //     hasChanges = true
                // }
                switch (jsModuleType) {
                    case 'cjs':
                        // hasChanges = true
                        break
                    case 'esm':
                        // 修复 esm 规范时的问题
                        newTsconfig.compilerOptions.module = 'esnext'
                        if (!newTsconfig.compilerOptions.moduleResolution) {
                            newTsconfig.compilerOptions.moduleResolution = 'node'
                        }
                        hasChanges = true
                        break
                    default:
                        break
                }
                if (hasChanges) {
                    await fs.writeFile(tsconfigPath, JSON.stringify(newTsconfig, null, 4))
                }
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
async function initProjectJson(projectPath: string, projectInfos: ProjectInfo) {
    const loading = ora('正在初始化 package.json ……').start()
    try {

        const { packageName, engines, license, homepage, issuesUrl, gitUrl, author, description, keywords = [], isOpenSource, isPublishToNpm = false, jsModuleType } = projectInfos

        const pkg: IPackage = await getProjectJson(projectPath)
        const pkgData: IPackage = {
            name: packageName,
            author,
            description,
            keywords,
            private: !isPublishToNpm,
            license: 'UNLICENSED',
            engines,
        }
        let extData: IPackage = {}
        if (isOpenSource) {
            extData = {
                license,
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
        if (isPublishToNpm) {
            extData.publishConfig = {
                access: 'public',
            }
        }
        switch (jsModuleType) {
            case 'cjs':
                extData.type = 'commonjs'
                break
            case 'esm':
                extData.type = 'module'
                break
            default:
                break
        }
        const newPkg = merge({}, pkg, pkgData, extData)
        newPkg.keywords = uniq(keywords)
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
        const { name, author, description, template, isOpenSource, isPublishToNpm, license = 'UNLICENSED', isPrivateScopePackage, scopeName, isInitDocker = false } = answers
        const templateMeta = getTemplateMeta(template)
        const projectName = name
        const packageManager = 'npm'
        const config = await loadTemplateCliConfig()
        const pkg: IPackage = await getProjectJson(projectPath)

        const nodeVersion = await getLtsNodeVersion() || '20'
        const node = Number(nodeVersion) - 4 // lts 减 4 为最旧支持的版本

        let keywords = [
            ...answers.keywords || [],
        ]
        if (templateMeta.docker) {
            keywords.push('docker')
        }
        if (templateMeta?.language) {
            keywords.push(templateMeta?.language)
        }
        if (templateMeta?.vueVersion === 3) {
            keywords.push('vue3')
        }
        if (templateMeta.tags?.length) {
            keywords.push(...templateMeta.tags)
        }
        keywords = uniq(keywords).map((e) => kebabCase(e))

        const packageName = isPrivateScopePackage ? `@${scopeName}/${name}` : name // npm 包的名称
        const engines = merge({}, pkg?.engines, { node: `>=${node}` })
        const version = pkg?.version || '0.1.0'
        const installCommand = isPublishToNpm ? `${packageManager} install ${packageName}` : `${packageManager} install`
        const startCommand = pkg?.scripts?.start && `${packageManager} run start`
        const devCommand = pkg?.scripts?.dev && `${packageManager} run dev`
        const buildCommand = pkg?.scripts?.build && `${packageManager} run build`
        const testCommand = pkg?.scripts?.test && `${packageManager} run test`
        const lintCommand = pkg?.scripts?.lint && `${packageManager} run lint`
        const commitCommand = pkg?.scripts?.commit && `${packageManager} run commit`
        const mainFile = pkg?.main

        const githubUsername = config?.GITHUB_USERNAME || author
        const giteeUsername = config?.GITEE_USERNAME
        const weiboUsername = config?.WEIBO_USERNAME
        const twitterUsername = config?.TWITTER_USERNAME
        const afdianUsername = config?.AFDIAN_USERNAME
        const patreonUsername = config?.PATREON_USERNAME
        const npmUsername = config?.NPM_USERNAME || githubUsername
        const dockerUsername = config?.DOCKER_USERNAME || githubUsername?.toLowerCase()
        const dockerPassword = config?.DOCKER_PASSWORD || ''
        const contactEmail = config?.CONTACT_EMAIL || ''
        const npmToken = config?.NPM_TOKEN || ''

        const repositoryUrl = `https://github.com/${githubUsername}/${projectName}`
        const gitUrl = `git+${repositoryUrl}.git`
        const issuesUrl = `${repositoryUrl}/issues`
        const contributingUrl = `${repositoryUrl}/blob/master/CONTRIBUTING.md`
        const documentationUrl = `${repositoryUrl}#readme`
        const demoUrl = `${repositoryUrl}#readme`
        const homepage = documentationUrl
        const licenseUrl = `${repositoryUrl}/blob/master/LICENSE`
        const discussionsUrl = `${repositoryUrl}/discussions`
        const pullRequestsUrl = `${repositoryUrl}/pulls`
        const authorWebsite = isOpenSource ? await getAuthorWebsiteFromGithubAPI(githubUsername) : ''

        const projectInfos = {
            ...answers,
            keywords,
            currentYear: new Date().getFullYear(),
            name,
            description,
            version,
            author,
            authorWebsite,
            homepage,
            demoUrl,
            gitUrl,
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
            isGithubRepos: isOpenSource,
            installCommand,
            startCommand,
            usage: startCommand,
            devCommand,
            buildCommand,
            testCommand,
            lintCommand,
            commitCommand,
            isJSProject: ['nodejs', 'browser'].includes(templateMeta?.runtime),
            packageManager,
            isProjectOnNpm: isPublishToNpm,
            isOpenSource,
            packageName,
            projectName,
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
            giteeUsername,
            afdianUsername,
            patreonUsername,
            weiboUsername,
            twitterUsername,
            npmUsername,
            dockerUsername,
            dockerPassword,
            templateMeta,
            mainFile,
            isInitDocker,
            contactEmail,
            npmToken,
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
async function initReadme(projectPath: string, projectInfos: ProjectInfo) {
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
async function initContributing(projectPath: string, projectInfos: ProjectInfo) {
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
 * 初始化 贡献者公约
 *
 * @author CaoMeiYouRen
 * @date 2024-12-15
 * @param projectPath
 * @param projectInfos
 */
async function initCodeOfConduct(projectPath: string, projectInfos: ProjectInfo) {
    const loading = ora('正在初始化 贡献者公约 ……').start()
    try {
        const templatePath = path.join(__dirname, '../templates/CODE_OF_CONDUCT.md')
        const template = (await fs.readFile(templatePath, 'utf8')).toString()
        const newPath = path.join(projectPath, 'CODE_OF_CONDUCT.md')
        const content = await ejs.render(
            template,
            projectInfos,
            {
                debug: false,
                async: true,
            },
        )
        await removeFiles(projectPath, ['CODE_OF_CONDUCT.md'])
        await fs.writeFile(newPath, lintMd(unescape(content)))
        loading.succeed('贡献者公约 初始化成功！')
    } catch (error) {
        loading.fail('贡献者公约 初始化失败！')
        console.error(error)
    }
}

/**
 * 初始化 SECURITY.md
 *
 * @author CaoMeiYouRen
 * @date 2025-03-21
 * @param projectPath
 * @param projectInfos
 */
async function initSecurity(projectPath: string, projectInfos: ProjectInfo) {
    const loading = ora('正在初始化 SECURITY.md ……').start()
    try {
        const templatePath = path.join(__dirname, '../templates/SECURITY.md')
        const template = (await fs.readFile(templatePath, 'utf8')).toString()
        const newPath = path.join(projectPath, 'SECURITY.md')
        const content = await ejs.render(
            template,
            projectInfos,
            {
                debug: false,
                async: true,
            },
        )
        await removeFiles(projectPath, ['SECURITY.md'])
        await fs.writeFile(newPath, lintMd(unescape(content)))
        loading.succeed('SECURITY.md 初始化成功！')
    } catch (error) {
        loading.fail('SECURITY.md 初始化失败！')
        console.error(error)
    }
}

async function initPullRequestTemplate(projectPath: string, projectInfos: ProjectInfo) {
    const loading = ora('正在初始化 PULL_REQUEST_TEMPLATE ……').start()
    try {
        const templatePath = path.join(__dirname, '../templates/.github/PULL_REQUEST_TEMPLATE.md')
        const template = (await fs.readFile(templatePath, 'utf8')).toString()
        const newPath = path.join(projectPath, '.github/PULL_REQUEST_TEMPLATE.md')
        const content = await ejs.render(
            template,
            projectInfos,
            {
                debug: false,
                async: true,
            },
        )
        await removeFiles(projectPath, ['.github/PULL_REQUEST_TEMPLATE.md'])
        await fs.writeFile(newPath, lintMd(unescape(content)))
        loading.succeed('PULL_REQUEST_TEMPLATE 初始化成功！')
    } catch (error) {
        loading.fail('PULL_REQUEST_TEMPLATE 初始化失败！')
        console.error(error)
    }
}

/**
 * 初始化 LICENSE
 * @param projectPath
 * @param projectInfos
 */
async function initLicense(projectPath: string, projectInfos: ProjectInfo) {
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

/**
 * 初始化 .editorconfig、commitlint.config.js 等配置
 * @param projectPath
 */
async function initConfig(projectPath: string) {
    try {
        await removeFiles(projectPath, ['commitlint.config.cjs', 'commitlint.config.js'])
        const files = ['.editorconfig', 'commitlint.config.js']
        await copyFilesFromTemplates(projectPath, files)
    } catch (error) {
        console.error(error)
    }
}

/**
 * 初始化 ISSUE_TEMPLATE
 *
 * @author CaoMeiYouRen
 * @date 2025-03-21
 * @param projectPath
 * @param projectInfos
 */
async function initIssueTemplate(projectPath: string, projectInfos: ProjectInfo) {
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

/**
 * 初始化 Github Workflows
 * @param projectPath
 * @param answers
 */
async function initGithubWorkflows(projectPath: string, answers: InitAnswers) {
    const loading = ora('正在初始化 Github Workflows ……').start()
    try {
        const { isInitSemanticRelease } = answers
        const files = ['.github/workflows/test.yml', '.github/workflows/todo.yml']
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
        const pkg: IPackage = await getProjectJson(projectPath)

        const files = ['.releaserc.js', '.releaserc.cjs']
        await removeFiles(projectPath, files)
        await copyFilesFromTemplates(projectPath, ['.releaserc.js'])

        const devDependencies = {
            '@semantic-release/changelog': '^6.0.3',
            '@semantic-release/git': '^10.0.1',
            'semantic-release': '21.0.1',
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
                'semantic-release': devDependencies['semantic-release'],
            },
            changelog: {
                language: 'zh',
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
            husky: '^9.0.11',
            'lint-staged': '^15.2.2',
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
 *  初始化 eslint
 * @param projectPath
 */
async function initEslint(projectPath: string, answers: InitAnswers) {
    const loading = ora('正在初始化 eslint ……').start()
    try {
        const templateMeta = getTemplateMeta(answers.template)
        const pkg: IPackage = await getProjectJson(projectPath)

        const devDependencies: Record<string, string> = {
            '@typescript-eslint/eslint-plugin': '^5.48.0',
            '@typescript-eslint/parser': '^5.48.0',
            'cross-env': '^7.0.3',
            eslint: '^8.31.0',
        }
        let eslintType = 'cmyr'
        const extnames = ['js', 'mjs', 'cjs', 'ts', 'cts', 'mts']

        if (templateMeta?.language === 'vue') {
            Object.assign(devDependencies, {
                '@vue/eslint-config-typescript': '^11.0.2',
                'eslint-plugin-vue': '^9.8.0',
            })
            extnames.push('vue')
            if (templateMeta?.vueVersion === 3) { // vue3
                eslintType = 'cmyr/vue3'
            } else {
                eslintType = 'cmyr/vue'
            }
        } else if (templateMeta?.language === 'react') {
            extnames.push('jsx', 'tsx')
            eslintType = 'cmyr/react'
            Object.assign(devDependencies, {
                'eslint-config-react-app': '^7.0.1',
            })
        }
        const pkgData: IPackage = {
            scripts: {
                lint: `cross-env NODE_ENV=production eslint src --fix --ext ${extnames.join(',')}`,
                ...pkg?.scripts,
            },
            devDependencies: {
                'eslint-plugin-import': '^2.28.1',
                ...devDependencies,
                ...pkg?.devDependencies,
                'eslint-config-cmyr': `^${await getNpmPackageVersion('eslint-config-cmyr')}`,
            },
        }

        await saveProjectJson(projectPath, pkgData)

        const files = ['.eslintignore']
        await copyFilesFromTemplates(projectPath, files, true)

        const eslintrc = `module.exports = {
    root: true,
    extends: '${eslintType}',
}`

        const cjsPath = path.join(projectPath, '.eslintrc.cjs')
        const jsPath = path.join(projectPath, '.eslintrc.js')

        if (!await fs.pathExists(cjsPath) && !await fs.pathExists(jsPath)) { // 如果不存在就写入
            await fs.writeFile(jsPath, eslintrc)
        }

        loading.succeed('eslint 初始化成功！')
    } catch (error) {
        loading.fail('eslint 初始化失败！')
        console.error(error)
    }
}

/**
 * 初始化 stylelint 相关配置
 * @param projectPath
 */
async function initStylelint(projectPath: string) {
    const loading = ora('正在初始化 stylelint ……').start()
    try {
        const pkg: IPackage = await getProjectJson(projectPath)

        const extnames = ['html', 'css', 'scss', 'sass']
        if (pkg?.dependencies?.vue) {
            extnames.push('vue')
        } else if (pkg?.dependencies?.react) {
            extnames.push('jsx', 'tsx')
        } else {
            loading.stopAndPersist({
                text: '非前端项目，无需初始化 stylelint',
            })
            return
        }

        const files = ['.stylelintignore', '.stylelintrc.js']

        await removeFiles(projectPath, ['.stylelintrc.js', '.stylelintrc.cjs'])
        await copyFilesFromTemplates(projectPath, files)

        const devDependencies = {
            'postcss-html': '^1.5.0',
            sass: '^1.57.1',
            stylelint: '^14.16.1',
            'stylelint-config-cmyr': '^0.2.1',
            'stylelint-config-rational-order': '^0.1.2',
            'stylelint-config-standard': '^29.0.0',
            'stylelint-order': '^6.0.1',
            'stylelint-scss': '^4.3.0',
        }

        const pkgData: IPackage = {
            scripts: {
                'lint:css': `stylelint src/**/*.{${extnames.join(',')}} --fix --custom-syntax postcss-html`,
                ...pkg?.scripts,
            },
            devDependencies: {
                ...devDependencies,
                ...pkg?.devDependencies,
            },
        }

        await saveProjectJson(projectPath, pkgData)

        loading.succeed('stylelint 初始化成功！')
    } catch (error) {
        loading.fail('stylelint 初始化失败！')
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
                '@commitlint/cli': '^18.6.1',
                '@commitlint/config-conventional': '^18.6.3',
            },
            config: {
                ...pkg?.config,
                commitizen: {
                    path: 'cz-conventional-changelog-cmyr',
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

async function initDocker(projectPath: string, answers: InitAnswers) {
    const loading = ora('正在初始化 Docker ……').start()
    try {
        const { name } = answers
        // hono 的逻辑需要单独处理
        if (answers.template === 'hono-template') {
            const dockerComposePath = path.join(projectPath, 'docker-compose.yml')
            if (await fs.pathExists(dockerComposePath)) {
                // 替换 hono-template 为项目名称
                let dockerCompose = await fs.readFile(dockerComposePath, 'utf-8')
                dockerCompose = dockerCompose.replaceAll('hono-template', name)
                await fs.writeFile(dockerComposePath, dockerCompose)
            }
            const wranglerPath = path.join(projectPath, 'wrangler.toml')
            if (await fs.pathExists(wranglerPath)) {
                // 替换 hono-template 为项目名称
                let wrangler = await fs.readFile(wranglerPath, 'utf-8')
                wrangler = wrangler.replaceAll('hono-template', name)
                await fs.writeFile(wranglerPath, wrangler)
            }
            loading.succeed('Docker 初始化成功！')
            return
        }

        const templateMeta = getTemplateMeta(answers.template)

        const files = ['.dockerignore', 'docker-compose.yml', '.github/workflows/docker.yml']
        await copyFilesFromTemplates(projectPath, files)

        let dockerfile = 'Dockerfile'
        const newPath = path.join(projectPath, 'Dockerfile')
        if (await fs.pathExists(newPath)) {
            await fs.remove(newPath)
        }
        if (templateMeta?.runtime === 'java') {
            const templatePath = path.join(__dirname, '../templates/java/Dockerfile.ejs')

            await ejsRender(templatePath, { javaVersion: templateMeta?.javaVersion }, newPath)

            loading.succeed('Docker 初始化成功！')
            return
        }
        if (templateMeta?.runtime === 'nodejs') {
            // 解决 nodejs 依赖过大的问题
            if (templateMeta?.runtime === 'nodejs') {
                const scriptsDir = path.join(projectPath, 'scripts')
                if (! await fs.pathExists(scriptsDir)) {
                    await fs.mkdir(scriptsDir)
                }
                await copyFilesFromTemplates(projectPath, ['scripts/minify-docker.cjs'])
            }

            const pkg: IPackage = await getProjectJson(projectPath)
            const mainFile = pkg?.main
            const templatePath = path.join(__dirname, '../templates/Dockerfile')
            await ejsRender(templatePath, { mainFile }, newPath)

            loading.succeed('Docker 初始化成功！')
            return
        }
        switch (templateMeta?.runtime) {
            case 'python':
                dockerfile = 'python/Dockerfile'
                break
            case 'golang':
                dockerfile = 'golang/Dockerfile'
                break
            default:
                dockerfile = 'Dockerfile'
                break
        }
        const dockerfilePath = path.join(__dirname, '../templates/', dockerfile)
        await fs.copyFile(dockerfilePath, newPath)
        loading.succeed('Docker 初始化成功！')
    } catch (error) {
        loading.fail('Docker 初始化失败！')
    }
}

async function initTest(projectPath: string, answers: InitAnswers) {
    const loading = ora('正在初始化测试 ……').start()
    try {
        if (answers.isInitTest === 'vitest') {
            const files = ['vitest.config.ts']
            await copyFilesFromTemplates(projectPath, files)

            const pkg: IPackage = await getProjectJson(projectPath)
            const devDependencies: Record<string, string> = {
                vitest: '^2.1.6',
            }
            // 检测是否存在 vite，若不存在，则添加
            if (!pkg?.dependencies?.vite && !pkg?.devDependencies?.vite) {
                devDependencies.vite = '^6.0.1'
            }

            const newPkg = merge({}, pkg, {
                scripts: {
                    test: 'vitest run',
                    'test:coverage': 'vitest run --coverage',
                    ...pkg?.scripts,
                },
                devDependencies: {
                    ...devDependencies,
                    ...pkg?.devDependencies,
                },
            })
            await saveProjectJson(projectPath, newPkg)
            loading.succeed('Vitest 初始化成功！')
            return
        }
        if (answers.isInitTest === 'jest') {
            const files = ['jest.config.ts']
            await copyFilesFromTemplates(projectPath, files)

            const pkg: IPackage = await getProjectJson(projectPath)

            const devDependencies = {
                '@types/jest': '^29.5.12',
                jest: '^29.7.0',
                'ts-jest': '^29.1.2',
                'ts-node': '^10.9.2',
            }
            const newPkg = merge({}, pkg, {
                scripts: {
                    test: 'jest --config jest.config.ts',
                    'test:coverage': 'jest --config jest.config.ts --coverage',
                    ...pkg?.scripts,
                },
                devDependencies: {
                    ...devDependencies,
                    ...pkg?.devDependencies,
                },
            })
            newPkg.jest = undefined
            await saveProjectJson(projectPath, newPkg)
            loading.succeed('Jest 初始化成功！')
            return
        }
        if (answers.isInitTest === 'none') {
            loading.succeed('未选择测试框架，跳过测试初始化')
            return
        }
        loading.succeed('未选择测试框架，跳过测试初始化')
    } catch (error) {
        loading.fail('测试初始化失败！')
    }
}

async function jsFileExtRename(projectPath: string) {
    const loading = ora('正在重命名 js 后缀名 ……').start()
    try {
        // 所有 .js 后缀的文件
        const jsFiles = (await fs.readdir(projectPath)).filter((file) => /\.js$/.test(file)).map((file) => path.join(projectPath, file))
        const pkg: IPackage = await getProjectJson(projectPath)
        if (pkg.type === 'module') {
            // 判断 js 的模块类型，如果是 cjs ，则改后缀为 .cjs
            for await (const filepath of jsFiles) {
                const fileContent = await fs.readFile(filepath, 'utf-8')
                const moduleType = getJsModuleType(fileContent)
                console.log(`正在判断文件：${filepath} 的模块类型`)
                if (moduleType === 'CommonJS') {
                    const dirpath = path.dirname(filepath)
                    const extname = path.extname(filepath)
                    const basename = `${path.basename(filepath, extname)}.cjs`
                    const newPath = path.join(dirpath, basename)
                    if (await fs.pathExists(newPath)) { // 存在就删除
                        await fs.remove(newPath)
                    }
                    await fs.rename(filepath, newPath)
                }
            }
        } else if (pkg.type === 'commonjs') {
            // 判断 js 的模块类型，如果是 mjs ，则改后缀为 .mjs
            for await (const filepath of jsFiles) {
                const fileContent = await fs.readFile(filepath, 'utf-8')
                const moduleType = getJsModuleType(fileContent)
                console.log(`正在判断文件：${filepath} 的模块类型`)
                if (moduleType === 'EsModule') {
                    const dirpath = path.dirname(filepath)
                    const extname = path.extname(filepath)
                    const basename = `${path.basename(filepath, extname)}.mjs`
                    const newPath = path.join(dirpath, basename)
                    if (await fs.pathExists(newPath)) { // 存在就删除
                        await fs.remove(newPath)
                    }
                    await fs.rename(filepath, newPath)
                }
            }
        }
        loading.succeed('重命名 js 后缀名成功！')
    } catch (error) {
        loading.fail('重命名 js 后缀名失败！')
        console.error(error)
    }
}

function getJsModuleType(fileContent: string) {
    try {
        // const fileContent = fs.readFileSync(filePath, 'utf-8')
        const ast = acorn.parse(fileContent, {
            sourceType: 'module',
            ecmaVersion: 'latest',
        })
        // console.log(JSON.stringify(ast, null, 4))
        let isCommonJS = false
        let isESModule = false

        walk.simple(ast, {
            AssignmentExpression(node) {
                // 判断 module.exports
                if ((node.left as any)?.object?.name === 'module' && (node.left as any)?.property?.name === 'exports') {
                    isCommonJS = true
                }
            },
            CallExpression(node) {
                // 判断 require()
                if ((node.callee as any)?.name === 'require') {
                    isCommonJS = true
                }
            },
            ImportDeclaration(node) {
                isESModule = true
            },
            ExportAllDeclaration(node) {
                isESModule = true
            },
            ExportDefaultDeclaration(node) {
                isESModule = true
            },
            ExportNamedDeclaration(node) {
                isESModule = true
            },
            ExportSpecifier(node) {
                isESModule = true
            },
        })
        if (isESModule) {
            return 'EsModule'
        }
        if (isCommonJS) {
            return 'CommonJS'
        }
        return 'Unknown'

    } catch (error) {
        console.error(error)
        return 'Unknown'
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

async function getNpmPackageVersion(name: string) {
    const version = (await asyncExec(`${PACKAGE_MANAGER} view ${name} version`)) as string || ''
    return version.trim()
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

