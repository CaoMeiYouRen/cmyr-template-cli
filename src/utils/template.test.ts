import { describe, expect, it } from 'vitest'
import { getTemplateMeta } from './template'

describe('getTemplateMeta', () => {
    it('returns metadata for a known template name', () => {
        const meta = getTemplateMeta('ts-template')
        expect(meta).toBeDefined()
        expect(meta?.runtime).toBe('nodejs')
        expect(meta?.language).toBe('typescript')
    })

    it('returns undefined for unknown template names', () => {
        expect(getTemplateMeta('non-existent-template')).toBeUndefined()
    })

    it('treats invalid input values as missing templates', () => {
        expect(getTemplateMeta(null as unknown as string)).toBeUndefined()
        expect(getTemplateMeta('' as string)).toBeUndefined()
    })
})
