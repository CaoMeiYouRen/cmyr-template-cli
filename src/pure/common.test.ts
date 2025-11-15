import { describe, expect, it } from 'vitest'
import { cleanText, sortKey } from './common'

describe('cleanText', () => {
    it('duplicates hyphens and underscores to keep markdown literal', () => {
        expect(cleanText('foo-bar_baz')).toBe('foo--bar__baz')
    })

    it('returns the same string when no replacements are necessary', () => {
        expect(cleanText('hello world')).toBe('hello world')
    })

    it('handles empty strings without throwing', () => {
        expect(cleanText('')).toBe('')
    })

    it('throws when the input is not a string', () => {
        expect(() => cleanText(null as unknown as string)).toThrow(TypeError)
    })
})

describe('sortKey', () => {
    it('returns a new object with keys sorted alphabetically', () => {
        const source = { zebra: 1, apple: 2, mike: 3 }
        const sorted = sortKey(source)
        expect(Object.keys(sorted)).toEqual(['apple', 'mike', 'zebra'])
        expect(sorted).toEqual({ apple: 2, mike: 3, zebra: 1 })
        expect(sorted).not.toBe(source)
    })

    it('preserves nested values while sorting keys', () => {
        const nested = { b: [1, 2], a: { x: 1 }, c: 'end' }
        const sorted = sortKey(nested)
        expect(sorted).toEqual({ a: { x: 1 }, b: [1, 2], c: 'end' })
        expect(sorted.a).toEqual({ x: 1 })
        expect(sorted.b).toEqual([1, 2])
    })

    it('returns an empty object when input is empty', () => {
        expect(sortKey({})).toEqual({})
    })

    it('throws when input is not an object record', () => {
        expect(() => sortKey(null as unknown as Record<string, unknown>)).toThrow(TypeError)
    })
})
