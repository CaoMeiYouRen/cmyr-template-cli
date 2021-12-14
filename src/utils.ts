import fs from 'fs-extra'
import path from 'path'
import ora from 'ora'
import download from 'download-git-repo'
import axios from 'axios'
import { exec, ExecOptions } from 'child_process'
import { PACKAGE_MANAGER } from './env'
import any from 'promise.any'
import { InitAnswers, IPackage } from './interfaces'

if (!Promise.any) {
    Promise.any = any
}

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
    const loading = ora(`download - ${repository}`)
    loading.start()
    return new Promise((resolve, reject) => {
        download(fastRepo, destination, options, (err: any) => {
            loading.stop()
            if (err) {
                return reject(err)
            }
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
        return `direct:${fast.config.url}`
    } catch (error) {
        console.error(error)
        process.exit(1)
    } finally {
        loading.stop()
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
    const loading = ora('正在安装依赖……')
    const { name, author, description, isOpenSource, isRemoveDependabot } = answers
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

        const dependabotPath = path.join(projectPath, '.github/dependabot.yml')
        const mergifyPath = path.join(projectPath, '.github/mergify.yml')
        if (!isOpenSource || isRemoveDependabot) { // 闭源 或者 移除
            if (await fs.pathExists(dependabotPath)) { // 如果存在 dependabot.yml
                await fs.remove(dependabotPath)
            }
            if (await fs.pathExists(mergifyPath)) { // 如果存在 mergify.yml
                await fs.remove(mergifyPath)
            }
        }

        const pkgPath = path.join(projectPath, 'package.json')
        const pkg: IPackage = await fs.readJSON(pkgPath)
        const pkgData: IPackage = {
            name,
            author,
            description,
            private: !isOpenSource,
        }
        const newPkg = Object.assign({}, pkg, pkgData)
        await fs.writeFile(pkgPath, JSON.stringify(newPkg, null, 2))

        await asyncExec('git add .', {
            cwd: projectPath,
        })
        await asyncExec('git commit -m "chore: init"', {
            cwd: projectPath,
        })
        loading.start()
        await asyncExec(`${PACKAGE_MANAGER} i`, {
            cwd: projectPath,
        })
        await asyncExec('git add .', {
            cwd: projectPath,
        })
    } catch (error) {
        console.error(error)
    } finally {
        loading.stop()
    }
}

export async function getGitUserName() {
    const username = (await asyncExec('git config user.name')) as string
    return username.trim()
}

export async function sleep(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time))
}

// const forEachSetVersion = (dep: Record<string, string>) => {
//     const promises: Promise<unknown>[] = []
//     const manager = 'npm'
//     Object.keys(dep).forEach((key) => {
//         // TODO: 优化逻辑
//         if (/^[0-9]+/.test(dep[key])) { // 开头为 数字 直接跳过。
//             return
//         }
//         const newPromise = new Promise((resolve, reject) => {
//             exec(`${manager} view ${key} version`, (err, stdout, stderr) => {
//                 if (err) {
//                     return reject(err)
//                 }
//                 if (stderr) {
//                     return reject(stderr)
//                 }
//                 dep[key] = `^${stdout.slice(0, stdout.length - 1)}`
//                 resolve(0)
//             })
//         })
//         promises.push(newPromise)
//     })
//     return promises
// }

// /**
//  * 更新 package 中 devDependencies、dependencies 到最新版本
//  *
//  * @author CaoMeiYouRen
//  * @date 2020-12-05
//  * @export
//  * @param {IPackage} pkg package 文件
//  */
// export async function updateDependencies(pkg: IPackage) {
//     const loading = ora('正在获取依赖最新版本……')
//     if (__DEV__) {
//         return pkg
//     }
//     loading.start()
//     await Promise.allSettled([
//         ...forEachSetVersion(pkg.devDependencies),
//         ...forEachSetVersion(pkg.dependencies),
//     ])
//     loading.stop()
//     return pkg
// }

// export function sortKey(obj: Record<string, unknown>) {
//     const keys = Object.keys(obj).sort((a, b) => a.localeCompare(b))
//     const obj2: Record<string, unknown> = {}
//     keys.forEach((e) => {
//         obj2[e] = obj[e]
//     })
//     return obj2
// }

