/* eslint-disable no-console, @typescript-eslint/no-var-requires */
const fs = require('fs-extra')
const path = require('path')
const { nodeFileTrace } = require('@vercel/nft');
// !!! if any new dependencies are added, update the Dockerfile !!!

(async () => {
    const projectRoot = path.resolve(process.env.PROJECT_ROOT || path.join(__dirname, '../'))
    const resultFolder = path.join(projectRoot, 'app-minimal') // no need to resolve, ProjectRoot is always absolute
    const pkg = await fs.readJSON(path.join(projectRoot, 'package.json'))
    let mainPath = pkg.main
    if (!mainPath) {
        const mainPaths = ['dist/index.js', 'dist/main.js']
        for await (const key of mainPaths) {
            mainPath = path.join(projectRoot, key)
            if (await fs.pathExists(mainPath)) { // 如果找到了入口文件，则跳出循环
                break
            }
        }
    }
    if (!mainPath) {
        process.exit(1)
    }
    const files = [mainPath]
    console.log('Start analyzing, project root:', projectRoot)
    const { fileList: fileSet } = await nodeFileTrace(files, {
        base: projectRoot,
        paths: {
            '@/': 'dist/',
        },
    })
    let fileList = Array.from(fileSet)
    console.log('Total touchable files:', fileList.length)
    fileList = fileList.filter((file) => file.startsWith('node_modules')) // only need node_modules
    console.log('Total files need to be copied (touchable files in node_modules):', fileList.length)
    console.log('Start copying files, destination:', resultFolder)
    return Promise.all(fileList.map((e) => fs.copy(path.join(projectRoot, e), path.join(resultFolder, e)).catch(console.error),
    ))
})().catch((err) => {
    // fix unhandled promise rejections
    console.error(err, err.stack)
    process.exit(1)
})
