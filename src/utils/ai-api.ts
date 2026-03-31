import axios, { AxiosError } from 'axios'
import { TEMPLATES_META_LIST } from '@/core/constants'
import { AICompletionRequest, AIProjectSuggestion, TemplateCliConfig } from '@/types/interfaces'
import { buildProjectSuggestionPrompt, parseAIResponse } from '@/pure/ai'

const AI_TIMEOUT = 30 * 1000 // 30 seconds

const DEFAULT_API_BASE = 'https://api.openai.com/v1'
const DEFAULT_MODEL = 'gpt-4o-mini'

/**
 * 通用 AI Chat Completions 调用
 * 兼容 OpenAI Chat Completions API 格式
 *
 * @param request - AI 完成请求参数
 * @returns AI 返回的内容文本
 * @throws 当 API 调用失败时抛出错误
 */
export async function chatCompletion(request: AICompletionRequest): Promise<string> {
    const {
        prompt,
        apiKey,
        apiBase = DEFAULT_API_BASE,
        model = DEFAULT_MODEL,
        temperature = 0.7,
    } = request

    if (!apiKey) {
        throw new Error('AI_API_KEY is required. Please configure it in your .ctrc file.')
    }

    // 确保 apiBase 以 /v1 或 / 结尾，并构造完整端点
    const baseUrl = apiBase.replace(/\/+$/, '')
    const endpoint = `${baseUrl}/chat/completions`

    // 验证 URL 协议（localhost 允许 http，其他必须 https）
    const url = new URL(endpoint)
    const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1'
    if (!isLocalhost && url.protocol !== 'https:') {
        throw new Error('AI_API_BASE must use HTTPS for security (except for localhost)')
    }

    try {
        const response = await axios.post(
            endpoint,
            {
                model,
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                },
                timeout: AI_TIMEOUT,
            },
        )

        const content = response.data?.choices?.[0]?.message?.content
        if (typeof content !== 'string') {
            throw new Error('Invalid AI response: missing content')
        }

        return content
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError

            if (axiosError.code === 'ECONNABORTED' || axiosError.message.includes('timeout')) {
                throw new Error(`AI API request timed out after ${AI_TIMEOUT / 1000} seconds. Please try again.`)
            }

            if (axiosError.response?.status === 401) {
                throw new Error('AI API authentication failed. Please check your AI_API_KEY in .ctrc file.')
            }

            if (axiosError.response?.status === 429) {
                throw new Error('AI API rate limit exceeded. Please try again later.')
            }

            const message = axiosError.response?.data || axiosError.message
            throw new Error(`AI API request failed: ${JSON.stringify(message)}`)
        }

        throw new Error(`AI API request failed: ${error instanceof Error ? error.message : String(error)}`)
    }
}

/**
 * 调用 AI API 获取项目建议
 * 根据用户描述生成项目名称、描述、关键词和推荐模板
 *
 * @param userInput - 用户的项目功能描述
 * @param config - CLI 配置，包含 AI API 相关配置
 * @returns AI 生成的项目建议
 * @throws 当配置缺失或 AI 调用失败时抛出错误
 */
export async function getAIProjectSuggestion(
    userInput: string,
    config: TemplateCliConfig,
): Promise<AIProjectSuggestion> {
    const { AI_API_BASE, AI_API_KEY, AI_MODEL } = config

    if (!AI_API_KEY) {
        throw new Error(
            'AI_API_KEY is not configured. Please add it to your .ctrc file:\n'
            + '  "AI_API_KEY": "your-api-key-here"',
        )
    }

    // 构建 prompt
    const prompt = buildProjectSuggestionPrompt(userInput, TEMPLATES_META_LIST)

    // 调用 AI API
    const response = await chatCompletion({
        prompt,
        apiKey: AI_API_KEY,
        apiBase: AI_API_BASE,
        model: AI_MODEL,
    })

    // 解析响应
    const suggestion = parseAIResponse(response)
    if (!suggestion) {
        throw new Error(
            'Failed to parse AI response. The AI may have returned an invalid format. '
            + 'Please try again or contact support if the issue persists.',
        )
    }

    // 验证推荐的模板是否在可用列表中
    const isValidTemplate = TEMPLATES_META_LIST.some((t) => t.name === suggestion.template)
    if (!isValidTemplate) {
        throw new Error(
            `AI recommended an invalid template: "${suggestion.template}". `
            + `Please try again or select a template manually.`,
        )
    }

    return suggestion
}
