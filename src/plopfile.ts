import path from 'path'
import { NodePlopAPI, ActionType } from 'plop'
import { QuestionCollection } from 'inquirer'
import fs from 'fs-extra'
import ora from 'ora'
import { __DEV__ } from './config/env'
import { InitAnswers, AIProjectSuggestion } from './types/interfaces'
import { initProject } from './utils/utils'
import { loadTemplateCliConfig } from './utils/config'
import { TEMPLATES_META_LIST } from './core/constants'
import { COMMON_DEPENDENCIES, NODE_DEPENDENCIES, WEB_DEPENDENCIES, VUE2_DEPENDENCIES, VUE3_DEPENDENCIES } from './utils/dependencies'
import { getGitUserName } from './utils/git'
import { getTemplateMeta } from './utils/template'
import { kebabCase, lintMd } from './utils/string'
import { getAIProjectSuggestion } from './utils/ai-api'

module.exports = function (plop: NodePlopAPI) {
    plop.setActionType('initProject', initProject)
    plop.setGenerator('create', {
        description: '草梅项目创建器',
        async prompts(inquirer) {
            const config = await loadTemplateCliConfig()
            // AI 建议结果，在隐藏的触发问题中异步设置
            let aiSuggestion: AIProjectSuggestion | null = null
            const questions: QuestionCollection<InitAnswers> = [
                // ===== AI 引导模式（必须最先询问） =====
                {
                    type: 'confirm',
                    name: 'isAIAssisted',
                    message: '是否启用 AI 引导模式？（通过 AI 帮助生成项目信息）',
                    default: false,
                },
                {
                    type: 'input',
                    name: 'aiUserInput',
                    message: '请描述您的项目功能：',
                    default: '',
                    when(answers: InitAnswers) {
                        return answers.isAIAssisted
                    },
                },
                // 隐藏的 AI 调用触发器（不显示给用户，仅用于异步调用 AI API）
                {
                    type: 'input',
                    name: '_aiTrigger',
                    message: '',
                    async when(answers: InitAnswers) {
                        if (answers.isAIAssisted && answers.aiUserInput) {
                            const spinner = ora('AI 正在生成项目建议...').start()
                            try {
                                aiSuggestion = await getAIProjectSuggestion(answers.aiUserInput, config)
                                spinner.succeed('AI 已生成项目建议')
                                console.log('')
                                console.log('AI 为您生成了以下方案：')
                                console.log(`  推荐项目名称: ${aiSuggestion.names.join(', ')}`)
                                console.log(`  项目描述: ${aiSuggestion.description}`)
                                console.log(`  关键词: ${aiSuggestion.keywords.join(', ')}`)
                                console.log(`  推荐模板: ${aiSuggestion.template}`)
                                console.log('')
                            } catch (error) {
                                spinner.fail(`AI 引导失败: ${error instanceof Error ? error.message : String(error)}`)
                                console.log('回退到标准问答流程\n')
                            }
                        }
                        return false // 永远不显示此问题
                    },
                },
                // ===== 项目基本信息（AI 引导模式下使用 AI 建议作为默认值） =====
                {
                    type: 'input',
                    name: 'name',
                    message() {
                        if (aiSuggestion?.names?.length) {
                            return `请选择/输入项目名称 (AI 建议: ${aiSuggestion.names.join(', ')}):`
                        }
                        return '请输入项目名称'
                    },
                    validate(input: string) {
                        return input.trim().length !== 0
                    },
                    default() {
                        return aiSuggestion?.names?.[0] || (__DEV__ ? 'temp' : '')
                    },
                    filter: (e: string) => kebabCase(e.trim()),
                },
                {
                    type: 'input',
                    name: 'description',
                    message: '请输入项目简介',
                    default() {
                        return aiSuggestion?.description || ''
                    },
                    filter: (e: string) => lintMd(e.trim()),
                },
                {
                    type: 'input',
                    name: 'author',
                    message: '请输入作者名称',
                    validate(input: string) {
                        return input.trim().length !== 0
                    },
                    default: __DEV__ ? 'CaoMeiYouRen' : await getGitUserName(),
                    filter: (e: string) => e.trim(),
                },
                {
                    type: 'input',
                    name: 'keywords',
                    message: '请输入项目关键词(用,分割)',
                    default() {
                        return aiSuggestion?.keywords?.join(',') || ''
                    },
                    filter: (e: string) => e.trim().split(',').map((f) => f.trim()).filter(Boolean),
                },
                {
                    type: 'list',
                    name: 'template',
                    message: '请选择项目模板',
                    choices() {
                        return TEMPLATES_META_LIST.map((e) => e.name)
                    },
                    default() {
                        if (aiSuggestion?.template) {
                            return aiSuggestion.template
                        }
                        return __DEV__ ? 'ts-template' : ''
                    },
                },
                {
                    type: 'list',
                    name: 'jsModuleType',
                    message: '请选择 JS 模块规范',
                    choices() {
                        return ['esm', 'cjs']
                    },
                    default(answers: InitAnswers) {
                        const templateMeta = getTemplateMeta(answers.template)
                        if (!['nodejs'].includes(templateMeta?.runtime)) {
                            return ''
                        }
                        // 根据 nodejs 版本选择默认值，若大于 18，则默认 esm，否则默认 cjs
                        const nodeVersion = Number(process.version.split('.')[0].slice(1)) - 4 // 减 4 以兼容低版本
                        return nodeVersion >= 18 ? 'esm' : 'cjs'
                    },
                    when(answers: InitAnswers) {
                        const templateMeta = getTemplateMeta(answers.template)
                        return ['nodejs'].includes(templateMeta?.runtime) // 当且仅当 nodejs 时需要选择
                    },
                },
                {
                    type: 'checkbox',
                    name: 'commonDependencies',
                    message: '请选择需要安装的常见依赖',
                    default: [],
                    choices(answers: InitAnswers) {
                        const templateMeta = getTemplateMeta(answers.template)
                        const choices = Object.keys(COMMON_DEPENDENCIES.dependencies) // 通用依赖
                        if (templateMeta?.runtime === 'nodejs') {
                            choices.push(...Object.keys(NODE_DEPENDENCIES.dependencies)) // node 端依赖
                        }
                        if (templateMeta?.runtime === 'browser') { // web 端依赖
                            choices.push(...Object.keys(WEB_DEPENDENCIES.dependencies))
                        }
                        if (templateMeta?.vueVersion === 2) {
                            choices.push(...Object.keys(VUE2_DEPENDENCIES.dependencies)) // vue2 依赖
                        } else if (templateMeta?.vueVersion === 3) {
                            choices.push(...Object.keys(VUE3_DEPENDENCIES.dependencies)) // vue3 依赖
                        }
                        return choices
                    },
                    when(answers: InitAnswers) {
                        const templateMeta = getTemplateMeta(answers.template)
                        return ['nodejs', 'browser'].includes(templateMeta?.runtime)
                    },
                },
                // ===== AI 配置相关 =====
                {
                    type: 'confirm',
                    name: 'isInitAI',
                    message: '是否初始化 AI 开发配置？',
                    default: true,
                    when(answers: InitAnswers) {
                        const templateMeta = getTemplateMeta(answers.template)
                        return ['nodejs', 'browser'].includes(templateMeta?.runtime)
                    },
                },
                {
                    type: 'checkbox',
                    name: 'aiTools',
                    message: '请选择要初始化的 AI 工具配置',
                    choices: [
                        { name: 'Claude Code / Codex / Gemini CLI / OpenCode (AGENTS.md + .claude/)', value: 'claude', checked: true },
                        { name: 'GitHub Copilot (.github/copilot-instructions.md → AGENTS.md)', value: 'copilot', checked: true },
                        { name: 'Cursor (.cursorrules)', value: 'cursor', checked: false },
                        { name: 'Windsurf (.windsurfrules)', value: 'windsurf', checked: false },
                    ],
                    default: ['claude', 'copilot'],
                    when(answers: InitAnswers) {
                        return (answers as any).isInitAI
                    },
                },
                {
                    type: 'confirm',
                    name: 'isInitDocker',
                    message: '是否初始化 Docker？',
                    default(answers: InitAnswers) {
                        const templateMeta = getTemplateMeta(answers.template)
                        return templateMeta?.docker
                    },
                    when(answers: InitAnswers) {
                        const templateMeta = getTemplateMeta(answers.template)
                        return templateMeta?.docker
                    },
                },
                {
                    type: 'confirm',
                    name: 'isOpenSource',
                    message: '是否开源？',
                    default: false,
                },
                {
                    type: 'list',
                    name: 'license',
                    message: '请选择开源协议',
                    async choices() {
                        return fs.readdir(path.join(__dirname, '../templates/licenses/'))
                    },
                    default: 'MIT',
                    when(answers: InitAnswers) {
                        return answers.isOpenSource
                    },
                },
                {
                    type: 'confirm',
                    name: 'isInitRemoteRepo',
                    message: '是否初始化远程 Git 仓库？',
                    default(answers: InitAnswers) {
                        const { isOpenSource } = answers
                        return isOpenSource
                    },
                },
                {
                    type: 'input',
                    name: 'gitRemoteUrl',
                    message: '请输入远程 Git 仓库 Url',
                    validate(input: string) {
                        return input.trim().length !== 0
                    },
                    default(answers: InitAnswers) {
                        const { isOpenSource, name, author } = answers
                        const { GITHUB_USERNAME, GITEE_USERNAME } = config
                        const githubUsername = GITHUB_USERNAME || author
                        const giteeUsername = GITEE_USERNAME || author
                        // 如果是开源，则默认为 github，如果为闭源，则默认为 gitee
                        if (isOpenSource) {
                            return `git@github.com:${githubUsername}/${name}.git`
                        }
                        return `git@gitee.com:${giteeUsername}/${name}.git`
                    },
                    filter: (e: string) => e.trim(),
                    when(answers: InitAnswers) {
                        return answers.isInitRemoteRepo
                    },
                },
                {
                    type: 'confirm',
                    name: 'isPublishToNpm',
                    message: '是否发布到 npm？',
                    default(answers: InitAnswers) {
                        const templateMeta = getTemplateMeta(answers.template)
                        return answers.isOpenSource && templateMeta.npm
                    },
                    when(answers: InitAnswers) {
                        const templateMeta = getTemplateMeta(answers.template)
                        return answers.isOpenSource && templateMeta.npm
                    },
                },
                {
                    type: 'confirm',
                    name: 'isPrivateScopePackage',
                    message: '是否为私域包？',
                    default: false,
                    when(answers: InitAnswers) {
                        return answers.isPublishToNpm
                    },
                },
                {
                    type: 'input',
                    name: 'scopeName',
                    message: '请输入私域名称',
                    default: config.NPM_USERNAME,
                    when(answers: InitAnswers) {
                        return answers.isPrivateScopePackage
                    },
                    filter: (e: string) => e.trim(),
                },
                {
                    type: 'confirm',
                    name: 'isInitSemanticRelease',
                    message: '是否初始化 semantic-release？',
                    default(answers: InitAnswers) {
                        const { isPublishToNpm } = answers
                        return isPublishToNpm
                    },
                    when(answers: InitAnswers) {
                        return answers.isOpenSource
                    },
                },
                {
                    type: 'confirm',
                    name: 'isInitHusky',
                    message: '是否初始化 husky？',
                    default(answers: InitAnswers) {
                        const { isPublishToNpm } = answers
                        return isPublishToNpm
                    },
                    when(answers: InitAnswers) {
                        return answers.isOpenSource
                    },
                },
                {
                    type: 'list',
                    name: 'isInitTest',
                    message: '请选择测试框架',
                    choices() {
                        return ['vitest', 'jest', 'none']
                    },
                    default(answers: InitAnswers) {
                        return answers.isPublishToNpm ? 'vitest' : 'none'
                    },
                    when(answers: InitAnswers) {
                        return answers.isOpenSource
                    },
                },
                {
                    type: 'confirm',
                    name: 'isInitReadme',
                    message: '是否初始化 README.md ？',
                    default: true,
                    when(answers: InitAnswers) {
                        return answers.isOpenSource
                    },
                },
                {
                    type: 'confirm',
                    name: 'isInitContributing',
                    message: '是否初始化 贡献指南(CONTRIBUTING.md) ？',
                    default(answers: InitAnswers) {
                        return answers.isOpenSource
                    },
                    when(answers: InitAnswers) {
                        return answers.isOpenSource
                    },
                },
                {
                    type: 'confirm',
                    name: 'isRemoveDependabot',
                    message: '是否移除 github-dependabot ？',
                    default: false,
                    when(answers: InitAnswers) {
                        return answers.isOpenSource
                    },
                },
                {
                    type: 'confirm',
                    name: 'isRemoveYarn',
                    message: '是否移除 yarn ？',
                    default: true,
                    when(answers: InitAnswers) {
                        return answers.isOpenSource
                    },
                },
                {
                    type: 'confirm',
                    name: 'isEnableStarHistory',
                    message: '是否启用 Star History ？',
                    default(answers: InitAnswers) {
                        return answers.isOpenSource
                    },
                    when(answers: InitAnswers) {
                        return answers.isOpenSource
                    },
                },
                {
                    type: 'confirm',
                    name: 'isEnableSupport',
                    message: '是否启用赞助支持 ？',
                    default(answers: InitAnswers) {
                        return answers.isOpenSource
                    },
                    when(answers: InitAnswers) {
                        return answers.isOpenSource
                    },
                },
            ]
            const answers = await inquirer.prompt(questions as any) as InitAnswers
            // 保存 AI 建议到 answers 中
            if (aiSuggestion) {
                answers.aiGeneratedNames = aiSuggestion.names
                answers.aiGeneratedDescription = aiSuggestion.description
                answers.aiGeneratedKeywords = aiSuggestion.keywords
                answers.aiRecommendedTemplate = aiSuggestion.template
            }
            return answers
        },
        actions() {
            const actions: ActionType[] = []
            actions.push({
                type: 'initProject',
            })
            return actions
        },
    })
}

