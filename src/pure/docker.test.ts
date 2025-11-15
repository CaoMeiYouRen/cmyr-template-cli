import { describe, expect, it } from 'vitest'
import { buildDockerPlan, shouldCopyDockerMinifyScript } from './docker'
import { TemplateMeta } from '@/types/interfaces'

describe('buildDockerPlan', () => {
    const baseMeta: TemplateMeta = {
        name: 'demo',
        language: 'typescript',
        runtime: 'nodejs',
    }

    it('handles hono template as special case', () => {
        expect(buildDockerPlan({ templateName: 'hono-template', templateMeta: baseMeta })).toEqual({ mode: 'hono' })
    })

    it('returns java ejs plan when runtime is java', () => {
        expect(buildDockerPlan({ templateName: 'java-template', templateMeta: { ...baseMeta, runtime: 'java' } })).toEqual({ mode: 'java-ejs', templateRelativePath: 'java/Dockerfile.ejs' })
    })

    it('falls back to default template otherwise', () => {
        expect(buildDockerPlan({ templateName: 'other', templateMeta: { ...baseMeta, runtime: 'browser' } })).toEqual({ mode: 'default', templateRelativePath: 'Dockerfile' })
    })
})

describe('shouldCopyDockerMinifyScript', () => {
    it('returns true for node runtime', () => {
        const meta = { name: 'demo', language: 'typescript', runtime: 'nodejs' } as TemplateMeta
        expect(shouldCopyDockerMinifyScript(meta)).toBe(true)
    })

    it('returns false for other runtimes', () => {
        const meta = { name: 'demo', language: 'typescript', runtime: 'python' } as TemplateMeta
        expect(shouldCopyDockerMinifyScript(meta)).toBe(false)
    })
})
