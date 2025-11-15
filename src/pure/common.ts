import { sortBy } from 'lodash'

/**
 * 转义 markdown/ejs 环境可能需要的文本，避免下划线与连字符被误解析。
 */
export function cleanText(text: string): string {
    if (typeof text !== 'string') {
        throw new TypeError('cleanText expects a string input')
    }
    return text.replace(/-/g, '--').replace(/_/g, '__')
}

/**
 * 返回一个键排序后的新对象，保证 deterministic 的字段顺序。
 */
export function sortKey<T extends Record<string, unknown>>(obj: T): T {
    if (!obj || typeof obj !== 'object') {
        throw new TypeError('sortKey expects a record object')
    }
    const entries = Object.entries(obj)
    const sorted = sortBy(entries, ([key]) => key)
    return sorted.reduce((acc, [key, value]) => {
        acc[key as keyof T] = value as T[keyof T]
        return acc
    }, {} as T)
}
