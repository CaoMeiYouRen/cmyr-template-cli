import { describe, expect, it } from 'vitest'
import { buildRepositorySecretsPlan, buildRepositoryTopics, detectRemoteService } from './git'
import { TemplateCliConfig, TemplateMeta } from '@/types/interfaces'

describe('detectRemoteService', () => {
    it('identifies github urls', () => {
        expect(detectRemoteService('git@github.com:foo/bar.git')).toBe('github')
    })

    it('identifies gitee urls', () => {
        expect(detectRemoteService('https://gitee.com/foo/bar.git')).toBe('gitee')
    })

    it('returns unknown for other urls', () => {
        expect(detectRemoteService('git@selfhosted.com/foo.git')).toBe('unknown')
    })

    it('returns unknown for non-string or empty inputs', () => {
        expect(detectRemoteService('')).toBe('unknown')
        expect(detectRemoteService(null as unknown as string)).toBe('unknown')
    })
})

describe('buildRepositoryTopics', () => {
    const baseMeta: TemplateMeta = {
        name: 'ts-template',
        language: 'typescript',
        runtime: 'nodejs',
        docker: true,
        vueVersion: 0,
    }

    it('merges base keywords with template metadata and npm flag', () => {
        const topics = buildRepositoryTopics({
            baseKeywords: ['demo'],
            templateMeta: baseMeta,
            isPublishToNpm: true,
        })
        expect(topics).toEqual(expect.arrayContaining(['demo', 'docker', 'nodejs', 'typescript', 'npm-package']))
    })

    it('deduplicates and kebab-cases topics', () => {
        const topics = buildRepositoryTopics({
            baseKeywords: ['FooBar'],
            templateMeta: { ...baseMeta, tags: ['VuePress', 'FooBar'] },
            isPublishToNpm: false,
        })
        expect(topics).toEqual(expect.arrayContaining(['foo-bar', 'vue-press']))
    })
})

describe('buildRepositorySecretsPlan', () => {
    const templateMeta: TemplateMeta = {
        name: 'docker-app',
        language: 'typescript',
        runtime: 'nodejs',
        docker: true,
    }

    const cliConfig: TemplateCliConfig = {
        GITHUB_TOKEN: '',
        GITEE_TOKEN: '',
        GITHUB_USERNAME: '',
        GITEE_USERNAME: '',
        AFDIAN_USERNAME: '',
        PATREON_USERNAME: '',
        WEIBO_USERNAME: '',
        TWITTER_USERNAME: '',
        NPM_USERNAME: '',
        DOCKER_USERNAME: 'user',
        DOCKER_PASSWORD: 'pass',
        CONTACT_EMAIL: '',
        NPM_TOKEN: '',
    }

    it('returns secrets when docker credentials exist', () => {
        expect(buildRepositorySecretsPlan({ templateMeta, cliConfig })).toEqual([
            { name: 'DOCKER_USERNAME', value: 'user' },
            { name: 'DOCKER_PASSWORD', value: 'pass' },
        ])
    })

    it('returns empty array when missing credentials', () => {
        expect(buildRepositorySecretsPlan({ templateMeta, cliConfig: { ...cliConfig, DOCKER_PASSWORD: '' } })).toEqual([])
    })

    it('returns empty array for non-docker templates', () => {
        expect(buildRepositorySecretsPlan({ templateMeta: { ...templateMeta, docker: false }, cliConfig })).toEqual([])
    })
})
