import colors from '@colors/colors'
import ora from 'ora'
import { InitAnswers, TemplateCliConfig, TemplateMeta } from '@/types/interfaces'
import { asyncExec } from '@/utils/exec'
import { getTemplateMeta } from '@/utils/template'
import { loadTemplateCliConfig } from '@/utils/config'
import { createGithubRepo, createGiteeRepo, replaceGithubRepositoryTopics, createOrUpdateARepositorySecret } from '@/utils/api'
import { buildRepositoryTopics, detectRemoteService, buildRepositorySecretsPlan } from '@/pure/git'

export async function initRemoteGitRepo(projectPath: string, answers: InitAnswers) {
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

        const remoteType = detectRemoteService(gitRemoteUrl)
        const cliConfig = await loadTemplateCliConfig()

        switch (remoteType) {
            case 'github':
                await handleGithubRepo({
                    loading,
                    templateMeta,
                    cliConfig,
                    repository: { name, description, isOpenSource, keywords, isPublishToNpm },
                })
                return
            case 'gitee':
                await handleGiteeRepo({ loading, repository: { name, description }, cliConfig })
                return
            default:
                loading.stop()
                console.info(colors.green(`请在远程 Git 仓库初始化 ${gitRemoteUrl}`))
        }
    } catch (error) {
        loading.fail('远程 Git 仓库初始化失败！')
        console.error(error)
    }
}

interface RepositoryInfo {
    name: string
    description: string
    isOpenSource?: boolean
    keywords: string[]
    isPublishToNpm?: boolean
}

interface GithubRepoContext {
    loading: ora.Ora
    templateMeta: TemplateMeta
    cliConfig: TemplateCliConfig
    repository: RepositoryInfo
}

async function handleGithubRepo({ loading, templateMeta, cliConfig, repository }: GithubRepoContext) {
    const authToken = cliConfig?.GITHUB_TOKEN
    if (!authToken) {
        console.error(colors.red('未找到 github token ！跳过初始化！'))
        return
    }
    const resp = await createGithubRepo(authToken, {
        name: repository.name,
        description: repository.description,
        private: !repository.isOpenSource,
    })
    if (resp?.status >= 200) {
        loading.succeed('远程 Git 仓库初始化成功！')
        console.info(colors.green(`远程 Git 仓库地址 ${resp.data?.html_url}`))
        const owner = resp.data?.owner?.login
        const repo = resp.data?.name
        if (owner && repo) {
            const topics = buildRepositoryTopics({
                baseKeywords: repository.keywords,
                templateMeta,
                isPublishToNpm: repository.isPublishToNpm,
            })
            console.info(colors.green('正在初始化仓库 topics ！'))
            await replaceGithubRepositoryTopics(authToken, {
                owner,
                repo,
                topics,
            })
            console.info(colors.green('仓库 topics 初始化成功！'))

            const secrets = buildRepositorySecretsPlan({ templateMeta, cliConfig })
            if (secrets.length) {
                console.info(colors.green('正在初始化仓库 action secret ！'))
                for (const secret of secrets) {
                    await createOrUpdateARepositorySecret(authToken, {
                        owner,
                        repo,
                        secret_name: secret.name,
                        secret_value: secret.value,
                    })
                }
                console.info(colors.green('仓库 action secret 初始化成功！'))
            }
            return
        }
        loading.fail('远程 Git 仓库初始化失败！')
        return
    }
    loading.fail('远程 Git 仓库初始化失败！')
}

interface GiteeRepoContext {
    loading: ora.Ora
    repository: Pick<RepositoryInfo, 'name' | 'description'>
    cliConfig: TemplateCliConfig
}

async function handleGiteeRepo({ loading, repository, cliConfig }: GiteeRepoContext): Promise<void> {
    const accessToken = cliConfig?.GITEE_TOKEN
    if (!accessToken) {
        console.error(colors.red('未找到 gitee token ！跳过初始化！'))
        return
    }
    const resp = await createGiteeRepo({
        access_token: accessToken,
        name: repository.name,
        description: repository.description,
        private: true,
    })
    if (resp?.status >= 200) {
        loading.succeed('远程 Git 仓库初始化成功！')
        console.info(colors.green(`远程 Git 仓库地址 ${resp.data?.html_url}`))
        return
    }
    loading.fail('远程 Git 仓库初始化失败！')
}
