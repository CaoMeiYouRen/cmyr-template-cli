import { describe, expect, it } from 'vitest'
import { getTemplateMeta } from './template'

describe('getTemplateMeta', () => {
    it('returns metadata for a known template name', () => {
        const meta = getTemplateMeta('ts-template')
        expect(meta).toBeDefined()
        expect(meta?.runtime).toBe('nodejs')
        expect(meta?.language).toBe('typescript')
    })

    it('throws for unknown template names', () => {
        expect(() => getTemplateMeta('non-existent-template')).toThrow('Unknown template: non-existent-template')
    })

    it('throws for invalid input values', () => {
        expect(() => getTemplateMeta(null as unknown as string)).toThrow('Unknown template: null')
        expect(() => getTemplateMeta('' as string)).toThrow('Unknown template: ')
    })
})
