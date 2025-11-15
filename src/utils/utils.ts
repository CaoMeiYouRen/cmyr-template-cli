import path from 'path'
import colors from '@colors/colors'
import download from 'download-git-repo'
import ora from 'ora'
import { PACKAGE_MANAGER } from '../config/env'
import { REMOTES } from './constants'
import { getFastUrl } from './api'
import { getTemplateMeta } from './template'
import { asyncExec } from './exec'
import { readPackageJson } from './package-json'
import { InitAnswers } from '@/types/interfaces'
import { initRemoteGitRepo } from '@/core/git'
import { initGithubWorkflows, initDependabot } from '@/core/ci'
import { initDocker } from '@/core/docker'
import { initReadme, initContributing, initCodeOfConduct, initSecurity, initPullRequestTemplate, initLicense, initIssueTemplate, initFunding } from '@/core/docs'
import { installNpmPackages, initCommonDependencies, initYarn, initTsconfig, initProjectJson, getProjectInfo, jsFileExtRename, sortProjectJson } from '@/core/project'
import { initEditorconfig, initCommitlint, initCommitizen, initSemanticRelease, initHusky, initEslint, initStylelint } from '@/core/tooling'
import { initTest } from '@/core/testing'

export async function downloadGitRepo(repository: string, destination: string, options: any = {}) {
    const fastRepo = await getFastGitRepo(repository)
    const loading = ora(`正在下载模板 - ${repository}`)
    loading.start()
    return Promise.any([
        new Promise((resolve) => {
            download(fastRepo, destination, options, (err: any) => {
                if (err) {
                    loading.fail('下载模板失败！')
                    process.exit(1)
                }
                loading.succeed(`成功下载模板 - ${repository}`)
                resolve(true)
            })
        }),
        new Promise((_resolve, reject) => setTimeout(reject, 60 * 1000)),
    ])
}

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
        process.exit(1)
    }
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

            const pkg = await readPackageJson(projectPath)
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
