import path from 'path'
import ora from 'ora'
import fs from 'fs-extra'
import JSON5 from 'json5'
import acorn from 'acorn'
import walk from 'acorn-walk'
import { cloneDeep } from 'lodash'
import { PACKAGE_MANAGER } from '@/config/env'
import { COMMON_DEPENDENCIES, NODE_DEPENDENCIES } from '@/utils/dependencies'
import { copyFilesFromTemplates, removeFiles } from '@/utils/files'
import { asyncExec } from '@/utils/exec'
import { readPackageJson, updatePackageJson } from '@/utils/package-json'
import { InitAnswers, IPackage, ProjectInfo } from '@/types/interfaces'
import { buildPackageJsonPatch, buildProjectInfo } from '@/core/project-info'
import { loadTemplateCliConfig } from '@/utils/config'
import { getAuthorWebsiteFromGithubAPI, getFastUrl, getLtsNodeVersionByHtml, getLtsNodeVersionByIndexJson } from '@/utils/api'
import { getTemplateMeta } from '@/utils/template'
import { sortKey } from '@/pure/common'
import { NODE_INDEX_URL, NODEJS_URLS } from '@/utils/constants'

export async function installNpmPackages(projectPath: string) {
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
    }
}

export async function initCommonDependencies(projectPath: string, answers: InitAnswers) {
    const loading = ora('正在初始化 常见依赖……').start()
    try {
        const { commonDependencies = [] } = answers
        const pkg: IPackage = await readPackageJson(projectPath)
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
        await updatePackageJson(projectPath, newPkg)
        loading.succeed('常见依赖初始化成功！')
    } catch (error) {
        console.error(error)
        loading.fail('常见依赖安装失败！')
    }
}

export async function initYarn(projectPath: string, answers: InitAnswers) {
    try {
        const { isRemoveYarn } = answers
        const files = ['yarn.lock']
        if (isRemoveYarn) {
            await removeFiles(projectPath, files)
        }
    } catch (error) {
        console.error(error)
    }
}

