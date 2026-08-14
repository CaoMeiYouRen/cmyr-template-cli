import path from 'path'
import fs from 'fs-extra'

/**
 * 符号链接创建方式
 * symlink=符号链接，junction=目录联接（Windows 降级），copy=文件复制（Windows 降级）
 */
export type SymlinkMethod = 'symlink' | 'junction' | 'copy'

/**
 * 符号链接创建结果
 */
export interface SymlinkResult {
    /**
     * 链接路径
     */
    linkPath: string
    /**
     * 目标路径
     */
    targetPath: string
    /**
     * 实际使用的链接方式
     */
    method: SymlinkMethod
    /**
     * 结果状态：created=新建，existing=已存在且指向同一目标，skipped=已存在但不是链接
     */
    status: 'created' | 'existing' | 'skipped'
}

/**
 * 计算 Windows 下符号链接的目标路径
 * 目录链接（junction）必须使用绝对路径，文件链接使用相对路径
 *
 * @param linkPath 链接路径
 * @param targetPath 目标路径
 * @param method 链接方式
 * @returns 实际用于创建链接的目标值
 */
export function toSymlinkTarget(linkPath: string, targetPath: string, method: SymlinkMethod): string {
    if (process.platform === 'win32' && method === 'junction') {
        // junction 必须为 Windows 绝对路径；使用 path.win32 保证测试与平台解耦
        return path.win32.resolve(targetPath)
    }
    return path.relative(path.dirname(linkPath), targetPath)
}

/**
 * 判断链接是否已存在且指向同一目标
 *
 * @param linkPath 链接路径
 * @param targetPath 目标路径
 * @returns true 表示已存在且目标一致
 */
export async function isSameLinkTarget(linkPath: string, targetPath: string): Promise<boolean> {
    try {
        const resolvedLink = await fs.realpath(linkPath)
        const resolvedTarget = await fs.realpath(targetPath)
        return resolvedLink === resolvedTarget
    } catch {
        return false
    }
}

/**
 * 创建目录符号链接（跨平台）
 *
 * 优先使用 symlink（git 以 mode 120000 跟踪链接本身，不会重复跟踪内容）；
 * Windows 无开发者模式/管理员权限时降级为 junction，并在返回结果中标注。
 *
 * @param linkPath 链接路径
 * @param targetPath 目标路径（必须是已存在的目录）
 * @returns 创建结果
 */
export async function createDirSymlink(linkPath: string, targetPath: string): Promise<SymlinkResult> {
    await fs.ensureDir(path.dirname(linkPath))

    try {
        if (await isSameLinkTarget(linkPath, targetPath)) {
            return { linkPath, targetPath, method: 'symlink', status: 'existing' }
        }
        const existing = await fs.lstat(linkPath)
        if (existing.isDirectory() || existing.isFile()) {
            return { linkPath, targetPath, method: 'symlink', status: 'skipped' }
        }
    } catch (error) {
        if ((error as NodeJS.ErrnoException)?.code !== 'ENOENT') {
            throw error
        }
    }

    let method: SymlinkMethod = 'symlink'
    if (process.platform === 'win32') {
        try {
            await fs.symlink(path.relative(path.dirname(linkPath), targetPath), linkPath, 'dir')
            return { linkPath, targetPath, method, status: 'created' }
        } catch {
            method = 'junction'
            await fs.symlink(toSymlinkTarget(linkPath, targetPath, method), linkPath, 'junction')
            return { linkPath, targetPath, method, status: 'created' }
        }
    }

    await fs.symlink(toSymlinkTarget(linkPath, targetPath, method), linkPath, 'dir')
    return { linkPath, targetPath, method, status: 'created' }
}

/**
 * 创建文件符号链接（跨平台）
 *
 * Windows 无权限时降级为复制文件（保持内容可用，后续更新需重新同步）。
 *
 * @param linkPath 链接路径
 * @param targetPath 目标路径（必须是已存在的文件）
 * @returns 创建结果
 */
export async function createFileSymlink(linkPath: string, targetPath: string): Promise<SymlinkResult> {
    await fs.ensureDir(path.dirname(linkPath))

    try {
        if (await isSameLinkTarget(linkPath, targetPath)) {
            return { linkPath, targetPath, method: 'symlink', status: 'existing' }
        }
        const existing = await fs.lstat(linkPath)
        if (existing.isDirectory() || existing.isFile()) {
            return { linkPath, targetPath, method: 'symlink', status: 'skipped' }
        }
    } catch (error) {
        if ((error as NodeJS.ErrnoException)?.code !== 'ENOENT') {
            throw error
        }
    }

    if (process.platform === 'win32') {
        try {
            await fs.symlink(toSymlinkTarget(linkPath, targetPath, 'symlink'), linkPath, 'file')
            return { linkPath, targetPath, method: 'symlink', status: 'created' }
        } catch {
            await fs.copyFile(targetPath, linkPath)
            return { linkPath, targetPath, method: 'copy', status: 'created' }
        }
    }

    await fs.symlink(toSymlinkTarget(linkPath, targetPath, 'symlink'), linkPath, 'file')
    return { linkPath, targetPath, method: 'symlink', status: 'created' }
}
