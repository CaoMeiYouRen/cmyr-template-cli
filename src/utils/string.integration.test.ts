import { describe, expect, it } from 'vitest'
import { lintMd } from './string'

describe('lintMd（真实 @lint-md/core）', () => {
    it('使用内置规则名时不会抛出异常', () => {
        const markdown = '一个基于 Vue 3 和 Reka UI 的组件库，强调组件与样式解耦。'
        expect(() => lintMd(markdown)).not.toThrow()
        expect(typeof lintMd(markdown)).toBe('string')
    })
})
