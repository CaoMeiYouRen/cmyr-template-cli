import path from 'path'
import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('fs-extra', () => ({
    default: {
        readJSON: vi.fn(),
        writeFile: vi.fn(),
    },
}))

import fs from 'fs-extra'
import { readPackageJson, updatePackageJson } from './package-json'

const fsMock = vi.mocked(fs)

describe('readPackageJson', () => {
    const projectPath = '/project'

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('reads package.json via fs-extra', async () => {
        fsMock.readJSON.mockResolvedValueOnce({ name: 'demo' })
        const pkg = await readPackageJson(projectPath)
        expect(fsMock.readJSON).toHaveBeenCalledWith(path.join(projectPath, 'package.json'))
        expect(pkg).toEqual({ name: 'demo' })
    })

    it('propagates read errors', async () => {
        fsMock.readJSON.mockRejectedValueOnce(new Error('missing'))
        await expect(readPackageJson(projectPath)).rejects.toThrow('missing')
    })
})

describe('updatePackageJson', () => {
    const projectPath = '/project'

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('merges existing package.json with patch and writes file', async () => {
        fsMock.readJSON.mockResolvedValueOnce({ name: 'demo', scripts: { build: 'tsup' } })
        fsMock.writeFile.mockResolvedValueOnce(undefined)
        const patch = { version: '1.0.0', scripts: { test: 'vitest' } }
        const result = await updatePackageJson(projectPath, patch)
        expect(result).toEqual({ name: 'demo', scripts: { test: 'vitest' }, version: '1.0.0' })
        expect(fsMock.writeFile).toHaveBeenCalledWith(
            path.join(projectPath, 'package.json'),
            JSON.stringify(result, null, 2),
        )
    })

    it('propagates write errors', async () => {
        fsMock.readJSON.mockResolvedValueOnce({ name: 'demo' })
        fsMock.writeFile.mockRejectedValueOnce(new Error('disk full'))
        await expect(updatePackageJson(projectPath, { version: '1.0.0' })).rejects.toThrow('disk full')
    })
})
