import { describe, expect, it } from 'vitest'
import { cleanText, sortKey } from './utils'

describe('cleanText', () => {
    it('escapes dashes and underscores for template usage', () => {
        expect(cleanText('MIT-License')).toBe('MIT--License')
        expect(cleanText('snake_case_value')).toBe('snake__case__value')
    })

    it('returns an empty string unchanged', () => {
        expect(cleanText('')).toBe('')
    })

    it('throws when provided a non-string value', () => {
        expect(() => cleanText(null as unknown as string)).toThrow(TypeError)
    })
})

describe('sortKey', () => {
    it('returns a new object with keys sorted lexicographically', () => {
        const input = { z: 1, a: 2, m: 3 }
        const result = sortKey(input)
        expect(Object.keys(result)).toEqual(['a', 'm', 'z'])
        expect(result).not.toBe(input)
    })

    it('does not mutate the original object', () => {
        const input = { b: 1, a: 2 }
        const clone = { ...input }
        sortKey(input)
        expect(input).toEqual(clone)
    })

    it('handles empty objects as an edge case', () => {
        expect(sortKey({})).toEqual({})
    })

    it('throws a TypeError when the input is not an object', () => {
        expect(() => sortKey(null as unknown as Record<string, unknown>)).toThrow(TypeError)
    })
})
