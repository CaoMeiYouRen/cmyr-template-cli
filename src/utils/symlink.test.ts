import os from 'os'
import path from 'path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import fs from 'fs-extra'
import { createDirSymlink, createFileSymlink, isSameLinkTarget, toSymlinkTarget } from '@/utils/symlink'

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'symlink-test-'))

afterEach(async () => {
    await fs.emptyDir(tempRoot)
})

describe('toSymlinkTarget', () => {
    const originalPlatform = process.platform

    afterEach(() => {
        Object.defineProperty(process, 'platform', { value: originalPlatform })
    })

    it('should return absolute path for win32 junction', () => {
        Object.defineProperty(process, 'platform', { value: 'win32' })
        const target = toSymlinkTarget('C:/project/.claude/skills', 'C:/project/.github/skills', 'junction')
        expect(target).toBe('C:\\project\\.github\\skills')
    })

    it('should return relative path for symlink', () => {
        Object.defineProperty(process, 'platform', { value: 'win32' })
        const target = toSymlinkTarget('C:/project/.claude/skills', 'C:/project/.github/skills', 'symlink')
        expect(target).toBe(path.relative('C:/project/.claude', 'C:/project/.github/skills'))
    })

    it('should return relative path on non-win32', () => {
        Object.defineProperty(process, 'platform', { value: 'linux' })
        const target = toSymlinkTarget('/project/.claude/skills', '/project/.github/skills', 'symlink')
        expect(target).toBe(path.relative('/project/.claude', '/project/.github/skills'))
    })
})

describe('isSameLinkTarget', () => {
    it('should return true when paths resolve to same target', async () => {
        const targetDir = path.join(tempRoot, 'target')
        await fs.ensureDir(targetDir)
        const linkDir = path.join(tempRoot, 'link')
        await fs.ensureDir(linkDir)

        // 同一真实路径
        expect(await isSameLinkTarget(targetDir, linkDir)).toBe(false)

        // 同一路径比较
        expect(await isSameLinkTarget(targetDir, targetDir)).toBe(true)
    })

    it('should return false when path does not exist', async () => {
        expect(await isSameLinkTarget(path.join(tempRoot, 'nonexist-1'), path.join(tempRoot, 'nonexist-2'))).toBe(false)
    })
})

describe('createDirSymlink', () => {
    it('should create directory symlink', async () => {
        const targetPath = path.join(tempRoot, 'github-skills')
        const linkPath = path.join(tempRoot, 'claude-skills')
        await fs.ensureDir(targetPath)

        const result = await createDirSymlink(linkPath, targetPath)

        expect(result.status).toBe('created')
        expect(result.method).toBe('symlink')
        expect(await fs.pathExists(linkPath)).toBe(true)
    })

    it('should return existing when link already points to target', async () => {
        const targetPath = path.join(tempRoot, 'github-skills-2')
        const linkPath = path.join(tempRoot, 'claude-skills-2')
        await fs.ensureDir(targetPath)

        await createDirSymlink(linkPath, targetPath)
        const result = await createDirSymlink(linkPath, targetPath)

        expect(result.status).toBe('existing')
    })

    it('should skip when existing path is not a link', async () => {
        const targetPath = path.join(tempRoot, 'github-skills-3')
        const linkPath = path.join(tempRoot, 'claude-skills-3')
        await fs.ensureDir(targetPath)
        await fs.ensureDir(linkPath)

        const result = await createDirSymlink(linkPath, targetPath)

        expect(result.status).toBe('skipped')
    })

    it('should degrade to junction on win32 when symlink fails', async () => {
        const originalPlatform = process.platform
        Object.defineProperty(process, 'platform', { value: 'win32' })

        const targetPath = path.join(tempRoot, 'github-skills-4')
        const linkPath = path.join(tempRoot, 'claude-skills-4')
        await fs.ensureDir(targetPath)

        const symlinkSpy = vi.spyOn(fs, 'symlink')
            .mockRejectedValueOnce(new Error('EPERM: operation not permitted'))
            .mockResolvedValueOnce(undefined as any)

        try {
            const result = await createDirSymlink(linkPath, targetPath)

            expect(result.status).toBe('created')
            expect(result.method).toBe('junction')
            expect(symlinkSpy).toHaveBeenCalledTimes(2)
            // junction 使用绝对路径
            expect(symlinkSpy.mock.calls[1][0]).toBe(path.resolve(targetPath))
        } finally {
            symlinkSpy.mockRestore()
            Object.defineProperty(process, 'platform', { value: originalPlatform })
        }
    })
})

describe('createFileSymlink', () => {
    it('should create file symlink', async () => {
        const targetPath = path.join(tempRoot, 'AGENTS.md')
        const linkPath = path.join(tempRoot, 'CLAUDE.md')
        await fs.writeFile(targetPath, 'content')

        const result = await createFileSymlink(linkPath, targetPath)

        expect(result.status).toBe('created')
        expect(result.method).toBe('symlink')
        expect(await fs.pathExists(linkPath)).toBe(true)
    })

    it('should copy file on win32 when symlink fails', async () => {
        const originalPlatform = process.platform
        Object.defineProperty(process, 'platform', { value: 'win32' })

        const targetPath = path.join(tempRoot, 'AGENTS-2.md')
        const linkPath = path.join(tempRoot, 'CLAUDE-2.md')
        await fs.writeFile(targetPath, 'content-2')

        const symlinkSpy = vi.spyOn(fs, 'symlink')
            .mockRejectedValue(new Error('EPERM: operation not permitted'))

        try {
            const result = await createFileSymlink(linkPath, targetPath)

            expect(result.status).toBe('created')
            expect(result.method).toBe('copy')
            expect(await fs.readFile(linkPath, 'utf8')).toBe('content-2')
        } finally {
            symlinkSpy.mockRestore()
            Object.defineProperty(process, 'platform', { value: originalPlatform })
        }
    })

    it('should skip when existing path is a regular file', async () => {
        const targetPath = path.join(tempRoot, 'AGENTS-3.md')
        const linkPath = path.join(tempRoot, 'CLAUDE-3.md')
        await fs.writeFile(targetPath, 'target')
        await fs.writeFile(linkPath, 'existing')

        const result = await createFileSymlink(linkPath, targetPath)

        expect(result.status).toBe('skipped')
        expect(await fs.readFile(linkPath, 'utf8')).toBe('existing')
    })
})
