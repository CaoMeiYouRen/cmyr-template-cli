import path from 'path'
import colors from '@colors/colors'
import ora from 'ora'
import axios from 'axios'
import AdmZip from 'adm-zip'
import fs from 'fs-extra'
import { PACKAGE_MANAGER } from '../config/env'
import { REMOTES } from './constants'
import { getFastUrl } from './api'
import { getTemplateMeta } from './template'
import { asyncExec } from './exec'
// readPackageJson is used only in commented-out code below, keeping the import for future reference
import { InitAnswers } from '@/types/interfaces'
import { initRemoteGitRepo } from '@/core/git'
import { initGithubWorkflows, initDependabot } from '@/core/ci'
import { initDocker } from '@/core/docker'
import { initReadme, initContributing, initCodeOfConduct, initSecurity, initPullRequestTemplate, initLicense, initIssueTemplate, initFunding } from '@/core/docs'
import { installNpmPackages, initCommonDependencies, initYarn, initTsconfig, initProjectJson, getProjectInfo, jsFileExtRename, sortProjectJson, initTypeCheck } from '@/core/project'
import { initEditorconfig, initCommitlint, initCommitizen, initSemanticRelease, initHusky, initEslint, initStylelint } from '@/core/tooling'
import { initTest } from '@/core/testing'
import { initAIScaffolding } from '@/core/ai'

export async function downloadGitRepo(repository: string, destination: string) {
    const fastRepo = await getFastGitRepo(repository)
    const loading = ora(`正在下载模板 - ${repository}`)
    loading.start()
    return Promise.any([
        downloadAndExtractZip(fastRepo, destination, loading, repository),
        new Promise((_resolve, reject) => setTimeout(reject, 60 * 1000)),
    ])
}

async function downloadAndExtractZip(url: string, destination: string, loading: ora.Ora, repository: string) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' })
        const buffer = Buffer.from(response.data)
        const zip = new AdmZip(buffer)
        const entries = zip.getEntries()
        const topDir = entries[0]?.entryName.split('/')[0]
        if (!topDir) {
            throw new Error('无效的 zip 文件')
        }
        await fs.ensureDir(destination)
        for (const entry of entries) {
            if (entry.entryName.startsWith(`${topDir}/`)) {
                const relativePath = entry.entryName.slice(topDir.length + 1)
                if (!relativePath) {
                    continue
                }
                const targetPath = path.join(destination, relativePath)
                const resolvedPath = path.resolve(targetPath)
                if (!resolvedPath.startsWith(path.resolve(destination))) {
                    throw new Error(`路径遍历攻击检测: ${relativePath}`)
                }
                if (entry.isDirectory) {
                    await fs.ensureDir(targetPath)
                } else {
                    await fs.ensureDir(path.dirname(targetPath))
                    await fs.writeFile(targetPath, entry.getData())
                }
            }
        }
        loading.succeed(`成功下载模板 - ${repository}`)
        return true
    } catch {
        loading.fail('下载模板失败！')
        process.exit(1)
    }
}

export async function getFastGitRepo(repository: string) {
    const loading = ora(`正在选择镜像源 - ${repository}`)
    loading.start()
    try {
        const fastUrl = await getFastUrl(REMOTES.map((remote) => `${remote}/${repository}/archive/refs/heads/master.zip`))
        loading.succeed(`成功选择了镜像源 - ${fastUrl}`)
        return fastUrl
    } catch (error) {
        console.error(error)
        loading.fail('选择镜像源失败！')
        process.exit(1)
    }
}

export async function initProject(answers: unknown) {
    const typedAnswers = answers as InitAnswers
    const { name, template } = typedAnswers
    const projectPath = path.join(process.cwd(), name)
    await downloadGitRepo(`CaoMeiYouRen/${template}`, projectPath)
    await init(projectPath, typedAnswers)
    return '- 下载项目模板成功！'
}

async function init(projectPath: string, answers: InitAnswers) {
    const { template, isOpenSource, isInitReadme, isInitContributing, isInitHusky, isInitSemanticRelease, isInitDocker, isInitTest, isInitAI } = answers
    try {
        const templateMeta = getTemplateMeta(template)
        await asyncExec('git --version', {
            cwd: projectPath,
        })
        await asyncExec('git init', {
            cwd: projectPath,
        })

        if (['nodejs', 'browser'].includes(templateMeta?.runtime)) {
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
            if (isOpenSource) {
                if (info) {
                    if (isInitReadme) {
                        await initReadme(projectPath, info)
                    }
                    if (isInitContributing) {
                        await initContributing(projectPath, info)
                        await initCodeOfConduct(projectPath, info)
                        await initSecurity(projectPath, info)
                        await initPullRequestTemplate(projectPath, info)
                        await initIssueTemplate(projectPath)
                    }
                    await initLicense(projectPath, info)
                    await initFunding(projectPath, info)
                }
                await initGithubWorkflows(projectPath, answers)
            }
            await initEditorconfig(projectPath)
            if (isInitAI) {
                if (info) {
                    await initAIScaffolding(projectPath, info)
                }
            }
            await initCommitlint(projectPath)
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
            await initTypeCheck(projectPath, answers)

            if (isInitTest) {
                await initTest(projectPath, answers)
            }

            await sortProjectJson(projectPath)
            await initYarn(projectPath, answers)
            await jsFileExtRename(projectPath)
            await initDependabot(projectPath, answers)

            await asyncExec('git add .', {
                cwd: projectPath,
            })

            await installNpmPackages(projectPath)

            await asyncExec('git add .', {
                cwd: projectPath,
            })

            // 由于 eslint-config-cmyr 版本更新导致目前必须处理 typescript 文件路径错误，暂时注释掉 lint 命令
            // const pkg = await readPackageJson(projectPath)
            // if (pkg?.scripts?.lint) {
            //     await asyncExec(`${PACKAGE_MANAGER} run lint`, {
            //         cwd: projectPath,
            //     })
            // }
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

        await asyncExec('git add .', {
            cwd: projectPath,
        })

        await asyncExec('git commit -m "chore: init" --no-gpg --no-verify', {
            cwd: projectPath,
        })

    } catch (error) {
        console.error(colors.red(error instanceof Error ? error.message : String(error)))
    }
}

export async function sleep(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time))
}
