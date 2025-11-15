import { uniq } from 'lodash'
import { TemplateCliConfig, TemplateMeta } from '@/types/interfaces'
import { kebabCase } from '@/utils/string'

export type RemoteService = 'github' | 'gitee' | 'unknown'

export function detectRemoteService(url: string): RemoteService {
    if (typeof url !== 'string' || !url.trim()) {
        return 'unknown'
    }
    if (/github\.com/i.test(url)) {
        return 'github'
    }
    if (/gitee\.com/i.test(url)) {
        return 'gitee'
    }
    return 'unknown'
}

export interface RepositoryTopicsInput {
    baseKeywords: string[]
    templateMeta?: TemplateMeta
    isPublishToNpm: boolean
}

export function buildRepositoryTopics(input: RepositoryTopicsInput): string[] {
    const { baseKeywords = [], templateMeta, isPublishToNpm } = input
    const topics = [...baseKeywords]
    if (isPublishToNpm) {
        topics.push('npm-package')
    }
    if (templateMeta?.docker) {
        topics.push('docker')
    }
    if (templateMeta?.runtime) {
        topics.push(templateMeta.runtime)
    }
    if (templateMeta?.language) {
        topics.push(templateMeta.language)
    }
    if (templateMeta?.vueVersion === 3) {
        topics.push('vue3')
    }
    if (templateMeta?.tags?.length) {
        topics.push(...templateMeta.tags)
    }
    return uniq(topics.map((keyword) => kebabCase(keyword))).filter(Boolean)
}

export interface RepositorySecretsInput {
    templateMeta?: TemplateMeta
    cliConfig?: TemplateCliConfig
}

export interface RepositorySecretPlan {
    name: string
    value: string
}

export function buildRepositorySecretsPlan(input: RepositorySecretsInput): RepositorySecretPlan[] {
    const { templateMeta, cliConfig } = input
    if (!templateMeta?.docker) {
        return []
    }
    const username = cliConfig?.DOCKER_USERNAME
    const password = cliConfig?.DOCKER_PASSWORD
    if (!username || !password) {
        return []
    }
    return [
        { name: 'DOCKER_USERNAME', value: username },
        { name: 'DOCKER_PASSWORD', value: password },
    ]
}
