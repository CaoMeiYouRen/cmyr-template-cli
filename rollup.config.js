import { nodeResolve } from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import json from '@rollup/plugin-json'
import _ from 'lodash'
import { dependencies, name } from './package.json'
const external = Object.keys({ ...dependencies }) // 默认不打包 dependencies
const outputName = _.upperFirst(_.camelCase(name))// 导出的模块名称 PascalCase
const env = process.env
const IS_PROD = env.NODE_ENV === 'production'
function getPlugins({ isBrowser = false, isMin = false, isDeclaration = false }) {
    const plugins = []
    plugins.push(
        nodeResolve({
            browser: isBrowser,
            preferBuiltins: true,
        }),
    )
    plugins.push(
        typescript({
            tsconfig: isDeclaration ? 'tsconfig.json' : 'tsconfig.build.json',
            esModuleInterop: true,
            allowSyntheticDefaultImports: true,
            module: 'esnext',
            target: 'esnext',
        }),
    )
    plugins.push(
        commonjs({
            sourceMap: false,
        }),
    )
    plugins.push(
        json({}),
    )
    if (isMin) {
        plugins.push(
            terser({
                module: true,
            }),
        )
    }
    return plugins
}

export default [
    // {
    //     input: 'src/index.ts', // 生成类型文件
    //     external,
    //     output: {
    //         dir: 'dist',
    //         format: 'cjs',
    //         name: outputName,
    //     },
    //     plugins: getPlugins({
    //         isBrowser: false,
    //         isDeclaration: true,
    //         isMin: false,
    //     }),
    // },
    {
        input: 'src/index.ts',
        external,
        output: {
            file: 'dist/index.js', // 生成 cjs
            format: 'cjs',
            name: outputName,
            banner: '#!/usr/bin/env node',
        },
        plugins: getPlugins({
            isBrowser: false,
            isDeclaration: false,
            isMin: false,
        }),
    },
    {
        input: 'src/plopfile.ts',
        external,
        output: {
            file: 'dist/plopfile.js', // 生成 cjs
            format: 'cjs',
            name: 'Plopfile',
            banner: '#!/usr/bin/env node',
        },
        plugins: getPlugins({
            isBrowser: false,
            isDeclaration: false,
            isMin: false,
        }),
    },
    // {
    //     input: 'src/index.ts',
    //     external,
    //     output: {
    //         file: 'dist/index.umd.js', // 生成 umd
    //         format: 'umd',
    //         name: outputName,
    //     },
    //     plugins: getPlugins({
    //         isBrowser: false,
    //         isDeclaration: false,
    //         isMin: true,
    //     }),
    // },
    // {
    //     input: 'src/index.ts',
    //     external,
    //     output: {
    //         file: 'dist/index.esm.js', // 生成 esm
    //         format: 'esm',
    //         name: outputName,
    //     },
    //     plugins: getPlugins({
    //         isBrowser: false,
    //         isDeclaration: false,
    //         isMin: false,
    //     }),
    // },
]