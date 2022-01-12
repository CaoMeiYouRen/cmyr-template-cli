import { NodePlopAPI, ActionType } from 'plop'
import { QuestionCollection, Answers } from 'inquirer'
import { kebabCase } from 'lodash'
import { __DEV__ } from './env'
import { InitAnswers } from './interfaces'
import { getGitUserName, initProject } from './utils'

module.exports = function (plop: NodePlopAPI) {
    plop.setActionType('initProject', initProject)
    plop.setGenerator('create', {
        description: '草梅项目创建器',
        async prompts(inquirer) {
            const questions: QuestionCollection<Answers> = [
                {
                    type: 'input',
                    name: 'name',
                    message: '请输入项目名称',
                    validate(input: string) {
                        return input.trim().length !== 0
                    },
                    default: __DEV__ ? 'temp' : '',
                    filter: (e: string) => kebabCase(e.trim()),
                    // transformer: (e: string) => kebabCase(e),
                },
                {
                    type: 'input',
                    name: 'description',
                    message: '请输入项目简介',
                    // validate(input: string) {
                    //     return input.trim().length !== 0
                    // },
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
                    type: 'list',
                    name: 'template',
                    message: '请选择项目模板',
                    choices() {
                        return [
                            'vue',
                            'vue3',
                            'vite2',
                            'vite2-vue2',
                            'electron-vue',
                            'nuxt',
                            'uni',
                            'react',
                            'react16',
                            'ts',
                            'express',
                            'koa2',
                            'nest',
                            'auto-release',
                            'rollup',
                            'webpack',
                            'github-action',
                        ].map((e) => `${e}-template`)
                    },
                    default: __DEV__ ? 'ts-template' : '',
                },
                {
                    type: 'confirm',
                    name: 'isOpenSource',
                    message: '是否开源？',
                    default: false,
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
                        // 如果是开源，则默认为 github，如果为闭源，则默认为 gitee
                        if (isOpenSource) {
                            return `git@github.com:${author}/${name}.git`
                        }
                        return `git@gitee.com:caomeiyouren/${name}.git`
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
                        return answers.isOpenSource
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
                    name: 'isEnableAfdian',
                    message: '是否启用爱发电 ？',
                    default: false,
                    when(answers: InitAnswers) {
                        return answers.isOpenSource
                    },
                },
            ]
            return inquirer.prompt(questions)
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

