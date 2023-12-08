import { NodePlopAPI, ActionType } from 'plop'
import { QuestionCollection } from 'inquirer'
import { __DEV__ } from './env'
import { InitAnswers } from './interfaces'
import { COMMON_DEPENDENCIES, getGitUserName, initProject, VUE2_DEPENDENCIES, VUE3_DEPENDENCIES, kebabCase, loadTemplateCliConfig, WEB_DEPENDENCIES, NODE_DEPENDENCIES, getTemplateMeta } from './utils'
import { TEMPLATES_META_LIST } from './constants'
import fs from 'fs-extra'
import path from 'path'

module.exports = function (plop: NodePlopAPI) {
    plop.setActionType('initProject', initProject)
    plop.setGenerator('create', {
        description: '草梅项目创建器',
        async prompts(inquirer) {
            const config = await loadTemplateCliConfig()
            const questions: QuestionCollection<InitAnswers> = [
                {
                    type: 'input',
                    name: 'name',
                    message: '请输入项目名称',
                    validate(input: string) {
                        return input.trim().length !== 0
                    },
                    default: __DEV__ ? 'temp' : '',
                    filter: (e: string) => kebabCase(e.trim()),
                },
                {
                    type: 'input',
                    name: 'description',
                    message: '请输入项目简介',
                    default: __DEV__ ? '' : '',
                    filter: (e: string) => e.trim(),
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
                    message: '请输入项目关键词(用空格分割)',
                    default: '',
                    filter: (e: string) => e.trim().split(' ').filter(Boolean),
                },
                {
                    type: 'list',
                    name: 'template',
                    message: '请选择项目模板',
                    choices() {
                        return TEMPLATES_META_LIST.map((e) => e.name)
                    },
                    default: __DEV__ ? 'ts-template' : '',
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
                {
                    type: 'confirm',
                    name: 'isInitDocker',
                    message: '是否初始化 Docker？',
                    default: false,
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
                    default: false,
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
                    default: false,
                    when(answers: InitAnswers) {
                        const templateMeta = getTemplateMeta(answers.template)
                        return answers.isOpenSource && templateMeta.npm
                    },
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
                        const { isPublishToNpm } = answers
                        return isPublishToNpm
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
                    default: false,
                    when(answers: InitAnswers) {
                        return answers.isOpenSource
                    },
                },
                {
                    type: 'confirm',
                    name: 'isEnableStarHistory',
                    message: '是否启用 Star History ？',
                    default: false,
                    when(answers: InitAnswers) {
                        return answers.isOpenSource
                    },
                },
                {
                    type: 'confirm',
                    name: 'isEnableSupport',
                    message: '是否启用赞助支持 ？',
                    default: false,
                    when(answers: InitAnswers) {
                        return answers.isOpenSource
                    },
                },
            ]
            return inquirer.prompt(questions as any)
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

