import fs from 'fs-extra'
import path from 'path'
import ora from 'ora'

/**
 * 从 templates 复制文件到 项目根目录，如果文件已存在会先删除后更新
 *
 * @author CaoMeiYouRen
 * @date 2022-06-18
 * @param projectPath
 * @param files
 * @param [lazy=false] 为 true 时在文件已存在的情况下不会更新文件
 */
export async function copyFilesFromTemplates(projectPath: string, files: string[], lazy = false) {
    const loading = ora(`正在复制文件 ${files.join()} ……`).start()
    try {
        for await (const file of files) {
            const templatePath = path.join(__dirname, '../templates/', file)
            const newPath = path.join(projectPath, file)
            if (await fs.pathExists(newPath)) {
                if (lazy) {
                    continue
                }
                await fs.remove(newPath)
            }
            await fs.copyFile(templatePath, newPath)
        }
        loading.succeed(`文件 ${files.join()} 复制成功！`)
        return true
    } catch (error) {
        loading.fail(`文件 ${files.join()} 复制失败！`)
        throw error
    }
}

/**
 * 删除根目录下的指定文件
 *
 * @author CaoMeiYouRen
 * @date 2022-06-18
 * @param projectPath
 * @param files
 */
export async function removeFiles(projectPath: string, files: string[]) {
    const loading = ora(`正在删除文件 ${files.join()} ……`).start()
    try {
        for await (const file of files) {
            const newPath = path.join(projectPath, file)
            if (await fs.pathExists(newPath)) {
                await fs.remove(newPath)
            } else {
                console.log(`文件 ${file} 不存在，已跳过删除`)
            }
        }
        loading.succeed(`文件 ${files.join()} 删除成功！`)
        return true
    } catch (error) {
        loading.fail(`文件 ${files.join()} 删除失败！`)
        throw error
    }
}

