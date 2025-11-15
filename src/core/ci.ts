import path from 'path'
import fs from 'fs-extra'
import ora from 'ora'
import yaml from 'yaml'
import { InitAnswers, IPackage } from '@/types/interfaces'
import { copyFilesFromTemplates, removeFiles } from '@/utils/files'
import { readPackageJson } from '@/utils/package-json'
import { adjustDependabotConfig, buildWorkflowPlan, shouldRemoveDependabot, DependabotConfig } from '@/pure/ci'

export async function initGithubWorkflows(projectPath: string, answers: InitAnswers) {
    const loading = ora('正在初始化 Github Workflows ……').start()
    try {
        const plan = buildWorkflowPlan({ isInitSemanticRelease: answers.isInitSemanticRelease })
        const dir = path.join(projectPath, '.github/workflows')
        if (!await fs.pathExists(dir)) {
            await fs.mkdirp(dir)
        }
        if (plan.filesToRemove.length) {
            await removeFiles(projectPath, plan.filesToRemove)
        }
        if (plan.filesToCopy.length) {
            await copyFilesFromTemplates(projectPath, plan.filesToCopy)
        }
        loading.succeed('Github Workflows 初始化成功！')
    } catch (error) {
        loading.fail('Github Workflows 初始化失败！')
        console.error(error)
    }
}

const DEPENDABOT_FILES = ['.github/dependabot.yml', '.github/mergify.yml']

export async function initDependabot(projectPath: string, answers: InitAnswers) {
    try {
        if (shouldRemoveDependabot({ isOpenSource: answers.isOpenSource, isRemoveDependabot: answers.isRemoveDependabot })) {
            await removeFiles(projectPath, DEPENDABOT_FILES)
            return
        }
        const dependabotPath = path.join(projectPath, '.github/dependabot.yml')
        if (!await fs.pathExists(dependabotPath)) {
            return
        }
        const pkg: IPackage = await readPackageJson(projectPath)
        const dependabot: DependabotConfig = yaml.parse(await fs.readFile(dependabotPath, 'utf-8'))
        const updated = adjustDependabotConfig({ dependabot, pkg })
        await fs.writeFile(dependabotPath, yaml.stringify(updated))
    } catch (error) {
        console.error(error)
    }
}
