import { TemplateMeta } from '@/types/interfaces'

export type DockerPlanMode = 'hono' | 'java-ejs' | 'node-ejs' | 'python' | 'golang' | 'default'

export interface DockerPlan {
    mode: DockerPlanMode
    templateRelativePath?: string
}

export interface DockerPlanInput {
    templateName: string
    templateMeta?: TemplateMeta
}

export function buildDockerPlan(input: DockerPlanInput): DockerPlan {
    if (input.templateName === 'hono-template') {
        return { mode: 'hono' }
    }
    switch (input.templateMeta?.runtime) {
        case 'java':
            return { mode: 'java-ejs', templateRelativePath: 'java/Dockerfile.ejs' }
        case 'nodejs':
            return { mode: 'node-ejs', templateRelativePath: 'Dockerfile' }
        case 'python':
            return { mode: 'python', templateRelativePath: 'python/Dockerfile' }
        case 'golang':
            return { mode: 'golang', templateRelativePath: 'golang/Dockerfile' }
        default:
            return { mode: 'default', templateRelativePath: 'Dockerfile' }
    }
}

export function shouldCopyDockerMinifyScript(templateMeta?: TemplateMeta): boolean {
    return templateMeta?.runtime === 'nodejs'
}
