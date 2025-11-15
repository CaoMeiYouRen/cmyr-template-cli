import { cloneDeep } from 'lodash'
import { IPackage } from '@/types/interfaces'

export interface WorkflowPlan {
    filesToCopy: string[]
    filesToRemove: string[]
}

export interface WorkflowOptions {
    isInitSemanticRelease: boolean
}

export function buildWorkflowPlan(options: WorkflowOptions): WorkflowPlan {
    const filesToCopy = ['.github/workflows/test.yml', '.github/workflows/todo.yml']
    const filesToRemove = ['.github/workflows/auto-merge.yml', '.github/release.yml']
    const releaseWorkflow = '.github/workflows/release.yml'
    if (options.isInitSemanticRelease) {
        filesToCopy.push(releaseWorkflow)
    } else {
        filesToRemove.push(releaseWorkflow)
    }
    return { filesToCopy, filesToRemove }
}

export interface DependabotRemovalOptions {
    isOpenSource: boolean
    isRemoveDependabot?: boolean
}

export function shouldRemoveDependabot(options: DependabotRemovalOptions): boolean {
    return !options.isOpenSource || Boolean(options.isRemoveDependabot)
}

export interface DependabotSchedule {
    interval: string
    time: string
    timezone: string
}
export interface DependabotIgnore {
    'dependency-name': string
    versions?: string[]
}
export interface DependabotUpdate {
    'package-ecosystem': string
    directory: string
    'open-pull-requests-limit': number
    schedule: DependabotSchedule
    ignore?: DependabotIgnore[]
}
export interface DependabotConfig {
    version: number
    updates: DependabotUpdate[]
}

export interface DependabotAdjustParams {
    dependabot: DependabotConfig
    pkg: IPackage
}

export function adjustDependabotConfig(params: DependabotAdjustParams): DependabotConfig {
    const next = cloneDeep(params.dependabot)
    const npmUpdate = next.updates?.find((update) => update['package-ecosystem'] === 'npm')
    if (npmUpdate) {
        npmUpdate.schedule ??= { interval: 'monthly', time: '04:00', timezone: 'Asia/Shanghai' }
        npmUpdate.schedule.interval = 'monthly'
        npmUpdate.schedule.time = '04:00'
        npmUpdate.schedule.timezone = 'Asia/Shanghai'

        const needsArtTemplateIgnore = Boolean(params.pkg?.dependencies?.['art-template'])
        const currentIgnores = npmUpdate.ignore ?? []
        const hasArtTemplateIgnore = currentIgnores.some((item) => item['dependency-name'] === 'art-template')
        if (needsArtTemplateIgnore && !hasArtTemplateIgnore) {
            currentIgnores.push({
                'dependency-name': 'art-template',
                versions: ['>= 4.13.3'],
            })
        }
        npmUpdate.ignore = needsArtTemplateIgnore ? currentIgnores : undefined
    }

    const hasGithubActionsUpdate = next.updates?.some((update) => update['package-ecosystem'] === 'github-actions')
    if (!hasGithubActionsUpdate) {
        next.updates.push({
            'package-ecosystem': 'github-actions',
            directory: '/',
            'open-pull-requests-limit': 20,
            schedule: {
                interval: 'monthly',
                time: '04:00',
                timezone: 'Asia/Shanghai',
            },
        })
    }

    return next
}
