import path from 'path'
import { TemplateCliConfig } from '@/types/interfaces'
import { updateAiScaffolding } from '@/utils/ai-scaffolding'

/**
 * 执行 AI 基建更新命令
 * 重新获取资产源 → 清理已移除的精选项 → 复制覆盖快照 → 更新植入清单
 *
 * @param projectPath 目标项目路径（默认当前目录）
 * @param config CLI 全局配置（可选，用于读取 AI 技能资产源）
 */
export async function aiUpdateCommand(
    projectPath: string,
    config?: TemplateCliConfig,
): Promise<void> {
    await updateAiScaffolding(path.resolve(projectPath), config)
}
