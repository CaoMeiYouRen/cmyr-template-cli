import { describe, expect, it } from 'vitest'
import { buildRepositoryTopics, detectRemoteService } from './git'
import { TemplateMeta } from '@/types/interfaces'

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
