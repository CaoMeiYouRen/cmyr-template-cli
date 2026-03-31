import { describe, expect, it, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { chatCompletion, getAIProjectSuggestion } from '@/utils/ai-api'
import { TemplateCliConfig } from '@/types/interfaces'

// Mock axios
vi.mock('axios')

describe('utils/ai-api', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('chatCompletion', () => {
        it('should call OpenAI-compatible API and return content', async () => {
            const mockResponse = {
                data: {
                    choices: [
                        {
                            message: {
                                content: 'Test response content',
                            },
                        },
                    ],
                },
            }
            vi.mocked(axios.post).mockResolvedValue(mockResponse)

            const result = await chatCompletion({
                prompt: 'Test prompt',
                apiKey: 'test-key',
                apiBase: 'https://api.openai.com/v1',
                model: 'gpt-4',
            })

            expect(result).toBe('Test response content')
            expect(axios.post).toHaveBeenCalledWith(
                'https://api.openai.com/v1/chat/completions',
                expect.objectContaining({
                    model: 'gpt-4',
                    messages: [{ role: 'user', content: 'Test prompt' }],
                    temperature: 0.7,
                }),
                expect.objectContaining({
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer test-key',
                    },
                    timeout: 30000,
                }),
            )
        })

        it('should throw error when apiKey is missing', async () => {
            await expect(
                chatCompletion({
                    prompt: 'Test',
                }),
            ).rejects.toThrow('AI_API_KEY is required')
        })

        it('should throw error for non-https URL (except localhost)', async () => {
            await expect(
                chatCompletion({
                    prompt: 'Test',
                    apiKey: 'test-key',
                    apiBase: 'http://api.example.com/v1',
                }),
            ).rejects.toThrow('must use HTTPS')
        })

        it('should allow http for localhost', async () => {
            const mockResponse = {
                data: {
                    choices: [{ message: { content: 'Local response' } }],
                },
            }
            vi.mocked(axios.post).mockResolvedValue(mockResponse)

            await expect(
                chatCompletion({
                    prompt: 'Test',
                    apiKey: 'test-key',
                    apiBase: 'http://localhost:11434/v1',
                }),
            ).resolves.toBe('Local response')
        })

        it('should throw error on timeout', async () => {
            const timeoutError = new Error('timeout of 30000ms exceeded')
            ;(timeoutError as any).code = 'ECONNABORTED'
            ;(timeoutError as any).isAxiosError = true
            vi.mocked(axios.post).mockRejectedValue(timeoutError)
            vi.spyOn(axios, 'isAxiosError').mockReturnValue(true)

            await expect(
                chatCompletion({
                    prompt: 'Test',
                    apiKey: 'test-key',
                }),
            ).rejects.toThrow('timed out after 30 seconds')
        })

        it('should throw error on 401 authentication failure', async () => {
            const authError = {
                isAxiosError: true,
                message: 'Request failed with status code 401',
                response: { status: 401, data: {} },
            } as any
            vi.mocked(axios.post).mockRejectedValue(authError)
            vi.spyOn(axios, 'isAxiosError').mockReturnValue(true)

            await expect(
                chatCompletion({
                    prompt: 'Test',
                    apiKey: 'invalid-key',
                }),
            ).rejects.toThrow('authentication failed')
        })

        it('should throw error on 429 rate limit', async () => {
            const rateLimitError = {
                isAxiosError: true,
                message: 'Request failed with status code 429',
                response: { status: 429, data: {} },
            } as any
            vi.mocked(axios.post).mockRejectedValue(rateLimitError)
            vi.spyOn(axios, 'isAxiosError').mockReturnValue(true)

            await expect(
                chatCompletion({
                    prompt: 'Test',
                    apiKey: 'test-key',
                }),
            ).rejects.toThrow('rate limit exceeded')
        })

        it('should throw error when response content is missing', async () => {
            vi.mocked(axios.post).mockResolvedValue({
                data: { choices: [] },
            })

            await expect(
                chatCompletion({
                    prompt: 'Test',
                    apiKey: 'test-key',
                }),
            ).rejects.toThrow('missing content')
        })

        it('should use default values for optional parameters', async () => {
            const mockResponse = {
                data: {
                    choices: [{ message: { content: 'Default response' } }],
                },
            }
            vi.mocked(axios.post).mockResolvedValue(mockResponse)

            await chatCompletion({
                prompt: 'Test',
                apiKey: 'test-key',
            })

            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/chat/completions'),
                expect.objectContaining({
                    model: 'gpt-4o-mini',
                    temperature: 0.7,
                }),
                expect.anything(),
            )
        })
    })

    describe('getAIProjectSuggestion', () => {
        const mockConfig: TemplateCliConfig = {
            GITHUB_TOKEN: '',
            GITEE_TOKEN: '',
            GITHUB_USERNAME: '',
            GITEE_USERNAME: '',
            AFDIAN_USERNAME: '',
            PATREON_USERNAME: '',
            WEIBO_USERNAME: '',
            TWITTER_USERNAME: '',
            NPM_USERNAME: '',
            DOCKER_USERNAME: '',
            DOCKER_PASSWORD: '',
            CONTACT_EMAIL: '',
            NPM_TOKEN: '',
            AI_API_KEY: 'test-key',
            AI_API_BASE: 'https://api.openai.com/v1',
            AI_MODEL: 'gpt-4',
        }

        it('should return parsed AI suggestion', async () => {
            const aiResponse = JSON.stringify({
                names: ['my-tool', 'file-cli'],
                description: 'A CLI tool for file management',
                keywords: ['cli', 'file', 'tool'],
                template: 'ts-template',
            })

            const mockResponse = {
                data: {
                    choices: [{ message: { content: aiResponse } }],
                },
            }
            vi.mocked(axios.post).mockResolvedValue(mockResponse)

            const result = await getAIProjectSuggestion('Create a file manager CLI', mockConfig)

            expect(result).toEqual({
                names: ['my-tool', 'file-cli'],
                description: 'A CLI tool for file management',
                keywords: ['cli', 'file', 'tool'],
                template: 'ts-template',
            })
        })

        it('should throw error when AI_API_KEY is missing', async () => {
            const configWithoutKey = { ...mockConfig, AI_API_KEY: undefined }

            await expect(
                getAIProjectSuggestion('Test', configWithoutKey),
            ).rejects.toThrow('AI_API_KEY is not configured')
        })

        it('should throw error when AI response cannot be parsed', async () => {
            const mockResponse = {
                data: {
                    choices: [{ message: { content: 'Invalid response' } }],
                },
            }
            vi.mocked(axios.post).mockResolvedValue(mockResponse)

            await expect(
                getAIProjectSuggestion('Test', mockConfig),
            ).rejects.toThrow('Failed to parse AI response')
        })

        it('should throw error when AI recommends invalid template', async () => {
            const aiResponse = JSON.stringify({
                names: ['test'],
                description: 'Test',
                keywords: ['test'],
                template: 'non-existent-template',
            })

            const mockResponse = {
                data: {
                    choices: [{ message: { content: aiResponse } }],
                },
            }
            vi.mocked(axios.post).mockResolvedValue(mockResponse)

            await expect(
                getAIProjectSuggestion('Test', mockConfig),
            ).rejects.toThrow('AI recommended an invalid template')
        })
    })
})
