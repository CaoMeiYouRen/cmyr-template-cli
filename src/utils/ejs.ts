import ejs from 'ejs'
import fs from 'fs-extra'
/**
 * ejs 渲染
 *
 * @author CaoMeiYouRen
 * @date 2023-12-26
 * @param templatePath
 * @param data
 * @param outputPath
 */
export async function ejsRender(templatePath: string, data: any, outputPath: string) {
    const template = (await fs.readFile(templatePath, 'utf8')).toString()
    const content = await ejs.render(
        template,
        data,
        {
            debug: false,
            async: true,
        },
    )
    await fs.writeFile(outputPath, content)
}
