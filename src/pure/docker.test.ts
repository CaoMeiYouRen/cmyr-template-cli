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

    it('returns node ejs plan when runtime is nodejs', () => {
        expect(buildDockerPlan({ templateName: 'node-template', templateMeta: baseMeta })).toEqual({ mode: 'node-ejs', templateRelativePath: 'Dockerfile' })
    })

    it('returns python plan when runtime is python', () => {
        expect(buildDockerPlan({ templateName: 'python-template', templateMeta: { ...baseMeta, runtime: 'python' } })).toEqual({ mode: 'python', templateRelativePath: 'python/Dockerfile' })
    })

    it('returns golang plan when runtime is golang', () => {
        expect(buildDockerPlan({ templateName: 'go-template', templateMeta: { ...baseMeta, runtime: 'golang' } })).toEqual({ mode: 'golang', templateRelativePath: 'golang/Dockerfile' })
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

    it('returns false when metadata is missing', () => {
        expect(shouldCopyDockerMinifyScript(undefined)).toBe(false)
    })
})