export async function initTsconfig(projectPath: string, answers: InitAnswers) {
    try {
        const tsconfigPath = path.join(projectPath, 'tsconfig.json')
        const { jsModuleType } = answers
        if (await fs.pathExists(tsconfigPath)) {
            const tsconfigStr = await fs.readFile(tsconfigPath, 'utf8')
            const tsconfig = JSON5.parse(tsconfigStr)
            if (tsconfig?.compilerOptions?.importHelpers) {
                const pkg: IPackage = await readPackageJson(projectPath)
                const pkgData: IPackage = {
                    dependencies: {
                        tslib: `^${await getNpmPackageVersion('tslib')}`,
                        ...pkg.dependencies,
                    },
                }
                const newPkg = Object.assign({}, pkg, pkgData)
                await updatePackageJson(projectPath, newPkg)
            }

            if (tsconfig?.compilerOptions) {
                const newTsconfig = cloneDeep(tsconfig)
                let hasChanges = false
                if (typeof newTsconfig.compilerOptions.watch === 'boolean') {
                    newTsconfig.compilerOptions.watch = undefined
                    hasChanges = true
                }
                if (typeof newTsconfig.compilerOptions.skipLibCheck !== 'boolean') {
                    newTsconfig.compilerOptions.skipLibCheck = true
                    hasChanges = true
                }
                if (jsModuleType === 'esm') {
                    newTsconfig.compilerOptions.module = 'esnext'
                    if (!newTsconfig.compilerOptions.moduleResolution) {
                        newTsconfig.compilerOptions.moduleResolution = 'node'
                    }
                    hasChanges = true
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

export async function initProjectJson(projectPath: string, projectInfos: ProjectInfo) {
    const loading = ora('正在初始化 package.json ……').start()
    try {
        const pkg: IPackage = await readPackageJson(projectPath)
        const newPkg = buildPackageJsonPatch({
            packageInfo: projectInfos,
            basePackageJson: pkg,
        })
        await updatePackageJson(projectPath, newPkg)

        loading.succeed('package.json 初始化成功！')
        return newPkg
    } catch (error) {
        console.error(error)
        loading.fail('package.json 初始化失败！')
    }
}

export async function getProjectInfo(projectPath: string, answers: InitAnswers) {
    const loading = ora('正在获取项目信息 ……').start()
    try {
        const { author, template, isOpenSource } = answers
        const templateMeta = getTemplateMeta(template)
        const packageManager = 'npm'
        const config = await loadTemplateCliConfig()
        const pkg: IPackage = await readPackageJson(projectPath)

        const nodeVersion = await getLtsNodeVersion() || '20'
        const githubUsername = config?.GITHUB_USERNAME || author
        const authorWebsite = isOpenSource ? await getAuthorWebsiteFromGithubAPI(githubUsername) : ''

        const projectInfos = buildProjectInfo({
            answers,
            templateMeta,
            packageJson: pkg,
            cliConfig: config,
            nodeLtsVersion: nodeVersion,
            packageManager,
            authorWebsite,
            currentYear: new Date().getFullYear(),
        })
        loading.succeed('项目信息 初始化成功！')
        return projectInfos

    } catch (error) {
        loading.fail('项目信息 初始化失败！')
        console.error(error)
        return null
    }
}

export async function jsFileExtRename(projectPath: string) {
    const loading = ora('正在重命名 js 后缀名 ……').start()
    try {
        const jsFiles = (await fs.readdir(projectPath)).filter((file) => /\.js$/.test(file)).map((file) => path.join(projectPath, file))
        const pkg: IPackage = await readPackageJson(projectPath)
        if (pkg.type === 'module') {
            for await (const filepath of jsFiles) {
                const fileContent = await fs.readFile(filepath, 'utf-8')
                const moduleType = getJsModuleType(fileContent)
                console.log(`正在判断文件：${filepath} 的模块类型`)
                if (moduleType === 'CommonJS') {
                    const dirpath = path.dirname(filepath)
                    const extname = path.extname(filepath)
                    const basename = `${path.basename(filepath, extname)}.cjs`
                    const newPath = path.join(dirpath, basename)
                    if (await fs.pathExists(newPath)) {
                        await fs.remove(newPath)
                    }
                    await fs.rename(filepath, newPath)
                }
            }
        } else if (pkg.type === 'commonjs') {
            for await (const filepath of jsFiles) {
                const fileContent = await fs.readFile(filepath, 'utf-8')
                const moduleType = getJsModuleType(fileContent)
                console.log(`正在判断文件：${filepath} 的模块类型`)
                if (moduleType === 'EsModule') {
                    const dirpath = path.dirname(filepath)
                    const extname = path.extname(filepath)
                    const basename = `${path.basename(filepath, extname)}.mjs`
                    const newPath = path.join(dirpath, basename)
                    if (await fs.pathExists(newPath)) {
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

export async function sortProjectJson(projectPath: string) {
    try {
        const pkg: IPackage = await readPackageJson(projectPath)
        const pkgData: IPackage = {
            dependencies: sortKey(pkg?.dependencies || {}),
            devDependencies: sortKey(pkg?.devDependencies || {}),
        }
        await updatePackageJson(projectPath, pkgData)
    } catch (error) {
        console.error(error)
    }
}

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
        return version?.split('.')?.[0]
    } catch (error) {
        console.error(error)
        loading.fail('获取 Node.js lts 版本号失败')
        return ''
    }
}

function getJsModuleType(fileContent: string) {
    try {
        const ast = acorn.parse(fileContent, {
            sourceType: 'module',
            ecmaVersion: 'latest',
        })
        let isCommonJS = false
        let isESModule = false

        walk.simple(ast, {
            AssignmentExpression(node) {
                if ((node.left as any)?.object?.name === 'module' && (node.left as any)?.property?.name === 'exports') {
                    isCommonJS = true
                }
            },
            CallExpression(node) {
                if ((node.callee as any)?.name === 'require') {
                    isCommonJS = true
                }
            },
            ImportDeclaration() {
                isESModule = true
            },
            ExportAllDeclaration() {
                isESModule = true
            },
            ExportDefaultDeclaration() {
                isESModule = true
            },
            ExportNamedDeclaration() {
                isESModule = true
            },
            ExportSpecifier() {
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

export async function getNpmPackageVersion(name: string) {
    const output = (await asyncExec(`${PACKAGE_MANAGER} view ${name} version`)) as string || ''
    const semverReg = /\d+\.\d+\.\d+(?:[-+][0-9A-Za-z-.]+)?/
    const lines = output.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
    const hit = lines.reverse().find((line) => semverReg.test(line))
    if (hit) {
        const match = hit.match(semverReg)
        if (match) {
            return match[0]
        }
    }
    return output.trim()
}
