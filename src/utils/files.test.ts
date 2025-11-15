import path from 'path'
import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('fs-extra', () => ({
    default: {
        pathExists: vi.fn(),
        remove: vi.fn(),
        copyFile: vi.fn(),
    },
}))

vi.mock('ora', () => ({
    default: vi.fn(() => ({
        start: vi.fn().mockReturnThis(),
        succeed: vi.fn(),
        fail: vi.fn(),
    })),
}))

import fs from 'fs-extra'
import { copyFilesFromTemplates, removeFiles } from './files'

const fsMock = vi.mocked(fs)

describe('copyFilesFromTemplates', () => {
    const projectPath = '/project'
    const templateFile = 'README.md'
    const templatePath = path.join(__dirname, '../templates/', templateFile)

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('copies files and removes existing ones when not lazy', async () => {
        fsMock.pathExists.mockResolvedValueOnce(true)
        fsMock.remove.mockResolvedValueOnce(undefined)
        fsMock.copyFile.mockResolvedValueOnce(undefined)
        const result = await copyFilesFromTemplates(projectPath, [templateFile])
        expect(fsMock.remove).toHaveBeenCalledWith(path.join(projectPath, templateFile))
        expect(fsMock.copyFile).toHaveBeenCalledWith(templatePath, path.join(projectPath, templateFile))
        expect(result).toBe(true)
    })

    it('skips removing when lazy and target exists', async () => {
        fsMock.pathExists.mockResolvedValueOnce(true)
        const result = await copyFilesFromTemplates(projectPath, [templateFile], true)
        expect(fsMock.remove).not.toHaveBeenCalled()
        expect(fsMock.copyFile).not.toHaveBeenCalled()
        expect(result).toBe(true)
    })

    it('propagates errors and marks failure', async () => {
        fsMock.pathExists.mockResolvedValueOnce(false)
        fsMock.copyFile.mockRejectedValueOnce(new Error('fail'))
        await expect(copyFilesFromTemplates(projectPath, [templateFile])).rejects.toThrow('fail')
    })
})

describe('removeFiles', () => {
    const projectPath = '/project'

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('removes existing files', async () => {
        fsMock.pathExists.mockResolvedValueOnce(true)
        fsMock.remove.mockResolvedValueOnce(undefined)
        const result = await removeFiles(projectPath, ['README.md'])
        expect(fsMock.remove).toHaveBeenCalledWith(path.join(projectPath, 'README.md'))
        expect(result).toBe(true)
    })

    it('skips non-existing files without error', async () => {
        fsMock.pathExists.mockResolvedValueOnce(false)
        const result = await removeFiles(projectPath, ['README.md'])
        expect(fsMock.remove).not.toHaveBeenCalled()
        expect(result).toBe(true)
    })

    it('propagates errors when removal fails', async () => {
        fsMock.pathExists.mockResolvedValueOnce(true)
        fsMock.remove.mockRejectedValueOnce(new Error('fail'))
        await expect(removeFiles(projectPath, ['README.md'])).rejects.toThrow('fail')
    })
})
