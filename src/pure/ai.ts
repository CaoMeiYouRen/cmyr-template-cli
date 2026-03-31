import { AIProjectSuggestion, TemplateMeta } from '@/types/interfaces'

const MAX_USER_INPUT_LENGTH = 500

/**
 * 构建 AI 引导 prompt
 * 根据用户输入和可用模板生成项目建议的 AI prompt
 *
 * @param userInput - 用户的项目功能描述
 * @param availableTemplates - 可用的模板列表
 * @returns 构建好的 prompt 字符串
 * @throws {TypeError} 当 userInput 不是字符串时
 * @throws {Error} 当 userInput 超过最大长度限制时
 */
export function buildProjectSuggestionPrompt(
    userInput: string,
    availableTemplates: TemplateMeta[],
): string {
    if (typeof userInput !== 'string') {
        throw new TypeError('buildProjectSuggestionPrompt expects userInput to be a string')
    }
    if (inputValidation(userInput)) {
        throw new Error(`buildProjectSuggestionPrompt: userInput exceeds maximum length of ${MAX_USER_INPUT_LENGTH} characters`)
    }

    const templateList = availableTemplates
        .map((t) => `   - ${t.name} (${t.language}, ${t.runtime})`)
        .join('\n')

    return `你是一个项目初始化助手。根据用户描述的项目功能，生成以下信息：

1. **项目名称**：生成 3 个候选名称，使用 kebab-case 格式，简短且有意义
2. **项目描述**：一段简洁的中文描述（50-100字）
3. **关键词**：3-5 个相关关键词
4. **推荐模板**：从以下模板中选择最合适的一个
${templateList}

用户描述：${userInput}

请以 JSON 格式返回（不要包含 markdown 代码块标记）：
{
  "names": ["name-1", "name-2", "name-3"],
  "description": "项目描述",
  "keywords": ["keyword1", "keyword2"],
  "template": "template-name"
}`
}

/**
 * 验证用户输入长度是否在允许范围内
 *
 * @param userInput - 用户输入
 * @returns 如果输入超过最大长度返回 true，否则返回 false
 */
function inputValidation(userInput: string): boolean {
    return userInput.length > MAX_USER_INPUT_LENGTH
}

/**
 * 解析 AI 返回的 JSON 响应
 * 容错处理：支持 markdown code block 包裹的 JSON
 *
 * @param response - AI 返回的原始响应
 * @returns 解析后的项目建议，解析失败返回 null
 */
export function parseAIResponse(response: string): AIProjectSuggestion | null {
    if (typeof response !== 'string') {
        return null
    }

    try {
        // 尝试提取 JSON 内容（支持 markdown code block 包裹）
        let jsonStr = response.trim()

        // 移除可能的 markdown code block 标记
        const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/
        const match = jsonStr.match(codeBlockRegex)
        if (match && match[1]) {
            jsonStr = match[1].trim()
        }

        const parsed = JSON.parse(jsonStr)

        // 验证必需字段
        if (
            !parsed
            || typeof parsed !== 'object'
            || !Array.isArray(parsed.names)
            || parsed.names.length === 0
            || typeof parsed.description !== 'string'
            || !Array.isArray(parsed.keywords)
            || parsed.keywords.length === 0
            || typeof parsed.template !== 'string'
        ) {
            return null
        }

        return {
            names: parsed.names,
            description: parsed.description,
            keywords: parsed.keywords,
            template: parsed.template,
        }
    } catch {
        return null
    }
}

/**
 * 根据 AI 工具列表确定要生成的文件
 *
 * @param aiTools - 选择的 AI 工具列表
 * @returns 需要生成的文件路径列表
 * @throws {TypeError} 当 aiTools 不是数组时
 */
export function getAIFilesToGenerate(
    aiTools: ('claude' | 'copilot' | 'cursor' | 'windsurf')[],
): string[] {
    if (!Array.isArray(aiTools)) {
        throw new TypeError('getAIFilesToGenerate expects aiTools to be an array')
    }

    const files: string[] = []

    for (const tool of aiTools) {
        switch (tool) {
            case 'claude':
                files.push('AGENTS.md', '.claude/settings.json')
                break
            case 'copilot':
                files.push('.github/copilot-instructions.md')
                break
            case 'cursor':
                files.push('.cursorrules', '.cursor/')
                break
            case 'windsurf':
                files.push('.windsurfrules')
                break
        }
    }

    return files
}
