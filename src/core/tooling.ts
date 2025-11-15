import path from 'path'
import ora from 'ora'
import fs from 'fs-extra'
import { InitAnswers, IPackage } from '@/types/interfaces'
import { copyFilesFromTemplates, removeFiles } from '@/utils/files'
import { readPackageJson, updatePackageJson } from '@/utils/package-json'
import { getTemplateMeta } from '@/utils/template'
import { getNpmPackageVersion } from '@/core/project'

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
