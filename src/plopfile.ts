import path from 'path'
import { NodePlopAPI, ActionType } from 'plop'
import { QuestionCollection, Answers } from 'inquirer'
import { __DEV__ } from './env'
import { InitAnswers } from './interfaces'
import { downloadGitRepo, getGitUserName, init } from './utils'

module.exports = function (plop: NodePlopAPI) {
    plop.setActionType('initProject', async (answers: InitAnswers) => {
        const { name, template } = answers
        const projectPath = path.join(process.cwd(), name)
        await downloadGitRepo(`CaoMeiYouRen/${template}`, projectPath)
        await init(projectPath, answers)
        return '- 下载项目模板成功！'
    })
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
                    name: 'isRemoveDependabot',
                    message: '是否移除 github-dependabot ？',
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

