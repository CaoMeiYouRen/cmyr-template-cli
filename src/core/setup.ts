/* eslint-disable max-lines */
import path from 'path'
import ora from 'ora'
import fs from 'fs-extra'
import JSON5 from 'json5'
import acorn from 'acorn'
import walk from 'acorn-walk'
import { cloneDeep, merge } from 'lodash'
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
                switch (jsModuleType) {
                    case 'esm':
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

export async function initEditorconfig(projectPath: string) {
    try {
        const files = ['.editorconfig']
        await copyFilesFromTemplates(projectPath, files, true)
    } catch (error) {
        console.error(error)
    }
}

export async function initCommitlint(projectPath: string) {
    const loading = ora('正在初始化 commitlint ……').start()
    try {
        const pkg: IPackage = await readPackageJson(projectPath)
        const devDependencies = {
            commitlint: `^${await getNpmPackageVersion('commitlint')}`,
            '@commitlint/cli': undefined,
        }
        const pkgData: IPackage = {
            devDependencies: {
                'commitlint-config-cmyr': `^${await getNpmPackageVersion('commitlint-config-cmyr')}`,
                ...pkg?.devDependencies,
                ...devDependencies,
            },
        }
        await updatePackageJson(projectPath, pkgData)

        await removeFiles(projectPath, ['commitlint.config.cjs', 'commitlint.config.js'])
        const files = ['commitlint.config.ts']
        await copyFilesFromTemplates(projectPath, files, true)
        loading.succeed('commitlint 初始化成功！')
    } catch (error) {
        loading.fail('commitlint 初始化失败！')
        console.error(error)
    }
}

export async function initSemanticRelease(projectPath: string) {
    const loading = ora('正在初始化 semantic-release ……').start()
    try {
        const pkg: IPackage = await readPackageJson(projectPath)

        const files = ['.releaserc.js', '.releaserc.cjs']
        await removeFiles(projectPath, files)
        await copyFilesFromTemplates(projectPath, ['release.config.js'], true)

        const devDependencies = {
            'semantic-release': `^${await getNpmPackageVersion('semantic-release')}`,
            'semantic-release-cmyr-config': `^${await getNpmPackageVersion('semantic-release-cmyr-config')}`,
            'conventional-changelog-cli': undefined,
            'conventional-changelog-cmyr-config': undefined,
            '@semantic-release/changelog': undefined,
            '@semantic-release/git': undefined,
        }

        const pkgData: IPackage = {
            scripts: {
                release: 'semantic-release',
                ...pkg?.scripts,
            },
            devDependencies: {
                ...pkg?.devDependencies,
                ...devDependencies,
            },
            changelog: {
                language: 'zh',
            },
        }

        await updatePackageJson(projectPath, pkgData)

        loading.succeed('semantic-release 初始化成功！')
    } catch (error) {
        loading.fail('semantic-release 初始化失败！')
        console.error(error)
    }
}

export async function initHusky(projectPath: string) {
    const loading = ora('正在初始化 husky ……').start()
    try {
        const files = ['.husky/commit-msg', '.husky/pre-commit']
        const dir = path.join(projectPath, '.husky')
        if (!await fs.pathExists(dir)) {
            await fs.mkdirp(dir)
        }
        await copyFilesFromTemplates(projectPath, files)

        const extnames = ['js', 'ts']
        const pkg: IPackage = await readPackageJson(projectPath)
        if (pkg?.dependencies?.vue) {
            extnames.push('vue')
        }
        if (pkg?.dependencies?.react) {
            extnames.push('jsx', 'tsx')
        }
        const keyname = `*.{${extnames.join(',')}}`
        const devDependencies = {
            husky: `^${await getNpmPackageVersion('husky')}`,
            'lint-staged': `^${await getNpmPackageVersion('lint-staged')}`,
        }
        const pkgData: IPackage = {
            scripts: {
                ...pkg?.scripts,
                prepare: 'husky',
            },
            devDependencies: {
                ...pkg?.devDependencies,
                ...devDependencies,
            },
            husky: undefined,
            'lint-staged': {
                [keyname]: [
                    'npm run lint',
                    'git add',
                ],
            },
        }

        await updatePackageJson(projectPath, pkgData)

        loading.succeed('husky 初始化成功！')
    } catch (error) {
        loading.fail('husky 初始化失败！')
        console.error(error)
    }
}

export async function initCommitizen(projectPath: string) {
    const loading = ora('正在初始化 commitizen ……').start()
    try {
        const pkg: IPackage = await readPackageJson(projectPath)
        const devDependencies = {
            commitizen: `^${await getNpmPackageVersion('commitizen')}`,
            'cz-conventional-changelog-cmyr': `^${await getNpmPackageVersion('cz-conventional-changelog-cmyr')}`,
        }
        const pkgData: IPackage = {
            scripts: {
                ...pkg?.scripts,
                commit: 'cz',
            },
            devDependencies: {
                ...pkg?.devDependencies,
                ...devDependencies,
            },
            config: {
                ...pkg?.config,
                commitizen: undefined,
            },
        }
        await updatePackageJson(projectPath, pkgData)
        const files = ['.czrc']
        await copyFilesFromTemplates(projectPath, files, true)
        loading.succeed('commitizen 初始化成功！')
    } catch (error) {
        console.error(error)
        loading.fail('commitizen 初始化失败！')
    }
}

export async function initEslint(projectPath: string, answers: InitAnswers) {
    const loading = ora('正在初始化 eslint ……').start()
    try {
        const templateMeta = getTemplateMeta(answers.template)
        const pkg: IPackage = await readPackageJson(projectPath)

        const devDependencies: Record<string, string> = {
            'cross-env': '^10.0.0',
            eslint: '^9.34.0',
            '@typescript-eslint/eslint-plugin': undefined,
            '@typescript-eslint/parser': undefined,
        }
        let eslintType = 'eslint-config-cmyr'
        const extnames = ['js', 'mjs', 'cjs', 'ts', 'cts', 'mts']

        if (templateMeta?.language === 'vue') {
            Object.assign(devDependencies, {
                '@vue/eslint-config-typescript': undefined,
                'eslint-plugin-vue': `^${await getNpmPackageVersion('eslint-plugin-vue')}`,
            })
            extnames.push('vue')
            eslintType = 'eslint-config-cmyr/vue'
        } else if (templateMeta?.language === 'react') {
            extnames.push('jsx', 'tsx')
            eslintType = 'eslint-config-cmyr/react'
            Object.assign(devDependencies, {
                'eslint-plugin-react': `^${await getNpmPackageVersion('eslint-plugin-react')}`,
            })
        }
        const pkgData: IPackage = {
            scripts: {
                ...pkg?.scripts,
                lint: 'cross-env NODE_ENV=production eslint . --fix',
            },
            devDependencies: {
                ...pkg?.devDependencies,
                ...devDependencies,
                'eslint-config-cmyr': `^${await getNpmPackageVersion('eslint-config-cmyr')}`,
            },
        }

        await updatePackageJson(projectPath, pkgData)

        const files = ['.eslintignore', '.eslintrc.cjs', '.eslintrc.js']
        await removeFiles(projectPath, files)

        const eslintrc = `import { defineConfig } from 'eslint/config'
import cmyr from '${eslintType}'
export default defineConfig([cmyr])
`

        const mjsPath = path.join(projectPath, 'eslint.config.mjs')
        const jsPath = path.join(projectPath, 'eslint.config.js')

        if (!await fs.pathExists(mjsPath) && !await fs.pathExists(jsPath)) {
            await fs.writeFile(jsPath, eslintrc)
        }

        loading.succeed('eslint 初始化成功！')
    } catch (error) {
        loading.fail('eslint 初始化失败！')
        console.error(error)
    }
}

export async function initStylelint(projectPath: string) {
    const loading = ora('正在初始化 stylelint ……').start()
    try {
        const pkg: IPackage = await readPackageJson(projectPath)

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

        await removeFiles(projectPath, ['.stylelintrc.js', '.stylelintrc.cjs'])

        const files = ['stylelint.config.js']
        await copyFilesFromTemplates(projectPath, files, true)

        const devDependencies = {
            postcss: `^${await getNpmPackageVersion('postcss')}`,
            sass: `^${await getNpmPackageVersion('sass')}`,
            stylelint: `^${await getNpmPackageVersion('stylelint')}`,
            'stylelint-config-cmyr': `^${await getNpmPackageVersion('stylelint-config-cmyr')}`,
            'postcss-html': undefined,
            'postcss-scss': undefined,
            'stylelint-config-standard': undefined,
            'stylelint-config-recommended': undefined,
            'stylelint-config-standard-scss': undefined,
            'stylelint-scss': undefined,
            'stylelint-config-html': undefined,
            'stylelint-config-rational-order': undefined,
        }

        const pkgData: IPackage = {
            scripts: {
                'lint:css': `stylelint src/**/*.{${extnames.join(',')}} --fix`,
                ...pkg?.scripts,
            },
            devDependencies: {
                ...pkg?.devDependencies,
                ...devDependencies,
            },
        }

        await updatePackageJson(projectPath, pkgData)

        loading.succeed('stylelint 初始化成功！')
    } catch (error) {
        loading.fail('stylelint 初始化失败！')
        console.error(error)
    }
}

export async function initTest(projectPath: string, answers: InitAnswers) {
    const loading = ora('正在初始化测试 ……').start()
    try {
        if (answers.isInitTest === 'vitest') {
            const files = ['vitest.config.ts']
            await copyFilesFromTemplates(projectPath, files)

            const pkg: IPackage = await readPackageJson(projectPath)
            const devDependencies: Record<string, string> = {
                vitest: '^3.2.4',
            }
            if (!pkg?.dependencies?.vite && !pkg?.devDependencies?.vite) {
                devDependencies.vite = '^7.0.5'
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
            await updatePackageJson(projectPath, newPkg)
            loading.succeed('Vitest 初始化成功！')
            return
        }
        if (answers.isInitTest === 'jest') {
            const files = ['jest.config.ts']
            await copyFilesFromTemplates(projectPath, files)

            const pkg: IPackage = await readPackageJson(projectPath)

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
            await updatePackageJson(projectPath, newPkg)
            loading.succeed('Jest 初始化成功！')
            return
        }
        loading.succeed('未选择测试框架，跳过测试初始化')
    } catch {
        loading.fail('测试初始化失败！')
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

export async function getNpmPackageVersion(name: string) {
    const version = (await asyncExec(`${PACKAGE_MANAGER} view ${name} version`)) as string || ''
    return version.trim()
}
