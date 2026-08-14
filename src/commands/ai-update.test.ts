import path from 'path'
import { describe, expect, it, vi } from 'vitest'
import { aiUpdateCommand } from '@/commands/ai-update'

vi.mock('@/utils/ai-scaffolding', () => ({
    updateAiScaffolding: vi.fn(),
}))

import { updateAiScaffolding } from '@/utils/ai-scaffolding'

const updateAiScaffoldingMock = vi.mocked(updateAiScaffolding)

describe('aiUpdateCommand', () => {
    it('should call updateAiScaffolding with resolved path and config', async () => {
        updateAiScaffoldingMock.mockResolvedValue(undefined)

        await aiUpdateCommand('./temp/project', { AI_SKILLS_REPOSITORY: 'user/repo' } as any)

        expect(updateAiScaffoldingMock).toHaveBeenCalledWith(
            path.resolve('./temp/project'),
            { AI_SKILLS_REPOSITORY: 'user/repo' },
        )
    })

    it('should work without config', async () => {
        updateAiScaffoldingMock.mockResolvedValue(undefined)

        await aiUpdateCommand('/tmp/project')

        expect(updateAiScaffoldingMock).toHaveBeenCalledWith(path.resolve('/tmp/project'), undefined)
    })

    it('should propagate errors', async () => {
        updateAiScaffoldingMock.mockRejectedValue(new Error('update failed'))

        await expect(aiUpdateCommand('/tmp/project')).rejects.toThrow('update failed')
    })
})
