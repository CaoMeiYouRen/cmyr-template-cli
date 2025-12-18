import ora from 'ora'
import { merge } from 'lodash'
import { InitAnswers, IPackage } from '@/types/interfaces'
import { copyFilesFromTemplates } from '@/utils/files'
import { readPackageJson, updatePackageJson } from '@/utils/package-json'

export async function initTest(projectPath: string, answers: InitAnswers) {
    const loading = ora('正在初始化测试 ……').start()
    try {
        if (answers.isInitTest === 'vitest') {
            const files = ['vitest.config.ts']
            await copyFilesFromTemplates(projectPath, files)

            const pkg: IPackage = await readPackageJson(projectPath)
            const devDependencies: Record<string, string> = {
                vitest: '^3.2.4',
            }
            if (!pkg?.dependencies?.vite && !pkg?.devDependencies?.vite) {
                devDependencies.vite = '^7.0.5'
            }

            const newPkg = merge({}, pkg, {
                scripts: {
                    test: 'vitest run',
                    'test:coverage': 'vitest run --coverage',
                    ...pkg?.scripts,
                },
                devDependencies: {
                    ...devDependencies,
                    ...pkg?.devDependencies,
                },
            })
            await updatePackageJson(projectPath, newPkg)
            loading.succeed('Vitest 初始化成功！')
            return
        }
        if (answers.isInitTest === 'jest') {
            const files = ['jest.config.ts']
            await copyFilesFromTemplates(projectPath, files)

            const pkg: IPackage = await readPackageJson(projectPath)

            const devDependencies = {
                '@types/jest': '^29.5.12',
                jest: '^29.7.0',
                'ts-jest': '^29.1.2',
                'ts-node': '^10.9.2',
            }
            const newPkg = merge({}, pkg, {
                scripts: {
                    test: 'jest --config jest.config.ts',
                    'test:coverage': 'jest --config jest.config.ts --coverage',
                    ...pkg?.scripts,
                },
                devDependencies: {
                    ...devDependencies,
                    ...pkg?.devDependencies,
                },
            })
            newPkg.jest = undefined
            await updatePackageJson(projectPath, newPkg)
            loading.succeed('Jest 初始化成功！')
            return
        }
        loading.succeed('未选择测试框架，跳过测试初始化')
    } catch {
        loading.fail('测试初始化失败！')
    }
}
