import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/utils/exec', () => ({
    asyncExec: vi.fn(),
}))

import { getNpmPackageVersion } from './project'
import { asyncExec } from '@/utils/exec'

describe('getNpmPackageVersion', () => {
    const asyncExecMock = vi.mocked(asyncExec)

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('returns the clean semver when npm outputs only the version', async () => {
        asyncExecMock.mockResolvedValueOnce('1.2.3\n')
        await expect(getNpmPackageVersion('eslint')).resolves.toBe('1.2.3')
    })

    it('extracts the semver from noisy npm warnings', async () => {
        const noisyOutput = 'npm WARN config strict-peer-dependencies Invalid value\n'
            + 'npm WARN config This is an unknown setting\n'
            + 'eslint@9.34.0\n'
        asyncExecMock.mockResolvedValueOnce(noisyOutput)
        await expect(getNpmPackageVersion('eslint')).resolves.toBe('9.34.0')
    })

    it('falls back to the trimmed output when no semver is present', async () => {
        asyncExecMock.mockResolvedValueOnce('custom-tag')
        await expect(getNpmPackageVersion('eslint')).resolves.toBe('custom-tag')
    })
})
