import path from 'path'
import fs from 'fs-extra'
import ora from 'ora'
import { InitAnswers } from '@/types/interfaces'
import { copyFilesFromTemplates } from '@/utils/files'
import { ejsRender } from '@/utils/ejs'
import { getTemplateMeta } from '@/utils/template'
import { readPackageJson } from '@/utils/package-json'
import { buildDockerPlan, shouldCopyDockerMinifyScript } from '@/pure/docker'

export async function initDocker(projectPath: string, answers: InitAnswers) {
    const loading = ora('正在初始化 Docker ……').start()
    try {
        if (answers.template === 'hono-template') {
            await handleHonoTemplate(projectPath, answers.name)
            loading.succeed('Docker 初始化成功！')
            return
        }
        const templateMeta = getTemplateMeta(answers.template)
        const plan = buildDockerPlan({ templateName: answers.template, templateMeta })

        const files = ['.dockerignore', 'docker-compose.yml', '.github/workflows/docker.yml']
        await copyFilesFromTemplates(projectPath, files)

        const dockerfilePath = path.join(projectPath, 'Dockerfile')
        if (await fs.pathExists(dockerfilePath)) {
            await fs.remove(dockerfilePath)
        }

        switch (plan.mode) {
            case 'java-ejs':
                await renderDockerfile(path.join(__dirname, '../templates/', plan.templateRelativePath), dockerfilePath, { javaVersion: templateMeta?.javaVersion })
                break
            case 'node-ejs':
                await renderNodeDockerfile(projectPath, dockerfilePath, plan.templateRelativePath)
                if (shouldCopyDockerMinifyScript(templateMeta)) {
                    const scriptsDir = path.join(projectPath, 'scripts')
                    if (!await fs.pathExists(scriptsDir)) {
                        await fs.mkdir(scriptsDir)
                    }
                    await copyFilesFromTemplates(projectPath, ['scripts/minify-docker.mjs'])
                }
                break
            default:
                await copyDockerfile(plan.templateRelativePath, dockerfilePath)
                break
        }
        loading.succeed('Docker 初始化成功！')
    } catch (error) {
        loading.fail('Docker 初始化失败！')
        console.error(error)
    }
}

async function handleHonoTemplate(projectPath: string, projectName: string) {
    const dockerComposePath = path.join(projectPath, 'docker-compose.yml')
    if (await fs.pathExists(dockerComposePath)) {
        let dockerCompose = await fs.readFile(dockerComposePath, 'utf-8')
        dockerCompose = dockerCompose.replaceAll('hono-template', projectName)
        await fs.writeFile(dockerComposePath, dockerCompose)
    }
    const wranglerPath = path.join(projectPath, 'wrangler.toml')
    if (await fs.pathExists(wranglerPath)) {
        let wrangler = await fs.readFile(wranglerPath, 'utf-8')
        wrangler = wrangler.replaceAll('hono-template', projectName)
        await fs.writeFile(wranglerPath, wrangler)
    }
}

async function renderDockerfile(templatePath: string, destination: string, data: Record<string, unknown>) {
    await ejsRender(templatePath, data, destination)
}

async function renderNodeDockerfile(projectPath: string, destination: string, templateRelativePath?: string) {
    const pkg = await readPackageJson(projectPath)
    const templatePath = path.join(__dirname, '../templates/', templateRelativePath ?? 'Dockerfile')
    await ejsRender(templatePath, { mainFile: pkg?.main }, destination)
}

async function copyDockerfile(templateRelativePath: string | undefined, destination: string) {
    const templatePath = path.join(__dirname, '../templates/', templateRelativePath ?? 'Dockerfile')
    await fs.copyFile(templatePath, destination)
}
