import path from 'path'
import fs from 'fs-extra'
import { IPackage } from '@/types/interfaces'

export async function readPackageJson(projectPath: string): Promise<IPackage> {
    const pkgPath = path.join(projectPath, 'package.json')
    return fs.readJSON(pkgPath)
}

export async function updatePackageJson(projectPath: string, patch: IPackage): Promise<IPackage> {
    const pkgPath = path.join(projectPath, 'package.json')
    const current = await readPackageJson(projectPath)
    const next = Object.assign({}, current, patch)
    await fs.writeFile(pkgPath, JSON.stringify(next, null, 2))
    return next
}
