import path from 'path'
import { NodePlopAPI, ActionType } from 'plop'
import { __DEV__ } from './env'
import { downloadGitRepo, init } from './utils'

module.exports = function (plop: NodePlopAPI) {
    plop.setActionType('initProject', async (answers: any, config) => {
        const name = answers.name as string
        const author = answers.author as string
        const template = answers.template as string
        const projectPath = path.join(process.cwd(), name)
        await downloadGitRepo(`github:CaoMeiYouRen/${template}`, projectPath)
        await init(projectPath, {
            name,
            author,
        })
        return '- 下载项目模板成功！'
    })
    plop.setGenerator('create', {
        description: '草梅项目创建器',
        prompts: [
            {
                type: 'input',
                name: 'name',
                message: '请输入项目名称',
                validate(input: string, answers) {
                    return input.trim().length !== 0
                },
                default: __DEV__ ? 'temp' : '',
                filter: (e: string) => e.trim(),
            },
            {
                type: 'input',
                name: 'author',
                message: '请输入作者名称',
                validate(input: string, answers) {
                    return input.trim().length !== 0
                },
                default: __DEV__ ? 'CaoMeiYouRen' : '',
                // default: 'CaoMeiYouRen',
                filter: (e: string) => e.trim(),
            },
            {
                type: 'list',
                name: 'template',
                message: '请选择项目模板',
                choices({ projectType }) {
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
            },
        ],
        actions(answers) {
            const actions: ActionType[] = []
            actions.push({
                type: 'initProject',
            })
            return actions
        },
    })
}
