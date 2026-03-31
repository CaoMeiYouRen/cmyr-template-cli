import { describe, expect, it } from 'vitest'
import { buildProjectSuggestionPrompt, parseAIResponse, getAIFilesToGenerate } from '@/pure/ai'
import type { TemplateMeta } from '@/types/interfaces'

describe('pure/ai', () => {
    describe('buildProjectSuggestionPrompt', () => {
        const mockTemplates: TemplateMeta[] = [
            { name: 'ts-template', language: 'typescript', runtime: 'nodejs' },
            { name: 'vite-latest-template', language: 'vue', runtime: 'browser' },
        ]

        it('should build prompt with user input and templates', () => {
            const userInput = 'Create a CLI tool for file management'
            const prompt = buildProjectSuggestionPrompt(userInput, mockTemplates)

            expect(prompt).toContain('用户描述：Create a CLI tool for file management')
            expect(prompt).toContain('- ts-template (typescript, nodejs)')
            expect(prompt).toContain('- vite-latest-template (vue, browser)')
            expect(prompt).toContain('"names": ["name-1", "name-2", "name-3"]')
        })

        it('should throw TypeError for non-string input', () => {
            expect(() => buildProjectSuggestionPrompt(123 as unknown as string, mockTemplates))
                .toThrow(TypeError)
        })

        it('should throw Error for input exceeding max length', () => {
            const longInput = 'a'.repeat(501)
            expect(() => buildProjectSuggestionPrompt(longInput, mockTemplates))
                .toThrow('exceeds maximum length')
        })

        it('should accept input at max length boundary', () => {
            const maxInput = 'a'.repeat(500)
            expect(() => buildProjectSuggestionPrompt(maxInput, mockTemplates))
                .not.toThrow()
        })
    })

    describe('parseAIResponse', () => {
        it('should parse valid JSON response', () => {
            const response = JSON.stringify({
                names: ['my-tool', 'file-manager', 'cli-app'],
                description: '一个用于文件管理的命令行工具',
                keywords: ['cli', 'file', 'management'],
                template: 'ts-template',
            })

            const result = parseAIResponse(response)

            expect(result).toEqual({
                names: ['my-tool', 'file-manager', 'cli-app'],
                description: '一个用于文件管理的命令行工具',
                keywords: ['cli', 'file', 'management'],
                template: 'ts-template',
            })
        })

        it('should parse JSON wrapped in markdown code block', () => {
            const response = '```json\n{"names":["test"],"description":"test","keywords":["t"],"template":"ts"}\n```'

            const result = parseAIResponse(response)

            expect(result).toEqual({
                names: ['test'],
                description: 'test',
                keywords: ['t'],
                template: 'ts',
            })
        })

        it('should parse JSON wrapped in markdown code block without json label', () => {
            const response = '```\n{"names":["test"],"description":"test","keywords":["t"],"template":"ts"}\n```'

            const result = parseAIResponse(response)

            expect(result).toEqual({
                names: ['test'],
                description: 'test',
                keywords: ['t'],
                template: 'ts',
            })
        })

        it('should return null for invalid JSON', () => {
            expect(parseAIResponse('not valid json')).toBeNull()
        })

        it('should return null for missing required fields', () => {
            expect(parseAIResponse('{"names":[]}')).toBeNull()
            expect(parseAIResponse('{"names":["test"],"description":"test","keywords":[],"template":"ts"}')).toBeNull()
        })

        it('should return null for non-string input', () => {
            expect(parseAIResponse(123 as unknown as string)).toBeNull()
        })

        it('should handle whitespace in response', () => {
            const response = `
            {"names": ["test"], "description": "test", "keywords": ["t"], "template": "ts"}
            `

            const result = parseAIResponse(response)

            expect(result).toEqual({
                names: ['test'],
                description: 'test',
                keywords: ['t'],
                template: 'ts',
            })
        })
    })

    describe('getAIFilesToGenerate', () => {
        it('should return files for claude tool', () => {
            const files = getAIFilesToGenerate(['claude'])
            expect(files).toEqual(['AGENTS.md', '.claude/settings.json'])
        })

        it('should return files for copilot tool', () => {
            const files = getAIFilesToGenerate(['copilot'])
            expect(files).toEqual(['.github/copilot-instructions.md'])
        })

        it('should return files for cursor tool', () => {
            const files = getAIFilesToGenerate(['cursor'])
            expect(files).toEqual(['.cursorrules', '.cursor/'])
        })

        it('should return files for windsurf tool', () => {
            const files = getAIFilesToGenerate(['windsurf'])
            expect(files).toEqual(['.windsurfrules'])
        })

        it('should combine files for multiple tools', () => {
            const files = getAIFilesToGenerate(['claude', 'copilot'])
            expect(files).toContain('AGENTS.md')
            expect(files).toContain('.claude/settings.json')
            expect(files).toContain('.github/copilot-instructions.md')
        })

        it('should throw TypeError for non-array input', () => {
            expect(() => getAIFilesToGenerate('claude' as unknown as ['claude']))
                .toThrow(TypeError)
        })

        it('should return empty array for empty input', () => {
            const files = getAIFilesToGenerate([])
            expect(files).toEqual([])
        })
    })
})
