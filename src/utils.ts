import fs from 'fs-extra'
import path from 'path'
import ora from 'ora'
import download from 'download-git-repo'
import { exec, ExecOptions } from 'child_process'
import { __DEV__ } from './env'
interface Package {
    name: string
    version: string
    description: string
    author: string
    private: boolean
    license: string
    main: string
    bin: Record<string, string>
    files: string[]
    scripts: Record<string, string>
    devDependencies: Record<string, string>
    dependencies: Record<string, string>
    [k: string]: unknown
}

export type IPackage = Partial<Package>
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
    const loading = ora(`download - ${repository}`)
    loading.start()
    return new Promise((resolve, reject) => {
        download(repository, destination, options, (err: any) => {
            loading.stop()
            if (err) {
                return reject(err)
            }
            resolve(true)
        })
    })
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

export async function init(projectPath: string, pkgData: IPackage) {
    const loading = ora('正在安装依赖……')
    loading.start()
    try {
        await asyncExec('git --version', {
            cwd: projectPath,
        })
        await asyncExec('npm -v', {
            cwd: projectPath,
        })
        await asyncExec('git init', {
            cwd: projectPath,
        })
        const pkgPath = path.join(projectPath, 'package.json')
        const pkg: IPackage = await fs.readJSON(pkgPath)
        const newPkg = Object.assign({}, pkg, pkgData)
        await fs.writeFile(pkgPath, JSON.stringify(newPkg, null, 2))
        await asyncExec('git add .', {
            cwd: projectPath,
        })
        await asyncExec('git commit -m "chore: init"', {
            cwd: projectPath,
        })
        await asyncExec('npm i', {
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

const forEachSetVersion = (dep: Record<string, string>) => {
    const promises: Promise<unknown>[] = []
    const manager = 'npm'
    Object.keys(dep).forEach((key) => {
        // TODO: 优化逻辑
        if (/^[0-9]+/.test(dep[key])) { // 开头为 数字 直接跳过。
            return
        }
        const newPromise = new Promise((resolve, reject) => {
            exec(`${manager} view ${key} version`, (err, stdout, stderr) => {
                if (err) {
                    return reject(err)
                }
                if (stderr) {
                    return reject(stderr)
                }
                dep[key] = `^${stdout.slice(0, stdout.length - 1)}`
                resolve(0)
            })
        })
        promises.push(newPromise)
    })
    return promises
}

/**
 * 更新 package 中 devDependencies、dependencies 到最新版本
 *
 * @author CaoMeiYouRen
 * @date 2020-12-05
 * @export
 * @param {IPackage} pkg package 文件
 */
export async function updateDependencies(pkg: IPackage) {
    const loading = ora('正在获取依赖最新版本……')
    if (__DEV__) {
        return pkg
    }
    loading.start()
    await Promise.allSettled([
        ...forEachSetVersion(pkg.devDependencies),
        ...forEachSetVersion(pkg.dependencies),
    ])
    loading.stop()
    return pkg
}

export function sortKey(obj: Record<string, unknown>) {
    const keys = Object.keys(obj).sort((a, b) => a.localeCompare(b))
    const obj2: Record<string, unknown> = {}
    keys.forEach((e) => {
        obj2[e] = obj[e]
    })
    return obj2
}
