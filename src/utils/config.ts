import path from 'path'
import os from 'os'
import fs from 'fs-extra'
import { mergeWith } from 'lodash'
import { TemplateCliConfig } from '@/types/interfaces'

/**
 * 载入 CLI 全局配置（.ctrc）
 */
export async function loadTemplateCliConfig(): Promise<TemplateCliConfig> {
    const paths = [process.cwd(), os.homedir()].map((e) => path.join(e, '.ctrc'))
    const [local, home]: TemplateCliConfig[] = (await Promise.all(paths.map(async (p) => {
        try {
            if (await fs.pathExists(p)) {
                return await fs.readJSON(p)
            }
            return null
        } catch (error) {
            console.error(error)
            return null
        }
    }))).filter(Boolean)
    return mergeWith(home, local, (objValue, srcValue) => {
        if (typeof objValue === 'string' && srcValue === '') {
            return objValue
        }
        if (typeof srcValue !== 'undefined' && srcValue !== null) {
            return srcValue
        }
        return objValue
    })
}
