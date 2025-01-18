import { lintMarkdown, LintMdRulesConfig } from '@lint-md/core'

export function kebabCase(str: string) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/_+/g, '-').replace(/\s+/g, '-').toLowerCase()
}

const fix = (markdown: string, rules?: LintMdRulesConfig) => lintMarkdown(markdown, rules, true)?.fixedResult?.result

/**
 * 修复 markdown 格式
 * @param markdown
 * @returns
 */
export function lintMd(markdown: string) {
    const rules = {
        'no-empty-code': 0,
        'no-trailing-punctuation': 0,
        'no-long-code': 0,
        'no-empty-code-lang': 0,
        'no-empty-inlinecode': 0,
    } as const
    const fixed = fix(markdown, rules)
    return fixed
}
