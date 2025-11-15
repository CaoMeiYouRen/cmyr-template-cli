import { describe, expect, it, vi } from 'vitest'

vi.mock('@lint-md/core', () => {
    return {
        lintMarkdown: vi.fn((markdown: string) => ({
            fixedResult: {
                result: markdown.replace(/\s+/g, ' ').trim(),
            },
        })),
    }
})

import { lintMarkdown } from '@lint-md/core'
import { kebabCase, lintMd } from './string'

describe('kebabCase', () => {
    it('converts camelCase, underscores, and spaces into kebab-case', () => {
        expect(kebabCase('FooBar Baz_qux')).toBe('foo-bar-baz-qux')
    })

    it('returns the original value when already kebab-case', () => {
        expect(kebabCase('already-hyphenated')).toBe('already-hyphenated')
    })

    it('handles empty strings as an edge case', () => {
        expect(kebabCase('')).toBe('')
    })

    it('throws when the input is not a string', () => {
        expect(() => kebabCase(null as unknown as string)).toThrow(TypeError)
    })
})

describe('lintMd', () => {
    const lintMarkdownMock = vi.mocked(lintMarkdown)

    it('returns the formatter result for standard markdown content', () => {
        const markdown = '# 标题\n\n一些   文本\n'
        expect(lintMd(markdown)).toBe('# 标题 一些 文本')
        expect(lintMarkdownMock).toHaveBeenCalledWith(markdown, expect.any(Object), true)
    })

    it('propagates undefined when the formatter has no fixed result', () => {
        lintMarkdownMock.mockImplementationOnce(() => ({}) as any)
        expect(lintMd('# 空结果')).toBeUndefined()
    })

    it('throws when the markdown argument is invalid', () => {
        expect(() => lintMd(null as unknown as string)).toThrow(TypeError)
    })
})
